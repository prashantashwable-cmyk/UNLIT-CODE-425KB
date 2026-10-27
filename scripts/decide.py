#!/usr/bin/env python3
"""Record an owner decision. Usage: decide.py <n> "<answer>" --by "<name>" [--date YYYY-MM-DD]
Writes docs/data/decisions.json (source of truth) and appends a line to STATE.md. Never guesses an answer."""
import json,sys,os,datetime
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
a=sys.argv[1:]
if len(a)<4 or '--by' not in a: print(__doc__); sys.exit(2)
n=a[0].zfill(3); ans=a[1]; by=a[a.index('--by')+1]
date=a[a.index('--date')+1] if '--date' in a else datetime.date.today().isoformat()
p=os.path.join(R,'docs/data/decisions.json'); d=json.load(open(p,encoding='utf-8'))
hit=[x for x in d if x['id'].endswith(n)]
if not hit: print('unknown decision',n); sys.exit(1)
hit[0]['answer']={'text':ans,'by':by,'date':date}
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
with open(os.path.join(R,'STATE.md'),'a',encoding='utf-8') as f: f.write(f"\n- DECIDED {hit[0]['id']} on {date} by {by}: {ans}  (review flags in config/flags.defaults.json)\n")
print('recorded',hit[0]['id'])
