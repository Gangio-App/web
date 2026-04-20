import { Trans } from "@lingui-solid/solid/macro";
import { css } from "styled-system/css";
import { Column } from "@revolt/ui";

export function Terms() {
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
          <Trans>Terms of Service</Trans>
        </h1>
        <p>
          <Trans>Last updated: {new Date().toLocaleDateString()}</Trans>
        </p>
        <div class={css({ display: "flex", flexDirection: "column", gap: "16px" })}>
          <p>
            <Trans>Welcome to Gangio. By accessing or using our platform, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.</Trans>
          </p>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>1. Acceptance of Terms</Trans>
          </h2>
          <p>
            <Trans>By creating an account or using Gangio, you confirm that you have read, understood, and agreed to these Terms of Service, as well as our Privacy Policy.</Trans>
          </p>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>2. User Accounts</Trans>
          </h2>
          <p>
            <Trans>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</Trans>
          </p>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>3. Acceptable Use</Trans>
          </h2>
          <p>
            <Trans>You agree not to use the service to:</Trans>
          </p>
          <ul class={css({ listStyleType: "disc", paddingLeft: "32px", display: "flex", flexDirection: "column", gap: "8px" })}>
            <li><Trans>Post or transmit any content that is unlawful, harmful, threatening, abusive, or discriminatory.</Trans></li>
            <li><Trans>Impersonate any person or entity, or falsely state your affiliation with a person or entity.</Trans></li>
            <li><Trans>Upload malicious software, viruses, or any code that disrupts the functionality of the platform.</Trans></li>
            <li><Trans>Engage in spamming, phishing, or unauthorized scraping of our services.</Trans></li>
          </ul>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>4. User-Generated Content</Trans>
          </h2>
          <p>
            <Trans>You retain all your ownership rights to the content you post on Gangio. However, by posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, display, and distribute that content in connection with providing our services.</Trans>
          </p>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>5. Termination</Trans>
          </h2>
          <p>
            <Trans>We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.</Trans>
          </p>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>6. Disclaimer of Warranties</Trans>
          </h2>
          <p>
            <Trans>Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis. Gangio disclaims all warranties of any kind, whether express, implied, or statutory, including but not limited to implied warranties of merchantability and fitness for a particular purpose.</Trans>
          </p>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>7. Limitation of Liability</Trans>
          </h2>
          <p>
            <Trans>In no event shall Gangio, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.</Trans>
          </p>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>8. Governing Law</Trans>
          </h2>
          <p>
            <Trans>These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Gangio operates, without regard to its conflict of law provisions.</Trans>
          </p>

          <h2 class={css({ fontSize: "1.5rem", fontWeight: "700", marginTop: "24px" })}>
            <Trans>9. Changes to Terms</Trans>
          </h2>
          <p>
            <Trans>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</Trans>
          </p>
        </div>
      </Column>
    </div>
  );
}
