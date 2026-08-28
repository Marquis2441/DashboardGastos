## Estado del proyecto

Este proyecto es un **prototipo funcional** desarrollado desde el área de Cobranzas para ilustrar la lógica de negocio y los flujos de trabajo requeridos. No está pensado para deploy en producción tal cual — utiliza datos y autenticación simulados (no hay backend ni base de datos real). Se comparte como base de requerimientos para que el área de Sistemas evalúe la implementación definitiva (backend, base de datos, seguridad, integración con los sistemas del banco).

## Lógica de negocio

### Roles del sistema
- **ESTUDIO**: representante de un estudio jurídico externo. Visibilidad acotada a su propio estudio (`lawFirmId`). Carga gastos (siempre en estado `Ingresado`, no puede elegir otro estado al cargar) y, una vez que el analista le da el OK, es quien factura.
- **ANALISTA**: usuario interno de Cobranzas. Es el control de calidad/documental del circuito: dos validaciones distintas, antes y después de que el estudio facture (ver ciclo de vida abajo). También puede rechazar un gasto en cualquier punto.
- **SUPERVISOR**: da el visto bueno final antes de derivar el gasto a pago. Es el paso que faltaba documentar en la primera versión de este README.
- **CCO**: deriva el gasto aprobado al sector de pagos (por fuera del sistema, hoy por mail) y, una vez que ese sector confirma que pagó, lo marca como `Pagado` en el sistema.
- **ADMIN**: administrador general, visibilidad y permisos totales sobre todos los roles y estados.

### Ciclo de vida de un gasto (estado)
Un gasto recorre los siguientes estados, en este orden, con el rol responsable de cada transición:

| De | A | Quién | Acción |
|---|---|---|---|
| — | `Ingresado` | ESTUDIO | Carga el gasto (único estado posible al crear) |
| `Ingresado` | `A facturar` | ANALISTA | Primer OK: valida que corresponda pagarlo y que la documentación esté en orden |
| `A facturar` | `Facturado` | ESTUDIO | Adjunta la factura real |
| `Facturado` | `OK Analista` | ANALISTA | Segundo OK: valida la factura ya adjuntada |
| `OK Analista` | `OK Supervisor` | SUPERVISOR | Visto bueno final antes de derivar a pago |
| `OK Supervisor` | `En proceso de pago` | CCO | Carga el gasto en la plataforma como derivado al sector de pagos (la derivación en sí es por mail, fuera del sistema) |
| `En proceso de pago` | `Pagado` | CCO | Cuando el sector de pagos confirma que efectivizó el pago, CCO lo marca acá |

Con un estado alternativo `Rechazado`, que el ANALISTA puede aplicar en cualquier punto del circuito (por ejemplo, documentación mal cargada o un gasto que no corresponde abonar) — es la razón por la que el estudio nunca factura directamente sin el OK previo del analista: evita una desprolijidad impositiva frente al fisco.

Falta definir: si ADMIN puede saltear pasos del circuito manualmente (hoy tiene permiso total sobre cualquier transición) y si eso debería quedar igual de auditado que el resto, o requerir una justificación explícita.


### Estudios jurídicos y Orden de Compra (OC)
Cada estudio jurídico tiene:
- Un **límite de OC** (`ocLimit`): el monto máximo que se le puede asignar en gastos.
- Un **consumido** (`ocConsumed`): lo ya utilizado.

El sistema debería alertar o bloquear la carga de un nuevo gasto si `ocConsumed + nuevo gasto > ocLimit`.

Falta definir: ¿el bloqueo es duro (no deja cargar) o blando (alerta pero permite, sujeto a aprobación)? ¿Quién autoriza una excepción?

### Clasificación de gastos
Cada gasto se clasifica por:
- **Segmento**: `Personas`, `Empresas`, `Retail` o `Canales Indirectos`.
- **Tipo de gasto**: `Tasa de Justicia`, `Honorarios`, `Inicios Judiciales`.
- **Estudio jurídico** asociado, **número de proforma**, **monto**, **fecha**, **descripción**.

### Adjuntos
Cada gasto puede tener archivos adjuntos (PDF, Excel u otro) — típicamente la factura o comprobante de respaldo. Se registra quién lo subió y cuándo.

### Trazabilidad / Auditoría
Cada gasto mantiene un historial completo (`auditTrail`) de cambios: qué acción se hizo, valor anterior, valor nuevo, quién y cuándo. Esto es clave para cualquier circuito de aprobación bancario y debería mantenerse (o mejorarse) en la versión productiva.

### Métricas del dashboard
La vista principal resume: OC total vs. consumido, cantidad de gastos por estado, por segmento y por tipo. Es la fotografía que hoy Cobranzas necesita ver de un vistazo y hoy arma manualmente.