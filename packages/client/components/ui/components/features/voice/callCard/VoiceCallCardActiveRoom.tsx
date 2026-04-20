import { createEffect, Match, Show, Switch, createSignal, onCleanup } from "solid-js";
import {
  isTrackReference,
  TrackLoop,
  TrackReference,
  useEnsureParticipant,
  useIsMuted,
  useIsSpeaking,
  useMaybeTrackRefContext,
  useTrackRefContext,
  useTracks,
  VideoTrack,
} from "solid-livekit-components";

import { Track } from "livekit-client";
import { isLocal } from "@livekit/components-core";
import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { UserContextMenu } from "@revolt/app";
import { useUser } from "@revolt/markdown/users";
import { InRoom } from "@revolt/rtc";
import { Avatar } from "@revolt/ui/components/design";
import { OverflowingText } from "@revolt/ui/components/utils";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import { VoiceStatefulUserIcons } from "../VoiceStatefulUserIcons";

import { VoiceCallCardActions } from "./VoiceCallCardActions";
import { VoiceCallCardStatus } from "./VoiceCallCardStatus";

/**
 * Call card (active)
 */
export function VoiceCallCardActiveRoom() {
  return (
    <View>
      <Call>
        <InRoom>
          <Participants />
        </InRoom>
      </Call>

      <VoiceCallCardStatus />
      <VoiceCallCardActions size="sm" />
    </View>
  );
}

const View = styled("div", {
  base: {
    minHeight: 0,
    height: "100%",
    width: "100%",

    gap: "var(--gap-md)",
    padding: "var(--gap-md)",

    display: "flex",
    flexDirection: "column",
  },
});

const Call = styled("div", {
  base: {
    flexGrow: 1,
    minHeight: 0,
    overflowY: "scroll",
  },
});

/**
 * Show a grid of participants
 */
function Participants() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  return (
    <Grid>
      <TrackLoop tracks={tracks}>{() => <ParticipantTile />}</TrackLoop>
      {/* <div class={tile()} />
      <div class={tile()} />
      <div class={tile()} />
      <div class={tile()} />
      <div class={tile()} /> */}
    </Grid>
  );
}

const Grid = styled("div", {
  base: {
    display: "grid",
    gap: "var(--gap-md)",
    padding: "var(--gap-md)",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
  },
});

/**
 * Individual participant tile
 */
function ParticipantTile() {
  const track = useTrackRefContext();

  return (
    <Switch fallback={<UserTile />}>
      <Match when={track.source === Track.Source.ScreenShare}>
        <ScreenshareTile />
      </Match>
    </Switch>
  );
}

/**
 * Shown when the track source is a camera or placeholder
 */
