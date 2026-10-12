# Glossary

Plain definitions of the terms used in this guide, with a link to where each is explained.

| Term | Meaning | See |
|------|---------|-----|
| **Agent** | A model plus a harness: a system that pursues a goal by taking actions and reading the results | [0](guide/00-what-is-a-harness.md) |
| **AGENTS.md** | A Markdown file at the root of a repository holding instructions for coding agents; an open, cross-tool convention | [5](guide/05-memory-and-skills.md) |
| **Append-only log** | A file that is only ever added to, never rewritten; the basis of durable sessions | [6](guide/06-durability.md) |
| **Approver** | Whatever decides whether a gated action may run: a human prompt, a policy function, or a classifier | [3](guide/03-guardrails.md) |
| **Brief** | The written instructions a parent agent gives a sub-agent; the entire interface between them | [7](guide/07-delegation.md) |
| **Capability seam** | A swappable capability defined by an interface, with separate providers and consumers (DeepSeek Harness term) | [DSH](harnesses/deepseek-harness.md) |
| **Checker** | An independent judge of a maker's output: a command, a second agent with a rubric, or a person | [8](guide/08-orchestration.md) |
| **Checkpoint** | A saved snapshot of the workspace that a run can be rewound to | [6](guide/06-durability.md) |
| **Circuit breaker** | A hard limit (turns, tokens, time) that stops a loop regardless of what the model wants | [1](guide/01-the-loop.md) |
| **Compaction** | Replacing older messages with a summary so the transcript fits the window | [4](guide/04-context.md) |
| **Context engineering** | Deciding what occupies the context window at each step | [4](guide/04-context.md) |
| **Context rot** | Declining output quality as a window fills with stale or irrelevant material | [4](guide/04-context.md) |
| **Context window** | The maximum amount of text, in tokens, that a model can take in one request | [4](guide/04-context.md) |
| **Delegation** | A model handing a sub-task to another agent with its own context | [7](guide/07-delegation.md) |
| **Deny rule** | A check for actions that are never allowed in any mode | [3](guide/03-guardrails.md) |
| **Feature list** | A file listing requirements as small items, each with a verification command and a pass flag | [Long-running work](practice/long-running-work.md) |
| **Fold** | Informal name for one compaction | [4](guide/04-context.md) |
| **Gate** | The function called before a tool executes that decides whether it may | [3](guide/03-guardrails.md) |
| **Harness** | All the code around a model that decides what it sees, carries out what it asks for, and decides whether to continue | [0](guide/00-what-is-a-harness.md) |
| **Headless mode** | Running a harness with no interactive prompts and structured output, so a program can drive it | [8](guide/08-orchestration.md) |
| **Hook** | A script the harness runs at a lifecycle event (before a tool, after a tool, at stop) that can block or add feedback | [Claude Code](harnesses/claude-code.md) |
| **Idempotent** | Safe to perform more than once with the same effect as once | [6](guide/06-durability.md) |
| **Initialiser** | A first session whose job is to set up the environment and plan, not to build features | [Long-running work](practice/long-running-work.md) |
| **Invariant** | A property that must always hold, stated with a way to check it | [Repo](practice/repo-as-system-of-record.md) |
| **JSONL** | A file with one JSON object per line; the usual format for session logs | [6](guide/06-durability.md) |
| **Loop** | The repeated cycle of calling the model, running the tools it asks for, and feeding results back | [1](guide/01-the-loop.md) |
| **Maker** | The agent that produces work in a maker-checker loop | [8](guide/08-orchestration.md) |
| **MCP** | Model Context Protocol: a standard way for a harness to connect to external tool servers | [2](guide/02-tools.md) |
| **Memory** | Knowledge kept in files and loaded into context at the start of a session | [5](guide/05-memory-and-skills.md) |
| **Orchestration** | Ordinary code deciding which agents run, on what, with what budget | [8](guide/08-orchestration.md) |
| **Orphan tool call** | A tool call in the transcript with no matching result, usually left by a crash | [6](guide/06-durability.md) |
| **Permission mode** | A setting for how much the agent may do without asking | [3](guide/03-guardrails.md) |
| **Progressive disclosure** | Loading a short description always and the full content only when needed | [5](guide/05-memory-and-skills.md) |
| **Prompt caching** | A provider feature that charges less to re-read an unchanged prefix of the request | [4](guide/04-context.md) |
| **Prompt injection** | Text in tool output or files written to look like instructions to the model | [3](guide/03-guardrails.md) |
| **Provider layer** | The single module that talks to the model vendor: authenticate, translate, retry, normalise | [OpenRouter](harnesses/openrouter.md) |
| **Router** | A service that offers one API in front of many models and providers | [OpenRouter](harnesses/openrouter.md) |
| **Sandbox** | An environment that limits what a process can read, write and reach | [3](guide/03-guardrails.md) |
| **Session** | One continuous transcript, usually stored as one file | [6](guide/06-durability.md) |
| **Skill** | A folder of instructions (and optionally scripts) that the agent loads when a task matches its description | [5](guide/05-memory-and-skills.md) |
| **Step** | One model request plus the tool calls it produces (DeepSeek Harness usage) | [DSH](harnesses/deepseek-harness.md) |
| **Stop reason** | The field or signal in a model reply indicating whether it finished or wants tools run | [1](guide/01-the-loop.md) |
| **Sub-agent** | An agent started by another agent, with a fresh context and a brief | [7](guide/07-delegation.md) |
| **System prompt** | Standing instructions at the start of the transcript; in a harness, assembled from parts | [4](guide/04-context.md) |
| **Token** | The unit models read and write, roughly three-quarters of an English word | [4](guide/04-context.md) |
| **Tool** | A function the model can ask the harness to run, described by a name, a description and a parameter schema | [2](guide/02-tools.md) |
| **Tool call** | The model's structured request to run a tool, carrying an id, a name and arguments | [1](guide/01-the-loop.md) |
| **Tool result** | The harness's reply to one tool call, quoting its id | [1](guide/01-the-loop.md) |
| **Trace** | The complete record of a run: every message, call, result, token count and timing | [9](guide/09-evaluation.md) |
| **Transcript** | The ordered list of messages sent to the model; the agent's entire state | [1](guide/01-the-loop.md) |
| **Turn** | One model call plus the tool round-trip it triggers. (Some systems call this a step and use "turn" for a whole user exchange.) | [1](guide/01-the-loop.md) |
| **Workflow** | Multi-step model use where your code fixes the sequence of steps, as opposed to an agent, where the model decides | [1](guide/01-the-loop.md) |
| **Worktree** | An additional checkout of a git repository on its own branch; used to give each agent task an isolated copy | [8](guide/08-orchestration.md) |
