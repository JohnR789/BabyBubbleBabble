import * as Haptics from 'expo-haptics';

export function lightImpact() {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  } catch {}
}
