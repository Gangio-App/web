import { createEffect, createSignal, Show } from "solid-js";
import { useClient } from "@revolt/client";
import { Trans } from "@lingui-solid/solid/macro";
import { styled } from "styled-system/jsx";

import { useState } from "@revolt/state";
import {
  Column,
  iconSize,
} from "@revolt/ui";

import MdCheckCircle from "@material-design-icons/svg/filled/check_circle.svg?component-solid";
import MdLinkOff from "@material-design-icons/svg/outlined/link_off.svg?component-solid";

export function Integrations() {
  const client = useClient();
  const state = useState();
  const [spotifyConnected, setSpotifyConnected] = createSignal(false);
  const [steamConnected, setSteamConnected] = createSignal(false);

  const streamerMode = () => state.settings.getValue("privacy:streamer_mode");
  const apiUrl = import.meta.env.VITE_API_URL || "https://gangio.pro/api";

  const checkSpotifyStatus = async () => {
    const userId = client().user?.id;
    if (!userId) return;
    try {
      const spotifyStatus = await fetch(`${apiUrl}/spotify/status/${userId}`, { cache: "no-store" }).then(r => r.json());
      setSpotifyConnected(spotifyStatus.connected);
    } catch (e) {
      console.error("Failed to check Spotify status", e);
    }
  };

  const checkSteamStatus = async () => {
    const userId = client().user?.id;
    if (!userId) return;
    try {
      const steamStatus = await fetch(`${apiUrl}/steam/status/${userId}`, { cache: "no-store" }).then(r => r.json());
      setSteamConnected(steamStatus.connected);
    } catch (e) {
      console.error("Failed to check Steam status", e);
    }
  };

  createEffect(() => {
    checkSpotifyStatus();
    checkSteamStatus();
  });

  const linkSpotify = () => {
    if (streamerMode()) return;
    const userId = client().user?.id;
    if (!userId) return;

    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "1c3e239518c74651a4e758e37be6947d";
    const callbackUrl = import.meta.env.VITE_SPOTIFY_CALLBACK || "https://gangio.pro/api/spotify/callback";
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=${encodeURIComponent("user-read-currently-playing")}&state=${userId}`;

    const popup = window.open(authUrl, "_blank", "width=600,height=800");
    const timer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(timer);
        checkSpotifyStatus();
      }
    }, 1000);
  };

  const disconnectSpotify = async (e?: Event) => {
    e?.stopPropagation();
    const userId = client().user?.id;
    if (!userId) return;

    try {
      await fetch(`${apiUrl}/spotify/disconnect/${userId}`, { method: 'POST' });
      setSpotifyConnected(false);
    } catch (e) {
      console.error("Failed to disconnect Spotify", e);
    }
  };

  const linkSteam = () => {
    if (streamerMode()) return;
    const userId = client().user?.id;
    if (!userId) return;

    const url = `${apiUrl}/steam/link?userId=${encodeURIComponent(userId)}`;
    const popup = window.open(url, "_blank", "width=600,height=800");
    const timer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(timer);
        checkSteamStatus();
      }
    }, 1000);
  };

  const disconnectSteam = async (e?: Event) => {
    e?.stopPropagation();
    const userId = client().user?.id;
    if (!userId) return;

    try {
      await fetch(`${apiUrl}/steam/disconnect/${userId}`, { method: 'POST' });
      setSteamConnected(false);
    } catch (e) {
      console.error("Failed to disconnect Steam", e);
    }
  };

  return (
    <Column gap="lg">
      <Show when={streamerMode()}>
        <Banner>
          <MdLinkOff {...iconSize(22)} />
          <Trans>Integrations are hidden while Streamer Mode is enabled.</Trans>
        </Banner>
      </Show>

      <CardsContainer>
        <IntegrationCard
          onClick={spotifyConnected() ? undefined : linkSpotify}
          disabled={streamerMode()}
          brand="spotify"
        >
          <IntegrationLogo>
            <img src="/assets/socials/spotify.svg" />
          </IntegrationLogo>
          <IntegrationInfo>
            <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
              <IntegrationTitle>Spotify</IntegrationTitle>
              <Show when={spotifyConnected()}>
                <StatusBadge brand="spotify">
                  <MdCheckCircle {...iconSize(14)} />
                  <Trans>Connected</Trans>
                </StatusBadge>
              </Show>
            </div>
            <IntegrationDescription>
              {spotifyConnected() ? (
                <Trans>Now Playing is active and verified.</Trans>
              ) : (
                <Trans>Share what you're listening to with others.</Trans>
              )}
            </IntegrationDescription>
          </IntegrationInfo>
          <div style={{ 'margin-left': 'auto', display: 'flex', 'gap': '12px', 'align-items': 'center' }}>
            <Show
              when={spotifyConnected()}
              fallback={!streamerMode() && <ActionButton variant="primary">Connect</ActionButton>}
            >
              <ActionButton onClick={disconnectSpotify} variant="error">
                <MdLinkOff {...iconSize(18)} />
              </ActionButton>
            </Show>
          </div>
        </IntegrationCard>

        <IntegrationCard
          onClick={steamConnected() ? undefined : linkSteam}
          disabled={streamerMode()}
          brand="steam"
        >
          <IntegrationLogo>
            <img src="/assets/socials/steam.svg" />
          </IntegrationLogo>
          <IntegrationInfo>
            <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
              <IntegrationTitle>Steam</IntegrationTitle>
              <Show when={steamConnected()}>
                <StatusBadge brand="steam">
                  <MdCheckCircle {...iconSize(14)} />
                  <Trans>Connected</Trans>
                </StatusBadge>
              </Show>
            </div>
            <IntegrationDescription>
              {steamConnected() ? (
                <Trans>Steam activities are now visible.</Trans>
              ) : (
                <Trans>Show your current games on your profile.</Trans>
              )}
            </IntegrationDescription>
          </IntegrationInfo>
          <div style={{ 'margin-left': 'auto', display: 'flex', 'gap': '12px', 'align-items': 'center' }}>
            <Show
              when={steamConnected()}
              fallback={!streamerMode() && <ActionButton variant="primary">Connect</ActionButton>}
            >
              <ActionButton onClick={disconnectSteam} variant="error">
                <MdLinkOff {...iconSize(18)} />
              </ActionButton>
            </Show>
          </div>
        </IntegrationCard>
      </CardsContainer>
    </Column>
  );
}

const CardsContainer = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
});

const IntegrationCard = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    padding: "20px",
    background: "var(--md-sys-color-surface-container-low)",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "1px solid var(--md-sys-color-outline-variant)",
    gap: "16px",

    _hover: {
      background: "var(--md-sys-color-surface-container-high)",
      borderColor: "var(--md-sys-color-outline)",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },

    "@media (max-width: 768px)": {
      borderRadius: 0,
      margin: "0 -12px",
      width: "calc(100% + 24px)",
      borderBottom: "1px solid var(--md-sys-color-outline-variant)",
      borderTop: "none",
      borderLeft: "none",
      borderRight: "none",
      padding: "16px 20px",
    },
  },
  variants: {
    disabled: {
      true: {
        opacity: 0.5,
        cursor: "not-allowed",
        pointerEvents: "none",
      },
    },
    brand: {
      spotify: {
        _hover: {
          borderColor: "#1DB954",
        },
      },
      steam: {
        _hover: {
          borderColor: "#1b2838",
        },
      },
    },
  },
});

const IntegrationLogo = styled("div", {
  base: {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--md-sys-color-surface)",
    borderRadius: "12px",
    flexShrink: 0,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",

    "& img": {
      width: "28px",
      height: "28px",
      objectFit: "contain",
    },
  },
});

const IntegrationInfo = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: 0,
  },
});

const IntegrationTitle = styled("h3", {
  base: {
    fontSize: "18px",
    fontWeight: 600,
    color: "var(--md-sys-color-on-surface)",
    margin: 0,
  },
});

const IntegrationDescription = styled("p", {
  base: {
    fontSize: "14px",
    color: "var(--md-sys-color-on-surface-variant)",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});

const StatusBadge = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "2px 8px",
    borderRadius: "100px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  variants: {
    brand: {
      spotify: {
        color: "#1DB954",
        background: "rgba(29, 185, 84, 0.1)",
      },
      steam: {
        color: "#66c0f4",
        background: "rgba(102, 192, 244, 0.1)",
      },
    },
  },
});

const ActionButton = styled("button", {
  base: {
    padding: "8px 16px",
    borderRadius: "10px",
    border: "none",
    fontWeight: 600,
    fontSize: "14px",
    transition: "all 0.1s",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  variants: {
    variant: {
      primary: {
        background: "var(--md-sys-color-primary)",
        color: "var(--md-sys-color-on-primary)",
        _hover: { opacity: 0.9 },
      },
      error: {
        background: "rgba(255, 68, 68, 0.1)",
        color: "#ff4444",
        padding: "8px",
        borderRadius: "50%",
        _hover: { background: "rgba(255, 68, 68, 0.2)" },
      },
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});

const Banner = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background: "var(--md-sys-color-surface-container-highest)",
    borderRadius: "12px",
    fontSize: "14px",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});
