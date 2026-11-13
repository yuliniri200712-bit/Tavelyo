# Arquitectura — visión general

Estado: **propuesta de Fase 0**. Las piezas marcadas como *pendiente* dependen de una decisión del propietario o del spike de SQL Connect (D-13).

## 1. Vista de contexto

```mermaid
flowchart LR
  subgraph PWA[Aplicaciones web instalables · React + TypeScript]
    MW[menu-web<br/>Menu — Cliente]
    OP[operations<br/>Staff · Kitchen · POS · Manager]
  end
  AUTH[Firebase Authentication]
  SC[SQL Connect<br/>conectores GraphQL]
  BE[Backend de confianza<br/>Cloud Functions · TypeScript]
  PG[(Cloud SQL PostgreSQL<br/>fuente de verdad)]
  PSP[Pasarela de pago<br/>pendiente D-02]
  FCM[Firebase Cloud Messaging]

  MW -- token --> AUTH
  OP -- token --> AUTH
  MW -- operaciones autorizadas --> SC
  OP -- operaciones autorizadas --> SC
  MW -- pedido / pago --> BE
  OP -- operaciones privilegiadas --> BE
  SC --> PG
  BE -- transacciones --> PG
  BE -- autorizar / capturar / reembolsar --> PSP
  PSP -- webhooks firmados --> BE
  BE -- avisos no autoritativos --> FCM
  FCM -.-> OP
```

Principios:

- **PostgreSQL es la fuente de verdad.** FCM solo avisa; al recibir un aviso, el cliente consulta el estado real.
- **Las PWA nunca hablan con PostgreSQL ni con la pasarela directamente.** Solo con SQL Connect (operaciones con autorización declarada) o con el backend.
- **El backend ejecuta lo que el conector no puede garantizar**: pagos, webhooks, conciliación, operaciones con invariantes transaccionales y tareas programadas.

## 2. Estructura del repositorio (ADR-0009; herramientas propuestas en ADR-0010)

```text
Tavelyo/
  CLAUDE.md
  docs/                       # Requisitos, arquitectura, decisiones, marca, pruebas, planes y progreso
  apps/
    menu-web/                 # PWA del cliente (ADR-0009)
    operations/               # PWA de Staff, Kitchen, POS y Manager por rol (ADR-0009)
  packages/
    core/                     # Errores, Money, fechas, resultados (TypeScript puro)
    contracts/                # Tipos compartidos entre las PWA y el backend
    design-system/            # Tokens (CSS + TS), componentes React y catálogo visual
    data-access/              # SDK web generado de SQL Connect y hooks propios
    features/
      identity/  tenancy/  catalog/  tables/  orders/
      kitchen/   billing/  payments/ inventory/ reporting/
  dataconnect/                # Esquema, conectores y SDK generado (directorio por defecto de la CLI)
  backend/                    # Backend de confianza (ADR-0003)
  assets/branding/            # Solo recursos maestros aprobados (vacío hasta D-12)
```

Los paquetes se crean **cuando una fase los necesita**, no por formalismo. Fase 1 crearía `core`, `contracts`, `design-system`, `data-access`, `identity` y `tenancy`.

## 3. Capas dentro de cada módulo

```mermaid
flowchart TB
  P[presentation<br/>componentes React · estado de UI] --> A[application<br/>casos de uso]
  A --> D[domain<br/>entidades · reglas · contratos]
  DA[data<br/>repositorios · SQL Connect · backend] --> D
```

- `domain` es TypeScript puro: sin React, Firebase ni SDK de pagos.
- `data` implementa los contratos de `domain`. El SDK generado de SQL Connect solo se importa en `data` (a través de `data-access`).
- Los módulos se comunican mediante contratos públicos, nunca importando internos de otro módulo.
- La inyección de dependencias se resuelve en cada app: composición en el arranque y entrega por contexto de React.

## 4. Responsabilidades por componente

| Componente | Hace | No hace |
|---|---|---|
| PWA (`menu-web`, `operations`) | Presentación, validación de entrada, caché de lectura en memoria, borradores | Cálculo financiero autoritativo, autorización, estados finales de pago |
| SQL Connect | Lecturas y escrituras simples con `@auth` y filtros por membresía | Invariantes multi-tabla que no pueda garantizar (por verificar en spike) |
| Backend | Pedidos con revalidación de precios, pagos, webhooks, conciliación, inventario, auditoría, outbox | Lógica de presentación |
| PostgreSQL | Datos, restricciones, claves compuestas, transacciones | — |
| FCM | Avisos de cambios | Registro de pedidos o pagos |

## 5. Transversales

- **Errores**: tipo `Result`/fallas de dominio en `core`; mensajes de usuario localizados, sin códigos internos como única explicación.
- **Localización**: español inicial (SUP-01) con formato de importes, fechas y plurales configurable por sucursal.
- **Tiempo**: el servidor asigna marcas UTC; el cliente nunca ordena eventos críticos con su reloj.
- **Dinero**: objeto de valor `Money` (ADR-0005).
- **Telemetría**: sin tokens, tarjetas ni datos personales innecesarios en logs.

## 6. PWA (ADR-0009)

- **Instalación:** manifiesto de aplicación web e iconos por aplicación; cada PWA se instala por separado.
- **Service worker:** cachea solo la estructura de la app y los recursos estáticos (incluida Plus Jakarta Sans). No cachea datos de SQL Connect ni del backend.
- **Sin conexión:** se muestra la última lectura con su hora y el estado de conexión; no se confirma ningún pedido ni pago. Al reconectar, se re-consulta el estado real (consulta incremental, ADR-0007).
- **Actualizaciones:** aviso de nueva versión y recarga en un momento seguro, nunca durante un cobro o una comanda.
- **Seguridad web:** cabeceras estrictas por sitio (CSP, `frame-ancestors`, HSTS, `Referrer-Policy`); sesión por pestaña en dispositivos compartidos.
- **Alojamiento:** propuesto Firebase Hosting con un sitio por PWA (ADR-0010, pendiente de aprobación).

## 7. Documentos relacionados

- Modelo de datos: [`data-model.md`](data-model.md)
- Permisos: [`permissions.md`](permissions.md)
- Amenazas: [`threat-model.md`](threat-model.md)
- Estados y flujos: [`state-machines.md`](state-machines.md)
- Decisiones: [`../decisions/`](../decisions/)
