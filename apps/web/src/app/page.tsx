"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { DollarSign, Users, Briefcase, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchDashboard();
    }
  }, [user, authLoading, router]);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/analytics/dashboard");
      setData(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    {
      title: "Выручка",
      value: data?.revenue?.total?.toLocaleString("ru-RU") || "0",
      suffix: " ₽",
      icon: DollarSign,
    },
    {
      title: "Сделок выиграно",
      value: data?.deals?.won || "0",
      suffix: "",
      icon: Briefcase,
    },
    {
      title: "Лидов",
      value: data?.leads?.total || "0",
      suffix: "",
      icon: Users,
    },
    {
      title: "Win Rate",
      value: data?.deals?.winRate || "0",
      suffix: "%",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Дашборд</h1>
          <p className="text-muted-foreground">
            Добро пожаловать, {user.firstName} {user.lastName}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.value}{stat.suffix}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Сделки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Открытые</span>
                  <span className="font-medium">{data?.deals?.open || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Выиграны</span>
                  <span className="font-medium">{data?.deals?.won || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Проиграны</span>
                  <span className="font-medium">{data?.deals?.lost || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Лиды</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Всего</span>
                  <span className="font-medium">{data?.leads?.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Конвертированы</span>
                  <span className="font-medium">{data?.leads?.converted || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Конверсия</span>
                  <span className="font-medium">{data?.leads?.conversionRate || 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
