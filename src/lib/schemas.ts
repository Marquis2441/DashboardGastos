import { z } from "zod";

// Schema de Login
export const loginSchema = z.object({
  email: z.string().min(1, "El usuario / email es obligatorio"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const createExpenseSchema = (availableBalance: number) =>
  z.object({
    lawFirmId: z.string().min(1, "Selecciona un estudio jurídico"),
    proformaNum: z
      .number({ error: "El número de proforma es obligatorio" })
      .min(1, "El número de proforma es obligatorio"),
    segment: z.enum(["Personas", "Empresas", "Retail", "Canales Indirectos"], {
      error: "Selecciona un segmento",
    }),
    expenseType: z.enum(["Tasa de Justicia", "Honorarios", "Inicios Judiciales"], {
      error: "Selecciona un motivo",
    }),
    date: z.string().min(1, "La fecha es obligatoria"),
    amount: z
      .number({ error: "El monto es obligatorio" })
      .positive("El monto debe ser mayor a 0")
      .max(availableBalance, `El monto supera el saldo disponible ($${availableBalance.toLocaleString("es-AR")})`),
    description: z.string().optional(),
    status: z.enum(["Ingresado", "OK Supervisor", "En proceso de pago", "Pagado", "Rechazado"], {
      error: "Selecciona un estado",
    }),
  });

export type ExpenseFormValues = {
  lawFirmId: string;
  proformaNum: number;
  segment: "Personas" | "Empresas" | "Retail" | "Canales Indirectos";
  expenseType: "Tasa de Justicia" | "Honorarios" | "Inicios Judiciales";
  date: string;
  amount: number;
  description?: string;
  status: "Ingresado" | "OK Supervisor" | "En proceso de pago" | "Pagado" | "Rechazado";
};
