// scenes/BubbleScene.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  useWindowDimensions,
  Animated,
  StyleSheet,
  Easing,
  Text,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Bubble from '../components/Bubble';
import ParentalLock from '../components/ParentalLock';
import MusicManager from '../utils/MusicManager';
import { useNavigation } from '@react-navigation/native';
import { playPopSound, playGiggleSound, preloadCoreSfx } from '../utils/SoundManager';

/** ---------- Tunables ---------- */

// Bigger sizes (large die fastest)
const TYPES = {
  SMALL:  { SIZE_MIN: 60,  SIZE_MAX: 76,  TTL_MIN: 9000,  TTL_MAX: 13000 },
  MEDIUM: { SIZE_MIN: 86,  SIZE_MAX: 106, TTL_MIN: 6000,  TTL_MAX: 9000  },
  LARGE:  { SIZE_MIN: 112, SIZE_MAX: 136, TTL_MIN: 4200,  TTL_MAX: 6500  },
};

// Base speed (px/sec) scaled per bubble by size for depth feel
const SPEED_MIN_BASE = 26;
const SPEED_MAX_BASE = 48;

// Base leg length (px) scaled by size
const LEG_MIN_BASE = 40;
const LEG_MAX_BASE = 120;

// Base max turn (radians) scaled by size
const MAX_TURN_BASE = Math.PI / 10; // ~18°

// Upward bias (-PI/2 = straight up)
const UP_BIAS = -Math.PI / 2;

// Density (keep as-is; separation will help)
const DENSITY_DIVISOR = 65000; // smaller → more bubbles
const COUNT_MIN = 20;
const COUNT_MAX = 48;

// Edges / separation
const MARGIN = 10;
const SOFT_WALL = 32; // a hair bigger since bubbles are bigger
const SEP_FACTOR = 0.6;
const SEP_GAIN = 0.12;
const SEP_MAX_DELTA = Math.PI / 8;
const PLACEMENT_ATTEMPTS = 30;

// Stickers (rare “surprise” bubbles)
const STICKER_PROB = 0.12;
const STICKERS = [
  require('../assets/images/animals/duck.png'),
  require('../assets/images/animals/cow.png'),
  require('../assets/images/animals/frog.png'),
  require('../assets/images/animals/sheep.png'),
  require('../assets/images/animals/horse.png'),
  require('../assets/images/animals/bunny.png'),
];

// Soft color tints (used for ring + subtle aura)
const TINTS = ['#9bd7ff', '#ffd7f2', '#ffe1a6', '#c9ffd2', '#e6ddff'];

// Combo reward tuning
const COMBO_WINDOW_MS = 1200;    // time between pops to continue combo
const COMBO_THRESHOLD  = 3;      // pops needed to trigger reward
const BOOST_MULTIPLIER = 1.25;   // speed boost during reward
const BOOST_DURATION_MS = 2500;  // how long the boost/badge last

/** ---------- Cloud background tunables ---------- */
const CLOUD_MIN_W = 140;   // px
const CLOUD_MAX_W = 280;
const CLOUD_MIN_SPD = 8;   // px/sec (horizontal drift)
const CLOUD_MAX_SPD = 16;
const CLOUD_ROWS = 5;      // how many vertical bands clouds can occupy
const CLOUD_OPACITY_MIN = 0.18;
const CLOUD_OPACITY_MAX = 0.33;

/** ---------- Helpers ---------- */
function skyColorForHour(h) {
  // night → morning → day → evening
  if (h >= 20 || h < 6)   return '#172b44';
  if (h < 10)             return '#cfe9ff';
  if (h < 17)             return '#bfe4ff';
  return '#ffd8b0';
}
const rand  = (min, max) => Math.random() * (max - min) + min;
const rint  = (min, max) => Math.floor(rand(min, max + 1));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const wrapAngle = (a) => {
  while (a >  Math.PI) a -= 2 * Math.PI;
  while (a <= -Math.PI) a += 2 * Math.PI;
  return a;
};
function randomOnscreen(width, height, size) {
  const x = clamp(rand(MARGIN, width - size - MARGIN), 0, Math.max(0, width - size));
  const y = clamp(rand(MARGIN, height - size - MARGIN), 0, Math.max(0, height - size));
  return { x, y };
}
function pickTypeWeighted() {
  const r = Math.random();
  if (r < 0.50) return 'SMALL';
  if (r < 0.85) return 'MEDIUM';
  return 'LARGE';
}

