# Diagram gallery

Every diagram in the guide, in one place: 59 hand-drawn sheets at 1920×1080, sized for slides as well as for reading.

They are drawn in code with [rough.js](https://roughjs.com) and rendered to PNG by a headless browser, so you can change one and regenerate it:

```bash
python tools/render.py                # render everything
python tools/render.py agent-loop     # render one diagram
python tools/render.py --audit        # list any text that overflows or overlaps
```

Each diagram is a short function in [`tools/sketch/`](https://github.com/AkbarSheikh-debug/harness-engineering/tree/main/tools/sketch). Use them freely in slides and notes (MIT).

## 0 · What a harness is

![A model call is a dead end](model-call.png)

![Everything around the model is harness](harness-anatomy.png)

![Prompt, context, harness: three crafts, nested](three-crafts.png)

![Would a perfect model still have this problem?](outside-the-model.png)

## 1 · The loop

![A model can't act. But it can ask.](the-ask.png)

![The loop that makes an agent](agent-loop.png)

![The transcript is the whole state](transcript.png)

![Who owns the exit?](workflow-vs-agent.png)

![Every run ends one of three ways](three-endings.png)

![You pay for the whole transcript, every turn](resend-cost.png)

## 2 · Tools

![A tool has two faces](tool-two-faces.png)

![Six tools cover almost everything](six-tools.png)

![A loose form makes the model guess](loose-vs-tight.png)

![Every tool result lives in the transcript](output-cap.png)

![Change two lines. Don't re-type six hundred.](edit-vs-rewrite.png)

## 3 · Guardrails

![What you are actually defending against](four-threats.png)

![One checkpoint, three layers](the-gate.png)

![A dial for how much it may do without asking](mode-dial.png)

![The gate lowers the odds. The sandbox limits the damage.](gate-vs-sandbox.png)

![Tool output is data. Never instructions.](injection-path.png)

## 4 · Context

![Where the window goes](window-budget.png)

![Why every long run needs a fold](token-growth.png)

![Four moves of context engineering](four-moves.png)

![Compaction: fold the old, keep the recent](compaction.png)

![Keep the front of the prompt boring](cache-prefix.png)

## 5 · Memory and skills

![Instructions load in layers, broadest first](instruction-scopes.png)

![Give the agent a map, not a manual](map-not-manual.png)

![A skill is an iceberg](skill-iceberg.png)

![Where should this piece of knowledge live?](knowledge-ladder.png)

## 6 · Durability

![Append one line. Never rewrite the file.](append-vs-rewrite.png)

![The dangerous gap in every turn](the-gap.png)

![Resume = read the file back](resume-repair.png)

![Four failures, one move](failures-to-messages.png)

![Once a session is a file, it can branch](session-tree.png)

## 7 · Delegation

![Send a scout. Get a report.](scouts.png)

![The brief is the whole interface](the-brief.png)

![Rules that keep delegation sane](delegation-rules.png)

## 8 · Orchestration

![Who decides the split?](delegation-vs-orchestration.png)

![A harness needs a door a program can use](headless-door.png)

![A fleet is plain code above many loops](fleet.png)

![Maker and checker](maker-checker.png)

![Nodes are agent runs. Edges are code.](agent-graph.png)

## 9 · Evaluation

![The evaluation loop](eval-loop.png)

![A task is a spec plus a check the agent never sees](hidden-check.png)

![Reading a trace: which layer failed?](which-layer.png)

![Break it on purpose](break-it.png)

## Harnesses in the wild

![Five harnesses, five bets](landscape.png)

![Claude Code: four mechanisms, four jobs](claude-code-map.png)

![Codex: two dials and a map](codex-dials.png)

![Pi: a small core that you extend](pi-stack.png)

![Hermes: the learning loop](hermes-loop.png)

![DeepSeek Harness: every stage is a place to stand](dsh-pipeline.png)

![Capability seams](dsh-seam.png)

![One narrow door to the model](provider-layer.png)

## Working with agents

![Eight ways capable agents still fail](eight-failures.png)

![Write invariants, not instructions](rule-reason-check.png)

![Work in shifts, for a worker with amnesia](session-routine.png)

![A feature list turns "make progress" into a mechanism](feature-list.png)

![Three levels of taking yourself out of the loop](three-levels.png)
