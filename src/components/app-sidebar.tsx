"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
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
  Asterisk,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
      "fixed left-0 top-0 z-40 h-dvh transition-all duration-300 ease-in-out flex flex-col border-r border-sidebar-border lg:translate-x-0 bg-sidebar text-sidebar-foreground",
      isCollapsed ? "w-20" : "w-[85vw] lg:w-64",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Collapse Toggle - Only visible on desktop */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-5 w-6 h-6 items-center justify-center bg-sidebar border border-sidebar-border rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all z-50 shadow-sm"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Brand */}
      <div className={cn(
        "h-16 shrink-0 transition-all duration-300 flex items-center justify-center",
        isCollapsed ? "px-2" : "px-6"
      )}>
        {isCollapsed ? (
          <span className="text-base font-black tracking-tighter text-sidebar-foreground uppercase">
            RA
          </span>
        ) : (
          <span className="text-base font-black tracking-tighter text-sidebar-foreground uppercase flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
            <Asterisk className="w-4 h-4 shrink-0" strokeWidth={3} />
            RA <span className="font-light text-muted-foreground text-sm tracking-normal">Gastos</span>
          </span>
        )}
      </div>

      <div className="px-4 mb-2">
        <div className="h-px bg-sidebar-border w-full" />
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 custom-scrollbar space-y-6">
        {/* Main Section */}
        <section className="space-y-1">
          {!isCollapsed && (
            <h3 className="px-6 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2">
              Main
            </h3>
          )}
          <div className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen?.(false)}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer relative",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}>
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2">{item.label}</span>}

                    {isCollapsed && (
                      <div className="absolute left-14 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
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
            <h3 className="px-6 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2">
              Settings
            </h3>
          )}
          <div className="px-3 space-y-1">
            <Link href="/settings">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-foreground relative text-muted-foreground">
                <Settings className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2">Configuración</span>}
                {isCollapsed && (
                  <div className="absolute left-14 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                    Configuración
                  </div>
                )}
              </div>
            </Link>
          </div>
        </section>
      </div>

      {/* Footer Role Switcher & Actions */}
      <div className="p-4 mt-auto border-t border-sidebar-border">
        {!isCollapsed && (
          <div className="mb-4 space-y-2">
            <h3 className="px-2 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-2 flex items-center gap-2">
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
                    "text-[9px] font-semibold py-1.5 px-2 rounded-md border transition-all truncate uppercase tracking-tighter",
                    currentUser?.role === r
                      ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-primary"
                      : "bg-transparent text-muted-foreground border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-foreground relative text-muted-foreground">
            <HelpCircle className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Ayuda</span>}
            {isCollapsed && (
              <div className="absolute left-14 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                Ayuda
              </div>
            )}
          </button>

          <button
            onClick={handleLogout}
            className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer relative",
            "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          )}>
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Cerrar Sesión</span>}
            {isCollapsed && (
              <div className="absolute left-14 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                Cerrar Sesión
              </div>
            )}
          </button>
        </div>

        {!isCollapsed && (
          <div className="mt-4 px-2 text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-widest">
            <span>v0.1.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}

