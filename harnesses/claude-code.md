# Claude Code

> **The bet:** ship a complete agent runtime. Memory, permissions, extension points and sub-agents are all in the box, with sensible defaults, so the harness works before you configure anything.

**Maintainer:** Anthropic · **Runs in:** terminal, IDE extensions, desktop and web apps · **Licence:** proprietary (the CLI is distributed publicly; it is not open source)

> Snapshot: October 2026. Feature names change between releases; check the [official docs](https://code.claude.com/docs).

## In one paragraph

At its centre is the loop from [chapter 1](../guide/01-the-loop.md): call the model, run the tools, append the results, repeat. What makes Claude Code interesting is how much carefully designed machinery surrounds that loop, and how cleanly the machinery is separated into mechanisms that each do one job. It is the most complete single example of all nine parts of this guide.

![Claude Code's four extension mechanisms around the loop: CLAUDE.md, skills, MCP servers and hooks](../assets/diagrams/claude-code-map.png)

## Four extension mechanisms, four jobs

The clearest lesson in Claude Code's design is that it does not have one generic "plugin" concept. It has four, and each answers a different question.

| Mechanism | Answers | Lives in | Loaded |
|-----------|---------|----------|--------|
| `CLAUDE.md` | *What* is true about this project? | Repo root, home directory, subfolders | Always, by scope |
| Skills | *How* do I do this procedure? | `.claude/skills/<name>/SKILL.md` | One line always; the body on demand |
| MCP | *Where* do I reach external systems? | Server configuration | Schemas up front; calls on demand |
| Hooks | *When* must something be enforced? | `settings.json` | Never in context; runs outside the model |

Confusing them is a common source of trouble. A 300-line procedure pasted into `CLAUDE.md` costs tokens on every turn; a hard rule written as a polite sentence instead of a hook will eventually be ignored.

## The nine parts

### 1. Loop

A single-threaded agent loop with streaming, interruption and a visible turn structure. The same loop is available programmatically through the Claude Agent SDK and in a non-interactive print mode, so scripts can drive it.

### 2. Tools

A deliberately small built-in set: read, write, edit (exact-match replacement, with the uniqueness rule from [chapter 2](../guide/02-tools.md)), search by content and by filename, shell, web fetch and search, and task tracking. Everything beyond that arrives through **MCP** servers, which lets teams connect issue trackers, databases and browsers without touching the core.

### 3. Guardrails

Two complementary mechanisms.

**Permission modes and rules.** A default mode that asks before side effects; a plan mode that reads but does not change; modes that auto-accept edits; and a bypass mode intended for sandboxes. Fine-grained rules live in settings files that can be committed and shared:

```json
{
  "permissions": {
    "allow": ["Bash(npm run test:*)", "Bash(git diff:*)"],
    "deny":  ["Read(./.env)", "Read(./secrets/**)", "Bash(git push:*)"]
  }
}
```

Rules are matched per tool, with patterns over the arguments. Deny rules win.

**Hooks.** Commands the harness runs at lifecycle events. A hook receives the event as JSON on stdin, and its exit status and output decide what happens next.

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write",
        "hooks": [ { "type": "command", "command": "npm run lint --silent" } ] }
    ]
  }
}
```

| Event | Fires | Typical use |
|-------|-------|-------------|
| `PreToolUse` | Before a tool runs | Block a dangerous call with a reason |
| `PostToolUse` | After a tool returns | Lint or type-check the file just edited; feed errors back |
| `UserPromptSubmit` | When you send a message | Inject context; reject a prompt |
| `Stop` | When the agent tries to finish | Refuse to stop while tests fail |
| `SessionStart` | At session start | Load project state |
| `PreCompact` | Before compaction | Save state that should survive the fold |

Because hooks are ordinary deterministic programs, they are where hard rules belong. This pairing is a clean illustration of the principle from [chapter 3](../guide/03-guardrails.md): prompts shape behaviour, code enforces limits.

### 4. Context

Automatic compaction when the window fills, a manual `/compact` (which accepts instructions on what to preserve), and `/clear` to start fresh. A third-party source-level analysis of one release (VILA Lab's *Dive into Claude Code*) describes compaction as a staged pipeline: inexpensive, lossless pruning of redundant tool output first, model-written summaries last. Whatever the exact stages in the current version, the ordering principle is the one to copy.

### 5. Memory and skills

The memory design is the most influential part.

| Layer | Location | What it holds |
|-------|----------|---------------|
| Organisation policy | A managed system path | Company-wide rules |
| User | `~/.claude/CLAUDE.md` | Your preferences everywhere |
| Project | `./CLAUDE.md` | How this repository works; committed to git |
| Local | An untracked file in the repo | Your private notes on this project |
| Subdirectory | `CLAUDE.md` files deeper in the tree | Loaded only when the agent works there |
| Auto memory | Managed by the agent | Notes it writes for itself; a bounded amount loads per session |

More specific layers load later and so take precedence. Files can import others, and `/init` drafts a project file by reading the codebase.

**Skills** are folders with a `SKILL.md`. Only the name and description are always in context; the body loads when a task matches:

```markdown
---
name: db-migration
description: Create and review database migrations. Use before changing any model in app/models/.
---
1. Run `alembic revision --autogenerate -m "<what changed>"`.
2. Read the generated file. Autogenerate misses renames; fix them by hand.
3. Run `alembic upgrade head` against the test database, then `pytest tests/db`.
```

### 6. Durability

Sessions are stored as append-oriented JSONL files, one per session. You can resume a past session, fork it, and rewind to an earlier checkpoint, restoring files as well as conversation.

### 7. Delegation

Built-in sub-agents, each with its own context window, a tool allowlist, and optionally its own model and system prompt, defined as Markdown files:

```markdown
---
name: code-reviewer
description: Reviews a finished change for bugs and scope creep. Use after implementing a feature.
tools: Read, Grep, Glob, Bash
model: sonnet
---
You are reviewing a change you did not write. Report problems as file:line with a
one-line fix. Do not praise. Do not rewrite code.
```

Their transcripts are stored separately from the parent's, so a sub-agent's forty file reads never enter the main window. This is the "fresh context, least privilege, own budget" recipe from [chapter 7](../guide/07-delegation.md) in product form.

### 8. Orchestration

A headless mode with structured output (`-p` with a JSON or streaming-JSON format), the Agent SDK for embedding the loop in your own program, background tasks, and scheduled or remotely triggered agents.

### 9. Evaluation

Hooks again. A post-tool hook can run a linter or tests after every edit and feed the result back; a stop hook can refuse to let the agent finish while checks are failing. That moves "is it done?" from the model's opinion to a command's exit code.

## A closer look: why hooks matter so much

Anthropic's own writing on long-running agents notes that agents tend to judge their own work generously. A system prompt line saying "run the tests before finishing" is followed most of the time. A `Stop` hook that runs the tests and blocks on failure is followed every time, because the model's cooperation is not involved.

The general pattern, worth lifting into any harness:

```text
soft rule in the prompt   →  followed usually   →  good for style and preference
hard rule in a hook       →  followed always    →  required for safety and "done"
```

If you find yourself writing the same instruction in capital letters, it wants to be a hook.

## What to steal

1. **Layer instructions by scope**, and load directory-specific files only when the agent is in that directory.
2. **Separate the four jobs.** Facts, procedures, connections and enforcement each get their own mechanism.
3. **Compact in stages**: lossless first, lossy last.
4. **Enforce with hooks, not prose.** Anything that must always happen should be code that runs outside the model.
5. **Give sub-agents their own transcript files.** Isolation for the parent, evidence for you.
6. **Make sessions replayable**: append-only storage is what makes resume, fork and rewind cheap.
7. **Put permission rules in shareable files**, so a team gets the same guardrails.

## What it costs

- **Surface area.** Many mechanisms means a real learning curve, and several places a behaviour could be coming from.
- **A closed core.** You extend it at the edges; you cannot change how the loop itself works.
- **Tied to one model family.** The harness is designed around Claude models.

## Sources

- Claude Code documentation: [memory](https://code.claude.com/docs/en/memory), [skills](https://code.claude.com/docs/en/skills), [hooks](https://code.claude.com/docs/en/hooks), [sub-agents](https://code.claude.com/docs/en/sub-agents), [MCP](https://code.claude.com/docs/en/mcp), [permission modes](https://code.claude.com/docs/en/permission-modes)
- Anthropic, [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- Anthropic, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- VILA Lab, [Dive into Claude Code](https://zhiqiangshen.com/projects/Claude_Code_Report/Claude_Code_Report.pdf) (independent analysis of one release; details may not match current behaviour)
- [Breaking down Claude Code's harness design](https://github.com/walkinglabs/learn-harness-engineering), from the *Learn Harness Engineering* course
