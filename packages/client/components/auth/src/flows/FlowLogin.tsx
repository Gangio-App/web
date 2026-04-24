import { For, Match, Show, Switch, createEffect, createSignal, onCleanup, onMount } from "solid-js";

import { Trans } from "@lingui-solid/solid/macro";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClientLifecycle } from "@revolt/client";
import { State, TransitionType } from "@revolt/client/Controller";
import { useModals } from "@revolt/modal";
import { Navigate } from "@revolt/routing";
import {
  Button,
  CategoryButton,
  CircularProgress,
  Column,
  Form2,
  Row,
  Text,
  iconSize,
} from "@revolt/ui";

import {
  BiRegularArchive,
  BiSolidKey,
  BiSolidKeyboard,
} from "solid-icons/bi";

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

  const [mfaMethod, setMfaMethod] = createSignal<string>();

  onMount(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "steam_token") {
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
      true, // skipModal
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
                const width = 600;
                const height = 800;
                const left = (window.innerWidth - width) / 2;
                const top = (window.innerHeight - height) / 2;
                window.open(`${apiUrl}/steam/login`, "Steam Login", `width=${width},height=${height},top=${top},left=${left}`);
              }}>
                <SocialIcon src="/assets/socials/steam.svg" />
                <Trans>Steam</Trans>
              </SocialButton>
              <SocialButton onClick={() => alert("Google login coming soon!")}>
                <SocialIcon src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" />
                <Trans>Google</Trans>
              </SocialButton>
            </Row>

            <Column gap="sm" class={css({ marginTop: "24px", opacity: 0.8 })}>
              <Text size="small" class={css({ textAlign: "center" })}>
                <Trans>New to Gangio? We optionally recommend enabling 2FA after your first login for maximum security.</Trans>
              </Text>
            </Column>
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
        <Match when={lifecycle.state() === State.MFA}>
          <FlowTitle subtitle={<Trans>Multi-factor Authentication</Trans>} emoji="lock">
            <Trans>Two-Factor Auth</Trans>
          </FlowTitle>

          <FlowMFA
            methods={lifecycle.mfaMethods()!}
            ticket={lifecycle.mfaTicket()!}
            onBack={() => lifecycle.transition({ type: TransitionType.Cancel })}
            onComplete={(session: { _id: string; token: string; userId: string; valid: boolean }) => {
              state.auth.setSession(session);
              lifecycle.transition({
                type: TransitionType.LoginUncached,
                session,
              });
            }}
          />
        </Match>
      </Switch>
    </>
  );
}

/**
 * Internal MFA form handler
 */
function FlowMFA(props: {
  methods: string[];
  ticket: string;
  onBack: () => void;
  onComplete: (session: { _id: string; token: string; userId: string; valid: boolean }) => void;
}) {
  const [selectedMethod, setSelected] = createSignal<string>();
  const state = useState();
  const modals = useModals();

  const apiUrl = import.meta.env.VITE_API_URL || "https://gangio.pro/api";

  async function onSubmit(data: FormData) {
    const method = selectedMethod();
    let mfa_response: any;

    if (method === "Password") {
      mfa_response = { password: data.get("password") };
    } else if (method === "Totp") {
      mfa_response = { totp_code: data.get("totp_code") };
    } else if (method === "Recovery") {
      mfa_response = { recovery_code: data.get("recovery_code") };
    }

    try {
      const session = await fetch(`${apiUrl}/auth/session/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mfa_response,
          mfa_ticket: props.ticket,
          friendly_name: "Stoat for Web",
        }),
      }).then((r) => r.json());

      if (session.token) {
        props.onComplete({
          _id: session._id,
          token: session.token,
          userId: session.user_id,
          valid: false,
        });
      } else if (session.type === "InvalidCredentials") {
         modals.showError("Invalid code. Please try again.");
      }
    } catch (e) {
      modals.showError(e);
    }
  }

  return (
    <Column gap="lg">
      <Switch
        fallback={
          <Column gap="md">
            <Text>
              <Trans>Please select a method to authenticate.</Trans>
            </Text>
            <For each={props.methods}>
              {(method: string) => (
                <CategoryButton
                  action="chevron"
                  icon={
                    <Switch>
                      <Match when={method === "Password"}>
                        <BiSolidKeyboard size={24} />
                      </Match>
                      <Match when={method === "Totp"}>
                        <BiSolidKey size={24} />
                      </Match>
                      <Match when={method === "Recovery"}>
                        <BiRegularArchive size={24} />
                      </Match>
                    </Switch>
                  }
                  onClick={() => setSelected(method)}
                >
                  {method === "Totp" ? <Trans>Authenticator App</Trans> : method}
                </CategoryButton>
              )}
            </For>
            <Button variant="text" onPress={props.onBack}>
              <Trans>Back</Trans>
            </Button>
          </Column>
        }
      >
        <Match when={selectedMethod()}>
          <Form onSubmit={onSubmit}>
            <Switch>
              <Match when={selectedMethod() === "Password"}>
                <Fields fields={["password"]} />
              </Match>
              <Match when={selectedMethod() === "Totp"}>
                <Fields fields={["totp_code"]} />
              </Match>
              <Match when={selectedMethod() === "Recovery"}>
                <Fields fields={["recovery_code"]} />
              </Match>
            </Switch>
            <Row align justify>
              <Button variant="text" onPress={() => setSelected(undefined)}>
                <Trans>Back</Trans>
              </Button>
              <Button type="submit">
                <Trans>Confirm</Trans>
              </Button>
            </Row>
          </Form>
        </Match>
      </Switch>
    </Column>
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
