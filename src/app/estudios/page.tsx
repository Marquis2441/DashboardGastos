"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, ArrowUpRight, Mail, ChevronRight, Users, Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";

export default function EstudiosPage() {
  const lawFirms = useAppStore((s) => s.lawFirms);
  const expenses = useAppStore((s) => s.expenses);
  const [expandedFirms, setExpandedFirms] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedFirms(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const fmt = (val: number) => `$${val.toLocaleString("es-AR")}`;

  return (
    <AppShell>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <PageHeader 
          title="Estudios Jurídicos"
          subtitle="Gestión de proveedores y control de Órdenes de Compra"
          showUser
        />

        <div className="p-4 md:p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto w-full">
          {/* Desktop Table View */}
          <Card className="hidden lg:block border-border/50 shadow-sm overflow-hidden bg-white dark:bg-slate-900/50">
              <CardContent className="p-0">
                <div className="overflow-x-auto rounded-xl">
                  <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-border/50">
                      <TableHead className="pl-6 py-4">Estudio</TableHead>
                      <TableHead className="text-right py-4">Límite OC</TableHead>
                      <TableHead className="text-right py-4">Consumido</TableHead>
                      <TableHead className="text-right py-4 font-black">Disponible</TableHead>
                      <TableHead className="text-center py-4">Uso</TableHead>
                      <TableHead className="text-center py-4">Gastos</TableHead>
                      <TableHead className="text-right pr-6 py-4">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lawFirms.map((firm) => {
                      const firmExpenses = expenses.filter((e) => e.lawFirmId === firm.id);
                      const available = firm.ocLimit - firm.ocConsumed;
                      const percent = (firm.ocConsumed / firm.ocLimit) * 100;
                      const isHighUsage = percent > 85;

                      const personasExpenses = firmExpenses.filter(e => e.segment === "Personas");
                      const empresasExpenses = firmExpenses.filter(e => e.segment === "Empresas");

                      const personasConsumed = personasExpenses.reduce((acc, e) => acc + e.amount, 0);
                      const empresasConsumed = empresasExpenses.reduce((acc, e) => acc + e.amount, 0);

                      const isExpanded = expandedFirms.includes(firm.id);

                      return (
                        <React.Fragment key={firm.id}>
                          <TableRow 
                            className={cn(
                              "group cursor-pointer transition-colors border-b border-border/40",
                              isExpanded ? "bg-primary/[0.03]" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                            )}
                            onClick={() => toggleExpand(firm.id)}
                          >
                            <TableCell className="pl-6">
                              <div className="flex items-center gap-3">
                                <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform duration-200", isExpanded && "rotate-90 text-primary")} />
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 dark:border-slate-800"
                                  style={{ backgroundColor: `${firm.color}15` }}
                                >
                                  <Building2 className="w-5 h-5" style={{ color: firm.color }} />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-slate-100">{firm.name}</p>
                                  <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                                    <Mail className="w-3 h-3" />
                                    {firm.contactEmail}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-slate-500 tabular-nums">{fmt(firm.ocLimit)}</TableCell>
                            <TableCell className="text-right font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                              {fmt(firm.ocConsumed)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={cn("font-black tabular-nums", isHighUsage ? "text-rose-600" : "text-emerald-600")}>
                                {fmt(available)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 justify-center">
                                <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                                  <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                      width: `${percent}%`,
                                      backgroundColor: isHighUsage ? "oklch(0.65 0.20 25)" : firm.color,
                                    }}
                                  />
                                </div>
                                <span className={cn(
                                  "text-[10px] font-black w-8 text-right",
                                  isHighUsage ? "text-rose-600" : "text-slate-500"
                                )}>
                                  {percent.toFixed(0)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none px-2.5 font-bold">
                                {firmExpenses.length}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Link href={`/estudios/${firm.id}`} onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-8 gap-1.5 cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all font-bold text-xs">
                                  Detalle
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                          
                          {/* Sub-detalle por Segmento */}
                          {isExpanded && (
                            <TableRow className="bg-slate-50/40 dark:bg-slate-900/40 border-l-4 border-l-primary/30">
                              <TableCell colSpan={7} className="py-8 px-12">
                                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                  {/* Personas Breakdown */}
                                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                          <Users className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                          <p className="font-black text-slate-800 dark:text-slate-100 uppercase text-xs tracking-tight">Retail</p>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Segmento</p>
                                        </div>
                                      </div>
                                      <Badge className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-none px-2.5 py-0.5 font-black">{personasExpenses.length} Op</Badge>
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                      {[
                                        { label: "Honorarios", amount: personasExpenses.filter(e => e.expenseType === "Honorarios").reduce((a, b) => a + b.amount, 0), icon: <ArrowUpRight className="w-3 h-3" /> },
                                        { label: "Tasas Justicia", amount: personasExpenses.filter(e => e.expenseType === "Tasa de Justicia").reduce((a, b) => a + b.amount, 0), icon: <ArrowUpRight className="w-3 h-3" /> },
                                        { label: "Inicios Jud.", amount: personasExpenses.filter(e => e.expenseType === "Inicios Judiciales").reduce((a, b) => a + b.amount, 0), icon: <ArrowUpRight className="w-3 h-3" /> },
                                      ].map((item) => (
                                        <div key={item.label} className="flex flex-col gap-1.5">
                                          <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">{item.icon} {item.label}</span>
                                            <span className="font-black text-slate-900 dark:text-slate-100 tabular-nums">{fmt(item.amount)}</span>
                                          </div>
                                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${(item.amount / Math.max(1, personasConsumed)) * 100}%` }} />
                                          </div>
                                        </div>
                                      ))}
                                      <div className="flex justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800 font-black text-blue-600 dark:text-blue-400">
                                        <span className="uppercase tracking-widest">Monto Total</span>
                                        <span className="text-sm">{fmt(personasConsumed)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Empresas Breakdown */}
                                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                          <Building2 className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                          <p className="font-black text-slate-800 dark:text-slate-100 uppercase text-xs tracking-tight">Corp</p>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Segmento</p>
                                        </div>
                                      </div>
                                      <Badge className="bg-indigo-50 dark:bg-indigo-00/20 text-indigo-600 dark:text-indigo-400 border-none px-2.5 py-0.5 font-black">{empresasExpenses.length} Op</Badge>
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                      {[
                                        { label: "Honorarios", amount: empresasExpenses.filter(e => e.expenseType === "Honorarios").reduce((a, b) => a + b.amount, 0), icon: <ArrowUpRight className="w-3 h-3" /> },
                                        { label: "Tasas Justicia", amount: empresasExpenses.filter(e => e.expenseType === "Tasa de Justicia").reduce((a, b) => a + b.amount, 0), icon: <ArrowUpRight className="w-3 h-3" /> },
                                        { label: "Inicios Jud.", amount: empresasExpenses.filter(e => e.expenseType === "Inicios Judiciales").reduce((a, b) => a + b.amount, 0), icon: <ArrowUpRight className="w-3 h-3" /> },
                                      ].map((item) => (
                                        <div key={item.label} className="flex flex-col gap-1.5">
                                          <div className="flex justify-between items-center text-[10px]">
                                            <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">{item.icon} {item.label}</span>
                                            <span className="font-black text-slate-900 dark:text-slate-100 tabular-nums">{fmt(item.amount)}</span>
                                          </div>
                                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${(item.amount / Math.max(1, empresasConsumed)) * 100}%` }} />
                                          </div>
                                        </div>
                                      ))}
                                      <div className="flex justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800 font-black text-indigo-600 dark:text-indigo-400">
                                        <span className="uppercase tracking-widest">Monto Total</span>
                                        <span className="text-sm">{fmt(empresasConsumed)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Donut Chart */}
                                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center relative">
                                    <p className="absolute top-5 left-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mix de Segmentos</p>
                                    <div className="w-full h-[180px] mt-4">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                          <Pie
                                            data={[
                                              { name: "Retail", value: personasConsumed },
                                              { name: "Corp", value: empresasConsumed }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={75}
                                            paddingAngle={8}
                                            dataKey="value"
                                          >
                                            <Cell fill="#3b82f6" strokeWidth={0} />
                                            <Cell fill="#6366f1" strokeWidth={0} />
                                          </Pie>
                                          <RechartsTooltip 
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', fontSize: '11px', fontWeight: 'bold' }}
                                            formatter={(value: any) => fmt(Number(value))}
                                          />
                                        </PieChart>
                                      </ResponsiveContainer>
                                    </div>
                                    <div className="flex gap-6 mt-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Retail</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Corp</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Bar Chart */}
                                  <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative overflow-hidden">
                                    <p className="absolute top-5 left-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribución por Tipo</p>
                                    <div className="w-full h-[200px] mt-10">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                          data={[
                                            {
                                              name: "Honor.",
                                              Retail: personasExpenses.filter(e => e.expenseType === "Honorarios").reduce((a, b) => a + b.amount, 0),
                                              Corp: empresasExpenses.filter(e => e.expenseType === "Honorarios").reduce((a, b) => a + b.amount, 0),
                                            },
                                            {
                                              name: "Tasas",
                                              Retail: personasExpenses.filter(e => e.expenseType === "Tasa de Justicia").reduce((a, b) => a + b.amount, 0),
                                              Corp: empresasExpenses.filter(e => e.expenseType === "Tasa de Justicia").reduce((a, b) => a + b.amount, 0),
                                            },
                                            {
                                              name: "Inicios",
                                              Retail: personasExpenses.filter(e => e.expenseType === "Inicios Judiciales").reduce((a, b) => a + b.amount, 0),
                                              Corp: empresasExpenses.filter(e => e.expenseType === "Inicios Judiciales").reduce((a, b) => a + b.amount, 0),
                                            },
                                          ]}
                                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                                          barGap={6}
                                        >
                                          <XAxis 
                                            dataKey="name" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} 
                                          />
                                          <YAxis hide />
                                          <RechartsTooltip 
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', fontSize: '11px', fontWeight: 'bold' }}
                                            formatter={(value: any) => fmt(Number(value))}
                                          />
                                          <Bar dataKey="Retail" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={10} />
                                          <Bar dataKey="Corp" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={10} />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>

          {/* Mobile Studios List */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
             {lawFirms.map((firm) => {
                const available = firm.ocLimit - firm.ocConsumed;
                const percent = (firm.ocConsumed / firm.ocLimit) * 100;
                const isHighUsage = percent > 85;
                const isExpanded = expandedFirms.includes(firm.id);

                return (
                   <Card key={firm.id} className={cn(
                     "border-border/60 overflow-hidden transition-all shadow-sm",
                     isExpanded && "ring-1 ring-primary/20 border-primary/40 bg-primary/[0.02]"
                   )}>
                      <CardContent className="p-4 space-y-4">
                         <div 
                           className="flex items-center justify-between cursor-pointer"
                           onClick={() => toggleExpand(firm.id)}
                         >
                            <div className="flex items-center gap-3">
                               <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800"
                                  style={{ backgroundColor: `${firm.color}15` }}
                                >
                                  <Building2 className="w-5 h-5" style={{ color: firm.color }} />
                                </div>
                                <div>
                                   <p className="text-sm font-bold">{firm.name}</p>
                                   <p className="text-[10px] text-muted-foreground font-medium">{firm.contactEmail}</p>
                                </div>
                            </div>
                            <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", isExpanded && "rotate-90 text-primary")} />
                         </div>

                         <div className="space-y-2 py-2">
                            <div className="flex justify-between items-end">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uso de OC</span>
                               <span className={cn("text-xs font-black", isHighUsage ? "text-rose-600" : "text-slate-600")}>
                                 {percent.toFixed(0)}%
                               </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                               <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{
                                    width: `${percent}%`,
                                    backgroundColor: isHighUsage ? "oklch(0.65 0.20 25)" : firm.color,
                                  }}
                                />
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4 py-1">
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Disponible</p>
                               <p className={cn("text-sm font-black tabular-nums", isHighUsage ? "text-rose-600" : "text-emerald-600")}>
                                 {fmt(available)}
                               </p>
                            </div>
                            <div className="text-right">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Límite</p>
                               <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                                 {fmt(firm.ocLimit)}
                               </p>
                            </div>
                         </div>

                         {isExpanded && (
                            <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800/50 animate-in fade-in slide-in-from-top-1">
                               <Link href={`/estudios/${firm.id}`} className="w-full">
                                 <Button variant="outline" className="w-full h-10 gap-2 font-black text-[10px] uppercase tracking-widest border-slate-200 dark:border-slate-700 hover:bg-primary/5 hover:border-primary/20 hover:text-primary transition-all">
                                   Ver Detalle Completo
                                   <ArrowUpRight className="w-3.5 h-3.5" />
                                 </Button>
                               </Link>
                            </div>
                         )}
                      </CardContent>
                   </Card>
                );
             })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
