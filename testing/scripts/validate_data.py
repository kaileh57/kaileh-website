"""Check bundled question files against the catalog."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
catalog = json.loads((ROOT / 'data/index.json').read_text())['benchmarks']
total = 0
for meta in catalog:
    questions = json.loads((ROOT / f'data/{meta["id"]}.json').read_text())
    assert len(questions) == meta['count'], meta['id']
    assert len({q['id'] for q in questions}) == len(questions), meta['id']
    assert (ROOT / meta['id'] / 'index.html').exists(), meta['id']
    for q in questions:
        if q['answer_type'] == 'grid':
            assert q['train'] and q['input'] and q['answer'], q['id']
            assert all(0 <= v <= 9 for g in [q['input'], q['answer']] for row in g for v in row), q['id']
            continue
        assert str(q['question']).strip() and str(q['answer']).strip(), q['id']
        if q.get('choices'):
            labels = [re.match(r'^([A-Z])\.\s', c)[1] for c in q['choices']]
            assert len(set(labels)) == len(labels) > 1 and q['answer'] in labels, q['id']
        if q['answer_type'] == 'number':
            assert re.fullmatch(r'-?\d+', q['answer']), q['id']
        if q.get('image'):
            assert (ROOT / 'hle/images' / q['image']).exists(), q['id']
    total += len(questions)
print(f'Validated {len(catalog)} benchmarks, {total:,} questions')
