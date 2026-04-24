"use client";

import { useAppStore } from "@/lib/store";
import type { PaymentStatus, AuditEntry } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  History,
  ArrowRight,
  FileDown,
  ShieldCheck,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { icon: React.ElementType; className: string; label?: string }> = {
  Ingresado: {
    icon: Clock,
    className: "bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/25",
  },
  "A facturar": {
    icon: FileDown,
    className: "bg-purple-500/15 text-purple-400 border-purple-500/20 hover:bg-purple-500/25",
  },
  Facturado: {
    icon: CheckCircle2,
    className: "bg-indigo-500/15 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/25",
  },
  "Ingresado Analista": {
    icon: ShieldCheck,
    label: "Ingresado",
    className: "bg-blue-600/15 text-blue-600 border-blue-600/20 hover:bg-blue-600/25",
  },
  "En proceso de pago": {
    icon: Loader2,
    className: "bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/25",
  },
  Pagado: {
    icon: CheckCircle2,
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25",
  },
  Rechazado: {
    icon: XCircle,
    className: "bg-red-500/15 text-red-400 border-red-500/20 hover:bg-red-500/25",
  },
  // Legacy mappings for stability
  "En Proceso de Pago": {
    icon: Loader2,
    label: "En proceso de pago",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/20 hover:bg-amber-500/25",
  } as any,
  "Autorizado": {
    icon: ShieldCheck,
    label: "Aprobado",
    className: "bg-indigo-500/15 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/25",
  } as any,
};

const FALLBACK_CONFIG = {
  icon: Clock,
  className: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  label: "Desconocido",
};

const ALL_STATUSES: PaymentStatus[] = [
  "Ingresado",
  "A facturar",
  "Facturado",
  "Ingresado Analista",
  "En proceso de pago",
  "Pagado",
  "Rechazado",
];

interface PaymentStatusDropdownProps {
  expenseId: string;
  currentStatus: PaymentStatus;
  auditTrail: AuditEntry[];
}

