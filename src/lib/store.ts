import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  User,
  LawFirm,
  Expense,
  PaymentStatus,
  Segment,
  ExpenseType,
  AuditEntry,
  Attachment,
  Role,
} from "./types";

// ==========================================
// MOCK DATA
// ==========================================
const MOCK_USERS: User[] = [
  { id: "u1", name: "Analista de Gastos", email: "analista@banco.com", role: "ANALISTA" },
  { id: "u2", name: "Estudio Bancalari", email: "contacto@bancalari.com", role: "ESTUDIO", lawFirmId: "lf1" },
  { id: "u3", name: "Operador CCO", email: "cco@banco.com", role: "CCO" },
  { id: "u4", name: "Administrador General", email: "admin@banco.com", role: "ADMIN" },
];

const MOCK_LAW_FIRMS: LawFirm[] = [
  { id: "lf1", name: "Bancalari", ocLimit: 5000000, ocConsumed: 1850000, contactEmail: "contacto@bancalari.com", color: "#3B82F6" },
  { id: "lf2", name: "General Collect", ocLimit: 4000000, ocConsumed: 2100000, contactEmail: "contacto@generalcollect.com", color: "#8B5CF6" },
  { id: "lf3", name: "Sanchez", ocLimit: 3500000, ocConsumed: 980000, contactEmail: "contacto@sanchez.com", color: "#10B981" },
  { id: "lf4", name: "Garcia Porcel", ocLimit: 3000000, ocConsumed: 2750000, contactEmail: "contacto@garciaporcel.com", color: "#F59E0B" },
  { id: "lf5", name: "Roth", ocLimit: 2500000, ocConsumed: 800000, contactEmail: "contacto@roth.com", color: "#EF4444" },
  { id: "lf6", name: "Personal Collect", ocLimit: 2000000, ocConsumed: 600000, contactEmail: "contacto@personalcollect.com", color: "#EC4899" },
  { id: "lf7", name: "General Collect (Clean)", ocLimit: 3200000, ocConsumed: 1100000, contactEmail: "contacto@generalcollectclean.com", color: "#06B6D4" },
  { id: "lf8", name: "Contacto Garantido", ocLimit: 2800000, ocConsumed: 950000, contactEmail: "contacto@contactogarantido.com", color: "#F97316" },
];

const now = new Date().toISOString();

