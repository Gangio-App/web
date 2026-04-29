import { createSignal, onMount, onCleanup, For, Show, Switch, Match } from "solid-js";
import { useQuery } from "@tanstack/solid-query";
import { styled } from "styled-system/jsx";
import { css } from "styled-system/css";
import { ServerMember, User, Server } from "stoat.js";

import { Dialog, DialogProps, Profile, Avatar, OverflowingText } from "@revolt/ui";
import { useClient } from "@revolt/client";

import { useModals } from "..";
import { Modals } from "../types";

// --- Activity types ---
type SteamActivity = {
  isPlaying: boolean;
  game?: string;
  appid?: string;
  iconUrl?: string | null;
  recent?: {
    appid: string;
    name: string;
    iconUrl?: string;
    last_played?: number;
  }[];
};

type SpotifyActivity = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  albumArt?: string;
  url?: string;
  duration_ms?: number;
  progress_ms?: number;
};

type AnimeActivity = {
  isWatching: boolean;
  title?: string;
  episode?: string;
  poster?: string;
  url?: string;
  progress?: number;
  duration?: number;
};

type ActivityItem = {
  type: "steam" | "spotify" | "anime";
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  url?: string;
  timestamp: Date;
  isRecent?: boolean;
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

type TabType = "activity" | "friends" | "servers";

export function UserProfileModal(
  props: DialogProps & Modals & { type: "user_profile" },
) {
  const { openModal } = useModals();
  const client = useClient();
  const [activeTab, setActiveTab] = createSignal<TabType>("activity");
  const activityQuery = useQuery(() => ({
    queryKey: ["activity", props.user.id],
    queryFn: async () => {
      const items: ActivityItem[] = [];
      const now = new Date();
      try {
        const [steamRes, spotifyRes, animeRes] = await Promise.allSettled([
          fetch(`/api/steam/nowplaying/${props.user.id}`),
          fetch(`/api/spotify/nowplaying/${props.user.id}`),
          fetch(`/api/anime/watching/${props.user.id}`),
        ]);

        const items: ActivityItem[] = [];
        const now = new Date();

        // Steam
        if (steamRes.status === "fulfilled" && steamRes.value.ok) {
          const data: SteamActivity = await steamRes.value.json();
          // Current game
          if (data.isPlaying && data.game) {
            const iconUrl = data.iconUrl || (data.appid
              ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${data.appid}/capsule_sm_120.jpg`
              : "/assets/socials/steam.svg");
            items.push({
              type: "steam",
              label: data.game,
              sublabel: "Playing now",
              icon: iconUrl,
              color: "#66c0f4",
              url: data.appid ? `https://store.steampowered.com/app/${data.appid}` : undefined,
              timestamp: now,
            });
          }

          // History (last 5)
          if (data.recent && data.recent.length > 0) {
            data.recent.slice(0, 5).forEach(game => {
              // Don't show if it's the currently playing one
              if (data.isPlaying && String(data.appid) == String(game.appid)) return;

              items.push({
                type: "steam",
                label: game.name,
                sublabel: "Recently played",
                icon: game.iconUrl || (game.appid ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/capsule_sm_120.jpg` : "/assets/socials/steam.svg"),
                color: "#66c0f4",
                url: game.appid ? `https://store.steampowered.com/app/${game.appid}` : undefined,
                timestamp: game.last_played ? new Date(game.last_played * 1000) : new Date(Date.now() - 1000 * 60 * 60 * 24),
                isRecent: true
              });
            });
          }
        }

        // Spotify
        if (spotifyRes.status === "fulfilled" && spotifyRes.value.ok) {
          const data: SpotifyActivity = await spotifyRes.value.json();
          if (data.isPlaying && data.title) {
            items.push({
              type: "spotify",
              label: data.title,
              sublabel: `by ${data.artist || "Unknown"}`,
              icon: data.albumArt || "/assets/socials/spotify.svg",
              color: "#2daa00ff",
              url: data.url,
              timestamp: now,
            });
          } else if (data.isRecent && data.title) {
            items.push({
              type: "spotify",
              label: data.title,
              sublabel: `Last played by ${data.artist || "Unknown"}`,
              icon: data.albumArt || "/assets/socials/spotify.svg",
              color: "#2daa00ff",
              url: data.url,
              timestamp: data.playedAt ? new Date(data.playedAt) : now,
              isRecent: true
            });
          }
        }

        // Anime
        if (animeRes.status === "fulfilled" && animeRes.value.ok) {
          const data: AnimeActivity = await animeRes.value.json();
          if (data.isWatching && data.title) {
            items.push({
              type: "anime",
              label: data.title,
              sublabel: `Watching Ep ${data.episode || "?"}`,
              icon: data.poster || "/assets/socials/anime.svg",
              color: "#ff6400",
              url: data.url,
              timestamp: now,
            });
          } else if (data.isRecent && data.title) {
            items.push({
              type: "anime",
              label: data.title,
              sublabel: `Last watched Ep ${data.episode || "?"}`,
              icon: data.poster || "/assets/socials/anime.svg",
              color: "#ff6400",
              url: data.url,
              timestamp: data.updatedAt ? new Date(data.updatedAt) : now,
              isRecent: true
            });
          }
        }
        
        // Sort: Active items first, then history by timestamp (newest first)
        return items.sort((a, b) => {
           if (!!a.isRecent !== !!b.isRecent) return a.isRecent ? 1 : -1;
           return b.timestamp.getTime() - a.timestamp.getTime();
        });
      } catch (e) {
        console.error("Activity fetch error:", e);
        return [];
      }
    },
    refetchInterval: 10000, // 10s is enough for history
    placeholderData: (prev: ActivityItem[] | undefined) => prev,
  }));

  const profileQuery = useQuery(() => ({
    queryKey: ["profile", props.user.id],
    queryFn: () => props.user.fetchProfile(),
  }));

  const mutualQuery = useQuery(() => ({
    queryKey: ["mutual", props.user.id],
    queryFn: async () => {
      if (props.user.self || props.user.bot) {
        return { users: [], groups: [] };
      }
      const clnt = client();
      if (!clnt || !clnt.users) return { users: [], groups: [] };
      const { users, servers } = await props.user.fetchMutual();
      return {
        users: (users as string[])
          .map((userId: string) => clnt.users.get(userId)!)
          .filter((user) => !!user),
        groups: [
          ...(servers as string[])
            .map((serverId: string) => clnt.servers.get(serverId)!)
            .filter((server) => !!server),
          ...clnt.channels.filter(
            (channel) =>
              channel.type === "Group" &&
              channel.recipientIds.has(props.user.id),
          ),
        ],
      };
    },
  }));

  const friendCount = () => mutualQuery.data?.users.length ?? 0;
  const serverCount = () => mutualQuery.data?.groups.length ?? 0;

  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      minWidth={800}
      padding={0}
    >
      <ModalContainer>
        {/* CLOSE BUTTON */}
        <CloseButton onClick={props.onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </CloseButton>

        {/* LEFT PANEL */}
        <LeftPanel>
          <Profile.Banner
            width={3}
            user={props.user}
            bannerUrl={profileQuery.data?.animatedBannerURL}
            onClick={
              profileQuery.data?.banner
                ? () =>
                  openModal({ type: "image_viewer", file: profileQuery.data!.banner! })
                : undefined
            }
            onClickAvatar={(e) => {
              e.stopPropagation();
              if (props.user.avatar) {
                openModal({ type: "image_viewer", file: props.user.avatar });
              }
            }}
          />

          <LeftContent>
            <Profile.Actions user={props.user} width={3} />

            <Show when={props.user.status?.text}>
              <StatusSection>
                <SectionLabel>Custom Status</SectionLabel>
                <StatusText>{props.user.status?.text}</StatusText>
              </StatusSection>
            </Show>

            <Profile.Badges user={props.user} />

            <Show when={profileQuery.data?.content}>
              <BioSection>
                <SectionLabel>About Me</SectionLabel>
                <Profile.Bio content={profileQuery.data?.content} full />
              </BioSection>
            </Show>
          </LeftContent>
        </LeftPanel>

        {/* RIGHT PANEL */}
        <RightPanel>
          <TabBar>
            <Tab
              active={activeTab() === "activity"}
              onClick={() => {
                setActiveTab("activity");
                activityQuery.refetch();
              }}
            >
              Activity
            </Tab>
            <Show when={!props.user.self && !props.user.bot}>
              <Tab
                active={activeTab() === "friends"}
                onClick={() => setActiveTab("friends")}
              >
                Friends ({friendCount()})
              </Tab>
              <Tab
                active={activeTab() === "servers"}
                onClick={() => setActiveTab("servers")}
              >
                Servers ({serverCount()})
              </Tab>
            </Show>
          </TabBar>

          <TabContent>
            <Switch>
              {/* ACTIVITY TAB */}
              <Match when={activeTab() === "activity"}>
                <Show
                  when={!activityQuery.isLoading}
                  fallback={
                    <EmptyState>
                      <EmptyIcon>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style={{ opacity: 0.4 }}>
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 6v6l4 2"></path>
                        </svg>
                      </EmptyIcon>
                      <EmptyText>Loading activity...</EmptyText>
                    </EmptyState>
                  }
                >
                <Show
                  when={activityQuery.data && activityQuery.data.length > 0}
                  fallback={
                    <EmptyState>
                      <EmptyIcon>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--md-sys-color-primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style={{ opacity: 0.6 }}>
                          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
                          <path d="M12 18h.01"></path>
                          <path d="M7 13c0-1.5 2-1.5 2-3s-1-2-2-2"></path>
                        </svg>
                      </EmptyIcon>
                      <EmptyText>No recent activity</EmptyText>
                      <EmptySubtext>
                        When this user is playing a game, listening to music, or watching anime, it'll show up here.
                      </EmptySubtext>
                    </EmptyState>
                  }
                >
                  {/* ACTIVE ACTIVITY */}
                  <Show when={activityQuery.data!.some(i => !i.isRecent)}>
                    <SectionLabel style={{ "margin-bottom": "12px" }}>Currently Active</SectionLabel>
                    <ActivityList style={{ "margin-bottom": "24px" }}>
                      <For each={activityQuery.data!.filter(i => !i.isRecent)}>
                        {(item) => (
                          <ActivityCard
                            style={{ cursor: item.url ? "pointer" : "default" }}
                            onClick={item.url ? () => window.open(item.url, "_blank") : undefined}
                          >
                            <ActivityIcon>
                              <img
                                src={item.icon}
                                alt={item.label}
                                style={{ width: "100%", height: "100%", "object-fit": "cover" }}
                              />
                              <ActivityBadge style={{ background: item.color }}>
                                <Show when={item.type === "steam"}>
                                  <img src="/assets/socials/steam.svg" width={16} height={16} />
                                </Show>
                                <Show when={item.type === "spotify"}>
                                  <img src="/assets/socials/spotify.svg" width={16} height={16} />
                                </Show>
                                <Show when={item.type === "anime"}>
                                  <span style={{ "font-size": "12px", color: "white" }}>📺</span>
                                </Show>
                              </ActivityBadge>
                            </ActivityIcon>
                            <ActivityInfo>
                              <ActivityTitle title={item.label}>{item.label}</ActivityTitle>
                              <ActivitySub>
                                {item.sublabel}
                                <span style={{ color: item.color, "font-weight": "bold", "margin-left": "8px", "display": "inline-flex", "align-items": "center", gap: "4px" }}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 20v-6M12 10V4M4 12h16" style={{ display: item.type === 'steam' ? 'block' : 'none' }} />
                                    <path d="M11 5L6 9H2v6h4l5 4V5z" style={{ display: item.type === 'spotify' ? 'block' : 'none' }} />
                                    <circle cx="12" cy="12" r="10" style={{ display: item.type === 'anime' ? 'block' : 'none' }} />
                                  </svg>
                                  {item.type === 'steam' ? 'Playing' : item.type === 'spotify' ? 'Listening' : 'Watching'}
                                </span>
                              </ActivitySub>
                            </ActivityInfo>
                          </ActivityCard>
                        )}
                      </For>
                    </ActivityList>
                  </Show>

                  {/* HISTORY SECTION */}
                  <Show when={activityQuery.data!.some(i => i.isRecent)}>
                    <SectionLabel style={{ "margin-bottom": "12px" }}>Activity History</SectionLabel>
                    <ActivityList>
                      <For each={activityQuery.data!.filter(i => i.isRecent)}>
                        {(item) => (
                          <ActivityCard
                            style={{ cursor: item.url ? "pointer" : "default", opacity: 0.8 }}
                            onClick={item.url ? () => window.open(item.url, "_blank") : undefined}
                          >
                            <ActivityIcon>
                              <img
                                src={item.icon}
                                alt={item.label}
                                style={{ width: "100%", height: "100%", "object-fit": "cover", filter: "grayscale(0.4)" }}
                              />
                            </ActivityIcon>
                            <ActivityInfo>
                              <ActivityTitle title={item.label}>{item.label}</ActivityTitle>
                              <ActivitySub>{item.sublabel}</ActivitySub>
                            </ActivityInfo>
                            <ActivityTime style={{ color: item.color }}>
                              <TimeIcon>
                                <Show when={item.type === "steam"}>🎮</Show>
                                <Show when={item.type === "anime"}>📺</Show>
                                <Show when={item.type === "spotify"}>🎵</Show>
                              </TimeIcon>
                              {timeAgo(item.timestamp)}
                            </ActivityTime>
                          </ActivityCard>
                        )}
                      </For>
                    </ActivityList>
                  </Show>
                </Show>
              </Show>
            </Match>

              {/* MUTUAL FRIENDS TAB */}
              <Match when={activeTab() === "friends"}>
                <Show
                  when={mutualQuery.data && mutualQuery.data.users.length > 0}
                  fallback={
                    <EmptyState>
                      <EmptyIcon>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style={{ opacity: 0.4 }}>
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      </EmptyIcon>
                      <EmptyText>No mutual friends</EmptyText>
                    </EmptyState>
                  }
                >
                  <SectionLabel style={{ "margin-bottom": "12px" }}>Mutual Friends</SectionLabel>
                  <MutualList>
                    <For each={mutualQuery.data?.users}>
                      {(user: User) => (
                        <MutualItem
                          onClick={() => openModal({ type: "user_profile", user })}
                        >
                          <Avatar
                            src={user.animatedAvatarURL}
                            fallback={user.displayName}
                            size={40}
                          />
                          <MutualName>
                            <OverflowingText style={{ "font-weight": "700" }}>{user.displayName || user.username}</OverflowingText>
                            <MutualUsername>{user.username}#{user.discriminator}</MutualUsername>
                          </MutualName>
                        </MutualItem>
                      )}
                    </For>
                  </MutualList>
                </Show>
              </Match>

              {/* MUTUAL SERVERS TAB */}
              <Match when={activeTab() === "servers"}>
                <Show
                  when={mutualQuery.data && mutualQuery.data.groups.length > 0}
                  fallback={
                    <EmptyState>
                      <EmptyIcon>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style={{ opacity: 0.4 }}>
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                      </EmptyIcon>
                      <EmptyText>No mutual servers</EmptyText>
                    </EmptyState>
                  }
                >
                  <SectionLabel style={{ "margin-bottom": "12px" }}>Mutual Servers</SectionLabel>
                  <MutualList>
                    <For each={mutualQuery.data?.groups}>
                      {(group: Server) => (
                        <MutualItem>
                          <Avatar
                            src={group.animatedIconURL}
                            fallback={group.name}
                            size={40}
                          />
                          <MutualName>
                            <OverflowingText style={{ "font-weight": "700" }}>{group.name}</OverflowingText>
                          </MutualName>
                        </MutualItem>
                      )}
                    </For>
                  </MutualList>
                </Show>
              </Match>
            </Switch>
          </TabContent>
        </RightPanel>
      </ModalContainer>
    </Dialog>
  );
}

// ===== Styled Components =====

const ModalContainer = styled("div", {
  base: {
    display: "flex",
    minHeight: "500px",
    maxHeight: "85vh",
    overflow: "hidden",
    borderRadius: "var(--borderRadius-xl)",
    position: "relative",
  },
});

const CloseButton = styled("button", {
  base: {
    position: "absolute",
    top: "16px",
    right: "16px",
    zIndex: 10,
    background: "rgba(0,0,0,0.3)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.2s",
    backdropFilter: "blur(4px)",

    _hover: {
      background: "rgba(0,0,0,0.5)",
      transform: "scale(1.1)",
    },

    _active: {
      transform: "scale(0.95)",
    },
  },
});

const LeftPanel = styled("div", {
  base: {
    width: "340px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    background: "var(--md-sys-color-surface-container)",
    borderRight: "1px solid var(--md-sys-color-outline-variant)",
    overflowY: "auto",
    scrollbarWidth: "none",
    "&::-webkit-scrollbar": { display: "none" },

    "& > div:first-child": {
      gridColumn: "unset",
    },
  },
});

const LeftContent = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--gap-md)",
    padding: "var(--gap-md)",

    "& > *": {
      gridColumn: "unset !important",
    },
  },
});

