import { Match, Show, Switch, createResource, createSignal, For } from "solid-js";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useState } from "@revolt/state";
import {
  CategoryButton,
  CategoryButtonGroup,
  CircularProgress,
  Column,
  Row,
  Text,
  iconSize,
} from "@revolt/ui";

import MdContentCopy from "@material-design-icons/svg/outlined/content_copy.svg?component-solid";
import MdShare from "@material-design-icons/svg/outlined/share.svg?component-solid";
import MdEmojiEvents from "@material-design-icons/svg/outlined/emoji_events.svg?component-solid";
import MdGroup from "@material-design-icons/svg/outlined/group.svg?component-solid";

interface Milestone {
  name: string;
  bit: number;
  referral_threshold: number;
  css_class?: string;
  icon_name?: string | null;
  translations?: Record<string, string>;
}

interface ReferralData {
  user_id: string;
  referral_code: string;
  count: number;
  milestones: Milestone[];
}

async function fetchReferralData(token: string): Promise<ReferralData | null> {
  try {
    const res = await fetch("/api/referrals/public/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return null;
    return (await res.json()) as ReferralData;
  } catch {
    return null;
  }
}

/**
 * Referrals settings page
 */
export function Referrals() {
  const client = useClient();
  const state = useState();
  const { i18n } = useLingui();
  const [copied, setCopied] = createSignal(false);

  const token = () => state.auth.getSession()?.token ?? "";
  const [data, { refetch }] = createResource(token, fetchReferralData);

  const referralLink = () => {
    const userId = client().user?.id;
    if (!userId) return "";
    return `${window.location.origin}/login/create?ref=${userId}`;
  };

  const milestoneName = (m: Milestone) => {
    const locale = i18n().locale;
    return m.translations?.[locale] || m.name;
  };

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  async function shareLink() {
    const url = referralLink();
    if (!url) return;
    if ((navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({
          title: "Gangio",
          text: "Join me on Gangio!",
          url,
        });
        return;
      } catch {
        /* ignore - fall back to copy */
      }
    }
    copyLink();
  }

  const nextMilestone = () => {
    const d = data();
    if (!d) return null;
    return d.milestones.find((m) => m.referral_threshold > d.count) ?? null;
  };

  const progressPercent = () => {
    const d = data();
    const next = nextMilestone();
    if (!d || !next) return 100;
    const prev =
      [...d.milestones]
        .filter((m) => m.referral_threshold <= d.count)
        .sort((a, b) => b.referral_threshold - a.referral_threshold)[0]
        ?.referral_threshold ?? 0;
    const total = next.referral_threshold - prev;
    const done = d.count - prev;
    return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
  };

  return (
    <Column gap="lg">
      <Hero>
        <Column gap="sm">
          <Text class="headline" size="medium">
            <Trans>Invite friends to Gangio</Trans>
          </Text>
          <Text class="body" size="medium">
            <Trans>
              Share your personal referral link. When your friends sign up,
              you'll earn exclusive profile badges as a thank you.
            </Trans>
          </Text>
        </Column>

        <Switch>
          <Match when={data.loading}>
            <CircularProgress />
          </Match>
          <Match when={data()}>
            <LinkRow>
              <LinkInput
                readOnly
                value={referralLink()}
                onFocus={(e) => (e.currentTarget as HTMLInputElement).select()}
              />
              <CopyButton onClick={copyLink}>
                <MdContentCopy {...iconSize(18)} />
                <Show when={copied()} fallback={<Trans>Copy</Trans>}>
                  <Trans>Copied!</Trans>
                </Show>
              </CopyButton>
              <CopyButton onClick={shareLink}>
                <MdShare {...iconSize(18)} />
                <Trans>Share</Trans>
              </CopyButton>
            </LinkRow>
          </Match>
        </Switch>
      </Hero>

      <Show when={data()}>
        {(d) => (
          <>
            <StatRow>
              <StatCard>
                <MdGroup {...iconSize(28)} />
                <Column gap="none">
                  <StatNumber>{d().count}</StatNumber>
                  <StatLabel>
                    <Trans>People referred</Trans>
                  </StatLabel>
                </Column>
              </StatCard>
              <StatCard>
                <MdEmojiEvents {...iconSize(28)} />
                <Column gap="none">
                  <StatNumber>
                    {d().milestones.filter((m) => m.referral_threshold <= d().count).length}
                    <Faded> / {d().milestones.length}</Faded>
                  </StatNumber>
                  <StatLabel>
                    <Trans>Badges earned</Trans>
                  </StatLabel>
                </Column>
              </StatCard>
            </StatRow>

            <Show when={nextMilestone()}>
              {(next) => (
                <ProgressCard>
                  <Row align justify>
                    <Text class="title" size="medium">
                      <Trans>Next milestone</Trans>: {milestoneName(next())}
                    </Text>
                    <Text class="label" size="small">
                      {d().count} / {next().referral_threshold}
                    </Text>
                  </Row>
                  <ProgressTrack>
                    <ProgressFill style={{ width: `${progressPercent()}%` }} />
                  </ProgressTrack>
                  <Text class="body" size="small">
                    <Trans>
                      {next().referral_threshold - d().count} more referrals
                      to unlock this badge
                    </Trans>
                  </Text>
                </ProgressCard>
              )}
            </Show>

            <Column gap="sm">
              <Text class="title" size="medium">
                <Trans>Milestones</Trans>
              </Text>
              <CategoryButtonGroup>
                <For each={d().milestones}>
                  {(m) => {
                    const earned = m.referral_threshold <= d().count;
                    return (
                      <CategoryButton
                        icon={
                          m.icon_name ? (
                            <MilestoneIcon
                              src={`/assets/badges/${m.icon_name}`}
                              data-earned={earned}
                            />
                          ) : (
                            <MdEmojiEvents
                              {...iconSize(22)}
                              fill={
                                earned
                                  ? "var(--md-sys-color-primary)"
                                  : "var(--md-sys-color-outline)"
                              }
                            />
                          )
                        }
                        description={
                          earned ? (
                            <Trans>Unlocked</Trans>
                          ) : (
                            <Trans>
                              Refer {m.referral_threshold} people to unlock
                            </Trans>
                          )
                        }
                      >
                        {milestoneName(m)}
                      </CategoryButton>
                    );
                  }}
                </For>
              </CategoryButtonGroup>
            </Column>
          </>
        )}
      </Show>

      <Show when={!data.loading && !data()}>
        <Text class="body" size="medium">
          <Trans>Could not load referral data. Please try again later.</Trans>
        </Text>
      </Show>

      <Row>
        <RefreshButton onClick={() => refetch()}>
          <Trans>Refresh</Trans>
        </RefreshButton>
      </Row>
    </Column>
  );
}

const Hero = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "20px",
    borderRadius: "var(--borderRadius-lg)",
    background: "var(--md-sys-color-surface-container-high)",
  },
});

