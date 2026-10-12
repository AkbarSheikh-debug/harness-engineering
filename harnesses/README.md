# Harnesses in the wild

The [guide](../guide/00-what-is-a-harness.md) builds a harness from nothing. This section runs the film backwards: it takes five real, widely used harnesses and asks the same nine questions of each.

The point is not to pick a winner. It is to see that every team faced the same problems and made *different* trade-offs, and to learn which trade-off suits your situation.

> **Snapshot: October 2026.** These projects ship weekly. Treat version-specific details as a starting point and follow the links to primary sources. Where a claim comes from a third-party analysis rather than official documentation, the page says so.

## Five bets

![A sketch placing Claude Code, Codex, Pi, Hermes and DeepSeek Harness by design emphasis](../assets/diagrams/landscape.png)

| Harness | Maintainer | Language | Licence | The bet |
|---------|-----------|----------|---------|---------|
| [Claude Code](claude-code.md) | Anthropic | TypeScript | Proprietary | A complete runtime works out of the box: memory, permissions, hooks, skills, sub-agents |
| [Codex](codex.md) | OpenAI | Rust | Apache-2.0 | A lean core, with knowledge in the repository and safety in an OS sandbox |
| [Pi](pi.md) | Earendil Works | TypeScript | MIT | A minimal core; everything else is an extension you write or install |
| [Hermes Agent](hermes.md) | Nous Research | Python | MIT | An always-on personal agent that learns: it writes and improves its own skills |
| [DeepSeek Harness](deepseek-harness.md) | DeepSeek | TypeScript | MIT | Everything is a plugin, including the agent loop |

And one page that is not a harness at all:

- [OpenRouter](openrouter.md): the model-access layer. It is here because every harness needs a provider, and choosing one is a harness design decision.

## The same nine questions

| Part | Claude Code | Codex | Pi | Hermes | DeepSeek Harness |
|------|-------------|-------|----|--------|------------------|
| **Loop** | Built in; also exposed as an SDK | Built in (Rust) | A small agent-core package | One core shared by CLI, gateway, TUI and desktop | The default loop is a replaceable plugin |
| **Tools** | Compact built-in set, plus MCP | Shell and patch tools, plus MCP | A few built-ins; register more from extensions | Dozens, grouped into toolsets, plus MCP | A scoped registry behind "capability seams" |
| **Guardrails** | Permission modes, allow/deny rules, hooks | Approval policy plus OS sandbox | None built in; containerise it | Command approval; container and remote backends | Pre-execute policy, guards, fail-closed approval |
| **Context** | Automatic and manual compaction | Automatic and manual compaction | Token-budget compaction, extensible | Compression under a strict cache-preserving rule | Model view derived from an event log |
| **Memory & skills** | Layered `CLAUDE.md`, auto memory, skills | `AGENTS.md` as a short directory page; skills | Context files, skills, prompt templates | Bounded `MEMORY.md` and `USER.md`; self-written skills | Supplied by plugins |
| **Durability** | JSONL sessions, resume, rewind | Resumable session files, worktrees | Sessions stored as a JSONL tree | Local database with full-text search | Append-only, versioned event log |
| **Delegation** | Built-in sub-agents | Spawn and wait tools | Not in the core, by choice | Isolated children; background results | A sub-agent seam with declared capabilities |
| **Orchestration** | Headless mode, SDK, scheduled agents | Non-interactive exec; cloud tasks | Print, JSON and RPC modes; SDK | Cron scheduler and messaging gateway | Headless, SDK and automation profiles |
| **Evaluation** | Hooks for in-loop checks | Verification commands in the repo | Telemetry and eval packages | Batch trajectories | "Model-visible means logged" invariant |

## How to read a teardown

Each page follows the same outline:

1. **The bet.** What the designers optimised for, in a sentence or two.
2. **The nine parts.** How it answers each question from the guide.
3. **A closer look.** The one or two mechanisms most worth understanding in detail.
4. **What to steal.** Ideas worth copying into your own harness, whatever you build on.
5. **What it costs.** The trade-off that comes with the bet.
6. **Sources.** Where to verify every claim.

## Three axes that explain most of the differences

### Batteries or bricks?

Claude Code gives you a finished runtime. Pi and DeepSeek Harness give you a kit. A finished runtime is faster to adopt and harder to bend; a kit is the reverse.

| | Finished runtime | Kit |
|---|------------------|-----|
| Day one | Works immediately | You assemble it |
| Unusual workflow | You work around the defaults | You build exactly what you need |
| Who it suits | Teams that want good behaviour now | Teams with strong opinions and time |

### Where does safety live?

There are three honest answers, and every harness picks a mix.

| Answer | Example | Strength | Weakness |
|--------|---------|----------|----------|
| In **policy** | Claude Code's permission rules and hooks | Fine-grained; explains itself | Only as good as the rules |
| In **containment** | Codex's kernel-enforced sandbox | Covers everything the shell launches | Platform-specific; coarse |
| **Outside the harness** | Pi: "run it in a container" | Simple core; strongest boundary when done | Entirely up to you |

Combining policy with containment is the most robust arrangement.

### Where does knowledge live?

In the *harness's memory* (Claude Code, Hermes) or in the *repository* (Codex's documented conventions).

| | Harness memory | The repository |
|---|----------------|----------------|
| Maintained by | The agent, mostly | People and agents, through review |
| Visible to humans | With effort | Always |
| Portable across tools | No | Yes |
| Personal preferences | A natural fit | A poor fit |

Most teams end up with both: project knowledge in the repo, personal preferences in the harness.

## What they all agree on

Underneath the differences, five designs converge on the same handful of ideas. That agreement is the strongest evidence that the [guide](../guide/00-what-is-a-harness.md) describes something real.

- The loop is small; the surrounding systems are where the work is.
- Sessions are append-only logs, and the model's view is derived from them.
- Instructions live in files, loaded by scope.
- Skills use progressive disclosure, in a shared open format.
- Compaction exists everywhere, and everyone treats it as a necessary loss.
- A blocked or failed tool call returns to the model as a message.

## A reading order

- Building your own? Read [Pi](pi.md) first: it is the closest to the minimal harness in this guide, at production quality.
- Want the fullest feature set to map onto the nine parts? Read [Claude Code](claude-code.md).
- Running agents at scale on a codebase? Read [Codex](codex.md) and then [the repo as system of record](../practice/repo-as-system-of-record.md).
- Want an agent that runs for weeks and improves? Read [Hermes](hermes.md).
- Designing a platform other people will extend? Read [DeepSeek Harness](deepseek-harness.md).
