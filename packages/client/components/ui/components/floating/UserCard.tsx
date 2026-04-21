import { JSX, Show, createSignal, createMemo } from "solid-js";
import { userInformation } from "@revolt/markdown/users";
import { useQuery } from "@tanstack/solid-query";
import { cva } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useModals } from "@revolt/modal";
import { UserContextMenu } from "@revolt/app";

import { Profile } from "../features";
import { Avatar, UserStatus, Text, IconButton } from "../design";
import { Column, Row } from "../layout";
import { Symbol as IconSymbol } from "../utils/Symbol";

import MdSend from "@material-design-icons/svg/filled/send.svg?component-solid";
import MdMoreVert from "@material-design-icons/svg/filled/more_vert.svg?component-solid";
import MdEdit from "@material-design-icons/svg/filled/edit.svg?component-solid";
import MdPersonAdd from "@material-design-icons/svg/filled/person_add.svg?component-solid";
import MdHowToReg from "@material-design-icons/svg/filled/how_to_reg.svg?component-solid";
import MdPersonRemove from "@material-design-icons/svg/filled/person_remove.svg?component-solid";

const NameText = styled("div", {
  base: {
    fontWeight: "900", // Extra bold
    fontSize: "22px",
    lineHeight: "1.1",
    letterSpacing: "-0.02em",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
});

const ServerTag = styled("div", {
    base: {
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "4px",
        padding: "2px 6px",
        fontSize: "10px",
        fontWeight: "800",
        textTransform: "uppercase",
        color: "white",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        letterSpacing: "0.05em",
    }
});

const ThinkingCircle = styled("div", {
    base: {
        position: "absolute",
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(12px)",
        borderRadius: "100%",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.1)",
    }
});

const StatusBubble = styled("div", {
  base: {
    padding: "6px 12px",
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(16px)",
    borderRadius: "18px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#fff",
    maxWidth: "140px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.1)",
    position: "relative",
    zIndex: 20,
    textAlign: "center",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "help",

    "&:hover": {
        maxWidth: "240px",
        whiteSpace: "normal",
        overflow: "visible",
        zIndex: 50,
        background: "rgba(255, 255, 255, 0.25)",
        transform: "scale(1.05) translateY(-2px)",
    }
  }
});

const UsernameText = styled("div", {
  base: {
    opacity: 0.5,
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--md-sys-color-on-surface-variant)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
        textDecoration: "underline",
        opacity: 1,
        color: "var(--md-sys-color-primary)",
    }
  },
});

/**
 * Base element for the card
 */
const base = cva({
  base: {
    color: "var(--md-sys-color-on-surface)",
    background: "var(--md-sys-color-surface-container-low)",
    boxShadow: "0 8px 32px var(--md-sys-color-shadow)",

    width: "300px",
    maxHeight: "680px",
    height: "auto",
    minHeight: "fit-content",

    borderRadius: "24px", // More premium rounded corners
    overflowY: "auto",
    overflowX: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
  },
});

/**
 * User Card
 */
