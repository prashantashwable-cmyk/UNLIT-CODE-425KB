#!/usr/bin/env python3
"""Token-cheap lookups into the spec data. Usage:
  spec.py req <KEY|AIEC-id|text>   spec.py test <n|KEY>   spec.py screen <n>
  spec.py dec <n>   spec.py stage <n>   spec.py perm <text>   spec.py phase <n>
  spec.py sec <heading text|SCR-052|16.2|15.2> [--tree]   one section's own text (--tree adds sub-sections)
  spec.py toc <file-prefix e.g. 15.02|16|21>              headings with line counts"""
import json,sys,csv,re,os,glob
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','docs','data')
def jl(n): return [json.loads(l) for l in open(os.path.join(D,n),encoding='utf-8')]
def sections():
    root=os.path.join(D,'..','spec'); out=[]
    for f in sorted(glob.glob(root+'/*.md')+glob.glob(root+'/modules/*.md')):
        if os.path.basename(f) in ('INDEX.md','CLAUDE.md'): continue
        L=open(f,encoding='utf-8').read().split('\n'); fence=False; hs=[]
        for i,l in enumerate(L):
            if l.startswith('```'): fence=not fence
            m=None if fence else re.match(r'^(#{1,6}) (.*)',l)
            if m: hs.append((i,len(m.group(1)),m.group(2)))
        for k,(i,lv,title) in enumerate(hs):
            own=hs[k+1][0] if k+1<len(hs) else len(L)
            tree=len(L)
            for j in range(k+1,len(hs)):
                if hs[j][1]<=lv: tree=hs[j][0]; break
            out.append(dict(file=os.path.relpath(f,os.path.join(D,'..','..')),lv=lv,title=title,start=i,own=own,tree=tree,lines=L))
    return out
def sec(q,tree):
    ql=q.lower(); hits=[s for s in sections() if s['title'].lower().startswith(ql) or re.match(r'^'+re.escape(ql)+r'\b',s['title'].lower()) or (len(ql)>3 and ql in s['title'].lower())]
    if not hits: print('no section matches; try: spec.py toc <file-prefix>'); return
    exact=[s for s in hits if re.match(r'^'+re.escape(ql)+r'(?![\w.]*\d)',s['title'].lower()) and not re.match(r'^'+re.escape(ql)+r'\d',s['title'].lower())]
    for s in (exact or hits)[:3]:
        end=s['tree'] if tree else s['own']
        print(f"<!-- {s['file']}:{s['start']+1}-{end} -->"); print('\n'.join(s['lines'][s['start']:end]).rstrip()); print()
        if not tree and s['tree']>s['own']: print(f"(+ sub-sections: spec.py sec \"{q}\" --tree)\n")
def toc(q):
    for s in sections():
        if os.path.basename(s['file']).startswith(q) or s['file'].split('/')[-1].startswith(q):
            print(f"{'  '*(s['lv']-1)}{s['title'][:80]}  [{s['own']-s['start']} lines]")
def main(a):
    if len(a)<2: print(__doc__); return
    tree='--tree' in a; a=[x for x in a if x!='--tree']
    c,q=a[0],' '.join(a[1:]); ql=q.lower()
    if c=='req':
        for r in jl('requirements.jsonl'):
            if ql in (r['id']+' '+r['key']+' '+r['requirement']).lower():
                print(f"{r['id']} [{r['key']}] {r['requirement']}\n  src:{r['source']} roles:{r['roles']} wf:{','.join(r['workflow'])} scr:{','.join(r['screens'])} tests:{','.join(t[-4:] for t in r['tests'])} {r['status']} {r['flags']}")
    elif c=='test':
        n=q.zfill(4) if q.isdigit() else None
        for t in jl('tests.jsonl'):
            if (n and t['id'].endswith(n)) or (not n and ql in (' '.join(t['keys'])+t['gwt']).lower()):
                print(f"{t['id']} [{t['level']}] {','.join(t['keys'])}\n  {t['gwt']}")
    elif c=='screen':
        for r in csv.DictReader(open(os.path.join(D,'screens.csv'),encoding='utf-8')):
            if re.search(r'SCR-0*'+q.replace('SCR-','').lstrip('0')+r'\b',list(r.values())[0]): print(json.dumps(r,ensure_ascii=False,indent=1))
    elif c=='dec':
        for d in json.load(open(os.path.join(D,'decisions.json'),encoding='utf-8')):
            if d['id'].endswith(q.zfill(3)): print(json.dumps(d,ensure_ascii=False,indent=1)); print('full record: rg -n "'+d['id']+'" docs/spec/40-decisions-records.md')
    elif c=='stage':
        for s in json.load(open(os.path.join(D,'stages.json'),encoding='utf-8')):
            if s['#']==q: print(json.dumps(s,ensure_ascii=False,indent=1))
    elif c=='perm':
        for r in csv.DictReader(open(os.path.join(D,'permissions.csv'),encoding='utf-8')):
            if ql in r['Data / action'].lower(): print(json.dumps(r,ensure_ascii=False,indent=1))
    elif c=='sec': sec(q,tree)
    elif c=='toc': toc(q)
    elif c=='phase':
        p=os.path.join(D,'..','phases',f'phase-{q}.md'); print(open(p,encoding='utf-8').read() if os.path.exists(p) else 'no pack')
    else: print(__doc__)
main(sys.argv[1:])
