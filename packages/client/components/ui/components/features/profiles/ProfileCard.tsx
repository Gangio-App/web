import { styled } from "styled-system/jsx";

export const ProfileCard = styled("div", {
  base: {
    // for <Ripple />:
    position: "relative",

    minWidth: 0,
    width: "100%",
    userSelect: "none",

    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container)",
    border: "1px solid var(--md-sys-color-outline-variant)",

    padding: "var(--gap-lg)",
    borderRadius: "var(--borderRadius-lg)",

    display: "flex",
    gap: "var(--gap-sm)",
    flexDirection: "column",
    transition: "transform 0.15s ease-out, background-color 0.15s ease-out, border-color 0.15s ease-out",

    _hover: {
      background: "var(--md-sys-color-surface-container)",
      borderColor: "var(--md-sys-color-outline)",
    },
  },
  variants: {
    width: {
      1: {
        gridColumn: "span 1",
      },
      2: {
        gridColumn: "span 2",
      },
      3: {
        gridColumn: "span 3",
      },
    },
    constraint: {
      half: {
        // removed overflow hidden and aspect ratio to let content grow
      },
    },
    isLink: {
      true: {
        cursor: "pointer",
        _active: {
          transform: "scale(0.985)",
        },
      },
    },
  },
  defaultVariants: {
    width: 1,
  },
});
