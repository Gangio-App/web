import { createSignal, onMount, onCleanup, Show } from "solid-js";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { User } from "stoat.js";
import { styled } from "styled-system/jsx";

import { useState } from "@revolt/state";

import { Text, typography } from "../../design";

import { ProfileCard } from "./ProfileCard";

export function ProfileStatus(props: { user: User }) {
  const { t } = useLingui();
  const state = useState();
  const [spotifyTrack, setSpotifyTrack] = createSignal<any>(null);

  const streamerMode = () => state.settings.getValue("privacy:streamer_mode");

  const fetchSpotify = async () => {
    try {
      const response = await fetch(`/api/spotify/nowplaying/${props.user.id}`);
      if (!response.ok) return;
      const data = await response.json();
      setSpotifyTrack(data.isPlaying ? data : null);
    } catch (err) {
      console.error("Spotify status fetch error:", err);
    }
  };

  onMount(() => {
    if (streamerMode()) return;
    fetchSpotify();
    const interval = setInterval(fetchSpotify, 15000);
    onCleanup(() => clearInterval(interval));
  });

  return (
    <Show when={props.user.status?.text || (!streamerMode() && spotifyTrack())}>
      <ProfileCard>
        <Text class="title" size="large">
          <Trans>Status</Trans>
        </Text>
        <Column gap="xs">
          <Show when={props.user.status?.text}>
            <Status>
              {props.user.statusMessage((s) =>
                s === "Online"
                  ? t`Online`
                  : s === "Busy"
                    ? t`Busy`
                    : s === "Focus"
                      ? t`Focus`
                      : s === "Idle"
                        ? t`Idle`
                        : t`Offline`,
              )}
            </Status>
          </Show>
          <Show when={!streamerMode() && spotifyTrack()}>
            {(track) => (
              <SpotifyStatus>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.306c-.215.353-.674.464-1.027.249-2.846-1.738-6.429-2.13-10.648-1.168-.403.093-.813-.16-.905-.562-.092-.403.16-.814.562-.905 4.616-1.055 8.577-.61 11.768 1.34.353.215.464.674.25 1.027zm1.467-3.26c-.27.439-.844.58-1.282.31-3.256-2-8.22-2.584-12.07-1.415-.494.15-.1.15-.494-.15-.41-.58-.15-1.28-.41-1.28.31 4.394-1.334 9.878-.667 13.593 1.62.439.27.58.844.31 1.282zm.126-3.37c-3.903-2.318-10.334-2.532-14.072-1.397-.6.182-1.242-.164-1.424-.764-.182-.6.164-1.242.764-1.424 4.29-1.303 11.394-1.053 15.89 1.617.54.32.714 1.018.394 1.558-.32.54-1.018.714-1.558.394z"/>
                </svg>
                <span class="track-info">
                  Listening to <b>{track().title}</b> by <b>{track().artist}</b>
                </span>
              </SpotifyStatus>
            )}
          </Show>
        </Column>
      </ProfileCard>
    </Show>
  );
}

const Column = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
  },
  variants: {
    gap: {
      xs: { gap: "var(--gap-xs)" },
    },
  },
});

const Status = styled("span", {
  base: {
    ...typography.raw(),
    userSelect: "text",
    fontSize: "0.9em",
  },
});

const SpotifyStatus = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--gap-sm)",
    color: "#1DB954",
    fontSize: "0.85em",
    "& svg": {
      width: "14px",
      height: "14px",
      flexShrink: 0,
    },
    "& .track-info": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      color: "var(--md-sys-color-on-surface-variant)",
      "& b": {
        color: "var(--md-sys-color-on-surface)",
      },
    },
  },
});
