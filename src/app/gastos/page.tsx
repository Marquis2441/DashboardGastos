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
  CheckCircle2,
  XCircle,
  FileDown,
} from "lucide-react";
import type { PaymentStatus, Segment, ExpenseType } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function GastosPage() {
  const lawFirms = useAppStore((s) => s.lawFirms);
  const expenses = useAppStore((s) => s.expenses);
  const users = useAppStore((s) => s.users);
  const currentUser = useAppStore((s) => s.currentUser);
  const bulkUpdateExpenseStatus = useAppStore((s) => s.bulkUpdateExpenseStatus);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterFirm, setFilterFirm] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSegment, setFilterSegment] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredExpenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredExpenses.map(e => e.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = (newStatus: PaymentStatus) => {
    if (selectedIds.length === 0) return;
    
    bulkUpdateExpenseStatus(selectedIds, newStatus);
    toast.success(`Cambiado estado a "${newStatus}"`, {
      description: `Se han actualizado ${selectedIds.length} gastos correctamente.`
    });
    setSelectedIds([]);
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "Pagado": return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
      case "Rechazado": return <XCircle className="w-3.5 h-3.5 text-rose-500" />;
      case "Facturado": return <FileDown className="w-3.5 h-3.5 text-blue-500" />;
      default: return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <SelectItem value="Facturado" className="cursor-pointer">Facturado</SelectItem>
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

            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-border/50 gap-4 sm:gap-0">
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <p className="text-sm text-muted-foreground">
                  {filteredExpenses.length} gastos encontrados
                </p>
                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2">
                    <div className="hidden sm:block h-4 w-[1px] bg-border" />
                    <span className="text-sm font-medium text-primary">
                      {selectedIds.length} <span className="hidden sm:inline">seleccionados</span>
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button size="sm" variant="outline" className="h-8 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary">
                          Acción <span className="hidden sm:inline">por Lote</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem onClick={() => handleBulkStatusUpdate("Ingresado")} className="cursor-pointer gap-2">
                          <Clock className="w-4 h-4 text-slate-400" /> Marcar como Ingresado
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkStatusUpdate("En Proceso de Pago")} className="cursor-pointer gap-2">
                          <Clock className="w-4 h-4 text-amber-500" /> En Proceso de Pago
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkStatusUpdate("Facturado")} className="cursor-pointer gap-2">
                          <FileDown className="w-4 h-4 text-blue-500" /> Marcar como Facturado
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkStatusUpdate("Pagado")} className="cursor-pointer gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Marcar como Pagado
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkStatusUpdate("Rechazado")} className="cursor-pointer gap-2 text-rose-600 focus:text-rose-600">
                          <XCircle className="w-4 h-4" /> Rechazar todos
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setSelectedIds([])}
                      className="h-8 text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-rose-500"
                    >
                      Limpiar
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold w-full sm:w-auto text-right">
                Total: {fmt(totalFiltered)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="overflow-x-auto rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox 
                        checked={selectedIds.length === filteredExpenses.length && filteredExpenses.length > 0}
                        onChange={() => toggleSelectAll()}
                      />
                    </TableHead>
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
                        <TableRow key={exp.id} className={selectedIds.includes(exp.id) ? "bg-primary/5 border-primary/20" : ""}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedIds.includes(exp.id)}
                              onChange={() => toggleSelectOne(exp.id)}
                            />
                          </TableCell>
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
                              <span className="text-sm font-medium whitespace-nowrap">{firm?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs gap-1 whitespace-nowrap">
                              {exp.segment === "Personas" ? (
                                <Users className="w-3 h-3" />
                              ) : (
                                <Briefcase className="w-3 h-3" />
                              )}
                              {exp.segment}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">{exp.expenseType}</TableCell>
                          <TableCell className="text-sm text-muted-foreground min-w-[200px] truncate max-w-[300px]">
                            {exp.description || "—"}
                          </TableCell>
                          <TableCell className="text-right font-semibold whitespace-nowrap">{fmt(exp.amount)}</TableCell>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
