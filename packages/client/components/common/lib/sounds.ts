type SoundId =
  | "message_received"
  | "message_sent"
  | "user_join_voice"
  | "user_leave_voice"
  | "user_deafen"
  | "user_undeafen"
  | "user_mute_unmute";

const SOUND_FILES: Record<SoundId, string> = {
  message_received: "/assets/web/sounds/new_message.mp3",
  message_sent: "/assets/web/sounds/new_message.mp3",
  user_join_voice: "/assets/web/sounds/user_join_voicechat.wav",
  user_leave_voice: "/assets/web/sounds/user_leave_voicechat.wav",
  user_deafen: "/assets/web/sounds/user_deafen_voicechat.wav",
  user_undeafen: "/assets/web/sounds/user_undeafen_voicechat.wav",
  user_mute_unmute: "/assets/web/sounds/mute_unmute.mp3",
};

const DEFAULT_GLOBAL_VOLUME = 0.5;
const DEFAULT_MESSAGE_VOLUME = 0.45;

const KEY_GLOBAL_VOLUME = "sound_volume";
const KEY_MESSAGE_VOLUME = "sound_message_volume";
const KEY_DISABLE_ALL_SOUNDS = "sound_disable_all";

function keyEnabledForSound(id: SoundId) {
  return `sound_enabled_${id}`;
}

function clamp01(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function readVolume(key: string, fallback: number) {
  if (typeof localStorage === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  const parsed = Number(raw);
  return clamp01(Number.isFinite(parsed) ? parsed : fallback);
}

function writeVolume(key: string, value: number) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, String(clamp01(value)));
}

function readBool(key: string, fallback: boolean) {
  if (typeof localStorage === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  if (raw === "1") return true;
  if (raw === "0") return false;
  return fallback;
}

function writeBool(key: string, value: boolean) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, value ? "1" : "0");
}

export function getSoundVolume() {
  return readVolume(KEY_GLOBAL_VOLUME, DEFAULT_GLOBAL_VOLUME);
}

export function setSoundVolume(value: number) {
  writeVolume(KEY_GLOBAL_VOLUME, value);
}

export function getMessageSoundVolume() {
  return readVolume(KEY_MESSAGE_VOLUME, DEFAULT_MESSAGE_VOLUME);
}

export function setMessageSoundVolume(value: number) {
  writeVolume(KEY_MESSAGE_VOLUME, value);
}

export function getDisableAllSounds() {
  return readBool(KEY_DISABLE_ALL_SOUNDS, false);
}

export function setDisableAllSounds(value: boolean) {
  writeBool(KEY_DISABLE_ALL_SOUNDS, value);
}

export function getSoundEnabled(id: SoundId) {
  return readBool(keyEnabledForSound(id), true);
}

export function setSoundEnabled(id: SoundId, value: boolean) {
  writeBool(keyEnabledForSound(id), value);
}

const audioCache = new Map<SoundId, HTMLAudioElement>();
const lastPlayed = new Map<SoundId, number>();

function getAudio(id: SoundId) {
  const cached = audioCache.get(id);
  if (cached) return cached;

  const audio = new Audio(SOUND_FILES[id]);
  audio.preload = "auto";
  audioCache.set(id, audio);
  return audio;
}

export async function playSound(id: SoundId, opts?: { volume?: number }) {
  if (getDisableAllSounds()) return;
  if (!getSoundEnabled(id)) return;

  const now = Date.now();
  const last = lastPlayed.get(id) ?? 0;

  // Prevent spam (e.g. rapid participant connect/disconnect flapping).
  if (now - last < 500) return;
  lastPlayed.set(id, now);

  try {
    const audio = getAudio(id);
    const defaultVolume =
      id === "message_received" || id === "message_sent"
        ? getMessageSoundVolume()
        : getSoundVolume();
    audio.volume = opts?.volume ?? defaultVolume;
    audio.currentTime = 0;
    await audio.play();
  } catch {
    // Ignore autoplay/permission errors.
  }
}

export type { SoundId };
