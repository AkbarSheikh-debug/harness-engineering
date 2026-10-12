"""Regenerate every diagram in assets/diagrams/.

    python tools/build_diagrams.py

Standard library only. Edit a function, re-run, commit the SVG.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgkit import Diagram, TONES, INK, MUTED, LINE  # noqa: E402

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "diagrams")
W = 960


def anatomy():
    d = Diagram(W, 462, "Anatomy of a harness", "The model decides. Every ring around it is code you write.")
    rings = [
        ("9 · Evaluation", "Did it work, and how do you know?", "slate"),
        ("7 · Delegation   8 · Orchestration", "How does work spread across many agents?", "indigo"),
        ("6 · Durability", "What survives a crash?", "rose"),
        ("4 · Context   5 · Memory & skills", "What fits in the window, what outlives it?", "amber"),
        ("2 · Tools   3 · Guardrails", "What may it touch, and never touch?", "teal"),
        ("1 · The loop", "How does a decision become an action?", "green"),
    ]
    for i, (label, q, tone) in enumerate(rings):
        fill, stroke, tx = TONES[tone]
        x, y, w, h = 30 + 40 * i, 88 + 36 * i, 900 - 80 * i, 348 - 48 * i
        d.rect(x, y, w, h, fill=fill, stroke=stroke, r=14)
        d.text(x + 16, y + 24, label, size=13.5, weight=800, fill=tx, anchor="start")
        d.text(x + w - 16, y + 24, q, size=12.5, fill=tx, anchor="end", italic=True)
    d.box(270, 304, 420, 60, "THE MODEL", "reads the transcript, proposes the next step", tone="ink", size=16)
    d.save(os.path.join(OUT, "anatomy.svg"))


def stateless():
    d = Diagram(W, 318, "One model call", "Messages in, one message out. Then silence.")
    d.box(50, 104, 250, 130, "The whole conversation",
          ["system prompt", "every earlier message", "tool schemas"], tone="white")
    d.arrow(300, 169, 380, 169)
    d.box(385, 119, 190, 100, "MODEL", "a pure function", tone="ink", size=18)
    d.arrow(575, 169, 655, 169)
    d.box(660, 104, 250, 130, "One new message",
          ["text for the human", "and / or", "requests to call tools"], tone="teal")
    x = 150
    for label, tone in [("no memory between calls", "rose"), ("no side effects", "rose"),
                        ("nothing runs until your code acts", "amber")]:
        x += d.pill(x, 264, label, tone=tone, size=12.5) + 16
    d.save(os.path.join(OUT, "stateless-call.svg"))


def loop():
    d = Diagram(W, 470, "The agent loop", "Five steps, repeated until the model stops asking for tools.")
    w, h = 210, 74
    d.box(50, 110, w, h, "1 · Assemble", "system + history + tool schemas", tone="slate")
    d.box(375, 110, w, h, "2 · Call the model", "one request, one reply", tone="ink")
    d.box(700, 110, w, h, "3 · Read the reply", "text, tool calls, or both", tone="teal")
    d.box(50, 290, w, h, "5 · Append results", "one result per call id", tone="indigo")
    d.box(375, 290, w, h, "4 · Run the tools", "validate → gate → execute", tone="amber")
    d.box(700, 290, w, h, "Return the answer", "no tool calls = done", tone="green")
    d.arrow(260, 147, 372, 147)
    d.arrow(585, 147, 697, 147)
    g = TONES["green"][1]
    d.arrow(835, 184, 835, 287, color=g, label="no tool calls", ldx=8, ldy=4, lanchor="start")
    a = TONES["amber"][1]
    d.path("M 745 184 C 745 262, 690 327, 590 327", color=a)
    d.text(668, 252, "tool calls", size=12.5, weight=600, fill=a, anchor="end")
    d.arrow(375, 327, 263, 327)
    d.arrow(155, 290, 155, 187, label="next turn", ldx=8, ldy=4, lanchor="start")
    d.text(480, 232, "while the model keeps asking", size=13, fill=MUTED, italic=True)
    d.rect(50, 396, 860, 44, fill=TONES["slate"][0], stroke=TONES["slate"][1], r=10, sw=1.2)
    d.text(480, 423, "Circuit breakers on every lap:   max turns   ·   token budget   ·   wall-clock timeout   ·   user interrupt",
           size=13, weight=600, fill=TONES["slate"][2])
    d.save(os.path.join(OUT, "agent-loop.svg"))


def transcript():
    d = Diagram(W, 540, "The transcript is the state",
                "Three turns of a real task. Every row is one entry in a list that only grows.")
    rows = [
        ("system", "slate", 'You are a coding agent. Tools: read_file, run_shell'),
        ("user", "indigo", 'Is add() in calc.py correct?'),
        ("assistant", "teal", 'tool_call  id=call_1  read_file(path="calc.py")'),
        ("tool", "amber", 'id=call_1  →  def add(a, b): return a - b'),
        ("assistant", "teal", 'tool_call  id=call_2  run_shell("pytest -q")'),
        ("tool", "amber", 'id=call_2  →  1 failed: test_add'),
        ("assistant", "green", 'No. add() subtracts; the failing test confirms it.'),
    ]
    x, w, h, y0, step = 50, 610, 46, 96, 56
    for i, (role, tone, content) in enumerate(rows):
        y = y0 + i * step
        fill, stroke, tx = TONES[tone]
        d.rect(x, y, w, h, fill=fill, stroke=stroke, r=10, sw=1.2)
        d.pill(x + 10, y + 12, role, tone="white", size=11.5, w=84, mono=True)
        d.text(x + 108, y + 29, content, size=12.5, fill=tx, anchor="start", mono=True)
    a = TONES["amber"][1]
    for i in (2, 4):
        yc = y0 + i * step + h / 2
        d.path(f"M {x + w + 4} {yc} h 16 v {step} h -16", color=a, sw=1.8)
        d.text(x + w + 28, yc + step / 2 + 4, "same id", size=11.5, weight=700, fill=a, anchor="start")
    bx = 770
    spans = [(2, 3, ["turn 1"]), (4, 5, ["turn 2"]), (6, 6, ["turn 3", "no tool call", "→ loop ends"])]
    for a_i, b_i, label in spans:
        ya, yb = y0 + a_i * step + 4, y0 + b_i * step + h - 4
        d.line(bx, ya, bx, yb, color=INK, sw=3)
        d.text(bx + 14, (ya + yb) / 2 + 5 - (len(label) - 1) * 8, label, size=13, weight=700, anchor="start", lh=17)
    d.text(50, 514, "On every turn the harness sends the entire list again. Remove a row and you change what the model knows.",
           size=13, fill=MUTED, anchor="start")
    d.save(os.path.join(OUT, "transcript.svg"))


def tool_contract():
    d = Diagram(W, 446, "A tool has two faces", "A description the model reads, and code the model never sees.")
    d.rect(40, 96, 400, 300, fill="#fff", stroke=LINE, r=14)
    d.pill(58, 110, "WHAT THE MODEL SEES", tone="teal", w=164)
    code = [
        'name: "edit_file"',
        "",
        "description:",
        '  "Replace one exact snippet in a file.',
        '   old_text must match exactly once."',
        "",
        "parameters:",
        "  path      string   required",
        "  old_text  string   required",
        "  new_text  string   required",
    ]
    d.text(62, 162, code, size=12.5, anchor="start", mono=True, lh=21)
    d.rect(520, 96, 400, 300, fill="#fff", stroke=LINE, r=14)
    d.pill(538, 110, "WHAT ACTUALLY RUNS", tone="amber", w=156)
    steps = [("1   validate the arguments", "slate"), ("2   permission gate", "rose"),
             ("3   execute inside the sandbox", "teal"), ("4   cap and trim the output", "amber"),
             ("5   format one result string", "indigo")]
    for i, (label, tone) in enumerate(steps):
        y = 146 + i * 48
        d.box(560, y, 320, 36, label, tone=tone, size=13, r=8)
        if i:
            d.arrow(720, y - 12, 720, y - 2, color=MUTED, sw=1.6)
    d.line(480, 100, 480, 392, color=MUTED, dash="5 6")
    d.arrow(442, 190, 518, 190, label="call", ldy=-9)
    d.arrow(518, 330, 442, 330, label="result", ldy=-9)
    d.text(480, 424, "The schema is the whole interface: the model acts on those words and nothing else.",
           size=13, fill=MUTED)
    d.save(os.path.join(OUT, "tool-contract.svg"))


def gate():
    d = Diagram(W, 470, "Gate, then sandbox", "Every tool call passes three checks before it may touch anything.")
    r = TONES["rose"][1]
    d.box(40, 120, 130, 80, "Tool call", "from the model", tone="white")
    stages = [(215, "1 · Deny rules", ["never allowed,", "in any mode"], "rose"),
              (410, "2 · Mode", ["read-only · ask", "· auto"], "amber"),
              (605, "3 · Approver", ["a human, or a", "policy check"], "indigo")]
    prev = 170
    for x, label, sub, tone in stages:
        d.arrow(prev, 160, x - 3, 160)
        d.box(x, 120, 150, 80, label, sub, tone=tone)
        d.arrow(x + 75, 200, x + 75, 327, color=r, dash="4 5")
        prev = x + 150
    d.rect(790, 96, 140, 222, fill="#f3fbf5", stroke=TONES["green"][1], r=14, dash="7 6")
    d.text(860, 116, "SANDBOX", size=11.5, weight=800, fill=TONES["green"][2])
    d.arrow(755, 160, 802, 160, label="allowed", ldy=-9, ldx=-4)
    d.box(805, 130, 110, 60, "Execute", tone="green")
    d.text(860, 220, ["workspace only", "no secrets in reach", "network off by default", "time + size caps"],
           size=11.5, fill=TONES["green"][2], lh=22)
    d.rect(215, 330, 540, 60, fill=TONES["rose"][0], stroke=r, r=12)
    d.text(485, 355, 'BLOCKED: <reason>', size=14.5, weight=800, fill=TONES["rose"][2], mono=True)
    d.text(485, 376, "returned to the model as an ordinary tool result, so it adapts", size=12.5, fill=TONES["rose"][2])
    d.text(480, 436, "The gate lowers how often something bad is attempted. The sandbox limits what one miss can cost.",
           size=13, fill=MUTED)
    d.save(os.path.join(OUT, "gate-and-sandbox.svg"))


def context_budget():
    d = Diagram(W, 392, "Where the window goes", "Illustrative shares for a long coding session.")
    x0, y0, w, h = 60, 132, 840, 64
    segs = [("System prompt", 4, "slate"), ("Tool schemas", 7, "indigo"), ("Project memory", 5, "green"),
            ("Conversation", 12, "teal"), ("Tool results", 52, "amber"), ("Reply headroom", 20, "white")]
    rows = [238, 276, 314, 238, 238, 238]
    x = x0
    d.text(x0, 120, "0", size=12, fill=MUTED, anchor="start")
    d.text(x0 + w, 120, "context limit", size=12, fill=MUTED, anchor="end")
    for (label, pct, tone), ry in zip(segs, rows):
        fill, stroke, tx = TONES[tone]
        sw = w * pct / 100
        d.rect(round(x, 1), y0, round(sw, 1), h, fill=fill, stroke=stroke, r=4, sw=1.4,
               dash="6 5" if tone == "white" else None)
        cx = x + sw / 2
        d.line(cx, y0 + h + 2, cx, ry - 16, color=stroke, sw=1.4)
        d.text(cx, ry, f"{label}  {pct}%", size=13, weight=700, fill=tx)
        x += sw
    d.text(60, 352, "Tool output (file contents, logs, test runs) is usually the biggest tenant.",
           size=13, fill=MUTED, anchor="start")
    d.text(60, 372, "That is where trimming, capping and folding pay off first.", size=13, fill=MUTED, anchor="start")
    d.save(os.path.join(OUT, "context-budget.svg"))


def compaction():
    d = Diagram(W, 440, "Compaction: fold the old, keep the recent",
                "One mechanism: summarise what is far behind you, leave the last few turns untouched.")
    d.text(40, 112, "BEFORE", size=12, weight=800, fill=MUTED, anchor="start")
    d.box(40, 122, 70, 50, "sys", tone="slate", size=13, r=8, mono=True)
    for i in range(13):
        tone = "white" if i < 9 else "teal"
        d.box(122 + 60 * i, 122, 52, 50, f"m{i + 1}", tone=tone, size=12.5, r=8, mono=True)
    a = TONES["amber"][1]
    d.path("M 122 182 v 8 h 532 v -8", color=a, arrow=False, sw=1.8)
    d.arrow(388, 192, 388, 268, color=a, label="one extra model call writes a summary", ldx=12, ldy=5, lanchor="start")
    d.text(40, 268, "AFTER", size=12, weight=800, fill=MUTED, anchor="start")
    d.box(40, 278, 70, 56, "sys", tone="slate", size=13, r=8, mono=True)
    d.box(122, 278, 300, 56, "summary of m1–m9", "goal · decisions · files touched · open items", tone="amber", size=13.5, r=8)
    for i in range(4):
        d.box(434 + 60 * i, 278, 52, 56, f"m{i + 10}", tone="teal", size=12.5, r=8, mono=True)
    d.text(75, 356, "stable prefix", size=12, fill=MUTED)
    d.text(272, 356, "model-written, lossy", size=12, fill=MUTED)
    d.text(550, 356, "kept word for word", size=12, fill=MUTED)
    d.text(40, 406, "Cut only at a clean boundary. Never separate a tool call from its result, or the next request is rejected.",
           size=13, fill=MUTED, anchor="start")
    d.save(os.path.join(OUT, "compaction.svg"))


def token_growth():
    d = Diagram(W, 428, "Why every long run needs a fold", "Tokens sent per request, turn by turn.")
    x0, y0, x1, ytop = 90, 348, 900, 98
    px = lambda t: round(x0 + t * 13.5, 1)  # noqa: E731
    py = lambda v: round(y0 - v / 220 * (y0 - ytop), 1)  # noqa: E731
    d.line(x0, y0, x1, y0, color=INK, sw=1.6)
    d.line(x0, y0, x0, ytop, color=INK, sw=1.6)
    for t in range(0, 61, 10):
        d.line(px(t), y0, px(t), y0 + 5, color=INK)
        d.text(px(t), y0 + 20, str(t), size=11.5, fill=MUTED)
    d.text((x0 + x1) / 2, y0 + 40, "turn", size=12.5, fill=MUTED)
    for v in (50, 100, 150, 200):
        d.line(x0 - 5, py(v), x0, py(v), color=INK)
        d.text(x0 - 10, py(v) + 4, f"{v}k", size=11.5, fill=MUTED, anchor="end")
    rose, amber, teal = TONES["rose"][1], TONES["amber"][1], TONES["teal"][1]
    d.line(x0, py(200), x1, py(200), color=rose, dash="6 6")
    d.text(x1, py(200) - 7, "context limit", size=12, weight=700, fill=rose, anchor="end")
    d.line(x0, py(140), x1, py(140), color=amber, dash="6 6")
    d.text(x1, py(140) - 7, "compaction budget", size=12, weight=700, fill=amber, anchor="end")
    naive = [(t, 8 + 5.2 * t) for t in range(0, 38)]
    d.path("M " + " L ".join(f"{px(t)} {py(v)}" for t, v in naive), color=rose, sw=2.6, arrow=False)
    ex, ey = px(37), py(200)
    d.path(f"M {ex - 7} {ey - 7} L {ex + 7} {ey + 7} M {ex + 7} {ey - 7} L {ex - 7} {ey + 7}", color=rose, sw=3, arrow=False)
    d.text(ex + 14, ey + 22, "overflow: the run dies", size=12.5, weight=700, fill=rose, anchor="start")
    pts, v = [], 8.0
    for t in range(0, 61):
        pts.append((t, v))
        v += 5.2
        if v >= 140:
            pts.append((t + 1, v))
            v = 46.0
    d.path("M " + " L ".join(f"{px(t)} {py(v)}" for t, v in pts if t <= 60), color=teal, sw=2.6, arrow=False)
    d.line(112, 104, 140, 104, color=rose, sw=2.6)
    d.text(148, 108, "no compaction", size=12.5, weight=600, anchor="start")
    d.line(262, 104, 290, 104, color=teal, sw=2.6)
    d.text(298, 108, "fold at the budget", size=12.5, weight=600, anchor="start")
    d.text(90, 412, "Each request re-sends the transcript, so a run that never folds pays for its whole history again on every turn.",
           size=13, fill=MUTED, anchor="start")
    d.save(os.path.join(OUT, "token-growth.svg"))


def session_log():
    d = Diagram(W, 452, "Durability is an append-only file", "Write each message the moment it exists; resume by reading it back.")
    d.rect(40, 96, 440, 292, fill="#fff", stroke=LINE, r=14)
    d.text(60, 126, "session.jsonl", size=14, weight=800, anchor="start", mono=True)
    d.pill(190, 110, "append-only", tone="teal")
    lines = [
        '1 {"role":"user","content":"add /health"}',
        '2 {"role":"assistant","tool_calls":[call_7]}',
        '3 {"role":"tool","id":"call_7","content":"ok"}',
        '4 {"role":"assistant","tool_calls":[call_8]}',
    ]
    d.text(60, 160, lines, size=12, anchor="start", mono=True, lh=28)
    rose = TONES["rose"]
    d.rect(52, 256, 416, 28, fill=rose[0], stroke=rose[1], r=6, sw=1.2, dash="4 4")
    d.text(60, 275, '5 {"role":"tool","id":"call_8","cont', size=12, anchor="start", mono=True, fill=rose[2])
    d.text(60, 318, "process killed mid-write", size=13, weight=700, fill=rose[1], anchor="start")
    d.text(60, 340, ["line 5 is torn; call_8 has no result;", "nobody knows whether its effect happened"],
           size=12.5, fill=MUTED, anchor="start", lh=19)
    steps = [("1 · Read line by line", "drop a half-written last line", "slate"),
             ("2 · Rebuild the message list", "the log is the state", "teal"),
             ("3 · Repair open tool calls", "answer orphans: “interrupted, verify first”", "amber"),
             ("4 · Re-enter the loop", "the model re-checks the world and continues", "green")]
    for i, (label, sub, tone) in enumerate(steps):
        y = 96 + i * 74
        d.box(560, y, 360, 60, label, sub, tone=tone, size=14)
        if i:
            d.arrow(740, y - 13, 740, y - 2, color=MUTED, sw=1.6)
    d.arrow(482, 126, 557, 126, label="resume", ldy=-9)
    d.text(40, 424, "The worst damage a crash can do is one torn line at the tail, and that is trivially detectable.",
           size=13, fill=MUTED, anchor="start")
    d.save(os.path.join(OUT, "session-log.svg"))


def delegation():
    d = Diagram(W, 456, "Delegation keeps the parent's window clean",
                "A child spends its own context on raw material. Only the conclusion crosses back.")
    teal, amber = TONES["teal"], TONES["amber"]
    d.rect(40, 150, 250, 200, fill="#fff", stroke=LINE, r=14)
    d.text(165, 182, "Parent agent", size=16, weight=800)
    d.text(60, 214, "context used", size=11.5, fill=MUTED, anchor="start")
    d.rect(60, 222, 210, 16, fill="#f1efe8", stroke=LINE, r=8, sw=1)
    d.rect(60, 222, 52, 16, fill=teal[1], stroke=teal[1], r=8, sw=1)
    d.text(165, 274, ["holds the goal, the plan,", "and three short reports"], size=13, fill=MUTED, lh=20)
    kids = [("Scout A · map the auth module", "40 file reads, then thrown away"),
            ("Scout B · run and triage the tests", "full logs never leave this window"),
            ("Scout C · search the docs", "the dead ends stay here")]
    ind, grn = TONES["indigo"][1], TONES["green"][1]
    for i, (label, sub) in enumerate(kids):
        y = 96 + i * 112
        d.rect(640, y, 280, 94, fill="#fff", stroke=LINE, r=14)
        d.text(780, y + 26, label, size=13.5, weight=800)
        d.rect(660, y + 40, 240, 14, fill="#f1efe8", stroke=LINE, r=7, sw=1)
        d.rect(660, y + 40, 204, 14, fill=amber[1], stroke=amber[1], r=7, sw=1)
        d.text(780, y + 76, sub, size=12, fill=MUTED)
        py = 250 + (i - 1) * 36
        cy = y + 47
        d.arrow(292, py - 7, 637, cy - 9, color=ind)
        d.arrow(637, cy + 9, 292, py + 9, color=grn, dash="6 5")
    d.text(452, 142, "brief: goal · scope · output format", size=12.5, weight=700, fill=ind)
    d.text(452, 372, "report: a few hundred tokens", size=12.5, weight=700, fill=grn)
    d.save(os.path.join(OUT, "delegation.svg"))


def orchestration():
    d = Diagram(W, 486, "Orchestration is ordinary code above many loops",
                "No model decides the fan-out. A script does, with budgets and checks.")
    d.box(40, 100, 190, 70, "Task queue", "specs · issues · tickets", tone="slate")
    d.arrow(230, 135, 297, 135)
    d.box(300, 100, 250, 70, "Orchestrator", "plain code, no model inside", tone="ink")
    d.line(550, 135, 618, 135, color=MUTED, dash="4 5")
    d.box(620, 100, 300, 70, "Budget + policy", "concurrency · cost cap · retries · timeouts", tone="white")
    cols = [40 + 225 * i for i in range(4)]
    for i, x in enumerate(cols):
        d.rect(x, 222, 205, 150, fill="#f7f8fb", stroke=TONES["slate"][1], r=14, dash="7 6")
        d.text(x + 102, 242, f"worktree {i + 1}", size=11.5, weight=800, fill=TONES["slate"][2])
        d.box(x + 15, 252, 175, 46, "Agent loop", tone="teal", size=13.5, r=9)
        d.arrow(x + 102, 298, x + 102, 311, color=MUTED, sw=1.6)
        d.box(x + 15, 313, 175, 46, "Check: tests + lint", tone="amber", size=13.5, r=9)
        d.path(f"M 425 170 C 425 200, {x + 102} 190, {x + 102} 219", color=INK, sw=1.8)
        tx = 300 + 120 * i
        d.path(f"M {x + 102} 372 C {x + 102} 392, {tx} 386, {tx} 407", color=TONES["green"][1], sw=1.8)
    d.box(240, 410, 480, 54, "Collect → verify → merge", "a human approves anything irreversible", tone="green")
    d.save(os.path.join(OUT, "orchestration.svg"))


def provider():
    d = Diagram(W, 420, "The provider layer", "One narrow door between your harness and whoever serves the model.")
    d.box(40, 150, 200, 110, "Your harness", ["neutral message format", "tools as plain schemas"], tone="teal")
    d.arrow(240, 205, 307, 205)
    d.rect(310, 110, 240, 190, fill="#fff", stroke=LINE, r=14)
    d.text(430, 138, "Provider adapter", size=15, weight=800)
    for i, job in enumerate(["authenticate", "translate formats", "retry + back off", "normalise reply + usage"]):
        d.box(330, 152 + i * 35, 200, 27, job, tone="slate", size=12.5, r=7)
    d.text(770, 106, "DIRECT APIS", size=11.5, weight=800, fill=MUTED)
    for i, name in enumerate(["Anthropic", "OpenAI", "Google", "DeepSeek"]):
        d.box(625 + (i % 2) * 150, 116 + (i // 2) * 44, 140, 34, name, tone="white", size=13, r=8)
    d.arrow(550, 170, 622, 152)
    d.box(625, 232, 290, 58, "Router  (e.g. OpenRouter)", "one key · many models · fallbacks", tone="indigo", size=14)
    d.arrow(550, 245, 622, 258)
    for i, name in enumerate(["model A", "model B", "model C"]):
        x = 625 + i * 100
        d.box(x, 318, 90, 32, name, tone="slate", size=12, r=8)
        d.arrow(x + 45, 290, x + 45, 316, color=TONES["indigo"][1], sw=1.6)
    d.text(480, 390, "Keep vendor quirks behind this door. Swapping models should change one file, not the loop.",
           size=13, fill=MUTED)
    d.save(os.path.join(OUT, "provider-layer.svg"))


def landscape():
    d = Diagram(W, 506, "Five harnesses, five bets", "A rough sketch of design emphasis. Not a ranking.")
    x0, y0, x1, y1 = 110, 400, 900, 100
    d.line(x0, y0, x1, y0, color=INK, sw=1.6)
    d.line(x0, y0, x0, y1, color=INK, sw=1.6)
    d.text(x0, y0 + 22, "capability built into the core", size=12.5, fill=MUTED, anchor="start")
    d.text(x1, y0 + 22, "capability added at the edges →", size=12.5, fill=MUTED, anchor="end")
    d.text(x0 - 14, y0, "one terminal session", size=12.5, fill=MUTED, anchor="start")
    d.items[-1] = d.items[-1].replace("<text ", f'<text transform="rotate(-90 {x0 - 14} {y0})" ', 1)
    d.text(x0 - 14, y1 + 150, "always on, many surfaces →", size=12.5, fill=MUTED, anchor="start")
    d.items[-1] = d.items[-1].replace("<text ", f'<text transform="rotate(-90 {x0 - 14} {y1 + 150})" ', 1)
    pts = [(235, 318, "Claude Code", "a full runtime in the box", "teal"),
           (330, 232, "Codex", "lean core, strong repo conventions", "indigo"),
           (700, 342, "Pi", "minimal core you extend yourself", "amber"),
           (560, 146, "Hermes", "learning loop that lives on a server", "rose"),
           (690, 246, "DeepSeek Harness", "even the loop is a plugin", "green")]
    for x, y, name, trait, tone in pts:
        fill, stroke, tx = TONES[tone]
        d.raw(f'<circle cx="{x}" cy="{y}" r="11" fill="{stroke}" stroke="#fff" stroke-width="3"/>')
        d.text(x + 20, y - 1, name, size=15, weight=800, fill=tx, anchor="start")
        d.text(x + 20, y + 17, trait, size=12, fill=MUTED, anchor="start")
    d.rect(110, 440, 790, 40, fill=TONES["slate"][0], stroke=TONES["slate"][1], r=10, sw=1.2)
    d.text(505, 465, "Underneath all of them: a model API, reached directly or through a router such as OpenRouter",
           size=12.5, weight=600, fill=TONES["slate"][2])
    d.save(os.path.join(OUT, "landscape.svg"))


def eval_loop():
    d = Diagram(W, 392, "The evaluation loop", "Impressions do not scale. A fixed task set with mechanical checks does.")
    w, h = 220, 70
    xs = [60, 370, 680]
    d.box(xs[0], 104, w, h, "Task spec", "plus a check the agent never sees", tone="slate")
    d.box(xs[1], 104, w, h, "Run headless", "same harness, no human", tone="teal")
    d.box(xs[2], 104, w, h, "Record the trace", "every message, call and token", tone="indigo")
    d.box(xs[2], 256, w, h, "Score", "pass rate · cost · turns · time", tone="amber")
    d.box(xs[1], 256, w, h, "Diagnose", "which layer failed?", tone="rose")
    d.box(xs[0], 256, w, h, "Change one thing", "prompt, tool, budget or gate", tone="green")
    d.arrow(xs[0] + w, 139, xs[1] - 3, 139)
    d.arrow(xs[1] + w, 139, xs[2] - 3, 139)
    d.arrow(xs[2] + w / 2, 174, xs[2] + w / 2, 253)
    d.arrow(xs[2], 291, xs[1] + w + 3, 291)
    d.arrow(xs[1], 291, xs[0] + w + 3, 291)
    d.path(f"M {xs[0] + w / 2} 256 C {xs[0] + w / 2} 205, {xs[1] + 60} 222, {xs[1] + 60} 178", color=INK)
    d.text(xs[0] + w / 2 + 14, 222, "re-run the same specs", size=12.5, weight=600, anchor="start")
    d.text(480, 366, "Hold the task set fixed and change one variable at a time, or you cannot tell what helped.",
           size=13, fill=MUTED)
    d.save(os.path.join(OUT, "eval-loop.svg"))


def maker_checker():
    d = Diagram(W, 384, "Maker and checker", "The one doing the work should not be the only one judging it.")
    d.box(40, 120, 190, 80, "Goal + state file", "what “done” means", tone="slate")
    d.arrow(230, 160, 297, 160)
    d.box(300, 120, 170, 80, "Maker", "does the work", tone="teal")
    d.arrow(470, 160, 537, 160)
    d.box(540, 120, 150, 80, "Artifact", "diff · doc · build", tone="white")
    d.arrow(690, 160, 757, 160)
    d.box(760, 120, 160, 80, "Checker", ["tests, or a second", "agent with a rubric"], tone="amber")
    g, r = TONES["green"][1], TONES["rose"][1]
    d.arrow(885, 200, 885, 262, color=g, label="pass", ldx=-8, ldy=4, lanchor="end")
    d.box(830, 265, 100, 50, "Done", tone="green")
    d.path("M 790 200 C 790 300, 385 310, 385 204", color=r)
    d.text(588, 300, "fail: specific feedback, appended to the state file", size=12.5, weight=700, fill=r)
    d.pill(40, 214, "hard cap on iterations", tone="rose", size=12)
    d.text(480, 356, "Without the cap and the external check, a loop like this just produces confident repetition.",
           size=13, fill=MUTED)
    d.save(os.path.join(OUT, "maker-checker.svg"))


def instruction_map():
    d = Diagram(W, 410, "Give the agent a map, not a manual",
                "A short entry file that points at detail, loaded only when the work needs it.")
    d.rect(40, 120, 230, 200, fill=INK, stroke=INK, r=12)
    d.text(155, 160, "AGENTS.md", size=17, weight=800, fill="#ffffff", mono=True)
    d.text(155, 198,["~100 lines", "what this repo is", "how to build + test", "hard rules", "where to read more"],
           size=12.5, fill="#dfe4ee", lh=22)
    files = [("docs/architecture.md", "how the pieces fit", "teal"),
             ("docs/testing.md", "what “verified” means here", "amber"),
             ("skills/release/SKILL.md", "a procedure, loaded on demand", "indigo"),
             ("PROGRESS.md", "where the last session stopped", "green")]
    for i, (name, sub, tone) in enumerate(files):
        y = 104 + i * 62
        d.box(560, y, 360, 50, name, sub, tone=tone, size=13, mono=True, r=10)
        d.path(f"M 272 220 C 400 220, 430 {y + 25}, 557 {y + 25}", color=MUTED, sw=1.7)
    d.text(415, 132, "points to", size=12.5, weight=700, fill=MUTED)
    d.text(480, 382, "Always-loaded text is paid for on every turn. Keep it small, and let the rest wait on disk.",
           size=13, fill=MUTED)
    d.save(os.path.join(OUT, "instruction-map.svg"))


ALL = [anatomy, stateless, loop, transcript, tool_contract, gate, context_budget, compaction, token_growth,
       session_log, delegation, orchestration, provider, landscape, eval_loop, maker_checker, instruction_map]

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for fn in ALL:
        fn()
    print(f"wrote {len(ALL)} diagrams to {os.path.normpath(OUT)}")
