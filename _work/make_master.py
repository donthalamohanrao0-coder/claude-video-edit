import subprocess,json,sys,os
# usage: python3 make_master.py <raw 1019.mov> <out dir>
# Tightens long pauses, light grade, writes master.mp4 (H.264 60fps, no audio), voice.wav and cutmap.json.
# Video is encoded per segment: one big trim graph runs out of memory on the 10-bit HEVC source.
SRC,OUT=sys.argv[1],sys.argv[2]
HERE=os.path.dirname(os.path.abspath(__file__))
FPS=60
snap=lambda t: round(t*FPS)/FPS  # boundaries on the frame grid so audio and video cut identically
START,END=0.10,145.25
PAD=0.12  # silence kept each side of a tightened pause
# pauses >=0.36s (silencedetect -35dB): (start,end)
pauses=[(7.735,8.111),(14.947,15.326),(20.677,21.181),(31.659,32.079),(39.516,40.163),(43.864,44.242),
        (58.040,58.515),(72.912,73.287),(79.295,79.810),(82.043,82.440),(96.444,96.847),(126.521,126.886),
        (141.642,142.004)]
keep=[];x=START
for a,b in pauses:
    keep.append((snap(x),snap(a+PAD))); x=b-PAD
keep.append((snap(x),snap(END)))
# map: source time -> master time
cm=[];t=0
for a,b in keep: cm.append({"src_in":a,"src_out":b,"master_in":round(t,4)}); t+=b-a
json.dump({"fps":FPS,"segments":cm,"duration":round(t,4)},open(f"{OUT}/cutmap.json","w"),indent=1)
print(f"{len(keep)} segments, {END-START:.2f}s -> {t:.2f}s")
grade="eq=contrast=1.06:saturation=1.12:gamma=0.98,unsharp=5:5:0.35"
lst=[]
for i,(a,b) in enumerate(keep):
    out=f"{OUT}/m{i:02d}.mp4"
    subprocess.run(["ffmpeg","-y","-loglevel","error","-ss",f"{a:.4f}","-i",SRC,"-an","-frames:v",str(round((b-a)*FPS)),
        "-vf",f"{grade},format=yuv420p","-c:v","libx264","-preset","fast","-crf","14","-g","30","-r",str(FPS),out],check=True)
    lst.append(f"file '{out}'")
open(f"{OUT}/m.txt","w").write("\n".join(lst))
subprocess.run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",f"{OUT}/m.txt","-c","copy",f"{OUT}/master.mp4"],check=True)
sel="+".join(f"between(t,{a:.4f},{b-0.00001:.4f})" for a,b in keep)
# voice: gentle cleanup only (source noise floor is already < -68 dB); loudness is set in the final mix
subprocess.run(["ffmpeg","-y","-loglevel","error","-i",SRC,"-vn","-af",
    f"aselect='{sel}',asetpts=N/SR/TB,aresample=48000,highpass=f=70,deesser=i=0.3,"
    "acompressor=threshold=-22dB:ratio=2.5:attack=8:release=150:makeup=2","-c:a","pcm_s16le",f"{OUT}/voice.wav"],check=True)
for i in range(len(keep)): os.remove(f"{OUT}/m{i:02d}.mp4")
print("done")
