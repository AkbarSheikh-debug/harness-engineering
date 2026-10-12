/* Harnesses in the wild */
const SH = 'Harnesses in the wild';

diagram('landscape', { title: 'Five harnesses, five bets', sub: 'A rough sketch of design emphasis. Not a ranking.', section: SH }, s => {
  s.line(220, 790, 1790, 790, { sw: 3.4 }); s.line(220, 790, 220, 250, { sw: 3.4 });
  s.m(236, 824, '<- capability built into the core', { fs: 21, c: 'gray' });
  s.m(1784, 824, 'capability added at the edges ->', { fs: 21, c: 'gray', a: 'end' });
  s.text(196, 780, 'one terminal session', { rot: -90, fs: 23, c: 'gray' });
  s.text(196, 480, 'always on, many surfaces', { rot: -90, fs: 23, c: 'gray' });
  const pts = [[470, 640, 'Claude Code', 'a full runtime in the box', 'teal'], [640, 494, 'Codex', 'lean core, strong repo conventions', 'violet'], [1300, 690, 'Pi', 'a minimal core you extend yourself', 'amber'], [1040, 320, 'Hermes', 'a learning loop that lives on a server', 'pink'], [1330, 470, 'DeepSeek Harness', 'even the loop is a plugin', 'green']];
  pts.forEach(([x, y, name, trait, c]) => { s.circle(x, y, 50, { c, fill: c, off: 3 }); s.h(x + 44, y + 4, name, { c, fs: 38 }); s.m(x + 44, y + 40, trait, { fs: 21, c: 'gray' }); });
  s.box(220, 856, 1570, 64, { c: 'gray', fill: 'gray', label: 'underneath all of them: a model API, reached directly or through a router such as OpenRouter', fs: 25, w: 400 });
});

diagram('claude-code-map', { title: 'Claude Code: four mechanisms, four jobs', sub: 'It does not have one generic "plugin" idea. It has four, and each answers a different question.', section: SH }, s => {
  [300, 280].forEach(d => s.circle(960, 520, d, { c: 'orange', sw: 3, rough: 1.9, bow: 2 }));
  s.chip(850, 470, 220, 100, { label: 'the loop', fs: 32, pins: 3 });
  const cards = [[110, 244, 'blue', 'CLAUDE.md', 'WHAT is true about this project?', 'always loaded · layered by scope'], [1210, 244, 'green', 'skills/', 'HOW do I do this procedure?', 'one line always · body on demand'], [110, 556, 'violet', 'MCP servers', 'WHERE do I reach other systems?', 'schemas up front · calls on demand'], [1210, 556, 'red', 'hooks', 'WHEN must a rule be enforced?', 'never in context · runs outside the model']];
  cards.forEach(([x, y, c, name, q, how]) => { s.box(x, y, 600, 210, { c, fill: c }); s.m(x + 32, y + 58, name, { fs: 30, c }); s.h(x + 32, y + 118, q, { fs: 33 }); s.m(x + 32, y + 170, how, { fs: 21, c: 'gray' }); });
  s.arrow(716, 380, 836, 450, { bend: -16 }); s.arrow(1204, 380, 1084, 450, { bend: 16 }); s.arrow(716, 640, 836, 590, { bend: 16 }); s.arrow(1204, 640, 1084, 590, { bend: -16 });
  let x = 110; [['permission modes + allow / deny rules', 'amber'], ['sub-agents with their own windows', 'teal'], ['JSONL sessions: resume · fork · rewind', 'orange']].forEach(([t, c]) => { x += s.pill(x, 800, t, { c, fill: c, fs: 22 }) + 24; });
  s.callout('a hard rule written as a polite sentence will eventually be ignored. make it a hook.', { w: 1420, fs: 33 });
});

