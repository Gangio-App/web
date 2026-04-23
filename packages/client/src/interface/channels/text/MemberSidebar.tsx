import {
  Match,
  Show,
  Switch,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  onMount,
} from "solid-js";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { VirtualContainer } from "@minht11/solid-virtual-container";
import { Channel, ServerMember, User } from "stoat.js";
import { styled } from "styled-system/jsx";

import { floatingUserMenus } from "@revolt/app/menus/UserContextMenu";
import { useClient } from "@revolt/client";
import { TextWithEmoji } from "@revolt/markdown";
import { userInformation } from "@revolt/markdown/users";
import {
  Avatar,
  Button,
  Deferred,
  MenuButton,
  OverflowingText,
  Profile,
  Row,
  Tooltip,
  UserStatus,
  Username,
  typography,
} from "@revolt/ui";
import { useQuery } from "@tanstack/solid-query";

interface Props {
  /**
   * Channel
   */
  channel: Channel;

  /**
   * Scroll target element
   */
  scrollTargetElement: HTMLDivElement;
}

/**
 * Member Sidebar
 */
export function MemberSidebar(props: Props) {
  return (
    <Switch>
      <Match when={props.channel.type === "DirectMessage"}>
        <DirectMessageSidebar
          channel={props.channel}
          scrollTargetElement={props.scrollTargetElement}
        />
      </Match>
      <Match when={props.channel.type === "Group"}>
        <GroupMemberSidebar
          channel={props.channel}
          scrollTargetElement={props.scrollTargetElement}
        />
      </Match>
      <Match when={props.channel.type === "TextChannel"}>
        <ServerMemberSidebar
          channel={props.channel}
          scrollTargetElement={props.scrollTargetElement}
        />
      </Match>
    </Switch>
  );
}

/**
 * Direct Message Sidebar
 */
export function DirectMessageSidebar(props: Props) {
  const query = useQuery(() => ({
    queryKey: ["profile", props.channel.recipient?.id],
    queryFn: () => props.channel.recipient!.fetchProfile(),
    enabled: !!props.channel.recipient,
  }));

  const user = () => props.channel.recipient!;

  return (
    <DMSidebarContainer>
      <Show when={props.channel.recipient}>
        <DMSidebarProfile>
          <Profile.Banner
            width={1 as any}
            user={user()}
            bannerUrl={query.data?.animatedBannerURL}
          />
          <DMSidebarContent>
            {/* Custom Action buttons minus Message */}
            <Show when={user().relationship === "None" && !user().bot}>
              <Button style={{ "margin-top": "-10px" }} onPress={() => user().addFriend()}>
                <Trans>Add Friend</Trans>
              </Button>
            </Show>
            <Show when={user().relationship === "Incoming"}>
              <div style={{ display: "flex", gap: "8px", "margin-top": "-10px" }}>
                <Button style={{ flex: 1 }} onPress={() => user().addFriend()}>
                  <Trans>Accept friend request</Trans>
                </Button>
                <Button variant="secondary" onPress={() => user().removeFriend()}>
                  <Trans>Decline</Trans>
                </Button>
              </div>
            </Show>
            <Show when={user().relationship === "Outgoing"}>
              <Button variant="secondary" style={{ "margin-top": "-10px" }} onPress={() => user().removeFriend()}>
                <Trans>Cancel friend request</Trans>
              </Button>
            </Show>

            <Profile.Status user={user()} />
            <Profile.Badges user={user()} />
            <Profile.Mutuals user={user()} />
            <Profile.Bio content={query.data?.content} full />
          </DMSidebarContent>
        </DMSidebarProfile>
      </Show>
    </DMSidebarContainer>
  );
}

const DMSidebarContainer = styled("div", {
  base: {
    padding: "var(--gap-md)",
    paddingLeft: 0,
    width: "100%",
  },
});

const DMSidebarProfile = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--gap-md)",
    background: "var(--md-sys-color-surface-container-low)",
    borderRadius: "var(--borderRadius-xl)",
    overflow: "hidden",
  },
});

const DMSidebarContent = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--gap-md)",
    padding: "0 var(--gap-md) var(--gap-xl) var(--gap-md)",
  },
});

/**
 * Servers to not fetch all members for
 */
const LARGE_SERVERS = [
  "01F7ZSBSFHQ8TA81725KQCSDDP",
  "01G3PKD1YJ2H484MDX6KP9WRBN",
  // top servers on discover
  "01K313D0VP0HPNG30DNZ4Q672H",
  "01J31CCMTYKFPGCM13VRP3B289",
  "01H2Y4Y97PW6584PHN1TAVN5WR",
  "01HVKQBBQ3DQVVNK3M8DHXV30D",
  "01GDS83RMZW89AV0BZG24NEXYC",
  "01J5W0XERBBGK77BMDVPZJ20JW",
];

