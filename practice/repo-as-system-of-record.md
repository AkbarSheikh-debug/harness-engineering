# The repo as system of record

> If the agent cannot read it in the repository, it does not exist.

An agent starts every session knowing nothing about your project. The only reliable way to change that is to put the knowledge where it will be found: in versioned files, next to the code.

This page describes how to organise a repository so that an agent (and a new human teammate) can become productive from the files alone.

## Why the repository, and not somewhere else

| Knowledge lives in… | Can the agent read it? | Is it versioned with the code? | Does it go stale silently? |
|---------------------|------------------------|--------------------------------|----------------------------|
| People's heads | No | No | Yes |
| Chat threads | No | No | Yes |
| A wiki | Only with a connector | No | Yes |
| A long system prompt | Yes, at a cost every turn | Rarely | Yes |
| **Files in the repo** | **Yes** | **Yes** | **Less: it changes in the same commit as the code** |

The last row has one more advantage: it is checkable. A script can verify that links resolve, that documented commands still run, and that every module has an owner.

## The entry file is a map

Almost every harness loads one Markdown file from the repository root at startup: `AGENTS.md` (the cross-tool convention) or a tool-specific equivalent.

The mistake is to treat that file as the manual. It becomes long, it costs tokens on every turn, and nobody can keep it current. Treat it as a **table of contents** instead.

![A short AGENTS.md pointing to architecture, testing, skills and progress files](../assets/diagrams/instruction-map.svg)

A good entry file has five short sections:

1. **What this is.** One paragraph: purpose, stack, entry points.
2. **How to run and verify.** The exact commands. This is the most valuable section.
3. **Hard rules.** A handful of invariants that must never be violated, each with a reason.
4. **Where things are.** A sketch of the directory layout.
5. **Where to read more.** Pointers to deeper documents, with a line on when each is relevant.

Aim for about a hundred lines. When it grows past that, move detail into `docs/` and leave a pointer. A starter is in [`templates/AGENTS.md`](https://github.com/AkbarSheikh-debug/harness-engineering/blob/main/templates/AGENTS.md).

## A layout that works

```text
AGENTS.md                 the map (≈100 lines)
ARCHITECTURE.md           how the system fits together, and why
docs/
  testing.md              what "verified" means here; how to run each kind of test
  conventions.md          naming, error handling, logging
  decisions/              short records of significant choices and their reasons
  plans/
    active/               work in progress, one file per effort
    completed/            finished plans, kept for context
skills/                   procedures loaded on demand
PROGRESS.md               where the last session stopped
feature_list.json         what is done and what is not, verified by tests
```

You do not need all of it on day one. Start with `AGENTS.md` and `docs/testing.md`, and add a file the first time an agent gets something wrong for lack of it.

## Write invariants, not instructions

There are two ways to tell an agent how to work.

**Micromanaging the implementation:**

> When adding an endpoint, first create a file in `routes/`, then define a Pydantic model, then register the router in `main.py`, then…

**Stating an invariant:**

> Every HTTP endpoint validates its input with a schema and has at least one test in `tests/api/`. `make check` enforces both.

The first is brittle: it goes stale when the framework changes, and it fails the moment a task does not fit the script. The second says what must remain true and how to check it, and leaves the route to the model. OpenAI's Codex team described this shift as focusing on invariants rather than micromanaging implementation.

A useful format for each rule:

```markdown
- **Rule.** Money is always `Decimal`, never `float`.
  **Why.** Float rounding produced a billing discrepancy in March.
  **Check.** `make lint` fails on float arithmetic in `billing/`.
```

Rule, reason, check. The reason lets the model handle cases you did not foresee. The check means you do not depend on it remembering.

## Make verification a first-class citizen

The single highest-value thing you can write down is how to tell whether work is correct.

```markdown
## Verify
- Fast check (run after every change):   `make check`      # lint + types + unit tests, ~20s
- Full check (run before saying done):   `make test-all`   # adds integration tests, ~3 min
- Run the app locally:                   `make dev`        # http://localhost:8000
- A change is not done until `make test-all` passes.
```

With this in place, "done" stops being a feeling. Every agent and every human runs the same command. Go further where you can:

- **Architectural rules as lints.** "The UI layer may not import from the database layer" is a rule a script can enforce and an agent can read the error from.
- **Feedback the agent can query.** Logs, metrics and traces from a locally running instance let it check behaviour, not just compilation.
- **Turn review comments into rules.** When a reviewer corrects the same thing twice, encode it as a lint or a line in the docs. The correction then applies to every future run.

## Keep it honest

Documentation an agent trusts and that is wrong is worse than none. Some maintenance habits:

- **Change docs in the same commit as code.** Add it to the definition of done.
- **Lint the docs.** Check for dead links, commands that no longer exist, and files nobody owns.
- **Prefer pointing to restating.** "See the schema in `db/models.py`" cannot drift; a copied table can.
- **Garbage-collect.** Periodically have an agent audit the docs against the code and open a pull request with corrections.
- **Delete boldly.** A short accurate file beats a long doubtful one.

## A test for your repository

Hand the repo to a capable engineer who has never seen it, with no access to you or your chat history. Could they:

1. Understand what it does within five minutes?
2. Build it and run the tests from the instructions alone?
3. Tell which rules are hard constraints and why?
4. Find where a given feature lives?
5. Know when their change is finished?

Every "no" is a gap an agent will fall into.

## Sources and further reading

- OpenAI, [Harness engineering](https://openai.com/index/harness-engineering/): the account of replacing a large instruction file with a short directory page and structured docs
- [AGENTS.md](https://agents.md): the open convention
- Claude Code, [How Claude remembers your project](https://code.claude.com/docs/en/memory)
- [Learn Harness Engineering](https://github.com/walkinglabs/learn-harness-engineering): includes a sample repository template along these lines
