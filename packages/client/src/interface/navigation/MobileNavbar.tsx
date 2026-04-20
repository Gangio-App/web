import { createMemo, Show } from "solid-js";
import { styled } from "styled-system/jsx";
import { useClient, useUser } from "@revolt/client";
import { useNavigate, useLocation } from "@revolt/routing";
import { useModals } from "@revolt/modal";
import { Avatar, iconSize } from "@revolt/ui";

import MdPeople from "@material-design-icons/svg/outlined/people.svg?component-solid";
import MdPeopleFilled from "@material-design-icons/svg/filled/people.svg?component-solid";
import MdExplore from "@material-design-icons/svg/outlined/explore.svg?component-solid";
import MdExploreFilled from "@material-design-icons/svg/filled/explore.svg?component-solid";
import MdChat from "@material-design-icons/svg/outlined/chat.svg?component-solid";
import MdChatFilled from "@material-design-icons/svg/filled/chat.svg?component-solid";
import MdLightMode from "@material-design-icons/svg/outlined/light_mode.svg?component-solid";
import MdDarkMode from "@material-design-icons/svg/outlined/dark_mode.svg?component-solid";
import { useState } from "@revolt/state";

/**
 * Bottom navigation for mobile devices
 */
export function MobileNavbar() {
  const client = useClient();
  const user = useUser();
  const state = useState();
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal } = useModals();

  const isHome = createMemo(() => location.pathname === "/app" || location.pathname.startsWith("/channel/"));
  const isDiscover = createMemo(() => location.pathname.startsWith("/discover"));
  const isFriends = createMemo(() => location.pathname === "/friends");

  const toggleTheme = () => {
    state.theme.setMode(state.theme.mode === "light" ? "dark" : "light");
  };

  return (
    <NavbarBase>
      <NavItem onClick={() => navigate("/app")} active={isHome()}>
        {isHome() ? <MdChatFilled {...iconSize(26)} /> : <MdChat {...iconSize(26)} />}
        <NavLabel>Messages</NavLabel>
      </NavItem>

      <NavItem onClick={() => navigate("/friends")} active={isFriends()}>
        {isFriends() ? <MdPeopleFilled {...iconSize(26)} /> : <MdPeople {...iconSize(26)} />}
        <NavLabel>Friends</NavLabel>
      </NavItem>

      <NavItem onClick={() => navigate("/discover")} active={isDiscover()}>
        {isDiscover() ? <MdExploreFilled {...iconSize(26)} /> : <MdExplore {...iconSize(26)} />}
        <NavLabel>Explore</NavLabel>
      </NavItem>

      <NavItem onClick={toggleTheme}>
        {state.theme.mode === "light" ? <MdDarkMode {...iconSize(26)} /> : <MdLightMode {...iconSize(26)} />}
        <NavLabel>{state.theme.mode === "light" ? "Dark" : "Light"}</NavLabel>
      </NavItem>

      <NavItem onClick={() => openModal({ type: "settings", config: "user", context: { page: "account" } as never })}>
        <Avatar
          size={26}
          src={user()?.avatarURL}
          fallback={user()?.username}
        />
        <NavLabel>Profile</NavLabel>
      </NavItem>
    </NavbarBase>
  );
}

const NavbarBase = styled("div", {
  base: {
    display: "none",
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: "64px",
    background: "var(--md-sys-color-surface-container)",
    backdropFilter: "blur(20px)",
    borderTop: "1px solid var(--md-sys-color-outline-variant)",
    paddingBottom: "env(safe-area-inset-bottom)",
    zIndex: 50,
    alignItems: "center",
    justifyContent: "space-around",
    boxShadow: "0 -4px 12px rgba(0,0,0,0.05)",

    "@media (max-width: 768px)": {
      display: "flex",
    },
  },
});

const NavItem = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    flex: 1,
    height: "100%",
    cursor: "pointer",
    color: "var(--md-sys-color-on-surface-variant)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",

    _active: {
      transform: "scale(0.95)",
    },
  },
  variants: {
    active: {
      true: {
        color: "var(--md-sys-color-primary)",
        "& h4": {
          color: "var(--md-sys-color-primary)",
          fontWeight: 700,
        },
      },
    },
  },
});

const NavLabel = styled("h4", {
  base: {
    fontSize: "10px",
    fontWeight: 500,
    margin: 0,
    color: "inherit",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
});
