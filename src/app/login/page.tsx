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
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ["latin"], weight: ["800", "900"] });

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
    defaultValues: { email: "", password: "" },
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1e1e24] font-sans">
      
      <div className="w-full max-w-[400px] bg-white rounded-xl shadow-2xl p-8 md:p-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Logo and Titles */}
        <div className="flex flex-col items-center mb-8 w-full">
          <div className="flex flex-col items-center mb-6 w-full justify-center">
            <span className={`${montserrat.className} text-[24px] sm:text-[28px] leading-none font-black tracking-tighter text-slate-900 uppercase text-center whitespace-nowrap`}>
              RECUPERO DE ACTIVOS
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome
          </h1>
          <p className="text-sm text-slate-600 text-center font-medium">
            Log in to continue to Recupero de Activos.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            
            <div className="relative group">
              <Input
                id="email"
                type="text"
                placeholder="Email address*"
                {...register("email")}
                className="h-12 bg-white border-2 border-slate-200 rounded-sm px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-0 transition-all font-sans shadow-sm"
              />
              {errors.email && (
                <p className="text-[10px] text-rose-500 font-medium mt-1 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="relative group">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password*"
                {...register("password")}
                className="h-12 bg-white border-2 border-slate-200 rounded-sm px-4 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-0 transition-all font-sans shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none p-1"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              {errors.password && (
                <p className="text-[10px] text-rose-500 font-medium mt-1 ml-1">{errors.password.message}</p>
              )}
            </div>

          </div>

          <div className="pt-3 pb-3 w-full text-center">
            <button type="button" className="text-blue-600 hover:text-blue-800 text-[14px] font-bold transition-colors cursor-pointer">
              Reset password
            </button>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-[#334b65] hover:bg-[#233549] text-white font-semibold rounded-sm transition-all font-sans text-sm shadow-sm tracking-wide uppercase" 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Continue"
            )}
          </Button>
        </form>

      </div>
    </div>
  );
}