const RightPanel = styled("div", {
  base: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    background: "var(--md-sys-color-surface-container-low)",
  },
});

const TabBar = styled("div", {
  base: {
    display: "flex",
    gap: "0",
    borderBottom: "1px solid var(--md-sys-color-outline-variant)",
    padding: "0 60px 0 20px",
    flexShrink: 0,
    background: "var(--md-sys-color-surface-container)",
  },
});

const Tab = styled("button", {
  base: {
    all: "unset",
    cursor: "pointer",
    padding: "12px 14px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "var(--md-sys-color-on-surface-variant)",
    borderBottom: "2px solid transparent",
    transition: "all 0.2s",
    whiteSpace: "nowrap",

    _hover: {
      color: "var(--md-sys-color-on-surface)",
    },
  },
  variants: {
    active: {
      true: {
        color: "var(--md-sys-color-on-surface)",
        borderBottomColor: "var(--md-sys-color-primary)",
      },
    },
  },
});

const TabContent = styled("div", {
  base: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
  },
});

const SectionLabel = styled("div", {
  base: {
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "var(--md-sys-color-on-surface-variant)",
    opacity: 0.8,
  },
});

const StatusSection = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
});

const StatusText = styled("span", {
  base: {
    fontSize: "14px",
    color: "var(--md-sys-color-on-surface)",
    userSelect: "text",
    lineHeight: "1.4",
  },
});

