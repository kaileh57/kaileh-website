'use strict';
(async () => {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const catalog = document.getElementById('catalog');
  try {
    const response = await fetch('/testing/data/index.json?v=20260913c');
    if (!response.ok) throw new Error('Catalog request failed');
    const {benchmarks, total_questions} = await response.json();
    document.getElementById('catalog-summary').textContent = `${benchmarks.length} benchmarks / ${total_questions.toLocaleString()} questions`;
    const search = document.getElementById('search'), domain = document.getElementById('domain'), format = document.getElementById('format');
    [...new Set(benchmarks.map(b => b.category))].sort().forEach(c => domain.add(new Option(c,c)));
    const params = new URLSearchParams(location.search);
    search.value = params.get('search') || '';
    if ([...domain.options].some(o => o.value === params.get('subject'))) domain.value = params.get('subject');
    function render() {
      const needle = search.value.trim().toLowerCase();
      const items = benchmarks.filter(b => (domain.value === 'all' || b.category === domain.value) && (format.value === 'all' || b.format === format.value) && `${b.title} ${b.description} ${b.category} ${b.subjects.join(' ')}`.toLowerCase().includes(needle));
      document.getElementById('catalog-status').textContent = `${items.length} of ${benchmarks.length} benchmarks`;
      catalog.innerHTML = items.length ? items.map(b => {
        let resume = false;
        try { const s = JSON.parse(localStorage.getItem(`benchmark-lab:v2:${b.id}`)); resume = s?.version === 2 && s.ids?.length > 0 && s.cursor < s.ids.length; } catch (_) { /* Storage is optional. */ }
        return `<article class="benchmark-card"><div class="card-top"><h2><a href="/testing/${b.id}/">${escape(b.title)}</a></h2><span class="tag ${b.id === 'mmlu-pro' ? 'featured' : ''}">${escape(b.level)}</span></div><p class="card-description">${escape(b.description)}</p><div class="card-meta"><span>${b.count.toLocaleString()} questions</span><span>${escape(b.category)}</span><span>${escape(b.format)}</span></div><div class="card-actions"><a class="btn" href="/testing/${b.id}/">${resume ? 'Resume practice' : 'Start practice'}</a><a href="${b.dataset}">${escape(b.title)} dataset</a></div></article>`;
      }).join('') : '<p class="empty">No benchmarks match these filters. Try another subject or clear your search.</p>';
    }
    [search,domain,format].forEach(el => el.addEventListener('input',render));
    render();
  } catch (_) {
    document.getElementById('catalog-summary').textContent = 'The collection could not load.';
    catalog.innerHTML = '<div class="notice error"><p>Check your connection and reload the page.</p><p><a href="/testing/sources.html">Sources and benchmark links</a></p><button class="btn" id="retry">Try again</button></div>';
    document.getElementById('retry').onclick = () => location.reload();
  }
})();
