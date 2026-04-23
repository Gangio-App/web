import { For, Show } from "solid-js";

import { useQuery } from "@tanstack/solid-query";
import { User } from "stoat.js";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";

import { Avatar, Ripple, Text } from "../../design";
import { dismissFloatingElements } from "../../floating";

import { ProfileCard } from "./ProfileCard";

export function ProfileMutuals(props: { user: User }) {
  const client = useClient();
  const { openModal } = useModals();

  const query = useQuery(() => ({
    queryKey: ["mutual", props.user.id],
    queryFn: async () => {
      if (props.user.self || props.user.bot) {
        return {
          users: [],
          servers: [],
          groups: [],
        };
      }

      const clnt = client();
      if (!clnt || !clnt.users) return { users: [], servers: [], groups: [] };
      const { users, servers } = await props.user.fetchMutual();

      return {
        users: users
          .map((userId) => clnt.users.get(userId)!)
          .filter((user) => user),
        servers: servers
          .map((serverId) => clnt.servers.get(serverId)!)
          .filter((server) => server),
        groups: clnt.channels.filter(
          (channel) =>
            channel.type === "Group" && channel.recipientIds.has(props.user.id),
        ),
      };
    },
  }));

  /**
   * Open friends modal
   */
  function openFriends() {
    openModal({
      type: "user_profile_mutual_friends",
      users: query.data!.users,
    });

    dismissFloatingElements();
  }

  /**
   * Open servers modal
   */
  function openServers() {
    openModal({
      type: "user_profile_mutual_servers",
      servers: query.data!.servers,
    });

    dismissFloatingElements();
  }

  /**
   * Open groups modal
   */
  function openGroups() {
    openModal({
      type: "user_profile_mutual_groups",
      groups: query.data!.groups,
    });

    dismissFloatingElements();
  }

  return (
    <Container>
      <Show when={query.data?.users.length}>
        <SectionHeader>
          MUTUAL FRIENDS
        </SectionHeader>
        <ProfileCard isLink onClick={openFriends}>
          <Ripple />
          <Grid>
            <For each={query.data?.users.slice(0, 5)}>
              {(user) => (
                <Avatar
                  src={user?.avatarURL}
                  fallback={user?.displayName}
                  size={24}
                />
              )}
            </For>
            <Show when={query.data!.users.length > 5}>
              <Count>+{query.data!.users.length - 5}</Count>
            </Show>
          </Grid>
        </ProfileCard>
      </Show>

      <Show when={query.data?.servers.length}>
        <SectionHeader>
          MUTUAL SERVERS
        </SectionHeader>
        <ProfileCard isLink onClick={openServers}>
          <Ripple />
          <Grid>
            <For each={query.data?.servers.slice(0, 5)}>
              {(server) => (
                <Avatar
                  src={server.iconURL}
                  fallback={server.name}
                  size={24}
                />
              )}
            </For>
            <Show when={query.data!.servers.length > 5}>
              <Count>+{query.data!.servers.length - 5}</Count>
            </Show>
          </Grid>
        </ProfileCard>
      </Show>

      <Show when={query.data?.groups.length}>
        <SectionHeader>
          MUTUAL GROUPS
        </SectionHeader>
        <ProfileCard isLink onClick={openGroups}>
          <Ripple />
          <Grid>
            <For each={query.data?.groups.slice(0, 5)}>
              {(group) => (
                <Avatar
                  src={group.iconURL}
                  fallback={group.name}
                  size={24}
                />
              )}
            </For>
            <Show when={query.data!.groups.length > 5}>
              <Count>+{query.data!.groups.length - 5}</Count>
            </Show>
          </Grid>
        </ProfileCard>
      </Show>
    </Container>
  );
}

const Container = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "var(--gap-sm)",
  },
});

const SectionHeader = styled("div", {
  base: {
    paddingTop: "var(--gap-md)",
    paddingBottom: "var(--gap-xs)",
    opacity: 0.6,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontSize: "11px",
    fontWeight: "bold",
    fontFamily: "var(--font-heading)",
  },
});

const Grid = styled("div", {
  base: {
    gap: "var(--gap-sm)",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
  },
});

const Count = styled("div", {
  base: {
    fontSize: "12px",
    fontWeight: "bold",
    opacity: 0.8,
    marginLeft: "4px",
  },
});

