"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { Plus, Search } from "lucide-react";

const statusLabels: Record<string, string> = {
  NEW: "Новый",
  CONTACTED: "Контакт установлен",
  QUALIFIED: "Квалифицирован",
  UNQUALIFIED: "Не квалифицирован",
  CONVERTED: "Конвертирован",
  LOST: "Потерян",
};

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONTACTED: "bg-yellow-100 text-yellow-800",
  QUALIFIED: "bg-green-100 text-green-800",
  UNQUALIFIED: "bg-gray-100 text-gray-800",
  CONVERTED: "bg-purple-100 text-purple-800",
  LOST: "bg-red-100 text-red-800",
};

export default function LeadsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchLeads();
    }
  }, [user, authLoading, router]);

  const fetchLeads = async () => {
    try {
      const response = await api.get("/leads");
      setLeads(response.data.data.leads);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeads = leads.filter((lead) =>
    `${lead.firstName} ${lead.lastName} ${lead.email} ${lead.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Лиды</h1>
            <p className="text-muted-foreground">Управление потенциальными клиентами</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Новый лид
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск по лидам..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Источник</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Менеджер</TableHead>
                  <TableHead>Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Лиды не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.firstName} {lead.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{lead.email}</div>
                        <div className="text-xs text-muted-foreground">{lead.phone}</div>
                      </TableCell>
                      <TableCell>{lead.source}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[lead.status] || ""}>
                          {statusLabels[lead.status] || lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.owner
                          ? `${lead.owner.firstName} ${lead.owner.lastName}`
                          : "Не назначен"}
                      </TableCell>
                      <TableCell>
                        {new Date(lead.createdAt).toLocaleDateString("ru-RU")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
