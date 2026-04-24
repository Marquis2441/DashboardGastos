"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { useAppStore } from "@/lib/store";
import LoginPage from "./login/page";
import { DevRoleSwitcher } from "@/components/dev-role-switcher";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useAppStore((s) => s.currentUser);

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased min-h-screen">
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
