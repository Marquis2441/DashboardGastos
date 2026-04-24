"use client";

import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { ExpenseFormDialog } from "@/components/expense-form-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DollarSign,
  TrendingUp,
  Building2,
  Receipt,
  AlertTriangle,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const lawFirms = useAppStore((s) => s.lawFirms);
  const expenses = useAppStore((s) => s.expenses);
  const currentUser = useAppStore((s) => s.currentUser);

  // Metrics
  const totalOCLimit = lawFirms.reduce((acc, lf) => acc + lf.ocLimit, 0);
  const totalOCConsumed = lawFirms.reduce((acc, lf) => acc + lf.ocConsumed, 0);
  const totalAvailable = totalOCLimit - totalOCConsumed;
  const usagePercent = (totalOCConsumed / totalOCLimit) * 100;

  const paidExpenses = expenses.filter((e) => e.status === "Pagado");
  const pendingExpenses = expenses.filter((e) => !["Pagado", "Rechazado"].includes(e.status));
  const rejectedExpenses = expenses.filter((e) => e.status === "Rechazado");

  const totalPaid = paidExpenses.reduce((acc, e) => acc + e.amount, 0);
  const totalPending = pendingExpenses.reduce((acc, e) => acc + e.amount, 0);

  const fmt = (val: number) => `$${val.toLocaleString("es-AR")}`;

  useEffect(() => {
    if (currentUser && !["ADMIN", "ANALISTA"].includes(currentUser.role)) {
      router.replace("/gastos");
    }
  }, [currentUser, router]);

  if (!currentUser || !["ADMIN", "ANALISTA"].includes(currentUser.role)) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen animate-fade-in-up">
        {/* Header */}
        <PageHeader 
          title="Control de Gastos Prendarios - RA"
          subtitle={`${currentUser?.name || 'Marcos Rossi'} — Dashboard Financiero`}
          showUser
        />

        <div className="p-3 md:p-6 lg:p-10 space-y-6 md:space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-500 rounded-2xl md:rounded-4xl shadow-sm border border-slate-200 dark:border-slate-800 group overflow-hidden relative font-roboto hover:-translate-y-1 md:hover:-translate-y-2 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-6 relative z-10">
                <CardTitle className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Límite Total OC
                </CardTitle>

                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-primary/20 shrink-0">
                  <DollarSign className="w-3.5 h-3.5 md:w-5 md:h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                <div className="text-sm md:text-2xl font-black">{fmt(totalOCLimit)}</div>
                <div className="flex items-center gap-2 mt-1.5 md:mt-2">
                  <div className="flex-1 h-1 md:h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 bg-primary"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <span className="text-[8px] md:text-xs text-muted-foreground">{usagePercent.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-500 rounded-2xl md:rounded-4xl shadow-sm border border-slate-200 dark:border-slate-800 group overflow-hidden relative font-roboto hover:-translate-y-1 md:hover:-translate-y-2 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-6 relative z-10">
                <CardTitle className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Saldo Disponible
                </CardTitle>

                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-emerald-500/20 shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 md:w-5 md:h-5 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                <div className="text-sm md:text-2xl font-black text-emerald-500">{fmt(totalAvailable)}</div>
                <p className="text-[8px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 truncate">
                  de {fmt(totalOCLimit)} asignados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-500 rounded-2xl md:rounded-4xl shadow-sm border border-slate-200 dark:border-slate-800 group overflow-hidden relative font-roboto hover:-translate-y-1 md:hover:-translate-y-2 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-6 relative z-10">
                <CardTitle className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Gastos Pagados
                </CardTitle>

                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-blue-500/20 shrink-0">
                  <Receipt className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                <div className="text-sm md:text-2xl font-black">{fmt(totalPaid)}</div>
                <p className="text-[8px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 truncate">
                  {paidExpenses.length} gastos liquidados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-500 rounded-2xl md:rounded-4xl shadow-sm border border-slate-200 dark:border-slate-800 group overflow-hidden relative font-roboto hover:-translate-y-1 md:hover:-translate-y-2 cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-6 relative z-10">
                <CardTitle className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Pendientes
                </CardTitle>

                <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-amber-500/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-amber-500/20 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 md:w-5 md:h-5 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0 md:pt-0">
                <div className="text-sm md:text-2xl font-black text-amber-500">{fmt(totalPending)}</div>
                <p className="text-[8px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 truncate">
                  {pendingExpenses.length} sin pagar
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Law Firms Overview */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Estudios Jurídicos</h2>
              <Link href="/estudios" className="text-sm text-primary hover:underline flex items-center gap-1">
                Ver todos <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lawFirms.map((firm) => {
                const firmExpenses = expenses.filter((e) => e.lawFirmId === firm.id);
                const available = firm.ocLimit - firm.ocConsumed;
                const percent = (firm.ocConsumed / firm.ocLimit) * 100;
                const isHighUsage = percent > 85;

                return (
                  <Link key={firm.id} href={`/estudios/${firm.id}`}>
                    <Card className="bg-white dark:bg-slate-900 border-border/50 dark:border-slate-800/50 hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer group">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${firm.color}20` }}
                            >
                              <Building2 className="w-5 h-5" style={{ color: firm.color }} />
                            </div>
                            <div>
                              <h3 className="font-semibold group-hover:text-primary transition-colors">
                                {firm.name}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {firmExpenses.length} gastos registrados
                              </p>
                            </div>
                          </div>
                          {isHighUsage && (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[11px]">
                              Alto consumo
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Consumido</span>
                            <span className="font-semibold">{fmt(firm.ocConsumed)}</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: isHighUsage ? "oklch(0.65 0.20 25)" : firm.color,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Disponible: <span className={isHighUsage ? "text-destructive font-semibold" : "text-emerald-500 font-semibold"}>{fmt(available)}</span></span>
                            <span>Límite: {fmt(firm.ocLimit)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
            <Card className="bg-white dark:bg-slate-900 border-border/50 dark:border-slate-800/50">
              <CardContent className="pt-6 space-y-4">
                {expenses.slice(0, 5).map((expense) => {
                  const firm = lawFirms.find((lf) => lf.id === expense.lawFirmId);
                  const lastAudit = expense.auditTrail[expense.auditTrail.length - 1];
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: firm?.color || "#888" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {firm?.name} — {expense.expenseType} — <span className="text-primary font-bold">#{expense.proformaNum}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lastAudit.userName} · {lastAudit.action}
                          {lastAudit.newValue && ` → ${lastAudit.newValue}`}
                        </p>
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap">{fmt(expense.amount)}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