export function PaymentStatusDropdown({
  expenseId,
  currentStatus,
  auditTrail,
}: PaymentStatusDropdownProps) {
  const updateExpenseStatus = useAppStore((s) => s.updateExpenseStatus);
  const addAttachment = useAppStore((s) => s.addAttachment);
  const currentUser = useAppStore((s) => s.currentUser);

  const config = (STATUS_CONFIG as any)[currentStatus] || FALLBACK_CONFIG;
  const Icon = config.icon;
  const label = config.label || currentStatus;

  const handleStatusChange = (newStatus: PaymentStatus) => {
    if (newStatus === currentStatus) return;
    updateExpenseStatus(expenseId, newStatus);
    toast.success(`¡Estado actualizado! 🎉`, {
      description: `Ahora el gasto está "${STATUS_CONFIG[newStatus].label || newStatus}"`,
    });
  };

  const simulateFileUpload = () => {
    const newAttachment = {
      id: `a${Date.now()}`,
      name: `factura_proforma_${Math.floor(Math.random() * 1000)}.pdf`,
      type: "pdf" as const,
      size: 150000,
      uploadedBy: currentUser?.id || "u0",
      uploadedAt: new Date().toISOString(),
    };
    addAttachment(expenseId, newAttachment);
    toast.success("Factura adjuntada correctamente");
    handleStatusChange("Facturado");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<button className="focus:outline-none cursor-pointer" />}>
          <Badge
            variant="outline"
            className={`${config.className} gap-1.5 text-xs font-bold py-1 px-3 cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95`}
          >
            <Icon className={`w-3.5 h-3.5 ${currentStatus === "En proceso de pago" ? "animate-spin" : ""}`} />
            {label}
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
          </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            Gestión de Estados (Rol: {currentUser?.role})
          </DropdownMenuLabel>
          <div className="space-y-1 mb-2">
            {ALL_STATUSES
              .filter(status => {
                if (currentUser?.role === "ESTUDIO") {
                  return ["Ingresado", "A facturar", "Facturado", "En proceso de pago"].includes(status);
                }
                return true;
              })
              .map((status) => {
                const statusCfg = (STATUS_CONFIG as any)[status] || FALLBACK_CONFIG;
                const StatusIcon = statusCfg.icon;
                const isActive = status === currentStatus;
              
              // RBAC Logic
              let isOptionDisabled = true;
              if (currentUser?.role === "ADMIN") isOptionDisabled = false;
              
              if (currentUser?.role === "ESTUDIO") {
                if (status === "Facturado" && currentStatus === "A facturar") isOptionDisabled = false;
              }

              if (currentUser?.role === "ANALISTA") {
                if (status === "A facturar" && currentStatus === "Ingresado") isOptionDisabled = false;
                if (status === "Ingresado Analista" && currentStatus === "Facturado") isOptionDisabled = false;
                if (status === "Rechazado") isOptionDisabled = false;
              }

              if (currentUser?.role === "CCO") {
                if (status === "En proceso de pago" && currentStatus === "Ingresado Analista") isOptionDisabled = false;
                if (status === "Pagado" && (currentStatus === "En proceso de pago" || currentStatus === "Ingresado Analista")) isOptionDisabled = false;
              }

              if (isActive) isOptionDisabled = true;

              return (
                <DropdownMenuItem
                  key={status}
                  onClick={() => !isOptionDisabled && handleStatusChange(status)}
                  className={`gap-2 cursor-pointer rounded-lg ${isActive ? "bg-primary/5 text-primary border-primary/10 border" : ""} ${isOptionDisabled ? "opacity-30 cursor-not-allowed" : ""}`}
                  disabled={isOptionDisabled}
                >
                  <div className={`p-1 rounded-md ${isActive ? "bg-primary/10" : "bg-slate-100"}`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <span className={isActive ? "font-bold" : "text-slate-600"}>{statusCfg.label || status}</span>
                  {isActive && <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold">actual</span>}
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuGroup>
        
        {currentUser?.role === "ESTUDIO" && currentStatus === "A facturar" && (
           <>
            <DropdownMenuSeparator className="-mx-2" />
            <div className="p-2">
              <button 
                onClick={simulateFileUpload}
                className="w-full h-9 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer border border-primary/20"
              >
                <FileDown className="w-3.5 h-3.5" />
                Adjuntar Factura y Facturar
              </button>
            </div>
           </>
        )}

        <DropdownMenuSeparator className="-mx-2" />
        
        <div className="pt-2 px-1">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
            <History className="w-3 h-3" />
            Historial Transaccional
          </div>
          <div className="space-y-3 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
            {auditTrail.slice().reverse().map((entry, idx) => (
              <div key={entry.id} className="relative pl-3 border-l border-slate-100 space-y-0.5">
                <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-slate-200" />
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-900">{entry.userName}</span>
                  <span className="text-slate-400">{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  {entry.action === "Creado" ? (
                    <span className="text-emerald-500 font-bold">Registro inicial</span>
                  ) : entry.action === "Archivo adjuntado" ? (
                    <span className="text-blue-500 font-mediumitalic">Subió: {entry.newValue}</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="line-through opacity-50">{STATUS_CONFIG[entry.previousValue as PaymentStatus]?.label || entry.previousValue}</span>
                      <ArrowRight className="w-2 h-2" />
                      <span className="font-bold text-primary">{STATUS_CONFIG[entry.newValue as PaymentStatus]?.label || entry.newValue}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function StatusBadge({ status }: { status: PaymentStatus }) {
  const config = (STATUS_CONFIG as any)[status] || FALLBACK_CONFIG;
  const Icon = config.icon;
  const label = config.label || status;
  return (
    <Badge
      variant="outline"
      className={`${config.className} gap-1.5 text-xs font-medium py-1 px-2.5`}
    >
      <Icon className={`w-3 h-3 ${status === "En proceso de pago" ? "animate-spin" : ""}`} />
      {label}
    </Badge>
  );
}