diagram('codex-dials', { title: 'Codex: two dials and a map', sub: 'Safety comes from the operating system. Knowledge comes from the repository.', section: SH }, s => {
  s.h(110, 280, 'dial 1: sandbox mode', { c: 'teal' });
  s.m(110, 322, 'what the process is ABLE to do. the kernel enforces it.', { fs: 21, c: 'gray' });
  [[110, 240, 'read-only', 'green'], [370, 290, 'workspace-write', 'amber'], [680, 240, 'full access', 'red']].forEach(([x, w, t, c]) => s.box(x, 346, w, 92, { c, fill: c, label: t, fs: 29 }));
  s.h(110, 536, 'dial 2: approval policy', { c: 'violet' });
  s.m(110, 578, 'WHEN a human is consulted.', { fs: 21, c: 'gray' });
  [[110, 240, 'untrusted', 'ask a lot'], [370, 290, 'on-request', 'the model asks'], [680, 240, 'never', 'unattended']].forEach(([x, w, t, d]) => s.box(x, 602, w, 100, { c: 'violet', fill: 'violet', label: t, sub: d, fs: 29, sfs: 20 }));
  s.m(110, 772, ['kernel sandbox + network off = the agent can run', 'commands freely, with no prompt for each one'], { c: 'teal', fs: 23, lh: 36 });
  s.line(990, 250, 990, 840, { c: 'gray', dash: true });
  s.h(1060, 280, 'and a map: AGENTS.md', { c: 'blue' });
  s.box(1060, 310, 320, 380, { fill: 'ink' });
  s.m(1090, 372, 'AGENTS.md', { c: 'white', fs: 32 });
  s.text(1090, 440, ['about 100 lines', 'a directory page,', 'not an', 'encyclopedia'], { c: '#e9ecef', fs: 29, lh: 50 });
  ['docs/architecture.md', 'docs/testing.md', 'docs/plans/active/'].forEach((t, i) => { const y = 324 + i * 124; s.box(1470, y, 350, 92, { c: 'blue', fill: 'blue', label: t, font: 'mono', fs: 22, w: 400 }); s.arrow(1386, 500, 1462, y + 46, { sw: 2.8 }); });
  s.m(1060, 772, ['state invariants and how to verify them.', 'do not micromanage the implementation.'], { c: 'blue', fs: 23, lh: 36 });
  s.callout('the core stays lean. the sandbox and the repository do the work.', { w: 1180 });
});

diagram('pi-stack', { title: 'Pi: a small core that you extend', sub: 'Where other harnesses add a feature, Pi adds an extension point and lets you choose.', section: SH }, s => {
  s.box(110, 250, 700, 100, { c: 'orange', fill: 'orange', label: 'pi-coding-agent', font: 'mono', fs: 27, w: 400, sub: 'the interactive CLI', sfs: 20 });
  s.box(110, 366, 700, 100, { c: 'violet', fill: 'violet', label: 'pi-agent-core', font: 'mono', fs: 27, w: 400, sub: 'the loop: tool calling + state', sfs: 20 });
  [[110, 'pi-ai', 'providers'], [346, 'pi-durable', 'sessions'], [582, 'pi-tui', 'terminal UI']].forEach(([x, t, d]) => s.box(x, 482, 228, 100, { c: 'teal', fill: 'teal', label: t, font: 'mono', fs: 25, w: 400, sub: d, sfs: 20 }));
  s.h(110, 666, 'four doors in', { fs: 36 });
  let x = 110; ['interactive', 'print / JSON', 'RPC', 'SDK'].forEach(t => { x += s.pill(x, 690, t, { c: 'blue', fill: 'blue', fs: 24 }) + 18; });
  s.m(110, 806, 'sessions are stored as a tree: /tree jumps back to any node', { fs: 21, c: 'gray' });
  s.h(900, 282, 'you customise four layers', { c: 'teal' });
  [['extensions', 'TypeScript hooks on events: tools, gates, context'], ['skills', 'packages loaded on demand (Agent Skills format)'], ['prompt templates', 'reusable Markdown prompts, run with /name'], ['themes', 'how the terminal looks']].forEach(([n, d], i) => { const y = 310 + i * 102;
    s.box(900, y, 910, 82, { c: 'teal', fill: 'white', sw: 2.6 }); s.h(926, y + 54, n, { fs: 30 }); s.m(1210, y + 51, d, { fs: 20 }); });
  s.box(900, 730, 910, 108, { c: 'red', dash: true, sw: 2.8 });
  s.m(930, 774, ['NOT in the core: permissions · sub-agents · plan mode', 'add them as extensions, or ask Pi to build them for you'], { c: 'red', fs: 22, lh: 36 });
  s.callout('a harness that exposes its own events can be improved by the agent it runs', { w: 1320, fs: 34 });
});

