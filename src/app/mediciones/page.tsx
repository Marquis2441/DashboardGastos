"use client";

import { useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { TrendingUp, Users, Landmark, Wallet, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export default function MedicionesPage() {
  const expenses = useAppStore((s) => s.expenses);
  const lawFirms = useAppStore((s) => s.lawFirms);

  const fmt = (val: number) => `$${val.toLocaleString("es-AR")}`;

  // 1. Data for Bar Chart: Expenses by Law Firm
  const lawFirmData = useMemo(() => {
    return lawFirms.map((firm) => ({
      name: firm.name,
      monto: expenses
        .filter((e) => e.lawFirmId === firm.id)
        .reduce((sum, e) => sum + e.amount, 0),
      color: firm.color,
    }));
  }, [expenses, lawFirms]);

  // 2. Data for Pie Chart: Expenses by Segment
  const segmentData = useMemo(() => {
    const personas = expenses
      .filter((e) => e.segment === "Personas")
      .reduce((sum, e) => sum + e.amount, 0);
    const empresas = expenses
      .filter((e) => e.segment === "Empresas")
      .reduce((sum, e) => sum + e.amount, 0);
    const retail = expenses
      .filter((e) => e.segment === "Retail")
      .reduce((sum, e) => sum + e.amount, 0);
    const canalesIndirectos = expenses
      .filter((e) => e.segment === "Canales Indirectos")
      .reduce((sum, e) => sum + e.amount, 0);

    return [
      { name: "Personas", value: personas, color: "#3B82F6" },
      { name: "Empresas", value: empresas, color: "#10B981" },
      { name: "Retail", value: retail, color: "#F59E0B" },
      { name: "Canales Ind.", value: canalesIndirectos, color: "#8B5CF6" },
    ];
  }, [expenses]);

  // 3. Data for Area Chart: Monthly Trend
  const trendData = useMemo(() => {
    const months = ["Ene", "Feb", "Mar"];
    return months.map((m, idx) => {
      const monthNum = (idx + 1).toString().padStart(2, "0");
      return {
        name: m,
        gastos: expenses
          .filter((e) => e.date.includes(`-0${idx + 1}-`))
          .reduce((sum, e) => sum + e.amount, 0),
      };
    });
  }, [expenses]);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgExpense = totalSpent / (expenses.length || 1);

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen animate-fade-in-up font-roboto">
        {/* Header */}
        <PageHeader 
          title="Mediciones y Análisis"
          subtitle="Métricas de rendimiento y tendencias de gasto"
          showUser
        />

        <div className="p-4 md:p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto w-full">
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card rounded-md shadow-sm border border-border overflow-hidden relative group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Acumulado</p>
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-foreground" />
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-bold text-foreground">{fmt(totalSpent)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-[10px] font-bold text-success">+12.5% vs mes anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card rounded-md shadow-sm border border-border overflow-hidden relative group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Gasto Promedio</p>
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                    <Landmark className="w-4 h-4 text-foreground" />
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-bold text-foreground">{fmt(avgExpense)}</p>
                <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-tight">Costo promedio por trámite</p>
              </CardContent>
            </Card>

            <Card className="bg-card rounded-md shadow-sm border border-border overflow-hidden relative group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Volumen de Trámites</p>
                  <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                    <Users className="w-4 h-4 text-foreground" />
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-bold text-foreground">{expenses.length}</p>
                <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-tight">Gastos registrados a la fecha</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart: Expenses by Law Firm */}
            <Card className="bg-card rounded-md shadow-sm border border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground uppercase tracking-tight">Gastos por Estudio Jurídico</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] pt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lawFirmData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--muted-foreground)' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--muted-foreground)' }}
                      tickFormatter={(val) => `$${val / 1000000}M`}
                    />
                    <Tooltip
                      cursor={{ fill: 'var(--muted)' }}
                      contentStyle={{ borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.15)' }}
                      labelStyle={{ color: 'var(--popover-foreground)' }}
                      formatter={(val: any) => [fmt(Number(val)), "Monto"]}
                    />
                    <Bar dataKey="monto" radius={[6, 6, 0, 0]} barSize={40}>
                      {lawFirmData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Area Chart: Trend */}
            <Card className="bg-card rounded-md shadow-sm border border-border">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground uppercase tracking-tight">Tendencia de Gasto Mensual</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] pt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--muted-foreground)' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--muted-foreground)' }}
                      tickFormatter={(val) => `$${val / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.15)' }}
                      labelStyle={{ color: 'var(--popover-foreground)' }}
                      formatter={(val: any) => [fmt(Number(val)), "Gastos"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="gastos"
                      stroke="var(--foreground)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorGastos)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="bg-card rounded-md shadow-sm border border-border lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground uppercase tracking-tight">Distribución por Segmento</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] pt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={segmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="var(--card)"
                    >
                      {segmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--popover)', color: 'var(--popover-foreground)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.15)' }}
                      labelStyle={{ color: 'var(--popover-foreground)' }}
                      formatter={(val: any) => [fmt(Number(val)), "Total"]}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11, color: 'var(--muted-foreground)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card rounded-md shadow-sm border border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-foreground uppercase tracking-tight">Análisis Comparativo</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      {lawFirmData.map((firm) => (
                          <div key={firm.name} className="p-4 rounded-md bg-muted/50 border border-border">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{firm.name}</p>
                              <div className="flex items-center justify-between mt-1">
                                  <p className="text-lg font-bold text-foreground">{fmt(firm.monto)}</p>
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: firm.color }} />
                              </div>
                              <div className="w-full bg-border h-1 rounded-full mt-2 overflow-hidden">
                                  <div
                                      className="h-full rounded-full"
                                      style={{
                                          width: `${(firm.monto / totalSpent) * 100}%`,
                                          backgroundColor: firm.color
                                      }}
                                  />
                              </div>
                          </div>
                      ))}
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
