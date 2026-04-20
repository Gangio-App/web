import { JSX, Match, Switch, createEffect, createMemo } from "solid-js";

import { Server } from "stoat.js";
import { styled } from "styled-system/jsx";

import { ChannelContextMenu, ServerContextMenu } from "@revolt/app";
import { MessageCache } from "@revolt/app/interface/channels/text/MessageCache";
import { Titlebar } from "@revolt/app/interface/desktop/Titlebar";
import { useClient, useClientLifecycle } from "@revolt/client";
import { State } from "@revolt/client/Controller";
import { NotificationsWorker } from "@revolt/client/NotificationsWorker";
import { useModals } from "@revolt/modal";
import {
  Navigate,
  useBeforeLeave,
  useLocation,
  useSmartParams,
} from "@revolt/routing";
import { useState } from "@revolt/state";
import { LAYOUT_SECTIONS } from "@revolt/state/stores/Layout";
import { CircularProgress } from "@revolt/ui";

import { Sidebar } from "./interface/Sidebar";
import { MobileNavbar } from "./interface/navigation/MobileNavbar";

/**
 * Application layout
 */
const Interface = (props: { children: JSX.Element }) => {
  const state = useState();
  const client = useClient();
  const { openModal } = useModals();
  const { isLoggedIn, lifecycle } = useClientLifecycle();
  const { pathname } = useLocation();
  const params = useSmartParams();

  const baseTitle = createMemo(() => document.title || "Gangio");

  createEffect(() => {
    const base = baseTitle();
    const p = params();

    let context: string | undefined;

    if (p.channelId) {
      const channel = client()?.channels.get(p.channelId);

      if (channel) {
        if (channel.type === "DirectMessage") {
          context = channel.recipient?.displayName
            ? `@${channel.recipient.displayName}`
            : "Direct Messages";
        } else if (channel.type === "Group") {
          context = channel.name ?? "Group";
        } else if (channel.type === "SavedMessages") {
          context = "Saved Notes";
        } else {
          const channelName = channel.name ? `#${channel.name}` : "Channel";
          const serverName = channel.server?.name;
          context = serverName ? `${channelName} | ${serverName}` : channelName;
        }
      }
    } else if (p.serverId && p.exactServer) {
      const server = client()?.servers.get(p.serverId);
      context = server?.name;
    } else if (pathname === "/friends") {
      context = "Friends";
    } else if (pathname.startsWith("/discover")) {
      context = "Discover";
    } else if (pathname === "/app") {
      context = "Home";
    }

    document.title = context ? `${context} | ${base}` : base;
  });

  createEffect(async () => {
    if (!isLoggedIn()) return;
    if (!lifecycle.loadedOnce()) return;

    const userId = client().user?.id;
    if (!userId) return;

    const inviteCode = import.meta.env.VITE_AUTO_JOIN_INVITE || "Testers";
    if (!inviteCode) return;

    const key = `auto_join_invite:${inviteCode}:${userId}`;
    if (localStorage.getItem(key) === "1") return;

    try {
      await client().api.post(`/invites/${inviteCode}`);
    } catch {
      // ignore failures (already joined / invalid / rate limits)
    } finally {
      localStorage.setItem(key, "1");
    }
  });

  useBeforeLeave((e) => {
    if (!e.defaultPrevented) {
      if (e.to === "/settings") {
        e.preventDefault();
        openModal({
          type: "settings",
          config: "user",
        });
      } else if (typeof e.to === "string") {
        state.layout.setLastActivePath(e.to);
      }
    }
  });

  createEffect(() => {
    if (!isLoggedIn()) {
      state.layout.setNextPath(pathname);
      console.debug("WAITING... currently", lifecycle.state());
    }
  });

  function isDisconnected() {
    return [
      State.Connecting,
      State.Disconnected,
      State.Reconnecting,
      State.Offline,
    ].includes(lifecycle.state());
  }

  return (
    <MessageCache client={client()}>
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          height: "100%",
          position: "relative",
          "overflow": "hidden",
        }}
      >
        <Titlebar />
        <Switch fallback={<CircularProgress />}>
          <Match when={!isLoggedIn()}>
            <Navigate href="/login" />
          </Match>
          <Match when={lifecycle.loadedOnce()}>
            <Layout
              disconnected={isDisconnected()}
              style={{ "flex-grow": 1, "min-height": 0 }}
              onDragOver={(e) => {
                if (e.dataTransfer) e.dataTransfer.dropEffect = "none";
              }}
              onDrop={(e) => e.preventDefault()}
            >
              <Sidebar
                menuGenerator={(target) => ({
                  contextMenu: () => {
                    return (
                      <>
                        {target instanceof Server ? (
                          <ServerContextMenu server={target} />
                        ) : (
                          <ChannelContextMenu channel={target} />
                        )}
                      </>
                    );
                  },
                })}
              />
              <Content
                sidebar={state.layout.getSectionState(
                  LAYOUT_SECTIONS.PRIMARY_SIDEBAR,
                  true,
                )}
              >
                {props.children}
              </Content>
            </Layout>

            <MobileNavbar />
          </Match>
        </Switch>

        <NotificationsWorker />
      </div>
    </MessageCache>
  );
};

/**
 * Parent container
 */
const Layout = styled("div", {
  base: {
    display: "flex",
    height: "100%",
    minWidth: 0,

    "@media (max-width: 768px)": {
      paddingBottom: "64px",
    },
  },
  variants: {
    disconnected: {
      true: {
        color: "var(--md-sys-color-on-primary-container)",
        background: "var(--md-sys-color-primary-container)",
      },
      false: {
        color: "var(--md-sys-color-outline)",
        background: "var(--md-sys-color-surface-container-high)",
      },
    },
  },
});

/**
 * Main content container
 */
const Content = styled("div", {
  base: {
    background: "var(--md-sys-color-surface-container-low)",

    display: "flex",
    width: "100%",
    minWidth: 0,
  },
  variants: {
    sidebar: {
      false: {
        borderTopLeftRadius: "var(--borderRadius-lg)",
        borderBottomLeftRadius: "var(--borderRadius-lg)",
        overflow: "hidden",
      },
    },
  },
});

export default Interface;
