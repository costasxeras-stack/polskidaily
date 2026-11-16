# 0003: Keep the interface in English and write per-language notes

**Status:** Accepted · **Date:** 2026-11-16

## Context

The app is for Greek, Italian and Spanish speakers. Translating the whole interface and every lesson into three languages would triple the content to write and check, and I can only check Greek myself.

## Decision

The interface and lesson text stay in English. Each lesson carries one short note per language that compares the Polish rule with that language, using example words in it. The tutor can explain mistakes in the learner's own language.

## Consequences

- One set of lessons to maintain, and the part that differs by language is small enough to have reviewed by a native speaker.
- Learners need working English. Greek, Italian or Spanish speakers without it are left out for now.
- Adding a new first language means writing 10 notes, not a full translation.
