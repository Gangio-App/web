import { For, Show, createMemo } from "solid-js";

import { Trans } from "@lingui-solid/solid/macro";
import { ServerMember } from "stoat.js";
import { styled } from "styled-system/jsx";

import { useModals } from "@revolt/modal";

import { Ripple, typography } from "../../design";
import { dismissFloatingElements } from "../../floating";
import { Row, Column } from "../../layout";

export function ProfileRoles(props: { member?: ServerMember }) {
  const { openModal } = useModals();

  const visibleRoles = createMemo(() =>
    props.member
      ? props.member.orderedRoles.filter((r) =>
          props.member?.server ? props.member.server.roles.has(r.id) : true,
        )
      : [],
  );

  function openRoles() {
    openModal({ type: "user_profile_roles", member: props.member! });
    dismissFloatingElements();
  }

  return (
    <Show when={visibleRoles().length}>
      <RolesWrapper onClick={openRoles}>
        <Ripple />
        <SectionTitle>
          <Trans>Roles</Trans>
        </SectionTitle>
        <Column gap="xs">
          <For each={visibleRoles().toReversed()}>
            {(role) => (
              <Row align>
                <Role>{role.name}</Role>
                <RoleIcon
                  style={{
                    background:
                      role.colour ?? "var(--md-sys-color-outline-variant)",
                  }}
                />
              </Row>
            )}
          </For>
        </Column>
      </RolesWrapper>
    </Show>
  );
}

const RolesWrapper = styled("div", {
  base: {
    position: "relative",
    cursor: "pointer",
    padding: "0 4px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    "&:hover": {
        opacity: 0.8,
    }
  }
});

const Role = styled("span", {
  base: {
    flexGrow: 1,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    fontSize: "12px",
    opacity: 0.8,
  },
});

const RoleIcon = styled("div", {
  base: {
    width: "8px",
    height: "8px",
    aspectRatio: "1/1",
    borderRadius: "100%",
  },
});

const SectionTitle = styled("div", {
  base: {
    fontSize: "10px",
    fontWeight: "800",
    textTransform: "uppercase",
    color: "var(--md-sys-color-on-surface-variant)",
    opacity: 0.8,
    marginBottom: "4px",
    letterSpacing: "0.03em",
  },
});
