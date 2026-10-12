/* Chapter 5 · Memory and skills */
const S5 = '5 · Memory and skills';

diagram('instruction-scopes', { title: 'Instructions load in layers, broadest first', sub: 'More specific files are placed later in the prompt, so they take precedence.', section: S5 }, s => {
  const rows = [
    ['organisation', 'gray', '/etc/claude-code/CLAUDE.md', 'company-wide policy, managed centrally'],
    ['user', 'blue', '~/.claude/CLAUDE.md', 'your preferences, in every project'],
    ['project', 'green', './AGENTS.md   or   ./CLAUDE.md', 'how this repository works. committed to git'],
    ['local', 'amber', './CLAUDE.local.md', 'your private notes here. gitignored'],
    ['directory', 'violet', './billing/AGENTS.md', 'loaded ONLY when the agent works in billing/'],
  ];
  rows.forEach(([name, c, path, why], i) => { const x = 110 + i * 92, y = 240 + i * 118;
    s.box(x, y, 1010, 98, { c, fill: c, dash: i === 4 });
    s.h(x + 28, y + 62, name, { c, fs: 35 }); s.m(x + 268, y + 44, path, { fs: 23 }); s.m(x + 268, y + 78, why, { fs: 20, c: 'gray' }); });
  s.arrow(1640, 262, 1640, 800, { c: 'red', sw: 3.8 });
  s.text(1672, 470, ['loaded later', '= more specific', '= wins'], { c: 'red', fs: 32, lh: 46, w: 700 });
  s.m(1500, 846, 'costs nothing until needed', { c: 'violet', fs: 22, a: 'middle' });
  s.callout('instructions are files. not reminders typed into a chat box.', { w: 1120 });
});

diagram('map-not-manual', { title: 'Give the agent a map, not a manual', sub: 'A short entry file that points at detail, which is loaded only when the work needs it.', section: S5 }, s => {
  s.box(110, 256, 440, 540, { fill: 'ink', r: 16 });
  s.m(150, 328, 'AGENTS.md', { c: 'white', fs: 40 });
  s.text(150, 404, ['about 100 lines', 'what this repo is', 'how to build + test', 'hard rules, with reasons', 'where to read more'], { c: '#e9ecef', fs: 31, lh: 62 });
  const files = [['docs/architecture.md', 'how the pieces fit together', 'teal'], ['docs/testing.md', 'what "verified" means here', 'amber'], ['skills/release/SKILL.md', 'a procedure, loaded on demand', 'violet'], ['PROGRESS.md', 'where the last session stopped', 'green']];
  files.forEach(([name, why, c], i) => { const y = 250 + i * 140; s.box(960, y, 560, 108, { c, fill: c, label: name, font: 'mono', fs: 26, w: 400, sub: why, sfs: 21 });
    s.arrow(560, 520, 950, y + 54, { bend: (i - 1.5) * -26, sw: 2.8 }); });
  s.m(700, 300, 'points to', { fs: 24, c: 'gray' });
  s.m(1570, 300, ['always-loaded', 'text is paid for', 'on EVERY turn.'], { c: 'red', fs: 24, lh: 38 });
  s.m(1570, 520, ['text on disk', 'costs nothing', 'until it is read.'], { c: 'green', fs: 24, lh: 38 });
  s.sticky(1560, 680, 280, 120, ['would a newcomer', 'find this in the code?'], { fs: 24, rot: 3 });
  s.callout('keep the entry file short. let the detail wait on disk.', { w: 1040 });
});

diagram('skill-iceberg', { title: 'A skill is an iceberg', sub: 'Only the tip is always in context. The rest loads when the task calls for it.', section: S5 }, s => {
  let wave = 'M110 474'; for (let i = 0; i < 21; i++) wave += ` q20 ${i % 2 ? 14 : -14} 40 0 q20 ${i % 2 ? -14 : 14} 40 0`;
  s.poly([[858, 474], [800, 560], [816, 690], [900, 816], [1020, 846], [1124, 780], [1184, 640], [1092, 474]], { c: 'blue', fill: 'blue' });
  s.poly([[858, 474], [924, 344], [982, 264], [1042, 352], [1092, 474]], { c: 'blue', fill: 'white' });
  s.path(wave, { c: 'teal', sw: 4, rough: 0.8 });
  s.h(110, 300, 'always loaded', { c: 'green', fs: 38 });
  s.m(110, 346, ['name: release', 'description: Cut a release. Use when', '  asked to tag, publish or bump.'], { fs: 21, lh: 32 });
  s.arrow(640, 376, 900, 396, { c: 'green', bend: -20 });
  s.h(110, 576, 'loaded when it matches', { c: 'blue', fs: 38 });
  s.m(110, 622, 'the body of SKILL.md: the actual steps', { fs: 21 });
  s.arrow(640, 610, 808, 610, { c: 'blue' });
  s.h(110, 742, 'loaded only if followed', { c: 'violet', fs: 38 });
  s.m(110, 788, 'scripts/bump_version.py · checklist.md', { fs: 21 });
  s.arrow(650, 776, 880, 776, { c: 'violet' });
  s.m(1250, 420, 'about 30 tokens each', { c: 'green', fs: 24 });
  s.m(1250, 616, ['500 to 2,000 tokens,', 'once, when needed'], { c: 'blue', fs: 24, lh: 36 });
  s.m(1250, 770, ['scripts are RUN,', 'not read: zero tokens'], { c: 'violet', fs: 24, lh: 36 });
  s.sticky(1470, 238, 340, 104, ['100 skills = 100 short lines'], { rot: 2.5, fs: 25 });
  s.callout('the description is the trigger. say WHEN to use it, not just what it is.', { w: 1240, fs: 34 });
});

diagram('knowledge-ladder', { title: 'Where should this piece of knowledge live?', sub: 'Reach for the cheapest rung that works. Most teams put far too much on the top two.', section: S5 }, s => {
  const rows = [
    ['system prompt', 'true for every task, in every project', 1, 'red', 'paid on every turn, forever'],
    ['project memory file', 'true for every task in this repo', 0.8, 'orange', 'paid on every turn, in this repo'],
    ['directory memory file', 'true in one part of the repo', 0.42, 'amber', 'paid only while working there'],
    ['a skill', 'a procedure needed now and then', 0.1, 'green', 'one line always; the rest on use'],
    ['a doc the map points to', 'reference detail', 0.02, 'teal', 'free until someone reads it'],
    ['a tool, or search', 'must be fresh, or far too big to load', 0.14, 'violet', 'schema always; the result on use'],
  ];
  rows.forEach(([where, when, frac, c, cost], i) => { const y = 242 + i * 104;
    s.box(110, y, 440, 84, { c, fill: c, label: where, fs: 30 });
    s.m(580, y + 52, when, { fs: 22 });
    s.m(1190, y + 26, cost, { fs: 20, c });
    s.bar(1190, y + 40, 600, 34, frac, { fill: c, c }); });
  s.arrow(70, 262, 70, 840, { c: 'gray', sw: 3 });
  s.text(52, 640, 'cheaper', { rot: -90, c: 'gray', fs: 26 });
  s.callout('every always-loaded line must earn its place', { w: 900 });
});
