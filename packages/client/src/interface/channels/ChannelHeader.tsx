import { Accessor, Match, Setter, Show, Switch } from "solid-js";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { Channel } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { TextWithEmoji } from "@revolt/markdown";
import { useModals } from "@revolt/modal";
import { useState } from "@revolt/state";
import { LAYOUT_SECTIONS } from "@revolt/state/stores/Layout";
import {
  Button,
  IconButton,
  NonBreakingText,
  OverflowingText,
  Spacer,
  UserStatus,
  typography,
} from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";
import { useVoice } from "@revolt/rtc";

import MdGroup from "@material-design-icons/svg/outlined/group.svg?component-solid";
import MdPersonAdd from "@material-design-icons/svg/outlined/person_add.svg?component-solid";
import MdSettings from "@material-design-icons/svg/outlined/settings.svg?component-solid";

import MdKeep from "../../svg/keep.svg?component-solid";
import { HeaderIcon } from "../common/CommonHeader";

import { SidebarState } from "./text/TextChannel";

interface Props {
  /**
   * Channel to render header for
   */
  channel: Channel;

  /**
   * Sidebar state
   */
  sidebarState?: Accessor<SidebarState>;

  /**
   * Set sidebar state
   */
  setSidebarState?: Setter<SidebarState>;
}

/**
 * Common channel header component
 */
