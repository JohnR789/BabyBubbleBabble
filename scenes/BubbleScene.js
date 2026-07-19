// scenes/BubbleScene.js
/* eslint-disable react-native/no-inline-styles */
// The legacy Bubble Garden uses many dynamic, animation-driven inline styles.
// It is scheduled for a full rewrite onto the design system in a future scene pass.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  useWindowDimensions,
  Animated,
  StyleSheet,
  Easing,
  Text,
  InteractionManager,
  UIManager,
  AppState,
  AccessibilityInfo,
  Platform,
  PixelRatio,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

import Bubble from '../components/Bubble';
import SceneShell from '../components/SceneShell';
import { playPopSound } from '../utils/SoundManager';
import { IMAGES } from '../assets';

/** ------------------------------------------------------------------
 *  Optional native deps (only render if the native view manager exists)
 *  ------------------------------------------------------------------ */
// expo-linear-gradient
let LinearGradient = null;
let HAS_EXPO_LINEAR_GRADIENT = false;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
  HAS_EXPO_LINEAR_GRADIENT = !!UIManager.getViewManagerConfig?.('ExpoLinearGradient');
} catch { /* noop */ }

// react-native-svg
let SvgPkg = null;
let Svg, Defs, RadialGradient, Stop, Rect, Path, SvgLinearGradient; // <-- alias name here
let HAS_RNSVG = false;
try {
  SvgPkg = require('react-native-svg');
  ({ Svg, Defs, RadialGradient, Stop, Rect, Path, LinearGradient: SvgLinearGradient } = SvgPkg); // <-- alias assignment
  HAS_RNSVG =
    !!UIManager.getViewManagerConfig?.('RNSVGSvgView') &&
    !!UIManager.getViewManagerConfig?.('RNSVGRadialGradient');
} catch { /* noop */ }

// Optional haptics (no-op if not installed)
let Haptics = null;
try { Haptics = require('expo-haptics'); } catch { /* noop */ }

// Optional sensors (no-op if not installed)
let Accelerometer = null;
try { Accelerometer = require('expo-sensors').Accelerometer; } catch { /* noop */ }

/** ------------------ Infant/Toddler Safety Defaults -----------------
 *  - soft color palettes, no hard flashes (>3Hz), no aggressive strobe
 *  - gentle animation curves; no sudden large deltas frame-to-frame
 *  ------------------------------------------------------------------ */

/** ---------------------------- Helpers ----------------------------- */
const rand  = (min, max) => Math.random() * (max - min) + min;
const rint  = (min, max) => Math.floor(rand(min, max + 1));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const wrapAngle = (a) => {
  while (a >  Math.PI) a -= 2 * Math.PI;
  while (a <= -Math.PI) a += 2 * Math.PI;
  return a;
};

/** ------------------ Gentle time-of-day palettes ------------------- */
function skyPaletteForT(t /* 0..1 day fraction */) {
  if (t < 0.25) { // night
    return ['#06102a', '#0b1d3a', '#1f3a6b'];
  } else if (t < 0.375) { // morning
    return ['#8fc9ff', '#cfe9ff', '#eef8ff'];
  } else if (t < 0.75) { // day
    return ['#5cb8ff', '#a9dcff', '#e7f5ff'];
  } else if (t < 0.9) { // evening
    return ['#ff8f5f', '#ffbe88', '#ffe8c9'];
  }
  return ['#06102a', '#0b1d3a', '#1f3a6b']; // late night
}
const isNightFromT = (t) => (t < 0.25) || (t >= 0.9);

function dayFraction() {
  const d = new Date();
  const minutes = d.getHours() * 60 + d.getMinutes();
  return minutes / (24 * 60);
}

/** ---------------------------- Tunables ---------------------------- */
const TYPES = {
  SMALL:  { SIZE_MIN: 60,  SIZE_MAX: 76,  TTL_MIN: 9000,  TTL_MAX: 13000 },
  MEDIUM: { SIZE_MIN: 86,  SIZE_MAX: 106, TTL_MIN: 6500,  TTL_MAX: 9500  },
  LARGE:  { SIZE_MIN: 112, SIZE_MAX: 136, TTL_MIN: 4500,  TTL_MAX: 7000  },
};
const SPEED_MIN_BASE = 26;
const SPEED_MAX_BASE = 48;
const LEG_MIN_BASE = 40;
const LEG_MAX_BASE = 120;
const MAX_TURN_BASE = Math.PI / 10;
const UP_BIAS = -Math.PI / 2;

const STICKER_PROB = 0.12;
const STICKERS = [
  IMAGES.animals.duck,
  IMAGES.animals.cow,
  IMAGES.animals.frog,
  IMAGES.animals.sheep,
  IMAGES.animals.horse,
  IMAGES.animals.bunny,
];

const TINTS = ['#9bd7ff', '#ffd7f2', '#ffe1a6', '#c9ffd2', '#e6ddff'];

const COMBO_WINDOW_MS = 1200;
const COMBO_THRESHOLD  = 3;
const BOOST_MULTIPLIER = 1.25;
const BOOST_DURATION_MS = 2500;

const GOLD_TINT = '#ffd24a';
const DEV_MORE_JACKPOTS = false;
const JACKPOT_PROB = DEV_MORE_JACKPOTS ? 0.20 : 0.02;

const CLOUD_MIN_W = 140;
const CLOUD_MAX_W = 280;
const CLOUD_MIN_SPD = 8;
const CLOUD_MAX_SPD = 16;
const CLOUD_ROWS = 5;
const CLOUD_OPACITY_MIN = 0.18;
const CLOUD_OPACITY_MAX = 0.33;
const CLOUD_BOB_RANGE = 6;
const CLOUD_BOB_MS = 4500;

const STARS_MIN = 28;
const STARS_MAX = 52;

const MARGIN = 10;
const SOFT_WALL = 32;
const SEP_FACTOR = 0.6;
const SEP_GAIN = 0.12;
const SEP_MAX_DELTA = Math.PI / 8;
const PLACEMENT_ATTEMPTS = 30;

const SHOOTING_STAR_EVERY_MS = 15000;

