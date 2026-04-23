import { JSX, Match, Show, Switch } from "solid-js";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import {
  CallStartedSystemMessage,
  ChannelEditSystemMessage,
  ChannelOwnershipChangeSystemMessage,
  ChannelRenamedSystemMessage,
  MessagePinnedSystemMessage,
  SystemMessage as SystemMessageClass,
  TextSystemMessage,
  User,
  UserModeratedSystemMessage,
  UserSystemMessage,
} from "stoat.js";
import { styled } from "styled-system/jsx";

import { useTime } from "@revolt/i18n";
import { time } from "@revolt/markdown/elements";
import { RenderAnchor } from "@revolt/markdown/plugins/anchors";
import { UserMention } from "@revolt/markdown/plugins/mentions";
import { useSmartParams } from "@revolt/routing";
import { useVoice } from "@revolt/rtc";
import { Button, formatTime, Time } from "@revolt/ui/components/utils";
import { Button as UIButton } from "@revolt/ui";
import { useClient } from "@revolt/client";
import { css } from "styled-system/css";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

interface Props {
  /**
   * System Message
   */
  systemMessage: SystemMessageClass;

  /**
   * Menu generator
   */
  menuGenerator: (user?: User) => JSX.Directives["floating"];

  /**
   * Whether this is rendered within a server
   */
  isServer: boolean;
}

/**
 * System Message
 */
export function SystemMessage(props: Props) {
  const params = useSmartParams();
  const dayjs = useTime();
  const voice = useVoice();
  const client = useClient();

  return (
    <Base>
      <Switch fallback={props.systemMessage.type}>
        <Match when={props.systemMessage.type === "user_added"}>
          <Trans>
            <UserMention
              userId={
                (props.systemMessage as UserModeratedSystemMessage).userId
              }
            />{" "}
            has been added by{" "}
            <UserMention
              userId={(props.systemMessage as UserModeratedSystemMessage).byId}
            />
          </Trans>
        </Match>
        <Match
          when={props.systemMessage.type === "user_left" && !props.isServer}
        >
          <Trans>
            <UserMention
              userId={(props.systemMessage as UserSystemMessage).userId}
            />{" "}
            left the group
          </Trans>
        </Match>
        <Match when={props.systemMessage.type === "user_remove"}>
          <Trans>
            <UserMention
              userId={
                (props.systemMessage as UserModeratedSystemMessage).userId
              }
            />{" "}
            has been removed by{" "}
            <UserMention
              userId={(props.systemMessage as UserModeratedSystemMessage).byId}
            />
          </Trans>
        </Match>
        <Match when={props.systemMessage.type === "user_kicked"}>
          <Trans>
            <UserMention
              userId={(props.systemMessage as UserSystemMessage).userId}
            />{" "}
            has been kicked from the server
          </Trans>
        </Match>
        <Match when={props.systemMessage.type === "user_banned"}>
          <Trans>
            <UserMention
              userId={(props.systemMessage as UserSystemMessage).userId}
            />{" "}
            has been banned from the server
          </Trans>
        </Match>
        <Match when={props.systemMessage.type === "user_joined"}>
          <Trans>
            <UserMention
              userId={(props.systemMessage as UserSystemMessage).userId}
            />{" "}
            joined the server
          </Trans>
        </Match>
        <Match
          when={props.systemMessage.type === "user_left" && props.isServer}
        >
          <Trans>
            <UserMention
              userId={(props.systemMessage as UserSystemMessage).userId}
            />{" "}
            left the server
          </Trans>
        </Match>
        <Match when={props.systemMessage.type === "channel_renamed"}>
          <Trans>
            <UserMention
              userId={(props.systemMessage as ChannelRenamedSystemMessage).byId}
            />{" "}
            updated the group name to{" "}
            <strong>
              {(props.systemMessage as ChannelRenamedSystemMessage).name}
            </strong>
          </Trans>
        </Match>
        <Match
          when={props.systemMessage.type === "channel_description_changed"}
        >
          <Trans>
            <UserMention
              userId={(props.systemMessage as ChannelEditSystemMessage).byId}
            />{" "}
            updated the group description
          </Trans>
        </Match>
        <Match when={props.systemMessage.type === "channel_icon_changed"}>
          <Trans>
            <UserMention
              userId={(props.systemMessage as ChannelEditSystemMessage).byId}
            />{" "}
            updated the group icon{" "}
          </Trans>
        </Match>
        <Match when={props.systemMessage.type === "channel_ownership_changed"}>
          <Trans>
            <UserMention
              userId={
                (props.systemMessage as ChannelOwnershipChangeSystemMessage)
                  .fromId
              }
            />{" "}
            transferred group ownership to{" "}
            <UserMention
              userId={
                (props.systemMessage as ChannelOwnershipChangeSystemMessage)
                  .toId
              }
            />
          </Trans>
        </Match>
        <Match when={props.systemMessage.type === "message_pinned"}>
          <Trans>
            <UserMention
              userId={(props.systemMessage as MessagePinnedSystemMessage).byId}
            />{" "}
            pinned{" "}
            <RenderAnchor
              href={
                location.origin +
                (params().serverId ? `/server/${params().serverId}` : "") +
                `/channel/${params().channelId}/${(props.systemMessage as MessagePinnedSystemMessage).messageId}`
              }
            />
          </Trans>
        </Match>
        <Match when={props.systemMessage.type === "message_unpinned"}>
          <Trans>
            <UserMention
              userId={(props.systemMessage as MessagePinnedSystemMessage).byId}
            />{" "}
            unpinned{" "}
            <RenderAnchor
              href={
                location.origin +
                (params().serverId ? `/server/${params().serverId}` : "") +
                `/channel/${params().channelId}/${(props.systemMessage as MessagePinnedSystemMessage).messageId}`
              }
            />
          </Trans>
        </Match>
        <Match when={props.systemMessage.type === "call_started"}>
          <CallStartedCard
            systemMessage={props.systemMessage as CallStartedSystemMessage}
          />
        </Match>
        <Match when={props.systemMessage.type === "text"}>
          {(props.systemMessage as TextSystemMessage).content}
        </Match>
      </Switch>
    </Base>
  );
}

