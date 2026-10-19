# Video Editing with Claude — Skills & Guidelines (researched 2026-10-19)

## Skills in this folder (`skills/`)
Each folder has a `SKILL.md`. To use them in Claude Code, copy the folders you want into `~/.claude/skills/` (global) or `<project>/.claude/skills/`.

| Folder | Source | What it does |
|---|---|---|
| cut-video | github.com/louisedesadeleer/cut-video | Removes silences, ums, fillers, dead air; keeps laughs and deliberate pauses; forced alignment for precise cuts |
| clipify | github.com/louisedesadeleer/clipify | Finds clip-worthy moments, reframes 16:9 → 9:16 with speaker-following pans, word-by-word captions |
| add-zooms | github.com/louisedesadeleer/add-zooms | Punch-zooms on emphasized words, slow push-ins (ffmpeg render) |
| b-roll-finder | github.com/louisedesadeleer/b-roll-finder | Matches transcript beats to footage, places cutaways on exact words |
| remotion-video-skill | github.com/wshuyi/remotion-video-skill | Builds Remotion (React) videos from a plain-language brief |
| video-shotcraft | github.com/Vincentwei1021/video-shotcraft | Cinematic product videos in Remotion from 100+ shot recipes (SKILL + references only; full repo has templates/assets) |
| youtube-editor-pipeline | github.com/hassancs91/claude-youtube-editor | 9 skills: clean-cut, make-tsx, fake-screencast, clean-audio, suggest-sfx, packaging, thumbnail, brand-setup, vidtsx-2d-generator. Needs the repo's Python tools/Remotion kit for full use |
| ecc-video-editing | github.com/affaan-m/everything-claude-code | Full AI editing pipeline (capture → FFmpeg → Remotion → ElevenLabs/fal.ai → CapCut/Descript) |
| ecc-remotion-video-creation | same repo | Remotion best practices |
| ecc-videodb | same repo | VideoDB-based video search/edit/stream |
| ecc-manim-video | same repo | Math/technical animation videos with Manim |

Note: large media/assets and node_modules were left out. Re-clone the source repos for full tooling (templates, scripts that were excluded).

## Core guidelines (consistent across the best sources)
1. **Edit, don't generate.** AI's value is compressing and structuring real footage, not creating from prompts.
2. **Pipeline order:** transcribe → plan structure/cuts (edit decision list) → deterministic cuts with FFmpeg → visuals/captions (Remotion) → audio clean-up → SFX/music → human polish and export.
3. **Structure before style.** Fix the story and cuts before zooms, B-roll, or effects.
4. **Word-level timestamps are the backbone.** Keep an edited-transcript timestamp map so zooms, captions, B-roll and SFX land on exact words.
5. **FFmpeg for the boring, exact work:** trimming, concat, proxies, silence/scene detection, reframing. Make low-res proxies for fast iteration.
6. **Remotion when repeatable.** If you'll do it more than once, make it a component.
7. **Audio:** don't normalize loudness in the voice-cleaning step; do final loudness in the mix. Review SFX cue sheets before mixing.
8. **Verify before publishing.** AI editing failures are quiet (clipped words, A/V drift) — run a verification pass (e.g., `verify_cut.py`) and watch the result.
9. **Keep rendered output, editable project, and creative approval as separate states;** save a versioned checkpoint before big changes.
10. **Taste is the last layer.** You make the final creative calls (pacing, color, final mix).
11. Tooling prerequisites: ffmpeg/ffprobe, Node 18+, Python 3.10+; Whisper/AssemblyAI for transcripts; keep API keys in `.env`.

## Sources
- [The 12 Best Claude Code Skills in 2026 (Tella)](https://www.tella.com/blog/best-claude-code-skills)
- [Claude Code Video Editing guide (Learn with Hasan)](https://learnwithhasan.com/guide/claude-code-video-editing/)
- [everything-claude-code video-editing skill](https://vibeindex.ai/skills/affaan-m/everything-claude-code/video-editing)
- [Awesome Claude Video Skills list (OpenTools)](https://opentools.ai/resources/awesome-claude-video-skills)
- [How to Use Remotion Agent Skills With Claude Code (Tella)](https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code.md)
