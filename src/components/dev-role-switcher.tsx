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

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] bg-white/90 backdrop-blur shadow-2xl border border-slate-200 p-3 rounded-2xl flex flex-col gap-2 font-roboto font-bold animate-fade-in-up">
      <div className="text-[10px] text-slate-500 uppercase tracking-widest px-2 pb-1 border-b border-slate-100 flex items-center justify-between">
        <span>Dev Tools</span>
        <span className="text-primary font-black ml-4">
          Actual: {currentUser.role}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant={currentUser.role === "ADMIN" ? "default" : "outline"}
          size="sm"
          className="text-xs h-8 px-3 rounded-xl cursor-pointer"
          onClick={() => handleRoleSwitch("ADMIN")}
        >
          <Shield className="w-3 h-3 mr-1.5" />
          Admin
        </Button>
        <Button
          variant={currentUser.role === "ESTUDIO" ? "default" : "outline"}
          size="sm"
          className="text-xs h-8 px-3 rounded-xl cursor-pointer"
          onClick={() => handleRoleSwitch("ESTUDIO")}
        >
          <Briefcase className="w-3 h-3 mr-1.5" />
          Estudio
        </Button>
        <Button
          variant={currentUser.role === "CCO" ? "default" : "outline"}
          size="sm"
          className="text-xs h-8 px-3 rounded-xl cursor-pointer"
          onClick={() => handleRoleSwitch("CCO")}
        >
          <Glasses className="w-3 h-3 mr-1.5" />
          CCO
        </Button>
      </div>
    </div>
  );
}
