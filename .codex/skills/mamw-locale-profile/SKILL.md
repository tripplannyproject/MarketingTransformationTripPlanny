---
name: mamw-locale-profile
description: Crear perfiles lingüísticos y culturales por marca/mercado. Usar para BCP 47, dialecto, registro, tú/usted/vos, term base, slang, tabúes, formatos, SEO local, claims y reviewers.
---

# Definir locale profile

## Inputs obligatorios

- Brand/market DNA, locale BCP 47, audiencia, canales y normativa.
- Research local, terminology existente y native-market owner.

## Procedimiento

1. Definir language/region, dialect, register, treatment y code-switching.
2. Crear term base: required, prohibited, do-not-translate y contextual slang.
3. Registrar cultural references, humor, tabúes, inclusive language y calendars.
4. Definir currency, units, dates, RTL/CJK, fonts, pronunciation y expansion.
5. Registrar legal claims/disclaimers, SEO vocabulary, reviewer y freshness.

## Salida auditable

Producir `locale-profile-v1` versionado con sources, owner, expiry y market DNA hash.

## Límites y gates

No usar locale genérico publicable sin excepción. No inventar jerga; exigir evidencia o native review.
