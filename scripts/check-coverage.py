#!/usr/bin/env python3
"""Sanity checks on docs/data and phase packs. Exit 1 on problems."""
import json,re,os,glob,sys
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
req=[json.loads(l) for l in open('docs/data/requirements.jsonl',encoding='utf-8')]
tests=[json.loads(l) for l in open('docs/data/tests.jsonl',encoding='utf-8')]
pack=''.join(open(f,encoding='utf-8').read() for f in glob.glob('docs/phases/phase-*.md'))
bad=0
orph=[r for r in req if r['id'] not in pack]
print(f"requirements not in any phase pack: {len(orph)}")
for r in orph: print('  ',r['id'],r['key'],'wf=',r['workflow'],r['category'])
keys={r['key'] for r in req}
# automation rule IDs (AUT-nnn) are defined in spec section 17 and may be referenced by tests
keys|=set(re.findall(r'AUT-\d+',open(glob.glob('docs/spec/17-*')[0],encoding='utf-8').read()))
tk=[(t['id'],k) for t in tests for k in t['keys'] if k not in keys]
print(f"test requirement keys not found in requirements: {len(tk)}"); [print('  ',x) for x in tk[:15]]
ids={t['id'] for t in tests}
miss=sorted({x for r in req for x in r['tests'] if x not in ids})
print(f"requirement->test links to unknown tests: {len(miss)}",miss[:10])
notest=[r['id'] for r in req if not r['tests']]
print(f"requirements with no tests: {len(notest)}")
empty=[r['id'] for r in req if not r['requirement'] or not r['key']]
print(f"empty fields: {len(empty)}")
sys.exit(1 if (orph or tk or miss or empty) else 0)
