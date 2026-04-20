import { Show } from "solid-js";

import { ServerMember, User } from "stoat.js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { Avatar, Ripple, UserStatus, typography } from "../../design";
import { Row } from "../../layout";

export function ProfileBanner(props: {
  user: User;
  member?: ServerMember;
  bannerUrl?: string;
  onClick?: (e: MouseEvent) => void;
  onClickAvatar?: (e: MouseEvent) => void;
  width: 2 | 3;
}) {
  return (
    <Banner
      style={{
        "background-image": `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.6)), url('${props.bannerUrl}')`,
      }}
      isLink={typeof props.onClick !== "undefined"}
      onClick={props.onClick}
      width={props.width}
    >
      <Show when={typeof props.onClick !== "undefined"}>
        <Ripple />
      </Show>

      <Row align gap="xl" class={css({ padding: "var(--gap-md)", borderRadius: "var(--borderRadius-lg)", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)", width: "100%" })}>
        <Avatar
          src={props.user.animatedAvatarURL}
          size={56}
          holepunch="bottom-right"
          onClick={props.onClickAvatar}
          interactive={props.user.avatar && !!props.onClickAvatar}
          overlay={<UserStatus.Graphic status={props.user.presence} />}
        />
        <UserShort>
          <Show
            when={
              (props.member?.displayName ?? props.user.displayName) !==
              props.user.username
            }
          >
            <span class={css({ fontWeight: 700, fontSize: "1.1em", textShadow: "0 2px 4px rgba(0,0,0,0.5)" })}>
              {props.member?.displayName ?? props.user.displayName}
            </span>
          </Show>
          <span class={css({ opacity: 0.9, fontSize: "0.9em" })}>
            {props.user.username}
            <span class={css({ fontWeight: 300, opacity: 0.7 })}>
              #{props.user.discriminator}
            </span>
          </span>
        </UserShort>
      </Row>
    </Banner>
  );
}

const Banner = styled("div", {
  base: {
    // for <Ripple />:
    position: "relative",

    userSelect: "none",

    height: "160px",
    padding: "var(--gap-md)",

    display: "flex",
    flexDirection: "column",
    justifyContent: "end",

    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundColor: "var(--md-sys-color-surface-container-high)",

    borderRadius: "var(--borderRadius-xl)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "inset 0 0 20px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.2)",
    overflow: "hidden",

    color: "white",
    transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  variants: {
    width: {
      3: {
        gridColumn: "span 3",
      },
      2: {
        gridColumn: "span 2",
      },
    },
    isLink: {
      true: {
        cursor: "pointer",
        _hover: {
          transform: "scale(1.01)",
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.3)",
        },
        _active: {
          transform: "scale(0.995)",
        },
      },
    },
  },
});

const UserShort = styled("div", {
  base: {
    ...typography.raw(),

    display: "flex",
    lineHeight: "1.2em",
    gap: "var(--gap-xxs)",
    flexDirection: "column",
  },
});
