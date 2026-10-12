# 0. What a harness is

> **The question:** what does a language model need around it before it can do anything at all?

## Start with what a model cannot do

Strip away the product and look at the raw thing you are paying for. A language model is a function. You send it a list of messages; it sends back one message. Then the call ends.

![One model call: the whole conversation goes in, one new message comes out](../assets/diagrams/stateless-call.svg)

Three facts follow from that picture, and the rest of this guide grows out of them.

**It has no memory.** Nothing carries over from one call to the next. If the second call should know what happened in the first, *you* have to send it again.

**It has no hands.** A model that writes "I'll open `config.yaml` and check the port" has opened nothing. It produced a sentence. The file is untouched.

**It has no persistence.** It cannot wait for a build, retry after a failure, or notice that an hour has passed. Each call is a single thought with a beginning and an end.

So when a coding agent reads forty files, runs your tests, fixes two bugs and writes a summary, the model did not do those things. It *proposed* them, one at a time. Something else carried each proposal out, reported back, and asked what to do next.

That something else is the harness.

## The definition

> A **harness** is all the code around a model that decides what the model sees, carries out what the model asks for, and decides whether to go around again.

A common shorthand in the field is:

```text
agent = model + harness
```

The model supplies judgment. The harness supplies everything judgment needs in order to matter: eyes, hands, memory, patience and limits.

This is why two products built on the *same* model can feel so different. One loses the thread after twenty minutes and the other works for six hours. One overwrites your file and the other shows you a three-line diff. The model weights are identical. The harness is not.

## The nine parts

Every serious harness, from a 300-line script to Claude Code, answers the same nine questions. This guide spends one chapter on each.

![Anatomy of a harness: nested layers around the model](../assets/diagrams/anatomy.svg)

| # | Part | The question | Without it |
|---|------|--------------|------------|
| 1 | [The loop](01-the-loop.md) | How does a decision become an action? | The model can only talk |
| 2 | [Tools](02-tools.md) | What can it touch? | It has judgment and no hands |
| 3 | [Guardrails](03-guardrails.md) | What must it never touch? | One bad command and you lose a directory |
| 4 | [Context](04-context.md) | How does a long task fit in a finite window? | The run dies when the window fills |
| 5 | [Memory and skills](05-memory-and-skills.md) | What should outlive a session? | It relearns your project every morning |
| 6 | [Durability](06-durability.md) | What survives a crash? | A closed laptop erases two hours of work |
| 7 | [Delegation](07-delegation.md) | When should one agent hand work to another? | One window drowns in raw material |
| 8 | [Orchestration](08-orchestration.md) | How does work scale past one agent? | You are the scheduler, forever |
| 9 | [Evaluation](09-evaluation.md) | How do you know it works? | You tune by feel and ship regressions |

The order is not arbitrary. Each part only makes sense once the one before it exists. You cannot gate tool calls before you have tools, and you cannot compact a transcript before a loop has produced one.

## Prompt, context, harness: three crafts, nested

These words get used interchangeably. They are not the same job.

| Craft | What you shape | Example decision |
|-------|----------------|------------------|
| **Prompt engineering** | One piece of text | How do I phrase this instruction? |
| **Context engineering** | Everything in the window right now | Which files, which history, which tool output stays, and what gets dropped? |
| **Harness engineering** | The machinery that builds that window and acts on the reply, turn after turn | When do we compact? Which calls need approval? What happens after a crash? |

They nest. A harness *performs* context engineering automatically on every turn, and a prompt is one of the things it places in the context. Learn the outer craft and you get the inner two along the way.

## "Won't better models make this unnecessary?"

It is the most common objection, and it deserves a straight answer: the pressure runs the other way.

A stronger model attempts longer tasks, calls more tools, and holds more files in play. That puts *more* load on the machinery around it. And the failures a harness handles are not failures of intelligence:

- The context window is finite. That is arithmetic, not reasoning.
- Processes die. Laptops sleep, networks drop, APIs return 503.
- Some actions cannot be undone. A model that is right 99.9% of the time is still wrong on a long enough run.
- Some tasks are larger than one conversation.
- Every token costs money and time.

None of these lives inside the model, so no model release fixes them. What changes with a better model is which parts of the harness you can *simplify*. Teams regularly delete scaffolding after a model upgrade. They never delete the loop, the gate, or the log.

> A useful test for any problem you hit: *would a perfect model still have this problem?* If yes, it belongs to the harness.

## How to read this guide

- **In order, the first time.** Chapters 1 to 6 build a single-agent harness. Chapters 7 and 8 scale it. Chapter 9 tells you whether any of it worked.
- **With the code open.** [`examples/mini_harness.py`](../examples/README.md) implements chapters 1 to 6 in one file. Every chapter points at the part of that file it explains.
- **Against real systems.** The [harness teardowns](../harnesses/README.md) show how Claude Code, Codex, Pi, Hermes and DeepSeek Harness answer the same nine questions with very different trade-offs.

## Check yourself

1. A model replies, "Done, I've deleted the temp folder." No harness is attached. What is the state of the temp folder, and why?
2. Classify each as a model problem or a harness problem: (a) the agent chose a slow algorithm; (b) the run failed at turn 90 with a context-length error; (c) the agent misread an ambiguous requirement; (d) a two-hour task was lost when the terminal closed.
3. Your teammate says, "Give the model a tool that runs Python and it can do anything, so we don't need the rest." What still has to exist for that tool to be called a second time?

<details>
<summary>Answers</summary>

1. Untouched. The reply is text; nothing executed it.
2. (a) and (c) are model problems. (b) is context management and (d) is durability, so both belong to the harness.
3. A loop that feeds the tool's result back and calls the model again, and a rule for when to stop. One tool call is not an agent.

</details>

**Next:** [1. The loop →](01-the-loop.md)