export function ChannelHeader(props: Props) {
  const { openModal } = useModals();
  const client = useClient();
  const { t } = useLingui();
  const state = useState();
  const voice = useVoice();

  const searchValue = () => {
    if (!props.sidebarState) return null;

    const state = props.sidebarState();
    if (state.state === "search") {
      return state.query;
    } else {
      return "";
    }
  };

  return (
    <>
      <Switch>
        <Match
          when={
            props.channel.type === "TextChannel" ||
            props.channel.type === "Group"
          }
        >
          <HeaderIcon>
            <Symbol>grid_3x3</Symbol>
          </HeaderIcon>
          <NonBreakingText
            class={typography({ class: "title", size: "medium" })}
            onClick={() =>
              openModal({
                type: "channel_info",
                channel: props.channel,
              })
            }
          >
            <TextWithEmoji content={props.channel.name!} />
          </NonBreakingText>
          <Show when={props.channel.description}>
            <Divider />
            <a
              class={descriptionLink}
              onClick={() =>
                openModal({
                  type: "channel_info",
                  channel: props.channel,
                })
              }
              use:floating={{
                tooltip: {
                  placement: "bottom",
                  content: t`Click to show full description`,
                },
              }}
            >
              <OverflowingText
                class={typography({ class: "title", size: "small" })}
              >
                <TextWithEmoji
                  content={props.channel.description?.split("\n").shift()}
                />
              </OverflowingText>
            </a>
          </Show>
        </Match>
        <Match when={props.channel.type === "DirectMessage"}>
          <HeaderIcon>
            <Symbol>alternate_email</Symbol>
          </HeaderIcon>
          <TextWithEmoji content={props.channel.recipient?.username ?? ""} />
          <Show when={props.channel.recipient?.presence}>
            <UserStatus status={props.channel.recipient!.presence} size="8px" />
          </Show>
        </Match>
        <Match when={props.channel.type === "SavedMessages"}>
          <HeaderIcon>
            <Symbol>note_stack</Symbol>
          </HeaderIcon>
          <Trans>Saved Notes</Trans>
        </Match>
      </Switch>

      <Spacer />

      <Show
        when={
          (props.channel.type === "Group" || props.channel.serverId) &&
          props.channel.orPermission("ManageChannel", "ManagePermissions")
        }
      >
        <IconButton
          onPress={() =>
            openModal({
              type: "settings",
              config: "channel",
              context: props.channel,
            })
          }
          use:floating={{
            tooltip: {
              placement: "bottom",
              content: t`Channel Settings`,
            },
          }}
        >
          <MdSettings />
        </IconButton>
      </Show>

      <Show when={props.channel.type === "Group"}>
        <Button
          variant="text"
          size="icon"
          onPress={() =>
            openModal({
              type: "add_members_to_group",
              group: props.channel,
              client: client(),
            })
          }
          use:floating={{
            tooltip: {
              placement: "bottom",
              content: t`Add friends to group`,
            },
          }}
        >
          <MdPersonAdd />
        </Button>
      </Show>

      <Show when={props.channel.type === "DirectMessage"}>
        <div
          class={css({
            position: "relative",
          })}
        >
          <IconButton
            onPress={async () => {
              if (voice.channel()?.id === props.channel.id) {
                voice.disconnect();
                return;
              }

              try {
                // Call the backend API to initiate the call and notify recipients
                await fetch("/api/call/start", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    channelId: props.channel.id,
                    userId: client()?.user?.id,
                  }),
                });

                // Connect to the voice channel locally
                voice.connect(props.channel);
              } catch (err) {
                console.error("Failed to start calling:", err);
                // Fallback to direct connection if API fails
                voice.connect(props.channel);
              }
            }}
            variant={voice.channel()?.id === props.channel.id ? "tonal" : "standard"}
            use:floating={{
              tooltip: {
                placement: "bottom",
                content: voice.channel()?.id === props.channel.id 
                  ? t`Leave Call` 
                  : (props.channel.voiceParticipants.size > 0 
                    ? t`${[...props.channel.voiceParticipants.values()].map(p => props.channel.client.users.get(p.userId)?.username ?? t`Someone`).join(", ")} is in the call`
                    : t`Start Voice Call`),
              },
            }}
          >
            <Show when={voice.channel()?.id === props.channel.id} fallback={<Symbol>call</Symbol>}>
              <Symbol>call_end</Symbol>
            </Show>
          </IconButton>
          <Show when={props.channel.voiceParticipants.size > 0 && voice.channel()?.id !== props.channel.id}>
            <div
              class={css({
                position: "absolute",
                bottom: "-2px",
                right: "-2px",
                display: "flex",
                gap: "2px",
                padding: "2px",
                borderRadius: "var(--borderRadius-circle)",
                background: "var(--md-sys-color-primary)",
                color: "var(--md-sys-color-on-primary)",
                boxShadow: "var(--shadow-sm)",
              })}
            >
              <Symbol size={10} fill>
                fiber_manual_record
              </Symbol>
              <Show
                when={[...props.channel.voiceParticipants.values()].some((p) =>
                  p.isScreensharing(),
                )}
              >
                <Symbol size={10}>screen_share</Symbol>
              </Show>
            </div>
          </Show>
        </div>
      </Show>

      <Show when={props.sidebarState}>
        <IconButton
          use:floating={{
            tooltip: {
              placement: "bottom",
              content: t`View pinned messages`,
            },
          }}
          onPress={() =>
            props.sidebarState!().state === "pins"
              ? props.setSidebarState!({
                  state: "default",
                })
              : props.setSidebarState!({
                  state: "pins",
                })
          }
        >
          <MdKeep />
        </IconButton>
      </Show>

      <Show when={props.sidebarState && props.channel.type !== "SavedMessages"}>
        <IconButton
          onPress={() => {
            if (props.sidebarState!().state === "default") {
              state.layout.toggleSectionState(
                LAYOUT_SECTIONS.MEMBER_SIDEBAR,
                true,
              );
            } else {
              state.layout.setSectionState(
                LAYOUT_SECTIONS.MEMBER_SIDEBAR,
                true,
                true,
              );

              props.setSidebarState!({
                state: "default",
              });
            }
          }}
          use:floating={{
            tooltip: {
              placement: "bottom",
              content: t`View members`,
            },
          }}
        >
          <MdGroup />
        </IconButton>
      </Show>

      <Show when={searchValue() !== null}>
        <input
          class={css({
            height: "40px",
            width: "240px",
            paddingInline: "16px",
            borderRadius: "var(--borderRadius-full)",
            background: "var(--md-sys-color-surface-container-high)",
          })}
          placeholder="Search messages..."
          value={searchValue()!}
          onChange={(e) =>
            e.currentTarget.value
              ? props.setSidebarState!({
                  state: "search",
                  query: e.currentTarget.value,
                })
              : props.setSidebarState!({
                  state: "default",
                })
          }
        />
      </Show>
    </>
  );
}

/**
 * Vertical divider between name and topic
 */
const Divider = styled("div", {
  base: {
    height: "20px",
    margin: "0px 5px",
    paddingLeft: "1px",
    backgroundColor: "var(--md-sys-color-outline-variant)",
  },
});

/**
 * Link for the description
 */
const descriptionLink = css({
  minWidth: 0,
});
