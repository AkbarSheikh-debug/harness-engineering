/* Deep dive · DeepSeek Harness */
const SDH = 'DeepSeek Harness';

diagram('dsh-cordis', { title: 'Cordis in five ideas', sub: 'The plugin framework underneath dsh. Learn these and the rest of the architecture reads easily.', section: SDH }, s => {
  s.box(560, 320, 800, 330, { c: 'blue', fill: 'blue', r: 22 });
  s.h(960, 378, 'the context is a shelf of services', { a: 'middle', c: 'blue', fs: 34 });
  [['ctx.sessions', 600, 420], ['ctx.tools', 870, 420], ['ctx.llm', 1110, 420], ['ctx.agents', 600, 510], ['ctx.systemPrompt', 850, 510], ['ctx.sandbox', 1160, 510]].forEach(([t, x, y]) => s.pill(x, y, t, { c: 'blue', fill: 'white', fs: 23 }));
  s.m(960, 620, 'plugins find a service by its key, never by importing it', { a: 'middle', fs: 21 });
  s.box(390, 452, 130, 64, { c: 'orange', fill: 'orange', label: 'plugin', fs: 26, w: 400 }); s.arrow(524, 484, 554, 484, { head: 13 });
  s.box(1400, 452, 130, 64, { c: 'orange', fill: 'orange', label: 'plugin', fs: 26, w: 400 }); s.arrow(1396, 484, 1366, 484, { head: 13 });
  const N = [[1, 110, 256, 'orange', 'a plugin is a service', ['a function or a class that', 'mounts into the context']], [2, 110, 580, 'blue', 'services have keys', ['ctx.tools, ctx.llm ...', 'one owner per key']], [3, 1420, 256, 'violet', 'inject = dependencies', ['a plugin waits until the', 'services it names exist']], [4, 1420, 580, 'teal', 'typed events', ['emit · waterfall · parallel', 'serial · bail']]];
  N.forEach(([n, x, y, c, t, d]) => { s.num(x + 24, y, n, c); s.h(x + 64, y + 14, t, { fs: 31, c }); s.m(x + 64, y + 56, d, { fs: 21, lh: 32 }); });
  s.num(604, 736, 5, 'green'); s.h(644, 750, 'registrations are reversible', { fs: 31, c: 'green' });
  s.m(644, 792, 'unload a plugin and everything it registered unwinds', { fs: 21 });
  s.callout('there is no privileged core: the loop, the log and the tools are all just plugins', { w: 1400, y: 892, h: 80, fs: 33 });
});

diagram('dsh-profiles', { title: 'A running dsh is a stack of layers', sub: 'Layers apply in order onto an empty list. Whatever a bundle inserts, a later layer can still patch.', section: SDH }, s => {
  const L = [['--patch overlays', 'one-off, from the command line', 'violet'], ['the home patch', 'your machine-wide changes', 'orange'], ["the profile's own patch", 'cordis.patch.yml', 'amber'], ['an app bundle', 'web app · headless runner · SDK or ACP server', 'blue'], ['dsh-base', 'models · tools · persistence · sandbox + approval', 'green']];
  L.forEach(([t, d, c], i) => s.box(150, 244 + i * 112, 760, 96, { c, fill: c, label: t, sub: d, fs: 31, sfs: 20 }));
  s.arrow(104, 786, 104, 252, { c: 'gray', sw: 3.4 }); s.text(86, 640, 'applied in this order', { rot: -90, fs: 25, c: 'gray' });
  s.arrow(924, 400, 1000, 400, { sw: 3.4 });
  s.box(1010, 244, 800, 320, { fill: 'ink' });
  s.m(1040, 296, ['$ dsh --profile web --dump-config', '- id: agent-loop', '- id: tools', '- id: session-persistence-jsonl', '- id: sandbox-local', '- id: ...'], { c: '#8ce99a', fs: 23, lh: 44, free: true });
  s.h(1010, 636, 'shipped profiles', { fs: 32 });
  let x = 1010; ['web', 'headless', 'sdk', 'sdk-minimal', 'acp'].forEach(t => { x += s.pill(x, 656, t, { c: 'blue', fill: 'blue', fs: 23 }) + 16; });
  s.m(1010, 770, ['a patch targets a row by its id: it replaces', "that row's config, or inserts a new row"], { c: 'violet', fs: 23, lh: 36 });
  s.callout('configuration is the architecture: any row can be replaced', { w: 1100, y: 892, h: 80 });
});

