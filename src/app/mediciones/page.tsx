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

    return [
      { name: "Personas", value: personas, color: "#3B82F6" },
      { name: "Empresas", value: empresas, color: "#10B981" },
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
      <div className="space-y-8 animate-fade-in-up font-roboto">
        {/* Header */}
        <PageHeader 
          title="Mediciones y Análisis"
          subtitle="Métricas de rendimiento y tendencias de gasto"
          showUser
        />

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Acumulado</p>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{fmt(totalSpent)}</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500">+12.5% vs mes anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gasto Promedio</p>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{fmt(avgExpense)}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Costo promedio por trámite</p>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volumen de Trámites</p>
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-amber-500" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">{expenses.length}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">Gastos registrados a la fecha</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart: Expenses by Law Firm */}
          <Card className="bg-white rounded-3xl shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Gastos por Estudio Jurídico</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lawFirmData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                    tickFormatter={(val) => `$${val / 1000000}M`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: any) => [fmt(Number(val)), "Monto"]}
                  />
                  <Bar dataKey="monto" radius={[8, 8, 0, 0]} barSize={40}>
                    {lawFirmData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Area Chart: Trend */}
          <Card className="bg-white rounded-3xl shadow-sm border border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Tendencia de Gasto Mensual</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                    tickFormatter={(val) => `$${val / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: any) => [fmt(Number(val)), "Gastos"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="gastos" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
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
          <Card className="bg-white rounded-3xl shadow-sm border border-slate-200 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Distribución por Segmento</CardTitle>
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
                  >
                    {segmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: any) => [fmt(Number(val)), "Total"]}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-3xl shadow-sm border border-slate-200 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-tight">Análisis Comparativo</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-8">
                <div className="grid grid-cols-2 gap-4 w-full">
                    {lawFirmData.map((firm) => (
                        <div key={firm.name} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{firm.name}</p>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-lg font-black text-slate-900">{fmt(firm.monto)}</p>
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: firm.color }} />
                            </div>
                            <div className="w-full bg-slate-200 h-1 rounded-full mt-2 overflow-hidden">
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
    </AppShell>
  );
}
