import json,sys,re,unicodedata
# usage: remap_transcript.py <transcript_te.json> <cutmap.json> <out.json>
# Moves phrase times onto the master timeline and estimates word times inside each phrase
# (Sarvam gives phrase timing only) by spoken-length weight.
tr,cmf,out=sys.argv[1:4]
cm=json.load(open(cmf))["segments"]
def m(t):
    for s in cm:
        if t<s["src_in"]: return s["master_in"]           # inside a removed gap -> next segment start
        if t<=s["src_out"]: return s["master_in"]+t-s["src_in"]
    s=cm[-1]; return s["master_in"]+s["src_out"]-s["src_in"]
def weight(w):
    if re.fullmatch(r"[A-Za-z0-9+.,&]+",w): return max(2,len(w))*1.2
    # count base letters, combining vowel signs count half
    return sum(0.5 if unicodedata.category(c)=="Mn" or unicodedata.category(c)=="Mc" else 1 for c in w if c.strip())
ph=[]
for p in json.load(open(tr)):
    a,b=m(p["start"]),m(p["end"])
    toks=p["text"].split()
    ws=[weight(w) for w in toks]; tot=sum(ws); t=a; words=[]
    for w,k in zip(toks,ws):
        d=(b-a)*k/tot; words.append({"w":w,"s":round(t,3),"e":round(t+d,3)}); t+=d
    ph.append({"s":round(a,3),"e":round(b,3),"text":p["text"],"words":words})
json.dump(ph,open(out,"w"),ensure_ascii=False,indent=0)
for p in ph: print(f'{p["s"]:7.2f} {p["text"][:70]}')
