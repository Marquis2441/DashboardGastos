"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExpenseSchema, type ExpenseFormValues } from "@/lib/schemas";
import { useAppStore } from "@/lib/store";
import type { Attachment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  Upload,
  FileText,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Controller } from "react-hook-form";

interface MockFile {
  id: string;
  name: string;
  type: "pdf" | "excel" | "other";
  size: number;
  progress: number;
}

export function ExpenseFormDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFirmId, setSelectedFirmId] = useState<string>("");
  const [mockFiles, setMockFiles] = useState<MockFile[]>([]);

  const lawFirms = useAppStore((s) => s.lawFirms);
  const addExpense = useAppStore((s) => s.addExpense);
  const currentUser = useAppStore((s) => s.currentUser);
  const getAvailableBalance = useAppStore((s) => s.getAvailableBalance);

  const availableBalance = selectedFirmId ? getAvailableBalance(selectedFirmId) : Infinity;

  const schema = createExpenseSchema(availableBalance);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      lawFirmId: "",
      proformaNum: 0,
      segment: undefined,
      expenseType: undefined,
      date: new Date().toISOString().split("T")[0],
      amount: undefined,
      description: "",
      status: "Ingresado",
    },
  });

  useEffect(() => {
    if (open && currentUser?.role === "ESTUDIO" && currentUser.lawFirmId) {
      setValue("lawFirmId", currentUser.lawFirmId);
      setSelectedFirmId(currentUser.lawFirmId);
    }
  }, [open, currentUser, setValue]);

  const currentAmount = watch("amount");

  // Simular upload de archivo
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const fileType = ext === "pdf" ? "pdf" : ext === "xlsx" || ext === "xls" ? "excel" : "other" as const;

      const mockFile: MockFile = {
        id: `f${Date.now()}-${Math.random()}`,
        name: file.name,
        type: fileType,
        size: file.size,
        progress: 0,
      };

      setMockFiles((prev) => [...prev, mockFile]);

      // Simular progreso de upload
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setMockFiles((prev) =>
          prev.map((f) => (f.id === mockFile.id ? { ...f, progress } : f))
        );
      }, 200);
    });

    // Reset input
    e.target.value = "";
  }, []);

  const removeFile = (fileId: string) => {
    setMockFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const onSubmit = async (data: ExpenseFormValues) => {
    if (!currentUser) return;
    setIsSubmitting(true);

    // Simular delay de red
    await new Promise((r) => setTimeout(r, 600));

    const attachments: Attachment[] = mockFiles
      .filter((f) => f.progress >= 100)
      .map((f) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        size: f.size,
        uploadedBy: currentUser.id,
        uploadedAt: new Date().toISOString(),
      }));

    addExpense({
      lawFirmId: data.lawFirmId,
      proformaNum: data.proformaNum,
      segment: data.segment,
      expenseType: data.expenseType,
      amount: data.amount,
      date: data.date,
      status: data.status,
      description: data.description,
      createdBy: currentUser.id,
      attachments,
    });

    const firmName = lawFirms.find((lf) => lf.id === data.lawFirmId)?.name;

    toast.success("¡Gasto registrado exitosamente! 🎉", {
      description: `$${data.amount.toLocaleString("es-AR")} — ${firmName} (${data.segment})`,
    });

    reset();
    setMockFiles([]);
    setSelectedFirmId("");
    setIsSubmitting(false);
    setOpen(false);
  };

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("es-AR")}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2 font-semibold cursor-pointer" />}>
          <Plus className="w-4 h-4" />
          Nuevo Gasto
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Registrar Gasto</DialogTitle>
          <DialogDescription>
            Ingresa los datos del gasto de recupero de cartera.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5 mt-4">
          {/* Estudio Jurídico */}
          <div className="space-y-2">
            <Label>Estudio Jurídico</Label>
            <Select
              value={selectedFirmId}
              disabled={currentUser?.role === "ESTUDIO"}
              onValueChange={(val: string | null) => {
                if (val) {
                  setValue("lawFirmId", val);
                  setSelectedFirmId(val);
                }
              }}
            >
              <SelectTrigger className={`h-11 ${currentUser?.role === "ESTUDIO" ? "bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed" : "cursor-pointer"}`}>
                <SelectValue>
                  {selectedFirmId ? lawFirms.find(f => f.id === selectedFirmId)?.name : "Seleccionar estudio..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[320px]">
                {lawFirms.map((lf) => (
                  <SelectItem key={lf.id} value={lf.id} className="cursor-pointer">
                    <span className="font-medium">{lf.name}</span>
                    <span className="ml-auto text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-bold whitespace-nowrap">
                      DISP: {formatCurrency(Math.max(0, (lf.ocLimit || 0) - (lf.ocConsumed || 0)))}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lawFirmId && (
              <p className="text-sm text-destructive animate-fade-in-up">{errors.lawFirmId.message}</p>
            )}
            {selectedFirmId && !isNaN(availableBalance) && availableBalance !== Infinity && (
              <div className="flex items-center gap-2 text-xs animate-fade-in-up">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, ((lawFirms.find(lf => lf.id === selectedFirmId)?.ocConsumed || 0) / (lawFirms.find(lf => lf.id === selectedFirmId)?.ocLimit || 1)) * 100)}%`,
                      backgroundColor:
                        ((lawFirms.find(lf => lf.id === selectedFirmId)?.ocConsumed || 0) / (lawFirms.find(lf => lf.id === selectedFirmId)?.ocLimit || 1)) > 0.85
                          ? "oklch(0.65 0.20 25)"
                          : "oklch(0.60 0.18 260)",
                    }}
                  />
                </div>
                <span className="text-slate-900 dark:text-slate-100 font-black text-sm tabular-nums">
                  {formatCurrency(availableBalance)} disponible
                </span>
              </div>
            )}
          </div>

          {/* Segmento + Motivo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Segmento</Label>
              <Select onValueChange={(val: string | null) => setValue("segment", val as "Personas" | "Empresas")}>
                <SelectTrigger className="h-11 cursor-pointer">
                  <SelectValue placeholder="Segmento..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personas" className="cursor-pointer">Personas</SelectItem>
                  <SelectItem value="Empresas" className="cursor-pointer">Empresas</SelectItem>
                </SelectContent>
              </Select>
              {errors.segment && (
                <p className="text-sm text-destructive animate-fade-in-up">{errors.segment.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Motivo</Label>
              <Select onValueChange={(val: string | null) => setValue("expenseType", val as "Tasa de Justicia" | "Honorarios" | "Inicios Judiciales")}>
                <SelectTrigger className="h-11 cursor-pointer">
                  <SelectValue placeholder="Motivo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tasa de Justicia" className="cursor-pointer">Tasa de Justicia</SelectItem>
                  <SelectItem value="Honorarios" className="cursor-pointer">Honorarios</SelectItem>
                  <SelectItem value="Inicios Judiciales" className="cursor-pointer">Inicios Judiciales</SelectItem>
                </SelectContent>
              </Select>
              {errors.expenseType && (
                <p className="text-sm text-destructive animate-fade-in-up">{errors.expenseType.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proforma">Nro Proforma</Label>
              <Input
                id="proforma"
                type="number"
                placeholder="Ej: 1234"
                {...register("proformaNum", { valueAsNumber: true })}
                className={`h-11 ${errors.proformaNum ? "border-destructive" : ""}`}
              />
              {errors.proformaNum && (
                <p className="text-sm text-destructive animate-fade-in-up">{errors.proformaNum.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Estado de Pago</Label>
              <Select defaultValue="Ingresado" onValueChange={(val: string | null) => setValue("status", val as any)}>
                <SelectTrigger className="h-11 cursor-pointer">
                  <SelectValue placeholder="Seleccionar estado..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ingresado" className="cursor-pointer">Ingresado</SelectItem>
                  <SelectItem value="En Proceso de Pago" className="cursor-pointer">En Proceso de Pago</SelectItem>
                  <SelectItem value="Pagado" className="cursor-pointer">Pagado</SelectItem>
                  <SelectItem value="Rechazado" className="cursor-pointer">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                className="h-11"
              />
              {errors.date && (
                <p className="text-sm text-destructive animate-fade-in-up">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Monto ($)</Label>
              <Controller
                name="amount"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <div className="relative">
                    <Input
                      {...field}
                      id="amount"
                      placeholder="$ 0,00"
                      className={`h-11 pl-4 font-bold tabular-nums text-lg ${errors.amount ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      value={value ? `$ ${value.toLocaleString("es-AR")}` : ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        const numeric = parseInt(val, 10) || 0;
                        onChange(numeric);
                      }}
                    />
                  </div>
                )}
              />
              {errors.amount && (
                <p className="text-[11px] text-destructive font-bold animate-fade-in-up mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.amount.message}
                </p>
              )}
              {currentAmount > 0 && !errors.amount && selectedFirmId && currentAmount <= availableBalance && (
                <p className="text-[11px] text-emerald-600 font-bold animate-fade-in-up mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Monto autorizado (dentro del saldo)
                </p>
              )}
              {currentAmount > availableBalance && selectedFirmId && (
                <p className="text-[11px] text-rose-500 font-bold animate-fade-in-up mt-1 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/30">
                  <X className="w-3.5 h-3.5" />
                  <span>
                    Excedido por <span className="underline">{formatCurrency(currentAmount - availableBalance)}</span>
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Input
              id="description"
              placeholder="Detalle del gasto..."
              {...register("description")}
              className="h-11"
            />
          </div>

          {/* Upload Zone */}
          <div className="space-y-3">
            <Label>Archivos adjuntos</Label>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
              <Upload className="w-6 h-6 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Arrastra archivos o <span className="text-primary font-medium">haz click</span>
              </span>
              <span className="text-xs text-muted-foreground/60 mt-1">PDF, Excel</span>
              <input
                type="file"
                accept=".pdf,.xlsx,.xls"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>

            {/* File list */}
            {mockFiles.length > 0 && (
              <div className="space-y-2 animate-fade-in-up">
                {mockFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    {file.type === "pdf" ? (
                      <FileText className="w-4 h-4 text-destructive shrink-0" />
                    ) : (
                      <FileSpreadsheet className="w-4 h-4 text-success shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{file.name}</p>
                      <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </div>
                    {file.progress >= 100 ? (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    ) : (
                      <span className="text-xs text-muted-foreground">{Math.round(file.progress)}%</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Registrar Gasto
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
