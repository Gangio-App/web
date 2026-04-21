import { useTime } from "@revolt/i18n";
import { BiSolidShield } from "solid-icons/bi";
import { Show, createResource, For } from "solid-js";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { User, UserBadges } from "stoat.js";
import { styled } from "styled-system/jsx";

import badgeJoke1 from "../../../../../public/assets/badges/amog.svg";
import badgeJoke2 from "../../../../../public/assets/badges/amorbus.svg";
import badgeDeveloper from "../../../../../public/assets/badges/developer.svg";
import badgeEarlyAdopter from "../../../../../public/assets/badges/early_adopter.svg";
import badgeFounder from "../../../../../public/assets/badges/founder.svg";
import badgeGangio from "../../../../../public/assets/badges/revolt_r.svg";
import badgeModeration from "../../../../../public/assets/badges/moderation.svg";
import badgePaw from "../../../../../public/assets/badges/paw.svg";
import badgeRaccoon from "../../../../../public/assets/badges/raccoon.svg";
import badgeSupporter from "../../../../../public/assets/badges/supporter.svg";
import badgeTranslator from "../../../../../public/assets/badges/translator.svg";
import { Text } from "../../design";

import { ProfileCard } from "./ProfileCard";

interface Badge {
  name: string;
  translations?: Record<string, string>;
  bit: number;
  css_class: string;
  icon_name?: string | null;
}

async function fetchBadges(): Promise<Badge[]> {
  try {
    const res = await fetch("/api/badges/public");
    if (res.ok) {
      const data = await res.json();
      return data.badges || [];
    }
  } catch (e) {
    console.error("Failed to load badges:", e);
  }
  return [];
}

export function ProfileBadges(props: { user: User; compact?: boolean }) {
  const { t, i18n } = useLingui();
  const dayjs = useTime();
  const [dynamicBadges] = createResource<Badge[]>(fetchBadges);
  const overriddenBits = () => new Set(dynamicBadges()?.map((b: Badge) => b.bit) || []);
  const getBadgeName = (badge: Badge) => {
    const locale = i18n.locale;
    const shortLocale = locale.split(/[-_]/)[0];
    return badge.translations?.[locale] || badge.translations?.[shortLocale] || badge.name;
  };

  const content = (
    <BadgeRow>
      <img
        use:floating={{
          tooltip: {
            placement: "top",
            content: t`Joined Gangio` + `\n${dayjs(props.user.createdAt).format(
              "MMM D, YYYY",
            )}`,
          },
        }}
        src={badgeGangio}
      />
      <Show when={(props.user.badges & UserBadges.Founder) && !overriddenBits().has(UserBadges.Founder)}>
        <img
          use:floating={{
            tooltip: {
              placement: "top",
              content: t`Gangio Founder`,
            },
          }}
          src={badgeFounder}
        />
      </Show>
      <Show when={(props.user.badges & UserBadges.Developer) && !overriddenBits().has(UserBadges.Developer)}>
        <img
          use:floating={{
            tooltip: {
              placement: "top",
              content: t`Gangio Developer`,
            },
          }}
          src={badgeDeveloper}
        />
      </Show>
      <Show when={(props.user.badges & UserBadges.Supporter) && !overriddenBits().has(UserBadges.Supporter)}>
        <img
          use:floating={{
            tooltip: {
              placement: "top",
              content: t`Donated to Gangio`,
            },
          }}
          src={badgeSupporter}
        />
      </Show>
      <Show when={(props.user.badges & UserBadges.Translator) && !overriddenBits().has(UserBadges.Translator)}>
        <img
          use:floating={{
            tooltip: {
              placement: "top",
              content: t`Helped translate Gangio`,
            },
          }}
          src={badgeTranslator}
        />
      </Show>
      <Show when={(props.user.badges & UserBadges.EarlyAdopter) && !overriddenBits().has(UserBadges.EarlyAdopter)}>
        <img
          use:floating={{
            tooltip: {
              placement: "top",
              content: t`One of the first 1000 users!`,
            },
          }}
          src={badgeEarlyAdopter}
        />
      </Show>
      <Show when={(props.user.badges & UserBadges.PlatformModeration) && !overriddenBits().has(UserBadges.PlatformModeration)}>
        <span
          use:floating={{
            tooltip: {
              placement: "top",
              content: t`Platform Moderator`,
            },
          }}
        >
          <img src={badgeModeration} />
        </span>
      </Show>
      <Show when={(props.user.badges & UserBadges.ResponsibleDisclosure) && !overriddenBits().has(UserBadges.ResponsibleDisclosure)}>
        <span
          use:floating={{
            tooltip: {
              placement: "top",
              content: t`Responsibly disclosed security issues`,
            },
          }}
        >
          <BiSolidShield />
        </span>
      </Show>
      <Show
        when={(props.user.badges & UserBadges.ReservedRelevantJokeBadge1) && !overriddenBits().has(UserBadges.ReservedRelevantJokeBadge1)}
      >
        <img
          use:floating={{
            tooltip: {
              placement: "top",
              content: t`irrelevant joke badge 1`,
            },
          }}
          src={badgeJoke1}
        />
      </Show>
      <Show
        when={(props.user.badges & UserBadges.ReservedRelevantJokeBadge1) && !overriddenBits().has(UserBadges.ReservedRelevantJokeBadge1)}
      >
        <img
          use:floating={{
            tooltip: {
              placement: "top",
              content: t`irrelevant joke badge 2`,
            },
          }}
          src={badgeJoke2}
        />
      </Show>
      <Show when={(props.user.badges & UserBadges.Paw) && !overriddenBits().has(UserBadges.Paw)}>
        <img
          use:floating={{
            tooltip: {
              placement: "top",
              content: "🦊",
            },
          }}
          src={badgePaw}
        />
      </Show>
      <Show when={props.user.id === "01EX2NCWQ0CHS3QJF0FEQS1GR4"}>
        <img
          use:floating={{
            tooltip: {
              placement: "top",
              content: "🦝",
            },
          }}
          src={badgeRaccoon}
        />
      </Show>
      
      <Show when={dynamicBadges()}>
        <For each={dynamicBadges()}>
          {(badge: Badge) => (
            <Show when={(props.user.badges & badge.bit) && badge.icon_name}>
              <img
                use:floating={{
                  tooltip: {
                    placement: "top",
                    content: getBadgeName(badge),
                  },
                }}
                src={`/assets/badges/${badge.icon_name}`}
              />
            </Show>
          )}
        </For>
      </Show>
    </BadgeRow>
  );

  return (
    <Show when={true}>
      <Show when={props.compact} fallback={
        <ProfileCard>
          <Text class="title" size="large">
            <Trans>Badges</Trans>
          </Text>
          {content}
        </ProfileCard>
      }>
        {content}
      </Show>
    </Show>
  );
}

const BadgeRow = styled("div", {
  base: {
    gap: "var(--gap-sm)",
    display: "flex",
    flexWrap: "wrap",

    "& img, & svg": {
      width: "18px",
      height: "18px",
      aspectRatio: "1/1",
    },
  },
});