/** --------------------- Quality/Density Preset --------------------- */
function autoDensityDivisor(width, height) {
  const area = width * height;
  const pr = PixelRatio.get();
  const base = 65000;
  const prPenalty = pr > 3 ? 1.25 : pr > 2.5 ? 1.15 : pr > 2 ? 1.07 : 1.0;
  const areaPenalty = area > 3.5e6 ? 1.2 : area > 2.6e6 ? 1.1 : 1.0;
  return Math.round(base * prPenalty * areaPenalty);
}

/** ------------------------ Accessibility --------------------------- */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled?.().then((v) => mounted && setReduced(!!v)).catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReduced);
    return () => sub?.remove?.();
  }, []);
  return reduced;
}

/** ---------------------- Gradient w/ Crossfade --------------------- */
function SkyGradientCrossfade({ width, height, t }) {
  const paletteARef = useRef(skyPaletteForT(t));
  const paletteBRef = useRef(skyPaletteForT(t));
  const fade = useRef(new Animated.Value(1)).current; // 1 = A, 0 = B
  const lastPhaseRef = useRef(null);

  const phase = t < 0.25 ? 'night'
    : t < 0.375 ? 'morning'
    : t < 0.75 ? 'day'
    : t < 0.9 ? 'evening'
    : 'night2';

  useEffect(() => {
    if (lastPhaseRef.current == null) {
      lastPhaseRef.current = phase;
      paletteARef.current = skyPaletteForT(t);
      paletteBRef.current = paletteARef.current;
      fade.setValue(1);
      return;
    }
    if (lastPhaseRef.current !== phase) {
      paletteBRef.current = skyPaletteForT(t);
      Animated.timing(fade, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start(() => {
        paletteARef.current = paletteBRef.current;
        fade.setValue(1);
        lastPhaseRef.current = phase;
      });
    }
  }, [phase, t, fade]);

  const A = paletteARef.current;
  const B = paletteBRef.current;

  if (!(LinearGradient && HAS_EXPO_LINEAR_GRADIENT)) {
    const colors = skyPaletteForT(t);
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors[1] }]} />
        <View style={{ position: 'absolute', top: 0, height: height * 0.55, left: 0, right: 0, backgroundColor: colors[0], opacity: 0.8 }} />
        <View style={{ position: 'absolute', bottom: 0, height: height * 0.45, left: 0, right: 0, backgroundColor: colors[2], opacity: 0.8 }} />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}>
        <LinearGradient
          colors={A}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: Animated.subtract(1, fade) }]}>
        <LinearGradient
          colors={B}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/** --------------------------- Horizon Haze ------------------------- */
function HorizonHaze({ width, height, isNight }) {
  const top = isNight ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.20)';
  const mid = isNight ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.12)';
  const bot = 'rgba(255,255,255,0.00)';
  const hazeHeight = Math.min(300, height * 0.38);
  if (LinearGradient && HAS_EXPO_LINEAR_GRADIENT) {
    return (
      <LinearGradient
        colors={[bot, mid, top]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: hazeHeight }}
        pointerEvents="none"
      />
    );
  }
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: hazeHeight, backgroundColor: top, opacity: 0.45 }} />
  );
}

/** --------------------------- Vignette ----------------------------- */
function VignetteOverlay({ width, height }) {
  if (Svg && HAS_RNSVG) {
    return (
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          <RadialGradient id="vig" cx="50%" cy="50%" r="65%">
            <Stop offset="58%" stopColor="rgba(0,0,0,0)" />
            <Stop offset="100%" stopColor="rgba(0,0,0,0.14)" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#vig)" />
      </Svg>
    );
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 70, backgroundColor: 'rgba(0,0,0,0.12)' }} />
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: 'rgba(0,0,0,0.12)' }} />
      <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 26, backgroundColor: 'rgba(0,0,0,0.10)' }} />
      <View style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 26, backgroundColor: 'rgba(0,0,0,0.10)' }} />
    </View>
  );
}

/** ---------------------- Sun Bloom + God Rays ---------------------- */
function SunBloomAndRays({ size, rot, isNight }) {
  if (!(Svg && HAS_RNSVG) || isNight) return null;

  const w = size * 3.2;
  const h = size * 3.2;
  const cx = w / 2;
  const cy = h / 2;

  const RAY_COUNT = 12;
  const rayLen = size * 1.9;
  const rayW = Math.max(2, Math.floor(size * 0.06));

  return (
    <Animated.View style={{ position: 'absolute', left: -w * 0.45, top: -h * 0.45, width: w, height: h, transform: [{ rotate: rot }] }} pointerEvents="none">
      <Svg width={w} height={h}>
        <Defs>
          <RadialGradient id="sunBloom" cx="50%" cy="50%" r="55%">
            <Stop offset="0%" stopColor="rgba(255,240,170,0.55)" />
            <Stop offset="60%" stopColor="rgba(255,240,170,0.22)" />
            <Stop offset="100%" stopColor="rgba(255,240,170,0.00)" />
          </RadialGradient>
          <SvgLinearGradient id="rayGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="rgba(255,230,150,0.28)" />
            <Stop offset="80%" stopColor="rgba(255,230,150,0.0)" />
          </SvgLinearGradient>
        </Defs>

        <Rect x={0} y={0} width={w} height={h} fill="url(#sunBloom)" />

        {Array.from({ length: RAY_COUNT }).map((_, i) => {
          const angle = (360 / RAY_COUNT) * i;
          const x = cx - rayW / 2;
          const y = cy - rayLen;
          return (
            <Rect
              key={`ray-${i}`}
              x={x}
              y={y}
              width={rayW}
              height={rayLen}
              fill="url(#rayGrad)"
              transform={`rotate(${angle} ${cx} ${cy})`}
              rx={rayW / 2}
            />
          );
        })}
      </Svg>
    </Animated.View>
  );
}

