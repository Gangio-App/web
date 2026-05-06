import {
  Accessor,
  JSX,
  Setter,
  batch,
  createContext,
  createSignal,
  useContext,
  createEffect,
} from "solid-js";
import { useModals } from "@revolt/modal";
import { RoomContext } from "solid-livekit-components";

import { Room, Track, ScreenSharePresets } from "livekit-client";
import { DenoiseTrackProcessor } from "livekit-rnnoise-processor";
import { Channel } from "stoat.js";

import { useState } from "@revolt/state";
import { Voice as VoiceSettings } from "@revolt/state/stores/Voice";
import { VoiceCallCardContext } from "@revolt/ui/components/features/voice/callCard/VoiceCallCard";

import { CONFIGURATION } from "@revolt/common";
import { InRoom } from "./components/InRoom";
import { RoomAudioManager } from "./components/RoomAudioManager";
import { playSound } from "../common/lib/sounds";

type State =
  | "READY"
  | "DISCONNECTED"
  | "CONNECTING"
  | "CONNECTED"
  | "RECONNECTING";

// ---------------------------------------------------------------------------
// Screen share quality types & presets
// ---------------------------------------------------------------------------

export type ScreenShareResolution = "low" | "medium" | "high" | "ultra" | "4k";
export type ScreenShareFrameRate = 15 | 24 | 30 | 60;

/**
 * Maps each resolution tier to the closest LiveKit ScreenSharePreset.
 * "ultra" (1440p) uses h1080fps30 for the encoding profile — the actual
 * capture resolution is overridden via captureOptions.
 */
export const SCREEN_SHARE_PRESETS = {
  low:    ScreenSharePresets.h360fps15,
  medium: ScreenSharePresets.h720fps30,
  high:   ScreenSharePresets.h1080fps30,
  ultra:  ScreenSharePresets.h1080fps30, // encoding profile; capture is 1440p
  "4k":   ScreenSharePresets.original,
} as const;

/**
 * Capture resolution dimensions per tier.
 * These are passed into getDisplayMedia / LiveKit captureOptions.
 */
const SCREEN_SHARE_DIMENSIONS: Record<
  ScreenShareResolution,
  { width: number; height: number }
> = {
  low:    { width: 640,  height: 360  },
  medium: { width: 1280, height: 720  },
  high:   { width: 1920, height: 1080 },
  ultra:  { width: 2560, height: 1440 },
  "4k":   { width: 3840, height: 2160 },
};

/** Clamp any stored framerate to a valid option; fall back to 30. */
export function resolveFrameRate(fps: number): ScreenShareFrameRate {
  if (fps === 15 || fps === 24 || fps === 60) return fps;
  return 30;
}

/**
 * Build LiveKit capture + publish options for a given resolution / framerate.
 * This is the single source of truth used by both initial start and live updates.
 */
export function buildScreenShareOptions(
  resolution: ScreenShareResolution,
  frameRate: ScreenShareFrameRate,
  includeAudio: boolean,
) {
  const preset = SCREEN_SHARE_PRESETS[resolution];
  const dimensions = SCREEN_SHARE_DIMENSIONS[resolution];

  const captureOptions = {
    audio: includeAudio,
    selfBrowserSurface: "include" as const,
    systemAudio: "include" as const,
    resolution: {
      ...dimensions,
      frameRate,
    },
  };

  const publishOptions = {
    screenShareEncoding: {
      ...preset.encoding,
      // For 60 fps tiers bump the bitrate ceiling to avoid quality drops
      maxBitrate:
        frameRate === 60
          ? Math.max(preset.encoding.maxBitrate ?? 0, 8_000_000)
          : preset.encoding.maxBitrate,
      maxFramerate: frameRate,
    },
    videoCodec: "vp9" as const,
  };

  return { captureOptions, publishOptions };
}

// ---------------------------------------------------------------------------
// Voice class
// ---------------------------------------------------------------------------

class Voice {
  #settings: VoiceSettings;
  #readyForParticipantSounds = false;

  channel: Accessor<Channel | undefined>;
  #setChannel: Setter<Channel | undefined>;

  room: Accessor<Room | undefined>;
  #setRoom: Setter<Room | undefined>;

  state: Accessor<State>;
  #setState: Setter<State>;

  deafen: Accessor<boolean>;
  #setDeafen: Setter<boolean>;

  microphone: Accessor<boolean>;
  #setMicrophone: Setter<boolean>;

  video: Accessor<boolean>;
  #setVideo: Setter<boolean>;

