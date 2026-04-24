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
  ShieldCheck,
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
    const allowedStatuses: PaymentStatus[] = ["Ingresado", "A facturar", "Facturado", "En proceso de pago"];
    roleExpenses = expenses.filter(e => 
      e.lawFirmId === currentUser.lawFirmId && 
      allowedStatuses.includes(e.status)
    );
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
      case "Facturado": return <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />;
      case "A facturar": return <FileDown className="w-3.5 h-3.5 text-purple-500" />;
      case "Ingresado Analista": return <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />;
      case "En proceso de pago": return <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin" />;
      default: return <Clock className="w-3.5 h-3.5 text-blue-500" />;
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

        <div className="p-3 md:p-6 lg:p-10 space-y-4 md:space-y-6">
          {/* Filters */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col gap-4">
                {/* Search Bar & Toggle */}
                <div className="grid grid-cols-1 md:flex md:flex-row items-center gap-2 md:gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 md:h-10 bg-background border-slate-200 dark:border-slate-800 transition-all focus:ring-primary/20 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant={showFilters ? "secondary" : "outline"} 
                      onClick={() => setShowFilters(!showFilters)}
                      className={cn(
                        "h-9 px-3 gap-2 font-medium transition-all text-xs flex-1 md:flex-none",
                        showFilters && "bg-primary/10 text-primary border-primary/20"
                      )}
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>Filtros</span>
                      <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", showFilters && "rotate-180")} />
                    </Button>

                    <div className="md:hidden flex items-center px-3 h-9 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                       <p className="text-[10px] font-black">
                        Total: <span className="text-primary">{fmt(totalFiltered)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="ml-auto hidden md:flex items-center gap-4">
                    <p className="text-sm font-bold">
                      Total: <span className="text-primary">{fmt(totalFiltered)}</span>
                    </p>
                  </div>
                </div>

                {/* Collapsible Filters */}
                {showFilters && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:flex lg:flex-wrap items-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase ml-1">Estudio</span>
                      <Select 
                        value={filterFirm === "all" ? "" : filterFirm} 
                        onValueChange={(val: string | null) => setFilterFirm(val || "all")}
                      >
                        <SelectTrigger className="h-8 md:h-9 w-full lg:w-[200px] cursor-pointer bg-background text-xs">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3 h-3 text-muted-foreground" />
                            <SelectValue placeholder="Estudio" />
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
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase ml-1">Estado</span>
                      <Select 
                        value={filterStatus === "all" ? "" : filterStatus} 
                        onValueChange={(val: string | null) => setFilterStatus(val || "all")}
                      >
                        <SelectTrigger className="h-8 md:h-9 w-full lg:w-[170px] cursor-pointer bg-background text-xs">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <SelectValue placeholder="Estado" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="" className="cursor-pointer">Todos los estados</SelectItem>
                           <SelectItem value="Ingresado" className="cursor-pointer">Ingresado (Estudio)</SelectItem>
                           <SelectItem value="A facturar" className="cursor-pointer">A facturar</SelectItem>
                           <SelectItem value="Facturado" className="cursor-pointer">Facturado</SelectItem>
                           <SelectItem value="Ingresado Analista" className="cursor-pointer">Ingresado (Analista)</SelectItem>
                           <SelectItem value="En proceso de pago" className="cursor-pointer">En proceso de pago</SelectItem>
                           <SelectItem value="Pagado" className="cursor-pointer">Pagado</SelectItem>
                           <SelectItem value="Rechazado" className="cursor-pointer">Rechazado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase ml-1">Segmento</span>
                      <Select 
                        value={filterSegment === "all" ? "" : filterSegment} 
                        onValueChange={(val: string | null) => setFilterSegment(val || "all")}
                      >
                        <SelectTrigger className="h-8 md:h-9 w-full lg:w-[160px] cursor-pointer bg-background text-xs">
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            <SelectValue placeholder="Segmento" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="" className="cursor-pointer">Todos los segmentos</SelectItem>
                          <SelectItem value="Personas" className="cursor-pointer">Personas</SelectItem>
                          <SelectItem value="Empresas" className="cursor-pointer">Empresas</SelectItem>
                        </SelectContent>
                      </Select>
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
                      className="h-8 md:h-9 text-[10px] text-muted-foreground hover:text-rose-500 gap-1.5 w-full md:w-auto"
                    >
                      Limpiar
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
                          <DropdownMenuItem onClick={() => handleBulkStatusUpdate("A facturar")} className="cursor-pointer gap-2">
                            <FileDown className="w-4 h-4 text-purple-500" /> Marcar A facturar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkStatusUpdate("Ingresado Analista")} className="cursor-pointer gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-500" /> Marcar como Validado (Ingresado)
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkStatusUpdate("En proceso de pago")} className="cursor-pointer gap-2">
                            <Clock className="w-4 h-4 text-amber-500" /> En proceso de pago
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

          {/* Table / Mobile View */}
          <div className="space-y-4">
            {/* Desktop Table View */}
            <Card className="hidden md:block border-border/50">
              <CardContent className="p-0 md:p-4">
                <div className="relative group/table overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar pb-2">
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
                                <TableCell className="text-sm font-bold text-primary">
                                  <div className="flex items-center gap-1.5">
                                    #{exp.proformaNum}
                                    {exp.status === "A facturar" && (
                                      <div className="flex items-center justify-center relative ml-1">
                                        <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-rose-400 opacity-75"></span>
                                        <FileText className="w-4 h-4 text-rose-500 relative z-10" />
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
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
                </div>
              </CardContent>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {filteredExpenses.length === 0 ? (
                 <Card className="border-dashed">
                   <CardContent className="py-10 text-center text-muted-foreground text-sm">
                     No se encontraron gastos.
                   </CardContent>
                 </Card>
              ) : (
                filteredExpenses.map((exp) => {
                  const firm = lawFirms.find((lf) => lf.id === exp.lawFirmId);
                  return (
                    <Card key={exp.id} className={cn(
                      "border-border/60 overflow-hidden transition-all active:scale-[0.98]",
                      selectedIds.includes(exp.id) && "border-primary/50 ring-1 ring-primary/20 bg-primary/5"
                    )}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                             <Checkbox 
                               checked={selectedIds.includes(exp.id)}
                               onChange={() => toggleSelectOne(exp.id)}
                               className="mt-0.5"
                             />
                             <div>
                               <div className="flex items-center gap-1.5">
                                 <p className="text-xs font-bold text-primary">#{exp.proformaNum}</p>
                                 {exp.status === "A facturar" && (
                                   <div className="flex items-center justify-center relative ml-1">
                                     <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-rose-400 opacity-75"></span>
                                     <FileText className="w-3.5 h-3.5 text-rose-500 relative z-10" />
                                   </div>
                                 )}
                               </div>
                               <p className="text-[10px] text-muted-foreground">{exp.date}</p>
                             </div>
                          </div>
                          <PaymentStatusDropdown 
                            expenseId={exp.id} 
                            currentStatus={exp.status} 
                            auditTrail={exp.auditTrail}
                          />
                        </div>

                        <div className="flex items-center gap-3 py-2 border-y border-slate-100 dark:border-slate-800/50">
                           <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${firm?.color || "#888"}15` }}
                            >
                              <Building2 className="w-5 h-5" style={{ color: firm?.color || "#888" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-sm font-bold truncate">{firm?.name}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                 <Badge variant="outline" className="text-[9px] h-4 px-1.5 gap-1 py-0 border-slate-200">
                                   {exp.segment === "Personas" ? <Users className="w-2 h-2" /> : <Briefcase className="w-2 h-2" />}
                                   {exp.segment}
                                 </Badge>
                                 <span className="text-[10px] text-muted-foreground truncate">{exp.expenseType}</span>
                               </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                           <div className="flex gap-1.5">
                             {exp.attachments.map((att) => (
                                <div key={att.id} className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                  {att.type === "pdf" ? <FileText className="w-3.5 h-3.5 text-red-400" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
                                </div>
                             ))}
                             {exp.attachments.length === 0 && <span className="text-[10px] text-muted-foreground">Sin adjuntos</span>}
                           </div>
                           <p className="text-lg font-black text-slate-900 dark:text-slate-50">{fmt(exp.amount)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
      </div>
    </div>
  </AppShell>
);
}