const MOCK_EXPENSES: Expense[] = [
  {
    id: "e1", lawFirmId: "lf1", proformaNum: 1024, segment: "Personas", expenseType: "Tasa de Justicia",
    amount: 350000, date: "2026-02-15", status: "Pagado", description: "Tasa juzgado civil Nro 5",
    attachments: [{ id: "a1", name: "factura_001.pdf", type: "pdf", size: 245000, uploadedBy: "u1", uploadedAt: now }],
    createdBy: "u1", createdAt: "2026-02-15T10:00:00Z",
    auditTrail: [
      { id: "at1", action: "Creado", newValue: "Ingresado", userId: "u1", userName: "Marcos Rossi", timestamp: "2026-02-15T10:00:00Z" },
      { id: "at2", action: "Estado cambiado", previousValue: "Ingresado", newValue: "Pagado", userId: "u2", userName: "Ana García", timestamp: "2026-02-20T14:30:00Z" },
    ],
  },
  {
    id: "e2", lawFirmId: "lf1", proformaNum: 1025, segment: "Empresas", expenseType: "Honorarios",
    amount: 500000, date: "2026-02-20", status: "En proceso de pago", description: "Honorarios prof. febrero",
    attachments: [], createdBy: "u2", createdAt: "2026-02-20T09:00:00Z",
    auditTrail: [
      { id: "at3", action: "Creado", newValue: "Ingresado", userId: "u2", userName: "Ana García", timestamp: "2026-02-20T09:00:00Z" },
      { id: "at4", action: "Estado cambiado", previousValue: "Ingresado", newValue: "En proceso de pago", userId: "u1", userName: "Marcos Rossi", timestamp: "2026-02-25T11:00:00Z" },
    ],
  },
  {
    id: "e3", lawFirmId: "lf2", proformaNum: 2048, segment: "Personas", expenseType: "Inicios Judiciales",
    amount: 800000, date: "2026-01-10", status: "Pagado", description: "Inicio judicial lote enero",
    attachments: [{ id: "a2", name: "rendicion_enero.xlsx", type: "excel", size: 180000, uploadedBy: "u1", uploadedAt: now }],
    createdBy: "u1", createdAt: "2026-01-10T08:00:00Z",
    auditTrail: [
      { id: "at5", action: "Creado", newValue: "Ingresado", userId: "u1", userName: "Marcos Rossi", timestamp: "2026-01-10T08:00:00Z" },
      { id: "at6", action: "Estado cambiado", previousValue: "Ingresado", newValue: "Pagado", userId: "u1", userName: "Marcos Rossi", timestamp: "2026-01-20T16:00:00Z" },
    ],
  },
  {
    id: "e4", lawFirmId: "lf2", proformaNum: 2049, segment: "Empresas", expenseType: "Honorarios",
    amount: 650000, date: "2026-03-01", status: "Ingresado", description: "Honorarios marzo",
    attachments: [], createdBy: "u3", createdAt: "2026-03-01T10:00:00Z",
    auditTrail: [
      { id: "at7", action: "Creado", newValue: "Ingresado", userId: "u3", userName: "Carlos López", timestamp: "2026-03-01T10:00:00Z" },
    ],
  },
  {
    id: "e5", lawFirmId: "lf3", proformaNum: 3012, segment: "Personas", expenseType: "Tasa de Justicia",
    amount: 280000, date: "2026-02-28", status: "A facturar", description: "Tasa tribunal comercial",
    attachments: [], createdBy: "u2", createdAt: "2026-02-28T14:00:00Z",
    auditTrail: [
      { id: "at8", action: "Creado", newValue: "Ingresado", userId: "u2", userName: "Ana García", timestamp: "2026-02-28T14:00:00Z" },
      { id: "at8b", action: "Estado cambiado", previousValue: "Ingresado", newValue: "A facturar", userId: "u1", userName: "Analista de Gastos", timestamp: "2026-03-01T14:00:00Z" },
    ],
  },
  {
    id: "e6", lawFirmId: "lf3", proformaNum: 3013, segment: "Empresas", expenseType: "Inicios Judiciales",
    amount: 420000, date: "2026-03-05", status: "Rechazado", description: "Inicio rechazado por documentación",
    attachments: [{ id: "a3", name: "factura_rechazada.pdf", type: "pdf", size: 320000, uploadedBy: "u3", uploadedAt: now }],
    createdBy: "u3", createdAt: "2026-03-05T11:00:00Z",
    auditTrail: [
      { id: "at9", action: "Creado", newValue: "Ingresado", userId: "u3", userName: "Carlos López", timestamp: "2026-03-05T11:00:00Z" },
      { id: "at10", action: "Estado cambiado", previousValue: "Ingresado", newValue: "Rechazado", userId: "u1", userName: "Marcos Rossi", timestamp: "2026-03-07T09:00:00Z" },
    ],
  },
  {
    id: "e7", lawFirmId: "lf4", proformaNum: 4056, segment: "Personas", expenseType: "Honorarios",
    amount: 1200000, date: "2026-01-15", status: "Pagado", description: "Honorarios especiales recupero",
    attachments: [], createdBy: "u1", createdAt: "2026-01-15T10:00:00Z",
    auditTrail: [
      { id: "at11", action: "Creado", newValue: "Ingresado", userId: "u1", userName: "Marcos Rossi", timestamp: "2026-01-15T10:00:00Z" },
      { id: "at12", action: "Estado cambiado", previousValue: "Ingresado", newValue: "Pagado", userId: "u2", userName: "Ana García", timestamp: "2026-01-25T15:00:00Z" },
    ],
  },
  {
    id: "e8", lawFirmId: "lf4", proformaNum: 4057, segment: "Empresas", expenseType: "Tasa de Justicia",
    amount: 750000, date: "2026-02-10", status: "En proceso de pago", description: "Tasa febrero empresas",
    attachments: [], createdBy: "u2", createdAt: "2026-02-10T09:00:00Z",
    auditTrail: [
      { id: "at13", action: "Creado", newValue: "Ingresado", userId: "u2", userName: "Ana García", timestamp: "2026-02-10T09:00:00Z" },
      { id: "at14", action: "Estado cambiado", previousValue: "Ingresado", newValue: "En proceso de pago", userId: "u3", userName: "Carlos López", timestamp: "2026-02-15T10:00:00Z" },
    ],
  },
  {
    id: "e9", lawFirmId: "lf5", proformaNum: 5001, segment: "Retail", expenseType: "Honorarios",
    amount: 420000, date: "2026-03-10", status: "Ingresado", description: "Honorarios retail Q1",
    attachments: [], createdBy: "u1", createdAt: "2026-03-10T09:00:00Z",
    auditTrail: [
      { id: "at15", action: "Creado", newValue: "Ingresado", userId: "u1", userName: "Analista de Gastos", timestamp: "2026-03-10T09:00:00Z" },
    ],
  },
  {
    id: "e10", lawFirmId: "lf5", proformaNum: 5002, segment: "Canales Indirectos", expenseType: "Tasa de Justicia",
    amount: 310000, date: "2026-03-12", status: "A facturar", description: "Tasa canales indirectos",
    attachments: [], createdBy: "u1", createdAt: "2026-03-12T10:00:00Z",
    auditTrail: [
      { id: "at16", action: "Creado", newValue: "Ingresado", userId: "u1", userName: "Analista de Gastos", timestamp: "2026-03-12T10:00:00Z" },
      { id: "at16b", action: "Estado cambiado", previousValue: "Ingresado", newValue: "A facturar", userId: "u1", userName: "Analista de Gastos", timestamp: "2026-03-13T10:00:00Z" },
    ],
  },
  {
    id: "e11", lawFirmId: "lf6", proformaNum: 6001, segment: "Retail", expenseType: "Inicios Judiciales",
    amount: 550000, date: "2026-02-18", status: "Pagado", description: "Inicios judiciales retail febrero",
    attachments: [{ id: "a4", name: "factura_retail.pdf", type: "pdf", size: 200000, uploadedBy: "u1", uploadedAt: now }],
    createdBy: "u1", createdAt: "2026-02-18T10:00:00Z",
    auditTrail: [
      { id: "at17", action: "Creado", newValue: "Ingresado", userId: "u1", userName: "Analista de Gastos", timestamp: "2026-02-18T10:00:00Z" },
      { id: "at18", action: "Estado cambiado", previousValue: "Ingresado", newValue: "Pagado", userId: "u3", userName: "Operador CCO", timestamp: "2026-02-25T10:00:00Z" },
    ],
  },
  {
    id: "e12", lawFirmId: "lf6", proformaNum: 6002, segment: "Canales Indirectos", expenseType: "Honorarios",
    amount: 280000, date: "2026-03-05", status: "En proceso de pago", description: "Honorarios canales indirectos",
    attachments: [], createdBy: "u2", createdAt: "2026-03-05T08:00:00Z",
    auditTrail: [
      { id: "at19", action: "Creado", newValue: "Ingresado", userId: "u2", userName: "Estudio Bancalari", timestamp: "2026-03-05T08:00:00Z" },
      { id: "at20", action: "Estado cambiado", previousValue: "Ingresado", newValue: "En proceso de pago", userId: "u3", userName: "Operador CCO", timestamp: "2026-03-08T10:00:00Z" },
    ],
  },
  {
    id: "e13", lawFirmId: "lf7", proformaNum: 7001, segment: "Empresas", expenseType: "Honorarios",
    amount: 690000, date: "2026-01-22", status: "Pagado", description: "Honorarios empresas enero",
    attachments: [], createdBy: "u1", createdAt: "2026-01-22T09:00:00Z",
    auditTrail: [
      { id: "at21", action: "Creado", newValue: "Ingresado", userId: "u1", userName: "Analista de Gastos", timestamp: "2026-01-22T09:00:00Z" },
      { id: "at22", action: "Estado cambiado", previousValue: "Ingresado", newValue: "Pagado", userId: "u3", userName: "Operador CCO", timestamp: "2026-01-30T11:00:00Z" },
    ],
  },
  {
    id: "e14", lawFirmId: "lf7", proformaNum: 7002, segment: "Retail", expenseType: "Tasa de Justicia",
    amount: 220000, date: "2026-02-14", status: "Ingresado", description: "Tasa de justicia retail",
    attachments: [], createdBy: "u1", createdAt: "2026-02-14T10:00:00Z",
    auditTrail: [
      { id: "at23", action: "Creado", newValue: "Ingresado", userId: "u1", userName: "Analista de Gastos", timestamp: "2026-02-14T10:00:00Z" },
    ],
  },
  {
    id: "e15", lawFirmId: "lf8", proformaNum: 8001, segment: "Canales Indirectos", expenseType: "Inicios Judiciales",
    amount: 480000, date: "2026-03-01", status: "Ingresado Analista", description: "Inicios judiciales canales",
    attachments: [{ id: "a5", name: "factura_ci.pdf", type: "pdf", size: 170000, uploadedBy: "u1", uploadedAt: now }],
    createdBy: "u1", createdAt: "2026-03-01T08:00:00Z",
    auditTrail: [
      { id: "at24", action: "Creado", newValue: "Ingresado", userId: "u1", userName: "Analista de Gastos", timestamp: "2026-03-01T08:00:00Z" },
      { id: "at25", action: "Estado cambiado", previousValue: "Ingresado", newValue: "Ingresado Analista", userId: "u1", userName: "Analista de Gastos", timestamp: "2026-03-05T10:00:00Z" },
    ],
  },
  {
    id: "e16", lawFirmId: "lf8", proformaNum: 8002, segment: "Personas", expenseType: "Honorarios",
    amount: 370000, date: "2026-02-20", status: "Rechazado", description: "Honorarios personas febrero",
    attachments: [], createdBy: "u2", createdAt: "2026-02-20T11:00:00Z",
    auditTrail: [
      { id: "at26", action: "Creado", newValue: "Ingresado", userId: "u2", userName: "Estudio Bancalari", timestamp: "2026-02-20T11:00:00Z" },
      { id: "at27", action: "Estado cambiado", previousValue: "Ingresado", newValue: "Rechazado", userId: "u1", userName: "Analista de Gastos", timestamp: "2026-02-22T09:00:00Z" },
    ],
  },
];

