// ==========================================
// TIPOS E INTERFACES - Gestión Financiera
// ==========================================

export type PaymentStatus = "Ingresado" | "En Proceso de Pago" | "Pagado" | "Rechazado";
export type Segment = "Personas" | "Empresas";
export type ExpenseType = "Tasa de Justicia" | "Honorarios" | "Inicios Judiciales";

export type Role = "ADMIN" | "ESTUDIO" | "CCO";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  lawFirmId?: string; // Optional, only for "ESTUDIO" role
  avatar?: string;
}

export interface LawFirm {
  id: string;
  name: string;
  ocLimit: number;     // Límite de Orden de Compra
  ocConsumed: number;  // Monto ya consumido
  contactEmail: string;
  color: string;       // Color para badges y gráficos
}

export interface Expense {
  id: string;
  lawFirmId: string;
  proformaNum: number;   // Número de Proforma
  segment: Segment;
  expenseType: ExpenseType;
  amount: number;
  date: string;
  status: PaymentStatus;
  description?: string;
  attachments: Attachment[];
  createdBy: string;       // userId que creó el gasto
  createdAt: string;       // ISO timestamp
  auditTrail: AuditEntry[];
}

export interface Attachment {
  id: string;
  name: string;
  type: "pdf" | "excel" | "other";
  size: number;           // bytes
  uploadedBy: string;
  uploadedAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  userId: string;
  userName: string;
  timestamp: string;
}

// Para el resumen del dashboard
export interface DashboardMetrics {
  totalOCLimit: number;
  totalOCConsumed: number;
  totalExpenses: number;
  expensesByStatus: Record<PaymentStatus, number>;
  expensesBySegment: Record<Segment, number>;
  expensesByType: Record<ExpenseType, number>;
}
