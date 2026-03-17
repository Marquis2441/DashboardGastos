"use client";

import { use } from "react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { ExpenseFormDialog } from "@/components/expense-form-dialog";
import { PaymentStatusDropdown } from "@/components/payment-status-dropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  ArrowLeft,
  Users,
  Briefcase,
  Gavel,
  HandCoins,
  Scale,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Segment, ExpenseType, Expense } from "@/lib/types";

const SEGMENT_CONFIG: Record<Segment, { icon: React.ElementType; color: string }> = {
  Personas: { icon: Users, color: "#3B82F6" },
  Empresas: { icon: Briefcase, color: "#8B5CF6" },
};

const TYPE_CONFIG: Record<ExpenseType, { icon: React.ElementType; color: string }> = {
  "Tasa de Justicia": { icon: Scale, color: "#EF4444" },
  Honorarios: { icon: HandCoins, color: "#10B981" },
  "Inicios Judiciales": { icon: Gavel, color: "#F59E0B" },
};

function ExpenseTable({ expenses, lawFirms }: { expenses: Expense[]; lawFirms: ReturnType<typeof useAppStore.getState>["lawFirms"] }) {
  const fmt = (val: number) => `$${val.toLocaleString("es-AR")}`;
  const users = useAppStore((s) => s.users);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No hay gastos registrados en esta categoría.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Proforma</TableHead>
          <TableHead>Segmento</TableHead>
          <TableHead>Motivo</TableHead>
          <TableHead className="text-right">Monto</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Archivos</TableHead>
          <TableHead>Creado por</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((exp) => {
          const creator = users.find(u => u.id === exp.createdBy);
          return (
            <TableRow key={exp.id} className="animate-fade-in-up">
              <TableCell className="text-sm">{exp.date}</TableCell>
              <TableCell className="text-sm font-bold text-primary">#{exp.proformaNum}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs gap-1">
                  {exp.segment === "Personas" ? <Users className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
                  {exp.segment}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{exp.expenseType}</TableCell>
              <TableCell className="text-right font-semibold">{fmt(exp.amount)}</TableCell>
              <TableCell>
                <PaymentStatusDropdown expenseId={exp.id} currentStatus={exp.status} auditTrail={exp.auditTrail} />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {exp.attachments.map((att) => (
                    <div key={att.id} title={att.name}>
                      {att.type === "pdf" ? (
                        <FileText className="w-4 h-4 text-red-400" />
                      ) : (
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                  ))}
                  {exp.attachments.length === 0 && (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">{creator?.name || "—"}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default function EstudioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const lawFirms = useAppStore((s) => s.lawFirms);
  const firm = useAppStore((s) => s.getLawFirm(id));
  const firmExpenses = useAppStore((s) => s.getExpensesByFirm(id));

  const fmt = (val: number) => `$${val.toLocaleString("es-AR")}`;

  if (!firm) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Estudio no encontrado.</p>
          <Link href="/estudios">
            <Button variant="ghost" className="mt-4 cursor-pointer">Volver</Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const available = firm.ocLimit - firm.ocConsumed;
  const percent = (firm.ocConsumed / firm.ocLimit) * 100;
  const isHighUsage = percent > 85;

  // Group by segment
  const personasExpenses = firmExpenses.filter((e) => e.segment === "Personas");
  const empresasExpenses = firmExpenses.filter((e) => e.segment === "Empresas");

  // Group by type
  const tasaExpenses = firmExpenses.filter((e) => e.expenseType === "Tasa de Justicia");
  const honorariosExpenses = firmExpenses.filter((e) => e.expenseType === "Honorarios");
  const iniciosExpenses = firmExpenses.filter((e) => e.expenseType === "Inicios Judiciales");

  const sumExpenses = (exps: Expense[]) => exps.reduce((acc, e) => acc + e.amount, 0);

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/estudios">
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${firm.color}20` }}
              >
                <Building2 className="w-6 h-6" style={{ color: firm.color }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{firm.name}</h1>
                <p className="text-sm text-muted-foreground">{firm.contactEmail}</p>
              </div>
            </div>
          </div>
          <ExpenseFormDialog />
        </div>

        {/* OC Summary */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Límite OC</p>
                <p className="text-2xl font-bold mt-1">{fmt(firm.ocLimit)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Consumido</p>
                <p className="text-2xl font-bold mt-1">{fmt(firm.ocConsumed)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disponible</p>
                <p className={`text-2xl font-bold mt-1 ${isHighUsage ? "text-destructive" : "text-emerald-500"}`}>
                  {fmt(available)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ejecución</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: isHighUsage ? "oklch(0.65 0.20 25)" : firm.color,
                      }}
                    />
                  </div>
                  <span className={`text-lg font-bold ${isHighUsage ? "text-destructive" : ""}`}>
                    {percent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary by Segment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["Personas", "Empresas"] as Segment[]).map((segment) => {
            const cfg = SEGMENT_CONFIG[segment];
            const Icon = cfg.icon;
            const exps = segment === "Personas" ? personasExpenses : empresasExpenses;
            const total = sumExpenses(exps);

            return (
              <Card key={segment} className="border-border/50">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cfg.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <CardTitle className="text-base">{segment}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {exps.length} gastos · {fmt(total)}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Summary by Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["Tasa de Justicia", "Honorarios", "Inicios Judiciales"] as ExpenseType[]).map((type) => {
            const cfg = TYPE_CONFIG[type];
            const Icon = cfg.icon;
            const exps = type === "Tasa de Justicia" ? tasaExpenses : type === "Honorarios" ? honorariosExpenses : iniciosExpenses;
            const total = sumExpenses(exps);

            return (
              <Card key={type} className="border-border/50">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cfg.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{type}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {exps.length} gastos · {fmt(total)}
                    </p>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Separator />

        {/* Tables by Segment */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Desglose por Segmento</h2>

          {(["Personas", "Empresas"] as Segment[]).map((segment) => {
            const cfg = SEGMENT_CONFIG[segment];
            const Icon = cfg.icon;
            const exps = segment === "Personas" ? personasExpenses : empresasExpenses;

            return (
              <Card key={segment} className="border-border/50">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                  <CardTitle className="text-base">{segment}</CardTitle>
                  <Badge variant="secondary" className="text-xs ml-auto">{exps.length} registros</Badge>
                </CardHeader>
                <CardContent>
                  <ExpenseTable expenses={exps} lawFirms={lawFirms} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator />

        {/* Tables by Type */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Desglose por Motivo</h2>

          {(["Tasa de Justicia", "Honorarios", "Inicios Judiciales"] as ExpenseType[]).map((type) => {
            const cfg = TYPE_CONFIG[type];
            const Icon = cfg.icon;
            const exps = type === "Tasa de Justicia" ? tasaExpenses : type === "Honorarios" ? honorariosExpenses : iniciosExpenses;

            return (
              <Card key={type} className="border-border/50">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                  <CardTitle className="text-base">{type}</CardTitle>
                  <Badge variant="secondary" className="text-xs ml-auto">{exps.length} registros</Badge>
                </CardHeader>
                <CardContent>
                  <ExpenseTable expenses={exps} lawFirms={lawFirms} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
