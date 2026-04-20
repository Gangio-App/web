import { For, Match, Show, Switch, createEffect, createSignal } from "solid-js";

import { PublicChannelInvite } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { CONFIGURATION } from "@revolt/common";
import { iconSize, Button, Column, Header, Text, main } from "@revolt/ui";
import MdExplore from "@material-design-icons/svg/filled/explore.svg?component-solid";
import { BiRegularCheckCircle, BiSolidCheckCircle } from "solid-icons/bi";

import { useClient } from "@revolt/client";
import { useModals } from "@revolt/modal";
import { useLocation, useNavigate } from "@revolt/routing";

export function Discover() {
  const client = useClient();
  const navigate = useNavigate();
  const { openModal } = useModals();
  const location = useLocation();
  const { i18n } = useLingui();

  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal<DiscoverServer[]>([]);
  const [botResults, setBotResults] = createSignal<DiscoverBot[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | undefined>();
  const [page, setPage] = createSignal(1);
  const [total, setTotal] = createSignal<number | undefined>();

  const limit = 25;
  const hasMore = () =>
    typeof total() === "number" && results().length < (total() as number);

  const botsHasMore = () =>
    typeof total() === "number" && botResults().length < (total() as number);

  // Redirect /discover -> /discover/servers to match existing layout defaults
  createEffect(() => {
    if (location.pathname === "/discover") {
      navigate("/discover/servers", { replace: true });
    }
  });

  async function fetchBots(nextPage = 1, append = false) {
    setLoading(true);
    setError(undefined);

    try {
      const data = (await client().api.get("/discover/bots", {
        query: query().trim() || undefined,
        page: nextPage,
        limit,
      })) as {
        bots: DiscoverBot[];
        page?: number;
        limit?: number;
        total?: number;
      };

      const bots = Array.isArray(data?.bots) ? data.bots : [];
      setBotResults((prev) => (append ? [...prev, ...bots] : bots));
      setPage(typeof data?.page === "number" ? data.page : nextPage);
      setTotal(typeof data?.total === "number" ? data.total : undefined);
    } catch (e) {
      setError(String(e));
      setBotResults([]);
      setTotal(undefined);
    } finally {
      setLoading(false);
    }
  }

  async function fetchServers(nextPage = 1, append = false) {
    setLoading(true);
    setError(undefined);

    try {
      // Backend contract (to be implemented server-side):
      // GET /discover/servers?query=string
      // -> { servers: Array<{ name, description?, iconUrl?, memberCount?, inviteCode }> }
      const data = (await client().api.get("/discover/servers", {
        query: query().trim() || undefined,
        page: nextPage,
        limit,
      })) as {
        servers: DiscoverServer[];
        page?: number;
        limit?: number;
        total?: number;
      };

      const servers = Array.isArray(data?.servers) ? data.servers : [];
      setResults((prev) => (append ? [...prev, ...servers] : servers));
      setPage(typeof data?.page === "number" ? data.page : nextPage);
      setTotal(typeof data?.total === "number" ? data.total : undefined);
    } catch (e) {
      setError(String(e));
      setResults([]);
      setTotal(undefined);
    } finally {
      setLoading(false);
    }
  }

  createEffect(() => {
    if (location.pathname === "/discover/servers" && results().length === 0) {
      fetchServers(1, false);
    }
  });

  createEffect(() => {
    if (location.pathname === "/discover/bots" && botResults().length === 0) {
      fetchBots(1, false);
    }
  });

  function mediaUrl(kind: "icons" | "banners" | "avatars", id?: string) {
    if (!id) return undefined;
    return `${CONFIGURATION.DEFAULT_MEDIA_URL}/${kind}/${id}`;
  }

  async function joinByInvite(inviteCode: string) {
    const invite = await client()
      .api.get(`/invites/${inviteCode as ""}`)
      .then((data) => PublicChannelInvite.from(client(), data));

    openModal({
      type: "invite",
      invite,
    });
  }

  return (
    <Base>
      <Header placement="primary">
        <HeaderIcon>
          <MdExplore {...iconSize(22)} />
        </HeaderIcon>
        <Trans>Discover</Trans>
      </Header>

      <div
        use:scrollable={{
          class: content(),
        }}
      >
        <Column gap="lg" class={css({ width: "min(1100px, 100%)" })}>
          <Row class={css({ gap: "8px" })}>
            <Button
              variant={
                location.pathname === "/discover/servers" ? "filled" : "tonal"
              }
              onPress={() => navigate("/discover/servers")}
            >
              <Trans>Servers</Trans>
            </Button>
            <Button
              variant={
                location.pathname === "/discover/bots" ? "filled" : "tonal"
              }
              onPress={() => navigate("/discover/bots")}
            >
              <Trans>Bots</Trans>
            </Button>
          </Row>

          <Switch>
            <Match when={location.pathname === "/discover/bots"}>
              <Column gap="sm">
                <Text class="headline" size="large">
                  <Trans>Find bots</Trans>
                </Text>
              </Column>
            </Match>
            <Match when={location.pathname === "/discover/servers"}>
              <Column gap="sm">
                <Text class="headline" size="large">
                  <Trans>Find servers</Trans>
                </Text>
              </Column>
            </Match>
          </Switch>

          <Row>
            <input
              class={searchInput()}
              value={query()}
              placeholder={
                location.pathname === "/discover/bots"
                  ? i18n()._("Search bots")
                  : i18n()._("Search servers")
              }
              onInput={(e) => setQuery(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (location.pathname === "/discover/bots") {
                    fetchBots(1, false);
                  } else {
                    fetchServers(1, false);
                  }
                }
              }}
            />
            <Button
              onPress={() =>
                location.pathname === "/discover/bots"
                  ? fetchBots(1, false)
                  : fetchServers(1, false)
              }
              isDisabled={loading()}
            >
              <Trans>Search</Trans>
            </Button>
          </Row>

          <Show when={error()}>
            <Text class="label" size="small">
              {error()}
            </Text>
          </Show>

          <Show when={loading()}>
            <Text class="label" size="small">
              <Trans>Loading…</Trans>
            </Text>
          </Show>

          <Switch>
            <Match when={location.pathname === "/discover/bots"}>
              <CardsGrid>
                <For each={botResults()}>
                  {(bot) => (
                    <Card>
                      <CardBody>
                        <CardHeader>
                          <CardIconWrap>
                            <Show when={bot.avatar} fallback={<CardIconFallback />}>
                              <CardIcon
                                alt=""
                                src={mediaUrl("avatars", bot.avatar)}
                                loading="lazy"
                              />
                            </Show>
                          </CardIconWrap>

                          <Column gap="none" class={css({ minWidth: 0 })}>
                            <Text class="title" size="medium">
                              {bot.username}
                            </Text>
                          </Column>
                        </CardHeader>

                        <Show when={bot.description}>
                          <Text
                            class="label"
                            size="small"
                            classList={{ [clamp2Lines()]: true }}
                          >
                            {bot.description}
                          </Text>
                        </Show>

                        <CardActions>
                          <Button
                            variant="tonal"
                            onPress={() => navigate(`/bot/${bot.id}`)}
                          >
                            <Trans>View</Trans>
                          </Button>
                        </CardActions>
                      </CardBody>
                    </Card>
                  )}
                </For>
              </CardsGrid>
            </Match>
            <Match when={location.pathname === "/discover/servers"}>
              <CardsGrid>
                <For each={results()}>
                  {(server) => (
                    <Card>
                      <CardBanner
                        style={{
                          "background-image": server.banner
                            ? `url(${mediaUrl("banners", server.banner)})`
                            : undefined,
                        }}
                      />

                      <CardBody>
                        <CardHeader>
                          <ServerBadge flags={server.flags} />
                          <CardIconWrap>
                            <Show
                              when={server.icon}
                              fallback={<CardIconFallback />}
                            >
                              <CardIcon
                                alt=""
                                src={mediaUrl("icons", server.icon)}
                                loading="lazy"
                              />
                            </Show>
                          </CardIconWrap>

                          <Column gap="none" class={css({ minWidth: 0 })}>
                            <Text class="title" size="medium">
                              {server.name}
                            </Text>
                            <Show when={typeof server.memberCount === "number"}>
                              <Text class="label" size="small">
                                <Trans>Members:</Trans> {server.memberCount}
                              </Text>
                            </Show>
                          </Column>
                        </CardHeader>

                        <Show when={server.description}>
                          <Text
                            class="label"
                            size="small"
                            classList={{ [clamp2Lines()]: true }}
                          >
                            {server.description}
                          </Text>
                        </Show>

                        <CardActions>
                          <Button
                            variant="tonal"
                            isDisabled={!server.inviteCode}
                            onPress={() =>
                              server.inviteCode
                                ? joinByInvite(server.inviteCode)
                                : undefined
                            }
                          >
                            <Trans>Join</Trans>
                          </Button>
                        </CardActions>
                      </CardBody>
                    </Card>
                  )}
                </For>
              </CardsGrid>
            </Match>
          </Switch>

          <Show
            when={
              !loading() &&
              (location.pathname === "/discover/bots"
                ? botResults().length === 0
                : results().length === 0)
            }
          >
            <Text class="label" size="small">
              <Switch>
                <Match when={location.pathname === "/discover/bots"}>
                  <Trans>No bots found.</Trans>
                </Match>
                <Match when={location.pathname !== "/discover/bots"}>
                  <Trans>No servers found.</Trans>
                </Match>
              </Switch>
            </Text>
          </Show>

          <Show
            when={
              !loading() &&
              (location.pathname === "/discover/bots" ? botsHasMore() : hasMore())
            }
          >
            <Row class={css({ justifyContent: "center" })}>
              <Button
                variant="tonal"
                onPress={() =>
                  location.pathname === "/discover/bots"
                    ? fetchBots(page() + 1, true)
                    : fetchServers(page() + 1, true)
                }
              >
                <Trans>Load more</Trans>
              </Button>
            </Row>
          </Show>
        </Column>
      </div>
    </Base>
  );
}