diagram('dsh-tool-pipeline', { title: 'One tool call, start to finish', sub: 'A fixed pipeline. Policy, timeouts and result rewriting attach to its stages instead of living in the loop.', section: SDH }, s => {
  const st = [['the assistant message has a tool call', 'gray'], ['tool/call     logged BEFORE anything runs', 'green'], ['tools/pre-execute     allow · deny · ask', 'violet'], ['guards     may only deny', 'red'], ['tools/execute     timeout · retry · metrics', 'violet'], ['the tool body runs', 'ink'], ['tools/post-execute     replace · block · add context', 'violet'], ['tool/result     the one outcome the model sees', 'green']];
  const Y = i => 232 + i * 82;
  st.forEach(([t, c], i) => { if (c === 'ink') s.box(560, Y(i), 640, 60, { fill: 'ink', label: t, font: 'mono', fs: 22, w: 400 }); else s.box(560, Y(i), 640, 60, { c, fill: c, label: t, font: 'mono', fs: 21, w: 400, off: 3 });
    if (i) s.arrow(880, Y(i) - 20, 880, Y(i) - 3, { head: 12, sw: 2.6 }); });
  s.box(100, 380, 360, 130, { c: 'amber', fill: 'amber', label: 'one-shot approval', sub: ['nobody can answer?', 'that means DENY'], fs: 28, sfs: 20 });
  s.arrow(554, 420, 466, 432, { c: 'amber', label: 'ask', ldy: -14 }); s.arrow(466, 486, 554, 500, { c: 'amber' });
  s.box(1290, 392, 530, 124, { c: 'red', fill: 'red', label: 'denied: the body is skipped', sub: 'the model still gets a result', fs: 27, sfs: 20 });
  s.arrow(1206, 426, 1284, 440, { c: 'red' }); s.arrow(1206, 508, 1284, 480, { c: 'red' });
  s.arrow(1556, 522, 1206, 836, { c: 'red', dash: true, bend: -60 });
  s.m(100, 600, ['hooks, permission and', 'sandbox policy listen at', 'pre-execute'], { c: 'violet', fs: 22, lh: 34 });
  s.m(1530, 640, ['read-only calls may', 'overlap (10 at a time', 'by default); exclusive', 'calls keep their order'], { c: 'gray', fs: 20, lh: 30 });
  s.m(100, 780, ['an exception at any stage', 'becomes an error result,', 'never a crash'], { c: 'green', fs: 22, lh: 34 });
});

diagram('dsh-permissions', { title: 'Two knobs, bundled into presets', sub: 'Sandbox mode says what a process is able to do. Approval policy says when a person is asked.', section: SDH }, s => {
  s.h(540, 268, 'approval policy  →', { c: 'violet', fs: 32 });
  s.h(110, 268, 'sandbox mode  ↓', { c: 'teal', fs: 32 });
  s.box(540, 290, 380, 60, { c: 'violet', fill: 'violet', label: 'ask', fs: 30 }); s.box(940, 290, 380, 60, { c: 'violet', fill: 'violet', label: 'never', fs: 30 });
  const rows = [['read-only', 'writes are denied'], ['workspace-write', 'writes inside the workspace + temp'], ['danger-full-access', 'no confinement at all']];
  rows.forEach(([t, d], i) => { const y = 370 + i * 150; s.box(110, y, 410, 130, { c: 'teal', fill: 'teal', label: t, sub: d, fs: 29, sfs: 19 });
    [0, 1].forEach(j => { const x = 540 + j * 400; const preset = (i === 1 && j === 0) || (i === 2 && j === 1);
      if (preset) s.box(x, y, 380, 130, i === 1 ? { c: 'green', fill: 'green', label: 'preset:', sub: ['workspace-write', 'the shipped default'], fs: 27, sfs: 21, sw: 4 } : { c: 'red', fill: 'red', label: 'preset:', sub: ['danger-full-access'], fs: 27, sfs: 21, sw: 4 });
      else s.box(x, y, 380, 130, { c: 'gray', dash: true, label: 'custom', fs: 26, w: 400, tc: 'gray', sw: 2.4 }); }); });
  s.h(1390, 330, 'who enforces it', { fs: 34 });
  s.m(1390, 376, ['Linux:    bwrap + Landlock', 'macOS:    Seatbelt', 'Windows:  restricted token', '          + ACLs', 'remote:   over SSH'], { fs: 22, lh: 36 });
  s.m(1390, 620, ['no usable backend?', 'the call FAILS. it never', 'runs unconfined.'], { c: 'red', fs: 23, lh: 36 });
  s.m(1390, 770, ['plan mode is separate:', 'soft guidance only'], { c: 'gray', fs: 22, lh: 34 });
  s.callout('the sandbox vocabulary covers file effects only. network and process visibility are outside it.', { w: 1500, y: 892, h: 80, fs: 32 });
});

