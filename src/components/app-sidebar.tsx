"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Building2,
  Receipt,
  LogOut,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Glasses,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ThemeToggle } from "./theme-toggle";
import { Role } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/estudios", label: "Estudios", icon: Building2 },
  { href: "/gastos", label: "Gastos", icon: Receipt },
  { href: "/mediciones", label: "Mediciones", icon: BarChart3 },
];

interface AppSidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function AppSidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }: AppSidebarProps) {
  const pathname = usePathname();
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    toast.info("Sesión cerrada", { description: "Hasta pronto 👋" });
  };

  const initials = currentUser?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2) || "??";

  const getNavItems = () => {
    if (currentUser?.role === "ESTUDIO") {
      return [{ href: "/gastos", label: "Mis Gastos", icon: Receipt }];
    }
    if (currentUser?.role === "ANALISTA") {
      return [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/estudios", label: "Estudios", icon: Building2 },
        { href: "/gastos", label: "Gastos", icon: Receipt },
        { href: "/mediciones", label: "Mediciones", icon: BarChart3 },
      ];
    }
    if (currentUser?.role === "ADMIN") {
      return [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/estudios", label: "Estudios", icon: Building2 },
        { href: "/gastos", label: "Gastos", icon: Receipt },
        { href: "/autorizaciones", label: "Autorizaciones", icon: ShieldCheck },
        { href: "/mediciones", label: "Mediciones", icon: BarChart3 },
      ];
    }
    return NAV_ITEMS;
  };

  const navItems = getNavItems();

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-dvh transition-all duration-300 ease-in-out flex flex-col font-roboto border-r border-slate-800 lg:translate-x-0 bg-[#0c0e12] text-slate-400",
      isCollapsed ? "w-20" : "w-[85vw] lg:w-64",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Collapse Toggle - Only visible on desktop */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-10 w-6 h-6 items-center justify-center bg-[#1a1c23] border border-slate-700 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition-all z-50 shadow-lg"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* User Header */}
      <div className={cn(
        "p-6 mb-4 transition-all duration-300 flex items-center gap-3",
        isCollapsed ? "justify-center px-2" : "px-6"
      )}>
        <div className="relative group shrink-0">
          <Avatar className={cn(
            "border-2 border-slate-800 transition-all ring-2 ring-primary/20",
            isCollapsed ? "w-10 h-10" : "w-12 h-12"
          )}>
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id}`} />
            <AvatarFallback className="bg-slate-800 text-slate-300">{initials}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0c0e12] rounded-full" />
        </div>
        
        {!isCollapsed && (
          <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">
              {currentUser?.role === "ANALISTA" ? "Analista Riesgo" : currentUser?.role === "CCO" ? "CCO (Aprobador)" : currentUser?.role === "ADMIN" ? "Admin" : "Gestor Estudio"}
            </p>
            <h2 className="text-sm font-black text-slate-100 tracking-tight">
              {currentUser?.name}
            </h2>
          </div>
        )}
      </div>

      <div className="px-4 mb-2">
        <div className="h-[1px] bg-slate-800/50 w-full" />
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar space-y-6">
        {/* Main Section */}
        <section className="space-y-1">
          {!isCollapsed && (
            <h3 className="px-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">
              Main
            </h3>
          )}
          <div className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen?.(false)}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group cursor-pointer relative",
                    isActive 
                      ? "bg-[#1a1c23] text-primary shadow-sm" 
                      : "hover:bg-[#1a1c23]/50 hover:text-slate-100"
                  )}>
                    <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300")} />
                    {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2">{item.label}</span>}
                    
                    {isActive && isCollapsed && (
                      <div className="absolute right-0 w-1 h-6 bg-primary rounded-l-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    )}
                    
                    {isCollapsed && (
                      <div className="absolute left-14 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-700">
                        {item.label}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Settings Section */}
        <section className="space-y-1">
          {!isCollapsed && (
            <h3 className="px-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">
              Settings
            </h3>
          )}
          <div className="px-3 space-y-1">
            <Link href="/settings">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group cursor-pointer hover:bg-[#1a1c23]/50 hover:text-slate-100 relative text-slate-500">
                <Settings className="w-5 h-5 shrink-0 group-hover:text-slate-300" />
                {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2">Configuración</span>}
                {isCollapsed && (
                  <div className="absolute left-14 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-700">
                    Configuración
                  </div>
                )}
              </div>
            </Link>
          </div>
        </section>
      </div>

      {/* Footer Role Switcher & Actions */}
      <div className="p-4 mt-auto border-t border-slate-800/50 bg-[#0c0e12]">
        {!isCollapsed && (
          <div className="mb-4 space-y-2">
            <h3 className="px-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Glasses className="w-3 h-3" /> Modo Desarrollo
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(["ANALISTA", "ESTUDIO", "CCO", "ADMIN"] as Role[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    useAppStore.getState().switchRole(r);
                    toast.success(`Rol cambiado a ${r}`);
                  }}
                  className={cn(
                    "text-[9px] font-bold py-1.5 px-2 rounded-lg border transition-all truncate uppercase tracking-tighter",
                    currentUser?.role === r 
                      ? "bg-primary/20 text-primary border-primary/50" 
                      : "bg-slate-800/50 text-slate-500 border-slate-700/50 hover:bg-slate-800 hover:text-slate-300"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group cursor-pointer hover:bg-[#1a1c23]/50 hover:text-slate-100 relative text-slate-500">
            <HelpCircle className="w-5 h-5 shrink-0 group-hover:text-slate-300" />
            {!isCollapsed && <span>Ayuda</span>}
            {isCollapsed && (
              <div className="absolute left-14 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-slate-700">
                Ayuda
              </div>
            )}
          </button>
          
          <button 
            onClick={handleLogout}
            className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group cursor-pointer relative",
            "text-rose-500/80 hover:bg-rose-500/10 hover:text-rose-400"
          )}>
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Cerrar Sesión</span>}
            {isCollapsed && (
              <div className="absolute left-14 bg-rose-500 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                Cerrar Sesión
              </div>
            )}
          </button>
        </div>
        
        {!isCollapsed && (
          <div className="mt-4 flex items-center justify-between px-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            <ThemeToggle className="h-8 w-8 text-slate-500 hover:text-white" />
            <span>v0.1.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}

