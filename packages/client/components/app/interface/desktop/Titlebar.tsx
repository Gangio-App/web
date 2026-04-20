import { Match, Show, Switch, createEffect, createSignal, createMemo } from "solid-js";
import { Motion, Presence } from "solid-motionone";

import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import MdBuild from "@material-symbols/svg-400/outlined/build.svg?component-solid";
import MdClose from "@material-symbols/svg-400/outlined/close.svg?component-solid";
import MdCollapseContent from "@material-symbols/svg-400/outlined/collapse_content.svg?component-solid";
import MdExpandContent from "@material-symbols/svg-400/outlined/expand_content.svg?component-solid";
import MdGroup from "@material-symbols/svg-400/outlined/group.svg?component-solid";
import MdHelp from "@material-symbols/svg-400/outlined/help.svg?component-solid";
import MdInbox from "@material-symbols/svg-400/outlined/inbox.svg?component-solid";
import MdMinimize from "@material-symbols/svg-400/outlined/minimize.svg?component-solid";

import Wordmark from "../../../../public/assets/web/wordmark.svg?component-solid";
import { useClient, useClientLifecycle } from "../../../client";
import { State, TransitionType } from "../../../client/Controller";
import { useModals } from "../../../modal";
import { useLocation, useSmartParams } from "../../../routing";
import { pendingUpdate } from "../../../../src/serviceWorkerInterface";

import {
  Avatar,
  Button,
  Ripple,
  symbolSize,
} from "../../../ui";

export function Titlebar() {
  const [isMaximised, setIsMaximised] = createSignal(
    window.native ? window.desktopConfig.get().windowState.isMaximised : false,
  );
  const [desktopUpdateDownloading, setDesktopUpdateDownloading] = createSignal(false);
  const [desktopUpdateReady, setDesktopUpdateReady] = createSignal(false);
  const { lifecycle } = useClientLifecycle();
  const { openModal } = useModals();
  const client = useClient();
  const params = useSmartParams();
  const { pathname } = useLocation();

  createEffect(() => {
    if (window.native) {
      // @ts-expect-error - electron events
      window.native.onUpdateAvailable?.(() => {
        setDesktopUpdateDownloading(true);
      });
      // @ts-expect-error - electron events
      window.native.onUpdateReady?.(() => {
        setDesktopUpdateDownloading(false);
        setDesktopUpdateReady(true);
      });
    }
  });

  const context = createMemo(() => {
    const p = params();
    if (pathname === "/friends") {
      return {
        icon: <MdGroup {...symbolSize(18)} />,
        name: "Friends",
      };
    }

    if (p.channelId) {
      const channel = client()?.channels.get(p.channelId);
      if (channel) {
        if (channel.type === "DirectMessage") {
          return {
            icon: channel.recipient?.avatarURL,
            name: channel.recipient?.displayName || channel.recipient?.username,
          };
        } else if (channel.type === "Group") {
          return {
            icon: channel.iconURL,
            name: channel.name,
          };
        } else if (channel.server) {
          return {
            icon: channel.server.iconURL,
            name: channel.server.name,
          };
        }
      }
    } else if (p.serverId) {
      const server = client()?.servers.get(p.serverId);
      if (server) {
        return {
          icon: server.iconURL,
          name: server.name,
        };
      }
    }

    return null;
  });

  function isDisconnected() {
    return [
      State.Connecting,
      State.Disconnected,
      State.Reconnecting,
      State.Offline,
    ].includes(lifecycle.state());
  }

  function maximise() {
    window.native.maximise();
    setIsMaximised((t) => !t);
  }

  return (
    <Presence>
      <Show
        when={
          (window.native && window.desktopConfig?.get().customFrame) ||
          isDisconnected()
        }
      >
        <Motion.div
          initial={{ height: 0 }}
          animate={{ height: "29px" }}
          exit={{ height: 0 }}
        >
          <Base disconnected={isDisconnected()}>
            <Title
              style={{
                "-webkit-user-select": "none",
                "-webkit-app-region": "drag",
              }}
            >
              <Wordmark
                class={css({
                  height: "18px",
                  marginBlockStart: "1px",
                })}
              />{" "}
              <Show when={import.meta.env.DEV}>
                <MdBuild {...symbolSize(16)} />
              </Show>
            </Title>
            <DragHandle
              style={{
                "-webkit-user-select": "none",
                "-webkit-app-region": "drag",
              }}
            >
              <AbsoluteCenter>
                <ContextContainer>
                  <Show when={context()}>
                    {(ctx: any) => (
                      <>
                        <Show
                          when={typeof ctx.icon === "string"}
                          fallback={ctx.icon}
                        >
                          <Avatar
                            src={ctx.icon as string}
                            fallback={ctx.name}
                            size={16}
                            shape="rounded-square"
                          />
                        </Show>
                        <ContextName>{ctx.name}</ContextName>
                      </>
                    )}
                  </Show>
                </ContextContainer>

                <Show when={lifecycle.state() !== State.Connected}>
                  <StatusText>
                    <Switch>
                      <Match when={lifecycle.state() === State.Connecting}>
                        Connecting
                      </Match>
                      <Match when={lifecycle.state() === State.Disconnected}>
                        Disconnected
                        <a
                          onClick={() =>
                            lifecycle.transition({
                              type: TransitionType.Retry,
                            })
                          }
                          style={{ "-webkit-app-region": "no-drag", cursor: "pointer" }}
                        >
                          <strong> (reconnect now)</strong>
                        </a>
                      </Match>
                      <Match when={lifecycle.state() === State.Reconnecting}>
                        Reconnecting
                      </Match>
                      <Match when={lifecycle.state() === State.Offline}>
                        Device is offline
                        <a
                          onClick={() =>
                            lifecycle.transition({
                              type: TransitionType.Retry,
                            })
                          }
                          style={{ "-webkit-app-region": "no-drag", cursor: "pointer" }}
                        >
                          <strong> (reconnect now)</strong>
                        </a>
                      </Match>
                    </Switch>
                  </StatusText>
                </Show>
              </AbsoluteCenter>

              <Show when={pendingUpdate() || desktopUpdateReady() || desktopUpdateDownloading()}>
                <div style={{ "-webkit-app-region": "no-drag" }}>
                  <Button
                    size="sm"
                    disabled={desktopUpdateDownloading()}
                    onPress={() => {
                      if (desktopUpdateReady()) {
                        window.native.restartToUpdate();
                      } else {
                        pendingUpdate()?.();
                      }
                    }}
                  >
                    <Switch>
                      <Match when={desktopUpdateDownloading()}>
                        Downloading...
                      </Match>
                      <Match when={desktopUpdateReady()}>
                        Restart to Update
                      </Match>
                      <Match when={true}>
                        Update
                      </Match>
                    </Switch>
                  </Button>
                </div>
              </Show>
            </DragHandle>

            <ActionsArea>
              <ActionAreaButton
                style={{ "-webkit-app-region": "no-drag" }}
                onClick={() => openModal({ type: "inbox" })}
              >
                <Ripple />
                <MdInbox {...symbolSize(20)} />
              </ActionAreaButton>
              <ActionAreaButton
                style={{ "-webkit-app-region": "no-drag" }}
                onClick={() => openModal({ type: "changelog" })}
              >
                <Ripple />
                <MdHelp {...symbolSize(20)} />
              </ActionAreaButton>

              <Show when={window.native}>
                <Separator />
                <Action onClick={window.native.minimise}>
                  <Ripple />
                  <MdMinimize {...symbolSize(18)} />
                </Action>
                <Action onClick={maximise}>
                  <Ripple />
                  <Show
                    when={isMaximised()}
                    fallback={<MdExpandContent {...symbolSize(16)} />}
                  >
                    <MdCollapseContent {...symbolSize(16)} />
                  </Show>
                </Action>
                <Action
                  onClick={window.native.close}
                  class={css({
                    _hover: { bg: "var(--md-sys-color-error) !important", color: "white" },
                  })}
                >
                  <Ripple />
                  <MdClose {...symbolSize(18)} />
                </Action>
              </Show>
            </ActionsArea>
          </Base>
        </Motion.div>
      </Show>
    </Presence>
  );
}