diagram('dsh-event-log', { title: 'The log is the source. Everything else is a view.', sub: 'One append-only event log per session. The model history is derived from it, never stored beside it.', section: SDH, tfs: 60 }, s => {
  s.box(110, 236, 590, 620, { fill: 'white' });
  s.m(142, 286, 'session event log', { fs: 28 }); s.pill(456, 258, 'append-only', { c: 'teal', fill: 'teal', fs: 20 });
  s.m(142, 336, ['1   turn/start', '2   system/message', '3   user/message', '4   step/start', '5   assistant/message', '6   tool/call', '7   tool/result', '8   todo/write', '9   step/end', '10  compaction/start', '11  compaction/summary', '12  compaction/end', '13  turn/end'], { fs: 21, lh: 38 });
  [8, 10, 11, 12].forEach(n => s.m(492, 336 + (n - 1) * 38, 'log-only', { fs: 18, c: 'amber' }));
  const V = [['model history', 'derived on every request, never stored', 'violet'], ['the UI transcript', 'rendered and replayed from the same events', 'blue'], ['plan · todo · goal state', 'folded from log-only events', 'amber'], ['token meter', 'request pressure, anchored on provider usage', 'teal'], ['fork · resume · search', 'all of them just read the log', 'green']];
  V.forEach(([t, d, c], i) => { const y = 244 + i * 116; s.box(1010, y, 800, 96, { c, fill: c, label: t, sub: d, fs: 31, sfs: 20 }); s.arrow(708, 546, 1002, y + 48, { bend: (i - 2) * -18, sw: 2.6, head: 14 }); });
  s.m(800, 262, 'projections', { fs: 22, c: 'gray' });
  s.callout('model-visible means logged: if the model saw it, the log can rebuild it', { w: 1260, y: 896, h: 78, fs: 34 });
});

diagram('dsh-inbox', { title: 'Talking to a running agent: the inbox', sub: 'Nothing is pushed into a live turn. Messages wait in two durable lists and are claimed at boundaries.', section: SDH }, s => {
  [[260, 'blue', 'followup()', 'a new prompt'], [400, 'orange', 'steer()', 'redirect it mid-run'], [540, 'violet', 'inject()', 'context from a plugin']].forEach(([y, c, t, d]) => s.box(100, y, 310, 92, { c, fill: c, label: t, font: 'mono', fs: 27, w: 400, sub: d, sfs: 20 }));
  s.box(520, 244, 540, 410, { fill: 'white' }); s.h(790, 300, 'the inbox', { a: 'middle', fs: 36 });
  s.box(552, 326, 476, 130, { c: 'amber', fill: 'amber', label: 'next-step', sub: 'claimed at the next step boundary', fs: 31, sfs: 20 });
  s.box(552, 486, 476, 130, { c: 'blue', fill: 'blue', label: 'next-turn', sub: 'one is claimed when a turn ends', fs: 31, sfs: 20 });
  s.arrow(416, 306, 546, 530, { c: 'blue', bend: 30, sw: 2.8 }); s.arrow(416, 446, 546, 400, { c: 'orange', sw: 2.8 }); s.arrow(416, 586, 546, 420, { c: 'violet', bend: 30, sw: 2.8 });
  s.arrow(1066, 400, 1126, 400);
  s.box(1134, 300, 320, 200, { c: 'violet', fill: 'violet', label: 'agent/pre-step', font: 'mono', fs: 25, w: 400, sub: ['listeners may rewrite', 'or reject the batch'], sfs: 20 });
  s.arrow(1460, 400, 1516, 400);
  s.box(1524, 300, 300, 200, { fill: 'ink', label: 'a step', sub: ['one model request', '+ the tools it calls'], fs: 38, sfs: 20 });
  s.arrow(1674, 508, 1040, 580, { bend: -70, c: 'gray', dash: true }); s.m(1380, 620, 'tools owe another request? next step', { a: 'middle', fs: 20, c: 'gray' });
  s.check(100, 716, 0.9); s.m(156, 724, 'every pending message is durable: the inbox survives a restart', { fs: 22 });
  s.check(100, 772, 0.9); s.m(156, 780, 'followup() returns a message id, not an answer. whenIdle() watches the whole agent', { fs: 22 });
  s.check(100, 828, 0.9); s.m(156, 836, 'a cancel records its cause on turn/end, so the log says WHY a turn stopped', { fs: 22 });
  s.callout('a turn is zero or more steps. a step is one model request plus its tools.', { w: 1300, y: 900, h: 78, fs: 34 });
});

