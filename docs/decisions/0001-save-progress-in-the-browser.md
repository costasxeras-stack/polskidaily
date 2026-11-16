# 0001: Save progress in the browser, with no accounts

**Status:** Accepted · **Date:** 2026-11-16

## Context

The app has to remember hours, finished lessons and review cards. Render's free plan has no permanent disk, and a database plus sign-in would add cost, a privacy duty and several days of work before the first lesson could be used.

## Decision

Keep all progress in the browser's local storage. Add a backup file the learner can download and load on another device.

## Consequences

- Free to run, nothing personal on the server, and the first version shipped in a day.
- Progress does not sync between phone and laptop, and clearing browser data deletes it unless there is a backup.
- I cannot see how other people use the app. Any usage findings must come from my own backup file or from asking users.