// Optional haptics (no-op if expo-haptics not installed)
let Haptics = null;
try { Haptics = require('expo-haptics'); } catch {}

// Optional sensors (no-op if expo-sensors not installed)
let Accelerometer = null;
try { Accelerometer = require('expo-sensors').Accelerometer; } catch {}

/** ---------- Soft cloud background with tilt parallax ---------- */
function CloudsBackground({ width, height, tiltX, tiltY, isNight }) {
  const count = clamp(Math.round((width * height) / 180000), 5, 10);

  const clouds = useMemo(() => {
    const rows = Math.max(1, Math.min(CLOUD_ROWS, Math.round(height / 160)));
    return Array.from({ length: count }).map((_, i) => {
      const cw = rand(CLOUD_MIN_W, CLOUD_MAX_W);
      const ch = cw * 0.6;
      const band = i % rows;
      const bandH = height / rows;
      const y = rand(band * bandH + 8, (band + 1) * bandH - ch - 8);
      const dir = Math.random() < 0.5 ? 1 : -1;
      const speed = rand(CLOUD_MIN_SPD, CLOUD_MAX_SPD) * (0.8 + (band / rows) * 0.4);
      const opacityBase = rand(CLOUD_OPACITY_MIN, CLOUD_OPACITY_MAX);
      const opacity = isNight ? opacityBase * 0.85 : opacityBase;
      const startX = dir === 1 ? -cw - rand(0, width * 0.6) : width + rand(0, width * 0.6);
      const endX   = dir === 1 ? width + cw : -cw;
      const parallax = 0.6 + (band / (rows - 1 || 1)) * 1.0; // 0.6..~1.6
      return {
        id: `cloud-${i}-${cw.toFixed(0)}`,
        cw, ch, y, speed, opacity, startX, endX, parallax,
        tx: new Animated.Value(startX),
      };
    });
  }, [width, height, count, isNight]);

  useEffect(() => {
    const stops = [];
    clouds.forEach((c) => {
      const run = () => {
        const currentX = typeof c.tx.__getValue === 'function' ? c.tx.__getValue() : c.startX;
        const dist = Math.abs(c.endX - currentX);
        const anim = Animated.timing(c.tx, {
          toValue: c.endX,
          duration: Math.max(6000, (dist / c.speed) * 1000),
          easing: Easing.linear,
          useNativeDriver: true,
        });
        anim.start(({ finished }) => {
          if (!finished) return;
          c.tx.setValue(c.startX);
          run();
        });
        stops.push(() => anim.stop());
      };
      const delay = rint(0, 2000);
      const starter = setTimeout(run, delay);
      stops.push(() => clearTimeout(starter));
    });
    return () => stops.forEach((s) => s && s());
  }, [clouds]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {clouds.map((c) => (
        <Animated.View
          key={c.id}
          style={{
            position: 'absolute',
            top: c.y,
            width: c.cw,
            height: c.ch,
            opacity: c.opacity,
            transform: [
              { translateX: c.tx },
              tiltX ? { translateX: Animated.multiply(tiltX, c.parallax) } : { translateX: 0 },
              tiltY ? { translateY: Animated.multiply(tiltY, c.parallax * 0.6) } : { translateY: 0 },
            ],
          }}
        >
          <View style={[styles.cloudBlob, { width: c.cw * 0.42, height: c.ch * 0.65, left: c.cw * 0.08, top: c.ch * 0.20 }]} />
          <View style={[styles.cloudBlob, { width: c.cw * 0.50, height: c.ch * 0.78, left: c.cw * 0.26, top: c.ch * 0.05 }]} />
          <View style={[styles.cloudBlob, { width: c.cw * 0.44, height: c.ch * 0.70, left: c.cw * 0.52, top: c.ch * 0.18 }]} />
          <View style={[styles.cloudMain, { width: c.cw, height: c.ch, top: c.ch * 0.34 }]} />
        </Animated.View>
      ))}
    </View>
  );
}

