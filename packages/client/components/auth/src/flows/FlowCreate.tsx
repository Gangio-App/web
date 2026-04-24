import { Trans } from "@lingui-solid/solid/macro";

import { useApi, useClient, useClientLifecycle } from "@revolt/client";
import { CONFIGURATION } from "@revolt/common";
import { useNavigate, useParams } from "@revolt/routing";
import { Button, Column, Row, Text, iconSize } from "@revolt/ui";

import MdArrowBack from "@material-design-icons/svg/filled/arrow_back.svg?component-solid";

import { onCleanup, Show } from "solid-js";
import { FlowTitle } from "./Flow";
import { setFlowCheckEmail } from "./FlowCheck";
import { Fields, Form } from "./Form";
import { styled } from "styled-system/jsx";
import { useState } from "@revolt/state";
import { TransitionType } from "@revolt/client/Controller";

/**
 * Flow for creating a new account
 */
export default function FlowCreate() {
  const api = useApi();
  const getClient = useClient();
  const navigate = useNavigate();
  const { code } = useParams();
  const state = useState();
  const { lifecycle } = useClientLifecycle();

  /**
   * Listen for Steam login messages
   */
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === "STEAM_LOGIN_SUCCESS") {
      const { session } = event.data;
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
   * Create an account
   * @param data Form Data
   */
  async function create(data: FormData) {
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    const captcha = data.get("captcha") as string;
    const invite = data.get("invite") as string;

    await api.post("/auth/account/create", {
      email,
      password,
      captcha,
      ...(invite ? { invite } : {}),
    });

    setFlowCheckEmail(email);
    navigate("/login/check", { replace: true });
  }

  const isInviteOnly = () => {
    const client = getClient();
    if (client.configured()) {
      return client.configuration?.features.invite_only;
    }
    return false;
  };

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

  return (
    <>
      <FlowTitle subtitle={<Trans>Create an account</Trans>} emoji="wave">
        <Trans>Hello!</Trans>
      </FlowTitle>
      <Form onSubmit={create} captcha={CONFIGURATION.HCAPTCHA_SITEKEY}>
        <Column gap="xs">
          <Fields fields={["email", "password"]} />
          <Show when={isInviteOnly()}>
            <Fields
              fields={[
                { field: "invite", value: code, disabled: code?.length > 0 },
              ]}
            />
          </Show>
        </Column>
        <Row justify>
          <a href="..">
            <Button variant="text">
              <MdArrowBack {...iconSize("1.2em")} /> <Trans>Back</Trans>
            </Button>
          </a>
          <RegisterButton type="submit">
            <Trans>Register</Trans>
          </RegisterButton>
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

      {import.meta.env.DEV && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            background: "white",
            color: "black",
            cursor: "pointer",
          }}
          onClick={() => {
            setFlowCheckEmail("insert@stoat.chat");
            navigate("/login/check", { replace: true });
          }}
        >
          Mock Submission
        </div>
      )}
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

const RegisterButton = styled(Button, {
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