diagram('hermes-loop', { title: 'Hermes: the learning loop', sub: 'Memory here is not a file you maintain. It is a process the harness runs.', section: SH }, s => {
  const B = [[590, 262, 'blue', 'do a task', ''], [1010, 420, 'green', 'write a skill', 'after hard or novel work'], [850, 680, 'teal', 'skill on the shelf', 'one line in context'], [330, 680, 'violet', 'use it next time', 'body loads on demand'], [170, 420, 'orange', 'refine it in use', 'edit it, not just re-read']];
  B.forEach(([x, y, c, t, d]) => s.box(x, y, 320, 108, { c, fill: c, label: t, sub: d || undefined, fs: 33, sfs: 20 }));
  s.arrow(916, 316, 1130, 412, { bend: -36 });
  s.arrow(1190, 536, 1110, 672, { bend: -30 });
  s.arrow(842, 734, 658, 734, { bend: -30 });
  s.arrow(400, 672, 320, 536, { bend: -30 });
  s.arrow(370, 412, 584, 316, { bend: -36 });
  s.text(750, 510, ['skills that', 'write themselves'], { a: 'middle', fs: 40, w: 700, lh: 50 });
  s.sticky(1420, 246, 390, 170, ['invariant 1', 'the prompt cache', 'is sacred'], { rot: 2, fs: 29 });
  s.sticky(1420, 462, 390, 170, ['invariant 2', 'the core is a', 'narrow waist'], { rot: -2, fs: 29, fill: 'blue', c: 'blue' });
  s.m(1420, 700, ['+ curated memory, with nudges', '+ full-text search over', '  past sessions', '+ cron and a chat gateway'], { fs: 22, lh: 34 });
  s.callout('let the agent turn a hard-won procedure into a skill, then let it fix that skill', { w: 1340, fs: 34 });
});

diagram('dsh-pipeline', { title: 'DeepSeek Harness: every stage is a place to stand', sub: 'A turn is a sequence of named events. Features attach as listeners instead of being wired into the loop.', section: SH }, s => {
  const row1 = [['turn/start', 'g'], ['assemble', 'x'], ['agent/pre-step', 'v'], ['agent/request', 'v'], ['llm/stream', 'v']];
  const row2 = [['tool/call', 'g'], ['tools/pre-execute', 'v'], ['tools/execute', 'v'], ['tools/post-execute', 'v'], ['tool/result', 'g']];
  const col = k => k === 'g' ? 'green' : k === 'v' ? 'violet' : 'gray';
  row1.forEach(([t, k], i) => { const x = 110 + i * 350; s.box(x, 250, 300, 86, { c: col(k), fill: col(k), label: t, font: 'mono', fs: 24, w: 400 }); if (i) s.arrow(x - 46, 293, x - 6, 293, { head: 14 }); });
  s.arrow(1660, 342, 1660, 462);
  row2.forEach(([t, k], i) => { const x = 1510 - i * 350; s.box(x, 470, 300, 86, { c: col(k), fill: col(k), label: t, font: 'mono', fs: 23, w: 400 }); if (i) s.arrow(x + 346, 513, x + 306, 513, { head: 14 }); });
  s.arrow(260, 562, 260, 682);
  s.box(110, 690, 360, 86, { c: 'violet', fill: 'violet', label: 'agent/turn-stopping', font: 'mono', fs: 23, w: 400 });
  s.arrow(476, 733, 524, 733, { head: 14 });
  s.box(530, 690, 260, 86, { c: 'green', fill: 'green', label: 'turn/end', font: 'mono', fs: 24, w: 400 });
  [[960, 372, 'inject · rewrite · reject'], [1310, 372, 'edit the model request'], [1310, 592, 'permission · policy · guard'], [610, 592, 'observe · add feedback'], [290, 812, 'stop it finishing too early']].forEach(([x, y, t]) => s.m(x, y, t, { a: 'middle', fs: 20, c: 'violet' }));
  let x = 900; x += s.pill(x, 700, 'durable: written to the session log', { c: 'green', fill: 'green', fs: 21 }) + 20;
  s.pill(900, 760, 'live: a plugin can intercept it', { c: 'violet', fill: 'violet', fs: 21 });
  s.m(1420, 790, ['step = one model request', '       + its tools', 'turn = zero or more steps'], { fs: 21, lh: 32, c: 'gray' });
  s.callout('there is no privileged core to patch. you mount a plugin beside the others.', { w: 1300, fs: 34 });
});

