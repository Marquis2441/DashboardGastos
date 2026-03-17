"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { ExpenseFormDialog } from "@/components/expense-form-dialog";
import { PaymentStatusDropdown } from "@/components/payment-status-dropdown";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Search,
  FileText,
  FileSpreadsheet,
  Filter,
  Users,
  Briefcase,
  Clock,
} from "lucide-react";
import type { PaymentStatus, Segment, ExpenseType } from "@/lib/types";

export default function GastosPage() {
  const lawFirms = useAppStore((s) => s.lawFirms);
  const expenses = useAppStore((s) => s.expenses);
  const users = useAppStore((s) => s.users);
  const currentUser = useAppStore((s) => s.currentUser);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterFirm, setFilterFirm] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSegment, setFilterSegment] = useState<string>("all");

  const fmt = (val: number) => `$${val.toLocaleString("es-AR")}`;

  let roleExpenses = expenses;
  if (currentUser?.role === "ESTUDIO") {
    roleExpenses = expenses.filter(e => e.lawFirmId === currentUser.lawFirmId);
  }

  // Filter expenses
  const filteredExpenses = roleExpenses.filter((exp) => {
    if (filterFirm !== "all" && exp.lawFirmId !== filterFirm) return false;
    if (filterStatus !== "all" && exp.status !== filterStatus) return false;
    if (filterSegment !== "all" && exp.segment !== filterSegment) return false;
    if (searchTerm) {
      const firm = lawFirms.find((lf) => lf.id === exp.lawFirmId);
      const search = searchTerm.toLowerCase();
      return (
        firm?.name.toLowerCase().includes(search) ||
        exp.expenseType.toLowerCase().includes(search) ||
        exp.description?.toLowerCase().includes(search) ||
        exp.date.includes(search)
      );
    }
    return true;
  });

  const totalFiltered = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <PageHeader
          title={currentUser?.role === "CCO" ? "Aprobación de Gastos" : "Historial de Gastos"}
          subtitle={currentUser?.role === "CCO" ? "Gastos ingresados pendientes de aprobación" : "Todos los gastos registrados"}
          showUser
        />

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filtros
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              <Select 
                value={filterFirm === "all" ? "" : filterFirm} 
                onValueChange={(val: string | null) => setFilterFirm(val || "all")}
              >
                <SelectTrigger className="h-10 cursor-pointer bg-white">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <SelectValue>
                      {filterFirm === "all" ? "Todos los estudios" : lawFirms.find(f => f.id === filterFirm)?.name}
                    </SelectValue>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="cursor-pointer">Todos los estudios</SelectItem>
                  {lawFirms.map((lf) => (
                    <SelectItem key={lf.id} value={lf.id} className="cursor-pointer">
                      {lf.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={filterStatus === "all" ? "" : filterStatus} 
                onValueChange={(val: string | null) => setFilterStatus(val || "all")}
              >
                <SelectTrigger className="h-10 cursor-pointer bg-white">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Todos los estados" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="cursor-pointer">Todos los estados</SelectItem>
                  <SelectItem value="Ingresado" className="cursor-pointer">Ingresado</SelectItem>
                  <SelectItem value="En Proceso de Pago" className="cursor-pointer">En Proceso de Pago</SelectItem>
                  <SelectItem value="Pagado" className="cursor-pointer">Pagado</SelectItem>
                  <SelectItem value="Rechazado" className="cursor-pointer">Rechazado</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filterSegment === "all" ? "" : filterSegment} 
                onValueChange={(val: string | null) => setFilterSegment(val || "all")}
              >
                <SelectTrigger className="h-10 cursor-pointer bg-white">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Todos los segmentos" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="cursor-pointer">Todos los segmentos</SelectItem>
                  <SelectItem value="Personas" className="cursor-pointer">Personas</SelectItem>
                  <SelectItem value="Empresas" className="cursor-pointer">Empresas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                {filteredExpenses.length} gastos encontrados
              </p>
              <p className="text-sm font-semibold">
                Total: {fmt(totalFiltered)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Proforma</TableHead>
                  <TableHead>Estudio</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Archivos</TableHead>
                  <TableHead>Creado por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                      No se encontraron gastos con los filtros aplicados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((exp) => {
                    const firm = lawFirms.find((lf) => lf.id === exp.lawFirmId);
                    const creator = users.find((u) => u.id === exp.createdBy);

                    return (
                      <TableRow key={exp.id}>
                        <TableCell className="text-sm whitespace-nowrap">{exp.date}</TableCell>
                        <TableCell className="text-sm font-bold text-primary">#{exp.proformaNum}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${firm?.color || "#888"}20` }}
                            >
                              <Building2 className="w-3 h-3" style={{ color: firm?.color || "#888" }} />
                            </div>
                            <span className="text-sm font-medium">{firm?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs gap-1">
                            {exp.segment === "Personas" ? (
                              <Users className="w-3 h-3" />
                            ) : (
                              <Briefcase className="w-3 h-3" />
                            )}
                            {exp.segment}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{exp.expenseType}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {exp.description || "—"}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{fmt(exp.amount)}</TableCell>
                        <TableCell>
                          <PaymentStatusDropdown 
                            expenseId={exp.id} 
                            currentStatus={exp.status} 
                            auditTrail={exp.auditTrail}
                          />
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
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {creator?.name || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
