## Estado del proyecto

Este proyecto es un **prototipo funcional** desarrollado desde el área de Cobranzas para ilustrar la lógica de negocio y los flujos de trabajo requeridos. No está pensado para deploy en producción tal cual — utiliza datos y autenticación simulados (no hay backend ni base de datos real). Se comparte como base de requerimientos para que el área de Sistemas evalúe la implementación definitiva (backend, base de datos, seguridad, integración con los sistemas del banco).

## Lógica de negocio

### Roles del sistema
- **ANALISTA**: usuario interno de Cobranzas. Carga y gestiona los gastos.
- **ESTUDIO**: representante de un estudio jurídico externo. Tiene visibilidad acotada a su propio estudio (`lawFirmId`).
- **CCO**: operador de Centro de Control de Operaciones (o el área que corresponda). Interviene en el circuito de aprobación/pago.
- **ADMIN**: administrador general, visibilidad y permisos totales.

Falta definir: qué acción puede hacer cada rol sobre cada estado (por ejemplo, ¿quién puede pasar un gasto de "Facturado" a "En proceso de pago"? ¿Solo CCO, o también Admin?).

### Ciclo de vida de un gasto (estado)
Un gasto recorre los siguientes estados, en este orden esperado:

`Ingresado` → `A facturar` → `Facturado` → `Ingresado Analista` → `En proceso de pago` → `Pagado`

Con un estado alternativo `Rechazado`, que puede darse en cualquier punto del circuito.


### Estudios jurídicos y Orden de Compra (OC)
Cada estudio jurídico tiene:
- Un **límite de OC** (`ocLimit`): el monto máximo que se le puede asignar en gastos.
- Un **consumido** (`ocConsumed`): lo ya utilizado.

El sistema debería alertar o bloquear la carga de un nuevo gasto si `ocConsumed + nuevo gasto > ocLimit`.

Falta definir: ¿el bloqueo es duro (no deja cargar) o blando (alerta pero permite, sujeto a aprobación)? ¿Quién autoriza una excepción?

### Clasificación de gastos
Cada gasto se clasifica por:
- **Segmento**: `Personas` o `Empresas`.
- **Tipo de gasto**: `Tasa de Justicia`, `Honorarios`, `Inicios Judiciales`.
- **Estudio jurídico** asociado, **número de proforma**, **monto**, **fecha**, **descripción**.

### Adjuntos
Cada gasto puede tener archivos adjuntos (PDF, Excel u otro) — típicamente la factura o comprobante de respaldo. Se registra quién lo subió y cuándo.

### Trazabilidad / Auditoría
Cada gasto mantiene un historial completo (`auditTrail`) de cambios: qué acción se hizo, valor anterior, valor nuevo, quién y cuándo. Esto es clave para cualquier circuito de aprobación bancario y debería mantenerse (o mejorarse) en la versión productiva.

### Métricas del dashboard
La vista principal resume: OC total vs. consumido, cantidad de gastos por estado, por segmento y por tipo. Es la fotografía que hoy Cobranzas necesita ver de un vistazo y hoy arma manualmente.