import * as Speech from 'expo-speech';

export function speak(text: string, rate = 0.9) {
  try {
    Speech.stop();
    Speech.speak(text, { rate, pitch: 1.05 });
  } catch {}
}

export function speakLetter(letter: string) {
  speak(`${letter.toUpperCase()} says ${letter.toLowerCase()}`, 0.85);
}

export function speakNumber(n: number) {
  speak(String(n), 0.9);
}
