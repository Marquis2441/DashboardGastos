"use client";
import { useState } from "react";
import { AppSidebar } from "./app-sidebar";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen relative overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-lg rounded-xl"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm transition-all"
          onClick={() => setIsOpen(false)}
        />
      )}

      <AppSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      
      <main className="flex-1 lg:ml-64 relative z-10 overflow-y-auto w-full">
        <div className="p-4 md:p-6 lg:p-8 max-w-screen-xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
