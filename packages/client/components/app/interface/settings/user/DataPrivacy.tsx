import { Trans } from "@lingui-solid/solid/macro";

import { styled } from "styled-system/jsx";

import { createEffect, createSignal, on } from "solid-js";

import { useClient } from "@revolt/client";
import { useState } from "@revolt/state";
import {
  CategoryButton,
  CategoryButtonGroup,
  CategoryCollapse,
  Checkbox,
  Column,
  iconSize,
} from "@revolt/ui";

import MdLiveTv from "@material-design-icons/svg/outlined/live_tv.svg?component-solid";
import MdBadge from "@material-design-icons/svg/filled/badge.svg?component-solid";
import MdPolicy from "@material-design-icons/svg/outlined/policy.svg?component-solid";
import MdGavel from "@material-design-icons/svg/outlined/gavel.svg?component-solid";
import MdDownload from "@material-design-icons/svg/outlined/download.svg?component-solid";
import MdMail from "@material-design-icons/svg/outlined/mail.svg?component-solid";
import MdPublic from "@material-design-icons/svg/filled/public.svg?component-solid";
import MdPeople from "@material-design-icons/svg/filled/people.svg?component-solid";
import MdVisibilityOff from "@material-design-icons/svg/filled/visibility_off.svg?component-solid";

/**
 * Data & Privacy
 */
