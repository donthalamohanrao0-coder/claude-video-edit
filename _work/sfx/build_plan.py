import json, sys
# usage: python3 build_plan.py <remotion/src/data/cues.json> <out sfx-plan.json>
# Builds the SFX cue sheet from the same cue file that drives the graphics, so sounds land on the visual beats.
cues = json.load(open(sys.argv[1]))
# base gains (dB vs. the clip's -1 dBFS peak), calibrated by momentary SFX/voice ratio (check_audibility.py)
G = {"whoosh": -3, "whoosh-soft": -12, "pop": -8, "pop-small": -13, "tick": -6, "mouse-click": -5, "impact": -7,
     "riser": -12, "ding": -14, "ping": -10, "swipe": -10, "unlock": -11, "sparkle": -15, "shimmer": -12}
RISER = 1.3
ev = []
def add(at, sfx, cue, dg=0, **kw): ev.append({"at_s": round(at, 3), "sfx_id": sfx, "gain_db": G[sfx] + dg, "cue": cue, **kw})

h = cues["hook"]
add(1.2, "whoosh-soft", "hook card slides in")
for i, at in enumerate(h["items"]): add(at, "pop", f"hook item {i+1}")
for i, at in enumerate(h["checks"]): add(at, "tick", f"hook check {i+1}")
add(cues["forYou"]["at"] - RISER, "riser", "build into 'this course is for you'", optional=True)
add(cues["forYou"]["at"], "impact", "stamp: THIS COURSE IS FOR YOU")
add(cues["scratch"]["in"], "whoosh-soft", "scratch->advanced card")
add(cues["scratch"]["fill"], "swipe", "progress bar fills", -3)
for i, at in enumerate(cues["concepts"]["items"]): add(at, "pop", f"concept pill {i+1}")
add(cues["advanced"]["in"], "whoosh-soft", "advanced card")
add(cues["advanced"]["hl"], "impact", "ADVANCED highlight + punch-in", -4)
for w in cues["whips"]: add(w - 0.18, "whoosh", f"whip transition @{w}")
add(cues["lowerThird"]["in"], "whoosh-soft", "name lower third", 2)
s = cues["stats"]
add(s[0]["in"], "pop", "1.5 yrs card")
add(s[1]["in"], "whoosh-soft", "20+ card")
for k in range(8): add(s[1]["in"] + 0.12 + k * 0.13, "tick", "20+ count-up", -4, optional=True)
for k in range(3): add(s[1]["chips"] + k * 0.12, "pop-small", f"country chip {k+1}")
add(s[2]["in"], "pop", "100s tutorials card")
add(cues["practical"]["in"], "pop", "practical knowledge card")
add(cues["sevenHour"]["in"], "whoosh-soft", "7 hours card")
add(cues["punches"][2], "impact", "7-HOUR punch-in", -3)
add(cues["free"]["in"], "impact", "stamp: 100% FREE")
add(cues["free"]["in"] + 0.05, "ding", "FREE sparkle", -2)
add(cues["price"]["in"], "whoosh-soft", "price card")
add(cues["price"]["strike"], "swipe", "strike-through Rs 1000s")
add(cues["price"]["free"], "ding", "FREE on our channel")
sb = cues["subscribe"]
add(sb["in"], "pop", "subscribe block")
add(sb["click"], "mouse-click", "subscribe click")
add(sb["click"] + 0.06, "ding", "bell", -1)
lk = cues["likes"]
add(lk["in"], "whoosh-soft", "likes card")
for k in range(12): add(lk["count"][0] + k * (lk["count"][1] - lk["count"][0]) / 12, "tick", "likes count-up", -7, optional=True)
add(lk["unlock"], "unlock", "unlock: client-projects tutorial")
add(lk["hit"], "impact", "LET'S HIT IT", -2)
add(lk["hit"] + 0.02, "sparkle", "confetti")
add(cues["roadmap"]["in"] - RISER + 0.1, "riser", "build into roadmap", 0, optional=True)
add(cues["roadmap"]["in"], "whoosh", "roadmap split-screen in", -2)
for i, at in enumerate(cues["parts"]): add(at, "pop", f"roadmap part {i+1}", -1)
add(cues["roadmap"]["out"], "whoosh", "roadmap out", -3)
add(cues["everyPart"]["in"], "pop", "every-part card")
add(cues["resources"]["in"], "whoosh-soft", "resources card")
add(cues["resources"]["in"] + 0.15, "pop", "resources card lands")
add(cues["whatsapp"]["in"], "ping", "WhatsApp community card")
for i, at in enumerate(cues["whatsapp"]["chips"]): add(at, "pop-small", f"WhatsApp chip {i+1}")
add(cues["outro"]["in"], "pop", "next up card")
add(cues["outro"]["endCard"], "impact", "end card", -2)
add(cues["outro"]["endCard"] + 0.05, "shimmer", "end card swell")
ev.sort(key=lambda e: e["at_s"])
plan = {"voice": "voice.wav", "catalog": "sfx/catalog.json", "total_s": cues["total"], "duck": True, "target_lufs": -14,
        "events": ev}
json.dump(plan, open(sys.argv[2], "w"), indent=1)
print(len(ev), "events,", sum(1 for e in ev if e.get("optional")), "optional")