/** ---------- Memoized layers ---------- */
const BubblesLayer = React.memo(function BubblesLayer({ bubbles, tiltX, tiltY }) {
  return bubbles.map((b) => {
    const extraTransforms = [
      { translateX: Animated.multiply(tiltX, b.parallax) },
      { translateY: Animated.multiply(tiltY, b.parallax * 0.8) },
    ];
    return (
      <Bubble
        key={b.id}
        size={b.size}
        tx={b.tx}
        ty={b.ty}
        scale={b.scale}
        opacity={b.opacity}
        ringScale={b.ringScale}
        ringOpacity={b.ringOpacity}
        tint={b.tint}
        sticker={b.sticker}
        onPop={b.onPop}
        extraTransforms={extraTransforms}
      />
    );
  });
});

const ShotsLayer = React.memo(function ShotsLayer({ shots }) {
  // Passive, non-interactive layer
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {shots.map((s) => (
        <Bubble
          key={s.id}
          size={s.size}
          tx={s.tx}
          ty={s.ty}
          scale={s.scale}
          opacity={s.opacity}
          ringScale={s.ringScale}
          ringOpacity={s.ringOpacity}
          tint={s.tint}
          sticker={s.sticker}
          disabled
        />
      ))}
    </View>
  );
});

/** ---------- Scene ---------- */
export default function BubbleScene() {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();

  useEffect(() => { preloadCoreSfx(); }, []);

  // time-of-day sky
  const [skyColor, setSkyColor] = useState(() => skyColorForHour(new Date().getHours()));
  useEffect(() => {
    const id = setInterval(() => setSkyColor(skyColorForHour(new Date().getHours())), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // SFX throttles
  const lastManualPopAt = useRef(0);
  const lastAutoPopAt   = useRef(0);
  const playManualPopSfx = () => {
    const now = Date.now();
    if (now - lastManualPopAt.current > 220) {
      lastManualPopAt.current = now;
      playPopSound();
    }
  };
  const playAutoPopSfx = () => {
    const now = Date.now();
    if (now - lastAutoPopAt.current < 800) return;
    if (Math.random() < 0.25) {
      lastAutoPopAt.current = now;
      playPopSound();
    }
  };

  // Tilt parallax values (if sensors present)
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!Accelerometer) return;
    const AMP_X = 12, AMP_Y = 8;
    const smoothTo = (val, to) => {
      Animated.timing(val, { toValue: to, duration: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    };
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y }) => {
      const tx = clamp(-x * AMP_X, -AMP_X, AMP_X);
      const ty = clamp(y * AMP_Y, -AMP_Y, AMP_Y);
      smoothTo(tiltX, tx);
      smoothTo(tiltY, ty);
    });
    return () => sub && sub.remove();
  }, [tiltX, tiltY]);

  // Combo & boost state
  const [combo, setCombo] = useState(0);
  const lastPopAtRef = useRef(0);
  const boostRef = useRef(1);
  const boostTimeoutRef = useRef(null);
  const badgeScale = useRef(new Animated.Value(0.6)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const showBadge = () => {
    badgeOpacity.setValue(0);
    badgeScale.setValue(0.6);
    Animated.parallel([
      Animated.timing(badgeOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(badgeScale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 120 }),
    ]).start();
  };
  const hideBadge = () => {
    Animated.timing(badgeOpacity, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  };
  const triggerCombo = () => {
    boostRef.current = BOOST_MULTIPLIER;
    showBadge();
    try { playGiggleSound(); } catch {}
    clearTimeout(boostTimeoutRef.current);
    boostTimeoutRef.current = setTimeout(() => {
      boostRef.current = 1;
      hideBadge();
    }, BOOST_DURATION_MS);
  };

  // adaptive bubble count
  const bubbleCount = clamp(Math.round((width * height) / DENSITY_DIVISOR), COUNT_MIN, COUNT_MAX);
  const sizeGlobalMin = TYPES.SMALL.SIZE_MIN;
  const sizeGlobalMax = TYPES.LARGE.SIZE_MAX;

  // Main drifting bubbles
  const bubbles = useMemo(() => {
    return Array.from({ length: bubbleCount }).map(() => {
      const typeKey = pickTypeWeighted();
      const T = TYPES[typeKey];
      const size = rand(T.SIZE_MIN, T.SIZE_MAX);

      const tx = new Animated.Value(0);
      const ty = new Animated.Value(0);
      const scale = new Animated.Value(1);
      const opacity = new Animated.Value(1);
      const ringScale = new Animated.Value(0.8);
      const ringOpacity = new Animated.Value(0);

      const curr = { x: 0, y: 0 };

      const sizeRatio = (T.SIZE_MAX - size) / (T.SIZE_MAX - T.SIZE_MIN + 0.0001);
      const baseSpeed = rand(SPEED_MIN_BASE, SPEED_MAX_BASE);
      const speed = baseSpeed * (0.85 + sizeRatio * 0.45); // small faster, large slower
      const maxTurn = MAX_TURN_BASE * (0.9 + 0.9 * sizeRatio);
      const legFactor = 1.1 - 0.4 * sizeRatio;
      const legMin = LEG_MIN_BASE * legFactor;
      const legMax = LEG_MAX_BASE * legFactor;
      const biasGain = 0.05 + (1 - sizeRatio) * 0.02;

      const heading = UP_BIAS + rand(-Math.PI / 14, Math.PI / 14);

      const tint = TINTS[rint(0, TINTS.length - 1)];
      const sticker = Math.random() < STICKER_PROB ? STICKERS[rint(0, STICKERS.length - 1)] : null;

      const touchPadding = size >= 112 ? 36 : size >= 86 ? 28 : 20;

      const parallax = 0.35 + ((size - sizeGlobalMin) / (sizeGlobalMax - sizeGlobalMin)) * 0.85; // 0.35..~1.2

      const b = {
        id: Math.random().toString(36).slice(2),
        typeKey, size, tx, ty, scale, opacity, ringScale, ringOpacity,
        curr, speed, maxTurn, legMin, legMax, biasGain, heading,
        tint, sticker, touchPadding, parallax,
        anim: null,
        stopped: false,
        ttlTimer: null,
      };
      b.onPop = () => handleManualPop(b);
      return b;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bubbleCount]);

  useEffect(() => {
    const stopFns = [];

    const separationDelta = (b, all) => {
      let vx = 0, vy = 0;
      for (let i = 0; i < all.length; i++) {
        const n = all[i];
        if (n === b) continue;
        const dx = b.curr.x - n.curr.x;
        const dy = b.curr.y - n.curr.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= 0) continue;
        const thresh = ((b.size + n.size) * 0.5) * SEP_FACTOR;
        if (dist < thresh) {
          const w = (thresh - dist) / thresh;
          vx += (dx / (dist * dist)) * w;
          vy += (dy / (dist * dist)) * w;
        }
      }
      const mag = Math.hypot(vx, vy);
      if (mag < 1e-6) return 0;
      const away = Math.atan2(vy, vx);
      const delta = wrapAngle(away - b.heading);
      return clamp(delta, -SEP_MAX_DELTA, SEP_MAX_DELTA) * SEP_GAIN;
    };

    const softWallSteer = (b) => {
      let steer = 0;
      if (b.curr.x < SOFT_WALL) steer += Math.PI / 12;
      else if (b.curr.x > width - SOFT_WALL) steer -= Math.PI / 12;
      if (b.curr.y < SOFT_WALL) steer += Math.PI / 18;
      else if (b.curr.y > height - SOFT_WALL) steer -= Math.PI / 18;
      return steer;
    };

    const nextLeg = (b) => {
      if (b.stopped) return;

      const randTurn = rand(-b.maxTurn, b.maxTurn);
      const bias = wrapAngle(UP_BIAS - b.heading) * b.biasGain;
      const wall = softWallSteer(b);
      const sep = separationDelta(b, bubbles);
      b.heading = wrapAngle(b.heading + randTurn + bias + wall + sep);

      const leg = rand(b.legMin, b.legMax);
      const nx = clamp(b.curr.x + Math.cos(b.heading) * leg, 0, Math.max(0, width - b.size));
      const ny = clamp(b.curr.y + Math.sin(b.heading) * leg, 0, Math.max(0, height - b.size));

      const duration = clamp((leg / (b.speed * boostRef.current)) * 1000, 900, 3200);

      b.anim = Animated.parallel([
        Animated.timing(b.tx, { toValue: nx, duration, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(b.ty, { toValue: ny, duration, easing: Easing.linear, useNativeDriver: true }),
      ]);
      b.anim.start(({ finished }) => {
        if (!finished) return;
        b.curr.x = nx; b.curr.y = ny;
        nextLeg(b);
      });
    };

    const scheduleTTL = (b) => {
      const { TTL_MIN, TTL_MAX } = TYPES[b.typeKey];
      clearTimeout(b.ttlTimer);
      b.ttlTimer = setTimeout(() => autoPop(b), rint(TTL_MIN, TTL_MAX));
    };

    const autoPop = (b) => {
      if (b.stopped) return;
      b.stopped = true;
      b.anim?.stop();
      playAutoPopSfx();
      Animated.parallel([
        Animated.sequence([
          Animated.timing(b.scale, { toValue: 1.08, duration: 100, useNativeDriver: true }),
          Animated.timing(b.opacity, { toValue: 0, duration: 120, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(b.ringOpacity, { toValue: 0.45, duration: 80, useNativeDriver: true }),
          Animated.timing(b.ringScale, { toValue: 1.5, duration: 220, useNativeDriver: true }),
          Animated.timing(b.ringOpacity, { toValue: 0, duration: 110, useNativeDriver: true }),
        ]),
      ]).start(() => respawn(b));
    };

    const placeNonOverlapping = (b, placed) => {
      let p = randomOnscreen(width, height, b.size);
      let ok = false;
      for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS; attempt++) {
        ok = true;
        for (let i = 0; i < placed.length; i++) {
          const n = placed[i];
          const dx = p.x - n.curr.x;
          const dy = p.y - n.curr.y;
          const dist = Math.hypot(dx, dy);
          const thresh = ((b.size + n.size) * 0.5) * SEP_FACTOR;
          if (dist < thresh) { ok = false; break; }
        }
        if (ok) break;
        p = randomOnscreen(width, height, b.size);
      }
      b.curr.x = p.x; b.curr.y = p.y;
      b.tx.setValue(p.x);
      b.ty.setValue(p.y);
    };

    const placeAndRun = (b, placed) => {
      placeNonOverlapping(b, placed);
      b.stopped = false;
      scheduleTTL(b);
      nextLeg(b);
    };

    const respawn = (b) => {
      const T = TYPES[b.typeKey];
      b.size = rand(T.SIZE_MIN, T.SIZE_MAX);
      b.scale.setValue(1);
      b.opacity.setValue(1);
      b.ringScale.setValue(0.8);
      b.ringOpacity.setValue(0);
      b.heading = UP_BIAS + rand(-Math.PI / 14, Math.PI / 14);
      b.tint = TINTS[rint(0, TINTS.length - 1)];
      b.sticker = Math.random() < STICKER_PROB ? STICKERS[rint(0, STICKERS.length - 1)] : null;
      placeAndRun(b, bubbles);
    };

    const placed = [];
    bubbles.forEach((b) => {
      b.__stopAll = () => { b.stopped = true; b.anim?.stop(); clearTimeout(b.ttlTimer); };
      b.__respawn = () => respawn(b);
      b.__scheduleTTL = () => scheduleTTL(b);

      placeAndRun(b, placed);
      placed.push(b);
      stopFns.push(() => { b.stopped = true; b.anim?.stop(); clearTimeout(b.ttlTimer); });
    });

    return () => {
      clearTimeout(boostTimeoutRef.current);
      stopFns.forEach((fn) => fn?.());
    };
  }, [bubbles, width, height]);

  const registerPop = () => {
    try { Haptics && Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light); } catch {}
    const now = Date.now();
    if (now - lastPopAtRef.current <= COMBO_WINDOW_MS) {
      setCombo((c) => {
        const next = c + 1;
        if (c < COMBO_THRESHOLD && next >= COMBO_THRESHOLD) triggerCombo();
        return next;
      });
    } else {
      setCombo(1);
    }
    lastPopAtRef.current = now;
  };

  const handleManualPop = (b) => {
    b.__stopAll?.();
    playManualPopSfx();
    registerPop();
    Animated.parallel([
      Animated.sequence([
        Animated.timing(b.scale, { toValue: 1.15, duration: 110, useNativeDriver: true }),
        Animated.timing(b.opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(b.ringOpacity, { toValue: 0.6, duration: 80, useNativeDriver: true }),
        Animated.timing(b.ringScale, { toValue: 1.6, duration: 260, useNativeDriver: true }),
        Animated.timing(b.ringOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]),
    ]).start(() => b.__respawn?.());
  };

  const hour = new Date().getHours();
  const isNight = hour >= 20 || hour < 6;

  /** ---------- Bubble Gun (ALL state changes deferred to RAF) ---------- */
  const EMIT_EVERY_MS = 80;
  const GUN_SFX_PROB = 0.15;
  const MAX_ACTIVE_SHOTS = 28;

  const [shots, setShots] = useState([]);
  const gunActiveRef = useRef(false);
  const fingerRef = useRef({ x: width / 2, y: height / 2 });
  const lastEmitAtRef = useRef(0);
  const rafRef = useRef(null);
  const lastShotSfxAtRef = useRef(0);
  const forceImmediateRef = useRef(false); // request instant emit next RAF
  const speedRef = useRef(0);              // computed in moveGun, used by RAF for bonuses

  const spawnShot = (x, y) => {
    const size = rand(36, 58);
    const tx = new Animated.Value(x - size / 2);
    const ty = new Animated.Value(y - size / 2);
    const scale = new Animated.Value(0.85);
    const opacity = new Animated.Value(0.95);
    const ringScale = new Animated.Value(0.8);
    const ringOpacity = new Animated.Value(0);

    const id = `shot-${Math.random().toString(36).slice(2)}`;
    const tint = TINTS[rint(0, TINTS.length - 1)];
    const sticker = Math.random() < 0.06 ? STICKERS[rint(0, STICKERS.length - 1)] : null;

    const heading = UP_BIAS + rand(-Math.PI / 6, Math.PI / 6);
    const dist = rand(90, 170);
    const nx = clamp(x + Math.cos(heading) * dist - size / 2, 0, Math.max(0, width - size));
    const ny = clamp(y + Math.sin(heading) * dist - size / 2, 0, Math.max(0, height - size));
    const duration = rint(850, 1400);

    // Defer state update off any insertion phase
    requestAnimationFrame(() => {
      setShots((prev) => {
        const next = [...prev, { id, size, tx, ty, scale, opacity, ringScale, ringOpacity, tint, sticker }];
        if (next.length > MAX_ACTIVE_SHOTS) next.splice(0, next.length - MAX_ACTIVE_SHOTS);
        return next;
      });
    });

    Animated.parallel([
      Animated.timing(tx, { toValue: nx, duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(ty, { toValue: ny, duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringOpacity, { toValue: 0.45, duration: 80, useNativeDriver: true }),
          Animated.timing(ringScale, { toValue: 1.5, duration: 220, useNativeDriver: true }),
          Animated.timing(ringOpacity, { toValue: 0, duration: 110, useNativeDriver: true }),
        ]),
        Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start(() => {
        // Defer removal as well
        requestAnimationFrame(() => {
          setShots((prev) => prev.filter((s) => s.id !== id));
        });
      });

      const now = Date.now();
      if (Math.random() < GUN_SFX_PROB && now - lastShotSfxAtRef.current > 500) {
        lastShotSfxAtRef.current = now;
        try { playPopSound(); } catch {}
      }
    });
  };

  const rafLoop = () => {
    if (!gunActiveRef.current) return;
    const now = Date.now();

    if (forceImmediateRef.current || (now - lastEmitAtRef.current >= EMIT_EVERY_MS)) {
      lastEmitAtRef.current = now;
      forceImmediateRef.current = false;

      const { x, y } = fingerRef.current;
      spawnShot(x, y);

      // simple bonus when moving fast: emit a second shot
      if (speedRef.current > 1.2) {
        spawnShot(
          clamp(x + rand(-10, 10), 0, width),
          clamp(y + rand(-10, 10), 0, height)
        );
      }
    }

    rafRef.current = requestAnimationFrame(rafLoop);
  };

  const startGun = (x, y) => {
    // **No setState here**
    gunActiveRef.current = true;
    fingerRef.current = { x, y };
    lastEmitAtRef.current = 0;
    forceImmediateRef.current = true; // get one right away on next frame

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(rafLoop);
  };

  const moveGun = (x, y) => {
    // **No setState here**
    const prev = fingerRef.current;
    const dt = Math.max(1, Date.now() - (moveGun._lastT || 0));
    const v = Math.hypot(x - prev.x, y - prev.y) / dt;
    speedRef.current = v;
    moveGun._lastT = Date.now();
    fingerRef.current = { x, y };
  };

  const stopGun = () => {
    gunActiveRef.current = false;
    speedRef.current = 0;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // Long press + pan gesture on JS thread; callbacks only touch refs.
  const longPress = Gesture.LongPress()
    .runOnJS(true)
    .minDuration(200)
    .maxDistance(9999)
    .shouldCancelWhenOutside(false)
    .onStart((e) => startGun(e.x, e.y))
    .onEnd(() => stopGun())
    .onFinalize(() => stopGun());

  const pan = Gesture.Pan()
    .runOnJS(true)
    .shouldCancelWhenOutside(false)
    .onBegin((e) => moveGun(e.x, e.y))
    .onUpdate((e) => moveGun(e.x, e.y))
    .onEnd(() => stopGun())
    .onFinalize(() => stopGun());

  const gesture = Gesture.Simultaneous(longPress, pan);

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.container, { backgroundColor: skyColor }]} removeClippedSubviews>
        <MusicManager />

        {/* Clouds background (behind bubbles) with tilt parallax */}
        <CloudsBackground
          width={width}
          height={height}
          tiltX={tiltX}
          tiltY={tiltY}
          isNight={isNight}
        />

        {/* Gun shots (passive layer) */}
        <ShotsLayer shots={shots} />

        {/* Main drifting bubbles */}
        <BubblesLayer bubbles={bubbles} tiltX={tiltX} tiltY={tiltY} />

        {/* Centered Yay badge OVERLAY */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.badgeOverlay,
            { opacity: badgeOpacity, transform: [{ scale: badgeScale }] },
          ]}
        >
          <Text style={styles.badgeText}>⭐ Yay!</Text>
        </Animated.View>

        <ParentalLock onUnlock={() => navigation.navigate('ParentalArea')} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Cloud pieces
  cloudBlob: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 9999,
    shadowColor: '#ffffff',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
  },
  cloudMain: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 9999,
  },

  // Full-screen overlay centered
  badgeOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 48,
    fontWeight: '800',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 28,
    color: '#333',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
});