const BioSection = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",

    "& > div": {
      padding: "0",
      background: "none",
      border: "none",
      gridColumn: "unset",
    },

    "& .title": {
      display: "none",
    },
  },
});

const ActivityList = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
});

const ActivityCard = styled("a", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "12px 16px",
    borderRadius: "12px",
    background: "var(--md-sys-color-surface-container)",
    border: "1px solid var(--md-sys-color-outline-variant)",
    textDecoration: "none",
    color: "inherit",
    transition: "background 0.15s, border-color 0.15s, transform 0.1s",
    cursor: "pointer",

    _hover: {
      background: "var(--md-sys-color-surface-container-high)",
      borderColor: "var(--md-sys-color-outline)",
      transform: "translateY(-1px)",
    },

    _active: {
      transform: "scale(0.99)",
    },
  },
});

const ActivityIcon = styled("div", {
  base: {
    position: "relative",
    flexShrink: 0,
  },
});

const ActivityBadge = styled("div", {
  base: {
    position: "absolute",
    bottom: "-6px",
    right: "-6px",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "2px solid var(--md-sys-color-surface-container)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
    zIndex: 1,
  },
});

const ActivityInfo = styled("div", {
  base: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
});

const ActivityTitle = styled("div", {
  base: {
    fontSize: "15px",
    fontWeight: "800",
    color: "var(--md-sys-color-on-surface)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    lineHeight: "1.2",
  },
});

