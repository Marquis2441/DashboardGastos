"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Search,
  FileText,
  FileSpreadsheet,
  Users,
  Briefcase,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StatusBadge } from "@/components/payment-status-dropdown";

export default function AutorizacionesPage() {
  const lawFirms = useAppStore((s) => s.lawFirms);
  const expenses = useAppStore((s) => s.expenses);
  const currentUser = useAppStore((s) => s.currentUser);
  const bulkUpdateExpenseStatus = useAppStore((s) => s.bulkUpdateExpenseStatus);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterFirm, setFilterFirm] = useState<string>("all");
  const [filterSegment, setFilterSegment] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const fmt = (val: number) => `$${val.toLocaleString("es-AR")}`;

  // Solo ADMIN o CCO pueden ver esto
  if (!currentUser || !["ADMIN", "CCO"].includes(currentUser.role)) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-full">
            <ShieldCheck className="w-12 h-12 text-rose-500 opacity-20" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Acceso Denegado</h1>
            <p className="text-slate-500">Solo administradores o CCO pueden gestionar autorizaciones.</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Únicamente gastos validados ("Ingresado Analista") para autorizar a pago
  const pendingExpenses = expenses.filter(e => e.status === "Ingresado Analista");

  // Filter expenses
  const filteredExpenses = pendingExpenses.filter((exp) => {
    if (filterFirm !== "all" && exp.lawFirmId !== filterFirm) return false;
    if (filterSegment !== "all" && exp.segment !== filterSegment) return false;
    if (searchTerm) {
      const firm = lawFirms.find((lf) => lf.id === exp.lawFirmId);
      const search = searchTerm.toLowerCase();
      return (
        firm?.name.toLowerCase().includes(search) ||
        exp.expenseType.toLowerCase().includes(search) ||
        exp.proformaNum.toString().includes(search)
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

  const handleBulkAuthorize = () => {
    if (selectedIds.length === 0) return;
    
    bulkUpdateExpenseStatus(selectedIds, "En proceso de pago");
    toast.success(`Gastos enviados a pago`, {
      description: `Se han movido ${selectedIds.length} gastos a "En proceso de pago".`
    });
    setSelectedIds([]);
  };

  return (
    <AppShell>
      <div className="flex flex-col min-h-screen animate-fade-in-up">
        {/* Header */}
        <PageHeader
          title="Gestión de Autorizaciones"
          subtitle="Firma y autoriza los gastos que se encuentran en lista de espera"
          showUser
        />

        <div className="p-4 md:p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto w-full">
          {/* Summary Cards - More Compact */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-900/30 shadow-sm border">
                <CardContent className="p-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-amber-900 rounded-xl shadow-sm border border-amber-100 dark:border-amber-800">
                         <Clock className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-amber-700/70 dark:text-amber-400 uppercase tracking-widest">Pendientes</p>
                         <p className="text-xl font-black text-amber-950 dark:text-amber-100">{pendingExpenses.length}</p>
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-200/50 dark:border-indigo-900/30 shadow-sm border md:col-span-2">
                <CardContent className="p-4">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-indigo-900 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-800">
                         <ShieldCheck className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-indigo-700/70 dark:text-indigo-400 uppercase tracking-widest">Monto a Autorizar</p>
                         <p className="text-xl font-black text-indigo-950 dark:text-indigo-100 tabular-nums">{fmt(totalFiltered)}</p>
                      </div>
                   </div>
                </CardContent>
             </Card>
             <div className="flex items-center">
                <Button 
                  onClick={handleBulkAuthorize} 
                  disabled={selectedIds.length === 0}
                  className="w-full h-12 text-sm font-black gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/10 transition-all disabled:opacity-30 rounded-xl"
                >
                   <ShieldCheck className={cn("w-4 h-4", selectedIds.length > 0 && "animate-pulse")} />
                   Autorizar {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
                </Button>
             </div>
          </div>

          <Card className="border-border/50 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-4 space-y-4">
               {/* Toolbar */}
               <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Buscar por estudio, proforma..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 rounded-xl transition-all"
                    />
                  </div>
                  <Button 
                    variant={showFilters ? "secondary" : "outline"} 
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "h-10 px-4 gap-2 font-bold rounded-xl transition-all text-xs",
                      showFilters && "bg-primary/10 text-primary border-primary/20"
                    )}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Filtros
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", showFilters && "rotate-180")} />
                  </Button>
               </div>

               {/* Collapsible Filters */}
               {showFilters && (
                 <div className="flex flex-wrap items-end gap-x-6 gap-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Estudio</span>
                      <Select 
                        value={filterFirm === "all" ? "" : filterFirm} 
                        onValueChange={(val: string | null) => setFilterFirm(val || "all")}
                      >
                        <SelectTrigger className="h-9 w-[220px] cursor-pointer bg-background rounded-lg border-slate-200 dark:border-slate-700">
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
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Segmento</span>
                      <Select 
                        value={filterSegment === "all" ? "" : filterSegment} 
                        onValueChange={(val: string | null) => setFilterSegment(val || "all")}
                      >
                        <SelectTrigger className="h-9 w-[220px] cursor-pointer bg-background rounded-lg border-slate-200 dark:border-slate-700">
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

                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setFilterFirm("all");
                        setFilterSegment("all");
                        setSearchTerm("");
                      }}
                      className="h-9 mb-0.5 text-[10px] text-muted-foreground hover:text-rose-500 gap-1.5 font-bold uppercase tracking-widest px-2"
                    >
                      Limpiar
                    </Button>
                 </div>
               )}
            </CardContent>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto px-6 pb-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                    <TableHead className="w-[50px]">
                      <Checkbox 
                        checked={selectedIds.length === filteredExpenses.length && filteredExpenses.length > 0}
                        onChange={() => toggleSelectAll()}
                      />
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100">Fecha</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100">Proforma</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100">Estudio Jurídico</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100">Segmento</TableHead>
                    <TableHead className="font-bold text-slate-900 dark:text-slate-100">Motivo</TableHead>
                    <TableHead className="text-right font-bold text-slate-900 dark:text-slate-100">Monto</TableHead>
                    <TableHead className="text-center font-bold text-slate-900 dark:text-slate-100">Estado</TableHead>
                    <TableHead className="text-center font-bold text-slate-900 dark:text-slate-100">Docs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-24 text-muted-foreground">
                        <div className="flex flex-col items-center gap-4">
                           <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-full">
                              <CheckCircle2 className="w-12 h-12 text-emerald-500 opacity-30" />
                           </div>
                           <div className="space-y-1">
                              <p className="text-xl font-black text-slate-900 dark:text-slate-100">¡Bandeja vacía!</p>
                              <p className="text-sm font-medium">No hay gastos pendientes de autorización en este momento.</p>
                           </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((exp) => {
                      const firm = lawFirms.find((lf) => lf.id === exp.lawFirmId);
                      return (
                        <TableRow key={exp.id} className={cn(
                          "transition-all duration-200 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30",
                          selectedIds.includes(exp.id) ? "bg-indigo-50/70 dark:bg-indigo-900/20 border-indigo-200" : ""
                        )}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedIds.includes(exp.id)}
                              onChange={() => toggleSelectOne(exp.id)}
                            />
                          </TableCell>
                          <TableCell className="text-sm font-medium tabular-nums">{exp.date}</TableCell>
                          <TableCell className="text-sm font-black text-primary">#{exp.proformaNum}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: firm?.color }} />
                               <span className="text-sm font-bold">{firm?.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 border-slate-200 dark:border-slate-700">
                              {exp.segment === 'Personas' ? <Users className="w-3 h-3 mr-1" /> : <Briefcase className="w-3 h-3 mr-1" />}
                              {exp.segment}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-slate-600 dark:text-slate-400 italic break-words max-w-[200px]">
                             {exp.expenseType}
                          </TableCell>
                          <TableCell className="text-right font-black text-slate-950 dark:text-slate-50 text-base">{fmt(exp.amount)}</TableCell>
                          <TableCell className="text-center">
                             <StatusBadge status={exp.status} />
                          </TableCell>
                          <TableCell>
                             <div className="flex justify-center gap-1.5">
                                {exp.attachments.length > 0 ? exp.attachments.map(att => (
                                   <div key={att.id} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm hover:scale-110 transition-transform cursor-pointer">
                                      {att.type === 'pdf' ? <FileText className="w-4 h-4 text-red-500" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-500" />}
                                   </div>
                                )) : <span className="text-slate-400">—</span>}
                             </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden p-4 space-y-4">
              {filteredExpenses.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                   No hay autorizaciones pendientes.
                </div>
              ) : (
                filteredExpenses.map((exp) => {
                  const firm = lawFirms.find((lf) => lf.id === exp.lawFirmId);
                  return (
                    <Card key={exp.id} className={cn(
                      "border-border/60 transition-all",
                      selectedIds.includes(exp.id) && "border-indigo-500/50 ring-1 ring-indigo-500/20 bg-indigo-50/30"
                    )}>
                      <CardContent className="p-4 space-y-3">
                         <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                               <Checkbox 
                                 checked={selectedIds.includes(exp.id)}
                                 onChange={() => toggleSelectOne(exp.id)}
                               />
                               <div>
                                  <p className="text-xs font-black text-primary">#{exp.proformaNum}</p>
                                  <p className="text-[10px] text-muted-foreground">{exp.date}</p>
                               </div>
                            </div>
                            <StatusBadge status={exp.status} />
                         </div>

                         <div className="flex items-center gap-3 py-2 border-y border-slate-100 dark:border-slate-800/50">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${firm?.color || "#888"}15` }}
                              >
                                <Building2 className="w-4 h-4" style={{ color: firm?.color || "#888" }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-bold truncate">{firm?.name}</p>
                                 <div className="flex items-center gap-2 mt-0.5">
                                   <Badge variant="outline" className="text-[8px] h-3.5 px-1.5 py-0 border-slate-200">
                                     {exp.segment}
                                   </Badge>
                                   <span className="text-[10px] text-muted-foreground truncate">{exp.expenseType}</span>
                                 </div>
                              </div>
                         </div>

                         <div className="flex items-center justify-between">
                            <div className="flex gap-1.5">
                               {exp.attachments.map(att => (
                                  <div key={att.id} className="w-6 h-6 rounded-md bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                     {att.type === 'pdf' ? <FileText className="w-3 h-3 text-red-500" /> : <FileSpreadsheet className="w-3 h-3 text-emerald-500" />}
                                  </div>
                               ))}
                            </div>
                            <p className="text-base font-black text-slate-900 dark:text-slate-50">{fmt(exp.amount)}</p>
                         </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
