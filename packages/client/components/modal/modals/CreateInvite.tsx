import { For, Match, Show, Switch, createMemo, createSignal, onMount } from "solid-js";

import { Trans } from "@lingui-solid/solid/macro";
import { useMutation } from "@tanstack/solid-query";
import { User } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { CONFIGURATION } from "@revolt/common";
import {
  Avatar,
  Button,
  CategoryButton,
  Column,
  Dialog,
  DialogProps,
  IconButton,
  ListItem,
  OverflowingText,
} from "@revolt/ui";
import { BsEnvelopeCheckFill, BsEnvelopeFill } from "solid-icons/bs";

import { useModals } from "..";
import { Modals } from "../types";

/**
 * Code block which displays invite
 */
const Invite = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",

    "& code": {
      padding: "1em",
      userSelect: "all",
      fontSize: "1.4em",
      textAlign: "center",
      fontFamily: "var(--fonts-monospace)",
    },
  },
});

/**
 * Modal to create a new invite
 */
export function CreateInviteModal(
  props: DialogProps & Modals & { type: "create_invite" },
) {
  const client = useClient();
  const { showError } = useModals();
  const [link, setLink] = createSignal("");
  const [tab, setTab] = createSignal<"link" | "friends">("link");

  const [invitesSent, setInvitesSent] = createSignal<Set<string>>(new Set());

  const fetchInvite = useMutation(() => ({
    mutationFn: () =>
      props.channel
        .createInvite()
        .then(({ _id }) =>
          setLink(
            CONFIGURATION.IS_STOAT
              ? `https://gangio.pro/invite/${_id}`
              : `${window.location.protocol}//${window.location.host}/invite/${_id}`,
          ),
        ),
    onError: showError,
  }));

  onMount(() => fetchInvite.mutate());

  const friends = createMemo(() => {
    return client()
      .users.toList()
      .filter((user) => user.relationship === "Friend")
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  });

  const sendInvite = async (friend: User) => {
    try {
      let currentLink = link();
      if (!currentLink) {
        const invite = await props.channel.createInvite();
        currentLink = CONFIGURATION.IS_STOAT
          ? `https://gangio.pro/invite/${invite._id}`
          : `${window.location.protocol}//${window.location.host}/invite/${invite._id}`;
        setLink(currentLink);
      }

      // Get DM channel ID without activating it locally
      const dm = (await client().api.get(`/users/${friend.id}/dm`)) as any;
      
      // Send message directly via API to avoid client-side side effects
      await client().api.post(`/channels/${dm._id}/messages`, {
        content: currentLink,
      });

      setInvitesSent((prev) => new Set(prev).add(friend.id));
    } catch (e) {
      showError(e);
    }
  };

  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      title={
        <div style={{ display: "flex", gap: "var(--gap-lg)" }}>
          <TabButton active={tab() === "link"} onClick={() => setTab("link")}>
            <Trans>Link</Trans>
          </TabButton>
          <TabButton
            active={tab() === "friends"}
            onClick={() => setTab("friends")}
          >
            <Trans>Friends</Trans>
          </TabButton>
        </div>
      }
      actions={[
        { text: <Trans>Close</Trans> },
        {
          text: <Trans>Copy Link</Trans>,
          onClick: () => {
            if (link()) {
              navigator.clipboard.writeText(link());
            }
            return false;
          },
        },
      ]}
    >
      <Switch>
        <Match when={tab() === "link"}>
          <Show
            when={!fetchInvite.isPending}
            fallback={<Trans>Generating invite…</Trans>}
          >
            <Invite>
              <Trans>
                Here is your new invite code: <code>{link()}</code>
              </Trans>
            </Invite>
          </Show>
        </Match>
        <Match when={tab() === "friends"}>
          <Column gap="sm" style={{ "max-height": "400px", overflow: "auto" }}>
            <For each={friends()}>
              {(friend) => (
                <CategoryButton
                  icon={
                    <Avatar
                      size={32}
                      src={friend.avatarURL}
                      fallback={friend.username}
                    />
                  }
                  action={
                    <Show
                      when={invitesSent().has(friend.id)}
                      fallback={
                        <SendButton
                          variant="standard"
                          onPress={() => sendInvite(friend)}
                        >
                          <BsEnvelopeFill size={20} />
                        </SendButton>
                      }
                    >
                      <SentButton
                        variant="standard"
                        isDisabled
                      >
                        <BsEnvelopeCheckFill size={20} />
                      </SentButton>
                    </Show>
                  }
                >
                  <OverflowingText>{friend.displayName}</OverflowingText>
                </CategoryButton>
              )}
            </For>
            <Show when={friends().length === 0}>
              <div style={{ padding: "var(--gap-lg)", opacity: 0.5, "text-align": "center" }}>
                <Trans>You have no friends to invite!</Trans>
              </div>
            </Show>
          </Column>
        </Match>
      </Switch>
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

const SendButton = styled(IconButton, {
  base: {
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    _hover: {
      transform: "scale(1.15) rotate(-5deg)",
      color: "var(--md-sys-color-primary)",
      background: "var(--md-sys-color-primary-container)",
    },
    _active: {
      transform: "scale(0.95)",
    },
  },
});

const SentButton = styled(IconButton, {
  base: {
    color: "var(--md-sys-color-tertiary) !important",
    animation: "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
    background: "var(--md-sys-color-tertiary-container) !important",
  },
});

const cssRules = `
@keyframes scaleIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.appendChild(document.createTextNode(cssRules));
  document.head.appendChild(style);
}
