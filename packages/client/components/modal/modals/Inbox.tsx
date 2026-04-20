import { For, Match, Show, Switch, createMemo, createSignal } from "solid-js";

import { Trans } from "@lingui-solid/solid/macro";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useNavigate } from "@revolt/routing";
import { useState } from "@revolt/state";
import {
  Avatar,
  CategoryButton,
  Column,
  Dialog,
  DialogProps,
  IconButton,
  Text,
  Unreads as UnreadsUI,
  symbolSize,
} from "@revolt/ui";
import { Invite } from "@revolt/ui/components/features/messaging/elements/Invite";

import MdAlternateEmail from "@material-symbols/svg-400/outlined/alternate_email.svg?component-solid";
import MdMarkChatRead from "@material-symbols/svg-400/outlined/mark_chat_read.svg?component-solid";
import MdNotifications from "@material-symbols/svg-400/outlined/notifications.svg?component-solid";
import MdSend from "@material-symbols/svg-400/outlined/send.svg?component-solid";
import { FaSolidCircleXmark } from "solid-icons/fa";
import { IoCheckmarkCircle } from "solid-icons/io";

import EarlyAdopterSVG from "../../../public/assets/badges/early_adopter.svg?component-solid";

import { Modals } from "../types";

/**
 * Inbox modal to display unreads and mentions
 */
