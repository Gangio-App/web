import { Show, For } from "solid-js";

import { useLingui, t } from "@lingui-solid/solid/macro";
import { styled } from "styled-system/jsx";

import { CONFIGURATION } from "@revolt/common";
import { useVoice, ScreenShareResolution, ScreenShareFrameRate } from "@revolt/rtc";
import { useState } from "@revolt/state";
import { Button, IconButton } from "@revolt/ui/components/design";
import { Symbol } from "@revolt/ui/components/utils/Symbol";
import { ContextMenu, ContextMenuButton } from "../../../../../app/menus/ContextMenu";
import { useMediaDeviceSelect } from "solid-livekit-components";

export function VoiceCallCardActions(props: { size: "xs" | "sm" }) {
  const voice = useVoice();
  const { t } = useLingui();

  function isVideoEnabled() {
    return CONFIGURATION.ENABLE_VIDEO;
  }

  return (
    <Actions>
      <Show when={props.size === "xs"}>
        <a href={voice.channel()?.path}>
          <IconButton variant="standard" size={props.size}>
            <Symbol>arrow_top_left</Symbol>
          </IconButton>
        </a>
      </Show>
      <SplitAction>
        <IconButton
          size={props.size}
          variant={voice.microphone() ? "filled" : "tonal"}
          onPress={() => voice.toggleMute()}
          use:floating={{
            contextMenu: () => <MicMenu />,
            tooltip: voice.speakingPermission
              ? undefined
              : {
                  placement: "top",
                  content: t`Missing permission`,
                },
          }}
          isDisabled={!voice.speakingPermission}
        >
          <Show when={voice.microphone()} fallback={<Symbol>mic_off</Symbol>}>
            <Symbol>mic</Symbol>
          </Show>
        </IconButton>
      </SplitAction>

      <SplitAction>
        <IconButton
          size={props.size}
          variant={voice.deafen() || !voice.listenPermission ? "tonal" : "filled"}
          onPress={() => voice.toggleDeafen()}
          use:floating={{
            contextMenu: () => <SpeakerMenu />,
            tooltip: voice.listenPermission
              ? undefined
              : {
                  placement: "top",
                  content: t`Missing permission`,
                },
          }}
          isDisabled={!voice.listenPermission}
        >
          <Show
            when={voice.deafen() || !voice.listenPermission}
            fallback={<Symbol>headset</Symbol>}
          >
            <Symbol>headset_off</Symbol>
          </Show>
        </IconButton>
      </SplitAction>
      <IconButton
        size={props.size}
        variant={isVideoEnabled() && voice.video() ? "filled" : "tonal"}
        onPress={() => {
          if (isVideoEnabled()) voice.toggleCamera();
        }}
        use:floating={{
          tooltip: {
            placement: "top",
            content: isVideoEnabled()
              ? voice.video()
                ? "Stop Camera"
                : "Start Camera"
              : "Coming soon! 👀",
          },
        }}
        isDisabled={!isVideoEnabled()}
      >
        <Symbol>camera_video</Symbol>
      </IconButton>
      <SplitAction>
        <div
          use:floating={{
            contextMenu: () => <ScreenshareMenu />,
            tooltip: {
              placement: "top",
              content: isVideoEnabled()
                ? voice.screenshare()
                  ? t`Stop Sharing`
                  : t`Share Screen`
                : t`Coming soon! 👀`,
            },
          }}
        >
          <IconButton
            size={props.size}
            variant={isVideoEnabled() && voice.screenshare() ? "filled" : "tonal"}
            onPress={() => {
              if (isVideoEnabled()) voice.toggleScreenshare();
            }}
            isDisabled={!isVideoEnabled()}
          >
            <Show
              when={voice.screenshare()}
              fallback={<Symbol>screen_share</Symbol>}
            >
              <Symbol>stop_screen_share</Symbol>
            </Show>
          </IconButton>
        </div>
      </SplitAction>
      <Button
        size={props.size}
        variant="_error"
        onPress={() => voice.disconnect()}
      >
        <Symbol>call_end</Symbol>
      </Button>
    </Actions>
  );
}

const Actions = styled("div", {
  base: {
    flexShrink: 0,
    gap: "var(--gap-sm)",
    padding: "var(--gap-sm)",

    display: "flex",
    width: "fit-content",
    justifyContent: "center",
    alignSelf: "center",

    borderRadius: "var(--borderRadius-full)",
    background: "var(--md-sys-color-surface-container)",
  },
});

const SplitAction = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--gap-xs)",
  }
});