type DiscoverServer = {
  name: string;
  description?: string;
  memberCount?: number;
  icon?: string;
  banner?: string;
  flags?: number;
  inviteCode?: string;
};

type DiscoverBot = {
  id: string;
  username: string;
  description?: string;
  avatar?: string;
  flags?: number;
  public?: boolean;
};

const Base = styled("div", {
  base: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    color: "var(--md-sys-color-on-surface)",
  },
});

const content = () =>
  css({
    ...main.raw(),
    padding: "48px 0",
    gap: "24px",
    alignItems: "center",
    justifyContent: "flex-start",
  });

const HeaderIcon = styled("div", {
  base: {
    display: "grid",
    placeItems: "center",
  },
});

const Row = styled("div", {
  base: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
});

const searchInput = () =>
  css({
    flexGrow: 1,
    minWidth: 0,
    height: "40px",
    padding: "0 12px",
    borderRadius: "var(--borderRadius-md)",
    border: "1px solid var(--md-sys-color-outline)",
    background: "var(--md-sys-color-surface)",
    color: "var(--md-sys-color-on-surface)",
    outline: "none",
  });

const CardsGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "16px",
    width: "100%",
  },
});

const Card = styled("div", {
  base: {
    overflow: "hidden",
    borderRadius: "var(--borderRadius-lg)",
    background: "var(--md-sys-color-surface-variant)",
    color: "var(--md-sys-color-on-surface)",
    border: "1px solid var(--md-sys-color-outline-variant)",
  },
});

