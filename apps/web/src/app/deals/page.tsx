"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

interface Stage {
  id: string;
  name: string;
  probability: number;
  order: number;
}

interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
}

interface Deal {
  id: string;
  title: string;
  amount: number;
  currency: string;
  status: string;
  stageId: string;
  owner: {
    firstName: string;
    lastName: string;
  };
}

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  WON: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-800",
  ABANDONED: "bg-gray-100 text-gray-800",
};

export default function DealsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      const [pipelineRes, dealsRes] = await Promise.all([
        api.get("/pipelines"),
        api.get("/deals"),
      ]);

      const pipelines = pipelineRes.data.data;
      if (pipelines.length > 0) {
        setPipeline(pipelines[0]);
      }
      setDeals(dealsRes.data.data.deals);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageChange = async (dealId: string, stageId: string) => {
    try {
      await api.post(`/deals/${dealId}/change-stage`, { stageId });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const dealsByStage = (stageId: string) =>
    deals.filter((deal) => deal.stageId === stageId);

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Сделки</h1>
          <p className="text-muted-foreground">Воронка продаж автомобилей</p>
        </div>

        <div className="flex h-[calc(100vh-180px)] gap-4 overflow-x-auto pb-4">
          {pipeline?.stages.map((stage) => (
            <div key={stage.id} className="flex min-w-[280px] flex-col">
              <Card className="flex-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                    <Badge variant="secondary">{dealsByStage(stage.id).length}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Вероятность: {stage.probability}%
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dealsByStage(stage.id).map((deal) => (
                    <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-sm">{deal.title}</h3>
                          <Badge className={statusColors[deal.status] || ""} variant="outline">
                            {deal.status}
                          </Badge>
                        </div>
                        <p className="text-lg font-bold mb-2">
                          {deal.amount.toLocaleString("ru-RU")} {deal.currency}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {deal.owner.firstName} {deal.owner.lastName}
                        </p>
                        <div className="mt-3 flex gap-1 flex-wrap">
                          {pipeline.stages.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => handleStageChange(deal.id, s.id)}
                              className={`text-[10px] px-2 py-1 rounded border ${
                                s.id === deal.stageId
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-accent"
                              }`}
                            >
                              {s.order}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
