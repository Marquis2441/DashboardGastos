"use client";
import { useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-dvh relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-3 right-3 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-xl rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
        >
          {isOpen ? <X className="w-5 h-5 text-rose-500" /> : <Menu className="w-5 h-5 text-primary" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] transition-all animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <AppSidebar 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      
      <main className={cn(
        "flex-1 relative z-10 transition-all duration-300 flex flex-col min-h-dvh",
        isCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        <div className="p-0 w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
