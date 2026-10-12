/* Deep dive · Hermes Agent */
const SHM = 'Hermes Agent';

diagram('hermes-architecture', { title: 'Hermes: one agent, many front doors', sub: 'Every surface creates the same agent class. Platform differences stay at the edge.', section: SHM }, s => {
  [['CLI', 'a terminal'], ['gateway', '20+ chat platforms'], ['ACP', 'editors'], ['batch runner', 'datasets'], ['API server', 'programs']].forEach(([t, d], i) => { const x = 110 + i * 342;
    s.box(x, 236, 310, 88, { c: 'blue', fill: 'blue', label: t, sub: d, fs: 31, sfs: 21 }); s.arrow(x + 155, 330, 500 + i * 230, 398, { sw: 2.6, head: 14 }); });
  s.box(360, 404, 1200, 130, { fill: 'ink', label: 'AIAgent', sub: 'one class · one loop · every surface', fs: 44, sfs: 24 });
  [[110, 'blue', 'prompt builder', 'stable · context · volatile tiers'], [690, 'violet', 'provider resolution', '3 wire formats, 1 internal shape'], [1270, 'orange', 'tool dispatch', 'registry · toolsets · availability checks']].forEach(([x, c, t, d]) => {
    s.box(x, 600, 540, 104, { c, fill: c, label: t, sub: d, fs: 32, sfs: 20 }); s.arrow(x + 270, 540, x + 270, 594, { sw: 2.6, head: 14 }); });
  s.box(110, 760, 820, 100, { c: 'teal', fill: 'teal', label: 'session storage', sub: 'one SQLite file per profile, with full-text search', fs: 32, sfs: 20 });
  s.box(990, 760, 820, 100, { c: 'amber', fill: 'amber', label: 'tool backends', sub: 'terminal x7 · browser · web · MCP', fs: 32, sfs: 20 });
  s.arrow(520, 710, 520, 754, { sw: 2.6, head: 14 }); s.arrow(1400, 710, 1400, 754, { sw: 2.6, head: 14 });
  s.callout('platform differences live in the entry point, never in the agent', { w: 1160, y: 908, h: 80 });
});

diagram('hermes-turn', { title: 'One Hermes turn, step by step', sub: 'The loop from chapter 1, with the real-world steps a production harness adds around it.', section: SHM }, s => {
  const steps = [['append the user message to history', 'blue'], ['build, or reuse, the cached system prompt', 'blue'], ['preflight: compress if already past the threshold', 'blue'], ['convert history to the provider wire format', 'violet'], ['add call-time layers (never stored)', 'violet'], ['apply cache markers (Anthropic routes)', 'violet'], ['make the interruptible API call', 'violet'], ['tool calls? run them, append results, go to 4', 'orange'], ['text? persist, flush memory, return', 'green']];
  steps.forEach(([t, c], i) => { const y = 236 + i * 70; s.box(150, y, 830, 56, { c, fill: c, sw: 2.6, off: 3 }); s.num(150, y + 28, i + 1, c, { d: 46 }); s.m(196, y + 37, t, { fs: 23 }); });
  s.arrow(118, 754, 118, 474, { bend: -52, c: 'orange', sw: 3.2 });
  s.box(1050, 240, 760, 230, { dash: true, sw: 2.6 });
  s.h(1080, 292, 'the call can be interrupted', { fs: 32, c: 'violet' });
  s.m(1080, 338, ['main thread waits for: a response,', 'an interrupt, or a timeout.', 'the HTTP request runs on another thread.'], { fs: 22, lh: 34 });
  s.m(1080, 448, 'interrupted? nothing partial enters history', { fs: 21, c: 'red' });
  s.box(1050, 500, 760, 160, { c: 'orange', fill: 'orange' });
  s.h(1080, 552, 'several tool calls in one reply', { fs: 30, c: 'orange' });
  s.m(1080, 590, ['run together in a thread pool; results go', 'back in the original order. interactive', 'tools force one at a time.'], { fs: 20, lh: 27 });
  s.box(1050, 690, 760, 160, { c: 'green', fill: 'green' });
  s.h(1080, 742, 'an iteration budget', { fs: 30, c: 'green' });
  s.m(1080, 784, ['a hard cap on laps per agent. children get', 'their own. at 100%: stop and summarise.'], { fs: 21, lh: 30 });
  s.callout('inside, every message has one shape, whatever the provider speaks', { w: 1160, y: 908, h: 80 });
});