/**
 * Server Member Sidebar
 */
export function ServerMemberSidebar(props: Props) {
  const client = useClient();

  // todo: useQuery
  createEffect(
    on(
      () => props.channel.serverId,
      (serverId) =>
        props.channel.server?.syncMembers(
          LARGE_SERVERS.includes(serverId) ? true : false,
          200,
        ),
    ),
  );

  // Stage 1: Find roles and members
  const stage1 = createMemo(() => {
    const hoistedRoles = props.channel.server!.orderedRoles.filter(
      (role) => role.hoist,
    );

    const cl = client();
    if (!cl || !cl.serverMembers) return [[], hoistedRoles] as const;

    const members = cl.serverMembers.filter(
      (member) => member.id.server === props.channel.serverId,
    );

    return [members, hoistedRoles] as const;
  });

  // Stage 2: Filter members by permissions (if necessary)
  const stage2 = createMemo(() => {
    const [members] = stage1();
    if (props.channel.potentiallyRestrictedChannel) {
      return members.filter((member) =>
        member.hasPermission(props.channel, "ViewChannel"),
      );
    } else {
      return members;
    }
  });

  // Stage 3: Categorise each member entry into role lists
  const stage3 = createMemo(() => {
    const [, hoistedRoles] = stage1();
    const members = stage2();

    const byRole: Record<string, ServerMember[]> = { default: [], offline: [] };
    hoistedRoles.forEach((role) => (byRole[role.id] = []));

    for (const member of members) {
      if (!member.user?.online) {
        byRole["offline"].push(member);
        continue;
      }

      if (member.roles.length) {
        let assigned;
        for (const hoistedRole of hoistedRoles) {
          if (member.roles.includes(hoistedRole.id)) {
            byRole[hoistedRole.id].push(member);
            assigned = true;
            break;
          }
        }

        if (assigned) continue;
      }

      byRole["default"].push(member);
    }

    return [
      ...hoistedRoles.map((role) => ({
        role,
        members: byRole[role.id],
      })),
      {
        role: {
          id: "default",
          name: "Online",
        },
        members: byRole["default"],
      },
      {
        role: {
          id: "offline",
          name: "Offline",
        },
        members: byRole["offline"],
      },
    ].filter((entry) => entry.members.length);
  });

  // Stage 4: Perform sorting on role lists
  const roles = createMemo(() => {
    const roles = stage3();

    return roles.map((entry) => ({
      ...entry,
      members: [...entry.members].sort(
        (a, b) =>
          (a.nickname ?? a.user?.displayName)?.localeCompare(
            b.nickname ?? b.user?.displayName ?? "",
          ) || 0,
      ),
    }));
  });

  // Stage 5: Flatten into a single list with caching
  const objectCache = new Map();

  const elements = createMemo(() => {
    const elements: (
      | { t: 0; name: string; count: number }
      | { t: 1; member: ServerMember }
    )[] = [];

    // Create elements
    for (const role of roles()) {
      const roleElement = objectCache.get(role.role.name + role.members.length);
      if (roleElement) {
        elements.push(roleElement);
      } else {
        elements.push({
          t: 0,
          name: role.role.name,
          count: role.members.length,
        });
      }

      for (const member of role.members) {
        const memberElement = objectCache.get(member.id);
        if (memberElement) {
          elements.push(memberElement);
        } else {
          elements.push({
            t: 1,
            member,
          });
        }
      }
    }

    // Flush cache
    objectCache.clear();

    // Populate cache
    for (const element of elements) {
      if (element.t === 0) {
        objectCache.set(element.name + element.count, element);
      } else {
        objectCache.set(element.member.id, element);
      }
    }

    return elements;
  });

  const onlineMembers = createMemo(() => {
    const cl = client();
    if (!cl || !cl.serverMembers) return 0;
    return cl.serverMembers.filter(
      (member) =>
        (member.id.server === props.channel.serverId &&
          member.user?.online) ||
        false,
    ).length;
  });

  return (
    <Container>
      <Show when={!LARGE_SERVERS.includes(props.channel.serverId)}>
        <MemberTitle bottomMargin="yes">
          <Row align>
            <UserStatus size="0.7em" status="Online" />
            <Trans>{onlineMembers()} members online</Trans>
          </Row>
        </MemberTitle>
      </Show>

      <Deferred>
        <VirtualContainer
          items={elements()}
          scrollTarget={props.scrollTargetElement}
          itemSize={{ height: 42 }}
        >
          {(item) => (
            <div
              style={{
                ...item.style,
                width: "100%",
              }}
            >
              <Switch
                fallback={
                  <CategoryTitle>
                    {(item.item as { name: string }).name} {"–"}{" "}
                    {(item.item as { count: number }).count}
                  </CategoryTitle>
                }
              >
                <Match when={item.item.t === 1}>
                  <Member
                    member={(item.item as { member: ServerMember }).member}
                  />
                </Match>
              </Switch>
            </div>
          )}
        </VirtualContainer>
      </Deferred>
    </Container>
  );
}

