# Sources and credits

The explanations, diagrams and code in this guide are original work. The ideas were developed in public by many people, and this page credits the material that informed each part. If you want to go deeper, these are the primary sources.

## Courses that shaped this guide

**[Odysseus tutorials](https://odysseus-harness.vercel.app/tutorials/)** — a five-day workshop that builds a coding agent in under a thousand lines of dependency-free Python. Its layer-by-layer progression (loop, tools and permissions, context and memory, durability and sub-agents, orchestration) was a major influence on the order of chapters 1 to 8 here. If you want a guided, build-along version of this material with exercises, go there.

**[Learn Harness Engineering](https://github.com/walkinglabs/learn-harness-engineering)** (walkinglabs, MIT) — a lecture series on why capable agents fail and how to set up work so they succeed, plus design breakdowns of Pi, Claude Code, Codex and DeepSeek Harness. It informed the [Working with agents](practice/failure-modes.md) section and the [harness teardowns](harnesses/README.md), and is cited on each of those pages.

## Essays and engineering write-ups

| Source | What to read it for |
|--------|---------------------|
| Anthropic, [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | Workflows versus agents; the basic composition patterns |
| Anthropic, [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | Context as a finite resource; compaction, notes, sub-agents |
| Anthropic, [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) | Initialiser agents, feature lists, incremental progress, clean state |
| Anthropic, [Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents) | Tool descriptions, output shaping, evaluating tools |
| OpenAI, [Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/) | The repository as system of record; `AGENTS.md` as a map; worktrees and feedback loops |

## The harnesses

| Project | Primary sources |
|---------|-----------------|
| Claude Code | [Documentation](https://code.claude.com/docs): [memory](https://code.claude.com/docs/en/memory), [skills](https://code.claude.com/docs/en/skills), [hooks](https://code.claude.com/docs/en/hooks), [sub-agents](https://code.claude.com/docs/en/sub-agents), [permission modes](https://code.claude.com/docs/en/permission-modes) |
| Codex | [openai/codex](https://github.com/openai/codex) |
| Pi | [earendil-works/pi](https://github.com/earendil-works/pi) · [pi.dev](https://pi.dev) |
| Hermes Agent | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) · [docs](https://hermes-agent.nousresearch.com/docs/) |
| DeepSeek Harness | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) · [architecture](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/architecture.md) |
| OpenRouter | [Documentation](https://openrouter.ai/docs) |

Independent analyses cited in the teardowns:

- VILA Lab, [Dive into Claude Code](https://zhiqiangshen.com/projects/Claude_Code_Report/Claude_Code_Report.pdf)
- Daniel Vaughan, [Context Engineering for Codex CLI](https://codex.danielvaughan.com/2026/06/10/context-engineering-codex-cli-write-select-compress-isolate-june-2026/)
- [codex-harness-internals](https://github.com/AlexKenbo/codex-harness-internals)

## Open standards

| Standard | What it covers |
|----------|----------------|
| [AGENTS.md](https://agents.md) | A shared filename and format for repository instructions |
| [Agent Skills](https://agentskills.io) | The `SKILL.md` folder format for on-demand procedures |
| [Model Context Protocol](https://modelcontextprotocol.io) | Connecting harnesses to external tool servers |

## How the diagrams are made

The diagrams are original drawings, written as code in `tools/sketch/` and rendered to PNG. They use [rough.js](https://roughjs.com) (MIT) for the hand-drawn strokes, and the [Kalam](https://fonts.google.com/specimen/Kalam) and [Comic Mono](https://github.com/dtinth/comic-mono-font) typefaces (both under open font licences).

## A note on accuracy

The harness teardowns describe fast-moving projects as of October 2026. Details such as command names, mode names and defaults change between releases. Each teardown links to the primary source for every claim; where this guide and the source disagree, trust the source, and please open an issue so the guide can be corrected.

## Using this material

The guide is released under the [MIT licence](https://github.com/AkbarSheikh-debug/harness-engineering/blob/main/LICENSE). You are welcome to teach from it, adapt it and reuse the diagrams. A link back is appreciated.
