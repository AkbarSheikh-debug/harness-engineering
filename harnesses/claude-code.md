# Claude Code

> **The bet:** ship a complete agent runtime. Memory, permissions, extension points and sub-agents are all in the box, with sensible defaults, so the harness works before you configure anything.

**Maintainer:** Anthropic · **Runs in:** terminal, IDE extensions, desktop and web apps · **Licence:** proprietary (the CLI is distributed publicly; it is not open source)

> Snapshot: October 2026. Feature names change between releases; check the [official docs](https://code.claude.com/docs).

## In one paragraph

At its centre is the loop from [chapter 1](../guide/01-the-loop.md): call the model, run the tools, append the results, repeat. What makes Claude Code interesting is how much carefully designed machinery surrounds that loop, and how cleanly the machinery is separated into mechanisms that each do one job. It is the most complete single example of all nine parts of this guide.

## The nine parts

### 1. Loop

A single-threaded agent loop with streaming, interruption and a turn structure you can observe. The same loop is available programmatically through the Claude Agent SDK and in a non-interactive print mode, so scripts can drive it.

### 2. Tools

A deliberately small built-in set: read, write, edit (exact-match replacement), search by pattern and by filename, shell, web fetch and search, and task tracking. Everything beyond that arrives through **MCP** servers, which lets teams connect issue trackers, databases and browsers without touching the core.

### 3. Guardrails

Two complementary mechanisms:

- **Permission modes and rules.** A default mode that asks before side effects; a plan mode that reads but does not change; modes that auto-accept edits; and a bypass mode intended for sandboxes. Fine-grained allow and deny rules live in settings files that can be shared with a team.
- **Hooks.** Shell commands the harness runs at lifecycle events such as before a tool call, after a tool call, and when the agent tries to stop. A hook can block an action or inject feedback. Because hooks are ordinary deterministic code, they are where hard rules belong.

This pairing is a clean illustration of [chapter 3](../guide/03-guardrails.md): prompts shape behaviour, code enforces limits.

### 4. Context

Automatic compaction when the window fills, a manual `/compact`, and `/clear` to start fresh. A third-party source-level analysis of one release (VILA Lab's *Dive into Claude Code*) describes the compaction as a staged pipeline: inexpensive, lossless pruning of redundant tool output first, model-written summaries last. Whatever the exact stages in the current version, the ordering principle is the one to copy.

### 5. Memory and skills

The memory design is the most influential part.

| Layer | What it is |
|-------|-----------|
| Organisation policy | A managed `CLAUDE.md` for company-wide rules |
| User | `~/.claude/CLAUDE.md`: your preferences everywhere |
| Project | `./CLAUDE.md`: how this repository works, committed to git |
| Local | An untracked file for your private notes on this project |
| Subdirectory | `CLAUDE.md` files deeper in the tree, loaded only when the agent works there |
| Auto memory | Notes the agent writes for itself, with a bounded amount loaded per session |

More specific layers load later and so take precedence. `/init` drafts a project file by reading the codebase.

**Skills** are folders with a `SKILL.md`: only the name and description are always in context, and the body loads when a task matches. This is progressive disclosure, exactly as described in [chapter 5](../guide/05-memory-and-skills.md).

### 6. Durability

Sessions are stored as append-oriented JSONL files. You can resume a past session, fork it, and rewind to an earlier checkpoint, restoring files as well as conversation.

### 7. Delegation

Built-in sub-agents, each with its own context window, tool allowlist and optional custom system prompt, defined as Markdown files. Their transcripts are stored separately from the parent's, so a sub-agent's forty file reads never enter the main window.

### 8. Orchestration

A headless mode with structured output, the Agent SDK for embedding the loop in your own program, background tasks, and scheduled or remotely triggered agents.

### 9. Evaluation

Hooks again. A post-tool hook can run a linter or tests after every edit and feed the result back; a stop hook can refuse to let the agent finish while checks are failing. That moves "is it done?" from the model's opinion to a command's exit code.

## Four extension mechanisms, four jobs

The clearest lesson in Claude Code's design is that it does not have one generic "plugin" concept. It has four, and each answers a different question:

| Mechanism | Answers | Loaded |
|-----------|---------|--------|
| `CLAUDE.md` | *What* is true about this project? | Always |
| Skills | *How* do I do this procedure? | On demand |
| MCP | *Where* do I reach external systems? | Schemas up front; calls on demand |
| Hooks | *When* must something be enforced? | Never in context; runs outside the model |

Confusing them is a common source of trouble. A 300-line procedure pasted into `CLAUDE.md` costs tokens on every turn; a hard rule written as a polite sentence instead of a hook will eventually be ignored.

## What to steal

1. **Layer instructions by scope**, and load directory-specific files only when the agent is in that directory.
2. **Compact in stages**: lossless first, lossy last.
3. **Enforce with hooks, not prose.** Anything that must always happen should be code that runs outside the model.
4. **Give sub-agents their own transcript files.** Isolation for the parent, evidence for you.
5. **Make sessions replayable**: append-only storage is what makes resume, fork and rewind cheap.

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