export default function DataPrivacy() {
  const client = useClient();
  const state = useState();
  const streamerMode = () => state.settings.getValue("privacy:streamer_mode");

  type BioVisibility = "Everyone" | "Friends" | "Nobody";
  type DMVisibility = "Everyone" | "Friends";

  const [bioVisibility, setBioVisibility] = createSignal<BioVisibility>(
    "Everyone",
  );
  const [dmVisibility, setDMVisibility] = createSignal<DMVisibility>(
    "Everyone",
  );
  const [visibilityUpdateInFlight, setVisibilityUpdateInFlight] =
    createSignal(false);

  createEffect(
    on(client, (c) => {
      c?.api
        .get("/users/@me/profile")
        .then((profile: any) => {
          const visibility = profile?.content_visibility as
            | BioVisibility
            | undefined;
          if (visibility) setBioVisibility(visibility);

          const dmViabilityRes = profile?.direct_message_visibility as
            | DMVisibility
            | undefined;
          if (dmViabilityRes) setDMVisibility(dmViabilityRes);
        })
        .catch(() => void 0);
    }),
  );

  async function setVisibility(next: BioVisibility) {
    if (visibilityUpdateInFlight()) return;

    const prev = bioVisibility();
    if (prev === next) return;

    setVisibilityUpdateInFlight(true);
    setBioVisibility(next);

    try {
      await client().api.patch("/users/@me", {
        profile: {
          content_visibility: next,
        },
      } as any);
    } catch (err) {
      setBioVisibility(prev);
      console.error("Failed to update bio visibility", err);
    } finally {
      setVisibilityUpdateInFlight(false);
    }
  }

  async function updateDMVisibility(next: DMVisibility) {
    if (visibilityUpdateInFlight()) return;

    const prev = dmVisibility();
    if (prev === next) return;

    setVisibilityUpdateInFlight(true);
    setDMVisibility(next);

    try {
      await client().api.patch("/users/@me", {
        profile: {
          direct_message_visibility: next,
        },
      } as any);
    } catch (err) {
      setDMVisibility(prev);
      console.error("Failed to update DM visibility", err);
    } finally {
      setVisibilityUpdateInFlight(false);
    }
  }

  const visibilityDescription = () => {
    switch (bioVisibility()) {
      case "Friends":
        return <Trans>Friends</Trans>;
      case "Nobody":
        return <Trans>Nobody</Trans>;
      default:
        return <Trans>Everyone</Trans>;
    }
  };

  return (
    <Column gap="lg">
      <CategoryButtonGroup>
        <CategoryButton
          icon={<MdLiveTv {...iconSize(22)} />}
          action={<Checkbox checked={streamerMode()} />}
          onClick={() =>
            state.settings.setValue("privacy:streamer_mode", !streamerMode())
          }
          description={
            <Trans>
              Hides personal information and disables certain UI features while streaming.
            </Trans>
          }
        >
          <Trans>Enable Streamer Mode</Trans>
        </CategoryButton>
      </CategoryButtonGroup>

      <CategoryCollapse
        icon={<MdMail {...iconSize(22)} />}
        title={<Trans>Who can message me</Trans>}
        description={
          <>
            <Trans>Control who can send you direct messages.</Trans>{" "}
            <Trans>Current:</Trans>{" "}
            {dmVisibility() === "Everyone" ? (
              <Trans>Everyone</Trans>
            ) : (
              <Trans>Friends Only</Trans>
            )}
          </>
        }
      >
        <CategoryButton
          icon={<MdPublic {...iconSize(22)} />}
          action={<Checkbox checked={dmVisibility() === "Everyone"} />}
          onClick={() => updateDMVisibility("Everyone")}
        >
          <Trans>Everyone</Trans>
        </CategoryButton>
        <CategoryButton
          icon={<MdPeople {...iconSize(22)} />}
          action={<Checkbox checked={dmVisibility() === "Friends"} />}
          onClick={() => updateDMVisibility("Friends")}
        >
          <Trans>Friends Only</Trans>
        </CategoryButton>
      </CategoryCollapse>

      <CategoryCollapse
        icon={<MdBadge {...iconSize(22)} />}
        title={<Trans>Bio visibility</Trans>}
        description={
          <>
            <Trans>Who can see your profile bio?</Trans> <Trans>Current:</Trans>{" "}
            {visibilityDescription()}
          </>
        }
      >
        <CategoryButton
          icon={<MdPublic {...iconSize(22)} />}
          action={<Checkbox checked={bioVisibility() === "Everyone"} />}
          onClick={() => setVisibility("Everyone")}
        >
          <Trans>Everyone</Trans>
        </CategoryButton>
        <CategoryButton
          icon={<MdPeople {...iconSize(22)} />}
          action={<Checkbox checked={bioVisibility() === "Friends"} />}
          onClick={() => setVisibility("Friends")}
        >
          <Trans>Friends</Trans>
        </CategoryButton>
        <CategoryButton
          icon={<MdVisibilityOff {...iconSize(22)} />}
          action={<Checkbox checked={bioVisibility() === "Nobody"} />}
          onClick={() => setVisibility("Nobody")}
        >
          <Trans>Nobody</Trans>
        </CategoryButton>
      </CategoryCollapse>

      <CategoryButtonGroup>
        <Link href="https://gangio.chat/privacy" target="_blank">
          <CategoryButton
            action="external"
            icon={<MdPolicy {...iconSize(22)} />}
            onClick={() => void 0}
            description={<Trans>Learn how we collect and use information.</Trans>}
          >
            <Trans>Privacy Policy</Trans>
          </CategoryButton>
        </Link>
        <Link href="https://gangio.chat/terms" target="_blank">
          <CategoryButton
            action="external"
            icon={<MdGavel {...iconSize(22)} />}
            onClick={() => void 0}
            description={<Trans>Review the rules and terms for using the service.</Trans>}
          >
            <Trans>Terms of Service</Trans>
          </CategoryButton>
        </Link>
      </CategoryButtonGroup>

      <CategoryButtonGroup>
        <Link href="https://gangio.chat/privacy" target="_blank">
          <CategoryButton
            action="external"
            icon={<MdDownload {...iconSize(22)} />}
            onClick={() => void 0}
            description={
              <Trans>
                Request a copy of your personal data. This feature may not be available on all
                instances.
              </Trans>
            }
          >
            <Trans>Request Your Data</Trans>
          </CategoryButton>
        </Link>
      </CategoryButtonGroup>
    </Column>
  );
}

const Link = styled("a", {
  base: {
    textDecoration: "none",
  },
});
