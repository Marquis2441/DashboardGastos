"use client";

import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { User, Shield, Briefcase, Glasses } from "lucide-react";
import { toast } from "sonner";
import { Role } from "@/lib/types";

export function DevRoleSwitcher() {
  const { currentUser, switchRole } = useAppStore();

  const handleRoleSwitch = (role: Role) => {
    switchRole(role);
    toast.success(`Rol cambiado a ${role}`, {
      description: "Vista de UI actualizada",
    });
  };

  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentUser) return null;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-2xl border border-slate-200 dark:border-slate-800 p-2 rounded-2xl flex flex-col gap-2 font-roboto font-bold animate-fade-in-up transition-all duration-300",
      !isExpanded && "w-10 h-10 p-0 items-center justify-center overflow-hidden rounded-full cursor-pointer hover:scale-110"
    )}
    onClick={() => !isExpanded && setIsExpanded(true)}
    >
      {!isExpanded ? (
        <Shield className="w-5 h-5 text-primary" />
      ) : (
        <>
          <div className="text-[10px] text-slate-500 uppercase tracking-widest px-2 pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Dev Tools</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
              className="text-[8px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Ocultar
            </button>
          </div>
          <div className="flex flex-col xs:flex-row gap-2 p-1">
            <Button
              variant={currentUser.role === "ADMIN" ? "default" : "outline"}
              size="sm"
              className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3 rounded-xl cursor-pointer"
              onClick={(e) => { e.stopPropagation(); handleRoleSwitch("ADMIN"); }}
            >
              Admin
            </Button>
            <Button
              variant={currentUser.role === "ESTUDIO" ? "default" : "outline"}
              size="sm"
              className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3 rounded-xl cursor-pointer"
              onClick={(e) => { e.stopPropagation(); handleRoleSwitch("ESTUDIO"); }}
            >
              Estudio
            </Button>
            <Button
              variant={currentUser.role === "CCO" ? "default" : "outline"}
              size="sm"
              className="text-[10px] md:text-xs h-7 md:h-8 px-2 md:px-3 rounded-xl cursor-pointer"
              onClick={(e) => { e.stopPropagation(); handleRoleSwitch("CCO"); }}
            >
              CCO
            </Button>
          </div>
          <p className="text-[9px] text-center text-slate-400 mt-1">
            Click fuera para colapsar
          </p>
        </>
      )}
    </div>
  );
}

import { useState } from "react";
import { cn } from "@/lib/utils";