diagram('hermes-prompt-tiers', { title: 'A prompt built so the cache survives', sub: 'Three ordered tiers are cached. Anything that changes per call rides on the user message instead.', section: SHM }, s => {
  [[236, 'green', 'STABLE', 'identity (SOUL.md) · tool and model guidance'], [366, 'blue', 'CONTEXT', 'project files (AGENTS.md ...) · then worktree-specific lines'], [496, 'amber', 'VOLATILE', 'skills index · memory + profile snapshots · date · cwd']].forEach(([y, c, t, d]) => {
    s.box(110, y, 900, 114, { c, fill: c }); s.h(140, y + 52, t, { c, fs: 34 }); s.m(140, y + 90, d, { fs: 21 }); });
  s.line(110, 630, 1010, 630, { c: 'gray', dash: true, sw: 3 }); s.m(560, 656, 'end of the cached system prompt', { a: 'middle', fs: 20, c: 'gray' });
  s.box(110, 674, 900, 76, { c: 'gray', fill: 'gray', label: 'conversation history  (append-only)', fs: 27, w: 400 });
  s.box(110, 766, 900, 96, { c: 'orange', fill: 'orange' });
  s.h(140, 806, "this turn's user message", { c: 'orange', fs: 29 }); s.m(140, 842, '+ call-time layers: recalled memory, plugin context, gateway hints', { fs: 20 });
  s.vbracket(1040, 240, 610, { c: 'green', sw: 3.4 }); s.text(1066, 300, ['cached on', 'every turn'], { c: 'green', fs: 32, w: 700, lh: 40 });
  s.m(1066, 410, ['4 cache breakpoints:', '1    the system prompt', '2-4  the last three messages', '     (a rolling window)'], { c: 'violet', fs: 22, lh: 34 });
  s.h(1420, 300, 'what breaks it', { c: 'red', fs: 34 });
  s.m(1420, 346, ['editing old messages', 'swapping tools mid-session', 'rebuilding the system prompt', 'switching model or account'], { fs: 22, lh: 36, c: 'red' });
  s.arrow(1050, 814, 1130, 814, { c: 'orange' });
  s.m(1150, 790, ['call-time additions ride on the USER', 'message, so the prefix never changes'], { fs: 22, lh: 34, c: 'orange' });
  s.callout('changes to prompt state wait for the next session, unless you opt in', { w: 1200, y: 908, h: 80 });
});

diagram('hermes-compression', { title: 'Two compressors, four phases', sub: 'The agent folds early with real token counts. The gateway is a later safety net.', section: SHM }, s => {
  s.box(110, 258, 1700, 64, { c: 'ink', r: 8, sw: 3 }); s.box(110, 258, 986, 64, { noStroke: true, fill: 'teal', r: 6, off: 0 });
  s.line(960, 236, 960, 344, { c: 'teal', sw: 4 }); s.m(960, 226, 'agent compressor: 50% (default, in the loop)', { a: 'middle', c: 'teal', fs: 23 });
  s.line(1555, 236, 1555, 344, { c: 'red', sw: 4 }); s.m(1555, 226, 'gateway hygiene: 85%', { a: 'middle', c: 'red', fs: 23 });
  s.m(110, 376, '0', { fs: 20, c: 'gray' }); s.m(1810, 376, 'context limit', { fs: 20, c: 'gray', a: 'end' });
  const ph = [['prune', 'gray', ['old tool results outside', 'the protected tail become', 'a one-line placeholder.', 'no model call.']], ['find boundaries', 'blue', ['protect the first exchange', 'and a token-budget tail.', 'never split a tool call', 'from its result.']], ['summarise', 'amber', ['one auxiliary-model call,', 'with a fixed template: goal,', 'progress, decisions, files,', 'next steps.']], ['assemble', 'green', ['head + summary + tail.', 'orphaned tool pairs are', 'cleaned up. memory was', 'flushed to disk first.']]];
  ph.forEach(([t, c, d], i) => { const x = 110 + i * 435; s.box(x, 430, 395, 290, { c, fill: c }); s.num(x, 430, i + 1, c === 'gray' ? 'ink' : c, { d: 56 });
    s.h(x + 34, 506, t, { fs: 36, c: c === 'gray' ? 'ink' : c }); s.m(x + 34, 560, d, { fs: 21, lh: 36 }); if (i < 3) s.arrow(x + 400, 575, x + 430, 575, { head: 13 }); });
  s.m(110, 776, 'summary budget: about 20% of what is being compressed, with a floor and a ceiling', { fs: 22, c: 'gray' });
  s.m(110, 816, 'the summary model needs a window at least as large as the main one, or the middle is dropped with no summary', { fs: 22, c: 'red' });
  s.callout('the higher gateway threshold is a safety net, not a second opinion', { w: 1160, y: 890, h: 80 });
});

