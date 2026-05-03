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

import { Room, Track } from "livekit-client";
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
        resolution: { width: 1920, height: 1080, frameRate: 60 },
      },
      videoCaptureDefaults: {
        resolution: { width: 1280, height: 720, frameRate: 30 },
      },
      publishDefaults: {
        screenShareEncoding: {
          maxBitrate: 8_000_000,
          maxFramerate: 60,
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
    });

    room.addListener("connected", () => {
      this.#setState("CONNECTED");

      // Allow participant join/leave sounds after initial connect settles.
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

  async toggleScreenshare() {
    const room = this.room();
    if (!room || this.state() !== "CONNECTED") return;
    
    const isEnabled = room.localParticipant.isScreenShareEnabled;
    
    try {
      await room.localParticipant.setScreenShareEnabled(
        !isEnabled,
        {
          resolution: { width: 1920, height: 1080, frameRate: 60 },
        },
        {
          videoEncoding: {
            maxBitrate: 8_000_000,
            maxFramerate: 60,
          },
          videoCodec: "vp9",
        },
      );
    } catch (e) {
      console.error("Failed to toggle screenshare", e);
    }

    this.#setScreenshare(room.localParticipant.isScreenShareEnabled);
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

                      try {
                        const stream = await navigator.mediaDevices.getUserMedia({
                            audio: isScreen ? {
                               mandatory: {
                                  chromeMediaSource: "desktop",
                                  chromeMediaSourceId: sourceId,
                               }
                            } : false as any,
                            video: {
                                mandatory: {
                                   chromeMediaSource: "desktop",
                                   chromeMediaSourceId: sourceId,
                                   maxWidth: 1920,
                                   maxHeight: 1080,
                                   maxFrameRate: 60,
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
                                      maxWidth: 1920,
                                      maxHeight: 1080,
                                      maxFrameRate: 60,
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
