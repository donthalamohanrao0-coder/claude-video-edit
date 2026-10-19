import subprocess
D=145.427
cutA,cutB=39.6,40.1
bounds=[]
t=0
segs=[]
def add(a,b):
    x=a
    while x<b-0.01:
        y=min(x+8,b)
        if b-y<3: y=b
        segs.append((x,y)); x=y
add(0,cutA); add(cutB,D)
parts=[];labels=[]
for i,(a,b) in enumerate(segs):
    z=1.0 if i%2==0 else 1.14
    w,h=1920/z,1080/z
    x=(1920-w)/2; y=(1080-h)*0.25
    parts.append(f"[0:v]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS,crop={w:.2f}:{h:.2f}:{x:.2f}:{y:.2f},scale=1920:1080:flags=lanczos,setsar=1[v{i}]")
    labels.append(f"[v{i}]")
vf=";".join(parts)+";"+"".join(labels)+f"concat=n={len(segs)}:v=1:a=0[vout]"
af=(f"[0:a]aselect='lt(t,{cutA})+gte(t,{cutB})',asetpts=N/SR/TB,highpass=f=80,afftdn=nr=10:nf=-40,"
    "acompressor=threshold=-24dB:ratio=3:attack=5:release=120,loudnorm=I=-16:TP=-1.5:LRA=9[aout]")
cmd=["ffmpeg","-y","-hide_banner","-i","1019.mov","-filter_complex",vf+";"+af,"-map","[vout]","-map","[aout]",
"-c:v","libx264","-preset","veryfast","-crf","18","-pix_fmt","yuv420p","-r","60","-c:a","aac","-b:a","192k","-movflags","+faststart","/tmp/1019_edited.mp4"]
print(len(segs),"segments")
subprocess.run(cmd)
