"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

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
  ChevronDown,
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
  const [filterSegment, setFilterSegment] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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
      <div className="flex flex-col min-h-screen animate-fade-in-up">
        {/* Header */}
        <PageHeader
          title={currentUser?.role === "CCO" ? "Aprobación de Gastos" : "Historial de Gastos"}
          subtitle={currentUser?.role === "CCO" ? "Gastos ingresados pendientes de aprobación" : "Todos los gastos registrados"}
          showUser
        />

        <div className="p-4 md:p-6 lg:p-10 space-y-6">
          {/* Filters */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Search Bar & Toggle */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por proforma, estudio o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 bg-background border-slate-200 dark:border-slate-800 transition-all focus:ring-primary/20"
                    />
                  </div>

                  <Button 
                    variant={showFilters ? "secondary" : "outline"} 
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "h-10 px-4 gap-2 font-medium transition-all",
                      showFilters && "bg-primary/10 text-primary border-primary/20"
                    )}
                  >
                    <Filter className="w-4 h-4" />
                    <span>Filtros</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showFilters && "rotate-180")} />
                  </Button>

                  <div className="ml-auto hidden md:flex items-center gap-4">
                    <p className="text-sm font-bold">
                      Total: <span className="text-primary">{fmt(totalFiltered)}</span>
                    </p>
                  </div>
                </div>

                {/* Collapsible Filters */}
                {showFilters && (
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Estudio</span>
                        <Select 
                          value={filterFirm === "all" ? "" : filterFirm} 
                          onValueChange={(val: string | null) => setFilterFirm(val || "all")}
                        >
                          <SelectTrigger className="h-9 w-[200px] cursor-pointer bg-background">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                              <SelectValue placeholder="Todos los estudios" />
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
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Estado</span>
                        <Select 
                          value={filterStatus === "all" ? "" : filterStatus} 
                          onValueChange={(val: string | null) => setFilterStatus(val || "all")}
                        >
                          <SelectTrigger className="h-9 w-[170px] cursor-pointer bg-background">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                              <SelectValue placeholder="Todos los estados" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="" className="cursor-pointer">Todos los estados</SelectItem>
                             <SelectItem value="Ingresado" className="cursor-pointer">Ingresado</SelectItem>
                             <SelectItem value="En Proceso de Pago" className="cursor-pointer">En Proceso de Pago</SelectItem>
                             <SelectItem value="Autorizado" className="cursor-pointer">Autorizado</SelectItem>
                             <SelectItem value="Facturado" className="cursor-pointer">Facturado</SelectItem>
                             <SelectItem value="Pagado" className="cursor-pointer">Pagado</SelectItem>
                             <SelectItem value="Rechazado" className="cursor-pointer">Rechazado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">Segmento</span>
                        <Select 
                          value={filterSegment === "all" ? "" : filterSegment} 
                          onValueChange={(val: string | null) => setFilterSegment(val || "all")}
                        >
                          <SelectTrigger className="h-9 w-[160px] cursor-pointer bg-background">
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
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setFilterFirm("all");
                        setFilterStatus("all");
                        setFilterSegment("all");
                        setSearchTerm("");
                      }}
                      className="h-9 mt-4 text-xs text-muted-foreground hover:text-rose-500 gap-1.5"
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </div>

              {/* Bottom bar with counts & bulk actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 gap-4 sm:gap-0">
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                  <p className="text-xs font-medium text-slate-500">
                    <span className="font-bold text-slate-900 dark:text-slate-200">{filteredExpenses.length}</span> gastos encontrados
                  </p>
                  {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                      <div className="h-3 w-[1px] bg-slate-200 dark:bg-slate-800" />
                      <span className="text-xs font-bold text-primary">
                        {selectedIds.length} seleccionados
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<button className="focus:outline-none" />}>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] gap-1.5 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary uppercase font-bold tracking-wider">
                            Acción Grupal
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
                        className="h-7 px-2 text-[9px] uppercase font-bold tracking-wider text-muted-foreground hover:text-rose-500"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex md:hidden items-center gap-2 w-full justify-between">
                   <p className="text-sm font-bold">Total:</p>
                   <p className="text-lg font-bold text-primary">{fmt(totalFiltered)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="overflow-x-auto rounded-xl">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
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
                        <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
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
      </div>
    </AppShell>
  );
}
