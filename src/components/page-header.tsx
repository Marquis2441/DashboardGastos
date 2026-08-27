"use client";

import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ExpenseFormDialog } from "@/components/expense-form-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
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
  const dismissedNotificationIds = useAppStore((s) => s.dismissedNotificationIds);
  const dismissNotifications = useAppStore((s) => s.dismissNotifications);

  const isDismissed = (id: string) => dismissedNotificationIds.includes(id);

  // Logic for specific notifications per role (cada una con un id único para poder marcarla como vista)
  const inProcessExpenses = (currentUser?.role === "ADMIN")
    ? expenses.filter(e => e.status === "En proceso de pago" && !isDismissed(`inproc-${e.id}`))
    : [];

  const billedExpenses = (currentUser?.role === "CCO")
    ? expenses.filter(e => e.status === "Facturado" && !isDismissed(`billed-${e.id}`))
    : [];

  const rejectedExpenses = (currentUser?.role === "ESTUDIO" && currentUser.lawFirmId)
    ? getExpensesByFirm(currentUser.lawFirmId).filter(e => e.status === "Rechazado" && !isDismissed(`rej-${e.id}`))
    : [];

  // Logic for OC limits (ADMIN/CCO)
  const lowOCFirms = (currentUser?.role === "ADMIN" || currentUser?.role === "CCO")
    ? lawFirms.filter(f => (f.ocConsumed / f.ocLimit) > 0.85 && !isDismissed(`lowoc-${f.id}`))
    : [];

  const notificationCount = (currentUser?.role === "ESTUDIO")
    ? rejectedExpenses.length
    : (currentUser?.role === "ADMIN")
      ? inProcessExpenses.length + lowOCFirms.length
      : (currentUser?.role === "CCO")
        ? billedExpenses.length + lowOCFirms.length
        : 0;

  const hasNotifications = notificationCount > 0;

  const handleNotificationClick = () => {
    const seenIds: string[] = [];

    if (currentUser?.role === "ESTUDIO") {
      if (rejectedExpenses.length > 0) {
        toast.error(`Tienes ${rejectedExpenses.length} gasto(s) rechazado(s)`, {
          description: "Por favor, revisa tus gastos rechazados y corrige los problemas.",
          duration: 5000,
        });
        seenIds.push(...rejectedExpenses.map(e => `rej-${e.id}`));
      } else {
        toast.info("No tienes notificaciones pendientes", {
          description: "Todos tus gastos están en orden."
        });
      }
      dismissNotifications(seenIds);
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
      seenIds.push(...inProcessExpenses.map(e => `inproc-${e.id}`));
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
      seenIds.push(...billedExpenses.map(e => `billed-${e.id}`));
    }

    if (lowOCFirms.length > 0) {
      lowOCFirms.forEach(firm => {
        const percent = Math.round((firm.ocConsumed / firm.ocLimit) * 100);
        toast.warning(`Alerta de OC: ${firm.name} ha consumido el ${percent}% de su límite.`, {
          description: "Se recomienda gestionar una nueva Orden de Compra pronto.",
          duration: 5000,
        });
      });
      seenIds.push(...lowOCFirms.map(f => `lowoc-${f.id}`));
    }

    if (!hasNotifications) {
      toast.info("No tienes notificaciones pendientes", {
        description: "Todo el sistema se encuentra al día."
      });
    }

    dismissNotifications(seenIds);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-background/90 backdrop-blur-md p-3 md:p-6 border-b border-border shadow-sm transition-colors gap-3 md:gap-0 sticky top-0 z-30">
      {/* Left: title only */}
      <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
        {/* Logo Crezcawebs - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2 group border-r border-border pr-4">
          <BrandLogo />
        </div>

        <div className="space-y-1 flex-1 md:flex-none">
          <h1 className="text-base md:text-xl font-light uppercase tracking-wide text-foreground leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground font-semibold uppercase tracking-widest text-[8px] md:text-[10px]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: every icon + avatar together */}
      <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-border">
        <div className="flex items-center gap-1.5 md:gap-2">
          <ThemeToggle className="h-8 w-8 md:h-9 md:w-9" />

          <button
            onClick={handleNotificationClick}
            title={hasNotifications ? "Notificaciones pendientes" : "Sin notificaciones"}
            className="relative h-8 w-8 md:h-9 md:w-9 rounded-lg bg-muted hover:bg-accent transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0"
          >
            <Bell className="w-4 h-4 md:w-[18px] md:h-[18px] text-foreground" />
            {hasNotifications && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-white text-[9px] font-bold leading-none flex items-center justify-center border-2 border-background">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {showUser && currentUser && (
            <div className="flex items-center gap-2 pl-1.5 md:pl-2">
              <Avatar className="w-8 h-8 md:w-9 md:h-9 border border-border">
                <AvatarFallback className="bg-muted text-[10px] md:text-xs text-foreground uppercase font-bold">
                  {currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-foreground leading-none">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter mt-0.5">
                  {currentUser.role === 'ADMIN' ? 'Admin' : currentUser.role === 'CCO' ? 'CCO' : 'Estudio'}
                </p>
              </div>
            </div>
          )}
        </div>

        {currentUser?.role !== "CCO" && (
          <div className="flex-1 md:flex-none flex justify-end">
            <ExpenseFormDialog />
          </div>
        )}
      </div>
    </div>
  );
}