const Base = styled("div", {
  base: {
    minHeight: "20px",
    alignItems: "center",
  },
});
/**
 * Card for call started system message
 */
function CallStartedCard(props: { systemMessage: CallStartedSystemMessage }) {
  const voice = useVoice();
  const { t } = useLingui();
  const params = useSmartParams();
  const client = useClient();

  const finished = () => !!props.systemMessage.finishedAt;
  const inThisCall = () => voice.channel()?.id === params().channelId;
  const isCallActive = () => {
    const channel = client().channels.get(params().channelId);
    return !finished() && (channel?.voiceParticipants.size ?? 0) > 0;
  };

  const formatDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (hours > 0)
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      class={css({
        background: "var(--md-sys-color-surface-container)",
        padding: "var(--gap-md)",
        borderRadius: "var(--borderRadius-lg)",
        marginTop: "var(--gap-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--gap-md)",
        maxWidth: "320px",
        border: "1px solid var(--md-sys-color-outline-variant)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      })}
    >
      <div
        class={css({ display: "flex", alignItems: "center", gap: "var(--gap-md)" })}
      >
        <div
          class={css({
            background: "var(--md-sys-color-primary)",
            color: "var(--md-sys-color-on-primary)",
            padding: "10px",
            borderRadius: "12px",
            display: "flex",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          })}
        >
          <Symbol size={24}>voice_chat</Symbol>
        </div>
        <div class={css({ display: "flex", flexDirection: "column" })}>
          <div class={css({ fontWeight: "bold", fontSize: "14px" })}>
            {t`Voice Call`}
          </div>
          <div class={css({ fontSize: "12px", opacity: 0.7 })}>
            {finished() ? (
              <>
                {t`Call ended`} &middot;{" "}
                {formatDuration(
                  props.systemMessage.startedAt,
                  props.systemMessage.finishedAt!,
                )}
              </>
            ) : isCallActive() ? (
              t`Call in progress`
            ) : (
              t`Call started`
            )}
          </div>
        </div>
      </div>
      <Show when={!finished()}>
        <Show
          when={!inThisCall()}
          fallback={
            <UIButton
              variant="_error"
              size="small"
              onPress={() => voice.disconnect()}
              class={css({ width: "100%", justifyContent: "center" })}
            >
              <Symbol size={18}>call_end</Symbol>
              {t`Leave Call`}
            </UIButton>
          }
        >
          <UIButton
            variant="tonal"
            size="small"
            onPress={() => {
              const channel = client().channels.get(params().channelId);
              if (channel) {
                voice.connect(channel);
              }
            }}
            class={css({ width: "100%", justifyContent: "center" })}
          >
            <Symbol size={18}>call</Symbol>
            {t`Join Call`}
          </UIButton>
        </Show>
      </Show>
    </div>
  );
}
