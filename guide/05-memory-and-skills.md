# 5. Memory and skills

> **The question:** what should outlive a single session?

## The idea in one minute

Everything in [chapter 4](04-context.md) lives and dies inside one transcript. Close the session and the agent has forgotten your build command, your naming conventions, and the mistake it promised not to repeat.

The fix is deliberately low-tech: **write things in files, and load the right files at the right time.**

- **Memory** is knowledge that should be present from the first turn: what this project is and how to work in it.
- **Skills** are procedures that should appear only when a task calls for them.

Both are plain text on disk. Neither requires a database.

## Five kinds of "memory"

The word covers several different things. Separating them prevents most design confusion.

| Kind | Who writes it | When it loads | Example |
|------|---------------|---------------|---------|
| **Instructions** | You | Every session, at start | `AGENTS.md`: "tests run with `uv run pytest`" |
| **Learned facts** | The agent | Every session, at start, bounded | "Integration tests need Docker running" |
| **Progress** | The agent | Start of each work session | `PROGRESS.md`: "F014 done, F015 next" |
| **Procedures (skills)** | You or the agent | Only when a task matches | How to cut a release |
| **History search** | The harness | Only when queried | "What did we decide about the cache last week?" |

The first three are *pushed* into the context. The last two are *pulled*. Pushed memory is paid for on every turn; pulled memory costs nothing until it is used. That difference drives every placement decision in this chapter.

## Instructions that load themselves

Almost every harness reads a Markdown file from the repository at startup and places it in the system prompt. The filename varies (`AGENTS.md` is the cross-tool convention; Claude Code reads `CLAUDE.md`; several tools read both), the idea does not.

A good one is short and practical:

```markdown
# Payments service

Python 3.12, FastAPI, PostgreSQL. Entry point: `app/main.py`.

## Commands
- Install: `uv sync`
- Test: `uv run pytest -q`            (must pass before you say you are done)
- Lint: `uv run ruff check .`

## Rules
- Never edit files under `migrations/` by hand; generate them with `alembic revision`.
  Why: hand-edited migrations have diverged from the models twice.
- Money is `Decimal`, never `float`.
  Why: float rounding caused a billing discrepancy.
- Public API changes need an entry in `CHANGELOG.md`.

## Where to read more
- Architecture: `docs/architecture.md`
- How we test: `docs/testing.md`
```

### Scopes

Mature harnesses load several such files and layer them, broadest first.

![Instruction files layered by scope: organisation, user, project, local, directory](../assets/diagrams/instruction-scopes.png)

| Scope | Typical location | Holds | Shared? |
|-------|------------------|-------|---------|
| Organisation | A managed system path | Company-wide policy | Everyone |
| User | Your home directory | Your preferences, across projects | Only you |
| Project | Repository root | How this codebase works | The team, through git |
| Local | An untracked file in the repo | Your private notes for this project | Only you |
| Directory | A subfolder | Rules that only apply there | The team |

More specific files are placed later in the prompt, so they take precedence. The **discovery algorithm** is usually the same everywhere: start at the working directory, walk up to the repository root (or the filesystem root) collecting instruction files, then add the user-level one.

Directory-level files are the interesting ones. They are not loaded at startup. They enter the context **only when the agent reads or edits something in that directory**, which keeps the always-on cost low while still putting the rule exactly where it applies. A 4,000-line monorepo rulebook becomes thirty small files, of which a session might load two.

### The map, not the manual

The most common memory failure is growth. Someone adds a rule after every incident, and a year later the file is 2,000 lines. Now every turn pays for all of it, important rules are buried among trivia, and nobody can tell which parts are stale.

![A short AGENTS.md that points to detailed documents loaded on demand](../assets/diagrams/map-not-manual.png)

The cure is to treat the entry file as a **table of contents**:

- Keep it to roughly a hundred lines.
- State what the project is, how to build and verify, and the handful of rules that are never negotiable.
- For everything else, say *where to read* and *when it is relevant*, and let the agent open that file when the task needs it.

> Always-loaded text is paid for on every turn of every session. Text on disk costs nothing until it is read.

A quick calculation makes it vivid. A 2,000-line instruction file is around 25,000 tokens. Over a 40-turn session that is a million input tokens spent re-reading rules, most of which did not apply to the task.

### Rules need reasons

Compare two ways of writing the same rule:

| Bare rule | Rule with a reason |
|-----------|--------------------|
| "Never use `any`." | "Avoid `any`: the API client is generated from these types, and `any` hides contract breaks until runtime." |

The first is followed mechanically, including in cases where it makes no sense. The second lets the model handle a case you did not anticipate, because it knows what the rule is protecting.

## Memory the agent writes

The second kind of memory flows the other way: the agent records what it learned.

