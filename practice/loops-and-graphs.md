# Loops and graphs

Most people meet agents as a conversation: you type, it works, you correct it, it works some more. You are the outer loop. This page is about taking yourself out of that position without losing control.

There are three levels, and you should climb them one at a time.

![Three levels: supervised, a loop, a graph; you move from being in the loop, to on it, to designing it](../assets/diagrams/three-levels.png)

| Level | Who drives | Structure | You are… |
|-------|-----------|-----------|----------|
| **1. Supervised** | You, turn by turn | One agent, one session | In the loop |
| **2. Loop** | A script, repeating one agent | Maker, checker, state file | On the loop |
| **3. Graph** | A script, routing between several agents | Nodes and edges | Designing the loop |

## Level 1: supervised

One agent, one human, one session. Everything in the [guide](../guide/00-what-is-a-harness.md) applies, and for a great deal of work this is the right level. Do not leave it until you can describe, precisely, what you keep typing.

**The signal to move up:** you notice your own contribution has become mechanical. "Run the tests." "Fix that." "Now the next one." If you could write your side of the conversation in advance, a script can say it.

**The signal to stay:** you are still making judgment calls each turn. If your corrections are about *what the right thing is*, not *keep going*, the task is not ready to automate. Automating it will produce confident work in the wrong direction.

## Level 2: loop engineering

A loop is an agent run inside a `while`, with a check deciding whether to go around again.

![Maker and checker loop with a state file and four ways out](../assets/diagrams/maker-checker.png)

It has five parts. Leave any one out and the loop misbehaves in a predictable way.

| Part | What it is | Without it |
|------|-----------|------------|
| A checkable **goal** | A condition a command can test | The loop cannot terminate |
| A **state file** | What each fresh iteration reads first and updates last | Every iteration starts from zero |
| A **maker** | The agent that does one small piece of work | Nothing happens |
| A **checker** | An independent judge | The maker declares success immediately |
| **Stop conditions** | Success, iteration cap, budget cap, no progress | An expensive overnight surprise |

### 1. A goal that can be checked

```markdown
# Goal
All functions in `src/billing/` have type hints and `mypy --strict src/billing` reports zero errors.

# Not in scope
Changing behaviour. Renaming public functions. Files outside `src/billing/`.
```

"Improve the code" cannot terminate. "Zero mypy errors in this directory" can.

| Cannot terminate | Can terminate |
|------------------|---------------|
| "Improve test coverage" | "Line coverage of `src/api/` is at least 85%, measured by `make coverage`" |
| "Clean up the codebase" | "`ruff check .` reports zero errors" |
| "Make it faster" | "`make bench` reports p95 under 200 ms" |
| "Fix the bugs" | "Every test in `tests/regressions/` passes" |

### 2. A state file

Each iteration is a fresh agent with an empty context. The state file is what it reads first and updates last:

```markdown
# Loop state
Iteration: 4 of 15
Remaining: 23 mypy errors (was 61)

## Done
- invoices.py, tax.py: fully typed

## In progress
- ledger.py: the `Entry` union is tricky; see note below

## Notes for the next iteration
- `Decimal | None` is the right type for `discount`; do not default it to 0
- Checker feedback from iteration 3: do not add `# type: ignore`; fix the type
```

The "notes for the next iteration" section is where the loop *learns*. Without it, iteration 7 makes the same mistake iteration 3 was corrected for.

### 3. A maker

The agent that does the work. Its prompt is the same every iteration:

```text
Read GOAL.md and LOOP_STATE.md. Do the next small piece of work toward the goal.
Stay in scope. Run the check yourself before you stop.
Update LOOP_STATE.md with what you did and what you learned. Then stop.
```

Small pieces matter. An iteration that tries to finish everything behaves like the [under-finishing](failure-modes.md) failure.

### 4. A checker

Something independent decides whether the goal is met. In order of preference:

| Checker | Cost | Trust | Use when |
|---------|------|-------|----------|
| **A command** (`mypy` exits 0) | Free, instant | Total | Always, if one exists |
| **A second agent with a rubric** | A model call | Good, if calibrated | No command can judge it |
| **A human**, sampled | Attention | Ground truth | The stakes are high |

If the checker is an agent, give it the artifact and the criteria, not the maker's reasoning, and require specific, actionable feedback:

```text
You are reviewing a change you did not write. Criteria:
(1) no `# type: ignore` comments were added;  (2) no function signature changed its meaning;
(3) every changed file still passes its tests.
Answer PASS or FAIL per criterion, with a file and line as evidence.
If anything fails, say exactly what to change.
```

*Missing it:* the maker declares success on iteration one. A maker reviewing itself is the [premature victory](failure-modes.md) failure with extra steps.

### 5. Stop conditions

```python
for i in range(MAX_ITERATIONS):                 # hard cap
    run_agent(MAKER_PROMPT)
    ok, feedback = check()
    if ok:
        break                                   # goal met
    if spent() > BUDGET:
        break                                   # out of money
    if no_progress_for(3):
        break                                   # stuck: same errors three times running
    append_to_state(feedback)