diagram('hermes-memory-stores', { title: 'Three kinds of memory, three prices', sub: 'Small facts stay in the prompt. Procedures load on demand. Everything else is searched.', section: SHM }, s => {
  const cols = [[110, 'amber', 'curated memory', 'paid on every turn'], [700, 'violet', 'skills', 'index always · body on use'], [1290, 'teal', 'session search', 'free until queried']];
  cols.forEach(([x, c, t, price]) => { s.box(x, 236, 520, 510, { c, fill: c }); s.h(x + 32, 296, t, { c, fs: 40 }); s.pill(x + 30, 688, price, { c, fill: 'white', fs: 22 }); });
  s.m(142, 346, 'MEMORY.md', { fs: 22 }); s.bar(142, 356, 456, 28, 0.67, { fill: 'amber', c: 'amber' });
  s.m(142, 428, 'USER.md', { fs: 22 }); s.bar(142, 438, 456, 28, 0.4, { fill: 'amber', c: 'amber' });
  s.m(142, 516, ['about 2,200 + 1,375 characters', 'frozen into the system prompt', 'at session start', 'full? the tool REFUSES and the', 'agent must consolidate'], { fs: 21, lh: 32 });
  s.m(732, 346, ['~/.hermes/skills/', '', 'level 0: name + description', 'level 1: the full SKILL.md', 'level 2: one reference file', '', 'the agent creates, patches', 'and deletes its own'], { fs: 21, lh: 32 });
  s.m(1322, 346, ['every session, in SQLite', '', 'full-text search: no model', 'call, about 20 ms', '', 'returns real messages,', 'not summaries, and can', 'scroll inside a session'], { fs: 21, lh: 32 });
  s.arrow(640, 800, 690, 800, { c: 'gray' }); s.arrow(1230, 800, 1280, 800, { c: 'gray' });
  s.m(370, 808, 'what must always be present', { a: 'middle', fs: 21, c: 'gray' }); s.m(960, 808, 'how to do things', { a: 'middle', fs: 21, c: 'gray' }); s.m(1550, 808, 'everything else', { a: 'middle', fs: 21, c: 'gray' });
  s.callout('memory here is not a file you maintain. it is a process the harness runs.', { w: 1260, y: 892, h: 80, fs: 34 });
});

diagram('hermes-approval', { title: 'Between a command and your machine', sub: 'Three checks in order, then the backend decides how much damage is even possible.', section: SHM }, s => {
  s.box(80, 330, 230, 112, { fill: 'white', label: 'terminal', sub: 'command', fs: 32, sfs: 22 });
  const g = [[390, 'red', 'hardline blocklist', ['rm -rf /  ·  fork bombs', 'mkfs on a live disk', 'NO override, even "yolo"']], [750, 'amber', 'dangerous patterns', ['recursive delete', 'DROP TABLE · curl | sh', 'writes under /etc']], [1110, 'violet', 'approval mode', ['manual: ask you', 'smart: a small model', 'clears the safe ones']]];
  let px = 314; g.forEach(([x, c, t, d], i) => { s.arrow(px, 386, x - 8, 386); s.box(x, 280, 300, 212, { c, fill: c, label: t, sub: d, fs: 30, sfs: 20 }); s.num(x, 280, i + 1, c); px = x + 304; });
  s.arrow(1414, 386, 1474, 386, { c: 'green' });
  s.box(1482, 300, 340, 172, { c: 'green', fill: 'green', label: 'run it', sub: 'on the chosen backend', fs: 40, sfs: 21 });
  s.h(80, 584, 'the backend is the box', { fs: 34 });
  [[80, 'gray', 'local', 'no isolation · patterns checked'], [520, 'blue', 'ssh', 'another machine · patterns checked'], [960, 'teal', 'docker · singularity', 'the container is the boundary'], [1400, 'green', 'modal · daytona · vercel', 'a cloud sandbox is the boundary']].forEach(([x, c, t, d]) => s.box(x, 608, 420, 108, { c, fill: c, label: t, sub: d, fs: 28, sfs: 19 }));
  s.m(80, 772, ['unattended runs (cron, webhooks, one-shot queries) default to DENY on a dangerous command:', 'nobody is there to answer, so the agent has to find another way'], { fs: 22, lh: 34, c: 'red' });
  s.callout('approvals are remembered per session; "always" writes an allowlist entry', { w: 1260, y: 892, h: 80, fs: 34 });
});

