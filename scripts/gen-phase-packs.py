#!/usr/bin/env python3
"""Generates docs/phases/phase-N.md context packs from docs/data. Phase<->workflow mapping is PROPOSED (spec §39 gives scope text and test ranges only)."""
import json,re,os,glob
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'); os.chdir(R)
WF={1:['WF-01','WF-16','WF-18'],2:['WF-08','WF-12'],3:['WF-02','WF-03'],4:['WF-04'],5:['WF-05','WF-06'],6:['WF-07','WF-09'],7:['WF-10','WF-15'],8:['WF-11','WF-14'],9:['WF-13','WF-17']}
RANGES={1:[(1,8),(62,69),(98,98)],2:[(27,35),(70,77)],3:[(9,16)],4:[(17,25)],5:[(26,40)],6:[(41,41),(45,50)],7:[(51,59),(64,65)],8:[(41,44),(60,60),(88,89),(105,106)],9:[(78,84)],10:[(90,100)]}
TIER={0:'1',1:'1',2:'2',3:'3',4:'3',5:'3',6:'4',7:'4',8:'4'}
req=[json.loads(l) for l in open('docs/data/requirements.jsonl')]
tests={json.loads(l)['id']:json.loads(l) for l in open('docs/data/tests.jsonl')}
dec=json.load(open('docs/data/decisions.json'))
# module ranges
mods={}
for l in open('docs/spec/15-modules-index.md'):
    m=re.match(r'- \[.*?\((SCR[^)]*)\)\]\((modules/[^)]+)\)',l)
    if m:
        s=set()
        for a,b in re.findall(r'SCR-(\d+) to SCR-(\d+)',m.group(1)): s|=set(range(int(a),int(b)+1))
        s|={int(x) for x in re.findall(r'SCR-(\d+)(?! to)',re.sub(r'SCR-\d+ to SCR-\d+','',m.group(1)))}
        mods[m.group(2)]=s
os.makedirs('docs/phases',exist_ok=True)
for p in range(1,10):
    rs=[r for r in req if set(r['workflow'])&set(WF[p])]
    tid={int(t[-4:]) for r in rs for t in r['tests']}
    for a,b in RANGES[p]: tid|=set(range(a,b+1))
    scr=sorted({int(s[4:]) for r in rs for s in r['screens']})
    files=sorted(f for f,s in mods.items() if s&set(scr))
    ds=[d for d in dec if d['tier'].startswith(TIER.get(p,'0'))]
    out=[f"# Phase {p} context pack (generated; mapping PROPOSED)\n","Workflows: "+', '.join(WF[p]),"\nRead first: `python3 scripts/spec.py sec 16.2` (stage rules). Screens are read one at a time, never whole modules:"]
    for f in files:
        mn=re.search(r'15\.(\d+)-',f).group(1).lstrip('0'); mine=sorted(mods[f]&set(scr))
        out.append(f"- `15.{mn}` ({f}): preamble `spec.py sec 15.{mn}`; screens "+', '.join(f"SCR-{n:03d}" for n in mine)+" via `spec.py sec SCR-nnn`")
    if not files: out.append('- (no role module screens; see requirements)')
    out+=[f"\n## Requirements ({len(rs)})"]+[f"- {r['id']} [{r['key']}] {r['requirement'][:170]}{'…' if len(r['requirement'])>170 else ''} ({r['status']}{(' '+r['flags']) if r['flags'] not in ('—','') else ''})" for r in rs]
    out+=[f"\n## Tests ({len(tid)}) — `python3 scripts/spec.py test N`"]
    lv={}
    for n in sorted(tid):
        t=tests.get(f"AIEC-TEST-{n:04d}")
        if t: lv.setdefault(t['level'],[]).append(str(n))
    out+=[f"- {k}: {', '.join(v)}" for k,v in lv.items()]
    out+=["\n## Decisions to check (tier "+TIER.get(p,'0')+") — `python3 scripts/spec.py dec N`"]+[f"- {d['id']}: default → {d['default_until_answered']}" for d in ds]
    open(f'docs/phases/phase-{p}.md','w').write('\n'.join(out)+'\n')
    print(p,len(rs),'reqs',len(tid),'tests',len(files),'modules',os.path.getsize(f'docs/phases/phase-{p}.md')//1024+1,'KB')
