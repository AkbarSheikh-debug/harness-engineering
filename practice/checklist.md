# Harness checklist

One page to review any harness: one you are building, or one you are about to trust with your codebase. Each item links back to the chapter that explains it.

Score honestly. "Sort of" is a no.

## 1. The loop — [chapter 1](../guide/01-the-loop.md)

- [ ] Every tool call receives exactly one result before the next model call
- [ ] Several tool calls in one reply are all executed and all answered
- [ ] A hard turn limit exists and is on by default
- [ ] A token or cost limit exists for unattended runs
- [ ] When a limit fires, the run ends with a status report, not silence
- [ ] A tool failure becomes a message to the model, never a crash
- [ ] The user can interrupt without corrupting the session
- [ ] Assistant messages are stored exactly as the provider returned them

## 2. Tools — [chapter 2](../guide/02-tools.md)

- [ ] The tool set is small, with no two tools doing the same job
- [ ] Each description says what the tool does, when to use it, and how it fails
- [ ] Parameters are named, typed and constrained; arguments are validated anyway
- [ ] Every result is size-capped, and truncation tells the model how to get more
- [ ] Error messages say what to do next
- [ ] No tool ever returns an empty string
- [ ] File edits are targeted and fail loudly when the target is ambiguous
- [ ] Shell commands have a timeout and report an exit code

## 3. Guardrails — [chapter 3](../guide/03-guardrails.md)

- [ ] Hard deny rules are checked first and no mode can override them
- [ ] Permission modes exist, with a read-only mode for exploration
- [ ] Approval prompts show the exact action
- [ ] A blocked call is returned to the model with a reason
- [ ] File tools cannot escape the workspace
- [ ] Shell execution is contained by something stronger than string matching
- [ ] Secrets are not in the environment the agent's commands inherit
- [ ] Tool output and file contents are treated as data, not instructions
- [ ] Irreversible actions always require a human
- [ ] No safety property depends on the system prompt alone

## 4. Context — [chapter 4](../guide/04-context.md)

- [ ] Token usage is measured per turn
- [ ] Compaction triggers at a budget well below the hard limit
- [ ] Recent turns are kept verbatim
- [ ] The cut never separates a tool call from its result
- [ ] The summary prompt asks for goal, decisions, files, commands and next step
- [ ] The user's original requirements survive compaction
- [ ] The start of the prompt is stable so provider caching works
- [ ] Nothing volatile (clock, random ids) sits near the top of the prompt

## 5. Memory and skills — [chapter 5](../guide/05-memory-and-skills.md)

- [ ] Project instructions load automatically from a file in the repository
- [ ] That file is short and points to detail instead of containing it
- [ ] It states how to verify work
- [ ] Rules come with reasons
- [ ] Procedures needed occasionally are skills, loaded on demand
- [ ] Skill descriptions say *when* to use them
- [ ] Agent-written memory is bounded, reviewable and under version control

## 6. Durability — [chapter 6](../guide/06-durability.md)

- [ ] Every message is written to disk as it is created
- [ ] The log is append-only
- [ ] A half-written last line is tolerated on load
- [ ] Tool calls left unanswered by a crash are repaired, honestly
- [ ] Interrupted side effects are verified, not blindly re-run
- [ ] Provider errors are retried with backoff, then fail cleanly with state saved
- [ ] A context overflow triggers compaction and a retry, not a crash
- [ ] Workspace changes can be undone
- [ ] Secrets are redacted from logs

## 7. Delegation — [chapter 7](../guide/07-delegation.md)

- [ ] Sub-agents start with a fresh context
- [ ] The brief states goal, context, scope, done-condition and report format
- [ ] Sub-agents get the least tool access that works
- [ ] Each sub-agent has its own turn and token limits
- [ ] Sub-agents cannot spawn further sub-agents by default
- [ ] Sub-agent transcripts are kept for debugging
- [ ] Parallel writers never share a working directory
- [ ] The parent verifies reports that matter

## 8. Orchestration — [chapter 8](../guide/08-orchestration.md)

- [ ] A non-interactive mode exists with structured output
- [ ] Exit codes distinguish finished, out of budget, and failed
- [ ] Each task runs in its own isolated workspace
- [ ] Concurrency is bounded
- [ ] A total budget stops the whole fleet
- [ ] Every task has a check that is independent of the agent
- [ ] Every cycle has an iteration cap and a no-progress exit
- [ ] Humans approve what cannot be undone

## 9. Evaluation — [chapter 9](../guide/09-evaluation.md)

- [ ] A fixed task set drawn from real work exists
- [ ] Each task has a mechanical check the agent cannot see
- [ ] Pass rate, cost, turns and time are all recorded
- [ ] Tasks are run more than once to measure variance
- [ ] Everything the model saw can be reconstructed from the log
- [ ] Harness changes are tested one at a time against the same tasks
- [ ] Failure injection (kill, overflow, hostile input, outage) is part of testing
- [ ] Verification happens inside the run, not only afterwards

## The work itself — [working with agents](failure-modes.md)

- [ ] Tasks state the goal, the non-goals, and what "done" means
- [ ] Everything an agent needs to know is in the repository
- [ ] Long work proceeds one verified unit at a time
- [ ] Progress is recorded in files, not in anyone's memory
- [ ] Sessions end with a clean, committed, documented state

## Reading your score

There is no pass mark, but the sections are not equal. If you must prioritise:

1. **Guardrails** and **the loop's limits** first. These prevent harm.
2. **Durability** and **context** next. These prevent wasted runs.
3. **Evaluation** after that. It tells you whether anything else you change is an improvement.
4. Everything else as the need appears.

A harness with a solid loop, a real sandbox, an append-only log and twenty evaluation tasks is in better shape than one with every feature and none of those four.
