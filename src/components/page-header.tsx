"use client";

import { Building2, Bell, CheckCircle2, XCircle, FileDown, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ExpenseFormDialog } from "@/components/expense-form-dialog";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { BrandLogo } from "./brand-logo";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showUser?: boolean;
}

export function PageHeader({ title, subtitle, showUser = false }: PageHeaderProps) {
  const currentUser = useAppStore((s) => s.currentUser);
  const expenses = useAppStore((s) => s.expenses);
  const getExpensesByFirm = useAppStore((s) => s.getExpensesByFirm);
  const lawFirms = useAppStore((s) => s.lawFirms);
  
  // Logic for specific notifications per role
  const inProcessExpenses = (currentUser?.role === "ADMIN")
    ? expenses.filter(e => e.status === "En Proceso de Pago")
    : [];

  const billedExpenses = (currentUser?.role === "CCO")
    ? expenses.filter(e => e.status === "Facturado")
    : [];

  const rejectedExpenses = (currentUser?.role === "ESTUDIO" && currentUser.lawFirmId)
    ? getExpensesByFirm(currentUser.lawFirmId).filter(e => e.status === "Rechazado")
    : [];
  
  // Logic for OC limits (ADMIN/CCO)
  const lowOCFirms = (currentUser?.role === "ADMIN" || currentUser?.role === "CCO")
    ? lawFirms.filter(f => (f.ocConsumed / f.ocLimit) > 0.85)
    : [];

  const hasNotifications = (currentUser?.role === "ESTUDIO") 
    ? rejectedExpenses.length > 0 
    : (currentUser?.role === "ADMIN")
      ? (inProcessExpenses.length > 0 || lowOCFirms.length > 0)
      : (currentUser?.role === "CCO")
        ? (billedExpenses.length > 0 || lowOCFirms.length > 0)
        : false;

  const handleNotificationClick = () => {
    if (currentUser?.role === "ESTUDIO") {
      if (rejectedExpenses.length > 0) {
        toast.error(`Tienes ${rejectedExpenses.length} gasto(s) rechazado(s)`, {
          description: "Por favor, revisa tus gastos rechazados y corrige los problemas.",
          duration: 5000,
        });
      } else {
        toast.info("No tienes notificaciones pendientes", {
          description: "Todos tus gastos están en orden."
        });
      }
      return;
    }

    if (currentUser?.role === "ADMIN" && inProcessExpenses.length > 0) {
      // Group by firm to inform which study
      const byFirm: Record<string, number> = {};
      inProcessExpenses.forEach(e => {
        const firmName = lawFirms.find(f => f.id === e.lawFirmId)?.name || "Estudio desconocido";
        byFirm[firmName] = (byFirm[firmName] || 0) + 1;
      });

      Object.entries(byFirm).forEach(([firm, count]) => {
        toast.info(`ADMIN: ${count} gastos "En proceso de pago"`, {
          description: `Del estudio: ${firm}`,
          duration: 6000,
        });
      });
    }

    if (currentUser?.role === "CCO" && billedExpenses.length > 0) {
      const byFirm: Record<string, number> = {};
      billedExpenses.forEach(e => {
        const firmName = lawFirms.find(f => f.id === e.lawFirmId)?.name || "Estudio desconocido";
        byFirm[firmName] = (byFirm[firmName] || 0) + 1;
      });

      Object.entries(byFirm).forEach(([firm, count]) => {
        toast.success(`CCO: ${count} gastos "Facturados"`, {
          description: `Del estudio: ${firm}`,
          duration: 6000,
        });
      });
    }

    if (lowOCFirms.length > 0) {
      lowOCFirms.forEach(firm => {
        const percent = Math.round((firm.ocConsumed / firm.ocLimit) * 100);
        toast.warning(`Alerta de OC: ${firm.name} ha consumido el ${percent}% de su límite.`, {
          description: "Se recomienda gestionar una nueva Orden de Compra pronto.",
          duration: 5000,
        });
      });
    }

    if (!hasNotifications) {
      toast.info("No tienes notificaciones pendientes", {
        description: "Todo el sistema se encuentra al día."
      });
    }
  };
  
  return (
    <div className="flex items-center justify-between bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-slate-200 shadow-sm font-roboto">
      <div className="flex items-center gap-6">
        {/* Logo Crezcawebs */}
        <div className="flex items-center gap-2 group border-r border-slate-200 pr-6">
          <BrandLogo />
          <div className="text-xl tracking-tighter">
            <span className="font-extrabold text-slate-950">crezca</span>
            <span className="font-light text-primary">webs</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none font-sf">
              {title}
            </h1>
            <button 
              onClick={handleNotificationClick}
              title={hasNotifications ? "Alertas de OC pendientes" : "Sin notificaciones"}
              className="relative p-1.5 rounded-xl hover:bg-slate-100 transition-all duration-300 group flex items-center justify-center cursor-pointer overflow-visible hover:-translate-y-0.5 hover:scale-110 active:scale-95 active:translate-y-0.5"
            >
              <Bell className={`w-5 h-5 transition-colors duration-200 ${hasNotifications ? "text-amber-500 fill-amber-50" : "text-slate-400 group-hover:text-primary"}`} />
              {hasNotifications && (
                <>
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm z-10" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping opacity-75" />
                </>
              )}
            </button>
          </div>
          {subtitle && (
            <p className="text-primary/80 font-bold uppercase tracking-widest text-[10px] leading-none">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {showUser && currentUser && (
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold">{currentUser.role === 'ADMIN' ? 'Admin' : currentUser.role === 'CCO' ? 'CCO' : 'Estudio'}</p>
            </div>
            <Avatar className="w-10 h-10 border-2 border-primary/10">
              <AvatarFallback className="bg-primary/5 text-primary uppercase">
                {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
        {currentUser?.role !== "CCO" && <ExpenseFormDialog />}
      </div>
    </div>
  );
}