  screenshare: Accessor<boolean>;
  #setScreenshare: Setter<boolean>;

  /** Currently active screenshare resolution tier */
  screenshareResolution: Accessor<ScreenShareResolution>;
  #setScreenshareResolution: Setter<ScreenShareResolution>;

  /** Currently active screenshare framerate */
  screenshareFrameRate: Accessor<ScreenShareFrameRate>;
  #setScreenshareFrameRate: Setter<ScreenShareFrameRate>;

  screenshareAudio: Accessor<boolean>;
  #setScreenshareAudio: Setter<boolean>;

  /** Whether the local preview is paused to save resources */
  previewPaused: Accessor<boolean>;
  #setPreviewPaused: Setter<boolean>;

  constructor(voiceSettings: VoiceSettings) {
    this.#settings = voiceSettings;

    const [channel, setChannel] = createSignal<Channel>();
    this.channel = channel;
    this.#setChannel = setChannel;

    const [room, setRoom] = createSignal<Room>();
    this.room = room;
    this.#setRoom = setRoom;

    const [state, setState] = createSignal<State>("READY");
    this.state = state;
    this.#setState = setState;

    const [deafen, setDeafen] = createSignal<boolean>(false);
    this.deafen = deafen;
    this.#setDeafen = setDeafen;

    const [microphone, setMicrophone] = createSignal(false);
    this.microphone = microphone;
    this.#setMicrophone = setMicrophone;

    const [video, setVideo] = createSignal(false);
    this.video = video;
    this.#setVideo = setVideo;

    const [screenshare, setScreenshare] = createSignal(false);
    this.screenshare = screenshare;
    this.#setScreenshare = setScreenshare;

    // Screenshare quality state — defaults to 1080p @ 30fps, no audio
    const [screenshareResolution, setScreenshareResolution] =
      createSignal<ScreenShareResolution>("high");
    this.screenshareResolution = screenshareResolution;
    this.#setScreenshareResolution = setScreenshareResolution;

    const [screenshareFrameRate, setScreenshareFrameRate] =
      createSignal<ScreenShareFrameRate>(30);
    this.screenshareFrameRate = screenshareFrameRate;
    this.#setScreenshareFrameRate = setScreenshareFrameRate;

    const [screenshareAudio, setScreenshareAudio] = createSignal(false);
    this.screenshareAudio = screenshareAudio;
    this.#setScreenshareAudio = setScreenshareAudio;

    const [previewPaused, setPreviewPaused] = createSignal(false);
    this.previewPaused = previewPaused;
    this.#setPreviewPaused = setPreviewPaused;

    // Auto-pause when window is hidden (e.g. minimized)
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          // Only auto-pause if not already paused
          if (!this.previewPaused()) {
            this.#setPreviewPaused(true);
            (this as any)._autoPaused = true;
          }
        } else if (document.visibilityState === "visible") {
          // Only auto-resume if it was paused by this auto-logic
          if ((this as any)._autoPaused) {
            this.#setPreviewPaused(false);
            (this as any)._autoPaused = false;
          }
        }
      });
    }
  }

  setScreenshareResolution(resolution: ScreenShareResolution) {
    this.#setScreenshareResolution(resolution);
  }

  setScreenshareFrameRate(frameRate: ScreenShareFrameRate) {
    this.#setScreenshareFrameRate(frameRate);
  }

  setScreenshareAudio(audio: boolean) {
    this.#setScreenshareAudio(audio);
  }

  async connect(channel: Channel, auth?: { url: string; token: string }) {
    this.disconnect();

    const room = new Room({
      audioCaptureDefaults: {
        deviceId: this.#settings.preferredAudioInputDevice,
        echoCancellation: this.#settings.echoCancellation,
        noiseSuppression: this.#settings.noiseSupression === "browser",
      },
      audioOutput: {
        deviceId: this.#settings.preferredAudioOutputDevice,
      },
      // Room-level defaults — these are overridden per-call in toggleScreenshare
      screenShareCaptureDefaults: {
        resolution: { width: 1920, height: 1080, frameRate: 30 },
      },
      videoCaptureDefaults: {
        resolution: { width: 1280, height: 720, frameRate: 30 },
      },
      publishDefaults: {
        screenShareEncoding: {
          maxBitrate: 3_000_000,
          maxFramerate: 30,
        },
        videoCodec: "vp9",
      },
      dynacast: true,
      adaptiveStream: true,
    });

    batch(() => {
      this.#setRoom(room);
      this.#setChannel(channel);
      this.#setState("CONNECTING");

      this.#setMicrophone(false);
      this.#setDeafen(false);
      this.#setVideo(false);
      this.#setScreenshare(false);
      this.#setPreviewPaused(false);
    });

    room.addListener("connected", () => {
      this.#setState("CONNECTED");

      this.#readyForParticipantSounds = false;
      setTimeout(() => {
        this.#readyForParticipantSounds = true;
      }, 1500);

      void playSound("user_join_voice");

      if (this.speakingPermission)
        room.localParticipant.setMicrophoneEnabled(true).then((track) => {
          this.#setMicrophone(typeof track !== "undefined");
          if (this.#settings.noiseSupression === "enhanced") {
            track?.audioTrack?.setProcessor(
              new DenoiseTrackProcessor({
                workletCDNURL: CONFIGURATION.RNNOISE_WORKLET_CDN_URL,
              }),
            );
          }
        });
    });

    room.addListener("disconnected", () => {
      this.#setState("DISCONNECTED");
      void playSound("user_leave_voice");
    });

    room.addListener("participantConnected", () => {
      if (this.#readyForParticipantSounds) void playSound("user_join_voice");
    });

    room.addListener("participantDisconnected", () => {
      if (this.#readyForParticipantSounds) void playSound("user_leave_voice");
    });

    if (!auth) {
      auth = await channel.joinCall("worldwide");
    }

    await room.connect(auth.url, auth.token, {
      autoSubscribe: false,
    });
  }

  disconnect() {
    const room = this.room();
    if (!room) return;

    room.removeAllListeners();
    room.disconnect();

    batch(() => {
      this.#setState("READY");
      this.#setRoom(undefined);
      this.#setChannel(undefined);
      this.#setPreviewPaused(false);
    });

    this.#readyForParticipantSounds = false;
  }

  async toggleDeafen() {
    const next = !this.deafen();
    this.#setDeafen(next);
    void playSound(next ? "user_deafen" : "user_undeafen");
  }

  async toggleMute() {
    const room = this.room();
    if (!room) throw "invalid state";
    await room.localParticipant.setMicrophoneEnabled(
      !room.localParticipant.isMicrophoneEnabled,
    );

    this.#setMicrophone(room.localParticipant.isMicrophoneEnabled);
    void playSound("user_mute_unmute");
  }

  async toggleCamera() {
    const room = this.room();
    if (!room) throw "invalid state";
    await room.localParticipant.setCameraEnabled(
      !room.localParticipant.isCameraEnabled,
    );

    this.#setVideo(room.localParticipant.isCameraEnabled);
  }

  async togglePreviewPause() {
    this.#setPreviewPaused(!this.previewPaused());
  }

  /**
   * Start or stop screensharing using the currently stored quality settings.
   * Pass explicit overrides (e.g. from a settings modal) to start with
   * non-default quality without needing a separate updateScreenShareSettings call.
   */
  async toggleScreenshare(opts?: {
    resolution?: ScreenShareResolution;
    frameRate?: ScreenShareFrameRate;
    includeAudio?: boolean;
  }) {
    const room = this.room();
    if (!room || this.state() !== "CONNECTED") return;

    const isEnabled = room.localParticipant.isScreenShareEnabled;

    if (isEnabled) {
      try {
        await room.localParticipant.setScreenShareEnabled(false);
      } catch (e) {
        console.error("Failed to stop screenshare", e);
      }
      this.#setScreenshare(false);
      return;
    }

    // Merge caller overrides into stored state
    const resolution = opts?.resolution ?? this.screenshareResolution();
    const frameRate = opts?.frameRate ?? this.screenshareFrameRate();
    const includeAudio = opts?.includeAudio ?? this.screenshareAudio();

    const { captureOptions, publishOptions } = buildScreenShareOptions(
      resolution,
      frameRate,
      includeAudio,
    );

    try {
      await room.localParticipant.setScreenShareEnabled(
        true,
        captureOptions,
        publishOptions,
      );

      // Persist the settings that were actually used
      batch(() => {
        this.#setScreenshareResolution(resolution);
        this.#setScreenshareFrameRate(frameRate);
        this.#setScreenshareAudio(includeAudio);
        this.#setScreenshare(true);
      });
    } catch (e) {
      console.error("Failed to start screenshare", e);
      this.#setScreenshare(false);
    }
  }

  /**
   * Update screenshare quality while a share is already active.
   * Restarts the screen share track with new capture + publish options.
   * No-op if not currently sharing.
   */
  async updateScreenShareSettings(
    resolution: ScreenShareResolution,
    frameRate: ScreenShareFrameRate,
    includeAudio: boolean,
  ) {
    const room = this.room();
    if (!room || !room.localParticipant.isScreenShareEnabled) {
       // Just update the settings for next time
       batch(() => {
          this.#setScreenshareResolution(resolution);
          this.#setScreenshareFrameRate(frameRate);
          this.#setScreenshareAudio(includeAudio);
       });
       return;
    }

    const { captureOptions, publishOptions } = buildScreenShareOptions(
      resolution,
      frameRate,
      includeAudio,
    );

    try {
      // Stop then restart with new options — LiveKit has no "update" API for screenshare
      await room.localParticipant.setScreenShareEnabled(false);
      await room.localParticipant.setScreenShareEnabled(
        true,
        captureOptions,
        publishOptions,
      );

      batch(() => {
        this.#setScreenshareResolution(resolution);
        this.#setScreenshareFrameRate(frameRate);
        this.#setScreenshareAudio(includeAudio);
        this.#setScreenshare(true);
      });
    } catch (e) {
      console.error("Failed to update screenshare settings", e);
      // If restart failed, mark as stopped
      this.#setScreenshare(room.localParticipant.isScreenShareEnabled);
    }
  }

  getConnectedUser(userId: string) {
    return this.room()?.getParticipantByIdentity(userId);
  }

  get listenPermission() {
    return !!this.channel()?.havePermission("Listen");
  }

  get speakingPermission() {
    return !!this.channel()?.havePermission("Speak");
  }

  get active() {
    return !!this.channel();
  }
}

const voiceContext = createContext<Voice>(null as unknown as Voice);

/**
 * Mount global voice context and room audio manager
 */
export function VoiceContext(props: { children: JSX.Element }) {
  const state = useState();
  const voice = new Voice(state.voice);
  const modals = useModals();

  createEffect(() => {
    if ((window as any).native?.getDesktopSources) {
      // Monkey-patch to use our own Electron Screenshare picker since Chromium's is missing
      if (!navigator.mediaDevices.getDisplayMedia.toString().includes("desktop_screenshare")) {
        navigator.mediaDevices.getDisplayMedia = async () => {
          return new Promise((resolve, reject) => {
            modals.openModal({
              type: "desktop_screenshare",
              callback: async (sourceId?: string) => {
                if (!sourceId) {
                  return reject(new DOMException("Canceled by user", "NotAllowedError"));
                }

                const isScreen = sourceId.startsWith("screen");

                // Use the current quality settings from voice state
                const dims = SCREEN_SHARE_DIMENSIONS[voice.screenshareResolution() as ScreenShareResolution];
                const fps = voice.screenshareFrameRate();

                try {
                  const stream = await navigator.mediaDevices.getUserMedia({
                    audio: isScreen && voice.screenshareAudio() ? {
                      mandatory: {
                        chromeMediaSource: "desktop",
                        chromeMediaSourceId: sourceId,
                      }
                    } : false as any,
                    video: {
                      mandatory: {
                        chromeMediaSource: "desktop",
                        chromeMediaSourceId: sourceId,
                        maxWidth: dims.width,
                        maxHeight: dims.height,
                        maxFrameRate: fps,
                      }
                    }
                  } as any);

                  if (!stream || stream.getTracks().length === 0) {
                    throw new Error("Captured stream is empty");
                  }

                  resolve(stream);
                } catch (err) {
                  console.error("Primary capture failed, trying fallback", err);
                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                      audio: false,
                      video: {
                        mandatory: {
                          chromeMediaSource: "desktop",
                          chromeMediaSourceId: sourceId,
                          maxWidth: dims.width,
                          maxHeight: dims.height,
                          maxFrameRate: fps,
                        }
                      }
                    } as any);
                    resolve(stream);
                  } catch (finalErr) {
                    console.error("Screenshare capture failed completely", finalErr);
                    reject(finalErr);
                  }
                }
              }
            });
          });
        };
      }
    }
  });

  return (
    <voiceContext.Provider value={voice}>
      <RoomContext.Provider value={voice.room}>
        <VoiceCallCardContext>{props.children}</VoiceCallCardContext>
        <InRoom>
          <RoomAudioManager />
        </InRoom>
      </RoomContext.Provider>
    </voiceContext.Provider>
  );
}

export const useVoice = () => useContext(voiceContext);