export function InboxModal(props: DialogProps & Modals & { type: "inbox" }) {
  const client = useClient();
  const state = useState();
  const navigate = useNavigate();

  const [tab, setTab] = createSignal<"unreads" | "mentions" | "invites" | "rewards">("unreads");
  const [rewardSeen, setRewardSeen] = createSignal(!!localStorage.getItem("reward_early_adopter_seen"));

  /**
   * Get all unread channels that the user cares about
   */
  const unreads = createMemo(() => {
    return client()
      .channels.toList()
      .filter((channel: any) => {
        if (state.notifications.isMuted(channel)) return false;
        if (!channel.unread) return false;

        const config = state.notifications.computeForChannel(channel);
        if (config === "none") return false;
        if (config === "mention") return (channel.mentions?.size ?? 0) > 0;

        return true;
      })
      .sort((a: any, b: any) => (b.lastMessageId || "").localeCompare(a.lastMessageId || ""));
  });

  /**
   * Get all mentions (even if muted, usually mentions are important)
   */
  const mentions = createMemo(() => {
    return client()
      .channels.toList()
      .filter((channel: any) => (channel.mentions?.size ?? 0) > 0)
      .sort((a: any, b: any) => (b.lastMessageId || "").localeCompare(a.lastMessageId || ""));
  });

  /**
   * Get all unread DMs that contain an invite link
   */
  const invitations = createMemo(() => {
    return client()
      .channels.toList()
      .filter((channel: any) => {
        if (channel.type !== "DirectMessage") return false;
        if (!channel.unread) return false;
        const lastMessage = client().messages.get(channel.lastMessageId);
        return lastMessage && lastMessage.contentPlain?.includes("/invite/");
      })
      .sort((a: any, b: any) => (b.lastMessageId || "").localeCompare(a.lastMessageId || ""));
  });

  /**
   * Handle jumping to a channel
   */
  const jumpTo = (channelId: string) => {
    navigate(`/channel/${channelId}`);
    props.onClose();
  };

  /**
   * Mark all as read
   */
  const markAllRead = () => {
    for (const channel of unreads()) {
      (channel as any).ack();
    }
  };

  /**
   * Mark a specific channel as read (Decline)
   */
  const markRead = async (channel: any) => {
    await new Promise(r => setTimeout(r, 500));
    channel.ack();
  };

  /**
   * Accept an invitation (Join)
   */
  const acceptInvite = async (code: string, channel: any) => {
    try {
      await client().api.post(`/invites/${code as ""}`);
      await new Promise(r => setTimeout(r, 500));
      channel.ack();
      // Optionally navigate to the server
      const invite = await client().api.get(`/invites/${code as ""}`);
      if (invite.type === "Server") {
        navigate(`/server/${invite.server_id}`);
      }
      props.onClose();
    } catch (e) {
      // Ignore if already joined
    }
  };

  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      title={
        <div
          style={{
            display: "flex",
            "align-items": "center",
            gap: "var(--gap-sm)",
          }}
        >
          <TabButton active={tab() === "unreads"} onClick={() => setTab("unreads")}>
            <Trans>Unreads</Trans>
          </TabButton>
          <TabButton
            active={tab() === "mentions"}
            onClick={() => setTab("mentions")}
          >
            <Trans>Mentions</Trans>
          </TabButton>
          <TabButton
            active={tab() === "invites"}
            onClick={() => setTab("invites")}
          >
            <Trans>Invitations</Trans>
          </TabButton>
          <Show when={client().user && (client().user!.badges ?? 0) & 256 && !rewardSeen()}>
            <TabButton
              active={tab() === "rewards"}
              onClick={() => setTab("rewards")}
              style={{ color: "var(--md-sys-color-primary)" }}
            >
              <Trans id="inbox.tabs.rewards">Rewards</Trans>
            </TabButton>
          </Show>
        </div>
      }
      actions={[
        {
          text: <Trans>Mark all as read</Trans>,
          onClick: markAllRead,
        },
        { text: <Trans>Close</Trans> },
      ]}
    >
      <Column gap="sm" use:scrollable={{ direction: "y", showOnHover: true }} style={{ "max-height": "400px" }}>
        <Switch>
          <Match when={tab() === "unreads"}>
            <Show
              when={unreads().length > 0}
              fallback={
                <EmptyState>
                  <MdNotifications {...symbolSize(48)} style={{ opacity: 0.2 }} />
                  <Text class="body" size="medium">
                    <Trans>You're all caught up!</Trans>
                  </Text>
                </EmptyState>
              }
            >
              <For each={unreads()}>
                {(channel: any) => (
                  <CategoryButton
                    onClick={() => jumpTo(channel.id)}
                    icon={
                      <Avatar
                        src={channel.iconURL}
                        fallback={channel.name || channel.recipient?.username}
                        size={32}
                        shape="rounded-square"
                      />
                    }
                    description={
                      <div style={{ display: "flex", "flex-direction": "column", gap: "2px" }}>
                        <div style={{ opacity: 0.8, "font-size": "0.8rem" }}>
                          {channel.server?.name || (
                            <Show when={channel.type === "DirectMessage"}>
                               <Trans>Direct Message</Trans>
                            </Show>
                          )}
                        </div>
                        <Show when={client().messages.get(channel.lastMessageId)}>
                          {(msg: any) => (
                            <div style={{ opacity: 0.6, "font-size": "0.85rem", overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>
                               {msg.contentPlain}
                            </div>
                          )}
                        </Show>
                      </div>
                    }
                  >
                    <div style={{ display: "flex", "align-items": "center", gap: "var(--gap-sm)" }}>
                       <Show when={channel.type === "TextChannel"}>#</Show>
                       {channel.name || channel.recipient?.username}
                    </div>
                  </CategoryButton>
                )}
              </For>
            </Show>
          </Match>
          <Match when={tab() === "mentions"}>
             <Show
              when={mentions().length > 0}
              fallback={
                <EmptyState>
                  <MdAlternateEmail {...symbolSize(48)} style={{ opacity: 0.2 }} />
                  <Text class="body" size="medium">
                    <Trans>No new mentions</Trans>
                  </Text>
                </EmptyState>
              }
            >
              <For each={mentions()}>
                {(channel: any) => (
                  <CategoryButton
                    onClick={() => jumpTo(channel.id)}
                    icon={
                      <Avatar
                        src={channel.iconURL}
                        fallback={channel.name || channel.recipient?.username}
                        size={32}
                        shape="rounded-square"
                      />
                    }
                    action={
                      <UnreadsUI.Graphic
                        count={channel.mentions?.size ?? 0}
                        unread
                      />
                    }
                    description={
                      <div style={{ display: "flex", "flex-direction": "column", gap: "2px" }}>
                        <div style={{ color: "var(--md-sys-color-error)", "font-size": "0.8rem", "font-weight": 600 }}>
                           <Trans>You were mentioned</Trans>
                        </div>
                        <Show when={client().messages.get(channel.lastMessageId)}>
                          {(msg: any) => (
                            <div style={{ opacity: 0.6, "font-size": "0.85rem", overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap" }}>
                               {msg.contentPlain}
                            </div>
                          )}
                        </Show>
                      </div>
                    }
                  >
                    <div style={{ display: "flex", "align-items": "center", gap: "var(--gap-sm)" }}>
                       <Show when={channel.type === "TextChannel"}>#</Show>
                       {channel.name || channel.recipient?.username}
                    </div>
                  </CategoryButton>
                )}
              </For>
            </Show>
          </Match>
          <Match when={tab() === "invites"}>
             <Show
              when={invitations().length > 0}
              fallback={
                <EmptyState>
                  <MdSend {...symbolSize(48)} style={{ opacity: 0.2 }} />
                  <Text class="body" size="medium">
                    <Trans>No pending invitations</Trans>
                  </Text>
                </EmptyState>
              }
            >
              <For each={invitations()}>
                {(channel: any) => {
                  const msg = client().messages.get(channel.lastMessageId);
                  const code = msg?.contentPlain?.split("/invite/")[1]?.split(" ")[0];
                  const [status, setStatus] = createSignal<"none" | "accepted" | "declined">("none");
                  return (
                    <CategoryButton
                      onClick={() => jumpTo(channel.id)}
                      icon={
                        <Avatar
                          src={channel.iconURL}
                          fallback={channel.recipient?.username}
                          size={32}
                          shape="rounded-square"
                        />
                      }
                      action={
                        <div style={{ display: "flex", gap: "var(--gap-sm)" }}>
                          <AcceptButton
                            variant="standard"
                            data-state={status() === "accepted" ? "accepted" : undefined}
                            onClick={(e: any) => {
                               e.stopPropagation();
                               if (status() !== "none") return;
                               setStatus("accepted");
                               if (code) acceptInvite(code, channel);
                            }}
                          >
                             <IoCheckmarkCircle size={24} />
                          </AcceptButton>
                          <DeclineButton
                            variant="standard"
                            data-state={status() === "declined" ? "declined" : undefined}
                            onClick={(e: any) => {
                               e.stopPropagation();
                               if (status() !== "none") return;
                               setStatus("declined");
                               markRead(channel);
                            }}
                          >
                             <FaSolidCircleXmark size={24} />
                          </DeclineButton>
                        </div>
                      }
                      description={
                        <div style={{ display: "flex", "flex-direction": "column", gap: "var(--gap-sm)", "margin-top": "var(--gap-sm)" }}>
                           <Show when={code} fallback={<Text size="small">{msg?.contentPlain}</Text>}>
                              <Invite code={code!} hideButton />
                           </Show>
                        </div>
                      }
                    >
                      <div style={{ display: "flex", "align-items": "center", gap: "var(--gap-sm)" }}>
                         {channel.recipient?.username}
                      </div>
                    </CategoryButton>
                  );
                }}
              </For>
            </Show>
          </Match>
          <Match when={tab() === "rewards"}>
             <Column gap="md">
                <Text size="large" align="center" style={{ "font-weight": 700, opacity: 0.9 }}>
                    <Trans id="inbox.rewards.congrats">Congratulations!</Trans>
                </Text>
                <div style={{
                  display: "flex",
                  "flex-direction": "column",
                  "align-items": "center",
                  gap: "16px",
                  padding: "24px",
                  background: "var(--md-sys-color-primary-container)",
                  "border-radius": "16px",
                  position: "relative",
                  overflow: "hidden",
                  "box-shadow": "0 0 20px rgba(var(--md-sys-color-primary-rgb), 0.3)",
                  border: "1px solid rgba(var(--md-sys-color-primary-rgb), 0.2)"
                }}>
                    <RewardIconContainer>
                       <EarlyAdopterSVG />
                    </RewardIconContainer>
                    <Text align="center" size="medium" style={{ "max-width": "240px", "line-height": "1.4" }}>
                        <Trans id="inbox.rewards.badge_received">You're one of our first 1000 users! You've officially received the **Early Adopter** badge.</Trans>
                    </Text>
                    <CategoryButton 
                        onClick={() => {
                            localStorage.setItem("reward_early_adopter_seen", "true");
                            setRewardSeen(true);
                            setTab("unreads");
                        }}
                        icon={<IoCheckmarkCircle size={24} />}
                        style={{ "margin-top": "8px" }}
                    >
                        <Trans id="inbox.rewards.collect">Collect Badge & Dismiss</Trans>
                    </CategoryButton>
                </div>
             </Column>
          </Match>
        </Switch>
      </Column>
    </Dialog>
  );
}

const TabButton = styled("button", {
  base: {
    paddingInline: "var(--gap-md)",
    paddingBlock: "var(--gap-sm)",
    cursor: "pointer",
    borderRadius: "var(--borderRadius-md)",
    transition: "var(--transitions-fast) all",

    lineHeight: "1.5rem",
    fontSize: "1rem",
    letterSpacing: "0.009375rem",
    fontWeight: 550,

    opacity: 0.6,
    _hover: {
      opacity: 1,
      background: "var(--md-sys-color-surface-container-high)",
    },
  },
  variants: {
    active: {
      true: {
        opacity: 1,
        color: "var(--md-sys-color-primary)",
        background: "var(--md-sys-color-primary-container)",
      },
    },
  },
});

const AcceptButton = styled(IconButton, {
  base: {
    color: "var(--md-sys-color-on-surface-variant)",
    opacity: 0.7,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    _hover: {
      opacity: 1,
      color: "#23a559",
      transform: "scale(1.2) rotate(10deg)",
      background: "rgba(35, 165, 89, 0.2)",
    },
    _active: {
      transform: "scale(0.95)",
    },
    "&[data-state='accepted']": {
      opacity: 1,
      color: "#23a559 !important",
      background: "rgba(35, 165, 89, 0.2) !important",
      transform: "scale(1.1)",
    },
  },
});

const DeclineButton = styled(IconButton, {
  base: {
    color: "var(--md-sys-color-on-surface-variant)",
    opacity: 0.7,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    _hover: {
      opacity: 1,
      color: "#da373c",
      transform: "scale(1.2) rotate(-10deg)",
      background: "rgba(218, 55, 60, 0.2)",
    },
    _active: {
      transform: "scale(0.95)",
    },
    "&[data-state='declined']": {
      opacity: 1,
      color: "#da373c !important",
      background: "rgba(218, 55, 60, 0.2) !important",
      transform: "scale(1.1)",
    },
  },
});

const EmptyState = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "var(--gap-xl)",
    gap: "var(--gap-md)",
    opacity: 0.5,
  },
});

const RewardIconContainer = styled("div", {
  base: {
    width: "64px",
    height: "64px",
    display: "grid",
    placeItems: "center",
    position: "relative",
    filter: "drop-shadow(0 0 10px var(--md-sys-color-primary))",
    animation: "reward-glow 2s infinite alternate ease-in-out",

    "& svg": {
      width: "48px",
      height: "48px",
    },

    "@keyframes reward-glow": {
      from: {
        transform: "scale(1)",
        filter: "drop-shadow(0 0 8px var(--md-sys-color-primary))",
      },
      to: {
        transform: "scale(1.1)",
        filter: "drop-shadow(0 0 20px var(--md-sys-color-primary))",
      },
    },
  },
});
