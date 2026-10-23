"use client";

import { useMemo, useState } from "react";
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
import { TrendingUp, Users, Landmark, Wallet, CalendarDays, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const MONTH_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const SHORT_MONTH_FORMATTER = new Intl.DateTimeFormat("es-AR", {
  month: "short",
  timeZone: "UTC",
});

function formatMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const label = MONTH_FORMATTER.format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function MedicionesPage() {
  const expenses = useAppStore((s) => s.expenses);
  const lawFirms = useAppStore((s) => s.lawFirms);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  const fmt = (val: number) => `$${val.toLocaleString("es-AR")}`;

  const availableMonths = useMemo(
    () =>
      Array.from(new Set(expenses.map((expense) => expense.date.slice(0, 7))))
        .filter((month) => /^\d{4}-\d{2}$/.test(month))
        .sort((a, b) => b.localeCompare(a)),
    [expenses]
  );

  const selectedMonthSet = useMemo(() => new Set(selectedMonths), [selectedMonths]);

  const selectedMonthsChronologically = useMemo(
    () =>
      availableMonths
        .filter((month) => selectedMonthSet.has(month))
        .reverse(),
    [availableMonths, selectedMonthSet]
  );

  const filteredExpenses = useMemo(
    () =>
      selectedMonths.length === 0
        ? expenses
        : expenses.filter((expense) => selectedMonthSet.has(expense.date.slice(0, 7))),
    [expenses, selectedMonths.length, selectedMonthSet]
  );

  const periodLabel = useMemo(() => {
    if (selectedMonthsChronologically.length === 0) return "Todos los meses";
    if (selectedMonthsChronologically.length === 1) {
      return formatMonth(selectedMonthsChronologically[0]);
    }

    const firstMonth = formatMonth(selectedMonthsChronologically[0]);
    const lastMonth = formatMonth(
      selectedMonthsChronologically[selectedMonthsChronologically.length - 1]
    );
    return `${firstMonth} – ${lastMonth}`;
  }, [selectedMonthsChronologically]);

  const toggleMonth = (month: string) => {
    setSelectedMonths((currentMonths) =>
      currentMonths.includes(month)
        ? currentMonths.filter((selectedMonth) => selectedMonth !== month)
        : [...currentMonths, month]
    );
  };

  // 1. Data for Bar Chart: Expenses by Law Firm
  const lawFirmData = useMemo(() => {
    return lawFirms.map((firm) => ({
      name: firm.name,
      monto: filteredExpenses
        .filter((e) => e.lawFirmId === firm.id)
        .reduce((sum, e) => sum + e.amount, 0),
      color: firm.color,
    }));
  }, [filteredExpenses, lawFirms]);

  // 2. Data for Pie Chart: Expenses by Segment
  const segmentData = useMemo(() => {
    const personas = filteredExpenses
      .filter((e) => e.segment === "Personas")
      .reduce((sum, e) => sum + e.amount, 0);
    const empresas = filteredExpenses
      .filter((e) => e.segment === "Empresas")
      .reduce((sum, e) => sum + e.amount, 0);
    const retail = filteredExpenses
      .filter((e) => e.segment === "Retail")
      .reduce((sum, e) => sum + e.amount, 0);
    const canalesIndirectos = filteredExpenses
      .filter((e) => e.segment === "Canales Indirectos")
      .reduce((sum, e) => sum + e.amount, 0);

    return [
      { name: "Personas", value: personas, color: "#3B82F6" },
      { name: "Empresas", value: empresas, color: "#10B981" },
      { name: "Retail", value: retail, color: "#F59E0B" },
      { name: "Canales Ind.", value: canalesIndirectos, color: "#8B5CF6" },
    ];
  }, [filteredExpenses]);

  // 3. Data for Area Chart: Monthly Trend
  const trendData = useMemo(() => {
    const months = selectedMonths.length === 0
      ? [...availableMonths].reverse()
      : selectedMonthsChronologically;

    return months.map((monthKey) => {
      const [year, month] = monthKey.split("-").map(Number);
      const shortMonth = SHORT_MONTH_FORMATTER
        .format(new Date(Date.UTC(year, month - 1, 1)))
        .replace(".", "");

      return {
        name: `${shortMonth.charAt(0).toUpperCase()}${shortMonth.slice(1)}${availableMonths.length > 12 ? ` ${year}` : ""}`,
        gastos: filteredExpenses
          .filter((e) => e.date.startsWith(monthKey))
          .reduce((sum, e) => sum + e.amount, 0),
      };
    });
  }, [availableMonths, filteredExpenses, selectedMonths.length, selectedMonthsChronologically]);

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgExpense = totalSpent / (filteredExpenses.length || 1);

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen animate-fade-in-up">
        {/* Header */}
        <PageHeader 
          title="Mediciones y Análisis"
          subtitle="Métricas de rendimiento y tendencias de gasto"
          showUser
        />

        <div className="p-4 md:p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto w-full">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Período de análisis
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedMonths.length === 0
                  ? "Vista consolidada de todos los registros"
                  : `${selectedMonths.length} ${selectedMonths.length === 1 ? "mes seleccionado" : "meses seleccionados"} · ${periodLabel}`}
              </p>
            </div>

            <Popover>
              <PopoverTrigger
                aria-label="Filtrar mediciones por mes"
                className="flex h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 text-left shadow-sm outline-none transition-all hover:border-foreground/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/40 sm:w-[280px]"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                    <CalendarDays className="size-3.5" />
                  </span>
                  <div className="min-w-0 text-left">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Período
                    </span>
                    <span className="block truncate text-xs font-semibold text-foreground">
                      {periodLabel}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {selectedMonths.length > 0 ? (
                    <span className="flex min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 py-0.5 text-[9px] font-bold text-background">
                      {selectedMonths.length}
                    </span>
                  ) : null}
                  <ChevronDown className="size-4 text-muted-foreground" />
                </div>
              </PopoverTrigger>

              <PopoverContent align="end" sideOffset={8} className="w-[280px] gap-0 overflow-hidden rounded-xl p-0 shadow-xl">
                <PopoverHeader className="border-b border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <PopoverTitle className="text-sm font-bold">Elegir período</PopoverTitle>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Seleccioná uno o varios meses
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedMonths([])}
                      className="cursor-pointer rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      Ver todos
                    </button>
                  </div>
                </PopoverHeader>

                <div className="max-h-64 space-y-1 overflow-y-auto p-2">
                  {availableMonths.map((month) => {
                    const isSelected = selectedMonthSet.has(month);

                    return (
                      <label
                        key={month}
                        htmlFor={`month-${month}`}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-muted"
                      >
                        <Checkbox
                          id={`month-${month}`}
                          checked={isSelected}
                          onChange={() => toggleMonth(month)}
                          aria-label={`Incluir ${formatMonth(month)} en el período`}
                        />
                        <span className="flex-1 text-xs font-semibold capitalize text-foreground">
                          {formatMonth(month)}
                        </span>
                        {isSelected ? (
                          <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
                        ) : null}
                      </label>
                    );
                  })}
                </div>

                <div className="border-t border-border bg-muted/40 px-4 py-2.5 text-[10px] font-medium text-muted-foreground">
                  {selectedMonths.length === 0
                    ? "Mostrando el historial completo"
                    : `${selectedMonths.length} de ${availableMonths.length} meses incluidos`}
                </div>
              </PopoverContent>
            </Popover>
          </div>

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
                <p className="text-xl md:text-2xl font-bold text-foreground">{filteredExpenses.length}</p>
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
                      formatter={(val) => [fmt(Number(val)), "Monto"]}
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
                      formatter={(val) => [fmt(Number(val)), "Gastos"]}
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
                      formatter={(val) => [fmt(Number(val)), "Total"]}
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
                                          width: `${totalSpent > 0 ? (firm.monto / totalSpent) * 100 : 0}%`,
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
