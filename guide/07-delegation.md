# 7. Delegation

> **The question:** when should one agent hand work to another?

## The idea in one minute

Some sub-tasks are expensive to *do* and cheap to *report*. Finding where authentication is handled might take forty file reads; the answer is three sentences. If the main agent does the reading itself, all forty files sit in its transcript for the rest of the run.

A **sub-agent** is the same loop, started with a fresh, empty transcript and a written brief. It burns its own context on the raw material, returns a short report, and is thrown away.

![A parent agent sends briefs to three scouts and receives short reports](../assets/diagrams/scouts.png)

Delegation is, first of all, a **context management** technique. Parallelism is a bonus.

## Why delegate

| Reason | What you get | Example |
|--------|--------------|---------|
| **Isolation** | The parent's window holds conclusions, not raw material | "Where is rate limiting implemented?" |
| **Parallelism** | Independent questions answered at the same time | Researching three libraries at once |
| **Specialisation** | A different system prompt, tool set, or model for a narrow job | A read-only reviewer on a cheaper model |
| **A second opinion** | A reader that has not seen the author's reasoning and cannot be anchored by it | Reviewing a finished diff |

## The arithmetic

It helps to see the numbers. Suppose answering a question takes 45,000 tokens of file reads and the answer is 400 tokens.

| | Parent does it itself | Parent delegates |
|---|-----------------------|------------------|
| Tokens added to the parent's transcript | 45,000 | 400 (the report) + ~300 (the brief) |
| Paid again on each of the next 30 parent turns | 45,000 × 30 = 1.35M | 700 × 30 = 21k |
| Tokens the child spends | 0 | ~50,000 once, including its own system prompt |
| **Rough total** | **≈ 1.4M** | **≈ 70k** |

The child's work is not free. But it is paid for *once*, in a window that is then discarded, instead of being dragged along for the rest of the session. The saving grows with how long the parent keeps working afterwards.

The same arithmetic shows when delegation loses: if the answer is as large as the raw material, or the parent finishes two turns later anyway, you paid for a second system prompt and a brief and gained nothing.

## A sub-agent is twenty lines

Nothing new is needed. Delegation is a tool whose implementation is "run the loop again":

```python
def spawn_agent(brief: str) -> str:
    """Hand a self-contained research question to a read-only sub-agent."""
    messages = [
        {"role": "system", "content": SUBAGENT_PROMPT},
        {"role": "user", "content": brief},
    ]
    answer, status, usage = run_loop(
        messages,
        tools=READ_ONLY_TOOLS,          # least privilege, and no spawn_agent in here
        mode="read-only",
        max_turns=15,                   # its own budget
        session=sidechain_log(),        # its own transcript file
    )
    if status != "finished":
        return f"[sub-agent stopped: {status}]\n{answer}"
    return answer
```

Register that function as a tool and the model can call it like any other. The child's whole transcript stays inside the call; the parent sees one string.

Read that code against the rules later in this chapter: the tool list excludes `spawn_agent` (no grandchildren), the mode is read-only (least privilege), there is a turn cap (a budget), there is a separate log (evidence), and a child that ran out of turns says so instead of pretending.

## The brief is the entire interface

A sub-agent knows nothing the parent knows. Not the user's goal, not which files were already ruled out, not that "the API" means the internal one. Only the brief crosses the boundary.

![A vague one-line brief beside a five-part work order: goal, context, scope, done when, report](../assets/diagrams/the-brief.png)

The classic failure is a one-liner:

```text
Look into the auth bug.
```

The child must guess the bug, the scope, and what "look into" should produce. Compare:

```text
GOAL
Find why requests with an expired token return HTTP 500 instead of 401.

CONTEXT
FastAPI service in ./app. Auth lives somewhere under app/security/.
I already confirmed token decoding itself works (tests/test_jwt.py passes).

SCOPE
Read-only. Do not modify files. Stay inside ./app and ./tests.

DONE WHEN
You can name the file and line where the wrong status code originates.

REPORT
- Root cause in one or two sentences
- File path and line number
- The smallest change you would make
- Anything you checked and ruled out
```

