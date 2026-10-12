# Pi

> **The bet:** a minimal core that decides as little as possible for you. Anything beyond the essentials is an extension that you write, install, or ask Pi itself to build.

**Maintainer:** Earendil Works (created by Mario Zechner) · **Repository:** [earendil-works/pi](https://github.com/earendil-works/pi) · **Language:** TypeScript · **Licence:** MIT · **Site:** [pi.dev](https://pi.dev)

> Snapshot: October 2026. Details below are taken from the project's README and its documentation in `packages/coding-agent/docs/`. Check the repository for current behaviour.

## In one paragraph

Pi describes itself as "a minimal, extensible agent harness that you can make your own." That is unusually honest positioning. The README says outright that Pi ships strong defaults but leaves out features such as sub-agents and plan mode, and that it has no built-in permission system. Where other harnesses add a feature, Pi adds an extension point and lets you choose. If you want to understand what the *smallest serious* harness looks like, this is the one to read.

![Pi's package stack on the left; its four customisation layers and what is deliberately left out on the right](../assets/diagrams/pi-stack.png)

## How it is assembled

Pi is a monorepo of small packages, and the layering is itself a lesson in harness architecture.

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

Pi's own description of its loop is worth quoting in paraphrase, because it is the clearest three-sentence statement of [chapter 1](../guide/01-the-loop.md) you will find in any project's docs:

- A submitted message is added to the active branch. Pi builds a model request from the system prompt, the active branch, the available tools and the model settings.
- The provider streams an assistant response, which can contain text and tool calls. Pi records the response, executes each tool call, and records the results. That completes one **turn**.
- If tool results or queued messages require another request, Pi starts another turn. Otherwise the run ends.

It also names two kinds of mid-run input precisely: **steering** messages enter after the current assistant turn; **follow-up** messages enter after the agent has finished its pending work. Aborting stops the run and returns queued messages to the editor.

### 2. Tools

A handful of built-ins for files and shell. Everything else is registered from an extension, or arrives as a skill.

### 3. Guardrails

None in the core, by design, and the security guide is blunt about it:

- Pi does not ask for approval before each tool call.
- Enabled tools run with the operating-system permissions of the Pi process, and extensions execute inside that process.
- Watching the transcript, trusting the project and reviewing changes are useful habits, and the guide is explicit that none of them is a security boundary.

What Pi does have is **project trust**: before loading a project's settings, extensions and resources, it asks whether you trust the project. That controls what *loads*, not what the agent may *do*.

The guide then lays out where a real boundary can come from:

| How Pi runs | What stays protected |
|-------------|----------------------|
| Directly, as your user | Only what that user cannot reach |
| Entirely inside a container, VM or sandbox | Host files and processes you did not expose. The guide rates this as usually the strongest practical choice |
| Outside, with its built-in tools routed into an isolated environment | Host resources from those tools only; Pi itself and other extensions remain outside |

This is the "safety lives outside the harness" answer from [the comparison page](README.md), stated without euphemism.

### 4. Context

See the closer look below.

### 5. Memory and skills

- The system prompt is built from Pi's base instructions plus discovered **context files** (`AGENTS.md`, with `CLAUDE.md` compatibility). The request also carries tool definitions and skill descriptions.
- A `SYSTEM.md` can replace or append to the default system prompt per project.
- **Skills** provide on-demand instructions and supporting files; full instructions load only when needed.
- **Prompt templates** expand editor input before it becomes a user message.
- The default system prompt is deliberately short, which keeps the cached prefix small and stable.

### 6. Durability

See the closer look below.

### 7. Delegation

Not in the core. The project's stance is that sub-agents come in many shapes, so you install or build the one you want.

### 8. Orchestration

Four doors into the same engine:

| Mode | What it does |
|------|--------------|
| Interactive | Renders session and agent events in the terminal |
| Print | Runs a prompt and writes the final response |
| JSON | Writes agent events as JSONL |
| RPC | Accepts JSONL commands on stdin; writes responses and events to stdout |

Plus a TypeScript SDK that creates and controls sessions in process. The documentation notes that all interfaces use the same agent and session mechanisms, which is exactly the "one loop, two entrances" idea from [chapter 8](../guide/08-orchestration.md).

### 9. Evaluation

Telemetry and evaluation packages sit beside the core. The project also encourages publishing session traces from open-source work, treating real transcripts as shared data for improving models and tools.

## A closer look: sessions as a tree

Most harnesses store a session as a list. Pi stores it as a tree, and the format is simple enough to copy.

- Sessions are **JSONL** files. Each line is a JSON object with a `type`.
- Each entry has an `id` and a `parentId`. That is what makes it a tree.
- Each path through the tree is a **branch**. The branch ending at the current entry is the *active branch*, and it alone supplies the history for the next model request.
- Continuing from an earlier entry creates another branch **in the same file**. Forking and cloning copy selected history into a new file.
- The file has a **version** in its header, and older versions are migrated automatically on load.

```text
m1 ── m2 ── m3 ── m4 ── m5 ── m6      ← abandoned branch (still in the file)
                   └── m5b ── m6b     ← active branch: history = m1..m4, m5b, m6b
```

The consequence is that "go back to before that mistake and try differently" is not a special feature. It is appending an entry whose parent is not the last line.

## A closer look: compaction, exactly

Pi documents its compaction algorithm precisely, which makes it a good reference implementation for [chapter 4](../guide/04-context.md).

**When it triggers:**

```text
contextTokens > contextWindow − reserveTokens
```

`reserveTokens` defaults to 16,384, leaving room for the model's reply. The check runs between turns, after tool results are appended and before the next assistant response. A provider context-overflow error can also trigger one compact-and-retry recovery attempt.

**How it works:**

1. **Find the cut point.** Walk backwards from the end, accumulating token estimates, until `keepRecentTokens` (default 20,000) is reached.
2. **Extract** the messages from the previous kept boundary up to the cut.
3. **Summarise** with a structured format, passing the *previous summary* as context when there is one.
4. **Append a compaction entry** holding the summary and the id of the first kept entry.
5. **Rebuild** the context from the summary plus everything from that entry onwards.

Two details are easy to miss and worth stealing. The original entries **remain in the session tree**; compaction changes what the model sees, not what is stored. And summarisation requests **disable prompt-cache writes**, because a one-off summarising prompt will never be reused.

There is a second mechanism, **branch summarisation**: when you navigate to a different branch, Pi summarises the branch you are leaving so its context is not lost.

Both are exposed to extensions, so the strategy is replaceable: summarise by topic, be code-aware, or use a different model.

## A closer look: extensions

An extension is a TypeScript module that exports a factory. Pi loads it directly, with no build step.

```typescript
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerCommand("hello", {
    description: "Show a greeting",
    handler: async (name, ctx) => { ctx.ui.notify(`Hello, ${name || "world"}!`, "info"); },
  });
}
```

| You want to… | Use |
|--------------|-----|
| Observe or modify lifecycle behaviour | `pi.on(event, handler)` |
| Add an operation the model can call | `pi.registerTool()` |
| Add a `/` command | `pi.registerCommand()` |
| Add a shortcut or a CLI flag | `pi.registerShortcut()`, `pi.registerFlag()` |
| Send user or custom messages | `pi.sendUserMessage()`, `pi.sendMessage()` |
| Persist data that is not part of the context | `pi.appendEntry()` |

The lifecycle events run from input and `before_agent_start`, through model, message and tool events, to `agent_end`. `agent_before_settle` is the last point at which an extension can append entries and request one more continuation, the hook you would use for "do not finish until the tests pass". `agent_settled` is notification only.

The documentation's examples of what extensions typically do read like the guardrails chapter of this guide: add a tool, protect paths, confirm dangerous commands, modify context, display status. Pi leaves these out of the core and gives you the surface to add them.

These can be bundled as **Pi packages**, alongside skills, prompt templates and themes, and shared through npm or git.

## The idea worth dwelling on

> A harness that exposes enough of its own event surface can be improved *by the agent it runs*.

Because extensions are ordinary code in a documented API, you can ask Pi to write an extension that changes Pi. The harness becomes a thing the agent can work on, not just work in.

## What to steal

1. **Separate the provider client, the loop and the product.** Three libraries, three reasons to change.
2. **Store sessions as a tree.** An `id` and a `parentId` on every entry; branching and rewinding come for free.
3. **State the compaction trigger as a formula**, and choose the cut by tokens.
4. **Keep the originals.** Compaction appends a summary entry; it never deletes.
5. **Make compaction a strategy, not a constant.**
6. **Keep the system prompt small.** Load rules on demand; it is cheaper and friendlier to caching.
7. **Ship the programmatic doors early.** JSON, RPC and an SDK turn a tool into a component.
8. **Be honest in your security docs** about what is and is not a boundary.

## What it costs

- **You assemble it.** No permissions, plan mode or sub-agents until you add them.
- **Safety is your job.** Run it unboxed and it has your privileges.
- **Extensions run in-process**, with full access to prompts, files and credentials. Load only what you trust.
- **Choice overhead.** A kit rewards people who know what they want.

## Sources

- [earendil-works/pi](https://github.com/earendil-works/pi): README, package list, and the note on permissions and containerisation
- Documentation in [`packages/coding-agent/docs/`](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/docs): `how-pi-works.md`, `compaction.md`, `session-format.md`, `extensions.md`, `security.md`
- [pi.dev](https://pi.dev)
- [Breaking down Pi's harness design](https://github.com/walkinglabs/learn-harness-engineering), from the *Learn Harness Engineering* course
