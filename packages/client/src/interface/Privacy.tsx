import { Trans } from "@lingui-solid/solid/macro";
import { css } from "styled-system/css";
import { Column } from "@revolt/ui";

export function Privacy() {
  return (
    <div
      class={css({
        width: "100%",
        height: "100%",
        padding: "64px 32px",
        overflowY: "auto",
        background: "var(--md-sys-color-background)",
        color: "var(--md-sys-color-on-background)",
      })}
    >
      <Column gap="lg" class={css({ maxWidth: "800px", margin: "0 auto", lineHeight: "1.6" })}>
        <h1 class={css({ fontSize: "2.5rem", fontWeight: "900", marginBottom: "16px" })}>
          <Trans>Privacy Policy</Trans>
        </h1>
        <p>
          <Trans>Last updated: {new Date().toLocaleDateString()}</Trans>
        </p>
        <div class={css({ display: "flex", flexDirection: "column", gap: "16px" })}>
          <p>
            <Trans>Welcome to Gangio. This Privacy Policy outlines how we collect, use, and protect your personal information when you use our services.</Trans>
          </p>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>1. Information We Collect</Trans>
          </h2>
          <p>
            <Trans>We collect information to provide better services to all our users. This includes:</Trans>
          </p>
          <ul class={css({ listStyleType: "disc", paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "8px" })}>
            <li><Trans>Account Information: When you register, we collect your email address, username, and password.</Trans></li>
            <li><Trans>Usage Data: We automatically collect information about your interactions with the service, including IP addresses, browser types, and device information.</Trans></li>
            <li><Trans>Communications: Messages, posts, and files you share within the platform are stored securely to facilitate communication.</Trans></li>
          </ul>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>2. How We Use Your Information</Trans>
          </h2>
          <p>
            <Trans>We use the information we collect for the following purposes:</Trans>
          </p>
          <ul class={css({ listStyleType: "disc", paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "8px" })}>
            <li><Trans>To provide, maintain, and improve our services.</Trans></li>
            <li><Trans>To communicate with you regarding updates, security alerts, and support messages.</Trans></li>
            <li><Trans>To ensure platform safety, investigate suspicious activity, and enforce our Terms of Service.</Trans></li>
          </ul>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>3. How We Share Your Information</Trans>
          </h2>
          <p>
            <Trans>We do not sell your personal information. We may share your information only in the following scenarios:</Trans>
          </p>
          <ul class={css({ listStyleType: "disc", paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "8px" })}>
            <li><Trans>With third-party service providers who assist us in operating our platform.</Trans></li>
            <li><Trans>To comply with legal obligations, enforce our policies, or protect our rights and the rights of others.</Trans></li>
            <li><Trans>With your active and explicit consent.</Trans></li>
          </ul>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>4. Data Security</Trans>
          </h2>
          <p>
            <Trans>We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no data transmission over the internet is completely secure, and we cannot guarantee absolute security.</Trans>
          </p>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>5. Your Privacy Rights</Trans>
          </h2>
          <p>
            <Trans>You have the right to access, update, or delete your personal information at any time through your account settings. You may also contact us to exercise your data protection rights under applicable laws.</Trans>
          </p>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>6. Changes to This Policy</Trans>
          </h2>
          <p>
            <Trans>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date.</Trans>
          </p>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>7. Contact Us</Trans>
          </h2>
          <p>
            <Trans>If you have any questions about this Privacy Policy, please contact our support team.</Trans>
          </p>
        </div>
      </Column>
    </div>
  );
}
