/* Chapter 1 · The loop */
const S1 = '1 · The loop';

diagram('the-ask', { title: "A model can't act. But it can ask.", sub: 'Give it a menu of tools and every reply becomes one of exactly two kinds.', section: S1 }, s => {
  s.chip(810, 236, 300, 104, { sub: 'one reply per call', sfs: 20 });
  s.arrow(840, 352, 560, 452, { bend: 30 });
  s.arrow(1080, 352, 1360, 452, { bend: -30 });
  s.m(960, 404, 'which kind is it?', { a: 'middle', c: 'gray' });

  s.h(170, 470, '(A) it talks', { c: 'green' });
  s.box(170, 496, 720, 190, { c: 'green', fill: 'green' });
  s.m(206, 552, ['{ "role": "assistant",', '  "content": "The test fails because', '              the token has expired." }'], { fs: 26, lh: 40 });
  s.m(206, 738, 'no tool_calls in the reply', { c: 'green', fs: 27 });
  s.arrow(640, 730, 700, 730, { c: 'green' });
  s.text(530, 812, 'this is the answer. return it.', { a: 'middle', fs: 36, w: 700, c: 'green' });

  s.h(1030, 470, '(B) it asks', { c: 'orange' });
  s.box(1030, 496, 720, 190, { c: 'orange', fill: 'orange' });
  s.m(1066, 544, ['{ "role": "assistant",', '  "tool_calls": [ { "id": "call_1",', '      "name": "read_file",', '      "path": "auth.py" } ] }'], { fs: 25, lh: 36 });
  s.m(1066, 738, 'tool_calls is not empty', { c: 'orange', fs: 27 });
  s.arrow(1420, 730, 1480, 730, { c: 'orange' });
  s.text(1390, 812, 'this is a request. somebody has to do it.', { a: 'middle', fs: 36, w: 700, c: 'orange' });

  s.callout('the whole agent loop is an if-statement on that one bit', { w: 1000, fs: 35 });
});

diagram('agent-loop', { title: 'The loop that makes an agent', sub: 'Five steps, repeated until the model stops asking for tools.', section: S1 }, s => {
  s.man(128, 420, 1, { fill: 'blue' });
  s.m(44, 318, ['"fix the', ' failing test"'], { c: 'blue', fs: 26 });
  s.arrow(176, 470, 262, 484);

  s.box(270, 431, 300, 104, { c: 'blue', fill: 'blue', label: 'assemble', sub: 'system + history + tools', sfs: 20 });
  s.chip(662, 258, 276, 104, { label: 'call the model', fs: 32, sub: 'one request, one reply', sfs: 20 });
  s.box(1030, 431, 300, 104, { c: 'violet', fill: 'violet', label: 'read the reply', sub: 'text? tool calls? both?', sfs: 20 });
  s.box(885, 710, 300, 104, { c: 'orange', fill: 'orange', label: 'run the tools', sub: 'validate > gate > execute', sfs: 20 });
  s.box(415, 710, 300, 104, { c: 'teal', fill: 'teal', label: 'append results', sub: 'one result per call id', sfs: 20 });
  s.num(270, 431, 1, 'blue'); s.num(662, 258, 2, 'ink'); s.num(1030, 431, 3, 'violet'); s.num(885, 710, 4, 'orange'); s.num(415, 710, 5, 'teal');

  s.arrow(470, 424, 636, 320, { bend: -40 });
  s.arrow(964, 320, 1130, 424, { bend: -40 });
  s.arrow(1196, 542, 1108, 702, { bend: -40, c: 'orange', label: 'tool calls', ldx: 100, ldy: 6 });
  s.arrow(878, 764, 722, 764, { bend: -34 });
  s.arrow(492, 702, 404, 542, { bend: -40, label: 'next lap', ldx: -92, ldy: 6 });

  s.m(800, 520, ['while tool_calls:', '    keep going'], { c: 'violet', a: 'middle', fs: 30, lh: 42 });
  s.text(800, 640, 'lap 1 ... lap 2 ... lap 3 ...', { a: 'middle', c: 'gray', fs: 28 });

  s.arrow(1338, 483, 1470, 483, { c: 'green' });
  s.m(1404, 404, 'no tool calls', { c: 'green', a: 'middle', fs: 23 });
  s.box(1478, 431, 336, 104, { c: 'green', fill: 'green', label: 'return the answer', fs: 32, sub: 'the model says it is done', sfs: 20 });
  s.flag(1822, 426, 0.9);

  s.sticky(1470, 630, 350, 200, ['circuit breakers', 'on every lap:', 'max turns · token budget', 'wall clock · ctrl-c'], { rot: 2.5, fs: 27 });
  s.callout("agency isn't inside the model. it is this loop.", { w: 900 });
});

