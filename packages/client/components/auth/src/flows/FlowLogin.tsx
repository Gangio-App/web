import { Match, Switch, createSignal, onCleanup, Show } from "solid-js";
import { useSearchParams } from "@solidjs/router";

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
  Checkbox,
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
  const [rememberMe, setRememberMe] = createSignal(true);
  const [searchParams] = useSearchParams();

  const steamError = () => searchParams.error === "steam_internal_error";

  /**
   * Listen for Steam login messages
   */
  const handleMessage = (event: MessageEvent) => {
    console.debug("Received message from popup:", event.data);
    if (event.data?.type === "STEAM_LOGIN_SUCCESS") {
      console.info("Steam login success, setting session:", event.data.session);
      const { session } = event.data;
      // Mark session as invalid initially so lifecycle can connect
      const createdSession = {
        ...session,
        valid: false,
      };
      state.auth.setSession(createdSession);
      lifecycle.transition({
        type: TransitionType.LoginUncached,
        session: createdSession,
      });
    }
  };

  window.addEventListener("message", handleMessage);
  onCleanup(() => window.removeEventListener("message", handleMessage));

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
   * Start Steam Login
   */
  const loginWithSteam = () => {
    const width = 600;
    const height = 800;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    window.open(
      "https://gangio.pro/api/steam/login",
      "Steam Login",
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`,
    );
  };

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
            <Show when={steamError()}>
              <Column
                style={{
                  background: "rgba(244, 67, 54, 0.1)",
                  padding: "12px",
                  "border-radius": "8px",
                  border: "1px solid rgba(244, 67, 54, 0.3)",
                  margin: "0 0 16px 0",
                }}
                gap="none"
              >
                <Text size="small" style={{ "font-weight": 600, color: "var(--md-sys-color-error)" }}>
                  <Trans>Steam Login Failed</Trans>
                </Text>
                <Text size="small" style={{ color: "var(--md-sys-color-error)" }}>
                  <Trans>An internal error occurred. Please try linking your account again in user settings if the problem persists.</Trans>
                </Text>
              </Column>
            </Show>
            <Form onSubmit={performLogin}>
              <Column gap="xs">
                <Fields fields={["email", "password"]} />
                
                <Row align justify="space-between" style={{ margin: "4px 0" }}>
                  <Checkbox
                    checked={rememberMe()}
                    onChange={(e) => setRememberMe(e.currentTarget.checked)}
                  >
                    <Trans>Remember me for 30 days</Trans>
                  </Checkbox>
                </Row>
              </Column>

              <Column gap="none" align>
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
              <Text size="small" style={{ opacity: 0.5 }}>
                <Trans>OR CONTINUE WITH</Trans>
              </Text>
              <Divider />
            </DividerContainer>

            <Row gap="lg" justify>
              <SocialButton onClick={loginWithSteam}>
                <SocialIcon src="/assets/socials/steam.svg" />
                <span><Trans>Login with Steam</Trans></span>
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
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid var(--md-sys-color-outline-variant)",
    background: "var(--md-sys-color-surface-container-low)",
    color: "var(--md-sys-color-on-surface)",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",

    _hover: {
      background: "var(--md-sys-color-surface-container-high)",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      borderColor: "var(--md-sys-color-primary)",
    },

    _active: {
      transform: "translateY(0)",
      background: "var(--md-sys-color-surface-container-highest)",
    },
  },
});

const SocialIcon = styled("img", {
  base: {
    width: "22px",
    height: "22px",
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
