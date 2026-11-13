# ADR-0004 — Gestión de estado y navegación

**Estado:** Reemplazada por 0009 (sin Flutter; bibliotecas web propuestas en ADR-0010) · **Fecha:** 2026-11-13 · Aprobada por el propietario (D-08)

## Contexto

PM §4 exige una sola estrategia principal de estado y navegación, documentada. El repositorio no tiene código, así que no hay una estrategia previa que respetar.

## Opciones de estado

| Opción | Ventajas | Inconvenientes |
|---|---|---|
| A. Riverpod | Estado e inyección de dependencias en una sola herramienta; fácil de sobrescribir en pruebas; seguro en compilación | Curva de aprendizaje de sus variantes de proveedores |
| B. Bloc / Cubit | Eventos y estados explícitos, adecuados para flujos con máquinas de estado; muy probado | Más código repetitivo; requiere un contenedor de DI aparte (p. ej. get_it) |

## Navegación

`go_router` en ambas opciones: rutas declarativas, redirecciones por autenticación y rol, y soporte de URL para `client_web`.

## Decisión

**Riverpod + go_router.** Riverpod cubre también la inyección de dependencias, lo que evita una tercera librería. Las máquinas de estado del dominio viven en `domain`, no en la librería de estado, así que la elección no las condiciona.

## Consecuencias

- La lógica de negocio no depende de Riverpod: los casos de uso son Dart puro y se exponen mediante proveedores en `presentation`.
- Las guardas de ruta son conveniencia de UX; la autorización real está en el servidor.

## Verificación pendiente

Verificar versiones estables, compatibilidad con Flutter 3.47.7 y licencias en pub.dev antes de añadirlas en Fase 1.