function UserTile() {
  const participant = useEnsureParticipant();
  const track = useMaybeTrackRefContext();

  const isMuted = useIsMuted({
    participant,
    source: Track.Source.Microphone,
  });

  const isVideoMuted = useIsMuted({
    participant,
    source: Track.Source.Camera,
  });

  const isSpeaking = useIsSpeaking(participant);

  const user = useUser(participant.identity);

  let videoRef: HTMLDivElement | undefined;
  const [isFullscreen, setIsFullscreen] = createSignal(false);

  createEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === videoRef);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    onCleanup(() => document.removeEventListener("fullscreenchange", handleFullscreenChange));

    if (isVideoMuted() && document.fullscreenElement === videoRef) {
      document.exitFullscreen();
    }
  });

  function toggleFullscreen(e: Event) {
    if ((e.target as HTMLElement).closest('.controls-container')) return;

    if (!videoRef || !isTrackReference(track) || isVideoMuted()) return;
    if (!document.fullscreenElement) {
      videoRef.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  return (
    <div
      ref={videoRef}
      class={tile({
        speaking: isSpeaking(),
      }) + " group"}
      onClick={toggleFullscreen}
      style={{ cursor: "pointer" }}
      use:floating={{
        userCard: {
          user: user().user!,
          member: user().member,
        },
        contextMenu: () => (
          <UserContextMenu user={user().user!} member={user().member} inVoice />
        ),
      }}
    >
      <Switch
        fallback={
          <AvatarOnly>
            <Avatar
              src={user().avatar}
              fallback={user().username}
              size={48}
              interactive={false}
            />
          </AvatarOnly>
        }
      >
        <Match when={isTrackReference(track) && !isVideoMuted()}>
          <VideoTrack
            style={{
              "grid-area": "1/1",
              "object-fit": "contain",
              width: "100%",
              height: "100%",
              ...(isLocal(participant) && track.source === Track.Source.Camera
                ? { transform: "scaleX(-1)" }
                : {}),
            }}
            trackRef={track as TrackReference}
            manageSubscription={true}
          />
        </Match>
      </Switch>

      <Overlay showOnHover>
        <OverlayInner>
          <OverflowingText>{user().username}</OverflowingText>
          <VoiceStatefulUserIcons
            userId={participant.identity}
            muted={isMuted()}
          />
          <Show when={isTrackReference(track) && !isVideoMuted()}>
            <FullscreenButtonIcon>
              <Symbol size={22}>{isFullscreen() ? "fullscreen_exit" : "fullscreen"}</Symbol>
            </FullscreenButtonIcon>
          </Show>
        </OverlayInner>
      </Overlay>
      
      <Show when={isFullscreen()}>
        <div class="controls-container" style={{ position: "absolute", bottom: "60px", left: "50%", transform: "translateX(-50%)", "z-index": 20 }}>
          <VoiceCallCardActions size="sm" />
        </div>
      </Show>
    </div>
  );
}

const AvatarOnly = styled("div", {
  base: {
    gridArea: "1/1",
    display: "grid",
    placeItems: "center",
  },
});

/**
 * Shown when the track source is a screenshare
 */
function ScreenshareTile() {
  const participant = useEnsureParticipant();
  const track = useMaybeTrackRefContext();
  const user = useUser(participant.identity);

  const isMuted = useIsMuted({
    participant,
    source: Track.Source.ScreenShareAudio,
  });

  let videoRef: HTMLDivElement | undefined;
  const [isFullscreen, setIsFullscreen] = createSignal(false);

  createEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === videoRef);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    onCleanup(() => document.removeEventListener("fullscreenchange", handleFullscreenChange));
  });

  const toggleFullscreen = (e: Event) => {
    if ((e.target as HTMLElement).closest('.controls-container')) return;
    
    if (!videoRef) return;
    if (!isTrackReference(track)) return;
    if (!document.fullscreenElement) {
      videoRef.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      ref={videoRef}
      class={tile() + " group"}
      onClick={toggleFullscreen}
      style={{ cursor: "pointer" }}
    >
      <VideoTrack
        style={{
          "grid-area": "1/1",
          "object-fit": "contain",
          width: "100%",
          height: "100%",
        }}
        trackRef={track as TrackReference}
        manageSubscription={true}
      />

      <Overlay showOnHover>
        <OverlayInner>
          <OverflowingText>{user().username}</OverflowingText>
          <Show when={isMuted()}>
            <Symbol size={18}>no_sound</Symbol>
          </Show>
          <FullscreenButtonIcon>
            <Symbol size={22}>{isFullscreen() ? "fullscreen_exit" : "fullscreen"}</Symbol>
          </FullscreenButtonIcon>
        </OverlayInner>
      </Overlay>

      <Show when={isFullscreen()}>
        <div class="controls-container" style={{ position: "absolute", bottom: "60px", left: "50%", transform: "translateX(-50%)", "z-index": 20 }}>
          <VoiceCallCardActions size="sm" />
        </div>
      </Show>
    </div>
  );
}

const tile = cva({
  base: {
    display: "grid",
    aspectRatio: "16/9",
    transition: ".3s ease all",
    borderRadius: "var(--borderRadius-lg)",
    position: "relative",

    color: "var(--md-sys-color-on-surface)",
    background: "#0002",

    overflow: "hidden",
    outlineWidth: "3px",
    outlineStyle: "solid",
    outlineOffset: "-3px",
    outlineColor: "transparent",
  },
  variants: {
    speaking: {
      true: {
        outlineColor: "var(--md-sys-color-primary)",
      },
    },
  },
});

const Overlay = styled("div", {
  base: {
    minWidth: 0,
    gridArea: "1/1",
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: "50%",
    background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",

    padding: "var(--gap-md) var(--gap-lg)",

    opacity: 1,
    display: "flex",
    alignItems: "end",
    flexDirection: "row",

    transition: "var(--transitions-fast) all",
    transitionTimingFunction: "ease",
    pointerEvents: "none",
    zIndex: 10,
  },
  variants: {
    showOnHover: {
      true: {
        opacity: 0,

        _groupHover: {
          opacity: 1,
        },
      },
      false: {
        opacity: 1,
      },
    },
  },
  defaultVariants: {
    showOnHover: false,
  },
});

const OverlayInner = styled("div", {
  base: {
    minWidth: 0,
    width: "100%",

    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    pointerEvents: "auto",
    
    textShadow: "0px 1px 3px rgba(0,0,0,1)", 
    fontWeight: 600,

    _first: {
      flexGrow: 1,
    },
  },
});

const FullscreenButtonIcon = styled("div", {
  base: {
    display: "inline-flex",
    transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s, opacity 0.2s",
    opacity: 0.85,
    cursor: "pointer",
    
    _hover: {
      transform: "scale(1.3) translateY(-2px)",
      opacity: 1,
      color: "var(--md-sys-color-primary)",
      filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))",
    },
    
    _active: {
      transform: "scale(0.9)",
    }
  }
});
