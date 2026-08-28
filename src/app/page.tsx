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
    if (currentUser && !["ADMIN", "ANALISTA", "CCO", "SUPERVISOR"].includes(currentUser.role)) {
      router.replace("/gastos");
    }
  }, [currentUser, router]);

  if (!currentUser || !["ADMIN", "ANALISTA", "CCO", "SUPERVISOR"].includes(currentUser.role)) {
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
            <Card className="bg-card hover:border-foreground/20 transition-all duration-300 rounded-md shadow-sm border border-border group overflow-hidden relative cursor-default">
              <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-1.5 p-3 md:p-4 relative z-10">
                <CardTitle className="text-[8px] md:text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Límite Total OC
                </CardTitle>

                <div className="w-6 h-6 md:w-8 md:h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
                <div className="text-sm md:text-xl font-bold font-mono">{fmt(totalOCLimit)}</div>
                <div className="flex items-center gap-2 mt-1.5 md:mt-2">
                  <div className="flex-1 h-1 md:h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 bg-foreground"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  <span className="text-[8px] md:text-xs text-muted-foreground">{usagePercent.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card hover:border-foreground/20 transition-all duration-300 rounded-md shadow-sm border border-border group overflow-hidden relative cursor-default">
              <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-1.5 p-3 md:p-4 relative z-10">
                <CardTitle className="text-[8px] md:text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Saldo Disponible
                </CardTitle>

                <div className="w-6 h-6 md:w-8 md:h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-success" />
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
                <div className="text-sm md:text-xl font-bold text-success font-mono">{fmt(totalAvailable)}</div>
                <p className="text-[8px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 truncate">
                  de <span className="font-mono">{fmt(totalOCLimit)}</span> asignados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card hover:border-foreground/20 transition-all duration-300 rounded-md shadow-sm border border-border group overflow-hidden relative cursor-default">
              <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-1.5 p-3 md:p-4 relative z-10">
                <CardTitle className="text-[8px] md:text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Gastos Pagados
                </CardTitle>

                <div className="w-6 h-6 md:w-8 md:h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <Receipt className="w-3 h-3 md:w-4 md:h-4 text-foreground" />
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
                <div className="text-sm md:text-xl font-bold font-mono">{fmt(totalPaid)}</div>
                <p className="text-[8px] md:text-xs text-muted-foreground mt-0.5 md:mt-1 truncate">
                  {paidExpenses.length} gastos liquidados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card hover:border-foreground/20 transition-all duration-300 rounded-md shadow-sm border border-border group overflow-hidden relative cursor-default">
              <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-1.5 p-3 md:p-4 relative z-10">
                <CardTitle className="text-[8px] md:text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Pendientes
                </CardTitle>

                <div className="w-6 h-6 md:w-8 md:h-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 text-warning" />
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
                <div className="text-sm md:text-xl font-bold text-warning font-mono">{fmt(totalPending)}</div>
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
                    <Card className="bg-card border-border rounded-md hover:shadow-sm hover:border-foreground/20 transition-all duration-200 cursor-pointer group">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${firm.color}20` }}
                            >
                              <Building2 className="w-4 h-4" style={{ color: firm.color }} />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
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

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Consumido</span>
                            <span className="font-semibold font-mono">{fmt(firm.ocConsumed)}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: isHighUsage ? "oklch(0.65 0.20 25)" : firm.color,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Disponible: <span className={isHighUsage ? "text-destructive font-semibold font-mono" : "text-emerald-500 font-semibold font-mono"}>{fmt(available)}</span></span>
                            <span>Límite: <span className="font-mono">{fmt(firm.ocLimit)}</span></span>
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
            <Card className="bg-card border-border">
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
                          {firm?.name} — {expense.expenseType} — <span className="text-primary font-bold font-mono">#{expense.proformaNum}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lastAudit.userName} · {lastAudit.action}
                          {lastAudit.newValue && ` → ${lastAudit.newValue}`}
                        </p>
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap font-mono">{fmt(expense.amount)}</span>
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
