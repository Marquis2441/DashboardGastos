"use client";

import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/app-shell";
import { ExpenseFormDialog } from "@/components/expense-form-dialog";
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
import { Building2, ArrowUpRight, Mail, ChevronRight, Users } from "lucide-react";
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
  Legend as RechartsLegend
} from "recharts";

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

        {/* Table */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="overflow-x-auto rounded-xl">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudio</TableHead>
                  <TableHead className="text-right">Límite OC</TableHead>
                  <TableHead className="text-right">Consumido</TableHead>
                  <TableHead className="text-right">Disponible</TableHead>
                  <TableHead className="text-center">Uso</TableHead>
                  <TableHead className="text-center">Gastos</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
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
                        className={`group cursor-pointer transition-colors ${isExpanded ? "bg-slate-50/80" : "hover:bg-slate-50/50"}`}
                        onClick={() => toggleExpand(firm.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-90 text-primary" : ""}`} />
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                              style={{ backgroundColor: `${firm.color}20` }}
                            >
                              <Building2 className="w-4 h-4" style={{ color: firm.color }} />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{firm.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {firm.contactEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-slate-600">{fmt(firm.ocLimit)}</TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-slate-900">{fmt(firm.ocConsumed)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${isHighUsage ? "text-destructive" : "text-emerald-500"}`}>
                            {fmt(available)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${percent}%`,
                                  backgroundColor: isHighUsage ? "oklch(0.65 0.20 25)" : firm.color,
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 w-10 text-right">
                              {percent.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-2.5">
                            {firmExpenses.length}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/estudios/${firm.id}`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="gap-1 cursor-pointer hover:bg-white hover:text-primary hover:shadow-sm border border-transparent hover:border-slate-200 transition-all">
                              Detalle
                              <ArrowUpRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                      
                      {/* Sub-detalle por Segmento */}
                      {isExpanded && (
                        <TableRow className="bg-slate-50/40 border-l-4 border-l-primary/30">
                          <TableCell colSpan={7} className="py-6 px-12">
                            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                              {/* Personas Breakdown */}
                              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                      <Users className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-800">Retail</p>
                                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Personas</p>
                                    </div>
                                  </div>
                                  <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-2.5 py-0.5">{personasExpenses.length} op</Badge>
                                </div>
                                <div className="space-y-3 pt-3 border-t border-slate-50">
                                  {[
                                    { label: "Honorarios", amount: personasExpenses.filter(e => e.expenseType === "Honorarios").reduce((a, b) => a + b.amount, 0), icon: <ArrowUpRight className="w-3 h-3 text-slate-400" /> },
                                    { label: "Tasas Justicia", amount: personasExpenses.filter(e => e.expenseType === "Tasa de Justicia").reduce((a, b) => a + b.amount, 0), icon: <ArrowUpRight className="w-3 h-3 text-slate-400" /> },
                                    { label: "Inicios Jud.", amount: personasExpenses.filter(e => e.expenseType === "Inicios Judiciales").reduce((a, b) => a + b.amount, 0), icon: <ArrowUpRight className="w-3 h-3 text-slate-400" /> },
                                  ].map((item) => (
                                    <div key={item.label} className="flex flex-col gap-1 px-1">
                                      <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500 font-medium flex items-center gap-1">{item.icon} {item.label}</span>
                                        <span className="font-bold text-slate-900">{fmt(item.amount)}</span>
                                      </div>
                                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-400 opacity-60 rounded-full" style={{ width: `${(item.amount / Math.max(1, personasConsumed)) * 100}%` }} />
                                      </div>
                                    </div>
                                  ))}
                                  <div className="flex justify-between text-xs pt-2 border-t border-slate-50 font-black text-blue-600">
                                    <span>TOTAL RETAIL</span>
                                    <span>{fmt(personasConsumed)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Empresas Breakdown */}
                              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                      <Building2 className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-800">Corp</p>
                                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Empresas</p>
                                    </div>
                                  </div>
                                  <Badge className="bg-indigo-50 text-indigo-600 border-indigo-100 px-2.5 py-0.5">{empresasExpenses.length} op</Badge>
                                </div>
                                <div className="space-y-3 pt-3 border-t border-slate-50">
                                  {[
                                    { label: "Honorarios", amount: empresasExpenses.filter(e => e.expenseType === "Honorarios").reduce((a, b) => a + b.amount, 0), icon: <ArrowUpRight className="w-3 h-3 text-slate-400" /> },
                                    { label: "Tasas Justicia", amount: empresasExpenses.filter(e => e.expenseType === "Tasa de Justicia").reduce((a, b) => a + b.amount, 0), icon: <ArrowUpRight className="w-3 h-3 text-slate-400" /> },
                                    { label: "Inicios Jud.", amount: empresasExpenses.filter(e => e.expenseType === "Inicios Judiciales").reduce((a, b) => a + b.amount, 0), icon: <ArrowUpRight className="w-3 h-3 text-slate-400" /> },
                                  ].map((item) => (
                                    <div key={item.label} className="flex flex-col gap-1 px-1">
                                      <div className="flex justify-between text-[11px]">
                                        <span className="text-slate-500 font-medium flex items-center gap-1">{item.icon} {item.label}</span>
                                        <span className="font-bold text-slate-900">{fmt(item.amount)}</span>
                                      </div>
                                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-400 opacity-60 rounded-full" style={{ width: `${(item.amount / Math.max(1, empresasConsumed)) * 100}%` }} />
                                      </div>
                                    </div>
                                  ))}
                                  <div className="flex justify-between text-xs pt-2 border-t border-slate-50 font-black text-indigo-600">
                                    <span>TOTAL CORP</span>
                                    <span>{fmt(empresasConsumed)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Donut Chart: Segment Overall */}
                              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative hover:shadow-md transition-shadow">
                                <p className="absolute top-4 left-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mix de Segmentos</p>
                                <div className="w-full h-[160px] mt-4">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie
                                        data={[
                                          { name: "Retail", value: personasConsumed },
                                          { name: "Corp", value: empresasConsumed }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={65}
                                        paddingAngle={8}
                                        dataKey="value"
                                      >
                                        <Cell fill="#3b82f6" strokeWidth={0} />
                                        <Cell fill="#6366f1" strokeWidth={0} />
                                      </Pie>
                                      <RechartsTooltip 
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontSize: '11px' }}
                                        formatter={(value: any) => fmt(Number(value))}
                                      />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="flex gap-4 mt-2">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Retail</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Corp</span>
                                  </div>
                                </div>
                              </div>

                              {/* Grouped Bar Chart: Types by Segment */}
                              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col relative hover:shadow-md transition-shadow overflow-hidden">
                                <p className="absolute top-4 left-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gastos por Tipo y Segmento</p>
                                <div className="w-full h-[180px] mt-8">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                      data={[
                                        {
                                          name: "Honorarios",
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
                                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                      barGap={4}
                                    >
                                      <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                                      />
                                      <YAxis hide />
                                      <RechartsTooltip 
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', fontSize: '11px' }}
                                        formatter={(value: any) => fmt(Number(value))}
                                      />
                                      <Bar dataKey="Retail" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={12} />
                                      <Bar dataKey="Corp" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={12} />
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
      </div>
    </AppShell>
  );
}
