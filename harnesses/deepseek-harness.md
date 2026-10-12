# DeepSeek Harness

> **The bet:** there should be no privileged core. Every part of the product is a plugin, including the model adapter, the tool registry, the session log and the agent loop itself.

**Maintainer:** DeepSeek · **Repository:** [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) · **Command:** `dsh` · **Language:** TypeScript · **Licence:** MIT

> Snapshot: October 2026. The project describes itself as a **developer preview** with compatibility-breaking changes expected. Read its safety notice before running it, and treat everything below as a description of the architecture at the time of writing.

## In one paragraph

Pi minimises the core. DeepSeek Harness (`dsh`) removes it. The project is built on a plugin framework called Cordis, in which plugins contribute services, typed events and reversible effects to a shared context. The architecture document puts it plainly: there is "no privileged core to patch", and you extend the system "by mounting a plugin beside the others". If the other harnesses in this section are applications, this one is closer to an operating system for agents.

## Three ideas to understand

### 1. Capability seams

A **seam** is a swappable capability with three roles:

```text
Service Definition   declares the interface      (e.g. "a filesystem")
        │
Service Provider     implements it               (local disk, remote sandbox, …)
        │
Consumer             uses it                     (usually a model-facing tool)
```

The model sees the same file tools whether the provider is your local disk or a remote sandbox. Swap the provider and the whole execution environment moves, with no change to the tool surface. The documentation notes that filesystem and subprocess providers share one execution world, so pointing them at a remote sandbox moves the shell, terminals and language servers along with them.

This answers a question every harness designer eventually meets: should the agent depend on **concrete tools** or on **capability interfaces**? The seam design chooses interfaces, and gets a pluggable environment as a result.

### 2. The loop as an event pipeline

Instead of a fixed "call model, run tools" function, a turn is a sequence of named events. Simplified from the architecture documentation:

```text
turn/start
  assemble prompt sections + tool schemas
  agent/pre-step          ← accept, rewrite or reject the input
  step/start
  agent/request           ← inspect or modify the model request
  llm/stream              ← the model call
  assistant/message
  tool/call
    tools/pre-execute     ← permission, policy, guards
    tools/execute
    tools/post-execute
  tool/result
  step/end
  (repeat while tools owe another request)
agent/turn-stopping       ← decide whether the turn may end
turn/end
```

Two vocabulary points from the docs are worth adopting anywhere: a **step** is one model request plus the tools it calls, and a **turn** is zero or more steps.

The events fall into three groups: durable **session events** that are written to the log; live **agent events** for observing or intercepting work in flight; and **capability events** that attach policy to a seam. The consequence is that most features need no change to the loop:

| You want to… | Attach to… |
|--------------|-----------|
| Add a permission check | `tools/pre-execute` |
| Inject memory or context | the pre-step stage, or an explicit inject call |
| Modify the request to the model | `agent/request` |
| Stop the agent finishing too early | `agent/turn-stopping` |
| Record behaviour | subscribe to session events |
| Add a model provider | register an adapter on the model service |

Compare this with [chapter 3](../guide/03-guardrails.md), where the gate is a function called before execution. Same idea, generalised: *every* stage is a place something can stand.

### 3. "Model-visible means logged"

The session log is append-only, and the model's view of history is **derived from the log** rather than stored beside it. On top of that the project states an invariant:

> Every model request must be reconstructable from the log. New model-visible inputs require session events.

This turns observability from a feature into a constraint. If something could reach the model without being logged, that is a bug by definition. Fork, resume, transcripts, telemetry and persistence all derive from the same record. It is the strongest form of the advice in [chapter 6](../guide/06-durability.md) and [chapter 9](../guide/09-evaluation.md).

## The nine parts

| Part | In DeepSeek Harness |
|------|---------------------|
| **Loop** | A default driver plugin implementing an `Agent` interface; replaceable |
| **Tools** | A scoped registry with a guarded execution pipeline; tools are consumers of capability seams |
| **Guardrails** | Sandbox backends and approval policy ship in the base bundle and attach at the pre-execute event |
| **Context** | Prompt sections and tool schemas are assembled each step; history is projected from the log |
| **Memory & skills** | Not a fixed convention; supplied by plugins and injected through the documented stages |
| **Durability** | Append-only, versioned session event log with explicit migrations and pluggable storage |
| **Delegation** | A sub-agent seam: a provider can be a fresh child agent or a delegated turn in another product. Agent teams are experimental |
| **Orchestration** | Named **profiles** selected at launch: a web app, a one-shot headless runner, an SDK server, and an automation server |
| **Evaluation** | The logging invariant, plus a telemetry seam |

### Profiles and bundles

A running `dsh` is a plugin tree composed at boot from ordered layers. A **profile** is a named composition; a **bundle** is a distributable set of plugin configuration. You can print the tree your machine boots and replace any row with a patch of your own. Configuration, in other words, *is* the architecture.

## What to steal

1. **Name the stages of your loop.** Even if you never build a plugin system, giving each stage a name and a hook makes permissions, memory and logging additions instead of rewrites.
2. **Depend on capabilities, not tools.** Define "filesystem" once and let local and remote implementations compete.
3. **Derive the model's view from the log.** One source of truth; resume, fork and replay follow.
4. **State observability as an invariant** and assert it at runtime.
5. **Distinguish durable events from live ones.** Decide deliberately which facts must survive a restart.

## What it costs

- **Configuration is the price of flexibility.** With no fixed core, there is more to understand before you can change anything safely.
- **Fewer conventions out of the box.** There is no built-in equivalent of a layered instruction file; you choose or build one.
- **Preview status.** Interfaces are still moving.

## Compared with the others

Claude Code, Codex and Pi each optimise a harness around a particular agent. DeepSeek Harness treats the harness as a platform on which *an* agent is one replaceable application. It is the logical end of the idea this guide began with: if everything outside the model is the harness, the harness can be its own system.

## Sources

- [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness): README (developer preview status, how to run)
- [Architecture document](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md): Cordis, profiles and bundles, events, turn flow, session log, capability seams, and the table of where new behaviour goes
- Supporting docs in the same repository: Cordis primer, capability seams, tool execution pipeline, session subsystem
- [Breaking down DeepSeek Harness's design](https://github.com/walkinglabs/learn-harness-engineering), from the *Learn Harness Engineering* course
