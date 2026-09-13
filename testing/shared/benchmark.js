'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const count = n => n.toLocaleString();
  const keyFor = id => `benchmark-lab:v2:${id}`;

  // Compare numeric values without discarding minus signs or decimal points.
  function numberValue(value) {
    let s = String(value).trim().replace(/\u2212/g, '-');
    if (/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g,'');
    const decimal = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
    if (decimal.test(s)) { const n = Number(s); return Number.isFinite(n) ? n : null; }
    const parts = s.split('/');
    if (parts.length === 2 && parts.every(p => decimal.test(p.trim()))) {
      const numerator = Number(parts[0]), denominator = Number(parts[1]);
      const n = numerator / denominator;
      return denominator !== 0 && Number.isFinite(n) ? n : null;
    }
    return null;
  }
  function numericMatch(a,b) {
    const x=numberValue(a), y=numberValue(b);
    return x !== null && y !== null && Math.abs(x-y) <= 1e-12 * Math.max(1,Math.abs(x),Math.abs(y));
  }
  function format(text, numeric = false) {
    const raw = String(text ?? '');
    if (!window.marked || !window.DOMPurify) return `<div class="raw">${escape(raw)}</div>`;
    const tokens=[];
    // Protect code and TeX before Markdown handles backslashes and underscores.
    const protectedText = raw.replace(/```[\s\S]*?```|`[^`\n]+`|\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<![\\$])\$(?!\s)(?:[^$\n]*?[^\s$\n])\$(?!\d)/g, token => {
      if (token.startsWith('`') || (numeric && token.startsWith('$') && !token.startsWith('$$'))) return token;
      let math = token;
      if (token.startsWith('$$')) math = '\\['+token.slice(2,-2)+'\\]';
      else if (token.startsWith('$')) math = '\\('+token.slice(1,-1)+'\\)';
      tokens.push(escape(math));
      return `BENCHMATHPLACEHOLDER${tokens.length-1}END`;
    });
    let html = marked.parse(protectedText,{breaks:false,gfm:true});
    html = html.replace(/BENCHMATHPLACEHOLDER(\d+)END/g, (_,i)=>tokens[Number(i)] || '');
    return DOMPurify.sanitize(html,{USE_PROFILES:{html:true},FORBID_TAGS:['style','form','input','button','textarea','iframe'],FORBID_ATTR:['style']});
  }
  function shuffle(items) {
    const result=[...items];
    for (let i=result.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
    return result;
  }
  function choiceLabel(choice,index) { return String(choice).match(/^([A-Z])\.\s/)?.[1] || String.fromCharCode(65+index); }
  function choiceText(choice) { return String(choice).replace(/^[A-Z]\.\s*/,''); }
  function isChoice(q) { return Array.isArray(q.choices) && q.choices.length > 0; }
  function statusText(r) {
    if (!r) return 'Not answered';
    const text={correct:'Correct',incorrect:'Incorrect',revealed:'Revealed',skipped:'Skipped'}[r.status] || 'Not answered';
    return r.self ? `${text} (self-reviewed)` : text;
  }

  class Practice {
    constructor(id) { this.id=id; this.main=$('main'); this.session=null; this.storageAvailable=true; this.mathQueue=Promise.resolve(); this.init(); }
    async init() {
      try {
        const [catalogResponse,dataResponse]=await Promise.all([fetch('/testing/data/index.json?v=20260913b'),fetch(`/testing/data/${this.id}.json?v=20260913b`)]);
        if (!catalogResponse.ok || !dataResponse.ok) throw new Error('Data unavailable');
        const catalog=await catalogResponse.json();
        this.meta=catalog.benchmarks.find(b=>b.id===this.id);
        this.questions=await dataResponse.json();
        if (!this.meta || !Array.isArray(this.questions) || !this.questions.length) throw new Error('Empty question set');
        this.byId=new Map(this.questions.map(q=>[String(q.id),q]));
        this.saved=this.readSaved();
        document.addEventListener('keydown',e=>this.keyboard(e));
        const requested=new URLSearchParams(location.search).get('q');
        if (requested) {
          const q=this.byId.get(requested);
          if (q) {
            if (this.saved?.ids[this.saved.cursor]===requested) { this.session=this.saved; this.renderQuestion(); }
            else { this.showSetup(); this.showLookupNotice(requested); }
          } else { this.showSetup(); this.notice('That question ID was not found. Check the link or start a session.'); }
        } else this.showSetup();
      } catch (error) {
        console.error(error);
        this.main.innerHTML='<section class="runner-intro"><h1>Questions could not load</h1><p>Check your connection and try again.</p></section><button id="reload" class="btn primary">Try again</button> <a href="/testing/">All benchmarks</a>';
        $('reload').onclick=()=>location.reload();
      }
    }
    readSaved() {
      try {
        const raw=localStorage.getItem(keyFor(this.id));
        if (!raw) return null;
        const s=JSON.parse(raw);
        if (s.version !== 2 || !Array.isArray(s.ids) || !s.ids.length || s.ids.length>20 || !s.ids.every(id=>this.byId.has(id)) || new Set(s.ids).size!==s.ids.length || !Number.isInteger(s.cursor) || s.cursor<0 || s.cursor>s.ids.length || !s.responses || typeof s.responses!=='object' || !s.drafts || typeof s.drafts!=='object') return null;
        for (const [id,r] of Object.entries(s.responses)) {
          if (!s.ids.includes(id) || !['correct','incorrect','revealed','skipped'].includes(r?.status) || typeof r.answer!=='string') return null;
        }
        return s;
      } catch (_) { return null; }
    }
    save() {
      if (!this.session) return;
      try { localStorage.setItem(keyFor(this.id),JSON.stringify(this.session)); this.saved=this.session; }
      catch (_) { this.storageAvailable=false; this.notice('This browser could not save progress. You can continue here, but your place may be lost when you leave.'); }
    }
    notice(message) { const el=$('notice'); if (el) el.textContent=message; }
    intro() {
      return `<section class="runner-intro"><p class="eyebrow">${escape(this.meta.category)} / ${count(this.questions.length)} questions</p><h1>${escape(this.meta.title)}</h1><p>${escape(this.meta.description)}</p><div class="source-links"><a href="${this.meta.project}">Benchmark project</a><a href="${this.meta.dataset}">Dataset</a><a href="/testing/sources.html">Scoring notes</a></div></section>`;
    }
    clearMath() { if (window.MathJax?.typesetClear) MathJax.typesetClear([this.main]); }
    replace(html) { this.clearMath(); this.main.innerHTML=html; }
    showSetup() {
      this.session=null;
      this.replace(this.intro()+`<section class="setup"><h2>Set up a session</h2><form id="setup-form"><div class="setup-fields"><div class="field"><label for="category">Subject</label><select id="category"><option value="all">All subjects</option>${this.meta.subjects.map(s=>`<option value="${escape(s)}">${escape(s)}</option>`).join('')}</select></div><div class="field"><label for="split">Question set</label><select id="split">${this.id==='gsm8k'?'<option value="test">Test split</option><option value="train">Training split</option><option value="all">Both splits</option>':'<option value="all">Bundled set</option>'}</select></div><div class="field"><label for="length">Questions</label><select id="length"><option value="5">5 questions</option><option value="10" selected>10 questions</option><option value="20">20 questions</option></select></div></div><p id="pool-count" class="setup-note"></p><div class="setup-actions"><button class="btn primary" id="start" type="submit">Start session</button>${this.saved ? `<button class="btn" id="resume" type="button">${this.saved.cursor>=this.saved.ids.length?'View saved results':'Resume saved session'}</button>` : ''}</div></form><p class="setup-note">${escape(this.meta.note)}</p><p class="setup-note">${escape(this.meta.split)}. Questions are shuffled without repeats within each session.${this.saved?' Starting a session replaces the saved session for this benchmark.':''}</p><details class="lookup"><summary>Open a question by ID</summary><form id="lookup-form"><div class="field"><label for="question-id">Question ID</label><input id="question-id" placeholder="Paste an ID from a question link" required></div><button class="btn" type="submit">Open question</button></form></details></section><p class="notice" id="notice" role="status"></p><footer class="site-footer"><a href="/testing/">All benchmarks</a><span>Progress is saved in this browser.</span></footer>`);
      const update=()=>{const n=this.pool().length; $('pool-count').textContent=`${count(n)} questions available. This session uses ${Math.min(n,Number($('length').value))}.`; $('start').disabled=n===0;};
      ['category','split','length'].forEach(id=>$(id).onchange=update);update();
      $('setup-form').onsubmit=e=>{e.preventDefault();this.start(shuffle(this.pool()).slice(0,Number($('length').value)));};
      if ($('resume')) $('resume').onclick=()=>{this.session=this.saved;this.session.cursor>=this.session.ids.length?this.showResults():this.renderQuestion();};
      $('lookup-form').onsubmit=e=>{e.preventDefault();const q=this.byId.get($('question-id').value.trim());q?this.start([q]):this.notice('No question has that ID. Copy the full ID from its link.');};
    }
    pool() {
      return this.questions.filter(q=>($('category').value==='all'||q.category===$('category').value)&&($('split').value==='all'||q.source===`GSM8K-${$('split').value}`));
    }
    showLookupNotice(id) {
      const details=document.querySelector('.lookup');details.open=true;$('question-id').value=id;
      this.notice('This link points to one question. Select Open question to practice it. Your saved session is replaced when you open it.');
    }
    start(questions) {
      if (!questions.length) return;
      this.session={version:2,ids:questions.map(q=>String(q.id)),cursor:0,responses:{},drafts:{},started:Date.now()};
      this.save();this.renderQuestion();
    }
    current() { return this.byId.get(this.session.ids[this.session.cursor]); }
    auto(q) { return isChoice(q)||this.meta.grading==='numeric'; }
    renderQuestion() {
      if (this.session.cursor>=this.session.ids.length) return this.showResults();
      const q=this.current(), id=String(q.id), r=this.session.responses[id], draft=this.session.drafts[id]||{};
      const selected=r?.answer??draft.answer??'';
      this.replace(this.intro()+`<div class="session-header"><span class="mono">Question ${this.session.cursor+1} of ${this.session.ids.length}</span><button class="btn subtle" id="pause">Save and exit</button></div><progress class="progress" value="${this.session.cursor}" max="${this.session.ids.length}" aria-label="Session progress"></progress><article class="question-card"><div class="question-meta"><span>${escape(q.category)} · ${escape(q.source)}</span><a id="question-link" href="?q=${encodeURIComponent(id)}" title="Link to this question">${escape(id)}</a></div><div class="question-text prose" id="question-text">${q.answer_type==='code'?`<pre class="code"><code>${escape(q.question)}</code></pre>`:format(q.question,this.id==='gsm8k')}</div>${this.image(q)}<form id="answer-form"><fieldset class="answers" ${r?'disabled':''}><legend>${isChoice(q)?'Choose one answer':q.answer_type==='code'?'Your Python solution':'Your answer'}</legend>${this.answerInput(q,selected,r)}</fieldset><details class="scratch"><summary>Scratch notes</summary><label for="notes" class="field-label">Private notes for this question</label><textarea id="notes" placeholder="Work through the problem here.">${escape(draft.notes||'')}</textarea></details><div class="question-actions" ${r?'hidden':''}><button id="submit" class="btn primary" type="submit" ${selected.trim()?'':'disabled'}>${this.auto(q)?'Check answer':'Review answer'}</button><button id="reveal" class="btn" type="button">${this.auto(q)?'Reveal answer':'Reveal reference'}</button><button id="skip" class="btn subtle" type="button">Skip</button></div></form><div id="feedback" ${r?'':'hidden'}></div><details class="scratch"><summary>Original question text</summary><pre class="raw">${escape(q.question)}</pre></details></article><p class="shortcuts">${isChoice(q)?'Use the arrow keys to move between choices. ':''}${isChoice(q)?'Press Enter to submit your choice.':q.answer_type==='code'?'Use Review answer to compare your code with the reference.':'Press Enter in the answer field to submit. Use Shift+Enter for a line break.'}</p><p id="notice" class="notice" role="status"></p>`);
      const url=new URL(location.href);url.searchParams.set('q',id);history.replaceState(null,'',url);
      $('pause').onclick=()=>{this.save();history.replaceState(null,'',location.pathname);this.showSetup();};
      $('answer-form').onsubmit=e=>{e.preventDefault();this.submit();};
      if ($('answer') && q.answer_type !== 'code') $('answer').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();this.submit();}};
      $('answer-form').oninput=()=>{
        const answer=this.readAnswer(q);
        this.session.drafts[id]={answer,notes:$('notes').value};this.save();
        $('submit').disabled=!answer.trim();
      };
      if ($('reveal')) $('reveal').onclick=()=>this.record('revealed');
      if ($('skip')) $('skip').onclick=()=>{this.record('skipped');this.next();};
      if (r) this.feedback(q,r);
      this.typeset();
      if (!this.storageAvailable) this.notice('Progress could not be saved in this browser.');
    }
    answerInput(q,selected,r) {
      if (isChoice(q)) return `<div class="choices">${q.choices.map((c,i)=>{
        const letter=choiceLabel(c,i),correct=r&&letter===q.answer,wrong=r&&selected===letter&&letter!==q.answer;
        return `<label class="choice ${correct?'correct':wrong?'incorrect':''}"><input type="radio" name="answer" value="${escape(letter)}" ${selected===letter?'checked':''}><span class="choice-letter">${escape(letter)}</span><span class="choice-content prose">${format(choiceText(c))}${r&&(correct||wrong)?`<span class="choice-status">${correct?'Answer key':'Your choice'}</span>`:''}</span></label>`;
      }).join('')}</div>`;
      if (q.answer_type==='code') return `<label class="field-label" for="answer">Complete the function. Code is not executed here.</label><textarea id="answer" name="answer" class="answer-text code-input" spellcheck="false" autocomplete="off">${escape(selected||q.question)}</textarea>`;
      return `<label class="field-label" for="answer">${this.auto(q)?'Enter the final number, without units.':'Write an answer, then compare with the reference.'}</label><textarea id="answer" name="answer" class="answer-text" rows="${this.auto(q)?2:4}" autocomplete="off">${escape(selected)}</textarea>`;
    }
    image(q) {
      if (!q.image) return '';
      const path=this.id==='hle'?`/testing/hle/images/${encodeURIComponent(q.image)}`:`/testing/data/images/${encodeURIComponent(q.image)}`;
      return `<figure class="question-image"><a href="${path}" target="_blank" rel="noopener"><img src="${path}" alt="Figure supplied with question ${escape(q.id)}" loading="eager"></a><figcaption>Question figure. Open the image to inspect it at full size.</figcaption></figure>`;
    }
    readAnswer(q) { return isChoice(q)?(document.querySelector('input[name=answer]:checked')?.value||''):($('answer')?.value||''); }
    submit() {
      if (!this.session) return;
      const q=this.current();if (this.session.responses[q.id]) return;
      const answer=this.readAnswer(q).trim();if (!answer) return;
      if (!this.auto(q)) return this.record('revealed');
      if (!isChoice(q)&&numberValue(answer)===null) {this.notice('Enter a number, decimal, or fraction without units. You can also reveal the answer.');return;}
      this.record((isChoice(q)?answer===q.answer:numericMatch(answer,q.answer))?'correct':'incorrect');
    }
    record(status) {
      const q=this.current();if (this.session.responses[q.id]) return;
      this.session.responses[q.id]={answer:this.readAnswer(q),status,self:false};
      this.save();this.renderQuestion();
      $('feedback')?.focus();
    }
    reference(q) {
      if (isChoice(q)) {const i=q.choices.findIndex((c,n)=>choiceLabel(c,n)===q.answer);return `<div class="prose">${format(i<0?q.answer:q.choices[i])}</div>`;}
      if (q.answer_type==='code') return `<pre class="code"><code>${escape(q.question+q.answer)}</code></pre>`;
      if (this.id==='truthfulqa') return `<ul>${q.answer.split(';').map(a=>`<li>${escape(a.trim())}</li>`).join('')}</ul>`;
      return `<div class="prose">${format(q.answer,this.id==='gsm8k')}</div>`;
    }
    feedback(q,r) {
      const manual=!this.auto(q);
      let explanation=q.rationale||q.full_solution||'';
      if (this.id==='gsm8k') explanation=explanation.replace(/<<([^<>]*)>>/g,'$1').replace(/\n####[^\n]*$/,'');
      $('feedback').hidden=false;$('feedback').className='feedback';$('feedback').tabIndex=-1;
      $('feedback').innerHTML=`<h2 class="${r.status==='correct'?'good':r.status==='incorrect'?'bad':''}">${manual&&!r.self?'Compare your answer':statusText(r)}</h2><p class="muted small">${manual?'Assess your solution against the reference. This is recorded as self-review.':r.status==='revealed'?'Revealed answers do not count toward automatic accuracy.':r.status==='correct'?'Your answer matches the key.':'Review the answer and any supplied explanation before continuing.'}</p><div class="reference"><h3>${q.answer_type==='code'?'Reference implementation':'Reference answer'}</h3>${this.reference(q)}</div>${explanation?`<details open><summary>Source explanation</summary><div class="prose">${format(explanation,this.id==='gsm8k')}</div>${q.author_name?`<p class="small muted">Question author: ${escape(q.author_name)}</p>`:''}</details>`:''}${q.test_cases?`<details><summary>Reference tests</summary><pre class="code"><code>${escape(q.test_cases)}</code></pre></details>`:''}<div class="question-actions">${manual&&!r.self?'<button class="btn" id="self-correct">I got it right</button><button class="btn" id="self-incorrect">I got it wrong</button>':''}<button class="btn primary" id="next">${this.session.cursor+1===this.session.ids.length?'View results':'Next question'}</button></div>`;
      if ($('self-correct')) {
        ['correct','incorrect'].forEach(status=>$('self-'+status).onclick=()=>{r.status=status;r.self=true;this.save();this.feedback(q,r);this.typeset();$('next').focus();});
      }
      $('next').onclick=()=>this.next();
    }
    next() {this.session.cursor++;this.save();this.renderQuestion();this.main.scrollIntoView({block:'start'});}
    showResults() {
      this.clearMath();
      const rs=Object.values(this.session.responses), graded=rs.filter(r=>!r.self&&['correct','incorrect'].includes(r.status));
      const correct=graded.filter(r=>r.status==='correct').length, reviewed=rs.filter(r=>r.self), selfRight=reviewed.filter(r=>r.status==='correct').length;
      const omitted=rs.filter(r=>['skipped','revealed'].includes(r.status)).length;
      this.replace(this.intro()+`<section class="setup"><p class="eyebrow">Session complete</p><h2>Your practice results</h2><dl class="result-metrics"><div><dt>Automatic accuracy</dt><dd>${graded.length?Math.round(correct/graded.length*100)+'%':'N/A'}</dd><span class="small muted">${correct} of ${graded.length} graded</span></div><div><dt>Self-reviewed</dt><dd>${selfRight} / ${reviewed.length}</dd><span class="small muted">Marked correct</span></div><div><dt>Skipped or revealed</dt><dd>${omitted}</dd><span class="small muted">Not graded</span></div></dl><p class="small muted">Results cover this session only. Self-reviewed, skipped, and revealed answers are excluded from automatic accuracy.</p><div class="setup-actions"><button class="btn primary" id="again">Set up another session</button>${rs.some(r=>r.status==='incorrect')?'<button class="btn" id="missed">Retry missed questions</button>':''}<button class="btn subtle" id="download">Download results</button><button class="btn subtle" id="clear">Clear saved session</button></div></section><section class="method"><h2>Review your questions</h2><ol class="review-list">${this.session.ids.map((id,i)=>{
        const q=this.byId.get(id),r=this.session.responses[id];
        return `<li><details><summary><span class="mono muted">${i+1}</span><span class="review-title">${escape(q.question.slice(0,125))}${q.question.length>125?'...':''}</span><span class="small ${r?.status==='correct'?'good':r?.status==='incorrect'?'bad':''}">${statusText(r)}</span></summary><div class="review-body"><div class="prose">${q.answer_type==='code'?`<pre class="code">${escape(q.question)}</pre>`:format(q.question,this.id==='gsm8k')}</div>${this.image(q)}<p>Your answer: <span class="raw">${escape(r?.answer||'No answer')}</span></p><h3>Reference answer</h3>${this.reference(q)}<p><a href="?q=${encodeURIComponent(id)}">Open question ${escape(id)}</a></p></div></details></li>`;
      }).join('')}</ol></section><p id="notice" class="notice" role="status"></p>`);
      const url=new URL(location.href);url.search='';history.replaceState(null,'',url);
      $('again').onclick=()=>this.showSetup();
      if ($('missed')) $('missed').onclick=()=>this.start(shuffle(this.session.ids.filter(id=>this.session.responses[id]?.status==='incorrect').map(id=>this.byId.get(id))));
      $('download').onclick=()=>{
        const blob=new Blob([JSON.stringify({benchmark:this.id,scope:'Practice session, not an official benchmark score',...this.session},null,2)],{type:'application/json'});
        const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`${this.id}-practice.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      };
      $('clear').onclick=()=>{try{localStorage.removeItem(keyFor(this.id));}catch(_){}this.saved=null;this.session=null;this.showSetup();this.notice('Saved session cleared.');};
      document.querySelectorAll('.review-list details').forEach(el=>el.addEventListener('toggle',()=>{if(el.open)this.typeset();}));
      this.save();
    }
    typeset() {
      this.main.querySelectorAll('.question-image img').forEach(img=>{
        const fail=()=>{const fig=img.closest('figure');fig.querySelector('figcaption').textContent='The question image could not load. Open the image link or skip this question.';};
        img.onerror=fail;if(img.complete&&!img.naturalWidth)fail();
      });
      if (window.MathJax?.startup?.promise) {
        this.mathQueue=this.mathQueue.catch(()=>{}).then(()=>MathJax.startup.promise).then(()=>MathJax.typesetPromise([this.main])).then(()=>{this.main.querySelectorAll('mjx-container[display="true"]').forEach(el=>{if(el.scrollWidth>el.clientWidth+1){el.tabIndex=0;el.setAttribute('role','region');el.setAttribute('aria-label','Equation. Scroll horizontally to read the full expression.');}});}).catch(()=>this.notice('Some math could not be rendered. Expand Original question text to read the source notation.'));
      }
    }
    keyboard(e) {
      if (!this.session || this.session.cursor>=this.session.ids.length || e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey || ['INPUT','TEXTAREA','SELECT','BUTTON','SUMMARY','A'].includes(e.target.tagName)) return;
      if (e.key==='Enter') {e.preventDefault();this.session.responses[this.current().id]?this.next():this.submit();}
    }
  }
  // Expose pure helpers for regression tests, without depending on a running session.
  window.BenchmarkLab={numberValue,numericMatch,format};
  const id=document.body.dataset.benchmark;
  if (id) new Practice(id);
})();
