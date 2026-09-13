"""Check bundled benchmark counts, choice keys, IDs, images, and route assets."""
import json
import re
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
catalog=json.loads((ROOT/'data/index.json').read_text())
total=0
for meta in catalog['benchmarks']:
    questions=json.loads((ROOT/f'data/{meta["id"]}.json').read_text())
    assert len(questions)==meta['count']
    assert len({q['id'] for q in questions})==len(questions)
    assert (ROOT/meta['id']/'index.html').exists()
    for q in questions:
        assert str(q.get('question','')).strip(),q['id']
        assert str(q.get('answer','')).strip(),q['id']
        if q.get('answer_type')=='multipleChoice':
            choices=q.get('choices',[])
            labels=[re.match(r'^([A-Z])\.\s',c)[1] for c in choices]
            assert len(set(labels))==len(choices)>1,q['id']
            assert q['answer'] in labels,q['id']
        if q.get('image'):
            folder=ROOT/'hle/images' if meta['id']=='hle' else ROOT/'data/images'
            assert (folder/q['image']).exists(),q['id']
    total+=len(questions)
assert total==catalog['total_questions']
class Links(HTMLParser):
    def handle_starttag(self,tag,attrs):
        for key,url in attrs:
            if key in ('href','src') and url and url.startswith('/testing/'):
                target=ROOT/url.removeprefix('/testing/').split('?')[0]
                assert target.exists(),target
for page in ROOT.glob('**/*.html'):
    Links().feed(page.read_text())
for path in [ROOT/'shared/benchmark.js',ROOT/'shared/catalog.js',ROOT/'scripts/build_catalog.py']:
    assert '\u2014' not in path.read_text(),f'Em dash in interface copy: {path}'
print(f'Validated {len(catalog["benchmarks"])} benchmarks, {total:,} questions, all choice keys, images, and local page assets.')
