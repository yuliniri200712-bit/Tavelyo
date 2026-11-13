# ADR-0007 — Mecanismo de actualización de cocina y meseros

**Estado:** Propuesta (requiere spike D-13) · **Fecha:** 2026-11-13

## Contexto

Cocina y meseros necesitan ver cambios en segundos. PM §3 y §9 prohíben asumir suscripciones en tiempo real o persistencia sin conexión solo por usar Firebase, y exigen recuperar el estado por versión/cursor al reconectar.

## Opciones

| Opción | Ventajas | Inconvenientes |
|---|---|---|
| A. Suscripciones de SQL Connect (si existen y cumplen) | Sin infraestructura adicional | Capacidad no verificada |
| B. Consultas incrementales periódicas por cursor (`updated_at`/versión) | Simple, predecible, funciona sin funciones especiales | Latencia igual al intervalo; coste por consulta |
| C. Aviso por FCM + consulta incremental | Latencia baja con poco tráfico | FCM puede perder o duplicar avisos; necesita B como respaldo |

## Recomendación

Diseñar siempre la **consulta incremental por cursor (B)** como mecanismo base y fuente de recuperación. Sobre ella, añadir A si el spike demuestra suscripciones fiables con autorización correcta, o C en caso contrario.

## Verificación pendiente (spike D-13)

- ¿SQL Connect ofrece suscripciones o actualización en tiempo real para el SDK Dart? ¿Con qué autorización y límites?
- Latencia y coste de B con un intervalo de 3–5 s para una sucursal con la carga de D-09.