const LinkRow = styled("div", {
  base: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
});

const LinkInput = styled("input", {
  base: {
    flex: 1,
    minWidth: "200px",
    padding: "10px 12px",
    borderRadius: "var(--borderRadius-md)",
    border: "1px solid var(--md-sys-color-outline-variant)",
    background: "var(--md-sys-color-surface)",
    color: "var(--md-sys-color-on-surface)",
    fontFamily: "monospace",
    fontSize: "0.85em",
  },
});

const CopyButton = styled("button", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "var(--borderRadius-md)",
    border: "none",
    cursor: "pointer",
    background: "var(--md-sys-color-primary)",
    color: "var(--md-sys-color-on-primary)",
    fontWeight: 500,
    "&:hover": {
      filter: "brightness(1.05)",
    },
  },
});

const RefreshButton = styled("button", {
  base: {
    padding: "8px 14px",
    borderRadius: "var(--borderRadius-md)",
    border: "1px solid var(--md-sys-color-outline-variant)",
    cursor: "pointer",
    background: "transparent",
    color: "var(--md-sys-color-on-surface)",
  },
});

const StatRow = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    "@media (max-width: 600px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

const StatCard = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "18px",
    borderRadius: "var(--borderRadius-lg)",
    background: "var(--md-sys-color-surface-container)",
  },
});

const StatNumber = styled("div", {
  base: {
    fontSize: "1.6em",
    fontWeight: 600,
    color: "var(--md-sys-color-on-surface)",
  },
});

const StatLabel = styled("div", {
  base: {
    fontSize: "0.85em",
    color: "var(--md-sys-color-on-surface-variant)",
  },
});

const Faded = styled("span", {
  base: {
    opacity: 0.5,
    fontSize: "0.7em",
    marginLeft: "4px",
  },
});

const ProgressCard = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "16px",
    borderRadius: "var(--borderRadius-lg)",
    background: "var(--md-sys-color-surface-container)",
  },
});

const ProgressTrack = styled("div", {
  base: {
    height: "8px",
    width: "100%",
    borderRadius: "999px",
    background: "var(--md-sys-color-surface-container-highest)",
    overflow: "hidden",
  },
});

const ProgressFill = styled("div", {
  base: {
    height: "100%",
    background: "var(--md-sys-color-primary)",
    transition: "width 300ms ease",
  },
});

const MilestoneIcon = styled("img", {
  base: {
    width: "22px",
    height: "22px",
    "&[data-earned='false']": {
      filter: "grayscale(1)",
      opacity: 0.4,
    },
  },
});