```

Four exits: success, iteration cap, budget cap, and *no progress*. The last one is the one people forget. A loop that makes the same failed attempt fifteen times is burning money to tell you something it could have said on the third.

Measuring progress needs a number: errors remaining, tests passing, features marked done. If the number has not improved for three iterations, stop and hand it to a person, with the state file as the report.

### What loops are good at

| Good fit | Poor fit |
|----------|----------|
| Mechanical, checkable transformations: migrations, lint classes, type annotations | Work where "better" is a matter of taste |
| A natural queue: the next ticket, file, or failing test | A single tightly coupled change |
| Iterating toward a measurable target: coverage, a benchmark | Anything where each step needs a human decision |

## Level 3: graph engineering

When one loop is not enough, several agents with different jobs are connected by code.

![A pipeline of planner, implementer and reviewer with two capped cycles and an escalation path](../assets/diagrams/agent-graph.png)

### The rules that keep a graph maintainable

**Nodes are agent runs. Edges are code.** A node has a narrow job, its own prompt, its own tools and a fresh context. An edge is an `if` on something mechanical: an exit code, a test result, a field in a JSON file. If you find a model deciding where control goes next, ask whether a test could decide instead.

**Every node has a contract.**

| Field | Example |
|-------|---------|
| Input | `plan.md`, the issue text |
| Output | A branch with commits; `result.json` with `{ "status": "...", "summary": "..." }` |
| Tools | Read, edit, shell. No network |
| Done when | `make check` exits 0 |
| On failure | Write what blocked you to `result.json` and exit non-zero |

**State lives in files.** What passes between nodes is a plan document, a diff, a results file. Never one agent's memory of a conversation. That makes every hand-off inspectable and every node re-runnable.

**Every cycle has a cap.** Each backward edge needs a counter and an escape route to a human. An uncapped cycle between an implementer and a reviewer can run for hours, with each side politely disagreeing.

**Different context is the point.** A reviewer is useful because it has *not* seen the implementer's reasoning. Giving every node the full history defeats the purpose and multiplies the cost.

### The whole thing is a small script

A graph does not require a framework. This is the pipeline in the diagram:

```python
plan = run_node("planner", inputs=[issue], mode="read-only")
if not human_approves(plan):
    stop("plan rejected")

for attempt in range(3):                                  # capped cycle 1
    run_node("implementer", inputs=[plan, feedback], worktree=wt)
    if run("make check", cwd=wt).returncode != 0:         # an edge: an exit code
        feedback = last_test_output(wt)
        continue
    review = run_node("reviewer", inputs=[diff(wt)], mode="read-only")
    if review["status"] == "approved":                    # an edge: a JSON field
        open_pull_request(wt)
        break
    feedback = review["comments"]
else:
    escalate_to_human(wt)                                 # the exit for both cycles
```

Read the control flow: every decision is a return code, a field, or a person. No model chooses the next node.

### Common graph shapes

| Shape | When to use it |
|-------|----------------|
| **Pipeline** (plan → build → test → review) | Stages are distinct and ordered |
| **Fan-out and gather** | Many independent items; see [orchestration](../guide/08-orchestration.md) |
| **Maker-checker cycle** | Quality needs iteration against a rubric |
| **Router** (classify, then send to a specialist) | Inputs fall into a few clearly different kinds |
| **Escalation ladder** (cheap model first, stronger on failure) | Most cases are easy and cost matters |

## Before you add a node

Graphs are seductive. A diagram with eight boxes looks like progress. Each box, though, adds cost, latency, a hand-off where detail is lost, and a new place for things to go wrong. Before adding one, answer:

1. **What specific failure does this node prevent?** Name a real run where it happened.
2. **Could a command do it instead of an agent?** A linter is cheaper than a reviewer.
3. **Could the existing node do it with a better prompt or tool?**
4. **How will I know if this node is helping?** If you cannot measure it with the methods in [evaluation](../guide/09-evaluation.md), you cannot justify it.

| You are about to add… | First try… |
|-----------------------|-----------|
| A "planner" node | Asking the one agent to write a plan file before coding |
| A "tester" node | Putting the test command in the instructions and a stop hook |
| A "reviewer" node | A linter for the things the reviewer keeps catching |
| A "memory manager" node | A progress file |
| A "supervisor" model | A `for` loop |

A reasonable path for most teams: one good supervised agent; then a maker loop with a mechanical checker; then a reviewer; and only then anything more elaborate.

## Sources and further reading

- Anthropic, [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents): workflows versus agents, and the common composition patterns
- Anthropic, [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Learn Harness Engineering](https://github.com/walkinglabs/learn-harness-engineering): its lectures on loop engineering and graph engineering cover these topics at length, with templates
