# A runnable mini harness

[`mini_harness.py`](https://github.com/AkbarSheikh-debug/harness-engineering/blob/main/examples/mini_harness.py) is a complete agent harness in one Python file. It has no dependencies beyond the standard library and is written to be read from top to bottom.

It is a **teaching** harness. It demonstrates each idea from the guide in the smallest form that still works. It is not hardened for production, and it says so where that matters.

## What is inside

| Guide chapter | In the file | What it shows |
|---------------|-------------|---------------|
| [1. The loop](../guide/01-the-loop.md) | `run_loop` | Call, read, execute, append, repeat; a turn cap that ends with a report |
| [2. Tools](../guide/02-tools.md) | `make_tools`, `tool_*`, `clip` | Eight tools with tight schemas; every result size-capped |
| [3. Guardrails](../guide/03-guardrails.md) | `gate`, `safe_path` | Deny rules, three modes, an approver; blocked calls returned as messages |
| [4. Context](../guide/04-context.md) | `estimate_tokens`, `compact` | A budget check each turn and one fold that respects tool-call boundaries |
| [5. Memory and skills](../guide/05-memory-and-skills.md) | `build_system_prompt`, `remember` | An assembled prompt: `AGENTS.md`, one line per skill, saved notes |
| [6. Durability](../guide/06-durability.md) | `Session`, `repair` | An append-only JSONL log, torn-line tolerance, repair of interrupted calls |
| [7. Delegation](../guide/07-delegation.md) | `spawn_agent` | A read-only sub-agent that reuses the same loop with a fresh transcript |

The provider layer (`call_model`) speaks the OpenAI-compatible chat API, so the same file works with [OpenRouter](../harnesses/openrouter.md), DeepSeek, OpenAI, or a local server.

## Watch it run, no API key needed

`--mock` swaps the model for a short script, so you can see the machinery without spending anything:

```bash
python examples/mini_harness.py --mock --mode read-only --trace "look around"
```

You will see the mock ask for four tools in turn. In `read-only` mode the shell command comes back `BLOCKED`, and a read of a missing file comes back `ERROR`. Both are returned to the "model" as ordinary results, which is the central habit of the guide: turn obstacles into messages.

```text
[main turn 1] -> list_dir({"path": "."})
[main turn 1] <- README.md ...
[main turn 3] -> run_shell({"command": "echo hello from the harness"})
[main turn 3] <- BLOCKED: read-only mode: run_shell would change something
[main turn 4] -> read_file({"path": "NOTES-THAT-DO-NOT-EXIST.md"})
[main turn 4] <- ERROR: FileNotFoundError: NOTES-THAT-DO-NOT-EXIST.md is not a file here. ...
```

## Run it with a real model

```bash
export HARNESS_API_KEY=your-key-here
export HARNESS_MODEL=deepseek/deepseek-chat        # any model that supports tool calling
python examples/mini_harness.py "find the failing test and explain why it fails"
```

To use a different provider, point it at another OpenAI-compatible endpoint:

| Provider | `HARNESS_API_BASE` | Example `HARNESS_MODEL` |
|----------|--------------------|-------------------------|
| OpenRouter (default) | `https://openrouter.ai/api/v1` | `deepseek/deepseek-chat` |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| OpenAI | `https://api.openai.com/v1` | a current tool-calling model |
| Local (Ollama, LM Studio, vLLM) | `http://localhost:11434/v1` | whatever you have pulled |

Model names change; check the provider's list. Pick one that supports tool calling.

## Options

| Flag | Meaning |
|------|---------|
| `--mode ask` | Default. Reads run freely; writes and shell commands ask for approval |
| `--mode read-only` | Nothing that changes state is allowed |
| `--mode auto` | No prompts. **Use only inside a container or VM** |
| `--resume FILE` | Continue a session from its log |
| `--max-turns N` | Hard cap on model calls (default 30) |
| `--budget N` | Compact when the transcript passes about N tokens (default 60,000) |
| `--trace` | Print transcript size after every turn |
| `--json` | Print a JSON result for scripts |

Exit codes: `0` finished, `2` out of turns, `1` error, `130` interrupted.

## Experiments

Each of these takes a few minutes and makes one chapter concrete.

**Break the transcript (chapter 1).** In `run_loop`, comment out the line that records the tool result. Run with a real model and read the API error.

**Kill it and bring it back (chapter 6).** Start a multi-step task, press Ctrl-C during a tool call, then run again with `--resume` and the session path it printed. Look for `INTERRUPTED` in the log.

**Force a fold (chapter 4).** Run with `--mock --mode auto --budget 50 --trace` and watch the message count drop.

**Read a session (chapter 9).** Open a file under `.harness/sessions/` in a text editor. That file is everything the model saw.

**Teach it your project (chapter 5).** Put an `AGENTS.md` in a repository of your own, with the test command and two rules. Run a task and see whether it follows them.

**Add a tool (chapter 2).** Write one for something you do daily. Write the description before the code.

## Honest limitations

- **There is no sandbox.** `gate()` is a policy check, not containment. Shell deny rules are string patterns, which catch mistakes and not a determined bypass. For `--mode auto`, run it in a container.
- **Token counting is approximate.** `estimate_tokens` divides characters by four. Real harnesses use the provider's reported usage.
- **Tool calls run one at a time.** Production harnesses run independent reads concurrently.
- **Compaction is a single stage.** There is no lossless pruning pass before the summary.
- **No streaming, no retries on malformed tool JSON beyond reporting it, no checkpoints of the workspace.**

Each limitation is a good exercise.
