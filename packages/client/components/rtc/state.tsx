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
 */
export const SCREEN_SHARE_PRESETS = {
  low:    ScreenSharePresets.h360fps15,
  medium: ScreenSharePresets.h720fps30,
  high:   ScreenSharePresets.h1080fps30,
  ultra:  ScreenSharePresets.h1080fps30, 
  "4k":   ScreenSharePresets.original,
} as const;

/**
 * Capture resolution dimensions per tier.
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

export function resolveFrameRate(fps: number): ScreenShareFrameRate {
  if (fps === 15 || fps === 24 || fps === 60) return fps;
  return 30;
}

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
      video: true, // Fallback to true for maximum compatibility on browser
    };

    // If we have specific dimensions, try to use them
    if (dimensions) {
      (captureOptions.video as any) = {
        ...dimensions,
        frameRate,
      };
    }

  const publishOptions = {
    screenShareEncoding: {
      ...preset.encoding,
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

  screenshareResolution: Accessor<ScreenShareResolution>;
  #setScreenshareResolution: Setter<ScreenShareResolution>;

  screenshareFrameRate: Accessor<ScreenShareFrameRate>;
  #setScreenshareFrameRate: Setter<ScreenShareFrameRate>;

  screenshareAudio: Accessor<boolean>;
  #setScreenshareAudio: Setter<boolean>;

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
    this.#setState = (s) => {
      console.log(`[Voice] State change: ${state()} -> ${s}`);
      setState(s);
    };

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

    const room = this.room();
    if (room?.localParticipant) {
      await room.localParticipant.setAttributes({
        deafened: next ? "true" : "false",
      });
    }
  }

  async toggleMute() {
    const room = this.room();
    if (!room?.localParticipant) throw "invalid state";
    await room.localParticipant.setMicrophoneEnabled(
      !room.localParticipant.isMicrophoneEnabled,
    );

    this.#setMicrophone(room.localParticipant.isMicrophoneEnabled);
    void playSound("user_mute_unmute");
  }

  async toggleCamera() {
    const room = this.room();
    if (!room?.localParticipant) throw "invalid state";
    await room.localParticipant.setCameraEnabled(
      !room.localParticipant.isCameraEnabled,
    );

    this.#setVideo(room.localParticipant.isCameraEnabled);
  }

  async togglePreviewPause() {
    this.#setPreviewPaused(!this.previewPaused());
  }

  async toggleScreenshare(opts?: {
    resolution?: ScreenShareResolution;
    frameRate?: ScreenShareFrameRate;
    includeAudio?: boolean;
  }) {
    console.info("[Voice] toggleScreenshare called", opts);
    const room = this.room();
    if (!room?.localParticipant || this.state() !== "CONNECTED") {
      console.warn("[Voice] Cannot toggle screenshare: room or state invalid", { state: this.state(), hasParticipant: !!room?.localParticipant });
      return;
    }

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

    const resolution = opts?.resolution ?? this.screenshareResolution();
    const frameRate = opts?.frameRate ?? this.screenshareFrameRate();
    const includeAudio = opts?.includeAudio ?? this.screenshareAudio();

    const { captureOptions, publishOptions } = buildScreenShareOptions(
      resolution,
      frameRate,
      includeAudio,
    );

    try {
      console.info("[Voice] calling setScreenShareEnabled(true)", captureOptions);
      await room.localParticipant.setScreenShareEnabled(
        true,
        captureOptions,
        publishOptions,
      );
      console.info("[Voice] setScreenShareEnabled(true) success");

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

  setScreenshareAudio(enabled: boolean) {
    this.#setScreenshareAudio(enabled);
  }

  async updateScreenShareSettings(
    resolution: ScreenShareResolution,
    frameRate: ScreenShareFrameRate,
    includeAudio: boolean,
  ) {
    const room = this.room();
    if (!room?.localParticipant || !room.localParticipant.isScreenShareEnabled) {
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

export function VoiceContext(props: { children: JSX.Element }) {
  const state = useState();
  const voice = new Voice(state.voice);
  const modals = useModals();

  createEffect(() => {
    if ((window as any).native?.getDesktopSources) {
      if (!navigator.mediaDevices.getDisplayMedia.toString().includes("desktop_screenshare")) {
        navigator.mediaDevices.getDisplayMedia = async () => {
          console.info("[Native] getDisplayMedia intercept triggered");
          if (!modals) {
            console.error("[Native] Modals context not available in monkey-patch!");
            return Promise.reject(new Error("Modals not available"));
          }
          return new Promise((resolve, reject) => {
            console.info("[Native] Opening desktop_screenshare modal...");
            modals.openModal({
              type: "desktop_screenshare",
              callback: async (data?: string | { id: string; includeAudio: boolean }) => {
                console.info("[Native] Modal callback data:", data);
                if (!data) {
                  return reject(new DOMException("Canceled by user", "NotAllowedError"));
                }

                const sourceId = typeof data === "string" ? data : data.id;
                const includeAudio = typeof data === "string" ? voice.screenshareAudio() : data.includeAudio;

                if (typeof data !== "string") {
                  voice.setScreenshareAudio(includeAudio);
                }

                const isScreen = sourceId.startsWith("screen");
                const dims = SCREEN_SHARE_DIMENSIONS[voice.screenshareResolution()];
                const fps = voice.screenshareFrameRate();

                try {
                  const stream = await navigator.mediaDevices.getUserMedia({
                    audio: isScreen && includeAudio ? {
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
        <VoiceCallCardContext>
          <>
            {props.children}
            <InRoom>
              <RoomAudioManager />
            </InRoom>
          </>
        </VoiceCallCardContext>
      </RoomContext.Provider>
    </voiceContext.Provider>
  );
}

export const useVoice = () => useContext(voiceContext);
