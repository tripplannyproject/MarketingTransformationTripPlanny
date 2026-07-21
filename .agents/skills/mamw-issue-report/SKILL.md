---
name: mamw-issue-report
description: Preparar y reportar bugs o mejoras del framework MAMW. Usar cuando falla el CLI, un hook, gate, skill, mirror, onboarding o contrato, y para solicitudes que deben ir al repositorio compartido MAMW_Issues.
---

# Reportar un issue de MAMW

## Inputs obligatorios

- Tipo `bug` o `request`, título, descripción, impacto y evidencia reproducible.
- Para bugs: pasos numerados, esperado, actual, severidad y session log redactado.

## Procedimiento

1. Confirmar que el problema pertenece al framework MAMW, no a una campaña o producto usuario.
2. Reproducir cuando sea seguro y capturar versión, mirror, OS, Node, proyecto y comando sin secretos.
3. Para bugs, crear un session log mínimo con comandos/resultados, redactar tokens, PII y payloads,
   y pasar `--redacted` como atestación explícita. El CLI aplica además patrones de secretos.
4. Autoevaluar el draft: título específico, contexto/impacto, al menos dos pasos reales, expected vs
   actual y severidad `critical|high|medium|low`.
5. Mostrar el reporte completo y solicitar plan-ack para el efecto externo:

   - Claude Code: presentar el banner completo EN EL CHAT (destino, payload, efecto R2,
     rollback exactos) y abrir la ventana corta marcada — `AskUserQuestion` con la pregunta
     `¿Ejecuto este plan? [MAMW-GATE: plan-ack]` y opciones aprobar/rechazar explícitas; nunca
     el banner dentro de la ventana (una `ExitPlanMode` aprobada también cuenta si el usuario
     ya activó plan mode). Una ventana sin marcador o un OK escrito no aprueba el filing.
   - Codex: detenerse y esperar un `OK` escrito.

6. Preparar sin efecto remoto mediante `mamw issue bug|request`; conservar `draft.json`, reporte,
   session log redactado y `approval_hash`.
7. Con el plan-ack de la ventana (el banner incluyó el comando exacto), EJECUTAR TÚ MISMO:
   `mamw issue publish --draft <path> --confirm sha256:<approval_hash>`. El CLI revalida sesión
   OAW firmada, hash, commit/push y guarda receipt/URL. Nunca pedir al humano que tipee el
   comando; solo la forma con `--confirm sha256:<hash>` completo es ejecutable por el agente.

## Salida auditable

Producir `mamw-issue-draft` con reporte redactado, evidence paths, aprobación, destino y remote URL o
razón precisa por la que permaneció local.

## Límites y gates

Filear es R2: exige el plan-ack de la ventana marcada con el comando exacto visible en el banner.
El agente ejecuta `publish` SOLO con el `--confirm sha256:<hash>` completo (el CLI revalida todo);
las formas sin hash y `mamw approve` siguen bloqueadas (`MANUAL-ONLY-001`). Nunca afirmar que se
publicó sin receipt y, cuando aplique, URL remota verificable.
