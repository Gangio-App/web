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
  isRecent?: boolean;
  playedAt?: string;
};

type AnimeActivity = {
  isWatching: boolean;
  title?: string;
  episode?: string;
  poster?: string;
  url?: string;
  progress?: number;
  duration?: number;
  isRecent?: boolean;
  updatedAt?: string;
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
              color: "var(--md-sys-color-primary)",
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
                color: "var(--md-sys-color-primary)",
                url: game.appid ? `https://store.steampowered.com/app/${game.appid}` : undefined,
                timestamp: game.last_played ? new Date(game.last_played * 1000) : new Date(Date.now() - 1000 * 60 * 60 * 24),
                isRecent: true
              });
            });
          }
        }

        // Spotify
        if (spotifyRes.status === "fulfilled" && spotifyRes.value.ok) {
          const data = await spotifyRes.value.json();
          if (data.isPlaying && data.title) {
            items.push({
              type: "spotify",
              label: data.title,
              sublabel: `by ${data.artist || "Unknown"}`,
              icon: data.albumArt || "/assets/socials/spotify.svg",
              color: "var(--md-sys-color-primary)",
              url: data.url,
              timestamp: now,
            });
          }

          // History (Spotify: only last one)
          if (data.recent && data.recent.length > 0) {
            const track = data.recent[0];
            // Don't show if it's the currently playing one
            if (!(data.isPlaying && data.title === track.title)) {
              items.push({
                type: "spotify",
                label: track.title,
                sublabel: `Last played by ${track.artist || "Unknown"}`,
                icon: track.albumArt || "/assets/socials/spotify.svg",
                color: "var(--md-sys-color-primary)",
                url: track.url,
                timestamp: track.playedAt ? new Date(track.playedAt) : now,
                isRecent: true
              });
            }
          }
        }

        // Anime
        if (animeRes.status === "fulfilled" && animeRes.value.ok) {
          const data = await animeRes.value.json();
          if (data.isWatching && data.title) {
            items.push({
              type: "anime",
              label: data.title,
              sublabel: `Watching Ep ${data.episode || "?"}`,
              icon: data.poster || "/assets/socials/anime.svg",
              color: "var(--md-sys-color-primary)",
              url: data.url,
              timestamp: now,
            });
          }

          // History
          if (data.recent && data.recent.length > 0) {
            data.recent.forEach((anime: any) => {
              // Don't show if it's the currently watching one
              if (data.isWatching && data.title === anime.title) return;

              items.push({
                type: "anime",
                label: anime.title,
                sublabel: `Last watched Ep ${anime.episode || "?"}`,
                icon: anime.poster || "/assets/socials/anime.svg",
                color: "var(--md-sys-color-primary)",
                url: anime.url,
                timestamp: anime.updatedAt ? new Date(anime.updatedAt) : now,
                isRecent: true
              });
            });
          }
        }
        
        // Sort: Active items first, then history by timestamp (newest first)
        return items.sort((a, b) => {
           if (!!a.isRecent !== !!b.isRecent) return a.isRecent ? 1 : -1;
           const timeA = a.timestamp?.getTime() || 0;
           const timeB = b.timestamp?.getTime() || 0;
           return timeB - timeA;
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
        <CloseWrapper>
          <CloseButton onClick={props.onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </CloseButton>
          <EscHint>ESC</EscHint>
        </CloseWrapper>

        {/* LEFT PANEL */}
        <LeftPanel>
          <CustomBanner
            style={{
              "background-image": profileQuery.data?.animatedBannerURL ? `url('${profileQuery.data.animatedBannerURL}')` : "none",
            }}
            onClick={
              profileQuery.data?.banner
                ? () => openModal({ type: "image_viewer", file: profileQuery.data!.banner! })
                : undefined
            }
          >
            <CustomAvatarWrapper>
              <Avatar
                src={props.user.animatedAvatarURL}
                size={92}
                onClick={(e: Event) => {
                  e.stopPropagation();
                  if (props.user.avatar) {
                    openModal({ type: "image_viewer", file: props.user.avatar });
                  }
                }}
                interactive={props.user.avatar ? true : false}
              />
              <Show when={props.user.status?.text}>
                  <div style={{ 
                      position: "absolute", 
                      top: "-42px", 
                      left: "90px", 
                      display: "flex", 
                      "flex-direction": "column",
                      "align-items": "center"
                  }}>
                      <StatusBubble>
                          {props.user.status?.text}
                      </StatusBubble>
                      <div style={{ position: "relative", width: "100%", height: "12px" }}>
                          <ThinkingCircle style={{ width: "8px", height: "8px", bottom: "-4px", left: "10px" }} />
                          <ThinkingCircle style={{ width: "4px", height: "4px", bottom: "-12px", left: "4px" }} />
                      </div>
                  </div>
              </Show>
            </CustomAvatarWrapper>
          </CustomBanner>

          <LeftContent>
            <ActionsWrapper>
              <Profile.Actions user={props.user} width={3} />
            </ActionsWrapper>

            <IdentitySection>
              <DisplayName>{props.user.displayName || props.user.username}</DisplayName>
              <UsernameRow>
                <UsernameText>
                  {props.user.username}
                  <Show when={props.user.discriminator !== "0000"}>
                    <span>#{props.user.discriminator}</span>
                  </Show>
                </UsernameText>
                <BadgeList>
                  <Profile.Badges user={props.user} compact />
                </BadgeList>
              </UsernameRow>
            </IdentitySection>

            <Show when={profileQuery.data?.content}>
              <LeftSectionCard>
                <SectionLabel>About Me</SectionLabel>
                <Profile.Bio content={profileQuery.data?.content} full />
              </LeftSectionCard>
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
                  <Show when={activityQuery.data!.some((i: ActivityItem) => !i.isRecent)}>
                    <SectionLabel>Currently Active</SectionLabel>
                    <ActivityList>
                      <For each={activityQuery.data!.filter((i: ActivityItem) => !i.isRecent)}>
                        {(item: ActivityItem) => (
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
                              <ActivityBadge style={{ background: item.type === 'spotify' ? '#363636' : item.color }}>
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
                  <Show when={activityQuery.data!.some((i: ActivityItem) => i.isRecent)}>
                    <SectionLabel style={{ "margin-bottom": "12px" }}>Activity History</SectionLabel>
                    <ActivityList>
                      <For each={activityQuery.data!.filter((i: ActivityItem) => i.isRecent)}>
                        {(item: ActivityItem) => (
                          <ActivityCard
                            style={{ cursor: item.url ? "pointer" : "default", opacity: 0.8 }}
                            onClick={item.url ? () => window.open(item.url, "_blank") : undefined}
                          >
                            <ActivityIcon size="small">
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
                            <ActivityTime style={{ color: item.isRecent ? "var(--md-sys-color-on-surface-variant)" : "var(--md-sys-color-primary)" }}>
                              <TimeIcon>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                  {/* Steam: Controller */}
                                  <path d="M6 12h.01M9 12h.01M15 12h.01M18 12h.01M4 11v4a2 2 0 002 2h12a2 2 0 002-2v-4a5 5 0 00-5-5H9a5 5 0 00-5 5z" style={{ display: item.type === 'steam' ? 'block' : 'none' }} />
                                  {/* Spotify: Music Note */}
                                  <path d="M9 18V5l12-2v13" style={{ display: item.type === 'spotify' ? 'block' : 'none' }} />
                                  <circle cx="6" cy="18" r="3" style={{ display: item.type === 'spotify' ? 'block' : 'none' }} />
                                  <circle cx="18" cy="16" r="3" style={{ display: item.type === 'spotify' ? 'block' : 'none' }} />
                                  {/* Anime: Play Circle */}
                                  <circle cx="12" cy="12" r="10" style={{ display: item.type === 'anime' ? 'block' : 'none' }} />
                                  <path d="M10 8l6 4-6 4V8z" style={{ display: item.type === 'anime' ? 'block' : 'none' }} />
                                </svg>
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

const CloseWrapper = styled("div", {
  base: {
    position: "absolute",
    top: "20px",
    right: "20px",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
});

const CloseButton = styled("button", {
  base: {
    background: "rgba(0,0,0,0.15)",
    color: "rgba(255,255,255,0.8)",
    border: "none",
    borderRadius: "12px",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: "blur(8px)",

    _hover: {
      background: "rgba(0,0,0,0.4)",
      color: "white",
      transform: "scale(1.05)",
    },

    _active: {
      transform: "scale(0.95)",
    },
  },
});

const EscHint = styled("span", {
  base: {
    fontSize: "9px",
    fontWeight: "800",
    color: "white",
    opacity: 0.4,
    letterSpacing: "0.05em",
    textShadow: "0 1px 2px rgba(0,0,0,0.5)",
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
    gap: "20px",
    padding: "24px",
    paddingTop: "56px", // Account for large avatar overlap
    position: "relative",

    "& > *": {
      gridColumn: "unset !important",
    },
  },
});

const ActionsWrapper = styled("div", {
  base: {
    position: "absolute",
    top: "16px",
    right: "24px",
    zIndex: 10,
    
    // Override internal Profile.Actions flex to align nicely
    "& > div": {
      justifyContent: "flex-end",
    }
  },
});

const CustomBanner = styled("div", {
  base: {
    height: "160px",
    width: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "var(--md-sys-color-surface-variant)",
    position: "relative",
    borderTopLeftRadius: "var(--borderRadius-xl)",
    cursor: "pointer",
  },
});

const CustomAvatarWrapper = styled("div", {
  base: {
    position: "absolute",
    bottom: "-40px",
    left: "20px",
    borderRadius: "50%",
    border: "6px solid var(--md-sys-color-surface-container)", // Matches LeftPanel background
    background: "var(--md-sys-color-surface-container)",
    zIndex: 10,
  },
});

const IdentitySection = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "4px",
  },
});

const DisplayName = styled("h1", {
  base: {
    fontSize: "24px",
    fontWeight: "900",
    color: "var(--md-sys-color-on-surface)",
    lineHeight: "1.2",
    letterSpacing: "-0.02em",
  },
});

const UsernameRow = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
});

const UsernameText = styled("div", {
  base: {
    fontSize: "14px",
    fontWeight: "600",
    color: "var(--md-sys-color-on-surface-variant)",
    display: "flex",
    alignItems: "center",

    "& span": {
      opacity: 0.5,
      fontWeight: "400",
    },
  },
});

const BadgeList = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    
    // Override some internal badge styling if possible
    "& > div": {
      display: "flex",
      gap: "4px",
      padding: "0",
      background: "none",
    }
  },
});