diagram('dsh-agents', { title: 'Beyond one agent: four optional capabilities', sub: 'None of these is part of the loop. Each is a package you mount when you need it.', section: SDH }, s => {
  const C = [[110, 238, 'teal', 'sub-agents', ['one activation API, as a seam', 'local child = its own durable session', 'or a run in another product entirely', 'options: depth limit · tool filter', 'output schema · persona']], [980, 238, 'violet', 'agent teams  (experimental)', ['a roster, plus direct inbox messages', 'a shared task graph: every task has', 'a revision (compare-and-set)', 'blockedBy edges, kept acyclic', 'write scopes are advice, not locks']], [110, 546, 'orange', 'workflows', ['the model writes an orchestration', 'SCRIPT that starts sub-agents', 'it runs in the sandboxed code runtime', 'so the plan is code you can read']], [980, 546, 'green', 'triggers', ['schedule: after · every · daily', 'weekly · cron; reminders return', 'to their original session', 'webhook: a verified delivery', 'starts an ordinary root session']]];
  C.forEach(([x, y, c, t, d]) => { s.box(x, y, 830, 284, { c, fill: c }); s.h(x + 34, y + 62, t, { c, fs: 38 }); s.m(x + 34, y + 110, d, { fs: 21, lh: 33 }); });
  s.robot(820, 370, 0.85, { fill: 'white', c: 'teal' });
  [[1590, 330], [1690, 400], [1590, 440]].forEach(([x, y]) => s.box(x, y, 80, 50, { c: 'violet', fill: 'white', off: 0, r: 8 }));
  s.arrow(1650, 380, 1686, 408, { c: 'violet', head: 11, sw: 2.4 }); s.arrow(1672, 452, 1686, 440, { c: 'violet', head: 11, sw: 2.4 });
  s.terminal(760, 690, 150, 100, { fs: 30 });
  s.clock(1720, 700, 50, { c: 'green' });
  s.callout('the loop stays small because all of this lives beside it, not inside it', { w: 1260, y: 896, h: 78, fs: 34 });
});

diagram('dsh-ptc', { title: 'Two ways to show tools to a model', sub: 'Native function calling, or one code tool plus a generated SDK. It is a mode switch, per agent.', section: SDH }, s => {
  s.h(110, 280, 'native: every schema on the wire', { c: 'blue', fs: 34 });
  ['read', 'write', 'edit', 'bash', 'grep', 'web_fetch'].forEach((t, i) => s.box(110 + (i % 3) * 236, 310 + Math.floor(i / 3) * 92, 216, 72, { c: 'blue', fill: 'blue', label: t, font: 'mono', fs: 24, w: 400 }));
  s.m(110, 548, ['the model calls tools one at a time', 'each result comes back into the context'], { fs: 23, lh: 36 });
  s.m(110, 660, ['5 tool calls', '= 5 round trips', '= 5 results in the window'], { c: 'red', fs: 25, lh: 40 });
  s.text(900, 520, 'vs', { fs: 48, w: 700, a: 'middle', c: 'gray' });
  s.h(1010, 280, 'ptc: one tool, plus a generated SDK', { c: 'green', fs: 34 });
  s.box(1010, 310, 800, 84, { c: 'green', fill: 'green', label: 'run_code', font: 'mono', fs: 28, w: 400, sub: 'the only tool on the wire', sfs: 20 });
  s.box(1010, 414, 800, 276, { fill: 'ink' });
  s.m(1036, 462, ['const hits = await tools.grep({ pattern: "TODO" })', 'for (const h of hits.matches) {', '  const f = await tools.read({ path: h.path })', '  // ...keep what matters...', '}', 'console.log(summary)'], { c: '#8ce99a', fs: 21, lh: 40, free: true });
  s.m(1010, 734, 'illustrative: the real SDK is generated from the tool schemas', { fs: 20, c: 'gray' });
  s.m(1010, 786, ['every sub-call still passes the whole pipeline:', 'permission, guards and logging'], { c: 'green', fs: 22, lh: 34 });
  s.callout('the tools do not change. only how they are presented to the model does.', { w: 1260, y: 896, h: 78, fs: 34 });
});
