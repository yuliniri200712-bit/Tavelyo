# Verificación de Fase 0

Fecha: 2026-11-13 · Rama: `fase-0-arquitectura`

Fase 0 no produce código, así que no aplican pruebas unitarias, de integración ni de interfaz. Se verificó la documentación como se describe en `strategy.md` §5.

| Comprobación | Método | Resultado |
|---|---|---|
| Copias de documentos de origen idénticas | `sha256sum` de originales y copias | ✅ `PROMPT_MAESTRO.md` `73de0b46…d6ca` y `IDENTIDAD_VISUAL.md` `f24dd199…404b` coinciden |
| Enlaces relativos entre documentos | Script Node.js sobre `docs/` y `CLAUDE.md` | ✅ 14 enlaces; el único roto apuntaba a este archivo, que ya existe |
| Rutas citadas en el texto | `grep` de rutas `docs/…` y comprobación de existencia | ✅ Todas existen salvo `docs/architecture/spike-sql-connect.md`, que es un **entregable futuro** del spike (D-13) |
| Decisiones pendientes coherentes | `grep` de `D-01`…`D-13` en `requirements.md` y en el resto de `docs/` | ✅ Las 13 están definidas y no hay referencias a decisiones inexistentes |
| Índice de ADR | Comparación entre `decisions/README.md` y archivos | ✅ 8 ADR, todos enlazados |
| Matriz de contraste | Script Node.js con la fórmula de WCAG 2.2 | ✅ Valores recalculados y registrados en `brand/contrast-matrix.md` |
| Alcance de cambios | `git status` | ✅ Solo `CLAUDE.md` y `docs/`; ningún otro archivo modificado |

## Re-verificación al cierre (2026-11-13, tras el cambio a PWA y la aceptación de las ADR)

| Comprobación | Método | Resultado |
|---|---|---|
| Documentos de origen sin cambios | `git diff 0aa20eb -- docs/PROMPT_MAESTRO.md docs/IDENTIDAD_VISUAL.md` y SHA-256 | ✅ Sin diferencias; hashes `73de0b46…` y `f24dd199…`, iguales a los originales |
| Enlaces relativos | Script Node.js sobre `docs/` y `CLAUDE.md` | ✅ 17 enlaces, 0 rotos |
| Decisiones | `grep` de `D-01`…`D-16` en `requirements.md` | ✅ Las 16 definidas |
| Índice de ADR | `decisions/README.md` frente a archivos | 10 ADR, todas enlazadas |
| Entregable del spike | `architecture/spike-sql-connect.md` | Existe; resultados reproducibles en la rama `spike/sql-connect` (23/23, 9/9 y tiempo real con SDK web) |

## No verificado

- **Diagramas Mermaid:** no se renderizaron (no hay herramienta de renderizado instalada). Revisar visualmente en GitHub o en un visor compatible.
- **Capacidades de SQL Connect:** verificadas en emulador por el spike (D-13); IAM de producción y navegador real pendientes. **Pasarela:** pendiente de D-02.
- **Contraste en interfaz real:** solo cálculo teórico; se valida con componentes en Fase 1.
