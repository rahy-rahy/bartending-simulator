"""
Assembles the demo MP4 from the recorded clips, the title card and the music.

    python3 scripts/demo/build_video.py <clips-dir> <music.wav> <output.mp4> [target-seconds]

- 1920x1080, 30 fps, H.264 + AAC, bitrate-capped to stay well under 20 MB
- 3 s title card, caption at the top of every scene, URL in the bottom-right corner
- scenes are gently sped up or trimmed so the total lands on the target length
"""
import json
import subprocess
import sys
from pathlib import Path

clips_dir = Path(sys.argv[1])
music = Path(sys.argv[2])
out = Path(sys.argv[3])
TARGET = float(sys.argv[4]) if len(sys.argv) > 4 else 60.0

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
URL = "bartending-simulator.pages.dev"
TITLE_SECONDS = 3.0
TRIM_START = 0.45  # first frames of a Playwright recording are the blank page

# (clip, caption, fixed playback speed or None = computed so the whole video hits the target length)
SCENES = [
    ("01-home", "Home  -  Free Bar, Recipe Library and Challenge Mode", 1.1),
    ("02-library", "Recipe Library  -  search 212 cocktails and open one", 1.25),
    ("03-freebar", "Free Bar  -  pick a glass, drop ice, pour with the live ml / oz counter, garnish, then bin it", None),
    ("04-guided", "Guided Margarita  -  wet and salt the rim, shake, strain, garnish", None),
    ("05-challenge", "Challenge Mode  -  pick Easy, build the drink from memory, press Serve for a score", None),
    ("06-progress", "Progress  -  mastered cocktails, streaks and best scores", 1.15),
]
MAX_SPEED = 1.95
CAPTION_BAND = 56


def probe(path: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(json.loads(r.stdout)["format"]["duration"])


def esc(text: str) -> str:
    return text.replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\\\\\'").replace(",", "\\,").replace("%", "\\%")


durations = {name: probe(clips_dir / f"{name}.webm") - TRIM_START for name, _, _ in SCENES}
fixed_seconds = sum(durations[n] / s for n, _, s in SCENES if s is not None)
flex_raw = sum(durations[n] for n, _, s in SCENES if s is None)
flex_speed = min(MAX_SPEED, max(1.0, flex_raw / max(1.0, TARGET - TITLE_SECONDS - fixed_seconds)))
speeds = {n: (s if s is not None else flex_speed) for n, _, s in SCENES}
print(f"fixed scenes {fixed_seconds:.1f} s, flexible raw {flex_raw:.1f} s -> speed {flex_speed:.3f}")

inputs = ["-loop", "1", "-t", str(TITLE_SECONDS), "-i", str(clips_dir / "title.png")]
for name, _, _ in SCENES:
    inputs += ["-i", str(clips_dir / f"{name}.webm")]
inputs += ["-i", str(music)]
music_index = len(SCENES) + 1

filters = []
filters.append(
    f"[0:v]scale=1920:1080,fps=30,format=yuv420p,fade=t=in:st=0:d=0.6,fade=t=out:st={TITLE_SECONDS - 0.5}:d=0.5,setsar=1[t]"
)
timeline = []  # (start, end, caption)
cursor = TITLE_SECONDS
labels = ["[t]"]
for i, (name, caption, _) in enumerate(SCENES, start=1):
    speed = speeds[name]
    d = durations[name] / speed
    filters.append(
        f"[{i}:v]trim=start={TRIM_START},setpts=(PTS-STARTPTS)/{speed:.4f},scale=1920:1080,fps=30,format=yuv420p,setsar=1[c{i}]"
    )
    labels.append(f"[c{i}]")
    timeline.append((cursor, cursor + d, caption))
    cursor += d
total = cursor
print(f"final duration {total:.1f} s")

filters.append("".join(labels) + f"concat=n={len(labels)}:v=1:a=0[cat]")

# Captions sit in the band reserved above the page while recording; URL bottom-right throughout.
chain = "[cat]"
draw = [f"drawbox=x=0:y=0:w=iw:h={CAPTION_BAND}:color=0x120b06@1:t=fill:enable='gte(t,{TITLE_SECONDS:.2f})'"]
for k, (s, e, caption) in enumerate(timeline):
    draw.append(
        f"drawtext=fontfile={FONT}:text='{esc(caption)}':fontcolor=0xf0d48a:fontsize=27:"
        f"x=(w-text_w)/2:y=({CAPTION_BAND}-text_h)/2-2:"
        f"enable='between(t,{s:.3f},{e:.3f})'"
    )
draw.append(
    f"drawtext=fontfile={FONT_REG}:text='{esc(URL)}':fontcolor=white@0.9:fontsize=24:"
    f"x=w-text_w-24:y=h-text_h-18:box=1:boxcolor=0x000000@0.5:boxborderw=8:enable='gte(t,{TITLE_SECONDS:.2f})'"
)
# A soft fade-out on the very end.
filters.append(chain + ",".join(draw) + f",fade=t=out:st={total - 0.8:.3f}:d=0.8[v]")
filters.append(f"[{music_index}:a]atrim=0:{total:.3f},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=1.5,afade=t=out:st={total - 3.0:.3f}:d=3.0,volume=0.9[a]")

cmd = [
    "ffmpeg",
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    *inputs,
    "-filter_complex",
    ";".join(filters),
    "-map",
    "[v]",
    "-map",
    "[a]",
    "-c:v",
    "libx264",
    "-preset",
    "slow",
    "-profile:v",
    "high",
    "-crf",
    "22",
    "-maxrate",
    "2100k",
    "-bufsize",
    "4200k",
    "-r",
    "30",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-ar",
    "44100",
    "-movflags",
    "+faststart",
    "-t",
    f"{total:.3f}",
    str(out),
]
subprocess.run(cmd, check=True)
size = out.stat().st_size
print(f"wrote {out}: {size / 1e6:.2f} MB, {probe(out):.2f} s")
Path(str(out) + ".timeline.json").write_text(json.dumps({"speeds": speeds, "scenes": timeline, "total": total}, indent=2))