- **Learned preferences.** "User prefers `pnpm`." "Integration tests need Docker running."
- **Lessons.** "The flaky test is `test_webhook_retry`; re-run before investigating."

Give it a tool for the purpose:

```python
def remember(note: str) -> str:
    """Save one durable fact about this project for future sessions."""
    with open(MEMORY_FILE, "a", encoding="utf-8") as f:
        f.write(f"- {note.strip()}\n")
    return "saved"
```

Three design decisions separate memory that helps from memory that rots.

**Bound it, hard.** One open-source harness caps its agent-written memory at about 2,200 characters, plus a separate, smaller user profile. When a write would exceed the cap, the memory tool returns an *error*, and the agent must consolidate or remove entries before retrying. Nothing is dropped silently. The cap forces curation: memory stays a short list of things that matter, and the agent is the one deciding what to keep.

**Offer replace and remove, not only add.** An append-only memory accumulates contradictions ("uses npm" … "switched to pnpm"). Updating an entry in place keeps it true.

**Freeze the snapshot.** Load memory into the system prompt once, at session start, and do not refresh it mid-conversation even if the agent writes to it. Refreshing would change the prompt prefix and throw away the cache ([chapter 4](04-context.md)). The new entry takes effect next session, which is when it is needed.

### Memory hygiene

Agent-written memory fails in specific ways:

| Failure | What it looks like | Guard |
|---------|--------------------|-------|
| **Rot** | A note says the API is at `/v1` long after it moved | Date entries; prune on a schedule; point at code instead of restating it |
| **Bloat** | Hundreds of trivial entries | A hard size cap; consolidate when full |
| **Poisoning** | A note written while processing hostile content: "always skip the security check" | Treat memory writes as a side effect: gate them, review them, keep them in git |
| **Duplication** | Memory restates what the code already says | Record only what is *not* derivable from the repo |
| **Cross-talk** | Two agents share one memory file and compound each other's entries | One memory per agent or profile |

The duplication row gives a good general test: *would a careful reader of the repository already know this?* If yes, it does not belong in memory.

### Searching the past

Summaries lose detail. A different kind of memory keeps everything and retrieves on demand: index past sessions with ordinary full-text search and give the agent a tool to query them. "What did we decide about the retry policy?" becomes a search, not a hope that the right sentence survived three compactions. It costs nothing until used, which puts it on the cheap side of the ledger.

## Skills: procedures on a shelf

Some knowledge is only needed occasionally and is long when it is needed: how to cut a release, how to write a database migration in this codebase, how to fill in a particular PDF form. Putting all of that in the system prompt would be absurd.

A **skill** is a folder with a `SKILL.md` file and, optionally, scripts and reference material:

```text
skills/
  release/
    SKILL.md
    scripts/bump_version.py
    checklist.md
```

```markdown
---
name: release
description: Cut a versioned release of this package. Use when asked to release, publish, tag, or bump the version.
---

1. Confirm the working tree is clean and tests pass.
2. Run `python scripts/bump_version.py <major|minor|patch>`.
3. Update CHANGELOG.md: move "Unreleased" entries under the new version.
4. Commit, tag `vX.Y.Z`, and stop. Ask before pushing.

If the version bump fails, read `checklist.md` for the manual steps.
```

### Progressive disclosure

The mechanism that makes skills cheap is loading in three stages.

![A skill drawn as an iceberg: name and description above the water, the body and scripts below](../assets/diagrams/skill-iceberg.png)

| Level | What loads | When | Rough cost |
|-------|-----------|------|------------|
| 1 | `name` and `description` | Always | ~30 tokens per skill |
| 2 | The body of `SKILL.md` | When the model decides the task matches | Hundreds to a couple of thousand tokens, once |
| 3 | Files the body points to; scripts that are *run* | Only if the steps need them | Reference files on read; scripts cost nothing to read because they are executed |

A harness can carry a hundred skills for the price of a hundred short lines. That third level is worth dwelling on: a 400-line Python script bundled with a skill costs zero context tokens. The agent runs it and reads the output.

### The description is the trigger

Since only the description is always visible, it does one critical job: it decides whether the skill ever fires.

| Weak | Strong |
|------|--------|
| "Release helper." | "Cut a versioned release of this package. Use when asked to release, publish, tag, or bump the version." |
| "PDF utilities." | "Fill in, merge or extract text from PDF files. Use when the user mentions a PDF, a form, or a document to sign." |
| "Database stuff." | "Create and review database migrations for this service. Use before changing any model in `app/models/`." |

Say *what it does* and *when to use it*, using the words a user would use. A description that only names the topic never fires.