diagram('hermes-gateway', { title: 'From a chat message to an agent, and back', sub: 'One long-running process connects the chat platforms to the same agent core the CLI uses.', section: SHM }, s => {
  ['Telegram', 'Discord', 'Slack'].forEach((t, i) => { s.box(80, 250 + i * 96, 230, 76, { c: 'blue', fill: 'blue', label: t, fs: 28, w: 400 }); s.arrow(316, 288 + i * 96, 384, 400, { sw: 2.4, head: 12 }); });
  s.m(195, 568, '... and 20+ more', { a: 'middle', fs: 21, c: 'gray' });
  s.box(390, 300, 220, 200, { c: 'gray', fill: 'gray', label: 'adapters', sub: ['one per', 'platform'], fs: 32, sfs: 21 });
  s.arrow(616, 400, 672, 400);
  s.box(680, 300, 270, 200, { c: 'red', fill: 'red', label: 'authorize', sub: ['allowlists', 'DM pairing code', 'default: deny'], fs: 32, sfs: 20 });
  s.arrow(956, 400, 1012, 400);
  s.box(1020, 300, 330, 200, { c: 'amber', fill: 'amber', label: 'session key', sub: ['agent:main:telegram', ':private:1234'], fs: 32, sfs: 20 });
  s.arrow(1356, 400, 1412, 400);
  s.box(1420, 300, 400, 200, { fill: 'ink', label: 'AIAgent', sub: "loaded with that chat's history", fs: 38, sfs: 20 });
  s.arrow(1620, 508, 322, 492, { bend: -120, c: 'green', dash: true, sw: 3 });
  s.m(930, 648, 'the reply is delivered through the same adapter', { a: 'middle', c: 'green', fs: 22 });
  s.box(80, 690, 840, 170, { c: 'blue', fill: 'blue' }); s.h(112, 742, 'while the agent is busy', { c: 'blue', fs: 32 });
  s.m(112, 784, ['a new message is queued and raises an interrupt', '/stop  /approve  /deny  /status  are handled at once'], { fs: 21, lh: 32 });
  s.box(980, 690, 840, 170, { c: 'violet', fill: 'violet' }); s.h(1012, 742, 'cron runs in the same process', { c: 'violet', fs: 32 });
  s.m(1012, 784, ["each tick: a FRESH agent, the job's skills injected,", 'the prompt run, the result delivered to a chat'], { fs: 21, lh: 32 });
  s.callout('unknown sender? the bot replies with a pairing code. the owner approves it from the CLI.', { w: 1440, y: 900, h: 80, fs: 33 });
});

diagram('hermes-execute-code', { title: 'A script instead of ten turns', sub: 'Programmatic tool calling: the agent writes code that calls tools, and only the printed result returns.', section: SHM }, s => {
  s.h(110, 280, 'the usual way', { c: 'red', fs: 40 });
  [['call  web_search', 'violet'], ['result: 4,000 tokens', 'orange'], ['call  web_extract', 'violet'], ['result: 9,000 tokens', 'orange'], ['call  web_extract', 'violet'], ['result: 7,500 tokens', 'orange'], ['call  web_extract', 'violet'], ['result: 11,000 tokens', 'orange']].forEach(([t, c], i) => { s.box(110, 304 + i * 56, 560, 44, { c, fill: c, sw: 2.4, off: 2, r: 8 }); s.m(136, 334 + i * 56, t, { fs: 21 }); });
  s.m(110, 794, ['every intermediate result lands in', 'the window, and is paid for again each turn'], { c: 'red', fs: 22, lh: 32 });
  s.text(830, 520, 'vs', { fs: 48, w: 700, a: 'middle', c: 'gray' });
  s.h(990, 280, 'execute_code: one turn', { c: 'green', fs: 40 });
  s.box(990, 304, 820, 290, { fill: 'ink' });
  s.m(1018, 354, ['from hermes_tools import web_search, web_extract', 'hits = web_search("python 3.13", limit=5)', 'for h in hits["data"]["web"]:', '    page = web_extract([h["url"]])', '    ...filter, keep what matters...', 'print(summary)'], { c: '#8ce99a', fs: 22, lh: 42, free: true });
  s.arrow(1400, 602, 1400, 646, { c: 'green', sw: 3.4 });
  s.box(990, 654, 820, 84, { c: 'green', fill: 'green', label: 'only print() comes back to the model', fs: 31 });
  s.m(990, 794, ['tool calls travel over a local socket to Hermes;', 'their results never enter the context'], { c: 'gray', fs: 22, lh: 32 });
  s.callout('worth it when there are three or more tool calls with logic between them', { w: 1260, y: 892, h: 80, fs: 34 });
});
