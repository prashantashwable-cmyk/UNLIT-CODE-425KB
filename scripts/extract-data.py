#!/usr/bin/env python3
"""Regenerates docs/data/* from the markdown tables (run from repo root), then run scripts/gen-phase-packs.py. Expected counts: 272 tests, 180 requirements, 87 screens, 16 stages, 15 permission rows, 32 decisions."""
import re,json,csv,glob,os
S='docs/spec/'; REF='docs/reference/'
def rows(path,start_pat=None):
    out=[];hdr=None
    for l in open(path,encoding='utf-8'):
        l=l.rstrip('\n')
        if not l.startswith('|'): hdr=None if hdr and not l.strip() else hdr; continue
        c=[x.strip() for x in l.strip().strip('|').split(' | ')]
        if set(l.replace('|','').strip())<=set('-: '): continue
        if hdr is None: hdr=c; continue
        if len(c)==len(hdr): out.append(dict(zip(hdr,c)))
    return out
# tests
tests=[]
for r in rows(glob.glob(REF+'36-*')[0]):
    if r.get('Test ID','').startswith('AIEC-TEST'):
        tests.append(dict(id=r['Test ID'],keys=[k.strip() for k in r['Requirement keys'].split(',')],gwt=r['Given / When / Then'],level=r['Level']))
with open('docs/data/tests.jsonl','w') as f:
    for t in tests: f.write(json.dumps(t,ensure_ascii=False)+'\n')
# requirements
reqs=[]
for r in rows(glob.glob(REF+'42-*')[0]):
    if r.get('ID','').startswith('AIEC-'):
        reqs.append(dict(id=r['ID'],key=r['Key'],requirement=r['Requirement'],source=r['Source (file/section)'],category=r['Category'],roles=r['Roles'],workflow=re.findall(r'WF-\d+',r['Workflow']),screens=re.findall(r'SCR-\d+',r['Screens']),tests=re.findall(r'AIEC-TEST-\d+',r['Tests']),status=r['Status'],flags=r['Flags']))
with open('docs/data/requirements.jsonl','w') as f:
    for t in reqs: f.write(json.dumps(t,ensure_ascii=False)+'\n')
# screens
sc=[r for r in rows(glob.glob(S+'13-*')[0]) if r.get(list(r)[0],'').startswith('SCR-')]
if sc:
    with open('docs/data/screens.csv','w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(sc[0])); w.writeheader(); w.writerows(sc)
# stages
st=[r for r in rows(glob.glob(S+'16-*')[0]) if r.get('#','').isdigit()]
json.dump(st,open('docs/data/stages.json','w'),ensure_ascii=False,indent=1)
# permissions
pm=[r for r in rows(glob.glob(S+'08-*')[0]) if 'Data / action' in r]
if pm:
    with open('docs/data/permissions.csv','w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(pm[0])); w.writeheader(); w.writerows(pm)
# decisions
dec=[]
for r in rows(S+'40-decisions-overview.md'):
    if r.get('Decision','').startswith('AIEC-DEC'):
        dec.append(dict(id=r['Decision'],tier=r['Tier'],question=r[list(r)[2]],default_until_answered=r[list(r)[3]],answer=None))
json.dump(dec,open('docs/data/decisions.json','w'),ensure_ascii=False,indent=1)
print(len(tests),len(reqs),len(sc),len(st),len(pm),len(dec))
print(set(r['workflow'][0] if r['workflow'] else '-' for r in reqs))