const Base = styled("div", {
  base: {
    position: "relative",
    flexShrink: 0,
    height: "29px",
    userSelect: "none",

    display: "flex",
    alignItems: "center",

    fill: "var(--md-sys-color-on-surface)",
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

const Title = styled("div", {
  base: {
    display: "flex",
    gap: "var(--gap-md)",
    alignItems: "center",
    paddingInlineStart: "var(--gap-md)",

    color: "var(--md-sys-color-on-surface)",
    lineHeight: "1.5rem",
    fontSize: "1rem",
    letterSpacing: "0.009375rem",
    fontWeight: 550,
  },
});

const DragHandle = styled("div", {
  base: {
    flexGrow: 1,
    height: "100%",

    display: "flex",
    gap: "var(--gap-md)",
    alignItems: "center",
    justifyContent: "center",
    paddingInline: "var(--gap-md)",
  },
});

const AbsoluteCenter = styled("div", {
  base: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "var(--gap-sm)",
  },
});

const ContextContainer = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "var(--gap-sm)",
    color: "var(--md-sys-color-on-surface)",
    transition: "var(--transitions-fast) all",
    lineHeight: "1rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    opacity: 0.9,
  },
});

const ContextName = styled("span", {
  base: {
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
});

const StatusText = styled("div", {
  base: {
    lineHeight: "0.875rem",
    fontSize: "0.6875rem",
    letterSpacing: "0.03125rem",
    fontWeight: 500,
    opacity: 0.8,
  },
});

const ActionsArea = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    height: "100%",
  },
});

const ActionAreaButton = styled("a", {
  base: {
    cursor: "pointer",
    position: "relative",
    display: "grid",
    placeItems: "center",
    height: "100%",
    aspectRatio: "1",
    color: "var(--md-sys-color-outline)",
    _hover: {
      color: "var(--md-sys-color-on-surface)",
      bg: "rgba(255, 255, 255, 0.05)",
    },
    transition: "var(--transitions-fast) all",
  },
});

const Separator = styled("div", {
  base: {
    width: "1px",
    height: "16px",
    marginInline: "var(--gap-sm)",
    bg: "var(--md-sys-color-outline-variant)",
    opacity: 0.3,
  },
});

const Action = styled("a", {
  base: {
    cursor: "pointer",
    position: "relative",

    display: "grid",
    placeItems: "center",

    height: "100%",
    aspectRatio: "3/2",
    color: "var(--md-sys-color-outline)",
    _hover: {
      color: "var(--md-sys-color-on-surface)",
      bg: "rgba(255, 255, 255, 0.05)",
    },
    transition: "var(--transitions-fast) all",
  },
});