// ==========================================
// STORE INTERFACE
// ==========================================
interface AppState {
  // Auth
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchRole: (role: Role) => void;

  // Law Firms
  lawFirms: LawFirm[];
  getLawFirm: (id: string) => LawFirm | undefined;
  getAvailableBalance: (lawFirmId: string) => number;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id" | "createdAt" | "auditTrail" | "attachments"> & { attachments?: Attachment[] }) => void;
  updateExpenseStatus: (expenseId: string, newStatus: PaymentStatus) => void;
  bulkUpdateExpenseStatus: (expenseIds: string[], newStatus: PaymentStatus) => void;
  addAttachment: (expenseId: string, attachment: Attachment) => void;
  getExpensesByFirm: (lawFirmId: string) => Expense[];
  getExpensesByFirmAndSegment: (lawFirmId: string, segment: Segment) => Expense[];
  getExpensesByFirmAndType: (lawFirmId: string, expenseType: ExpenseType) => Expense[];

  // Notificaciones
  dismissedNotificationIds: string[];
  dismissNotifications: (ids: string[]) => void;
}

// ==========================================
// ZUSTAND STORE
// ==========================================
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      currentUser: null,
      users: MOCK_USERS,

      login: (email: string, password: string) => {
        if (email === "admin" && password === "Banco123") {
          const user = MOCK_USERS.find(u => u.role === "ADMIN");
          set({ currentUser: user });
          return true;
        }
        // Rechazar cualquier otra credencial
        return false;
      },

      logout: () => set({ currentUser: null }),

      switchRole: (role: Role) => {
        const user = MOCK_USERS.find((u) => u.role === role);
        if (user) {
          set({ currentUser: user });
        }
      },

      // Law Firms
      lawFirms: MOCK_LAW_FIRMS,

      getLawFirm: (id: string) => get().lawFirms.find((lf) => lf.id === id),

      getAvailableBalance: (lawFirmId: string) => {
        const firm = get().lawFirms.find((lf) => lf.id === lawFirmId);
        if (!firm) return 0;
        return firm.ocLimit - firm.ocConsumed;
      },

      // Expenses
      expenses: MOCK_EXPENSES,

      addExpense: (expenseData) => {
        const state = get();
        const user = state.currentUser;
        if (!user) return;

        const newId = `e${Date.now()}`;
        const timestamp = new Date().toISOString();

        const newExpense: Expense = {
          ...expenseData,
          id: newId,
          proformaNum: expenseData.proformaNum,
          createdAt: timestamp,
          attachments: expenseData.attachments || [],
          auditTrail: [
            {
              id: `at${Date.now()}`,
              action: "Creado",
              newValue: expenseData.status,
              userId: user.id,
              userName: user.name,
              timestamp,
            },
          ],
        };

        // Update OC consumed for the law firm
        set((state) => ({
          expenses: [newExpense, ...state.expenses],
          lawFirms: state.lawFirms.map((lf) =>
            lf.id === expenseData.lawFirmId
              ? { ...lf, ocConsumed: lf.ocConsumed + expenseData.amount }
              : lf
          ),
        }));
      },

      updateExpenseStatus: (expenseId: string, newStatus: PaymentStatus) => {
        const user = get().currentUser || { id: "u0", name: "Usuario" }; // Fallback minimal
        const timestamp = new Date().toISOString();

        set((state) => ({
          expenses: state.expenses.map((exp) => {
            if (exp.id !== expenseId) return exp;
            const auditEntry: AuditEntry = {
              id: `at${Date.now()}`,
              action: "Estado cambiado",
              previousValue: exp.status,
              newValue: newStatus,
              userId: user.id,
              userName: user.name,
              timestamp,
            };
            return {
              ...exp,
              status: newStatus,
              auditTrail: [...exp.auditTrail, auditEntry],
            };
          }),
        }));
      },

      bulkUpdateExpenseStatus: (expenseIds: string[], newStatus: PaymentStatus) => {
        const user = get().currentUser || { id: "u0", name: "Usuario" };
        const timestamp = new Date().toISOString();

        set((state) => ({
          expenses: state.expenses.map((exp) => {
            if (!expenseIds.includes(exp.id)) return exp;
            const auditEntry: AuditEntry = {
              id: `at_bulk_${Date.now()}_${exp.id}`,
              action: "Estado cambiado (Lote)",
              previousValue: exp.status,
              newValue: newStatus,
              userId: user.id,
              userName: user.name,
              timestamp,
            };
            return {
              ...exp,
              status: newStatus,
              auditTrail: [...exp.auditTrail, auditEntry],
            };
          }),
        }));
      },

      addAttachment: (expenseId: string, attachment: Attachment) => {
        const user = get().currentUser;
        const timestamp = new Date().toISOString();
        set((state) => ({
          expenses: state.expenses.map((exp) => {
            if (exp.id !== expenseId) return exp;
            return {
              ...exp,
              attachments: [...exp.attachments, attachment],
              auditTrail: [
                ...exp.auditTrail,
                {
                  id: `at_att_${Date.now()}`,
                  action: "Archivo adjuntado",
                  newValue: attachment.name,
                  userId: user?.id || "u0",
                  userName: user?.name || "Usuario",
                  timestamp,
                }
              ]
            };
          }),
        }));
      },

      getExpensesByFirm: (lawFirmId: string) =>
        get().expenses.filter((e) => e.lawFirmId === lawFirmId),

      getExpensesByFirmAndSegment: (lawFirmId: string, segment: Segment) =>
        get().expenses.filter((e) => e.lawFirmId === lawFirmId && e.segment === segment),

      getExpensesByFirmAndType: (lawFirmId: string, expenseType: ExpenseType) =>
        get().expenses.filter((e) => e.lawFirmId === lawFirmId && e.expenseType === expenseType),

      // Notificaciones
      dismissedNotificationIds: [],

      dismissNotifications: (ids: string[]) => {
        if (ids.length === 0) return;
        set((state) => ({
          dismissedNotificationIds: Array.from(new Set([...state.dismissedNotificationIds, ...ids])),
        }));
      },
    }),
    {
      name: "gestion-financiera-demo-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lawFirms: state.lawFirms,
        expenses: state.expenses,
        dismissedNotificationIds: state.dismissedNotificationIds,
      }), // No persisto currentUser para forzar login siempre
    }
  )
);