diagram('transcript', { title: 'The transcript is the whole state', sub: 'Three turns of a real task. Every row is one entry in a list that only ever grows.', section: S1 }, s => {
  const rows = [
    ['system', 'gray', 'you are a coding agent. tools: read_file, run_shell'],
    ['user', 'blue', 'is add() in calc.py correct?'],
    ['assistant', 'violet', 'tool_call  id=call_1  read_file("calc.py")'],
    ['tool', 'orange', 'id=call_1  ->  def add(a, b): return a - b'],
    ['assistant', 'violet', 'tool_call  id=call_2  run_shell("pytest -q")'],
    ['tool', 'orange', 'id=call_2  ->  1 failed: test_add'],
    ['assistant', 'green', 'no. add() subtracts; the failing test proves it.'],
  ];
  const Y = i => 236 + i * 90;
  rows.forEach(([role, c, body], i) => { s.box(120, Y(i), 1010, 70, { c, fill: c, sw: 2.6 });
    s.text(146, Y(i) + 47, role, { fs: 29, w: 700, c }); s.m(318, Y(i) + 46, body, { fs: 23 }); });
  [[2, 3], [4, 5]].forEach(([a, b]) => { const ya = Y(a) + 35, yb = Y(b) + 35;
    s.path(`M1140 ${ya} C1216 ${ya} 1216 ${yb} 1140 ${yb}`, { c: 'amber', sw: 3.6, rough: 0.9 });
    s.m(1214, (ya + yb) / 2 + 8, 'same id', { c: 'amber', fs: 23 }); });
  [[2, 3, 'turn 1'], [4, 5, 'turn 2'], [6, 6, 'turn 3']].forEach(([a, b, name]) => { s.vbracket(1392, Y(a) + 6, Y(b) + 64, { c: 'ink' });
    s.text(1412, (Y(a) + Y(b)) / 2 + 46, name, { fs: 32, w: 700 }); });
  s.m(1412, Y(6) + 82, ['no tool call:', 'the loop ends'], { c: 'green', fs: 22, lh: 30 });
  s.m(1570, 290, ['append  = remember', 'delete  = forget', 'rewrite = change', '          its past'], { c: 'red', fs: 23, lh: 38 });
  s.sticky(1560, 470, 280, 170, ['every turn re-sends', 'the ENTIRE list'], { rot: 3, fs: 27 });
  s.callout('want to know what the agent knows at turn 40?  print(messages)', { w: 1160, fs: 34 });
});

diagram('workflow-vs-agent', { title: 'Who owns the exit?', sub: 'A workflow and an agent can use the very same model. The difference is who decides the work is done.', section: S1 }, s => {
  s.h(96, 290, '(A) WORKFLOW — you write the steps', { c: 'blue' });
  s.m(96, 344, 'the plan is fixed before the run starts', { c: 'blue' });
  const xs = [96, 262, 428, 594, 760], names = ['plan', 'step 1', 'step 2', 'step 3', 'done'];
  xs.forEach((x, i) => { s.box(x, 400, 136, 84, { c: 'blue', fill: 'blue', label: names[i], fs: 31, w: 400 }); if (i) s.arrow(x - 28, 442, x - 4, 442, { head: 14 }); });
  s.bracket(262, 730, 520, { label: 'YOU decided there are three' });
  s.m(96, 640, ['breaks when the task is unpredictable', '(what if 2 were enough? or it needs 9?)'], { c: 'red', lh: 36 });
  s.m(96, 760, ['good for: pipelines you can script', 'in advance, step by step'], { c: 'gray', lh: 36 });

  s.text(1000, 366, ['INVERSION', 'OF CONTROL'], { c: 'red', fs: 34, a: 'middle', w: 700, lh: 40 });
  s.arrow(930, 446, 1070, 446, { c: 'red', sw: 3.6 });
  s.m(1000, 500, ['the exit moves', 'INTO the model'], { c: 'red', a: 'middle', lh: 34 });

  s.h(1130, 290, '(B) AGENT — the model decides', { c: 'orange' });
  [336, 314, 296].forEach(d => s.circle(1330, 556, d, { c: 'orange', sw: 3, rough: 1.9, bow: 2 }));
  s.wheel(1330, 556, 60);
  s.arrow(1094, 690, 1172, 634); s.text(1044, 732, 'START', { fs: 28, c: 'gray' });
  s.arrow(1330, 730, 1330, 800); s.text(1330, 842, 'EXIT — done', { fs: 28, c: 'gray', a: 'middle' });
  s.m(1556, 400, ['while tool_calls:', '    keep going'], { c: 'violet', lh: 36 });
  s.m(1556, 520, ['the MODEL chooses', 'each lap: act', 'again, or stop'], { c: 'blue', lh: 36 });
  s.m(1556, 680, ['number of laps', 'depends on the', 'task, not on you'], { c: 'orange', lh: 36 });

  s.callout(['a workflow follows your steps.', 'an agent decides its own — including the last one.'], { w: 1000, fs: 33, y: 882 });
});

