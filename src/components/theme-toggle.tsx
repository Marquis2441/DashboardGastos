"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon-sm" className={cn("rounded-xl", className)} disabled>
        <div className="w-4 h-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(
        "rounded-xl transition-all duration-500 relative overflow-hidden group/toggle",
        "bg-slate-100 hover:bg-primary/10 text-slate-600 hover:text-primary dark:bg-slate-800 dark:hover:bg-primary/20 dark:text-slate-400 dark:hover:text-primary-foreground",
        className
      )}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
      </div>
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
