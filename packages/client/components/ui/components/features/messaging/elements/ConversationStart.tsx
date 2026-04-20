import { Match, Show, Switch } from "solid-js";

import { Trans } from "@lingui-solid/solid/macro";
import { Channel } from "stoat.js";
import { styled } from "styled-system/jsx";

import { Text } from "../../../design";

interface Props {
  /**
   * Channel information
   */
  channel: Channel;
}

import MdPersonAddAlt from "@material-design-icons/svg/outlined/person_add_alt.svg?component-solid";
import MdBlock from "@material-design-icons/svg/outlined/block.svg?component-solid";
import MdReport from "@material-design-icons/svg/outlined/report.svg?component-solid";
import { Button } from "../../../design";
import { Row, Column } from "../../../layout";
import { iconSize } from "../../../utils";
import { useModals } from "@revolt/modal";
import { useClient } from "@revolt/client";

/**
 * Mark the beginning of a conversation
 */
export function ConversationStart(props: Props) {
  const { openModal } = useModals();
  const client = useClient();

  return (
    <Base>
      <Show when={props.channel.type !== "SavedMessages"}>
        <Text class="headline" size="large">
          {props.channel.name ?? props.channel.recipient?.username}
        </Text>
      </Show>
      <Text class="title">
        <Switch
          fallback={<Trans>This is the start of your conversation.</Trans>}
        >
          <Match when={props.channel.type === "SavedMessages"}>
            <Trans>This is the start of your notes.</Trans>
          </Match>
        </Switch>
      </Text>

      <Show
        when={
          props.channel.type === "DirectMessage" &&
          props.channel.recipient &&
          props.channel.recipient.relationship !== "Friend" &&
          !props.channel.recipient.bot
        }
      >
        <div style={{ "margin-top": "16px" }}>
          <Text class="body" size="small">
            <Trans>You are not friends with this user.</Trans>
          </Text>
          <Row gap="md" style={{ "margin-top": "8px" }}>
            <Button
              size="sm"
              onPress={() => props.channel.recipient!.addFriend()}
            >
              <MdPersonAddAlt {...iconSize(16)} />
              <Trans>Add Friend</Trans>
            </Button>
            <Button
              size="sm"
              variant="tonal"
              onPress={() => props.channel.recipient!.blockUser()}
            >
              <MdBlock {...iconSize(16)} />
              <Trans>Block user</Trans>
            </Button>
            <Button
              size="sm"
              variant="_error"
              onPress={() => {
                openModal({
                  type: "report_content",
                  target: props.channel.recipient!,
                  client: client(),
                });
              }}
            >
              <MdReport {...iconSize(16)} />
              <Trans>Report</Trans>
            </Button>
          </Row>
        </div>
      </Show>
    </Base>
  );
}

/**
 * Base styles
 */
const Base = styled("div", {
  base: {
    display: "flex",
    userSelect: "none",
    flexDirection: "column",
    margin: "18px 16px 10px 16px",

    color: "var(--md-sys-color-on-surface)",
  },
});
