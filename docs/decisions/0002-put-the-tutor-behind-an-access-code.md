# 0002: Put the tutor behind an access code and a daily cap

**Status:** Accepted · **Date:** 2026-11-16

## Context

The demo is public and every tutor message is a paid Claude API call on my key. An open tutor could be used as a free chatbot by anyone who finds the link.

## Decision

The tutor needs an access code set on the server, and the server stops after a set number of messages per day (150 by default). Lessons, review cards and the plan stay open to everyone. The system prompt is built on the server from a fixed list of options, so a visitor cannot replace it.

## Consequences

- My cost has a ceiling, and I choose who gets the code.
- A hiring manager who opens the demo cannot try the tutor without the code. Screenshots in the README have to cover that.
- The cap is shared by all users and resets when the free server restarts, so it is a rough limit.
