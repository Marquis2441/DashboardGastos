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
import {
  Plus,
  Loader2,
  Upload,
  FileText,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  PartyPopper,
  Clock,
} from "lucide-react";
import { Controller } from "react-hook-form";

interface MockFile {
  id: string;
  name: string;
  type: "pdf" | "excel" | "other";
  size: number;
  progress: number;
}

type Step = "form" | "confirm" | "success";

export function ExpenseFormDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFirmId, setSelectedFirmId] = useState<string>("");
  const [mockFiles, setMockFiles] = useState<MockFile[]>([]);
  const [pendingData, setPendingData] = useState<ExpenseFormValues | null>(null);
  const [registeredSummary, setRegisteredSummary] = useState<{ amount: number; firmName: string; segment: string } | null>(null);

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
      // Un estudio solo puede cargar gastos en "Ingresado": el analista es quien
      // valida y da el OK para pasar a "A facturar" (control fiscal/documental).
      setValue("status", "Ingresado");
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

  // Paso 1: validar el formulario y pasar a la pantalla de confirmación
  const onSubmit = (data: ExpenseFormValues) => {
    setPendingData(data);
    setStep("confirm");
  };

  // Paso 2: el usuario confirma -> recién ahí se registra el gasto
  const handleConfirm = async () => {
    if (!currentUser || !pendingData) return;
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
      lawFirmId: pendingData.lawFirmId,
      proformaNum: pendingData.proformaNum,
      segment: pendingData.segment,
      expenseType: pendingData.expenseType,
      amount: pendingData.amount,
      date: pendingData.date,
      status: pendingData.status,
      description: pendingData.description,
      createdBy: currentUser.id,
      attachments,
    });

    const firmName = lawFirms.find((lf) => lf.id === pendingData.lawFirmId)?.name || "";

    setRegisteredSummary({ amount: pendingData.amount, firmName, segment: pendingData.segment });
    setIsSubmitting(false);
    setStep("success");
  };

  // Volver a editar el formulario desde la confirmación
  const handleBackToForm = () => setStep("form");

  const resetAll = () => {
    reset();
    setMockFiles([]);
    setSelectedFirmId("");
    setPendingData(null);
    setRegisteredSummary(null);
    setIsSubmitting(false);
    setStep("form");
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetAll();
  };

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("es-AR")}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="gap-2 font-semibold cursor-pointer" />}>
          <Plus className="w-4 h-4" />
          Nuevo Gasto
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[96vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {step === "form" ? "Registrar Gasto" : step === "confirm" ? "Confirmar registro" : "¡Gasto registrado!"}
          </DialogTitle>
          <DialogDescription>
            {step === "form"
              ? "Ingresa los datos del gasto de recupero de cartera."
              : step === "confirm"
              ? "Revisá los datos antes de confirmar. Esta acción quedará registrada en la auditoría."
              : "El gasto quedó cargado correctamente."}
          </DialogDescription>
        </DialogHeader>

        {step === "confirm" && pendingData && (
          <div className="mt-4 space-y-5">
            <div className="rounded-xl border border-border bg-muted/40 divide-y divide-border overflow-hidden">
              {[
                { label: "Estudio Jurídico", value: lawFirms.find((lf) => lf.id === pendingData.lawFirmId)?.name || "—" },
                { label: "Segmento", value: pendingData.segment },
                { label: "Motivo", value: pendingData.expenseType },
                { label: "Nro. Proforma", value: `#${pendingData.proformaNum}` },
                { label: "Fecha", value: pendingData.date },
                { label: "Estado inicial", value: pendingData.status },
                ...(pendingData.description ? [{ label: "Descripción", value: pendingData.description }] : []),
                { label: "Archivos adjuntos", value: mockFiles.length > 0 ? `${mockFiles.length} archivo(s)` : "Sin adjuntos" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-foreground text-right">{row.value}</span>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-muted">
                <span className="text-sm font-semibold text-foreground">Monto a registrar</span>
                <span className="text-xl font-bold font-mono text-foreground">{formatCurrency(pendingData.amount)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11 gap-2 cursor-pointer"
                onClick={handleBackToForm}
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              <Button
                type="button"
                className="flex-1 h-11 gap-2 font-semibold cursor-pointer"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Sí, confirmar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "success" && registeredSummary && (
          <div className="mt-4 flex flex-col items-center text-center py-4 space-y-4 animate-fade-in-up">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-success" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground flex items-center justify-center gap-1.5">
                Gasto registrado exitosamente <PartyPopper className="w-4 h-4 text-warning" />
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-mono font-semibold text-foreground">{formatCurrency(registeredSummary.amount)}</span>
                {" — "}
                {registeredSummary.firmName} ({registeredSummary.segment})
              </p>
            </div>
            <Button type="button" className="w-full h-11 font-semibold cursor-pointer" onClick={() => handleOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        )}

        {step === "form" && (
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
              <SelectTrigger className={`h-11 ${currentUser?.role === "ESTUDIO" ? "bg-muted cursor-not-allowed" : "cursor-pointer"}`}>
                <SelectValue>
                  {selectedFirmId ? lawFirms.find(f => f.id === selectedFirmId)?.name : "Seleccionar estudio..."}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="min-w-[320px]">
                {lawFirms.map((lf) => (
                  <SelectItem key={lf.id} value={lf.id} className="cursor-pointer">
                    <span className="font-medium">{lf.name}</span>
                    <span className="ml-auto text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md font-bold whitespace-nowrap">
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
                          ? "var(--destructive)"
                          : "var(--foreground)",
                    }}
                  />
                </div>
                <span className="text-foreground font-black text-sm tabular-nums">
                  {formatCurrency(availableBalance)} disponible
                </span>
              </div>
            )}
          </div>

          {/* Segmento + Motivo + Proforma */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Segmento</Label>
              <Select onValueChange={(val: string | null) => setValue("segment", val as "Personas" | "Empresas" | "Retail" | "Canales Indirectos")}>
                <SelectTrigger className="h-11 cursor-pointer">
                  <SelectValue placeholder="Segmento..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personas" className="cursor-pointer">Personas</SelectItem>
                  <SelectItem value="Empresas" className="cursor-pointer">Empresas</SelectItem>
                  <SelectItem value="Retail" className="cursor-pointer">Retail</SelectItem>
                  <SelectItem value="Canales Indirectos" className="cursor-pointer">Canales Indirectos</SelectItem>
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
          </div>
          
          {/* Fecha + Monto + Estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
            <div className="space-y-2">
              <Label>Estado de Pago</Label>
              {currentUser?.role === "ESTUDIO" ? (
                // Un estudio jurídico solo puede cargar gastos en "Ingresado".
                // El analista es quien valida y habilita el paso a "A facturar".
                <div className="h-11 flex items-center gap-2 px-3 rounded-lg border border-border bg-muted text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0" />
                  Ingresado
                  <span className="ml-auto text-[10px] uppercase tracking-wider">Pendiente de validación</span>
                </div>
              ) : (
                <Select defaultValue="Ingresado" onValueChange={(val: string | null) => setValue("status", val as any)}>
                  <SelectTrigger className="h-11 cursor-pointer">
                    <SelectValue placeholder="Estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ingresado" className="cursor-pointer">Ingresado</SelectItem>
                    <SelectItem value="OK Supervisor" className="cursor-pointer">OK Supervisor</SelectItem>
                    <SelectItem value="En proceso de pago" className="cursor-pointer">En proceso de pago</SelectItem>
                    <SelectItem value="Pagado" className="cursor-pointer">Pagado</SelectItem>
                    <SelectItem value="Rechazado" className="cursor-pointer">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Validaciones de Monto (Ancho completo) */}
          <div className="-mt-2 min-h-[20px]">
            {errors.amount && (
              <p className="text-[11px] text-destructive font-bold animate-fade-in-up flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.amount.message}
              </p>
            )}
            {currentAmount > 0 && !errors.amount && selectedFirmId && currentAmount <= availableBalance && (
              <p className="text-[11px] text-emerald-600 font-bold animate-fade-in-up flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Monto autorizado (dentro del saldo)
              </p>
            )}
            {currentAmount > availableBalance && selectedFirmId && (
              <p className="text-[11px] text-rose-500 font-bold animate-fade-in-up flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 p-2 rounded-lg border border-rose-100 dark:border-rose-900/30">
                <X className="w-3.5 h-3.5" />
                <span>
                  Excedido por <span className="underline">{formatCurrency(currentAmount - availableBalance)}</span>
                </span>
              </p>
            )}
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
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200">
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

          {/* Submit -> pasa a la pantalla de confirmación */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold cursor-pointer"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Revisar y confirmar
          </Button>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
