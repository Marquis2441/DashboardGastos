"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Building2,
  Receipt,
  LogOut,
  Landmark,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const BASE_NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/estudios", label: "Estudios", icon: Building2 },
  { href: "/gastos", label: "Gastos", icon: Receipt },
  { href: "/mediciones", label: "Mediciones", icon: BarChart3 },
];

export function AppSidebar() {
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
    return BASE_NAV_ITEMS;
  };

  const navItems = getNavItems();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col shadow-sm font-roboto">
      {/* Logo */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
            <Landmark className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-sf font-bold text-sm text-slate-800 tracking-tight">
              Control de Gastos
            </h1>
            <p className="text-[10px] text-primary/70 font-bold tracking-widest">Recupero de Activos</p>
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-4" />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer font-roboto group",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:translate-x-1 hover:scale-[1.02]"
                )}
              >
                <item.icon className={cn("w-4 h-4 shadow-sm", isActive && "text-primary")} />
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1 h-4 rounded-full bg-primary animate-pulse-subtle" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User Section */}
      <div className="p-6 mt-auto">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-10 h-10 border-2 border-primary/20">
              <AvatarFallback className="text-xs font-bold text-primary bg-primary/10">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {currentUser?.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate uppercase tracking-tighter font-bold">
                {currentUser?.role === "ADMIN" ? "Administrador" : currentUser?.role === "CCO" ? "CCO (Aprobador)" : "Estudio"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-slate-500 hover:text-white hover:bg-destructive/80 cursor-pointer rounded-xl transition-all font-bold"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </div>
      </div>

    </aside>
  );
}