/** --------------------------- Sun / Moon --------------------------- */
function SunMoon({ width, height, t, tiltX, tiltY, isNight, paused, reducedMotion }) {
  const yTarget = isNight ? height * 0.18 : height * 0.22;

  const drift  = useRef(new Animated.Value(0)).current;
  const spin   = useRef(new Animated.Value(0)).current;
  const yPos   = useRef(new Animated.Value(yTarget)).current;

  const driftLoopRef = useRef(null);
  const spinLoopRef  = useRef(null);

  useEffect(() => {
    Animated.timing(yPos, { toValue: yTarget, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start();
  }, [yTarget, yPos]);

  const startLoops = useCallback(() => {
    if (!driftLoopRef.current) {
      drift.setValue(0);
      driftLoopRef.current = Animated.loop(
        Animated.timing(drift, {
          toValue: 1,
          duration: reducedMotion ? 120000 : 60000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      driftLoopRef.current.start();
    }
    if (!spinLoopRef.current) {
      spin.setValue(0);
      spinLoopRef.current = Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: reducedMotion ? 16000 : 9000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinLoopRef.current.start();
    }
  }, [drift, spin, reducedMotion]);

  const stopLoops = useCallback(() => {
    driftLoopRef.current?.stop?.(); driftLoopRef.current = null;
    spinLoopRef.current?.stop?.();  spinLoopRef.current = null;
  }, []);

  useEffect(() => {
    if (paused) { stopLoops(); }
    else { startLoops(); }
    return () => stopLoops();
  }, [paused, startLoops, stopLoops]);

  const xTravel = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.2, width * 1.2],
  });

  const rot = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const size = isNight ? 40 : 72 * (PixelRatio.get() >= 3 ? 1.05 : 1.0);
  const glow = isNight ? 'rgba(255,255,255,0.18)' : 'rgba(255,236,170,0.42)';
  const core = isNight ? '#ffffff' : '#ffe27a';

  const transforms = [{ translateX: xTravel }, { translateY: yPos }];
  if (tiltX) transforms.push({ translateX: Animated.multiply(tiltX, 0.5) });
  if (tiltY) transforms.push({ translateY: Animated.multiply(tiltY, 0.4) });

  const flares = isNight || reducedMotion ? [] : [0.0, 0.25, 0.5, 0.75].map((step, i) => ({
    key: `flare-${i}`,
    left: size * (1 + step * 3.2),
    top: size * (-0.2 - step * 0.35),
    r: Math.max(2, 6 - i * 1.2),
    opacity: 0.15 - i * 0.02,
  }));

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: transforms }]}>
      <SunBloomAndRays size={size} rot={rot} isNight={isNight} />

      {/* Glow */}
      <View style={{
        position: 'absolute',
        left: -size * 0.7,
        top: -size * 0.7,
        width: size * 2.4,
        height: size * 2.4,
        borderRadius: size * 1.2,
        backgroundColor: glow,
      }} />

      {/* Core */}
      <View style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: core,
      }} />

      {/* Lens flare (day only) */}
      {flares.map((f) => (
        <View
          key={f.key}
          style={{
            position: 'absolute',
            left: f.left,
            top: f.top,
            width: f.r * 2,
            height: f.r * 2,
            borderRadius: f.r,
            backgroundColor: 'rgba(255,255,255,1)',
            opacity: f.opacity,
          }}
        />
      ))}
    </Animated.View>
  );
}

