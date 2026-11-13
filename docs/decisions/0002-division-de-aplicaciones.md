# ADR-0002 — División en dos aplicaciones Flutter

**Estado:** Reemplazada por 0009 (dos PWA con React; se conserva la división en dos aplicaciones) · **Fecha:** 2026-11-13 · Aprobada por el propietario junto con D-03 (web y Android)

## Contexto

Hay cinco experiencias con necesidades distintas. El cliente entra por QR desde un navegador y necesita una carga rápida; el personal usa dispositivos de la sucursal, a menudo compartidos, con sesiones por rol. PM §4 pide separar aplicaciones solo cuando esté justificado.

## Opciones

| Opción | Ventajas | Inconvenientes |
|---|---|---|
| A. Una sola app con todas las experiencias | Un único despliegue | El cliente descarga código de caja y administración; superficie de ataque mayor en web pública |
| B. Dos apps: `client_web` (Menu) y `operations` (Staff, Kitchen, POS, Manager por rol) | Web del cliente ligera y aislada; el personal comparte una app con navegación por rol | Dos configuraciones de despliegue |
| C. Cinco apps | Máximo aislamiento | Duplicación de configuración, CI y distribución |

## Decisión

**Opción B.** La web pública del cliente no incluye código de operación; las cuatro experiencias de personal comparten autenticación, selector de empresa/sucursal y sistema de diseño.

## Consecuencias

- `client_web` se compila para web; `operations` para web (Manager) y Android, teléfonos y tabletas (Staff, Kitchen, POS), según D-03.
- iOS/iPad y escritorio Windows quedan fuera del alcance inicial; añadirlos requiere una nueva decisión.
- Ambas consumen los mismos paquetes `features/*`; ninguna duplica lógica.

## Verificación pendiente

Medir el tamaño de carga de `client_web` en Fase 2.
