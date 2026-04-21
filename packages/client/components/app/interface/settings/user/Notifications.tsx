import { Trans } from "@lingui-solid/solid/macro";

import { createEffect, createSignal, onMount } from "solid-js";

import {
  CategoryButton,
  CategoryButtonGroup,
  CategoryCollapse,
  Checkbox,
  iconSize,
  Column,
  Text,
} from "@revolt/ui";

import MdNotifications from "@material-design-icons/svg/outlined/notifications.svg?component-solid";
import MdSpeaker from "@material-design-icons/svg/outlined/speaker.svg?component-solid";
import MdHearing from "@material-design-icons/svg/outlined/hearing.svg?component-solid";
import MdMessage from "@material-design-icons/svg/outlined/message.svg?component-solid";
import MdSend from "@material-design-icons/svg/outlined/send.svg?component-solid";
import MdPersonAdd from "@material-design-icons/svg/outlined/person_add.svg?component-solid";
import MdPersonRemove from "@material-design-icons/svg/outlined/person_remove.svg?component-solid";
import MdMic from "@material-design-icons/svg/outlined/mic.svg?component-solid";
import MdHeadset from "@material-design-icons/svg/outlined/headset.svg?component-solid";
import MdAddReaction from "@material-design-icons/svg/outlined/add_reaction.svg?component-solid";
import MdGroup from "@material-design-icons/svg/outlined/group.svg?component-solid";
import MdCall from "@material-design-icons/svg/outlined/call.svg?component-solid";
import MdVolumeUp from "@material-design-icons/svg/outlined/volume_up.svg?component-solid";

import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import {
  getMessageSoundVolume,
  getSoundVolume,
  getDisableAllSounds,
  getSoundEnabled,
  setMessageSoundVolume,
  setSoundVolume,
  setDisableAllSounds,
  setSoundEnabled,
  playSound,
} from "../../../../common/lib/sounds";

function readBool(key: string, fallback: boolean) {
  if (typeof localStorage === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  if (raw === "1") return true;
  if (raw === "0") return false;
  return fallback;
}

function writeBool(key: string, value: boolean) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, value ? "1" : "0");
}

/**
 * Notifications Page
 */
