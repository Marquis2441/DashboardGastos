"use client";

import "./globals.css";
import { Toaster, toast } from "sonner";
import { useAppStore } from "@/lib/store";
import LoginPage from "./login/page";
import { DevRoleSwitcher } from "@/components/dev-role-switcher";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter, JetBrains_Mono } from "next/font/google";

import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const codeMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    if (!currentUser) return;
    
    let timeoutId: NodeJS.Timeout;
    
    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 10 minutos de inactividad = 600000 ms
      timeoutId = setTimeout(() => {
        logout();
        toast.info("Sesión expirada", { description: "Por seguridad hemos cerrado tu sesión por inactividad." });
      }, 600000);
    };

    resetTimer();
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((e) => document.addEventListener(e, resetTimer, { passive: true }));

    return () => {
      clearTimeout(timeoutId);
      events.forEach((e) => document.removeEventListener(e, resetTimer));
    };
  }, [currentUser, logout]);

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.variable} ${codeMono.variable} antialiased min-h-screen font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
            children
          ) : (
            <LoginPage />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
