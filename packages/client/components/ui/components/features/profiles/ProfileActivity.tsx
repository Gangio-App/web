import { createSignal, onCleanup, onMount, Show, Switch, Match } from "solid-js";
import { styled } from "styled-system/jsx";
import MdLiveTv from "@material-symbols/svg-400/outlined/live_tv.svg?component-solid";

type SteamActivity = {
  isPlaying: boolean;
  appid?: string;
  game?: string;
  iconUrl?: string | null;
  logoUrl?: string | null;
  profileUrl?: string;
};

type SpotifyActivity = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  url?: string;
  duration_ms?: number;
  progress_ms?: number;
};

type AnimeActivity = {
  isWatching: boolean;
  title: string;
  episode: string;
  poster: string;
  url: string;
  progress?: number;
  duration?: number;
};

// Steam CDN small icon
function steamIcon(appid?: string, iconUrl?: string | null): string {
  if (appid && iconUrl) {
    const hash = iconUrl.replace(/^.*\/([a-f0-9]+)\.jpg$/, "$1");
    return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/apps/${appid}/${hash}.jpg`;
  }
  if (appid) {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_sm_120.jpg`;
  }
  return "/assets/socials/steam.svg";
}

export function ProfileActivity(props: { userId: string }) {
  const [steam, setSteam] = createSignal<SteamActivity | null>(null);
  const [spotify, setSpotify] = createSignal<SpotifyActivity | null>(null);
  const [anime, setAnime] = createSignal<AnimeActivity | null>(null);
  const [progress, setProgress] = createSignal(0);
  const [status, setStatus] = createSignal<
    "loading" | "steam" | "anime" | "spotify" | "idle" | "error"
  >("loading");

  const fetchActivity = async () => {
    try {
      const [steamRes, spotifyRes, animeRes] = await Promise.allSettled([
        fetch(`/api/steam/nowplaying/${props.userId}`),
        fetch(`/api/spotify/nowplaying/${props.userId}`),
        fetch(`/api/anime/watching/${props.userId}`),
      ]);

      const steamOk = steamRes.status === "fulfilled" && steamRes.value && steamRes.value.ok;
      const spotifyOk = spotifyRes.status === "fulfilled" && spotifyRes.value && spotifyRes.value.ok;
      const animeOk = animeRes.status === "fulfilled" && animeRes.value && animeRes.value.ok;

      const steamJson: SteamActivity | null = steamOk ? await (steamRes.value as Response).json() : null;
      const spotifyJson: SpotifyActivity | null = spotifyOk ? await (spotifyRes.value as Response).json() : null;
      const animeJson: AnimeActivity | null = animeOk ? await (animeRes.value as Response).json() : null;

      if (steamJson && steamJson.isPlaying) {
        setSteam(steamJson);
        setAnime(null);
        setSpotify(null);
        setStatus("steam");
        return;
      }

      if (animeJson && animeJson.isWatching) {
        setSteam(null);
        setAnime(animeJson);
        setSpotify(null);
        setProgress((animeJson.progress || 0) * 1000);
        setStatus("anime");
        return;
      }

      if (spotifyJson && spotifyJson.isPlaying) {
        setSteam(null);
        setAnime(null);
        setSpotify(spotifyJson);
        setProgress(spotifyJson.progress_ms || 0);
        setStatus("spotify");
        return;
      }

      setSteam(null);
      setAnime(null);
      setSpotify(null);
      setProgress(0);
      setStatus("idle");
    } catch (e) {
      setSteam(null);
      setAnime(null);
      setSpotify(null);
      setProgress(0);
      setStatus("error");
    }
  };

  onMount(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 15000);
    const progressInterval = setInterval(() => {
      const s = spotify();
      const a = anime();
      if (s && s.duration_ms) {
        setProgress((prev) => Math.min(prev + 1000, s.duration_ms!));
      } else if (a && a.duration) {
        setProgress((prev) => Math.min(prev + 1000, a.duration! * 1000));
      }
    }, 1000);
    onCleanup(() => {
      clearInterval(interval);
      clearInterval(progressInterval);
    });
  });

  return (
    <Show when={status() !== "idle"}>
      <Column gap="xs" style={{ padding: "0 4px" }}>
        <SectionTitle>Activity</SectionTitle>

        <div style={{ overflow: "hidden" }}>
          <Switch>
            <Match when={status() === "steam" && steam()}>
              {(a) => (
                <a
                  href={a().appid ? `https://store.steampowered.com/app/${a().appid}` : a().profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "12px",
                    "border-radius": "12px",
                    background: "rgba(102,192,244,0.06)",
                    border: "1px solid rgba(102,192,244,0.15)",
                    "text-decoration": "none",
                  }}
                >
                  <div style={{ position: "relative", "flex-shrink": "0" }}>
                    <img
                      src={steamIcon(a().appid, a().iconUrl)}
                      alt=""
                      style={{
                        display: "block",
                        width: "54px",
                        height: "54px",
                        "border-radius": "8px",
                        "object-fit": "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-2px",
                        right: "-2px",
                        width: "18px",
                        height: "18px",
                        "border-radius": "50%",
                        background: "#1a9fff",
                        border: "2px solid var(--md-sys-color-surface-container-low)",
                        display: "flex",
                        "align-items": "center",
                        "justify-content": "center",
                      }}
                    >
                      <img src="/assets/socials/steam.svg" width={9} height={9} />
                    </div>
                  </div>

                  <div style={{ flex: "1", "min-width": "0", display: "flex", "flex-direction": "column", "justify-content": "center" }}>
                    <div style={{ "font-size": "10px", "font-weight": "800", color: "#66c0f4", "text-transform": "uppercase", "margin-bottom": "2px" }}>
                      Steam
                    </div>
                    <div style={{ "font-size": "14px", "font-weight": "800", "line-height": "1.2", color: "var(--md-sys-color-on-surface)", overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>
                      {a().game}
                    </div>
                    <div style={{ "font-size": "12px", color: "var(--md-sys-color-on-surface-variant)", opacity: "0.8" }}>
                      Playing now
                    </div>
                  </div>
                </a>
              )}
            </Match>

            <Match when={status() === "anime" && anime()}>
              {(n) => (
                <a
                  href={n().url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    "flex-direction": "column",
                    gap: "8px",
                    padding: "12px",
                    "border-radius": "12px",
                    background: "rgba(255,100,0,0.06)",
                    border: "1px solid rgba(255,100,0,0.15)",
                    "text-decoration": "none",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
                    <div style={{ position: "relative", "flex-shrink": "0" }}>
                      <img
                        src={n().poster}
                        alt=""
                        style={{
                          display: "block",
                          width: "54px",
                          height: "54px",
                          "border-radius": "8px",
                          "object-fit": "cover",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-2px",
                          right: "-2px",
                          width: "18px",
                          height: "18px",
                          "border-radius": "50%",
                          background: "#ff6400",
                          border: "2px solid var(--md-sys-color-surface-container-low)",
                          display: "flex",
                          "align-items": "center",
                          "justify-content": "center",
                        }}
                      >
                        <MdLiveTv width={10} height={10} fill="white" />
                      </div>
                    </div>

                    <div style={{ flex: "1", "min-width": "0" }}>
                      <div style={{ "font-size": "10px", "font-weight": "800", color: "#ff6400", "text-transform": "uppercase", "margin-bottom": "2px" }}>
                        AnimeKAI
                      </div>
                      <div style={{ "font-size": "14px", "font-weight": "800", "line-height": "1.2", color: "var(--md-sys-color-on-surface)", overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>
                        {n().title}
                      </div>
                      <div style={{ "font-size": "12px", color: "var(--md-sys-color-on-surface-variant)", opacity: "0.8" }}>
                        Watching now • Ep {n().episode}
                      </div>
                    </div>
                  </div>

                  <Show when={n().duration}>
                    <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", "border-radius": "2px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            background: "#ff6400",
                            width: `${Math.min(100, (progress() / (n().duration! * 1000)) * 100)}%`
                          }}
                        />
                    </div>
                  </Show>
                </a>
              )}
            </Match>

            <Match when={status() === "spotify" && spotify()}>
              {(s) => (
                <a
                  href={s().url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    "flex-direction": "column",
                    gap: "8px",
                    padding: "12px",
                    "border-radius": "12px",
                    background: "rgba(29,185,84,0.06)",
                    border: "1px solid rgba(29,185,84,0.12)",
                    "text-decoration": "none",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px", "align-items": "center" }}>
                    <div style={{ position: "relative", "flex-shrink": "0" }}>
                      <img
                        src={s().albumArt}
                        style={{
                          display: "block",
                          width: "54px",
                          height: "54px",
                          "border-radius": "8px",
                          "object-fit": "cover",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: "-2px",
                          right: "-2px",
                          width: "18px",
                          height: "18px",
                          "border-radius": "50%",
                          background: "#1db954",
                          border: "2px solid var(--md-sys-color-surface-container-low)",
                          display: "flex",
                          "align-items": "center",
                          "justify-content": "center",
                        }}
                      >
                        <img src="/assets/socials/spotify.svg" width={9} height={9} />
                      </div>
                    </div>

                    <div style={{ flex: "1", "min-width": "0" }}>
                      <div style={{ "font-size": "10px", "font-weight": "800", color: "#1db954", "text-transform": "uppercase", "margin-bottom": "2px" }}>
                        Spotify
                      </div>
                      <div style={{ "font-size": "14px", "font-weight": "800", "line-height": "1.2", color: "var(--md-sys-color-on-surface)", overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>
                        {s().title}
                      </div>
                      <div style={{ "font-size": "12px", color: "var(--md-sys-color-on-surface-variant)", opacity: "0.8", overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>
                        by {s().artist}
                      </div>
                    </div>
                  </div>
                  
                  <Show when={s().duration_ms}>
                    <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", "border-radius": "2px", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            background: "#1db954",
                            width: `${(progress() / s().duration_ms!) * 100}%`
                          }}
                        />
                    </div>
                  </Show>
                </a>
              )}
            </Match>
          </Switch>
        </div>
      </Column>
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
      none: { gap: "0" },
      xs: { gap: "4px" },
      sm: { gap: "8px" },
      md: { gap: "16px" },
    },
  },
});

const SectionTitle = styled("div", {
  base: {
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    color: "var(--md-sys-color-on-surface-variant)",
    opacity: 0.8,
    marginBottom: "4px",
    letterSpacing: "0.03em",
  },
});