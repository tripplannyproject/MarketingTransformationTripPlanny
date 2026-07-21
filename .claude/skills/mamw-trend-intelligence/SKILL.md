---
name: mamw-trend-intelligence
description: Detectar, validar y priorizar tendencias recientes. Usar para social listening, search demand, cultura, industria y señales first-party que podrían alimentar calendarios o campañas.
---

# Validar tendencias

## Inputs obligatorios

- Marca, audiencia, región/locale, canal, ventana y fuentes permitidas.
- DNA, temas sensibles y risk profile.

## Procedimiento

1. Capturar source, observed_at, retrieved_at, expires_at y señal cuantitativa cuando exista.
2. Distinguir evento, tendencia sostenida, moda pasajera y ruido algorítmico.
3. Evaluar relevancia, timing, brand fit, saturación y oportunismo.
4. Transformar el insight desde el point of view de la marca; no copiar ejecución ajena.
5. Recomendar `adopt | adapt | respond | observe | reject`.

## Salida auditable

Producir `trend-signal-v1` y rationale de adopción con evidencia, confidence y expiry.

## Límites y gates

Mantener R0/R1. Escalar tragedias, política, salud, finanzas o crisis; bloquear señales expiradas y
assets/marcas de terceros sin rights.
