#!/bin/bash
set -e
SOUNDS="$(cd "$(dirname "$0")" && pwd)"
EFFECTS="$SOUNDS/effects"
MUSIC="$SOUNDS/music"
mkdir -p "$EFFECTS" "$MUSIC"

# Short effect beeps and noises
ffmpeg -y -f lavfi -i "sine=frequency=500:duration=0.1" -af "afade=t=in:ss=0:d=0.02,afade=t=out:st=0.05:d=0.04" -c:a libmp3lame -q:a 4 "$EFFECTS/pop.mp3" >/dev/null 2>&1
ffmpeg -y -f lavfi -i "sine=frequency=1200:duration=0.08" -af "afade=t=in:ss=0:d=0.01,afade=t=out:st=0.03:d=0.04" -c:a libmp3lame -q:a 4 "$EFFECTS/snap.mp3" >/dev/null 2>&1
ffmpeg -y -f lavfi -i "sine=frequency=250:duration=0.2" -af "afade=t=in:ss=0:d=0.03,afade=t=out:st=0.1:d=0.08" -c:a libmp3lame -q:a 4 "$EFFECTS/plop.mp3" >/dev/null 2>&1
ffmpeg -y -f lavfi -i "sine=frequency=300:duration=0.15" -af "afade=t=in:ss=0:d=0.02,afade=t=out:st=0.1:d=0.04" -c:a libmp3lame -q:a 4 "$EFFECTS/scoop.mp3" >/dev/null 2>&1

# Water pour (filtered noise)
ffmpeg -y -f lavfi -i "anoisesrc=a=0.05:c=pink:duration=0.6" -af "lowpass=f=600,afade=t=in:ss=0:d=0.05,afade=t=out:st=0.45:d=0.15" -c:a libmp3lame -q:a 4 "$EFFECTS/water_pour.mp3" >/dev/null 2>&1

# Rattle (burst noise)
ffmpeg -y -f lavfi -i "anoisesrc=a=0.1:c=white:duration=0.4" -af "highpass=f=300,lowpass=f=2500,volume=0.8,afade=t=in:ss=0:d=0.02,afade=t=out:st=0.3:d=0.08" -c:a libmp3lame -q:a 4 "$EFFECTS/rattle.mp3" >/dev/null 2>&1

# Bell (sine with slow decay)
ffmpeg -y -f lavfi -i "sine=frequency=880:duration=0.6" -af "afade=t=in:ss=0:d=0.01,afade=t=out:st=0.1:d=0.5" -c:a libmp3lame -q:a 4 "$EFFECTS/bell.mp3" >/dev/null 2>&1

# Drum (low sine)
ffmpeg -y -f lavfi -i "sine=frequency=100:duration=0.3" -af "afade=t=in:ss=0:d=0.01,afade=t=out:st=0.05:d=0.22" -c:a libmp3lame -q:a 4 "$EFFECTS/drum.mp3" >/dev/null 2>&1

# Success arpeggio (C-E-G)
ffmpeg -y -f lavfi -i "sine=frequency=523.25:duration=0.16" -af "afade=t=in:ss=0:d=0.02,afade=t=out:st=0.1:d=0.05" /tmp/success_c.mp3 >/dev/null 2>&1
ffmpeg -y -f lavfi -i "sine=frequency=659.25:duration=0.16" -af "afade=t=in:ss=0:d=0.02,afade=t=out:st=0.1:d=0.05" /tmp/success_e.mp3 >/dev/null 2>&1
ffmpeg -y -f lavfi -i "sine=frequency=783.99:duration=0.28" -af "afade=t=in:ss=0:d=0.02,afade=t=out:st=0.2:d=0.06" /tmp/success_g.mp3 >/dev/null 2>&1
ffmpeg -y -i "concat:/tmp/success_c.mp3|/tmp/success_e.mp3|/tmp/success_g.mp3" -c:a libmp3lame -q:a 4 "$EFFECTS/success.mp3" >/dev/null 2>&1

# Ambient soft chord pad (C-E-G)
ffmpeg -y -f lavfi -i "sine=frequency=261.63:duration=20" -f lavfi -i "sine=frequency=329.63:duration=20" -f lavfi -i "sine=frequency=392.00:duration=20" -filter_complex "[0:a][1:a][2:a]amix=inputs=3:duration=longest,afade=t=in:ss=0:d=2,afade=t=out:st=17:d=3,volume=0.25" -c:a libmp3lame -q:a 4 "$MUSIC/ambient.mp3" >/dev/null 2>&1

echo "done"