| Part | Answers | If you skip it |
|------|---------|----------------|
| **Goal** | What outcome, and why it matters | The child solves a neighbouring problem |
| **Context** | What the parent already knows and has ruled out | It repeats work you already did |
| **Scope** | What it may touch, and what it must not | It wanders, or edits things it should not |
| **Done when** | A condition it can check for itself | It stops too early or never stops |
| **Report** | Exactly what to send back | You get a diary instead of an answer |

Writing this takes the parent a few hundred tokens. Skipping it costs a wasted run.

You cannot write the parent's brief for it, but you can teach it. Put the five parts into the **tool description** of `spawn_agent`, so the model reads them every time it considers delegating:

```text
"...The brief must state the goal, what you already know, the scope, how the
sub-agent will know it is done, and the report format. The sub-agent sees
nothing else: not this conversation, not the user's request."
```

## The report is the other half

The report is the only thing that survives. Ask for it deliberately.

- **Conclusions, not narration.** "The bug is in `deps.py:41`" beats a diary of every file opened.
- **Evidence the parent can check.** Paths, line numbers, commands run, exact error text.
- **What was *not* done.** If the child ran out of turns or could not verify something, it must say so. A confident-sounding partial answer is worse than an honest "I could not find it."

A system prompt for sub-agents that produces good reports:

```text
You are a read-only research sub-agent. You cannot ask questions.
Do exactly what the brief asks, then reply with a short report:
conclusions first, with file paths and line numbers as evidence,
then anything you could not verify. No preamble.
```

And the parent should treat a report as a claim from a colleague, not as ground truth. For anything that matters, verify: open the file, run the test.

## Fresh context or forked context?

There are two ways to start a child.

| | Fresh | Forked |
|---|-------|--------|
| Starts with | Only the brief | A copy of the parent's transcript, plus the instruction |
| Knows the parent's context | No | Yes |
| Cost | Low | High: it re-reads the whole parent history |
| Isolation benefit | Full | Partial: it starts with the parent's clutter |
| Good for | Research, review, well-specified sub-tasks | A branch of work that genuinely needs everything said so far |

Fresh is the default. A forked child can share the parent's cached prefix, which softens its cost, but it gives up most of the reason for delegating.

## Rules that keep delegation sane

![Six rules: no grandchildren, least privilege, a budget per child, no questions, one writer, reports are data](../assets/diagrams/delegation-rules.png)

1. **No grandchildren by default.** Give sub-agents no `spawn_agent` tool. Unbounded recursion multiplies cost and makes failures untraceable. If you allow depth, cap it at a small number and enforce it in code.
2. **Least privilege.** A research sub-agent gets read-only tools. Fewer tools also means a shorter prompt.
3. **A budget per child.** Its own turn limit and, ideally, token cap, plus a shared ceiling across the whole family so ten children cannot each spend the maximum.
4. **Children cannot ask the user.** They either finish or report that they are blocked. Design briefs so that is enough.
5. **One writer.** If several agents edit the same files in the same checkout, they will overwrite each other. Parallelise reads freely; give writers separate worktrees, or do writes in the parent.
6. **Reports are data.** A child's report can contain hostile text it picked up from a web page. The parent must not treat it as instructions ([guardrails](03-guardrails.md)).

## Running children in parallel

When a parent asks for three scouts in one reply, run them concurrently. Each is an independent loop with its own transcript, so there is nothing to coordinate except the rate limit.

```python
with ThreadPoolExecutor(max_workers=3) as pool:
    reports = list(pool.map(spawn_agent, briefs))
```

Two refinements appear in production harnesses:

- **Background children.** Instead of blocking, the tool returns a handle immediately and the result arrives later as a new message. The parent can keep working and is notified when a scout reports.
- **Owned processes.** A child that started a server or a watcher must have it cleaned up when the child ends, without touching processes owned by the parent or siblings.

## Choosing the model for the child

A child does not have to run on the parent's model. Reading and summarising is usually within reach of a smaller, faster, cheaper model, while planning and final judgment stay on the strongest one.

