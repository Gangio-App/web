import {
  Accessor,
  JSX,
  Match,
  Show,
  Switch,
  createMemo,
  createSignal,
  splitProps,
} from "solid-js";

import { useVoice } from "@revolt/rtc";
import { css } from "styled-system/css";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { VirtualContainer } from "@minht11/solid-virtual-container";
import type { User } from "stoat.js";
import { styled } from "styled-system/jsx";

import { UserContextMenu } from "@revolt/app";
import { useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import {
  Avatar,
  Badge,
  Deferred,
  Header,
  IconButton,
  List,
  ListItem,
  ListSubheader,
  NavigationRail,
  NavigationRailItem,
  OverflowingText,
  Text,
  UserStatus,
  main,
  typography,
} from "@revolt/ui";
import { Column } from "@revolt/ui/components/layout/Column";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import { HeaderIcon } from "./common/CommonHeader";

/**
 * Base layout of the friends page
 */
const Base = styled("div", {
  base: {
    width: "100%",
    display: "flex",
    flexDirection: "column",

    "& .FriendsList": {
      height: "100%",
      paddingInline: "var(--gap-lg)",
    },
  },
});

/**
 * Friends menu
 */
export function Friends() {
  const { t } = useLingui();
  const client = useClient();
  const { openModal } = useModals();

  /**
   * Reference to the parent scroll container
   */
  let scrollTargetElement!: HTMLDivElement;

  /**
   * Signal required for reacting to ref changes
   */
  const targetSignal = () => scrollTargetElement;

  /**
   * Generate lists of all users
   */
  const lists = createMemo(() => {
    const list = client()!.users.toList();

    const friends = list
      .filter((user) => user.relationship === "Friend")
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    return {
      friends,
      online: friends.filter((user) => user.online),
      incoming: list
        .filter((user) => user.relationship === "Incoming")
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
      outgoing: list
        .filter((user) => user.relationship === "Outgoing")
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
      blocked: list
        .filter((user) => user.relationship === "Blocked")
        .sort((a, b) => a.displayName.localeCompare(b.displayName)),
    };
  });

  const pending = () => {
    const incoming = lists().incoming;
    return incoming.length > 99 ? "99+" : incoming.length;
  };

  const [page, setPage] = createSignal("online");

  return (
    <Base>
      <Header placement="primary">
        <HeaderIcon>
          <Symbol>group</Symbol>
        </HeaderIcon>
        <Trans>Friends</Trans>
      </Header>

      <main class={main()}>
        <div
          style={{
            position: "relative",
            "min-height": 0,
          }}
        >
          <NavigationRail contained value={page} onValue={setPage}>
            <div style={{ "margin-top": "6px", "margin-bottom": "12px" }}>
              <IconButton
                variant="filled"
                shape="square"
                onPress={() =>
                  openModal({
                    type: "add_friend",
                    client: client(),
                  })
                }
                use:floating={{
                  tooltip: {
                    placement: "right",
                    content: t`Add a new friend`,
                  },
                }}
              >
                <Symbol>add</Symbol>
              </IconButton>
            </div>

            <NavigationRailItem
              icon={<Symbol>waving_hand</Symbol>}
              value="online"
            >
              <Trans>Online</Trans>
            </NavigationRailItem>
            <NavigationRailItem icon={<Symbol>all_inbox</Symbol>} value="all">
              <Trans>All</Trans>
            </NavigationRailItem>
            <NavigationRailItem
              icon={<Symbol>notifications</Symbol>}
              value="pending"
            >
              <Trans>Pending</Trans>
              <Show when={pending()}>
                <Badge slot="badge" variant="large">
                  {pending()}
                </Badge>
              </Show>
            </NavigationRailItem>
            <NavigationRailItem icon={<Symbol>block</Symbol>} value="blocked">
              <Trans>Blocked</Trans>
            </NavigationRailItem>
          </NavigationRail>

          <Deferred>
            <div class="FriendsList" ref={scrollTargetElement} use:scrollable>
              <Switch
                fallback={
                  <People
                    title="Online"
                    users={lists().online}
                    scrollTargetElement={targetSignal}
                  />
                }
              >
                <Match when={page() === "all"}>
                  <People
                    title="All"
                    users={lists().friends}
                    scrollTargetElement={targetSignal}
                  />
                </Match>
                <Match when={page() === "pending"}>
                  <People
                    title="Incoming"
                    users={lists().incoming}
                    scrollTargetElement={targetSignal}
                  />
                  <People
                    title="Outgoing"
                    users={lists().outgoing}
                    scrollTargetElement={targetSignal}
                  />
                </Match>
                <Match when={page() === "blocked"}>
                  <People
                    title="Blocked"
                    users={lists().blocked}
                    scrollTargetElement={targetSignal}
                  />
                </Match>
              </Switch>
            </div>
          </Deferred>
        </div>
      </main>
    </Base>
  );
}

/**
 * List of users
 */
function People(props: {
  users: User[];
  title: string;
  scrollTargetElement: Accessor<HTMLDivElement>;
}) {
  return (
    <List>
      <ListSubheader>
        {props.title} {"–"} {props.users.length}
      </ListSubheader>

      <Show when={props.users.length === 0}>
        <ListItem disabled>
          <Trans>Nobody here right now!</Trans>
        </ListItem>
      </Show>

      <VirtualContainer
        items={props.users}
        scrollTarget={props.scrollTargetElement()}
        itemSize={{ height: 58 }}
        // grid rendering:
        // itemSize={{ height: 60, width: 240 }}
        // crossAxisCount={(measurements) =>
        //   Math.floor(measurements.container.cross / measurements.itemSize.cross)
        // }
        // width: 100% needs to be removed from listentry below for this to work ^^^
      >
        {(item) => (
          <ContainerListEntry
            style={{
              ...item.style,
            }}
          >
            <Entry
              role="listitem"
              tabIndex={item.tabIndex}
              style={item.style}
              user={item.item}
            />
          </ContainerListEntry>
        )}
      </VirtualContainer>
    </List>
  );
}

const ContainerListEntry = styled("div", {
  base: {
    width: "100%",
  },
});

/**
 * Single user entry
 */
function Entry(
  props: { user: User } & Omit<
    JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
  >,
) {
  const { openModal } = useModals();
  const [local, remote] = splitProps(props, ["user"]);
  const { t } = useLingui();
  const client = useClient();
  const voice = useVoice();

  const voiceRoom = createMemo(() => {
    const recipientId = local.user.id;
    const cl = client();
    if (!cl || !cl.channels) return;
    
    const vChannel = cl.channels.find((channel) => {
      return channel.voiceParticipants.has(recipientId);
    });

    if (vChannel) {
      const participant = vChannel.voiceParticipants.get(recipientId);
      const isSharing = participant?.isScreensharing();

      if (
        (vChannel.type === "DirectMessage" || vChannel.type === "Group") &&
        voice.channel()?.id === vChannel.id
      ) {
        return { type: "with_you" as const, isSharing };
      }

      if (vChannel.server) {
        return {
          type: "mutual" as const,
          serverName: vChannel.server.name,
          channelName: vChannel.name,
          isSharing,
        };
      }
      
      return { type: "other" as const, isSharing };
    }
  });

  const status = () => {
    const vr = voiceRoom();
    if (vr) {
      if (vr.isSharing) {
        if (vr.type === "with_you") return t`Sharing screen with you`;
        if (vr.type === "mutual") return t`Sharing screen in ${vr.channelName} in ${vr.serverName}`;
        return t`Sharing Screen`;
      }

      if (vr.type === "with_you") return t`In a voice chat with you`;
      if (vr.type === "mutual") {
        return t`In ${vr.channelName} in ${vr.serverName}`;
      }
    }

    return local.user.status?.text;
  };

  return (
    <a
      {...remote}
      use:floating={{
        contextMenu: () => <UserContextMenu user={local.user} />,
      }}
      onClick={() => openModal({ type: "user_profile", user: local.user })}
    >
      <ListItem>
        <Avatar
          slot="icon"
          size={36}
          src={local.user.animatedAvatarURL}
          holepunch={
            local.user.relationship === "Friend" ? "bottom-right" : "none"
          }
          overlay={
            <Show when={local.user.relationship === "Friend"}>
              <UserStatus.Graphic
                status={local.user.presence}
              />
            </Show>
          }
        />
        <Column gap="none">
          <OverflowingText>{local.user.displayName}</OverflowingText>
          <Show when={status()}>
            <div class={css({ display: "flex", alignItems: "center", gap: "4px", opacity: 0.7 })}>
              <Show when={voiceRoom()?.isSharing}>
                <Symbol size={12}>screen_share</Symbol>
              </Show>
              <Text size="small" class={typography({ class: "_status" })}>
                {status()}
              </Text>
            </div>
          </Show>
        </Column>
      </ListItem>
    </a>
  );
}
