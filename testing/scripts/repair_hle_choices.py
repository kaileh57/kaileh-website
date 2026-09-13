"""Restore every answer choice from the original bundled HLE snapshot."""
import json
import re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
original={q['id']:q for q in json.loads((ROOT/'hle/questions.json').read_text())}
path=ROOT/'data/hle.json'
questions=json.loads(path.read_text())
changed=0
for question in questions:
    source=original[question['id']]
    if source['answer_type']!='multipleChoice':
        continue
    prompt,choices=source['question'].rsplit('Answer Choices:',1)
    starts=list(re.finditer(r'^([A-Z])\.\s',choices,re.M))
    options=[choices[m.start():starts[i+1].start() if i+1<len(starts) else len(choices)].strip() for i,m in enumerate(starts)]
    assert source['answer'] in [m[1] for m in starts]
    changed+=options!=question.get('choices')
    question['question']=prompt.strip()
    question['choices']=options
path.write_text(json.dumps(questions,indent=2,ensure_ascii=False)+'\n')
print(f'Restored complete choice sets for {changed} HLE questions')