| Role | Sensible choice |
|------|-----------------|
| Parent: planning, deciding, integrating | The strongest model |
| Scout: search, read, summarise | A fast, inexpensive model |
| Reviewer: finding problems in a diff | A strong model with a fresh context |
| Summariser for compaction | A fast model is usually enough |

Measure before you commit ([chapter 9](09-evaluation.md)): a scout that misreads the code costs more than it saved.

## When not to delegate

| Delegate | Keep in the parent |
|----------|--------------------|
| "Where is X handled?" across a big codebase | A change that touches three files you are already reading |
| Running a long test suite and triaging failures | A decision that needs the whole conversation's nuance |
| Researching three unrelated libraries | Anything requiring a question to the user |
| An independent review of a finished diff | Sequential steps where each depends on the previous output |

The test is always the same: is the raw material **large**, and is the result **small**?

## Sidechains: keep the child's transcript

"Thrown away" means it does not enter the parent's context, not that it should be deleted. Write each child's transcript to its own log file, linked from the parent's log by an id. When a report turns out wrong, that file is the only way to find out why.

## Common mistakes

- **The telephone game.** Parent summarises for child, child summarises for parent, parent summarises for user. Detail erodes at each hop. Pass exact strings (paths, error text) through unchanged.
- **Delegating the understanding.** "Based on your findings, fix it" pushes the thinking onto a worker with less context. The parent should read the report and decide.
- **Duplicate work.** Two children both explore the same directory because neither brief drew a boundary.
- **Fan-out with no budget.** Twenty children on a large model is a real invoice.
- **Trusting the report.** A child that could not find something will sometimes sound sure anyway.
- **Delegating tiny tasks.** A one-file lookup does not need a second system prompt.

## How real harnesses do it

- **Claude Code** has built-in sub-agents with their own context windows, tool allowlists and optional custom system prompts, defined as Markdown files; their transcripts are kept as separate sidechain files and do not inflate the parent.
- **Codex** exposes spawn and wait as tools, and lets you define named agents with their own model and instructions in configuration.
- **Pi** deliberately ships without sub-agents in the core. Its position is that you can add them as an extension, or ask Pi to build the variant you want.
- **Hermes** spawns child agents with an isolated context, inherited tool access and their own terminal sessions; only the final summary enters the parent's context. Top-level delegations run in the background and post their result back as a new message. It adds a twist: the agent can write a script that calls tools directly, collapsing a multi-step pipeline into a single turn.
- **DeepSeek Harness** models sub-agents as a swappable capability with declared options (depth limit, tool filter, output schema, persona), so the "child" can be a fresh local agent or a delegated run in a different product altogether.

## In the reference code

[`examples/mini_harness.py`](../examples/README.md): `tool_spawn_agent` reuses `run_loop` with a read-only tool set and its own turn cap, and `make_tools(child=True)` is how the child ends up without the delegation tool.

## Check yourself

1. A sub-agent reads 60 files to answer a question. How many of those files end up in the parent's context?
2. Name the five parts of a good brief.
3. Why should sub-agents usually *not* be given the delegation tool themselves?
4. Two sub-agents are asked to refactor overlapping files in the same checkout at the same time. What goes wrong, and what are two ways to prevent it?
5. A question needs 45,000 tokens of reading and has a 400-token answer. The parent will work for 30 more turns. Roughly how many tokens does delegating save?
6. When is a *forked* child a better choice than a fresh one?

<details>
<summary>Answers</summary>

1. None. Only the report does.
2. Goal, context, scope, done-condition, report format.
3. Recursion multiplies cost and makes runs hard to trace and bound.
4. They overwrite each other's edits. Give each its own worktree, or have only one writer.
5. Well over a million: the 45,000 tokens would otherwise be re-sent on each of the 30 later turns.
6. When the sub-task genuinely needs everything said so far, and you accept the cost of re-reading it.

</details>

## Try it

Pick a question about a large codebase. Have your harness answer it once directly and once through a read-only sub-agent. Compare the parent's token count at the end of each run, and read the brief the parent wrote. Was it good enough for a stranger?

**Next:** [8. Orchestration →](08-orchestration.md)