const LeftSectionCard = styled("div", {
  base: {
    background: "var(--md-sys-color-surface-container-low)",
    border: "1px solid var(--md-sys-color-outline-variant)",
    borderRadius: "20px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",

    _hover: {
      background: "var(--md-sys-color-surface-container-high)",
      borderColor: "var(--md-sys-color-outline)",
    },

    "& .title": {
      display: "none",
    },

    "& > div": {
      padding: "0",
      background: "none",
      border: "none",
      gridColumn: "unset",
    },
  },
});

const ThinkingCircle = styled("div", {
    base: {
        position: "absolute",
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(12px)",
        borderRadius: "100%",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.1)",
    }
});

const StatusBubble = styled("div", {
  base: {
    padding: "6px 12px",
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(16px)",
    borderRadius: "18px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#fff",
    maxWidth: "140px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)",
    position: "relative",
    zIndex: 20,
    textAlign: "center",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "help",

    "&:hover": {
        maxWidth: "240px",
        whiteSpace: "normal",
        overflow: "visible",
        zIndex: 50,
        background: "rgba(255, 255, 255, 0.25)",
        transform: "scale(1.05) translateY(-2px)",
    }
  }
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
    letterSpacing: "0.1em",
    color: "var(--md-sys-color-on-surface-variant)",
    opacity: 0.6,
    marginBottom: "12px",
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

const ActivityList = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
});

const ActivityCard = styled("div", {
  base: {
    background: "var(--md-sys-color-surface-container-low)",
    border: "1px solid var(--md-sys-color-outline-variant)",
    borderRadius: "20px",
    padding: "16px",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    textDecoration: "none",
    color: "inherit",

    _hover: {
      background: "var(--md-sys-color-surface-container-high)",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      borderColor: "var(--md-sys-color-outline)",
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
    borderRadius: "8px",
    overflow: "hidden",
    background: "var(--md-sys-color-surface-container-high)",
  },
  variants: {
    size: {
      normal: {
        width: "80px",
        height: "80px",
      },
      small: {
        width: "48px",
        height: "48px",
      },
    },
  },
  defaultVariants: {
    size: "normal",
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
    fontWeight: "700",
    color: "var(--md-sys-color-on-surface)",
    lineHeight: "1.2",
    marginBottom: "2px",
    display: "-webkit-box",
    lineClamp: "2",
    WebkitLineClamp: "2",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
});

const ActivitySub = styled("div", {
  base: {
    fontSize: "13px",
    color: "var(--md-sys-color-on-surface-variant)",
    lineHeight: "1.4",
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

