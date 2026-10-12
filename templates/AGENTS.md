# <Project name>

<One paragraph: what this project is, who uses it, and the main technologies.>

Entry point: `<path>`. Tests live in `<path>`.

## Verify

- Fast check, after every change: `<command>`        (lint + types + unit tests)
- Full check, before saying you are done: `<command>` (adds integration tests)
- Run it locally: `<command>`

**A change is not done until the full check passes.** If you could not run it, say so.

## Hard rules

Each rule has a reason and, where possible, a check.

- **<Rule.>** Why: <reason>. Check: `<command or lint>`.
- **<Rule.>** Why: <reason>.
- **Make the smallest change that satisfies the task.** If you notice other problems, report them; do not fix them unasked.
- **Never edit <generated or protected paths> by hand.** Why: <reason>.

## Layout

```text
<dir>/      <what lives here>
<dir>/      <what lives here>
docs/       deeper documentation (see below)
```

## Read more, when relevant

- Changing how components talk to each other → `docs/architecture.md`
- Writing or fixing tests → `docs/testing.md`
- Naming, errors, logging → `docs/conventions.md`
- Why something is the way it is → `docs/decisions/`

## Working across sessions

- Read `PROGRESS.md` and `git log --oneline -15` before starting.
- Work on one item from `feature_list.json` at a time.
- Before stopping: tests green, work committed, `PROGRESS.md` updated.

<!-- Keep this file near 100 lines. When it grows, move detail into docs/ and leave a pointer. -->
