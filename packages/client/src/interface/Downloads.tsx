import { Show } from "solid-js";
import { css } from "styled-system/css";
import { Button, Column } from "@revolt/ui";
import { Trans } from "@lingui-solid/solid/macro";

import Wordmark from "../../public/assets/web/wordmark.svg?component-solid";
import { IoLogoMicrosoft, IoLogoApple } from "solid-icons/io";
export function Downloads() {
  // Don't show download section if running in Electron
  if (window.native) {
    return null;
  }
  return (
    <div
      class={css({
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        gap: "32px",
      })}
    >
      <Wordmark
        class={css({
          width: "60%",
          margin: "auto",
          fill: "var(--md-sys-color-on-surface)",
        })}
      />

      <Column>
        <b
          style={{
            "font-weight": 800,
            "font-size": "1.4em",
            display: "flex",
            "flex-direction": "column",
            "align-items": "center",
            "text-align": "center",
          }}
        >
          <span>
            <Trans>Get Gangio on Desktop</Trans>
          </span>
        </b>
        <span style={{ "text-align": "center", opacity: "0.5" }}>
          <Trans>Download the native app for Windows or macOS.</Trans>
        </span>
      </Column>

      <Column gap="lg">
        <a
          href="https://github.com/Gangio-App/for-desktop/releases/download/v1.3.0/gangio-desktop-setup.exe"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button>
            <span style={{ display: "flex", "align-items": "center", gap: "8px" }}>
              <IoLogoMicrosoft size={20} />
              <Trans>Download for Windows</Trans>
            </span>
          </Button>
        </a>
        <a
          href="https://github.com/gangio/for-desktop/releases/latest/download/Gangio.dmg"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="tonal">
            <span style={{ display: "flex", "align-items": "center", gap: "8px" }}>
              <IoLogoApple size={20} />
              <Trans>Download for macOS</Trans>
            </span>
          </Button>
        </a>
      </Column>
    </div>
  );
}