/**
 * Group Member Sidebar
 */
export function GroupMemberSidebar(props: Props) {
  return (
    <Container>
      <MemberTitle>
        <Row align>{props.channel.recipientIds.size} members</Row>
      </MemberTitle>

      <Deferred>
        <VirtualContainer
          items={props.channel.recipients.toSorted((a, b) =>
            a.displayName.localeCompare(b.displayName),
          )}
          scrollTarget={props.scrollTargetElement}
          itemSize={{ height: 42 }}
        >
          {(item) => (
            <div
              style={{
                ...item.style,
                width: "100%",
              }}
            >
              <Member user={item.item} />
            </div>
          )}
        </VirtualContainer>
      </Deferred>
    </Container>
  );
}

/**
 * Container styles
 */
const Container = styled("div", {
  base: {
    paddingRight: "var(--gap-md)",
    width: "var(--layout-width-channel-sidebar)",
  },
});

/**
 * Category Title
 */
const CategoryTitle = styled("div", {
  base: {
    padding: "28px 14px 0",
    color: "var(--md-sys-color-on-surface)",

    ...typography.raw({ class: "label", size: "small" }),
  },
});

/**
 * Member title
 */
const MemberTitle = styled("div", {
  base: {
    marginTop: "12px",
    marginLeft: "14px",
    color: "var(--md-sys-color-on-surface)",

    ...typography.raw({ class: "label", size: "small" }),
  },
  variants: {
    bottomMargin: {
      no: {},
      yes: {
        marginBottom: "-12px",
      },
    },
  },
});

/**
 * Styles required to correctly display name and status
 */
const NameStatusStack = styled("div", {
  base: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
});

/**
 * Member
 */