/** --------------------------- Stars Layer -------------------------- */
function StarsLayer({ width, height, isNight, paused, reducedMotion }) {
  const starCount = clamp(Math.round((width * height) / 28000), STARS_MIN, STARS_MAX + 18);
  const [stars, setStars] = useState([]);
  const [shooting, setShooting] = useState(null);

  // Build stars when night or size changes
  useEffect(() => {
    if (!isNight) { setStars([]); return; }
    const arr = Array.from({ length: starCount }).map((_, i) => {
      const x = rint(0, Math.max(0, width - 2));
      const y = rint(0, Math.max(0, Math.floor(height * 0.55)));
      const size = rand(1.0, 2.6) * (PixelRatio.get() >= 3 ? 1.1 : 1.0);
      const hue = Math.random() < 0.25 ? 'rgba(255,230,200,1)' : Math.random() < 0.5 ? 'rgba(200,220,255,1)' : 'white';
      const opacity = new Animated.Value(rand(0.35, 0.95));
      return { id: `star-${i}-${x}-${y}`, x, y, size, color: hue, opacity };
    });
    setStars(arr);
  }, [isNight, width, height, starCount]);

  // Twinkle loops
  useEffect(() => {
    if (!isNight || paused) return;
    const stops = stars.map(s => {
      const loop = () => {
        Animated.sequence([
          Animated.timing(s.opacity, { toValue: rand(0.15, 0.35), duration: rint(700, 1200), easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(s.opacity, { toValue: rand(0.7, 1.0),  duration: rint(800, 1500), easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]).start(() => loop());
      };
      const t = setTimeout(loop, rint(0, 1200));
      return () => clearTimeout(t);
    });
    return () => stops.forEach(fn => fn());
  }, [stars, isNight, paused]);

  // Shooting star
  useEffect(() => {
    if (!isNight || paused) return;
    let timer = null;
    const spawn = () => {
      const id = `shoot-${Date.now()}`;
      const startX = rint(-50, width * 0.3);
      const startY = rint(30, height * 0.25);
      const endX = startX + width * 0.8;
      const endY = startY + height * 0.25;
      const tx = new Animated.Value(startX);
      const ty = new Animated.Value(startY);
      const opacity = new Animated.Value(1);
      setShooting({ id, tx, ty, opacity });

      Animated.parallel([
        Animated.timing(tx, { toValue: endX, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(ty, { toValue: endY, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start(() => setShooting(null));
    };
    const arm = () => { timer = setTimeout(() => { spawn(); arm(); }, rint(SHOOTING_STAR_EVERY_MS * 0.6, SHOOTING_STAR_EVERY_MS * 1.4)); };
    arm();
    return () => clearTimeout(timer);
  }, [isNight, paused, width, height]);

  if (!isNight) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((s) => (
        <Animated.View
          key={s.id}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.size,
            height: s.size,
            borderRadius: s.size / 2,
            backgroundColor: s.color,
            opacity: s.opacity,
          }}
        />
      ))}
      {shooting ? (
        <Animated.View
          style={{
            position: 'absolute',
            transform: [{ translateX: shooting.tx }, { translateY: shooting.ty }],
            width: 80, height: 2, borderRadius: 1,
            backgroundColor: 'white', opacity: shooting.opacity,
          }}
        />
      ) : null}
    </View>
  );
}

function makeClouds(count, depth, width, height, isNight, reducedMotion) {
  const rows = Math.max(1, Math.min(CLOUD_ROWS, Math.round(height / 160)));
  return Array.from({ length: count }).map((_, i) => {
    const cw = rand(CLOUD_MIN_W * (depth === 'back' ? 1.2 : 0.9), CLOUD_MAX_W * (depth === 'back' ? 1.4 : 1.05));
    const ch = cw * 0.6;
    const band = i % rows;
    const bandH = height / rows;
    const y = rand(band * bandH + 8, (band + 1) * bandH - ch - 8);
    const dir = Math.random() < 0.5 ? 1 : -1;
    const speedScale = depth === 'back' ? 0.6 : 1.0;
    const speed = rand(CLOUD_MIN_SPD, CLOUD_MAX_SPD) * speedScale * (0.75 + (band / rows) * 0.4);
    const opacityBase = rand(CLOUD_OPACITY_MIN, CLOUD_OPACITY_MAX) * (depth === 'back' ? 0.75 : 1);
    const opacity = isNight ? opacityBase * 0.85 : opacityBase;
    const startX = dir === 1 ? -cw - rand(0, width * 0.7) : width + rand(0, width * 0.7);
    const endX   = dir === 1 ? width + cw : -cw;
    const parallax = (depth === 'back' ? 0.45 : 0.9) + (band / (rows - 1 || 1)) * (depth === 'back' ? 0.5 : 0.8);
    const tx = new Animated.Value(startX);
    const bob = new Animated.Value(0);

    const bobMs = reducedMotion ? CLOUD_BOB_MS * 1.6 : CLOUD_BOB_MS;
    const bobRange = reducedMotion ? CLOUD_BOB_RANGE * 0.6 : CLOUD_BOB_RANGE;

    const up = Animated.timing(bob, { toValue: -bobRange, duration: bobMs, easing: Easing.inOut(Easing.quad), useNativeDriver: true });
    const down = Animated.timing(bob, { toValue:  bobRange, duration: bobMs, easing: Easing.inOut(Easing.quad), useNativeDriver: true });
    const loop = Animated.loop(Animated.sequence([up, down]));

    return {
      id: `cloud-${depth}-${i}-${cw.toFixed(0)}`,
      cw, ch, y, speed, opacity, startX, endX, parallax, tx, bob, depth,
      loopStart: () => loop.start(),
      loopStop:  () => loop.stop(),
      _loop: loop,
    };
  });
}

/** ----------------------- Clouds (2-layer parallax) ---------------- */
function CloudsBackground({ width, height, tiltX, tiltY, isNight, paused, reducedMotion }) {
  const baseCount = clamp(Math.round((width * height) / 180000), 5, 10);
  const backCount = Math.max(2, Math.floor(baseCount * 0.6));
  const frontCount = baseCount;

  const backClouds  = useMemo(() => makeClouds(backCount, 'back', width, height, isNight, reducedMotion),  [width, height, backCount, isNight, reducedMotion]);
  const frontClouds = useMemo(() => makeClouds(frontCount, 'front', width, height, isNight, reducedMotion), [width, height, frontCount, isNight, reducedMotion]);

  useEffect(() => {
    const all = [...backClouds, ...frontClouds];
    if (!paused) all.forEach(c => c.loopStart());
    return () => all.forEach(c => c.loopStop());
  }, [paused, backClouds, frontClouds]);

  useEffect(() => {
    if (paused) return;
    const all = [...backClouds, ...frontClouds];
    const stops = [];

    all.forEach((c) => {
      const run = () => {
        const currentX = typeof c.tx.__getValue === 'function' ? c.tx.__getValue() : c.startX;
        const dist = Math.abs(c.endX - currentX);
        const duration = Math.max(8000, (dist / c.speed) * 1000);
        const anim = Animated.timing(c.tx, {
          toValue: c.endX,
          duration: reducedMotion ? duration * 1.3 : duration,
          easing: Easing.linear,
          useNativeDriver: true,
        });
        anim.start(({ finished }) => {
          if (!finished) return;
          c.tx.setValue(c.startX);
          if (!paused) run();
        });
        stops.push(() => anim.stop());
      };
      const delay = rint(0, 1800);
      const starter = setTimeout(() => !paused && run(), delay);
      stops.push(() => clearTimeout(starter));
    });

    return () => { stops.forEach((s) => s && s()); };
  }, [paused, backClouds, frontClouds, reducedMotion]);

  const renderCloud = (c) => {
    const transforms = [{ translateX: c.tx }, { translateY: c.bob }];
    if (tiltX) transforms.push({ translateX: Animated.multiply(tiltX, c.parallax) });
    if (tiltY) transforms.push({ translateY: Animated.multiply(tiltY, c.parallax * 0.6) });

    const bodyTint = isNight ? 'rgba(255,255,255,0.92)' : '#ffffff';

    return (
      <Animated.View
        key={c.id}
        style={{
          position: 'absolute',
          top: c.y,
          width: c.cw,
          height: c.ch,
          opacity: c.opacity,
          transform: transforms,
        }}
      >
        {/* layered blobs for puff volume */}
        <View style={[styles.cloudBlob, { backgroundColor: bodyTint, width: c.cw * 0.42, height: c.ch * 0.65, left: c.cw * 0.06, top: c.ch * 0.22 }]} />
        <View style={[styles.cloudBlob, { backgroundColor: bodyTint, width: c.cw * 0.54, height: c.ch * 0.80, left: c.cw * 0.23, top: c.ch * 0.04 }]} />
        <View style={[styles.cloudBlob, { backgroundColor: bodyTint, width: c.cw * 0.46, height: c.ch * 0.72, left: c.cw * 0.52, top: c.ch * 0.18 }]} />
        <View style={[styles.cloudMain, { backgroundColor: bodyTint, width: c.cw, height: c.ch, top: c.ch * 0.36 }]} />
        {/* highlight/shadow for volume (gentle) */}
        <View style={{ position: 'absolute', left: 0, right: 0, top: c.ch * 0.1, height: c.ch * 0.35, backgroundColor: 'rgba(255,255,255,0.32)', borderTopLeftRadius: 9999, borderTopRightRadius: 9999, opacity: isNight ? 0.18 : 0.26 }} />
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: c.ch * 0.1, height: c.ch * 0.35, backgroundColor: 'rgba(0,0,0,0.06)', borderBottomLeftRadius: 9999, borderBottomRightRadius: 9999, opacity: isNight ? 0.06 : 0.08 }} />
      </Animated.View>
    );
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {backClouds.map(renderCloud)}
      {frontClouds.map(renderCloud)}
    </View>
  );
}

/** ---------------------- Distant Hills (parallax) ------------------ */
function DistantHills({ width, height, tiltX, tiltY, isNight }) {
  if (!(Svg && HAS_RNSVG)) return null;

  const near = isNight ? '#0e2b4f' : '#3d6e5a';
  const mid  = isNight ? '#0b2241' : '#6b8fa1';
  const far  = isNight ? '#081a33' : '#98b6cc';

  const baseY = height * 0.80;
  const ampFar = height * 0.04;
  const ampMid = height * 0.06;
  const ampNear = height * 0.08;

  const makeRand = (seed) => { let s = seed; return () => { const x = Math.sin(s++) * 10000; return x - Math.floor(x); }; };

  const buildPolyPath = (segments, amp, seedOffset) => {
    const rnd = makeRand(1234 + seedOffset);
    const step = width / segments;
    let d = `M 0 ${baseY}`;
    for (let i = 1; i <= segments; i++) {
      const x = step * i;
      const y = baseY - (amp * (0.25 + rnd() * 0.75));
      d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    d += ` L ${width} ${height} L 0 ${height} Z`;
    return d;
  };

  const makeParallax = (p) => ([
    { translateX: tiltX ? Animated.multiply(tiltX, p) : 0 },
    { translateY: tiltY ? Animated.multiply(tiltY, p * 0.5) : 0 },
  ]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: makeParallax(0.25), opacity: isNight ? 0.45 : 0.35 }]}>
        <Svg width={width} height={height}>
          <Path d={buildPolyPath(7, ampFar, 1)} fill={far} />
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, { transform: makeParallax(0.45), opacity: isNight ? 0.55 : 0.5 }]}>
        <Svg width={width} height={height}>
          <Path d={buildPolyPath(8, ampMid, 2)} fill={mid} />
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, { transform: makeParallax(0.7), opacity: isNight ? 0.75 : 0.8 }]}>
        <Svg width={width} height={height}>
          <Path d={buildPolyPath(9, ampNear, 3)} fill={near} />
          </Svg>
    </Animated.View>
  </View>
  );
}

