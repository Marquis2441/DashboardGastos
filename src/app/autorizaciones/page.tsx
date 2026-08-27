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
          <div className="p-4 bg-destructive/10 rounded-full">
            <ShieldCheck className="w-12 h-12 text-destructive opacity-40" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Acceso Denegado</h1>
            <p className="text-muted-foreground">Solo administradores o CCO pueden gestionar autorizaciones.</p>
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
             <Card className="bg-card border-border shadow-sm border rounded-md">
                <CardContent className="p-4">
                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                         <Clock className="w-4 h-4 text-warning" />
                      </div>
                      <div>
                         <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Pendientes</p>
                         <p className="text-xl font-bold text-foreground">{pendingExpenses.length}</p>
                      </div>
                   </div>
                </CardContent>
             </Card>
             <Card className="bg-card border-border shadow-sm border rounded-md md:col-span-2">
                <CardContent className="p-4">
                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                         <ShieldCheck className="w-4 h-4 text-foreground" />
                      </div>
                      <div>
                         <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Monto a Autorizar</p>
                         <p className="text-xl font-bold text-foreground tabular-nums font-mono">{fmt(totalFiltered)}</p>
                      </div>
                   </div>
                </CardContent>
             </Card>
             <div className="flex items-center">
                <Button
                  onClick={handleBulkAuthorize}
                  disabled={selectedIds.length === 0}
                  className="w-full h-12 text-sm font-semibold gap-2 transition-all disabled:opacity-30 rounded-md"
                >
                   <ShieldCheck className="w-4 h-4" />
                   Autorizar {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
                </Button>
             </div>
          </div>

          <Card className="border-border shadow-sm overflow-hidden bg-card rounded-md">
            <CardContent className="p-4 space-y-4">
               {/* Toolbar */}
               <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por estudio, proforma..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 bg-muted/40 border-border rounded-lg transition-all"
                    />
                  </div>
                  <Button
                    variant={showFilters ? "secondary" : "outline"}
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "h-10 px-4 gap-2 font-medium rounded-lg transition-all text-xs",
                      showFilters && "bg-accent text-foreground"
                    )}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Filtros
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-300", showFilters && "rotate-180")} />
                  </Button>
               </div>

               {/* Collapsible Filters */}
               {showFilters && (
                 <div className="flex flex-wrap items-end gap-x-6 gap-y-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-0.5">Estudio</span>
                      <Select
                        value={filterFirm === "all" ? "" : filterFirm}
                        onValueChange={(val: string | null) => setFilterFirm(val || "all")}
                      >
                        <SelectTrigger className="h-9 w-[220px] cursor-pointer bg-background rounded-lg border-border">
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
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-0.5">Segmento</span>
                      <Select
                        value={filterSegment === "all" ? "" : filterSegment}
                        onValueChange={(val: string | null) => setFilterSegment(val || "all")}
                      >
                        <SelectTrigger className="h-9 w-[220px] cursor-pointer bg-background rounded-lg border-border">
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Todos los segmentos" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="" className="cursor-pointer">Todos los segmentos</SelectItem>
                          <SelectItem value="Personas" className="cursor-pointer">Personas</SelectItem>
                          <SelectItem value="Empresas" className="cursor-pointer">Empresas</SelectItem>
                          <SelectItem value="Retail" className="cursor-pointer">Retail</SelectItem>
                          <SelectItem value="Canales Indirectos" className="cursor-pointer">Canales Indirectos</SelectItem>
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
                      className="h-9 mb-0.5 text-[10px] text-muted-foreground hover:text-destructive gap-1.5 font-bold uppercase tracking-widest px-2"
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
                  <TableRow className="bg-muted/50 border-b border-border">
                    <TableHead className="w-[50px]">
                      <Checkbox 
                        checked={selectedIds.length === filteredExpenses.length && filteredExpenses.length > 0}
                        onChange={() => toggleSelectAll()}
                      />
                    </TableHead>
                    <TableHead className="font-bold text-foreground">Fecha</TableHead>
                    <TableHead className="font-bold text-foreground">Proforma</TableHead>
                    <TableHead className="font-bold text-foreground">Estudio Jurídico</TableHead>
                    <TableHead className="font-bold text-foreground">Segmento</TableHead>
                    <TableHead className="font-bold text-foreground">Motivo</TableHead>
                    <TableHead className="text-right font-bold text-foreground">Monto</TableHead>
                    <TableHead className="text-center font-bold text-foreground">Estado</TableHead>
                    <TableHead className="text-center font-bold text-foreground">Docs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-24 text-muted-foreground">
                        <div className="flex flex-col items-center gap-4">
                           <div className="p-6 bg-success/10 rounded-full">
                              <CheckCircle2 className="w-12 h-12 text-success opacity-60" />
                           </div>
                           <div className="space-y-1">
                              <p className="text-xl font-bold text-foreground">¡Bandeja vacía!</p>
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
                          "transition-all duration-200 border-b border-border hover:bg-muted/40",
                          selectedIds.includes(exp.id) ? "bg-accent/60" : ""
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
                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 border-border">
                              {exp.segment === 'Personas' ? <Users className="w-3 h-3 mr-1" /> : exp.segment === 'Empresas' ? <Briefcase className="w-3 h-3 mr-1" /> : <Building2 className="w-3 h-3 mr-1" />}
                              {exp.segment}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-muted-foreground italic break-words max-w-[200px]">
                             {exp.expenseType}
                          </TableCell>
                          <TableCell className="text-right font-black text-foreground text-base">{fmt(exp.amount)}</TableCell>
                          <TableCell className="text-center">
                             <StatusBadge status={exp.status} />
                          </TableCell>
                          <TableCell>
                             <div className="flex justify-center gap-1.5">
                                {exp.attachments.length > 0 ? exp.attachments.map(att => (
                                   <div key={att.id} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center border border-border shadow-sm hover:scale-110 transition-transform cursor-pointer">
                                      {att.type === 'pdf' ? <FileText className="w-4 h-4 text-red-500" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-500" />}
                                   </div>
                                )) : <span className="text-muted-foreground">—</span>}
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
                      selectedIds.includes(exp.id) && "border-foreground/30 ring-1 ring-foreground/10 bg-accent/40"
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

                         <div className="flex items-center gap-3 py-2 border-y border-border">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${firm?.color || "#888"}15` }}
                              >
                                <Building2 className="w-4 h-4" style={{ color: firm?.color || "#888" }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="text-sm font-bold truncate">{firm?.name}</p>
                                 <div className="flex items-center gap-2 mt-0.5">
                                   <Badge variant="outline" className="text-[8px] h-3.5 px-1.5 py-0 border-border">
                                     {exp.segment}
                                   </Badge>
                                   <span className="text-[10px] text-muted-foreground truncate">{exp.expenseType}</span>
                                 </div>
                              </div>
                         </div>

                         <div className="flex items-center justify-between">
                            <div className="flex gap-1.5">
                               {exp.attachments.map(att => (
                                  <div key={att.id} className="w-6 h-6 rounded-md bg-muted flex items-center justify-center border border-border">
                                     {att.type === 'pdf' ? <FileText className="w-3 h-3 text-red-500" /> : <FileSpreadsheet className="w-3 h-3 text-emerald-500" />}
                                  </div>
                               ))}
                            </div>
                            <p className="text-base font-black text-foreground">{fmt(exp.amount)}</p>
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