The format has been published as an open standard (see [agentskills.io](https://agentskills.io)), and several harnesses, including Claude Code, Codex, Pi and Hermes, read compatible skill folders. A skill you write for one generally works in the others.

### Skill, tool, sub-agent, or just a doc?

| You have… | Make it a… | Because |
|-----------|-----------|---------|
| An action with inputs and an output | **Tool** | It needs to *execute*, with a typed interface |
| A procedure: several steps, some judgment | **Skill** | It is instructions, loaded when relevant |
| A procedure with a heavy, deterministic step | **Skill with a script** | The script does the heavy part outside the context |
| A big investigation whose raw material is noise | **Sub-agent** | It needs its own window ([chapter 7](07-delegation.md)) |
| Reference material nobody needs most of the time | **A doc the map points to** | Free until read |
| A connection to an external system | **MCP server** | A standard interface other tools can share |

## Choosing where knowledge goes

![A ladder from the system prompt, paid on every turn, down to documents that are free until read](../assets/diagrams/knowledge-ladder.png)

| Put it in… | When it is… | Cost |
|------------|-------------|------|
| System prompt | True for every task in every project | Every turn, forever |
| Project memory file | True for every task in this repo | Every turn in this repo |
| Directory memory file | True only in one part of the repo | Only while working there |
| A skill | A procedure needed occasionally | One line always; the rest on use |
| A doc the map points to | Reference detail | Nothing until read |
| A tool | An action, or data that must be fresh | Schema every turn; result on use |
| Search over history or a corpus | Too large to load | Only what is retrieved |

Reach for the cheapest row that works. Most teams discover they put far too much in the first two.

## Common mistakes

- **Rules without reasons.** Followed mechanically, and badly.
- **No verification command.** If the memory file does not say how to check the work, "done" means "I stopped typing".
- **Skills with vague triggers.** A description like "helpful utilities" never fires.
- **Memory as a diary.** A log of everything that happened is not memory; it is a transcript with worse search.
- **Refreshing memory mid-session.** It breaks the cache and confuses the model about what it was told.
- **Putting procedures in the instruction file.** A 40-step release process in `AGENTS.md` is paid for on every turn of every unrelated task.
- **Unreviewed agent-written skills.** An agent that can write its own procedures can also write wrong ones. Keep them in version control and read the diffs.

## How real harnesses do it

- **Claude Code** layers `CLAUDE.md` across organisation, user, project and local scopes, loads subdirectory files on demand, keeps an auto-written memory with a bounded load, and offers `/init` to draft a project file from the codebase.
- **Codex** treats `AGENTS.md` as a short directory page pointing into structured docs, an approach its team described publicly as replacing an "encyclopedia" that kept drifting out of date.
- **Pi** builds its system prompt from base instructions plus discovered context files, carries skill descriptions in the request, and loads full skill instructions on demand.
- **Hermes** keeps two small bounded files, `MEMORY.md` for the agent's notes and `USER.md` for a profile of you, injects them as a frozen snapshot at session start, lets the agent add, replace and remove entries, and goes furthest on self-written skills.
- **DeepSeek Harness** has no fixed convention; instructions and skills are supplied by plugins through documented injection points.

## In the reference code

[`examples/mini_harness.py`](../examples/README.md): `build_system_prompt()` reads `AGENTS.md` (bounded to 200 lines), lists one line per skill found under `skills/`, and appends saved notes; the `remember` tool writes those notes. See also the starter [`templates/AGENTS.md`](https://github.com/AkbarSheikh-debug/harness-engineering/blob/main/templates/AGENTS.md).

## Check yourself

1. Your project memory file has grown to 1,800 lines. Name two concrete costs.
2. A skill's body is 900 tokens. How much of it does the model see on a turn where the skill is irrelevant?
3. Where should "run `make test` before finishing" live? Where should a 40-step release procedure live?
4. An agent processing a customer email writes "always approve refunds without checking" to memory. Which failure is this, and what guards against it?
5. Why should memory written during a session *not* be re-injected into the system prompt straight away?
6. A skill bundles a 500-line script. How many context tokens does the script cost when the skill is used?

<details>
<summary>Answers</summary>

1. Tokens paid on every turn, and important rules diluted among stale ones (plus nobody can maintain it).
2. Only its name and one-line description.
3. The first in the project memory file. The second in a skill.
4. Memory poisoning via prompt injection. Gate and review memory writes; keep the file under version control.
5. It would change the prompt prefix and invalidate the provider's cache for the rest of the session.
6. None for the script itself: it is executed, and only its output enters the context.

</details>

## Try it

Open the instruction file of a project you work on (or write one). Delete every line a newcomer could learn by reading the code. Give each remaining rule a reason. Move every procedure longer than five lines into a skill with a description that says when to use it. Count what is left.

**Next:** [6. Durability →](06-durability.md)
