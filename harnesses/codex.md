# Codex

> **The bet:** keep the core lean. Put the project's knowledge in the repository, where it is versioned and checkable, and put safety in an operating-system sandbox, where it does not depend on the model's good behaviour.

**Maintainer:** OpenAI · **Repository:** [openai/codex](https://github.com/openai/codex) · **Language:** Rust · **Licence:** Apache-2.0

> Snapshot: October 2026. Check the repository and docs for current behaviour.

## In one paragraph

Codex CLI is an open-source coding agent that runs locally, with IDE, desktop and cloud counterparts. As software, it is a restrained design: a fast native binary, a short list of tools, a real sandbox. Its larger contribution to this field is a set of *working practices*. The phrase "harness engineering" was popularised by OpenAI's account of building a large product almost entirely with Codex, and most of what that account describes happens in the repository rather than in the agent.

## The nine parts

### 1. Loop

A conventional agent loop implemented in Rust, with an interactive terminal UI and a non-interactive mode for scripts and CI.

### 2. Tools

Few, and centred on the shell. Edits go through a patch-application tool: the model writes a structured diff and the harness applies it, which keeps edits small and makes failures explicit. MCP servers extend the set.

### 3. Guardrails

This is where Codex is most distinctive. It combines two independent dials:

| Dial | Options | Controls |
|------|---------|----------|
| **Sandbox mode** | read-only · workspace-write · full access | What the process is *able* to do, enforced by the OS (Seatbelt on macOS; Landlock and seccomp on Linux) |
| **Approval policy** | from "ask for anything untrusted" to "never ask" | When a human is consulted |

Because the sandbox is enforced by the kernel, it covers everything the shell can launch, not just the harness's own tools. With writes confined to the workspace and the network off, the agent can run commands freely without a prompt for each one. That is the "sandbox" half of [chapter 3](../guide/03-guardrails.md), done properly.

### 4. Context

Automatic compaction plus a manual command, with a customisable compaction prompt. Community source analysis notes an efficiency detail worth copying: environment context (working directory, branch and so on) is re-sent only when it *changes*, as a delta, rather than repeated every turn.

The community often summarises Codex's context approach as four verbs, **write, select, compress, isolate**, which this guide also uses in [chapter 4](../guide/04-context.md).

### 5. Memory and skills

`AGENTS.md`, an open convention now read by many tools. Codex's team described a specific lesson about it:

- They began with one large instruction file and found it impossible to keep current. Nothing could check it for coverage or freshness, so it drifted.
- They replaced it with a short file, on the order of a hundred lines, that works as a **directory page**: what the repo is, how to verify work, the non-negotiable rules, and pointers into structured documentation under `docs/`.
- Their guidance on content: state **invariants** and how to verify them; do not micromanage implementation.

See [the repo as system of record](../practice/repo-as-system-of-record.md) for this pattern in full.

### 6. Durability

Sessions are recorded to disk and can be resumed. More important in practice is that tasks run in **git worktrees**: each gets an isolated checkout, so an abandoned or failed run leaves the main tree untouched.

### 7. Delegation

Sub-agents are exposed as tools the model calls to spawn a child and wait for its result. A child inherits the repository instructions and runs in its own context. Named agents, with their own model and instructions, can be defined in configuration files.

### 8. Orchestration

The non-interactive mode makes Codex scriptable, and the cloud product runs tasks in parallel in remote sandboxes. OpenAI's account describes many agents working concurrently, each in its own worktree with its own instance of the application and its own logs, metrics and traces.

### 9. Evaluation

The repository carries the definition of "correct". Verification commands are listed in `AGENTS.md`; tests, CI and observability configuration are first-class parts of the codebase; and an agent is expected to run them and read the results rather than assert success.

## The lesson behind the product

OpenAI's write-up makes a claim that reframes the engineer's job. When agents write the code, the scarce human skills become:

1. **Designing the environment**: sandboxes, worktrees, a runnable app, observability the agent can query.
2. **Expressing intent**: specifications, invariants and acceptance criteria that are precise enough to act on.
3. **Building feedback loops**: checks that tell the agent, quickly and mechanically, whether it is right.

None of those is prompt-writing. All of them are harness engineering in the broad sense this guide uses.

## What to steal

1. **Make `AGENTS.md` a map.** About a hundred lines, pointing at detail. Make it something a script can lint for dead links and staleness.
2. **Specify invariants, not steps.** Say what must stay true and how to check it; leave the route to the model.
3. **Isolate with the environment.** A worktree per task and an OS sandbox enforce boundaries that instructions can only request.
4. **Send deltas.** Do not re-paste unchanged context every turn.
5. **Put the verification path in the repo.** If "done" is a command, every agent and every human runs the same one.

## What it costs

- **You bring the discipline.** A lean core means the repository conventions *are* the harness. Without good docs and tests, there is less to fall back on.
- **Sandboxing is platform-specific.** The strongest guarantees depend on OS features that differ across macOS, Linux and Windows.
- **Less built-in memory.** State lives in files you organise, not in a managed memory system.

## Compared with Claude Code

The two are instructive opposites. Claude Code *adds*: memory layers, hooks, skills and sub-agents in the core. Codex *subtracts*: a small core, with responsibility pushed to the sandbox and the repository. Neither is wrong. Teams with strong engineering hygiene get a great deal from the second; teams that want good behaviour on day one get it from the first.

## Sources

- OpenAI, [Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)
- [openai/codex](https://github.com/openai/codex) (source, README and docs)
- [AGENTS.md](https://agents.md): the cross-tool convention
- Community: [Context Engineering for Codex CLI](https://codex.danielvaughan.com/2026/06/10/context-engineering-codex-cli-write-select-compress-isolate-june-2026/) and [codex-harness-internals](https://github.com/AlexKenbo/codex-harness-internals)
- [Breaking down Codex's harness design](https://github.com/walkinglabs/learn-harness-engineering), from the *Learn Harness Engineering* course