/** ------------------------- Drag stream overlay ---------------------- */
const ShotsLayer = React.memo(function ShotsLayer({ shots }) {
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
          onPop={() => {}}
        />
      ))}
    </View>
  );
});

/** =============================== Scene ============================ */
export default function BubbleScene() {

  const { width, height } = useWindowDimensions();

  const reducedMotion = useReducedMotion();

  const [paused, setPaused] = useState(false);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    const onChange = (state) => {
      appStateRef.current = state;
      setPaused(state !== 'active');
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setPaused(appStateRef.current !== 'active' ? true : false);
      return () => setPaused(true);
    }, [])
  );

  const [t, setT] = useState(dayFraction());
  useEffect(() => {
    const id = setInterval(() => setT(dayFraction()), 60 * 1000);
    return () => clearInterval(id);
  }, []);
  const isNight = isNightFromT(t);

  const [skyColor, setSkyColor] = useState(() => {
    const p = skyPaletteForT(t);
    return p[1];
  });
  useEffect(() => {
    const p = skyPaletteForT(t);
    setSkyColor(p[1]);
  }, [t]);

  const lastManualPopAt = useRef(0);
  const lastAutoPopAt   = useRef(0);
  const playManualPopSfx = () => {
    const now = Date.now();
    if (now - lastManualPopAt.current > 220) {
      lastManualPopAt.current = now;
      try { playPopSound(); } catch {}
    }
  };
  const playAutoPopSfx = () => {
    const now = Date.now();
    if (now - lastAutoPopAt.current < 800) return;
    if (Math.random() < 0.25) {
      lastAutoPopAt.current = now;
      try { playPopSound(); } catch {}
    }
  };

  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!Accelerometer) return;
    const AMP_X = reducedMotion ? 8 : 12;
    const AMP_Y = reducedMotion ? 5 : 8;
    const smoothTo = (val, to) => {
      Animated.timing(val, { toValue: to, duration: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    };
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y }) => {
      if (paused) return;
      const tx = clamp(-x * AMP_X, -AMP_X, AMP_X);
      const ty = clamp(y * AMP_Y, -AMP_Y, AMP_Y);
      smoothTo(tiltX, tx);
      smoothTo(tiltY, ty);
    });
    return () => sub && sub.remove();
  }, [tiltX, tiltY, paused, reducedMotion]);

  const comboRef = useRef(0);
  const lastPopAtRef = useRef(0);
  const boostRef = useRef(1);
  const boostTimeoutRef = useRef(null);
  const badgeScale = useRef(new Animated.Value(0.6)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;

  const showBadge = useCallback(() => {
    badgeOpacity.setValue(0);
    badgeScale.setValue(0.6);
    Animated.parallel([
      Animated.timing(badgeOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(badgeScale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 120 }),
    ]).start();
  }, [badgeOpacity, badgeScale]);

  const hideBadge = useCallback(() => {
    Animated.timing(badgeOpacity, { toValue: 0, duration: 220, useNativeDriver: true }).start();
  }, [badgeOpacity]);

  const triggerCombo = useCallback(() => {
    boostRef.current = BOOST_MULTIPLIER;
    showBadge();
    clearTimeout(boostTimeoutRef.current);
    boostTimeoutRef.current = setTimeout(() => {
      boostRef.current = 1;
      hideBadge();
    }, BOOST_DURATION_MS);
  }, [hideBadge, showBadge]);

  const DENSITY_DIVISOR = autoDensityDivisor(width, height);
  const COUNT_MIN = 20;
  const COUNT_MAX = 48;
  const bubbleCount = clamp(Math.round((width * height) / DENSITY_DIVISOR), COUNT_MIN, COUNT_MAX);
  const sizeGlobalMin = TYPES.SMALL.SIZE_MIN;
  const sizeGlobalMax = TYPES.LARGE.SIZE_MAX;

  const [confetti, setConfetti] = useState([]);
  const sprayConfetti = useCallback((cx, cy, count = 12) => {
    const items = Array.from({ length: count }).map((_, i) => {
      const id = `conf-${Date.now()}-${i}`;
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 50;
      const tx = new Animated.Value(cx);
      const ty = new Animated.Value(cy);
      const opacity = new Animated.Value(1);
      const duration = 500 + Math.random() * 450;

      Animated.parallel([
        Animated.timing(tx, { toValue: cx + Math.cos(angle) * dist, duration, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(ty, { toValue: cy + Math.sin(angle) * dist, duration, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.timing(opacity, { toValue: 0, duration: duration + 150, useNativeDriver: true, easing: Easing.linear }),
      ]).start(() => {
        InteractionManager.runAfterInteractions(() => {
          requestAnimationFrame(() => {
            setConfetti((prev) => prev.filter((c) => c.id !== id));
          });
        });
      });

      return { id, tx, ty, opacity, size: 6 + Math.random() * 6, tint: TINTS[rint(0, TINTS.length - 1)] };
    });

    setConfetti((prev) => [...prev, ...items]);
  }, []);

  function startGlow(b) {
    if (!b.glowScale || !b.glowOpacity) return;
    b.__glowStop && b.__glowStop();
    b.glowScale.setValue(1.0);
    b.glowOpacity.setValue(0.35);
    const up = Animated.parallel([
      Animated.timing(b.glowScale,  { toValue: 1.15, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(b.glowOpacity,{ toValue: 0.55, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]);
    const down = Animated.parallel([
      Animated.timing(b.glowScale,  { toValue: 1.0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(b.glowOpacity,{ toValue: 0.35, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]);
    const loop = Animated.loop(Animated.sequence([up, down]));
    loop.start();
    b.__glowStop = () => loop.stop();
  }

  const bubbles = useMemo(() => {
    return Array.from({ length: bubbleCount }).map(() => {
      const typeKey = (Math.random() < 0.50) ? 'SMALL' : (Math.random() < 0.7 ? 'MEDIUM' : 'LARGE');
      const T = TYPES[typeKey];
      const size = rand(T.SIZE_MIN, T.SIZE_MAX);

      const curr = { x: 0, y: 0 };
      const sizeRatio = (T.SIZE_MAX - size) / (T.SIZE_MAX - T.SIZE_MIN + 0.0001);
      const baseSpeed = rand(SPEED_MIN_BASE, SPEED_MAX_BASE);
      const speed = baseSpeed * (0.85 + sizeRatio * 0.45);
      const maxTurn = MAX_TURN_BASE * (0.9 + 0.9 * sizeRatio);
      const legFactor = 1.1 - 0.4 * sizeRatio;
      const legMin = LEG_MIN_BASE * legFactor;
      const legMax = LEG_MAX_BASE * legFactor;
      const biasGain = 0.05 + (1 - sizeRatio) * 0.02;
      const heading = UP_BIAS + rand(-Math.PI / 14, Math.PI / 14);

      const baseTint = TINTS[rint(0, TINTS.length - 1)];
      const isJackpot = Math.random() < JACKPOT_PROB;
      const tint = isJackpot ? GOLD_TINT : baseTint;

      const tx = new Animated.Value(0);
      const ty = new Animated.Value(0);
      const scale = new Animated.Value(1);
      const opacity = new Animated.Value(1);
      const ringScale = new Animated.Value(isJackpot ? 1.05 : 0.8);
      const ringOpacity = new Animated.Value(isJackpot ? 0.45 : 0);

      const sticker = Math.random() < STICKER_PROB ? STICKERS[rint(0, STICKERS.length - 1)] : null;
      const touchPadding = size >= 112 ? 36 : size >= 86 ? 28 : 20;
      const parallax = 0.35 + ((size - sizeGlobalMin) / (sizeGlobalMax - sizeGlobalMin)) * 0.85;

      const glowScale = new Animated.Value(1);
      const glowOpacity = new Animated.Value(isJackpot ? 0.4 : 0);

      return {
        id: Math.random().toString(36).slice(2),
        typeKey, size, tx, ty, scale, opacity, ringScale, ringOpacity,
        curr, speed, maxTurn, legMin, legMax, biasGain, heading,
        tint, sticker, touchPadding, parallax,
        isJackpot,
        glowScale, glowOpacity,
        __glowStop: null,
        anim: null,
        stopped: false,
        ttlTimer: null,
      };
    });
  }, [bubbleCount, sizeGlobalMin, sizeGlobalMax]);

  useEffect(() => {
    const stopFns = [];

    const separationDelta = (b, all) => {
      let vx = 0, vy = 0, pushes = 0;
      for (let i = 0; i < all.length; i++) {
        const n = all[i];
        if (n === b) continue;
        const dx = b.curr.x - n.curr.x;
        const dy = b.curr.y - n.curr.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 <= 0) continue;
        const thresh = ((b.size + n.size) * 0.5) * SEP_FACTOR;
        const thresh2 = thresh * thresh;
        if (dist2 < thresh2) {
          const dist = Math.sqrt(dist2);
          const w = (thresh - dist) / thresh;
          vx += (dx / dist2) * w;
          vy += (dy / dist2) * w;
          if (++pushes > 8) break;
        }
      }
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

    const scheduleTTL = (b) => {
      const { TTL_MIN, TTL_MAX } = TYPES[b.typeKey];
      clearTimeout(b.ttlTimer);
      if (paused) return;
      b.ttlTimer = setTimeout(() => autoPop(b), rint(TTL_MIN, TTL_MAX));
    };

    const placeNonOverlapping = (b, placed) => {
      const randomOnscreen = (size) => {
        const x = clamp(rand(MARGIN, width - size - MARGIN), 0, Math.max(0, width - size));
        const y = clamp(rand(MARGIN, height - size - MARGIN), 0, Math.max(0, height - size));
        return { x, y };
      };
      let p = randomOnscreen(b.size);
      let ok = false;
      for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS; attempt++) {
        ok = true;
        for (let i = 0; i < placed.length; i++) {
          const n = placed[i];
          const dx = p.x - n.curr.x;
          const dy = p.y - n.curr.y;
          const dist2 = dx * dx + dy * dy;
          const thresh = ((b.size + n.size) * 0.5) * SEP_FACTOR;
          if (dist2 < (thresh * thresh)) { ok = false; break; }
        }
        if (ok) break;
        p = randomOnscreen(b.size);
      }
      b.curr.x = p.x; b.curr.y = p.y;
      b.tx.setValue(p.x); b.ty.setValue(p.y);
    };

    const nextLeg = (b) => {
      if (paused || b.stopped) return;

      const randTurn = rand(-b.maxTurn, b.maxTurn);
      const bias = wrapAngle(UP_BIAS - b.heading) * b.biasGain;
      const wall = softWallSteer(b);
      const sep = separationDelta(b, bubbles);
      b.heading = wrapAngle(b.heading + randTurn + bias + wall + sep);

      const leg = rand(b.legMin, b.legMax);
      const nx = clamp(b.curr.x + Math.cos(b.heading) * leg, 0, Math.max(0, width - b.size));
      const ny = clamp(b.curr.y + Math.sin(b.heading) * leg, 0, Math.max(0, height - b.size));

      const duration = clamp((leg / (b.speed * boostRef.current)) * 1000, 900, 3200) * (reducedMotion ? 1.2 : 1.0);

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

    const autoPop = (b) => {
      if (paused || b.stopped) return;
      b.stopped = true;
      b.anim?.stop();
      playAutoPopSfx();
      Animated.parallel([
        Animated.timing(b.scale, { toValue: 1.08, duration: 100, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(b.ringOpacity, { toValue: 0.45, duration: 80, useNativeDriver: true }),
          Animated.timing(b.ringScale, { toValue: 1.5, duration: 220, useNativeDriver: true }),
          Animated.timing(b.ringOpacity, { toValue: 0, duration: 110, useNativeDriver: true }),
        ]),
        Animated.timing(b.opacity, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]).start(() => respawn(b));
    };

    const placeAndRun = (b, placed) => {
      placeNonOverlapping(b, placed);
      b.stopped = false;
      scheduleTTL(b);
      nextLeg(b);
      if (b.isJackpot) startGlow(b); else { b.__glowStop && b.__glowStop(); b.glowOpacity.setValue(0); }
    };

    const respawn = (b) => {
      const T = TYPES[b.typeKey];
      b.size = rand(T.SIZE_MIN, T.SIZE_MAX);
      b.scale.setValue(1);
      b.opacity.setValue(1);
      b.heading = UP_BIAS + rand(-Math.PI / 14, Math.PI / 14);
      const baseTint = TINTS[rint(0, TINTS.length - 1)];
      b.isJackpot = Math.random() < JACKPOT_PROB;
      b.tint = b.isJackpot ? GOLD_TINT : baseTint;
      b.ringScale.setValue(b.isJackpot ? 1.05 : 0.8);
      b.ringOpacity.setValue(b.isJackpot ? 0.45 : 0);
      b.sticker = Math.random() < STICKER_PROB ? STICKERS[rint(0, STICKERS.length - 1)] : null;
      b.ringOpacity.stopAnimation();
      b.glowScale.setValue(1);
      b.glowOpacity.setValue(b.isJackpot ? 0.4 : 0);
      b.__glowStop && b.__glowStop();
      if (b.isJackpot) startGlow(b);
      placeAndRun(b, bubbles);
    };

    const placed = [];
    bubbles.forEach((b) => {
      b.__stopAll = () => { b.stopped = true; b.anim?.stop(); clearTimeout(b.ttlTimer); b.__glowStop && b.__glowStop(); };
      b.__respawn = () => respawn(b);
      b.__scheduleTTL = () => scheduleTTL(b);

      placeAndRun(b, placed);
      placed.push(b);
      stopFns.push(() => { b.stopped = true; b.anim?.stop(); clearTimeout(b.ttlTimer); b.__glowStop && b.__glowStop(); });
    });

    return () => {
      clearTimeout(boostTimeoutRef.current);
      stopFns.forEach((fn) => fn?.());
    };
  }, [bubbles, width, height, paused, reducedMotion]);

  const registerPop = () => {
    try { Haptics && Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light); } catch {}
    const time = Date.now();
    if (time - lastPopAtRef.current <= COMBO_WINDOW_MS) {
      const next = comboRef.current + 1;
      if (comboRef.current < COMBO_THRESHOLD && next >= COMBO_THRESHOLD) triggerCombo();
      comboRef.current = next;
    } else {
      comboRef.current = 1;
    }
    lastPopAtRef.current = time;
  };

  const handleManualPop = (b) => {
    b.__stopAll?.();
    playManualPopSfx();
    registerPop();

    if (b.isJackpot) {
      const cx = b.curr.x + b.size / 2;
      const cy = b.curr.y + b.size / 2;
      sprayConfetti(cx, cy, 18);
    }

    Animated.parallel([
      Animated.timing(b.scale, { toValue: 1.15, duration: 110, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(b.ringOpacity, { toValue: 0.6, duration: 80, useNativeDriver: true }),
        Animated.timing(b.ringScale, { toValue: 1.6, duration: 260, useNativeDriver: true }),
        Animated.timing(b.ringOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]),
      Animated.timing(b.opacity, { toValue: 0, duration: 140, useNativeDriver: true }),
    ]).start(() => b.__respawn?.());
  };

  const STREAM_INTERVAL_MS = reducedMotion ? 140 : 110;
  const STREAM_SFX_PROB = 0.15;
  const [shots, setShots] = useState([]);
  const streamActiveRef = useRef(false);
  const fingerRef = useRef({ x: width / 2, y: height / 2 });
  const streamTimerRef = useRef(null);
  const lastShotSfxAtRef = useRef(0);

  const spawnShot = (x, y) => {
    const size = rand(36, 58) * (PixelRatio.get() >= 3 ? 1.05 : 1.0);
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
    const duration = (reducedMotion ? 1100 : 850) + rint(0, 550);

    setShots((prev) => [...prev, { id, size, tx, ty, scale, opacity, ringScale, ringOpacity, tint, sticker }]);

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
        InteractionManager.runAfterInteractions(() => {
          requestAnimationFrame(() => {
            setShots((prev) => prev.filter((s) => s.id !== id));
          });
        });
      });

      const ts = Date.now();
      if (Math.random() < STREAM_SFX_PROB && ts - lastShotSfxAtRef.current > 500) {
        lastShotSfxAtRef.current = ts;
        try { playPopSound(); } catch {}
      }
    });
  };

  const startStream = (x, y) => {
    if (paused) return;
    streamActiveRef.current = true;
    fingerRef.current = { x, y };
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    streamTimerRef.current = setInterval(() => {
      if (!streamActiveRef.current || paused) return;
      const { x: fx, y: fy } = fingerRef.current;
      spawnShot(fx, fy);
    }, STREAM_INTERVAL_MS);
  };

  const moveStream = (x, y) => { fingerRef.current = { x, y }; };
  const stopStream = () => {
    streamActiveRef.current = false;
    if (streamTimerRef.current) { clearInterval(streamTimerRef.current); streamTimerRef.current = null; }
  };
  useEffect(() => () => stopStream(), []);

  // Long press + pan gesture
  const longPress = Gesture.LongPress()
    .minDuration(250)
    .onStart((e) => runOnJS(startStream)(e.x, e.y))
    .onEnd(() => runOnJS(stopStream)())
    .onFinalize(() => runOnJS(stopStream)());
  const pan = Gesture.Pan()
    .onBegin((e) => runOnJS(moveStream)(e.x, e.y))
    .onUpdate((e) => runOnJS(moveStream)(e.x, e.y))
    .onEnd(() => runOnJS(stopStream)())
    .onFinalize(() => runOnJS(stopStream)());
  const gesture = Gesture.Simultaneous(longPress, pan);

  /** ------------------------------ Render --------------------------- */
  return (
    <SceneShell backgroundColor={skyColor} safeArea={false}>
      <GestureDetector gesture={gesture}>
        <View style={[styles.container, { backgroundColor: skyColor }]}>

        {/* Cross-faded sky gradient (safe fallback if no native gradient) */}
        <SkyGradientCrossfade width={width} height={height} t={t} />



        {/* Stars + sun/moon (behind clouds) */}
        <StarsLayer width={width} height={height} isNight={isNight} paused={paused} reducedMotion={reducedMotion} />
        <SunMoon width={width} height={height} t={t} tiltX={tiltX} tiltY={tiltY} isNight={isNight} paused={paused} reducedMotion={reducedMotion} />

        {/* Distant hills silhouette for depth */}
        <DistantHills width={width} height={height} tiltX={tiltX} tiltY={tiltY} isNight={isNight} />

        {/* Clouds (two layers) */}
        <CloudsBackground width={width} height={height} tiltX={tiltX} tiltY={tiltY} isNight={isNight} paused={paused} reducedMotion={reducedMotion} />

        {/* Subtle horizon haze */}
        <HorizonHaze width={width} height={height} isNight={isNight} />

        {/* Stream bubbles beneath main bubbles */}
        <ShotsLayer shots={shots} />

        {/* Main bubbles with tilt parallax + optional jackpot halo */}
        {bubbles.map((b) => {
          const txWithTilt = Animated.add(b.tx, Animated.multiply(tiltX, b.parallax));
          const tyWithTilt = Animated.add(b.ty, Animated.multiply(tiltY, b.parallax * 0.8));

          const haloSize = b.size * 1.85;
          const haloStyle = {
            position: 'absolute',
            width: haloSize,
            height: haloSize,
            borderRadius: haloSize / 2,
            backgroundColor: 'rgba(255, 210, 90, 0.35)',
            transform: [
              { translateX: Animated.add(txWithTilt, new Animated.Value(-(haloSize - b.size) / 2)) },
              { translateY: Animated.add(tyWithTilt, new Animated.Value(-(haloSize - b.size) / 2)) },
              { scale: b.glowScale || 1 },
            ],
            opacity: b.glowOpacity || 0,
          };

          return (
            <React.Fragment key={b.id}>
              {b.isJackpot ? <Animated.View style={haloStyle} pointerEvents="none" /> : null}
              <Bubble
                size={b.size}
                tx={txWithTilt}
                ty={tyWithTilt}
                scale={b.scale}
                opacity={b.opacity}
                ringScale={b.ringScale}
                ringOpacity={b.ringOpacity}
                tint={b.tint}
                sticker={b.sticker}
                onPop={() => handleManualPop(b)}
              />
            </React.Fragment>
          );
        })}

        {/* Confetti overlay */}
        {confetti.map((c) => {
          const style = {
            position: 'absolute',
            width: c.size,
            height: c.size,
            borderRadius: 2,
            backgroundColor: c.tint,
            transform: [{ translateX: c.tx }, { translateY: c.ty }],
            opacity: c.opacity,
          };
          return <Animated.View key={c.id} pointerEvents="none" style={style} />;
        })}



        {/* Gentle vignette to frame the scene */}
        <VignetteOverlay width={width} height={height} />

        {/* Centered badge OVERLAY */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.badgeOverlay,
            { opacity: badgeOpacity, transform: [{ scale: badgeScale }] },
          ]}
        >
          <Text style={styles.badgeText}>⭐ You did it!</Text>
        </Animated.View>

        </View>
      </GestureDetector>
    </SceneShell>
  );
}

/** ------------------------------ Styles ---------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Cloud pieces
  cloudBlob: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 9999,
    shadowColor: '#ffffff',
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0, // Android shadow perf
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
