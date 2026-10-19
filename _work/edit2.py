import subprocess,os
D=145.427; cutA,cutB=39.6,40.1
segs=[]
def add(a,b):
    x=a
    while x<b-0.01:
        y=min(x+8,b)
        if b-y<3: y=b
        segs.append((x,y)); x=y
add(0,cutA); add(cutB,D)
W="/tmp/w"; os.makedirs(W,exist_ok=True)
lst=[]
for i,(a,b) in enumerate(segs):
    z=1.0 if i%2==0 else 1.14
    w,h=1920/z,1080/z; x=(1920-w)/2; y=(1080-h)*0.25
    out=f"{W}/s{i:02d}.mp4"
    subprocess.run(["ffmpeg","-y","-loglevel","error","-ss",f"{a}","-t",f"{b-a:.3f}","-i","1019.mov","-an",
     "-vf",f"crop={w:.2f}:{h:.2f}:{x:.2f}:{y:.2f},scale=1920:1080:flags=lanczos,setsar=1",
     "-c:v","libx264","-preset","veryfast","-crf","18","-pix_fmt","yuv420p","-r","60",out],check=True)
    lst.append(f"file '{out}'")
open(f"{W}/l.txt","w").write("\n".join(lst))
subprocess.run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",f"{W}/l.txt","-c","copy",f"{W}/v.mp4"],check=True)
af=(f"[0:a]atrim=0:{cutA},asetpts=PTS-STARTPTS[a1];[0:a]atrim={cutB},asetpts=PTS-STARTPTS[a2];"
    "[a1][a2]concat=n=2:v=0:a=1,highpass=f=80,afftdn=nr=10:nf=-40,"
    "acompressor=threshold=-24dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=9[a]")
subprocess.run(["ffmpeg","-y","-loglevel","error","-i","1019.mov","-filter_complex",af,"-map","[a]","-c:a","aac","-b:a","192k",f"{W}/a.m4a"],check=True)
subprocess.run(["ffmpeg","-y","-loglevel","error","-i",f"{W}/v.mp4","-i",f"{W}/a.m4a","-c","copy","-shortest","-movflags","+faststart","/tmp/1019_edited.mp4"],check=True)
print("done")
