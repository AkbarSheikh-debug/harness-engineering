# Pi

> **The bet:** a minimal core that decides as little as possible for you. Anything beyond the essentials is an extension that you write, install, or ask Pi itself to build.

**Maintainer:** Earendil Works (created by Mario Zechner) · **Repository:** [earendil-works/pi](https://github.com/earendil-works/pi) · **Language:** TypeScript · **Licence:** MIT · **Site:** [pi.dev](https://pi.dev)

> Snapshot: October 2026. Check the repository for current behaviour.

## In one paragraph

Pi describes itself as "a minimal, extensible agent harness that you can make your own." That sentence is unusually honest positioning. The README says outright that Pi "ships with powerful defaults but skips features like sub-agents and plan mode", and that it has no built-in permission system. Where other harnesses add a feature, Pi adds an extension point and lets you choose. If you want to understand what the *smallest serious* harness looks like, this is the one to read.

## How it is assembled

Pi is a monorepo of small packages, and the layering is itself a lesson in harness architecture:

| Package | Role | Guide chapter |
|---------|------|---------------|
| `pi-ai` | One API across many model providers | Provider layer ([OpenRouter](openrouter.md)) |
| `pi-agent-core` | The agent runtime: tool calling and state | [The loop](../guide/01-the-loop.md) |
| `pi-durable` | Durable conversations, tasks and documents | [Durability](../guide/06-durability.md) |
| `pi-coding-agent` | The interactive coding CLI built on the above | Everything |
| `pi-tui` | Terminal UI library | Interface |
| `pi-telemetry` | Vendor-neutral telemetry contracts | [Evaluation](../guide/09-evaluation.md) |

The provider client, the loop and the product are separate libraries. You can use the loop without the CLI.

## The nine parts

### 1. Loop

The standard loop, in a reusable package. Its interesting property is how many ways you can drive it: interactively, in print or JSON mode for scripts, over an RPC protocol, or embedded through a TypeScript SDK. A harness you can only drive by hand can never join an automated pipeline; Pi treats the programmatic doors as first-class.

### 2. Tools

A handful of built-ins for files and shell. Everything else is added through two mechanisms:

- **Skills:** self-contained capability packages loaded on demand, following the open [Agent Skills](https://agentskills.io) format.
- **Extensions:** TypeScript modules that hook lifecycle events and can register tools.

### 3. Guardrails

None in the core, by design. The README states that Pi runs with the permissions of the user who launched it, and points to three containment patterns instead: a micro-VM extension that routes tool execution into an isolated Linux guest, plain Docker, and a policy-controlled sandbox. A permission gate, if you want one, is an extension that intercepts tool calls.

This is the "safety lives outside the harness" answer from [the comparison page](README.md). It is a legitimate position, as long as you actually build the box.

### 4. Context

Automatic compaction as the window fills, plus a manual command. The documentation describes keeping a recent slice of the conversation verbatim and folding earlier messages into a handoff summary, chained incrementally. The distinctive part is that **the compaction strategy is replaceable**: an extension can summarise by topic, be code-aware, or use a different model for the summary.

Extensions can also inject messages before each turn and filter the history, which is enough to build retrieval or long-term memory outside the core.

### 5. Memory and skills

- `AGENTS.md` is loaded from the global config directory, from each parent directory walking upward, and from the current directory.
- A `SYSTEM.md` can replace or append to the default system prompt per project.
- **Prompt templates** are reusable Markdown prompts invoked by name.
- The default system prompt is deliberately short. Rules arrive as skills and extensions when needed, which keeps the cached prefix small and stable.

### 6. Durability

Sessions are stored as **trees**, not lines: every message has a parent, branches live in the same file, and you can jump back to any earlier node and continue from there. Sessions can be exported and shared. This is the "forks and trees" idea from [chapter 6](../guide/06-durability.md) as a core data structure.

### 7. Delegation

Not in the core. The project's stance is that sub-agents come in many shapes, so you install or build the one you want.

### 8. Orchestration

Supplied by the driving modes above: JSON output, RPC and the SDK. Pi is used as the engine inside other products in exactly this way.

### 9. Evaluation

Telemetry and evaluation packages sit beside the core. The project also encourages publishing session traces from open-source work, treating real transcripts as shared data for improving models and tools.

## Four customisation layers

| Layer | What it changes | Written in |
|-------|-----------------|------------|
| Extensions | Runtime behaviour: tools, hooks, context | TypeScript |
| Skills | Procedures the agent can load | Markdown plus scripts |
| Prompt templates | Reusable prompts | Markdown |
| Themes | How the terminal looks | Config |

These can be bundled as **Pi packages** and shared through npm or git.

## The idea worth dwelling on

> A harness that exposes enough of its own event surface can be improved *by the agent it runs*.

Because extensions are ordinary code in a documented API, you can ask Pi to write an extension that changes Pi. The harness becomes a thing the agent can work on, not just work in.

## What to steal

1. **Separate the provider client, the loop and the product.** Three libraries, three reasons to change.
2. **Make compaction a strategy, not a constant.** Different tasks want different summaries.
3. **Store sessions as a tree.** Branching and "go back to before that mistake" come for free.
4. **Keep the system prompt small.** Load rules on demand; it is cheaper and friendlier to caching.
5. **Ship the programmatic doors early.** JSON, RPC and an SDK turn a tool into a component.

## What it costs

- **You assemble it.** No permissions, plan mode or sub-agents until you add them.
- **Safety is your job.** Run it unboxed and it has your privileges.
- **Choice overhead.** A kit rewards people who know what they want.

## Sources

- [earendil-works/pi](https://github.com/earendil-works/pi): README, package list, and the note on permissions and containerisation
- [Pi coding agent README and docs](https://github.com/earendil-works/pi/tree/main/packages/coding-agent)
- [pi.dev](https://pi.dev) documentation: sessions, extensions, project context
- [Breaking down Pi's harness design](https://github.com/walkinglabs/learn-harness-engineering), from the *Learn Harness Engineering* course
