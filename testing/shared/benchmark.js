'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const COLORS = ['#000000', '#0074d9', '#ff4136', '#2ecc40', '#ffdc00', '#aaaaaa', '#f012be', '#ff851b', '#7fdbff', '#870c25'];

  // Numbers: integers, decimals, comma thousands, and simple fractions.
  function numberValue(value) {
    let s = String(value).trim().replace(/−/g, '-');
    if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
    const dec = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
    if (dec.test(s)) return Number(s);
    const p = s.split('/');
    if (p.length === 2 && p.every(x => dec.test(x.trim())) && Number(p[1]) !== 0) return Number(p[0]) / Number(p[1]);
    return null;
  }
  function numericMatch(a, b) {
    const x = numberValue(a), y = numberValue(b);
    return x !== null && y !== null && Math.abs(x - y) <= 1e-12 * Math.max(1, Math.abs(x), Math.abs(y));
  }

  // Markdown with TeX protected from the Markdown parser, then sanitized.
  function format(text) {
    const raw = String(text ?? '');
    if (!window.marked || !window.DOMPurify) return `<p>${esc(raw)}</p>`;
    const math = [];
    const safe = raw.replace(/```[\s\S]*?```|`[^`\n]+`|\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<![\\$])\$(?!\s)(?:[^$\n]*?[^\s$\n])\$(?!\d)/g, t => {
      if (t.startsWith('`')) return t;
      let m = t;
      if (t.startsWith('$$')) m = '\\[' + t.slice(2, -2) + '\\]';
      else if (t.startsWith('$')) m = '\\(' + t.slice(1, -1) + '\\)';
      math.push(esc(m));
      return `MATHTOKEN${math.length - 1}END`;
    });
    const html = marked.parse(safe, {gfm: true}).replace(/MATHTOKEN(\d+)END/g, (_, i) => math[i] || '');
    return DOMPurify.sanitize(html, {USE_PROFILES: {html: true}, FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'iframe'], FORBID_ATTR: ['style']});
  }

  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const label = (c, i) => String(c).match(/^([A-Z])\.\s/)?.[1] || String.fromCharCode(65 + i);
  const choiceText = c => String(c).replace(/^[A-Z]\.\s*/, '');
  const kind = q => q.choices?.length ? 'choice' : q.answer_type === 'grid' ? 'grid' : q.answer_type === 'number' ? 'number' : 'text';
  const auto = q => kind(q) !== 'text';
  const gridHTML = (g, cls = '') => `<div class="grid ${cls}" style="--w:${g[0].length};--h:${g.length}">${g.map((row, y) => row.map((v, x) => `<i style="background:${COLORS[v]}" data-x="${x}" data-y="${y}"></i>`).join('')).join('')}</div>`;
  const STATUS = {correct: 'Correct', incorrect: 'Wrong', skipped: 'Skipped'};

  class Runner {
    constructor(id) { this.id = id; this.key = `benchmarks:v3:${id}`; this.main = $('main'); this.math = Promise.resolve(); this.init(); }

    async init() {
      try {
        const [index, data] = await Promise.all([fetch('/testing/data/index.json?v=20261113'), fetch(`/testing/data/${this.id}.json?v=20261113`)]);
        if (!index.ok || !data.ok) throw new Error('load failed');
        this.meta = (await index.json()).benchmarks.find(b => b.id === this.id);
        this.questions = await data.json();
        this.byId = new Map(this.questions.map(q => [String(q.id), q]));
        this.saved = this.load();
        const q = this.byId.get(new URLSearchParams(location.search).get('q'));
        if (q && this.saved?.ids[this.saved.cursor] === String(q.id)) this.resume();
        else if (q) this.start([q]);
        else this.setup();
      } catch (e) {
        console.error(e);
        this.main.innerHTML = '<h1>Could not load questions</h1><p><button class="btn" onclick="location.reload()">Retry</button></p>';
      }
    }

    load() {
      try {
        const s = JSON.parse(localStorage.getItem(this.key));
        const ok = s && Array.isArray(s.ids) && s.ids.length && s.ids.every(id => this.byId.has(id)) &&
          Number.isInteger(s.cursor) && s.cursor >= 0 && s.cursor <= s.ids.length && s.responses && s.drafts;
        return ok ? s : null;
      } catch (_) { return null; }
    }
    save() {
      try { localStorage.setItem(this.key, JSON.stringify(this.s)); this.saved = this.s; }
      catch (_) { this.note('Progress could not be saved in this browser.'); }
    }
    note(text) { const el = $('note'); if (el) el.textContent = text; }

    render(html) {
      if (window.MathJax?.typesetClear) MathJax.typesetClear([this.main]);
      const m = this.meta;
      this.main.innerHTML = `<h1>${esc(m.title)}</h1><p class="muted">${esc(m.description)} <a href="${m.paper}">About</a> · <a href="${m.dataset}">Data</a></p>${html}<p id="note" class="note" role="status"></p>`;
      this.typeset();
    }

    setup() {
      this.s = null;
      history.replaceState(null, '', location.pathname);
      const subjects = this.meta.subjects.length > 1
        ? `<label>Subject <select id="subject"><option value="all">All</option>${this.meta.subjects.map(s => `<option>${esc(s)}</option>`).join('')}</select></label>` : '';
      const open = this.saved && this.saved.cursor < this.saved.ids.length;
      this.render(`<form id="setup" class="row">${subjects}<label>Questions <select id="length"><option>5</option><option selected>10</option><option>20</option></select></label><button class="btn primary">Start</button>${open ? `<button type="button" class="btn" id="resume">Resume (${this.saved.cursor + 1} of ${this.saved.ids.length})</button>` : ''}</form>`);
      $('setup').onsubmit = e => {
        e.preventDefault();
        const subject = $('subject')?.value || 'all';
        const pool = this.questions.filter(q => subject === 'all' || q.category === subject);
        this.start(shuffle(pool).slice(0, Number($('length').value)));
      };
      if (open) $('resume').onclick = () => this.resume();
    }

    start(qs) {
      this.s = {ids: qs.map(q => String(q.id)), cursor: 0, responses: {}, drafts: {}, tries: {}};
      this.save();
      this.show();
    }
    resume() { this.s = this.saved; this.s.tries ||= {}; this.show(); }
    get q() { return this.byId.get(this.s.ids[this.s.cursor]); }

    show() {
      if (this.s.cursor >= this.s.ids.length) return this.results();
      const q = this.q, id = String(q.id), r = this.s.responses[id];
      const url = new URL(location.href); url.searchParams.set('q', id); history.replaceState(null, '', url);
      const body = kind(q) === 'grid' ? this.arcTask(q) : `<div class="prose">${format(q.question)}</div>${this.image(q)}`;
      const action = auto(q) ? 'Check' : 'Show answer';
      this.render(`<p class="meta">${this.s.cursor + 1} / ${this.s.ids.length} · ${this.meta.subjects.length > 1 ? esc(q.category) + ' · ' : ''}<a href="?q=${encodeURIComponent(id)}">${esc(id)}</a> <button class="link" id="exit">Exit</button></p>
        ${body}<form id="answer-form"><fieldset ${r ? 'disabled' : ''}>${this.input(q, r)}</fieldset>
        <p class="row" ${r ? 'hidden' : ''}><button class="btn primary" id="submit">${action}</button><button type="button" class="btn" id="skip">Skip</button></p></form>
        <div id="feedback"></div>`);
      $('exit').onclick = () => this.setup();
      $('answer-form').onsubmit = e => { e.preventDefault(); this.submit(); };
      $('skip').onclick = () => this.record('skipped');
      const box = $('answer');
      if (box?.tagName === 'TEXTAREA') box.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.submit(); } };
      $('answer-form').oninput = () => { this.s.drafts[id] = this.read(q); this.save(); };
      if (kind(q) === 'grid' && !r) this.editor(q);
      if (r) this.feedback(q, r);
    }

    input(q, r) {
      const value = r?.answer ?? this.s.drafts[q.id] ?? '';
      const k = kind(q);
      if (k === 'choice') return q.choices.map((c, i) => {
        const l = label(c, i), mark = r ? (l === q.answer ? 'correct' : l === value ? 'incorrect' : '') : '';
        return `<label class="choice ${mark}"><input type="radio" name="answer" value="${esc(l)}" ${l === value ? 'checked' : ''}><b>${esc(l)}</b><span class="prose">${format(choiceText(c))}</span></label>`;
      }).join('');
      if (k === 'number') return `<input id="answer" class="answer" inputmode="decimal" autocomplete="off" placeholder="Number" value="${esc(value)}">`;
      if (k === 'text') return `<textarea id="answer" class="answer" rows="2" placeholder="Your answer (optional)">${esc(value)}</textarea>`;
      return r ? `<p class="label">Your output</p>${r.answer ? gridHTML(JSON.parse(r.answer)) : '<p class="muted">None</p>'}` : '<div id="editor"></div>';
    }

    arcTask(q) {
      const pair = (a, b, i) => `<div class="pair"><div><p class="label">Example ${i + 1} input</p>${gridHTML(a)}</div><div><p class="label">Output</p>${gridHTML(b)}</div></div>`;
      return `${q.train.map((t, i) => pair(t.input, t.output, i)).join('')}<div class="pair"><div><p class="label">Test input</p>${gridHTML(q.input)}</div></div>`;
    }

    editor(q) {
      let grid = this.s.drafts[q.id] ? JSON.parse(this.s.drafts[q.id]) : q.input.map(r => [...r]);
      let color = 0, painting = false;
      const el = $('editor');
      const sync = () => { this.s.drafts[q.id] = JSON.stringify(grid); this.save(); };
      const draw = () => {
        el.innerHTML = `<p class="label">Your output</p><div class="row tools">
          <label>Size <input id="gw" type="number" min="1" max="30" value="${grid[0].length}"> x <input id="gh" type="number" min="1" max="30" value="${grid.length}"></label>
          <button type="button" class="btn" id="copy">Copy input</button><button type="button" class="btn" id="clear">Clear</button></div>
          <div class="palette">${COLORS.map((c, i) => `<button type="button" aria-label="Color ${i}" data-c="${i}" class="${i === color ? 'on' : ''}" style="background:${c}"></button>`).join('')}</div>
          ${gridHTML(grid, 'edit')}`;
        el.querySelectorAll('.palette button').forEach(b => b.onclick = () => { color = Number(b.dataset.c); draw(); });
        const resize = () => {
          const w = Math.min(30, Math.max(1, Number($('gw').value) || 1)), h = Math.min(30, Math.max(1, Number($('gh').value) || 1));
          grid = Array.from({length: h}, (_, y) => Array.from({length: w}, (_, x) => grid[y]?.[x] ?? 0));
          sync(); draw();
        };
        $('gw').onchange = $('gh').onchange = resize;
        $('copy').onclick = () => { grid = q.input.map(r => [...r]); sync(); draw(); };
        $('clear').onclick = () => { grid = grid.map(r => r.map(() => 0)); sync(); draw(); };
        const g = el.querySelector('.grid');
        const paint = e => {
          const c = document.elementFromPoint(e.clientX, e.clientY);
          if (!c?.dataset.x || !g.contains(c)) return;
          grid[c.dataset.y][c.dataset.x] = color;
          c.style.background = COLORS[color];
        };
        g.onpointerdown = e => { painting = true; g.setPointerCapture(e.pointerId); paint(e); };
        g.onpointermove = e => { if (painting) paint(e); };
        g.onpointerup = g.onpointercancel = () => { if (painting) { painting = false; sync(); } };
      };
      this.readGrid = () => JSON.stringify(grid);
      draw();
    }

    image(q) {
      if (!q.image) return '';
      const src = `/testing/hle/images/${encodeURIComponent(q.image)}`;
      return `<a href="${src}" target="_blank" rel="noopener"><img class="figure" src="${src}" alt="Figure for question ${esc(q.id)}"></a>`;
    }

    read(q) {
      const k = kind(q);
      if (k === 'choice') return document.querySelector('input[name=answer]:checked')?.value || '';
      if (k === 'grid') return this.readGrid();
      return $('answer').value;
    }

    submit() {
      const q = this.q;
      if (this.s.responses[q.id]) return;
      const answer = this.read(q).trim(), k = kind(q);
      if (k === 'text') return this.record(null);
      if (!answer) return this.note(k === 'choice' ? 'Pick an answer.' : 'Enter an answer.');
      if (k === 'number' && numberValue(answer) === null) return this.note('Enter a number.');
      const right = k === 'choice' ? answer === q.answer : k === 'number' ? numericMatch(answer, q.answer) : answer === JSON.stringify(q.answer);
      if (!right && k === 'grid' && !this.s.tries[q.id]) {
        this.s.tries[q.id] = 1; this.save();
        return this.note('Not correct. One attempt left.');
      }
      this.record(right ? 'correct' : 'incorrect');
    }

    record(status) {
      const q = this.q;
      this.s.responses[q.id] = {answer: this.read(q), status, self: status === null};
      this.save();
      this.show();
      $('next')?.focus();
    }

    reference(q) {
      const k = kind(q);
      if (k === 'grid') return gridHTML(q.answer);
      if (k === 'choice') { const i = q.choices.findIndex((c, n) => label(c, n) === q.answer); return `<div class="prose">${format(i < 0 ? q.answer : q.choices[i])}</div>`; }
      if (['aime', 'hmmt'].includes(this.id)) return `<div class="prose">\\(${esc(q.answer)}\\)</div>`;
      return `<div class="prose">${format(q.answer)}</div>`;
    }

    feedback(q, r) {
      const pending = r.status === null;
      const head = pending ? 'Answer' : `${STATUS[r.status]}${r.self ? ' (self-graded)' : ''}`;
      $('feedback').innerHTML = `<div class="feedback ${r.status || ''}"><p class="label">${head}</p>${this.reference(q)}
        ${q.rationale ? `<details><summary>Explanation</summary><div class="prose">${format(q.rationale)}</div></details>` : ''}
        <p class="row">${pending ? '<button class="btn" id="right">I was right</button><button class="btn" id="wrong">I was wrong</button>'
          : `<button class="btn primary" id="next">${this.s.cursor + 1 === this.s.ids.length ? 'Results' : 'Next'}</button>`}</p></div>`;
      if (pending) {
        $('right').onclick = () => { r.status = 'correct'; this.save(); this.show(); $('next').focus(); };
        $('wrong').onclick = () => { r.status = 'incorrect'; this.save(); this.show(); $('next').focus(); };
      } else $('next').onclick = () => { this.s.cursor++; this.save(); this.show(); scrollTo(0, 0); };
    }

    results() {
      history.replaceState(null, '', location.pathname);
      const rs = this.s.ids.map(id => this.s.responses[id]);
      const correct = rs.filter(r => r?.status === 'correct').length;
      const missed = this.s.ids.filter(id => this.s.responses[id]?.status !== 'correct');
      const list = this.s.ids.map(id => {
        const q = this.byId.get(id), r = this.s.responses[id];
        const title = kind(q) === 'grid' ? `Task ${id}` : q.question.replace(/\s+/g, ' ').slice(0, 100);
        return `<li><span class="${r?.status || ''}">${STATUS[r?.status] || 'Unanswered'}</span> <a href="?q=${encodeURIComponent(id)}">${esc(title)}</a></li>`;
      }).join('');
      this.render(`<p class="score">${correct} / ${this.s.ids.length} correct</p>
        <p class="row"><button class="btn primary" id="again">New session</button>${missed.length ? '<button class="btn" id="missed">Retry missed</button>' : ''}</p>
        <ol class="results">${list}</ol>`);
      $('again').onclick = () => this.setup();
      if (missed.length) $('missed').onclick = () => this.start(missed.map(id => this.byId.get(id)));
    }

    typeset() {
      if (!window.MathJax?.startup?.promise) return;
      this.math = this.math.catch(() => {}).then(() => MathJax.startup.promise).then(() => MathJax.typesetPromise([this.main])).catch(() => {});
    }
  }

  window.BenchmarkLab = {numberValue, numericMatch, format};
  const id = document.body.dataset.benchmark;
  if (id) new Runner(id);
})();
