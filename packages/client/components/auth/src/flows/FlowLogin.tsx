import { Match, Show, Switch, createSignal, onMount, onCleanup } from "solid-js";

import { Trans } from "@lingui-solid/solid/macro";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClientLifecycle } from "@revolt/client";
import { State, TransitionType } from "@revolt/client/Controller";
import { useModals } from "@revolt/modal";
import { Navigate } from "@revolt/routing";
import {
  Button,
  CircularProgress,
  Column,
  Row,
  Text,
  iconSize,
} from "@revolt/ui";

import MdArrowBack from "@material-design-icons/svg/filled/arrow_back.svg?component-solid";

import { useState } from "@revolt/state";
import { FlowTitle } from "./Flow";
import { Fields, Form } from "./Form";

/**
 * Flow for logging into an account
 */
export default function FlowLogin() {
  const state = useState();
  const modals = useModals();
  const { lifecycle, isLoggedIn, login, selectUsername } = useClientLifecycle();

  onMount(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: verify origin if needed, but for now we check the data structure
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "steam-login") {
        const { token, userId } = event.data;
        const session = {
          _id: "steam-session",
          token,
          userId,
          valid: false,
        };
        state.auth.setSession(session);
        lifecycle.transition({
          type: TransitionType.LoginUncached,
          session,
        });
      } else if (event.data?.type === "steam-login-error") {
        // Handle error sent from popup
        const params = new URLSearchParams(window.location.search);
        params.set("error", event.data.error);
        window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
        // Manually trigger error display (re-run onMount logic of SteamError if possible, 
        // or just rely on state if we shared it)
        window.location.reload(); // Simplest way to re-trigger SteamError logic
      }
    };
    window.addEventListener("message", handleMessage);
    onCleanup(() => window.removeEventListener("message", handleMessage));
  });

  /**
   * Log into account
   * @param data Form Data
   */
  async function performLogin(data: FormData) {
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    await login(
      {
        email,
        password,
      },
      modals,
    );
  }

  /**
   * Select a new username
   * @param data Form Data
   */
  async function select(data: FormData) {
    const username = data.get("username") as string;
    await selectUsername(username);
  }

  return (
    <>
      <Switch
        fallback={
          <>
            <FlowTitle subtitle={<Trans>Sign into Gangio</Trans>} emoji="wave">
              <Trans>Welcome!</Trans>
            </FlowTitle>
            <Form onSubmit={performLogin}>
              <Fields fields={["email", "password"]} />
              <Column gap="md" align>
                <a href="/login/reset">
                  <Button variant="text" size="small">
                    <Trans>Reset password</Trans>
                  </Button>
                </a>
                <a href="/login/resend">
                  <Button variant="text" size="small">
                    <Trans>Resend verification</Trans>
                  </Button>
                </a>
              </Column>
              <Row align justify>
                <a href="..">
                  <Button variant="text">
                    <MdArrowBack {...iconSize("1.2em")} /> <Trans>Back</Trans>
                  </Button>
                </a>
                <LoginButton type="submit">
                  <Trans>Login</Trans>
                </LoginButton>
              </Row>
            </Form>

            <DividerContainer>
              <Divider />
              <span class={css({ fontSize: "12px", opacity: 0.5, whiteSpace: "nowrap" })}>
                <Trans>OR CONTINUE WITH</Trans>
              </span>
              <Divider />
            </DividerContainer>

            <SteamError />

            <Row gap="lg" justify>
              <SocialButton onClick={() => {
                const apiUrl = import.meta.env.VITE_API_URL || "https://gangio.pro/api";
                window.open(`${apiUrl}/steam/login`, "Steam Login", "width=600,height=800");
              }}>
                <SocialIcon src="/assets/socials/steam.svg" />
                <Trans>Steam</Trans>
              </SocialButton>
              <SocialButton onClick={() => alert("Google login coming soon!")}>
                <SocialIcon src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" />
                <Trans>Google</Trans>
              </SocialButton>
            </Row>
          </>
        }
      >
        <Match when={isLoggedIn()}>
          <Navigate href={state.layout.popNextPath() ?? "/app"} />
        </Match>
        <Match when={lifecycle.state() === State.LoggingIn}>
          <CenteredProgress>
            <CircularProgress />
          </CenteredProgress>
        </Match>
        <Match when={lifecycle.state() === State.Onboarding}>
          <FlowTitle>
            <Trans>Choose a username</Trans>
          </FlowTitle>

          <Text>
            <Trans>
              Pick a username that you want people to be able to find you by.
              This can be changed later in your user settings.
            </Trans>
          </Text>

          <Form onSubmit={select}>
            <Fields fields={["username"]} />
            <Row align justify>
              <Button
                variant="text"
                onPress={() =>
                  lifecycle.transition({
                    type: TransitionType.Cancel,
                  })
                }
              >
                <MdArrowBack {...iconSize("1.2em")} /> <Trans>Cancel</Trans>
              </Button>
              <Button type="submit">
                <Trans>Confirm</Trans>
              </Button>
            </Row>
          </Form>
        </Match>
      </Switch>
    </>
  );
}

const DividerContainer = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    margin: "24px 0",
    width: "100%",
  },
});

const Divider = styled("div", {
  base: {
    flex: 1,
    height: "1px",
    background: "var(--md-sys-color-outline-variant)",
    opacity: 0.5,
  },
});

const SocialButton = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    flex: 1,
    padding: "10px 16px",
    borderRadius: "12px",
    border: "1px solid var(--md-sys-color-outline-variant)",
    background: "var(--md-sys-color-surface-container-low)",
    color: "var(--md-sys-color-on-surface)",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",

    _hover: {
      background: "var(--md-sys-color-surface-container-high)",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },

    _active: {
      transform: "translateY(0)",
      background: "var(--md-sys-color-surface-container-highest)",
    },
  },
});

const SocialIcon = styled("img", {
  base: {
    width: "20px",
    height: "20px",
    objectFit: "contain",
  },
});

const LoginButton = styled(Button, {
  base: {
    padding: "10px 24px",
    borderRadius: "12px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",

    _hover: {
      transform: "scale(1.02)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },

    _active: {
      transform: "scale(0.98)",
    },
  },
});

const CenteredProgress = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  },
});

/**
 * Reads ?error= from URL and shows a friendly message
 */
function SteamError() {
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null);

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (!error) return;
    switch (error) {
      case "steam_not_linked":
        setErrorMsg("Your Steam account is not linked to any Gangio account. Please log in with email first and link Steam in Settings → Integrations.");
        break;
      case "steam_verify_failed":
        setErrorMsg("Steam verification failed. Please try again.");
        break;
      case "steam_user_not_found":
        setErrorMsg("No Gangio account found for this Steam account.");
        break;
      case "steam_internal_error":
        setErrorMsg("An error occurred during Steam login. Please try again.");
        break;
      default:
        setErrorMsg("An error occurred. Please try again.");
    }
    // Clean up the URL so the error doesn't persist on refresh
    window.history.replaceState({}, "", "/login/auth");
  });

  return (
    <Show when={errorMsg()}>
      <div class={css({
        background: "var(--md-sys-color-error-container, rgba(255,68,68,0.1))",
        color: "var(--md-sys-color-on-error-container, #ff4444)",
        padding: "12px 16px",
        borderRadius: "12px",
        fontSize: "13px",
        lineHeight: 1.5,
        border: "1px solid rgba(255,68,68,0.2)",
      })}>
        {errorMsg()}
      </div>
    </Show>
  );
}
