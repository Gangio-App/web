import { onMount } from "solid-js";

import { useClientLifecycle } from "@revolt/client";
import { TransitionType } from "@revolt/client/Controller";
import { Navigate } from "@revolt/routing";
import { CircularProgress } from "@revolt/ui";
import { css } from "styled-system/css";

import { useState } from "@revolt/state";

/**
 * Handles the redirect from Steam login callback.
 * URL: /login/steam-token?token=...&userId=...
 *
 * Reads the session token from query params, stores it in auth state
 * and triggers the LoginUncached transition to start the client session.
 */
export default function FlowSteamToken() {
  const state = useState();
  const { lifecycle } = useClientLifecycle();

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");

    if (!token || !userId) {
      // Redirect back to login with an error if params are missing
      if (window.opener) {
        window.opener.postMessage({ type: "steam-login-error", error: "steam_internal_error" }, window.location.origin);
        window.close();
      } else {
        window.location.replace("/login/auth?error=steam_internal_error");
      }
      return;
    }

    if (window.opener) {
      // If we are in a popup, send the token to the parent window and close
      window.opener.postMessage({ type: "steam-login", token, userId }, window.location.origin);
      window.close();
      return;
    }

    // Fallback for same-tab redirect (if user somehow got here directly)
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
  });

  return (
    <div
      class={css({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        padding: "40px",
        textAlign: "center",
      })}
    >
      <CircularProgress />
      <p
        class={css({
          fontSize: "14px",
          opacity: 0.7,
          margin: 0,
        })}
      >
        Signing you in with Steam...
      </p>
    </div>
  );
}