diagram('dsh-seam', { title: 'Capability seams: depend on the interface, not the tool', sub: 'Three roles. Swap the provider and the whole execution world moves, while the model sees no change.', section: SH, tfs: 58 }, s => {
  s.chip(110, 420, 250, 116, { sub: 'sees only tools', sfs: 20 });
  s.arrow(384, 420, 470, 330, { bend: -20 });
  s.box(480, 250, 900, 124, { c: 'blue', fill: 'blue', label: 'consumers: the tools the model sees', sub: 'read_file · edit_file · bash · lsp', fs: 34, sfs: 22 });
  s.arrow(930, 380, 930, 446);
  s.box(480, 454, 900, 124, { c: 'violet', fill: 'violet', label: 'service definition: "a filesystem"', sub: 'the interface. there is exactly one.', fs: 34, sfs: 22 });
  [[480, 'green', 'local disk'], [790, 'amber', 'remote sandbox'], [1100, 'teal', 'cloud VM']].forEach(([x, c, t]) => { s.arrow(x + 140, 584, x + 140, 660); s.box(x, 668, 280, 116, { c, fill: c, label: t, sub: 'a provider', fs: 32, sfs: 20 }); });
  s.arrow(620, 800, 930, 800, { bend: 50, c: 'red', both: true, dash: true }); s.m(776, 854, 'swap', { c: 'red', a: 'middle', fs: 22 });
  s.m(1440, 320, ['swap the provider:', 'the whole execution', 'world moves with it.', '', 'the tool surface the', 'model sees does', 'not change at all.'], { c: 'violet', fs: 24, lh: 40 });
  s.callout('a seam is a definition, a provider and a consumer. one alone is not a seam.', { w: 1300, fs: 34 });
});

diagram('provider-layer', { title: 'One narrow door to the model', sub: 'Every harness needs a provider. Keep everything vendor-specific behind a single module.', section: SH }, s => {
  s.box(100, 400, 320, 200, { c: 'teal', fill: 'teal', label: 'your harness', sub: ['neutral messages', 'tools as plain schemas'], fs: 36, sfs: 21 });
  s.arrow(428, 500, 520, 500);
  s.box(530, 270, 440, 460, { fill: 'white' });
  s.h(750, 330, 'provider adapter', { fs: 36, a: 'middle' });
  ['authenticate', 'translate formats', 'retry + back off', 'normalise reply + usage'].forEach((t, i) => s.box(560, 360 + i * 88, 380, 68, { c: 'gray', fill: 'gray', label: t, fs: 27, w: 400, off: 3 }));
  s.arrow(978, 400, 1080, 330, { bend: -16 });
  [[1090, 'Anthropic'], [1340, 'OpenAI'], [1590, 'Google']].forEach(([x, t]) => s.cloud(x, 240, 220, 130, { label: t, fs: 26 }));
  s.m(1450, 420, 'direct APIs', { a: 'middle', fs: 22, c: 'gray' });
  s.arrow(978, 600, 1080, 600);
  s.box(1090, 520, 720, 124, { c: 'violet', fill: 'violet', label: 'a router  (e.g. OpenRouter)', sub: 'one key · many models · fallbacks', fs: 34, sfs: 22 });
  [[1090, 'model A', 'red'], [1340, 'model B', 'green'], [1590, 'model C', 'gray']].forEach(([x, t, c]) => { s.arrow(x + 110, 650, x + 110, 706, { c: 'violet', head: 14 }); s.box(x, 714, 220, 86, { c, fill: c, label: t, fs: 28, w: 400 }); });
  s.m(1200, 838, '503', { c: 'red', fs: 23, a: 'middle' }); s.arrow(1250, 832, 1390, 832, { c: 'green', dash: true }); s.m(1480, 838, 'fallback', { c: 'green', fs: 23, a: 'middle' });
  s.callout('swapping models should change one file. never the loop.', { w: 1060 });
});
