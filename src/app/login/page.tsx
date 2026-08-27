"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/schemas";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, Lock, Asterisk } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const login = useAppStore((s) => s.login);
  const [isLoading, setIsLoading] = useState(false);

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
    await new Promise((r) => setTimeout(r, 800));
    const success = login(data.email, data.password);
    if (success) {
      toast.success("¡Bienvenido!", { description: "Sesión iniciada correctamente 🎉" });
    } else {
      toast.error("La contraseña o el nombre de usuario es inválido");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-background font-sans animate-in fade-in duration-700">

      {/* Left Column - Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center items-center p-8 bg-background z-10">

        <div className="w-full max-w-[380px] flex flex-col">

          {/* Logo Area */}
          <div className="flex items-center gap-1.5 mb-16 justify-center lg:justify-start">
            <Asterisk className="w-7 h-7 text-foreground shrink-0" strokeWidth={3} />
            <span className="text-2xl font-black tracking-tighter text-foreground uppercase">
              RA <span className="font-light text-muted-foreground text-base tracking-normal">Gastos</span>
            </span>
          </div>

          <h1 className="text-[28px] font-bold text-foreground mb-2 tracking-tight">
            Bienvenido!
          </h1>
          <p className="text-[13px] text-muted-foreground mb-10 font-medium">
            Por favor ingrese los datos solicitados a continuación.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" autoComplete="off">
            <div className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                  Correo electrónico
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="text"
                    autoComplete="new-password"
                    {...register("email")}
                    className="h-[46px] bg-muted border-transparent rounded-lg px-4 text-sm text-foreground focus:bg-background focus:border-ring/50 focus:ring-4 focus:ring-ring/10 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                </div>
                {errors.email && (
                  <p className="text-[10px] text-destructive font-medium ml-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                  Contraseña
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    {...register("password")}
                    className="h-[46px] bg-muted border-transparent rounded-lg px-4 pr-10 text-sm text-foreground focus:bg-background focus:border-ring/50 focus:ring-4 focus:ring-ring/10 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
                {errors.password && (
                  <p className="text-[10px] text-destructive font-medium ml-1">{errors.password.message}</p>
                )}
              </div>

            </div>

            <Button
              type="submit"
              className="w-full h-[46px] font-medium rounded-lg transition-all text-sm shadow-md mt-4"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Ingresar"
              )}
            </Button>

            <div className="pt-2">
              <button type="button" className="text-foreground hover:text-muted-foreground text-[12px] font-medium transition-colors cursor-pointer">
                ¿Olvidaste la contraseña?
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* Right Column - Image */}
      <div className="hidden lg:block lg:w-[55%] xl:w-[60%] relative overflow-hidden bg-slate-100">
        <Image
          src="/login-bg-v2.png"
          alt="Corporate Building Background"
          fill
          className="object-cover object-center animate-in fade-in zoom-in-95 duration-1000"
          priority
        />
        {/* Subtle overlay to enhance contrast if needed */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>

    </div>
  );
}