function MicMenu() {
  const state = useState();
  const { activeDeviceId, devices, setActiveMediaDevice } = useMediaDeviceSelect({ kind: "audioinput" });
  
  const activeId = () => (activeDeviceId() === "default" ? state.voice.preferredAudioInputDevice : undefined) ?? activeDeviceId();

  return (
    <ContextMenu>
      <For each={devices()}>
        {(device) => (
          <ContextMenuButton 
            icon={() => <Symbol>{device.deviceId === activeId() ? "radio_button_checked" : "radio_button_unchecked"}</Symbol>}
            onClick={() => {
              state.voice.preferredAudioInputDevice = device.deviceId;
              setActiveMediaDevice(device.deviceId);
            }}
          >
            {device.label || "Default Microphone"}
          </ContextMenuButton>
        )}
      </For>
    </ContextMenu>
  );
}

function SpeakerMenu() {
  const state = useState();
  const { activeDeviceId, devices, setActiveMediaDevice } = useMediaDeviceSelect({ kind: "audiooutput" });
  
  const activeId = () => (activeDeviceId() === "default" ? state.voice.preferredAudioOutputDevice : undefined) ?? activeDeviceId();

  return (
    <ContextMenu>
      <For each={devices()}>
        {(device) => (
          <ContextMenuButton 
            icon={() => <Symbol>{device.deviceId === activeId() ? "radio_button_checked" : "radio_button_unchecked"}</Symbol>}
            onClick={() => {
              state.voice.preferredAudioOutputDevice = device.deviceId;
              setActiveMediaDevice(device.deviceId);
            }}
          >
            {device.label || "Default Speaker"}
          </ContextMenuButton>
        )}
      </For>
    </ContextMenu>
  );
}

function ScreenshareMenu() {
  const state = useState();
  const { t } = useLingui();
  
  const resolutions: { label: string; value: ScreenShareResolution }[] = [
    { label: t`4K (2160p)`, value: "4k" },
    { label: t`Ultra (1440p)`, value: "ultra" },
    { label: t`High (1080p)`, value: "high" },
    { label: t`Medium (720p)`, value: "medium" },
    { label: t`Low (360p)`, value: "low" },
  ];

  const frameRates: { label: string; value: ScreenShareFrameRate }[] = [
    { label: t`60 FPS`, value: 60 },
    { label: t`30 FPS`, value: 30 },
    { label: t`24 FPS`, value: 24 },
    { label: t`15 FPS`, value: 15 },
  ];

  const update = (res?: ScreenShareResolution, fps?: ScreenShareFrameRate, audio?: boolean) => {
    state.voice.updateScreenShareSettings(
      res ?? state.voice.screenshareResolution(),
      fps ?? state.voice.screenshareFrameRate(),
      audio ?? state.voice.screenshareAudio()
    );
  };

  return (
    <ContextMenu>
      <div style={{ padding: "8px 12px", "font-size": "11px", "font-weight": "bold", color: "var(--md-sys-color-on-surface-variant)", "text-transform": "uppercase" }}>{t`Resolution`}</div>
      <For each={resolutions}>
        {(res) => (
          <ContextMenuButton 
            icon={() => <Symbol>{res.value === state.voice.screenshareResolution() ? "radio_button_checked" : "radio_button_unchecked"}</Symbol>}
            onClick={() => update(res.value)}
          >
            {res.label}
          </ContextMenuButton>
        )}
      </For>
      <div style={{ "border-top": "1px solid var(--md-sys-color-outline-variant)", "margin-top": "4px", "padding-top": "4px" }} />
      <div style={{ padding: "8px 12px", "font-size": "11px", "font-weight": "bold", color: "var(--md-sys-color-on-surface-variant)", "text-transform": "uppercase" }}>{t`Frame Rate`}</div>
      <For each={frameRates}>
        {(fps) => (
          <ContextMenuButton 
            icon={() => <Symbol>{fps.value === state.voice.screenshareFrameRate() ? "radio_button_checked" : "radio_button_unchecked"}</Symbol>}
            onClick={() => update(undefined, fps.value)}
          >
            {fps.label}
          </ContextMenuButton>
        )}
      </For>
      <div style={{ "border-top": "1px solid var(--md-sys-color-outline-variant)", "margin-top": "4px", "padding-top": "4px" }} />
      <ContextMenuButton 
        icon={() => <Symbol>{state.voice.screenshareAudio() ? "check_box" : "check_box_outline_blank"}</Symbol>}
        onClick={() => update(undefined, undefined, !state.voice.screenshareAudio())}
      >
        {t`Include System Audio`}
      </ContextMenuButton>
      <div style={{ "border-top": "1px solid var(--md-sys-color-outline-variant)", "margin-top": "4px", "padding-top": "4px" }} />
      <ContextMenuButton 
        icon={() => <Symbol>{state.voice.previewPaused() ? "play_circle" : "pause_circle"}</Symbol>}
        onClick={() => state.voice.togglePreviewPause()}
      >
        {state.voice.previewPaused() ? t`Resume Preview` : t`Pause Preview`}
      </ContextMenuButton>
    </ContextMenu>
  );
}
