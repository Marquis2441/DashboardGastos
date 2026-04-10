"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/schemas";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Loader2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const login = useAppStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "marcos@banco.com", password: "admin123" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    // Simular latencia de red
    await new Promise((r) => setTimeout(r, 800));
    const success = login(data.email, data.password);
    if (success) {
      toast.success("¡Bienvenido!", { description: "Sesión iniciada correctamente 🎉" });
    } else {
      toast.error("Credenciales inválidas", { description: "Verifica tu email y contraseña." });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden font-sans bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      {/* Navigation Header */}
      <header className="relative z-20 flex items-center justify-between p-6 lg:px-12 bg-transparent">
        <div className="flex items-center gap-2 group cursor-pointer">
          <BrandLogo />
          <div className="text-2xl tracking-tighter font-roboto">
            <span className="font-extrabold text-slate-950 dark:text-slate-100">crezca</span>
            <span className="font-light text-primary">webs</span>
          </div>
        </div>
        <nav className="flex items-center gap-4 md:gap-8 text-slate-600 dark:text-slate-400 font-bold font-roboto text-xs uppercase tracking-widest">
          <button className="hidden md:block hover:text-primary transition-colors cursor-pointer">Home</button>
          <button className="hidden md:block hover:text-primary transition-colors cursor-pointer">Servicios</button>
          <button className="px-5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-all text-slate-900 dark:text-slate-100 cursor-pointer">
            Soporte
          </button>
          <ThemeToggle />
        </nav>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/4 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-700" />

        <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row relative z-10 border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-700">
          
          {/* Left Section: Decorative Image */}
          <div className="hidden md:block w-5/12 relative overflow-hidden">
            <img 
              src="/login-decorative.png" 
              alt="Premium Design" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-60" />
            
            <div className="absolute inset-0 p-12 flex flex-col justify-end text-white">
              <div className="space-y-2 translate-y-0 group">
                <h2 className="text-4xl font-black leading-tight tracking-tight font-roboto mb-2">
                  Welcome<br />back!
                </h2>
                <p className="text-white/80 text-sm font-medium max-w-[200px]">
                  Gestioná tus gastos financieros con la plataforma más avanzada del mercado.
                </p>
                <div className="pt-6">
                  <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-2/3 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Login Form */}
          <div className="flex-1 p-8 lg:p-14 bg-white dark:bg-slate-900">
            <div className="max-w-sm mx-auto space-y-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight font-roboto">
                  Iniciar Sesión
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  Ingresá tus credenciales para acceder al panel.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-500 text-[10px] uppercase tracking-widest font-black ml-1">
                    Email Corporativo
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      type="email"
                      placeholder="nombre@empresa.com"
                      {...register("email")}
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-roboto border-2"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1 ml-1">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-slate-500 text-[10px] uppercase tracking-widest font-black">
                      Contraseña
                    </Label>
                    <button type="button" className="text-primary text-[10px] uppercase tracking-widest font-black hover:underline transition-all">
                      ¿Olvidaste tu clave?
                    </button>
                  </div>
                  <div className="relative group">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 pr-12 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-roboto border-2"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1 ml-1">{errors.password.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] font-roboto cursor-pointer text-sm" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "INGRESAR AL PANEL"
                  )}
                </Button>

                <div className="relative pt-4 text-center">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                  </div>
                  <span className="relative z-10 px-4 bg-white dark:bg-slate-900 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    O continuar con
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <button 
                      key={i} 
                      type="button"
                      className="flex items-center justify-center h-12 border-2 border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group"
                    >
                      <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full group-hover:bg-primary/20 transition-colors" />
                    </button>
                  ))}
                </div>
              </form>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                Al iniciar sesión, aceptas nuestros <span className="underline cursor-pointer">Términos de Servicio</span> y <span className="underline cursor-pointer">Política de Privacidad</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
