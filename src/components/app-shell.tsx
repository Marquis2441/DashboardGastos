"use client";

import { AppSidebar } from "./app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen relative overflow-hidden bg-slate-100">
      
      <AppSidebar />
      <main className="flex-1 ml-64 relative z-10 overflow-y-auto">

        <div className="p-6 lg:p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
