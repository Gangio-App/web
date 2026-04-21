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

        <Text size="small" class={"label"}>
          {permissionDescription()}
        </Text>
      </CategoryButtonGroup>
      {/* <FormGroup>
        <CategoryButton
          action={<Checkbox value onChange={(value) => void value} />}
          onClick={() => void 0}
          icon={<MdMarkUnreadChatAlt {...iconSize(22)} />}
          description={t(
            "app.settings.pages.notifications.descriptions.enable_push"
          )}
        >
          {t("app.settings.pages.notifications.enable_push")}
        </CategoryButton>
      </FormGroup> */}
      <CategoryCollapse
        title={<Trans>Sounds</Trans>}
        icon={<MdSpeaker {...iconSize(22)} />}
        defaultOpen
      >
        <CategoryButton
          icon="blank"
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

        <CategoryButton icon="blank" onClick={() => void 0}>
          <Trans>Sound volume</Trans>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={soundVolume()}
            onInput={(e) => setSoundVolumeSignal(Number(e.currentTarget.value))}
          />
        </CategoryButton>

        <CategoryButton icon="blank" onClick={() => void 0}>
          <Trans>Message volume</Trans>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={messageVolume()}
            onInput={(e) =>
              setMessageVolumeSignal(Number(e.currentTarget.value))
            }
          />
        </CategoryButton>

        <CategoryButton
          icon="blank"
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
          icon="blank"
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
          icon="blank"
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
          icon="blank"
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
          icon="blank"
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
          icon="blank"
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

      <CategoryCollapse title={<Trans>Notify me when…</Trans>} icon={<></>}>
        <CategoryButton
          icon="blank"
          action={<Checkbox checked={notifyReactions()} />}
          onClick={() => setNotifyReactions(!notifyReactions())}
        >
          <Trans>Someone reacts to my messages</Trans>
        </CategoryButton>

        <CategoryButton
          icon="blank"
          action={<Checkbox checked={notifyFriendProfileUpdates()} />}
          onClick={() =>
            setNotifyFriendProfileUpdates(!notifyFriendProfileUpdates())
          }
        >
          <Trans>Friends update their profile</Trans>
        </CategoryButton>

        <CategoryButton
          icon="blank"
          action={<Checkbox checked={notifyCalls()} />}
          onClick={() => setNotifyCalls(!notifyCalls())}
        >
          <Trans>Someone calls me</Trans>
        </CategoryButton>
      </CategoryCollapse>
    </Column>
  );
}