export function UserCard(
  props: JSX.Directives["floating"]["userCard"] &
    object & { onClose: () => void },
) {
  const { openModal } = useModals();
  const [message, setMessage] = createSignal("");
  
  const info = createMemo(() => userInformation(props.user, props.member));

  const query = useQuery(() => ({
    queryKey: ["profile", props.user.id],
    queryFn: () => props.user.fetchProfile(),
  }));

  function openFull() {
    openModal({ type: "user_profile", user: props.user });
    props.onClose();
  }

  function sendMessage(e?: Event) {
    e?.preventDefault();
    if (!message().trim()) return;
    props.user.openDM().then(channel => {
        channel.sendMessage({ content: message() });
        setMessage("");
    });
  }

  function openEdit() {
    if (props.member) {
      openModal({ type: "server_identity", member: props.member });
    } else {
      openModal({ type: "settings", config: "user" });
    }
    props.onClose();
  }

  return (
    <div
      use:invisibleScrollable={{ class: base() }}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        // Only prevent default if it's not a focusable element to fix input issues
        if (!target.closest("input, textarea, [contenteditable=true]")) {
          e.preventDefault();
        }
        e.stopImmediatePropagation();
      }}
    >
      <BannerWrapper>
        <Banner 
          style={{ "background-image": `url(${query.data?.animatedBannerURL ?? ""})` }}
          onClick={openFull}
        />
        <BannerActions>
            <Show when={props.user.self}>
              <BannerIconButton size="small" onPress={openEdit} title="Edit Profile">
                 <MdEdit />
              </BannerIconButton>
            </Show>

            <Show when={!props.user.self && !props.user.bot}>
               <Show when={props.user.relationship === "None"}>
                  <BannerIconButton size="small" onPress={() => props.user.addFriend()} title="Add Friend">
                     <MdPersonAdd />
                  </BannerIconButton>
               </Show>
               <Show when={props.user.relationship === "Incoming"}>
                  <BannerIconButton size="small" onPress={() => props.user.addFriend()} title="Accept Friend Request">
                     <MdHowToReg />
                  </BannerIconButton>
               </Show>
               <Show when={props.user.relationship === "Outgoing"}>
                  <BannerIconButton size="small" onPress={() => props.user.removeFriend()} title="Cancel Friend Request" color="var(--md-sys-color-error)">
                     <MdPersonRemove />
                  </BannerIconButton>
               </Show>
            </Show>

            <BannerIconButton
              size="small"
              use:floating={{
                contextMenu: () => (
                  <UserContextMenu user={props.user} member={props.member} />
                ),
                contextMenuHandler: "click",
              }}
            >
              <MdMoreVert />
            </BannerIconButton>
        </BannerActions>
      </BannerWrapper>
      
      <HeaderSection>
        <AvatarWrapper 
          onMouseDown={(e: MouseEvent) => {
             e.stopPropagation();
          }}
        >
          <Avatar
            src={props.user.animatedAvatarURL}
            size={80}
            holepunch="bottom-right"
            interactive
            overlay={<UserStatus.Graphic status={props.user.presence} />}
          />
        </AvatarWrapper>
        
        <Show when={props.user.status?.text}>
            <div style={{ 
                position: "absolute", 
                top: "-42px", 
                left: "90px", 
                display: "flex", 
                "flex-direction": "column",
                "align-items": "center"
            }}>
                <StatusBubble>
                    {props.user.status?.text}
                </StatusBubble>
                <div style={{ position: "relative", width: "100%", height: "12px" }}>
                    <ThinkingCircle style={{ width: "8px", height: "8px", bottom: "-4px", left: "10px" }} />
                    <ThinkingCircle style={{ width: "4px", height: "4px", bottom: "-12px", left: "4px" }} />
                </div>
            </div>
        </Show>
        
        <BadgesContainer>
            <Profile.Badges user={props.user} compact />
        </BadgesContainer>
      </HeaderSection>

      <ContentArea>
        <Column gap="sm">
            <Column gap="none" style={{ padding: "0 4px" }}>
              <NameText style={{ color: info().colour ?? "var(--md-sys-color-on-surface)" }}>
                {info().username}
              </NameText>
              <UsernameText onClick={openFull}>
                @{props.user.username}
              </UsernameText>
            </Column>

            <Divider />

            <Show when={query.data?.content}>
                <SectionTitle>Bio</SectionTitle>
                <BioSection>{query.data?.content}</BioSection>
            </Show>

            <Profile.Activity userId={props.user.id} />

            <Profile.Roles member={props.member} />
        </Column>
      </ContentArea>

      <Show when={!props.user.self && !props.user.bot}>
          <MessageInputArea>
             <form onSubmit={(e: Event) => sendMessage(e)} style={{ display: "flex", width: "100%", gap: "8px" }}>
                <StyledInput 
                    placeholder={`Message @${props.user.username}`} 
                    value={message()}
                    onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => setMessage(e.currentTarget.value)}
                />
                <IconButton onPress={sendMessage} size="small" disabled={!message().trim()}>
                    <MdSend />
                </IconButton>
             </form>
          </MessageInputArea>
      </Show>
    </div>
  );
}

const BannerWrapper = styled("div", {
  base: {
     position: "relative",
     width: "100%",
  }
});

const Banner = styled("div", {
  base: {
    height: "105px",
    width: "100%",
    backgroundColor: "var(--md-sys-color-primary)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    cursor: "pointer",
  },
});

const BannerActions = styled("div", {
  base: {
    position: "absolute",
    top: "8px",
    right: "8px",
    display: "flex",
    gap: "4px",
  },
});

const BannerIconButton = styled(IconButton, {
    base: {
        background: "rgba(0,0,0,0.55) !important",
        backdropFilter: "blur(12px)",
        borderRadius: "100% !important",
        color: "white !important",
        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        transition: "all 0.15s ease",
        "&:hover": {
            background: "rgba(0,0,0,0.75) !important",
            transform: "translateY(-1px)",
        },
        "&:active": {
            transform: "translateY(1px)",
        }
    }
});

const HeaderSection = styled("div", {
  base: {
    position: "relative",
    height: "44px",
    padding: "0 16px",
  },
});

const AvatarWrapper = styled("div", {
  base: {
    position: "absolute",
    top: "-42px",
    left: "14px",
    border: "6px solid var(--md-sys-color-surface-container-low)",
    borderRadius: "100%",
    background: "var(--md-sys-color-surface-container-low)",
  },
});

const BadgesContainer = styled("div", {
  base: {
    position: "absolute",
    top: "8px",
    right: "12px",
  },
});

const ContentArea = styled("div", {
  base: {
    padding: "0 16px 16px 16px", // Reduced top padding since Badges/Avatar handle overlap
    overflowY: "auto",
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

const Divider = styled("div", {
  base: {
    height: "1px",
    background: "var(--md-sys-color-outline-variant)",
    opacity: 0.2,
    margin: "4px 0",
  },
});

const BioSection = styled("div", {
  base: {
    fontSize: "14px",
    lineHeight: "1.4",
    opacity: 0.9,
  },
});

const StatusText = styled("div", {
  base: {
    fontSize: "13px",
    opacity: 0.8,
  },
});

const MessageInputArea = styled("div", {
  base: {
    padding: "12px 16px",
    borderTop: "1px solid var(--md-sys-color-outline-variant)",
    background: "var(--md-sys-color-surface-container-low)",
    position: "sticky",
    bottom: 0,
  },
});

const StyledInput = styled("input", {
  base: {
    flexGrow: 1,
    background: "var(--md-sys-color-surface-container-high)",
    border: "none",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "var(--md-sys-color-on-surface)",
    fontSize: "14px",
    outline: "none",
    "&::placeholder": {
      color: "var(--md-sys-color-on-surface-variant)",
      opacity: 0.5,
    },
  },
});
