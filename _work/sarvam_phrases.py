import sys,json,os,subprocess,requests
# usage: SARVAM_API_KEY=... sarvam_phrases.py <16k mono wav> <silences.txt> <out.json>
# One Sarvam request per pause-delimited phrase (silences.txt = silencedetect start/end pairs) for phrase-level timing.
wav,silf,out=sys.argv[1:4]
key=os.environ["SARVAM_API_KEY"]  # never commit the key
D=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",wav]))
t=[float(x) for x in open(silf).read().split()]
sil=list(zip(t[0::2],t[1::2]))
ph=[];x=0.0
for a,b in sil:
    if a>x: ph.append([x,a])
    x=b
if D-x>0.15: ph.append([x,D])
# merge tiny fragments (<0.9s) into the previous phrase
m=[]
for p in ph:
    if m and (p[1]-p[0]<0.9 or m[-1][1]-m[-1][0]<0.9) and p[1]-m[-1][0]<28: m[-1][1]=p[1]
    else: m.append(p)
res=[];tmp=os.path.join(os.path.dirname(os.path.abspath(out)),"ph.wav")
for a,b in m:
    subprocess.run(["ffmpeg","-y","-loglevel","error","-ss",str(max(0,a-0.08)),"-to",str(min(D,b+0.08)),"-i",wav,tmp],check=True)
    r=requests.post("https://api.sarvam.ai/speech-to-text",headers={"api-subscription-key":key},
        files={"file":("ph.wav",open(tmp,"rb"),"audio/wav")},data={"model":"saarika:v2.5","language_code":"te-IN"},timeout=120)
    if r.status_code!=200: print(r.status_code,r.text); sys.exit(1)
    res.append({"start":round(a,3),"end":round(b,3),"text":r.json()["transcript"].strip()})
    print(f"{a:7.2f}-{b:7.2f} {res[-1]['text']}",flush=True)
json.dump(res,open(out,"w"),indent=1,ensure_ascii=False)
