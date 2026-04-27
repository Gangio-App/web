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
      <RolesSection>
        <SectionTitle>
          <Trans>Roles</Trans>
        </SectionTitle>
        <RolesGrid onClick={openRoles}>
          <Ripple />
          <For each={visibleRoles().toReversed()}>
            {(role) => (
              <RoleChip>
                <RoleDot
                  style={{
                    background:
                      role.colour ?? "var(--md-sys-color-outline-variant)",
                  }}
                />
                <RoleName>{role.name}</RoleName>
              </RoleChip>
            )}
          </For>
        </RolesGrid>
      </RolesSection>
    </Show>
  );
}

const RolesSection = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "0 4px",
  },
});

const RolesGrid = styled("div", {
  base: {
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    cursor: "pointer",
    overflow: "hidden",
    borderRadius: "8px",
  },
});

const RoleChip = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px 4px 8px",
    borderRadius: "6px",
    background: "var(--md-sys-color-surface-container)",
    border: "1px solid color-mix(in srgb, var(--md-sys-color-outline-variant) 50%, transparent)",
    transition: "all 0.15s ease",
    "&:hover": {
      background: "var(--md-sys-color-surface-container-high)",
      borderColor: "var(--md-sys-color-outline-variant)",
    },
  },
});

const RoleDot = styled("div", {
  base: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    flexShrink: 0,
  },
});

const RoleName = styled("span", {
  base: {
    fontSize: "12px",
    fontWeight: "500",
    color: "var(--md-sys-color-on-surface)",
    whiteSpace: "nowrap",
    lineHeight: "1.3",
  },
});

const SectionTitle = styled("div", {
  base: {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    color: "var(--md-sys-color-on-surface-variant)",
    letterSpacing: "0.04em",
  },
});
