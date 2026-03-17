"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { useAppStore } from "@/lib/store";
import LoginPage from "./login/page";
import { DevRoleSwitcher } from "@/components/dev-role-switcher";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useAppStore((s) => s.currentUser);

  return (
    <html lang="es" className="light">
      <body className="antialiased min-h-screen">
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 3000,
            style: { borderRadius: "12px" },
          }}
        />
        {currentUser ? (
          <>
            {children}
            <DevRoleSwitcher />
          </>
        ) : (
          <LoginPage />
        )}
      </body>
    </html>
  );
}