const CardBanner = styled("div", {
  base: {
    height: "120px",
    width: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "var(--md-sys-color-surface)",
  },
});

const CardBody = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "12px",
  },
});

const CardHeader = styled("div", {
  base: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    minWidth: 0,
  },
});

const CardActions = styled("div", {
  base: {
    display: "flex",
    justifyContent: "flex-end",
  },
});

const CardIconWrap = styled("div", {
  base: {
    width: "44px",
    height: "44px",
    borderRadius: "999px",
    overflow: "hidden",
    flex: "0 0 auto",
    background: "var(--md-sys-color-surface)",
    display: "grid",
    placeItems: "center",
    border: "1px solid var(--md-sys-color-outline-variant)",
  },
});

const CardIcon = styled("img", {
  base: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});

const CardIconFallback = styled("div", {
  base: {
    width: "100%",
    height: "100%",
    background: "var(--md-sys-color-surface-variant)",
  },
});

const clamp2Lines = () =>
  css({
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  });

function ServerBadge(props: { flags?: number }) {
  const { i18n } = useLingui();
  const tooltip = () =>
    props.flags === 1
      ? i18n()._("Official Server")
      : props.flags
        ? i18n()._("Verified")
        : undefined;

  return (
    <Show when={props.flags}>
      <span title={tooltip()} class={badgeWrap()}>
        {props.flags === 1 ? (
          <BiSolidCheckCircle size={12} />
        ) : (
          <BiRegularCheckCircle size={12} />
        )}
      </span>
    </Show>
  );
}

const badgeWrap = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--md-sys-color-primary)",
    flex: "0 0 auto",
  });