diagram('three-endings', { title: 'Every run ends one of three ways', sub: 'A good harness produces a readable ending for all of them.', section: S1 }, s => {
  const cols = [
    [110, 'green', 'finished', ['the reply has no tool calls.', 'the model is saying: done.'], ['"Fixed add(): it used - .', ' 14 tests pass now."']],
    [700, 'amber', 'out of budget', ['max turns, token budget or', 'wall clock ran out mid-task.'], ['one last call, tools OFF:', '"what is done? what is left?', ' what would you do next?"']],
    [1290, 'red', 'broken', ['provider down, disk full,', 'or a bug in the harness.'], ['save the session first.', 'say what failed, and how', 'to resume: --resume <file>']],
  ];
  cols.forEach(([x, c, name, why, sample]) => {
    s.box(x, 244, 520, 440, { c, fill: c });
    s.h(x + 150, 318, name, { c, fs: 46 });
    s.m(x + 34, 392, why, { fs: 23, lh: 34 });
    s.box(x + 30, 470, 460, 180, { c, fill: 'white', off: 0, sw: 2.6 });
    s.m(x + 52, 522, sample, { fs: 22, lh: 38 });
    s.arrow(x + 260, 694, x + 260, 752, { c });
  });
  s.flag(176, 330, 0.95); s.clock(772, 300, 36, { c: 'amber' }); s.bolt(1362, 262, 0.95);
  s.box(240, 762, 1440, 104, { c: 'ink', fill: 'amber', label: 'the human always reads a status report', sub: 'never a stack trace  ·  never silence', fs: 38, sfs: 23 });
});

diagram('resend-cost', { title: 'You pay for the whole transcript, every turn', sub: 'Each bar is one request. Grey is history sent again; orange is what is actually new.', section: S1 }, s => {
  s.line(180, 800, 1480, 800, { sw: 3.4 }); s.line(180, 800, 180, 262, { sw: 3.4 });
  s.text(150, 620, 'tokens in the request', { rot: -90, fs: 26, c: 'gray' });
  for (let i = 0; i < 8; i++) { const x = 226 + i * 156, u = 62;
    if (i) { s.box(x, 800 - i * u, 112, i * u, { c: 'gray', hatch: 'gray', gap: 12, r: 2, sw: 2.4, rough: 1 }); }
    s.box(x, 800 - (i + 1) * u, 112, u, { c: 'orange', fill: 'orange', r: 2, sw: 2.6, off: 0, rough: 1 });
    s.m(x + 56, 838, 'turn ' + (i + 1), { a: 'middle', fs: 21, c: 'gray' }); }
  s.line(226, 730, 1440, 296, { c: 'red', dash: true, sw: 3 });
  s.m(560, 420, ['the area under this', 'line is your bill'], { c: 'red', fs: 25, lh: 34 });
  s.box(1530, 300, 46, 40, { c: 'orange', fill: 'orange', off: 0, r: 2 }); s.m(1592, 330, 'new this turn', { fs: 24 });
  s.box(1530, 366, 46, 40, { c: 'gray', hatch: 'gray', gap: 10, r: 2 }); s.m(1592, 396, 're-sent history', { fs: 24 });
  s.m(1530, 500, ['8 turns of work', '= 36 units paid', '(1+2+3+...+8)'], { c: 'violet', fs: 26, lh: 40 });
  s.text(1530, 700, ['cost grows with', 'the SQUARE of', 'the run length'], { c: 'red', fs: 34, w: 700, lh: 44 });
  s.callout('agents read far more than they write. this picture is why.', { w: 1100 });
});