function Member(props: { user?: User; member?: ServerMember }) {
  const { t } = useLingui();

  /**
   * Create user information
   */
  const user = () =>
    userInformation((props.user ?? props.member?.user)!, props.member);

  /**
   * Get user status
   */
  const [steamGame, setSteamGame] = createSignal<string | null>(null);
  const [steamAppIcon, setSteamAppIcon] = createSignal<string | null>(null);
  const [spotifyTrack, setSpotifyTrack] = createSignal<string | null>(null);
  const [animeStatus, setAnimeStatus] = createSignal<{ title: string; episode: string; poster: string; url: string; } | null>(null);

  const u = () => (props.user ?? props.member?.user);

  // Member rows are virtualised/reused. We must ignore stale async responses.
  let activityToken = 0;

  const fetchActivity = async (userId: string, token: number) => {
    if (!userId) return;

    try {
      const steamRes = await fetch(`/api/steam/nowplaying/${userId}`);
      if (steamRes.ok) {
        const data = await steamRes.json();
        if (token === activityToken && u()?.id === userId) {
          setSteamGame(data?.isPlaying ? data?.game : null);
          setSteamAppIcon(
            data?.isPlaying ? (data?.iconUrl ?? data?.logoUrl ?? null) : null,
          );
        }
      } else {
        if (token === activityToken && u()?.id === userId) {
          setSteamGame(null);
          setSteamAppIcon(null);
        }
      }
    } catch {
      if (token === activityToken && u()?.id === userId) {
        setSteamGame(null);
        setSteamAppIcon(null);
      }
    }

    try {
      const spotifyRes = await fetch(`/api/spotify/nowplaying/${userId}`);
      if (spotifyRes.ok) {
        const data = await spotifyRes.json();
        if (token === activityToken && u()?.id === userId) {
          setSpotifyTrack(
            data?.isPlaying
              ? `Listening to ${data?.title} by ${data?.artist}`
              : null,
          );
        }
      } else {
        if (token === activityToken && u()?.id === userId) {
          setSpotifyTrack(null);
        }
      }
    } catch {
      if (token === activityToken && u()?.id === userId) {
        setSpotifyTrack(null);
      }
    }

    try {
      const animeRes = await fetch(`/api/anime/watching/${userId}`);
      if (animeRes.ok) {
        const data = await animeRes.json();
        if (token === activityToken && u()?.id === userId) {
          setAnimeStatus(data?.isWatching ? data : null);
        }
      } else {
        if (token === activityToken && u()?.id === userId) {
          setAnimeStatus(null);
        }
      }
    } catch {
      if (token === activityToken && u()?.id === userId) {
        setAnimeStatus(null);
      }
    }
  };

  const statusMarqueeStyles = `
    .status-container {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      position: relative;
    }
    .status-content {
      display: flex;
      align-items: center;
      gap: 6px;
      transition: transform 2.5s ease-in-out;
      flex-shrink: 0;
      width: max-content;
    }
    .marquee-enabled:hover .status-content {
      transform: translateX(var(--marquee-dist, 0px));
    }
  `;

  let statusContainerRef: HTMLDivElement | undefined;
  let statusContentRef: HTMLDivElement | undefined;
  const [isOverflowing, setIsOverflowing] = createSignal(false);

  createEffect(() => {
    // Re-check overflow whenever the status changes
    const s = status();
    if (statusContainerRef && statusContentRef) {
      const containerWidth = statusContainerRef.offsetWidth;
      const contentWidth = statusContentRef.scrollWidth;
      const overflow = contentWidth > containerWidth;
      setIsOverflowing(overflow);
      
      if (overflow) {
        statusContainerRef.style.setProperty('--marquee-dist', `-${contentWidth - containerWidth + 8}px`);
      } else {
        statusContainerRef.style.setProperty('--marquee-dist', '0px');
      }
    }
  });

  // IMPORTANT: Member rows are virtualised/reused. Reset and re-poll when the user changes.
  createEffect(() => {
    const user = u();
    const id = user?.id;
    const online = user?.online;

    activityToken++;
    const token = activityToken;

    setSteamGame(null);
    setSteamAppIcon(null);
    setSpotifyTrack(null);
    setAnimeStatus(null);

    if (!id || !online) {
      return;
    }

    const poll = () => fetchActivity(id, token);
    poll();

    const interval = setInterval(poll, 10000); // Live-updated (10 seconds)
    onCleanup(() => clearInterval(interval));
  });

  const activityStatus = () =>
    u()?.online ? (steamGame() ? `Playing ${steamGame()}` : (animeStatus() ? `Watching ${animeStatus()?.title}${animeStatus()?.episode ? ` • Ep ${animeStatus()?.episode}` : ""}` : spotifyTrack())) : null;

  const activityIcon = () => {
    if (steamGame()) {
      return (
        <img
          src={steamAppIcon() ?? "/assets/socials/steam.svg"}
          width={14}
          height={14}
          style={{
            "object-fit": "cover",
            "border-radius": "4px",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        />
      );
    }

    if (animeStatus()) {
      return (
        <img
          src={animeStatus()?.poster}
          width={14}
          height={14}
          style={{
            "object-fit": "cover",
            "border-radius": "4px",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        />
      );
    }

    if (spotifyTrack()) {
      return (
        <img
          src="/assets/socials/spotify.svg"
          width={14}
          height={14}
          style={{
            "object-fit": "contain",
            "flex-shrink": "0",
            filter: "drop-shadow(0 0 1px rgba(0,0,0,0.2))",
          }}
        />
      );
    }

    return null;
  };

  const customStatus = () => (props.user ?? props.member?.user)?.status?.text;

  const presenceStatus = () =>
    (props.user ?? props.member?.user)?.statusMessage((s) =>
      s === "Online"
        ? t`Online`
        : s === "Busy"
          ? t`Busy`
          : s === "Focus"
            ? t`Focus`
            : s === "Idle"
              ? t`Idle`
              : t`Offline`,
    );

  const status = () => activityStatus() || customStatus() || presenceStatus();

  return (
    <div
      use:floating={floatingUserMenus(
        (props.user ?? props.member?.user)!,
        props.member,
      )}
    >
      <MenuButton
        size="normal"
        attention={
          (props.user ?? props.member?.user)?.online ? "active" : "muted"
        }
        icon={
          <Avatar
            src={user().avatar}
            size={32}
            holepunch="bottom-right"
            overlay={
              <UserStatus.Graphic
                status={(props.user ?? props.member?.user)?.presence}
              />
            }
          />
        }
      >
        <NameStatusStack>
          <OverflowingText>
            <Username username={user().username} colour={user().colour!} />
          </OverflowingText>
          <Show when={status()}>
            <Tooltip
              content={() => (
                <span
                  style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "6px",
                  }}
                >
                  {activityIcon()}
                  <TextWithEmoji content={status()!} />
                </span>
              )}
              placement="top-start"
              aria={status()!}
            >
            <OverflowingText class={typography({ class: "_status" })}>
              <div
                ref={statusContainerRef}
                class={`status-container ${isOverflowing() ? "marquee-enabled" : ""}`}
                style={{
                  display: "flex",
                  "align-items": "center",
                  gap: "6px",
                  cursor: "default",
                }}
              >
                <style>{statusMarqueeStyles}</style>
                <div 
                  ref={statusContentRef}
                  class="status-content"
                >
                  {activityIcon()}
                  <TextWithEmoji content={status()!} />
                </div>
              </div>
            </OverflowingText>
            </Tooltip>
          </Show>
        </NameStatusStack>
      </MenuButton>
    </div>
  );
}