const ActivitySub = styled("div", {
  base: {
    fontSize: "13px",
    color: "var(--md-sys-color-on-surface-variant)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    opacity: 0.8,
  },
});

const ActivityTime = styled("div", {
  base: {
    fontSize: "12px",
    fontWeight: "700",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    opacity: 0.9,
  },
});

const TimeIcon = styled("span", {
  base: {
    fontSize: "14px",
  },
});

const EmptyState = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center",
    gap: "12px",
    flex: 1,
  },
});

const EmptyIcon = styled("div", {
  base: {
    fontSize: "48px",
    marginBottom: "8px",
    opacity: 0.5,
  },
});

const EmptyText = styled("div", {
  base: {
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--md-sys-color-on-surface)",
  },
});

const EmptySubtext = styled("div", {
  base: {
    fontSize: "14px",
    color: "var(--md-sys-color-on-surface-variant)",
    maxWidth: "280px",
    lineHeight: "1.5",
    opacity: 0.8,
  },
});

const MutualList = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
});

const MutualItem = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background 0.15s, transform 0.1s",

    _hover: {
      background: "var(--md-sys-color-surface-container)",
    },

    _active: {
      transform: "scale(0.99)",
    },
  },
});

const MutualName = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    gap: "1px",
  },
});

const MutualUsername = styled("span", {
  base: {
    fontSize: "13px",
    color: "var(--md-sys-color-on-surface-variant)",
    opacity: 0.6,
  },
});