export default function Notifications() {
  const [permission, setPermission] = createSignal<NotificationPermission>(
    "default",
  );
  const [disableAllSounds, setDisableAllSoundsSignal] = createSignal(
    getDisableAllSounds(),
  );
  const [soundVolume, setSoundVolumeSignal] = createSignal(getSoundVolume());
  const [messageVolume, setMessageVolumeSignal] = createSignal(
    getMessageSoundVolume(),
  );

  const [soundMessageReceived, setSoundMessageReceived] = createSignal(
    getSoundEnabled("message_received"),
  );
  const [soundMessageSent, setSoundMessageSent] = createSignal(
    getSoundEnabled("message_sent"),
  );
  const [soundUserJoinedCall, setSoundUserJoinedCall] = createSignal(
    getSoundEnabled("user_join_voice"),
  );
  const [soundUserLeftCall, setSoundUserLeftCall] = createSignal(
    getSoundEnabled("user_leave_voice"),
  );
  const [soundMuteUnmute, setSoundMuteUnmute] = createSignal(
    getSoundEnabled("user_mute_unmute"),
  );
  const [soundDeafenUndeafen, setSoundDeafenUndeafen] = createSignal(
    getSoundEnabled("user_deafen"),
  );

  const [notifyReactions, setNotifyReactions] = createSignal(
    readBool("notify_reactions_to_my_messages", false),
  );
  const [notifyCalls, setNotifyCalls] = createSignal(
    readBool("notify_incoming_calls", true),
  );
  const [notifyFriendProfileUpdates, setNotifyFriendProfileUpdates] =
    createSignal(readBool("notify_friends_profile_updates", false));

  onMount(() => {
    if (typeof Notification === "undefined") return;
    setPermission(Notification.permission);
  });

  createEffect(() => {
    setSoundVolume(soundVolume());
  });

  createEffect(() => {
    setMessageSoundVolume(messageVolume());
  });

  createEffect(() => {
    setDisableAllSounds(disableAllSounds());
  });

  createEffect(() => {
    setSoundEnabled("message_received", soundMessageReceived());
  });

  createEffect(() => {
    setSoundEnabled("message_sent", soundMessageSent());
  });

  createEffect(() => {
    setSoundEnabled("user_join_voice", soundUserJoinedCall());
  });

  createEffect(() => {
    setSoundEnabled("user_leave_voice", soundUserLeftCall());
  });

  createEffect(() => {
    setSoundEnabled("user_mute_unmute", soundMuteUnmute());
  });

  createEffect(() => {
    setSoundEnabled("user_deafen", soundDeafenUndeafen());
    setSoundEnabled("user_undeafen", soundDeafenUndeafen());
  });

  createEffect(() => {
    writeBool("notify_reactions_to_my_messages", notifyReactions());
  });

  createEffect(() => {
    writeBool("notify_incoming_calls", notifyCalls());
  });

  createEffect(() => {
    writeBool("notify_friends_profile_updates", notifyFriendProfileUpdates());
  });

  async function requestPermission() {
    if (typeof Notification === "undefined") return;
    const next = await Notification.requestPermission();
    setPermission(next);
  }

  const permissionDescription = () => {
    if (typeof Notification === "undefined") return <Trans>Unsupported</Trans>;
    if (permission() === "granted") return <Trans>Enabled</Trans>;
    if (permission() === "denied") return <Trans>Denied</Trans>;
    return <Trans>Not requested</Trans>;
  };

  return (
    <ScrollableContainer>
    <Column gap="md">
      <CategoryButtonGroup>
        <CategoryButton
          action={<Checkbox checked={permission() === "granted"} />}
          onClick={requestPermission}
          icon={<MdNotifications {...iconSize(22)} />}
          description={
            <Trans>
              Receive notifications while the app is open and in the background.
            </Trans>
          }
        >
          <Trans>Enable Desktop Notifications</Trans>
        </CategoryButton>

        <div class={css({ padding: "8px 16px" })}>
          <Text size="small" class={"label"}>
            {permissionDescription()}
          </Text>
        </div>
      </CategoryButtonGroup>

      <CategoryCollapse
        title={<Trans>Sounds</Trans>}
        icon={<MdSpeaker {...iconSize(22)} />}
        defaultOpen
      >
        <CategoryButton
          icon={<MdSpeaker {...iconSize(22)} />}
          action={<Checkbox checked={disableAllSounds()} />}
          onClick={() => setDisableAllSoundsSignal(!disableAllSounds())}
          description={
            <Trans>
              Disables all notification sounds, including voice sound effects.
            </Trans>
          }
        >
          <Trans>Disable All Notification Sounds</Trans>
        </CategoryButton>

        <CategoryButton icon={<MdVolumeUp {...iconSize(22)} />} onClick={() => void 0}>
          <Column fullWidth gap="none">
            <div class={css({ display: "flex", justifyContent: "space-between", width: "100%" })}>
              <Trans>Sound volume</Trans>
              <Text size="small" class={"label"}>{Math.round(soundVolume() * 100)}%</Text>
            </div>
            <SliderContainer>
              <ModernSlider
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={soundVolume()}
                onInput={(e) => setSoundVolumeSignal(Number(e.currentTarget.value))}
              />
            </SliderContainer>
          </Column>
        </CategoryButton>

        <CategoryButton icon={<MdVolumeUp {...iconSize(22)} />} onClick={() => void 0}>
          <Column fullWidth gap="none">
            <div class={css({ display: "flex", justifyContent: "space-between", width: "100%" })}>
              <Trans>Message volume</Trans>
              <Text size="small" class={"label"}>{Math.round(messageVolume() * 100)}%</Text>
            </div>
            <SliderContainer>
              <ModernSlider
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={messageVolume()}
                onInput={(e) =>
                  setMessageVolumeSignal(Number(e.currentTarget.value))
                }
              />
            </SliderContainer>
          </Column>
        </CategoryButton>

        <CategoryButton
          icon={<MdMessage {...iconSize(22)} />}
          action={<Checkbox checked={soundMessageReceived()} />}
          onClick={() => setSoundMessageReceived(!soundMessageReceived())}
          description={
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void playSound("message_received");
              }}
            >
              <Trans>Preview Sound</Trans>
            </a>
          }
        >
          <Trans>Message Received</Trans>
        </CategoryButton>

        <CategoryButton
          icon={<MdSend {...iconSize(22)} />}
          action={<Checkbox checked={soundMessageSent()} />}
          onClick={() => setSoundMessageSent(!soundMessageSent())}
          description={
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void playSound("message_sent");
              }}
            >
              <Trans>Preview Sound</Trans>
            </a>
          }
        >
          <Trans>Message Sent</Trans>
        </CategoryButton>

        <CategoryButton
          icon={<MdPersonAdd {...iconSize(22)} />}
          action={<Checkbox checked={soundUserJoinedCall()} />}
          onClick={() => setSoundUserJoinedCall(!soundUserJoinedCall())}
          description={
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void playSound("user_join_voice");
              }}
            >
              <Trans>Preview Sound</Trans>
            </a>
          }
        >
          <Trans>User Joined Call</Trans>
        </CategoryButton>

        <CategoryButton
          icon={<MdPersonRemove {...iconSize(22)} />}
          action={<Checkbox checked={soundUserLeftCall()} />}
          onClick={() => setSoundUserLeftCall(!soundUserLeftCall())}
          description={
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void playSound("user_leave_voice");
              }}
            >
              <Trans>Preview Sound</Trans>
            </a>
          }
        >
          <Trans>User Left Call</Trans>
        </CategoryButton>

        <CategoryButton
          icon={<MdMic {...iconSize(22)} />}
          action={<Checkbox checked={soundMuteUnmute()} />}
          onClick={() => setSoundMuteUnmute(!soundMuteUnmute())}
          description={
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void playSound("user_mute_unmute");
              }}
            >
              <Trans>Preview Sound</Trans>
            </a>
          }
        >
          <Trans>Mute/Unmute</Trans>
        </CategoryButton>

        <CategoryButton
          icon={<MdHeadset {...iconSize(22)} />}
          action={<Checkbox checked={soundDeafenUndeafen()} />}
          onClick={() =>
            setSoundDeafenUndeafen(!soundDeafenUndeafen())
          }
          description={
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void playSound("user_deafen");
              }}
            >
              <Trans>Preview Sound</Trans>
            </a>
          }
        >
          <Trans>Deafen/Undeafen</Trans>
        </CategoryButton>
      </CategoryCollapse>

      <CategoryCollapse title={<Trans>Notify me when…</Trans>} icon={<MdHearing {...iconSize(22)} />}>
        <CategoryButton
          icon={<MdAddReaction {...iconSize(22)} />}
          action={<Checkbox checked={notifyReactions()} />}
          onClick={() => setNotifyReactions(!notifyReactions())}
        >
          <Trans>Someone reacts to my messages</Trans>
        </CategoryButton>

        <CategoryButton
          icon={<MdGroup {...iconSize(22)} />}
          action={<Checkbox checked={notifyFriendProfileUpdates()} />}
          onClick={() =>
            setNotifyFriendProfileUpdates(!notifyFriendProfileUpdates())
          }
        >
          <Trans>Friends update their profile</Trans>
        </CategoryButton>

        <CategoryButton
          icon={<MdCall {...iconSize(22)} />}
          action={<Checkbox checked={notifyCalls()} />}
          onClick={() => setNotifyCalls(!notifyCalls())}
        >
          <Trans>Someone calls me</Trans>
        </CategoryButton>
      </CategoryCollapse>
    </Column>
    </ScrollableContainer>
  );
}

const ScrollableContainer = styled("div", {
  base: {
    maxHeight: "calc(100vh - 120px)",
    overflowY: "auto",
    paddingRight: "4px",
    
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "var(--md-sys-color-surface-container-highest)",
      borderRadius: "var(--borderRadius-full)",
    },
  },
});

const SliderContainer = styled("div", {
  base: {
    height: "24px",
    display: "flex",
    alignItems: "center",
    width: "100%",
    marginTop: "var(--gap-sm)",
  },
});

const ModernSlider = styled("input", {
  base: {
    appearance: "none",
    width: "100%",
    height: "4px",
    borderRadius: "var(--borderRadius-full)",
    background: "var(--md-sys-color-surface-container-highest)",
    outline: "none",
    cursor: "pointer",

    "&::-webkit-slider-thumb": {
      appearance: "none",
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      background: "var(--md-sys-color-primary)",
      transition: "transform 0.1s ease",
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    },

    "&::-webkit-slider-thumb:hover": {
      transform: "scale(1.2)",
    },

    "&::-webkit-slider-runnable-track": {
        width: "100%",
        height: "4px",
        cursor: "pointer",
    }
  },
});
