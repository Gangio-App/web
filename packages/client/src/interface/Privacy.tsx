import { LegalLayout } from "./legal/LegalLayout";

const LAST_UPDATED = "May 14, 2026";

export function Privacy() {
  return (
    <LegalLayout
      current="/privacy"
      title="Privacy Policy"
      tagline="What we collect, why we collect it, and the controls you have."
      updated={LAST_UPDATED}
      summary="Gangio doesn't sell your data and doesn't use ads. We collect only what's needed to run the service, keep it safe and improve it. You can delete your account at any time, and we honor data-subject requests under GDPR, UK GDPR, CCPA/CPRA and similar laws."
    >
      <p>
        This Privacy Policy explains how Gangio (&quot;Gangio&quot;,
        &quot;we&quot;, &quot;us&quot;) handles personal data when you use
        our websites, desktop and mobile apps, and APIs (the
        &quot;Service&quot;). It applies in addition to our{" "}
        <a href="/terms">Terms of Service</a> and{" "}
        <a href="/cookies">Cookie Policy</a>.
      </p>

      <h2>1. Who is the data controller?</h2>
      <p>
        For users worldwide, Gangio acts as the data controller for the
        personal data described below. You can reach us at any time via the{" "}
        <a href="/contact">contact</a> page.
      </p>

      <h2>2. Information we collect</h2>
      <h3>a. Information you provide</h3>
      <ul>
        <li>
          <strong>Account data:</strong> email address, username, password
          hash, and (optionally) display name and avatar.
        </li>
        <li>
          <strong>Profile data:</strong> bios, status, banners and other
          profile information you choose to share.
        </li>
        <li>
          <strong>Content you share:</strong> messages, attachments, voice
          and video calls, server settings, role configuration and similar
          content you create or upload.
        </li>
        <li>
          <strong>Support communications:</strong> the content of any
          messages you send us, including bug reports.
        </li>
      </ul>

      <h3>b. Information collected automatically</h3>
      <ul>
        <li>
          <strong>Device and connection data:</strong> IP address, user-agent,
          OS, locale, app version and rough geo (country/region) for
          security, abuse prevention and routing.
        </li>
        <li>
          <strong>Usage data:</strong> events such as login, message-sent
          counts, feature usage, error reports.
        </li>
        <li>
          <strong>Real-time media metadata:</strong> codec, bitrate, packet
          loss and similar diagnostics. Voice and video traffic is{" "}
          <strong>not stored</strong> unless you explicitly start a recording
          feature.
        </li>
      </ul>

      <h3>c. Information from third parties</h3>
      <p>
        If you sign in with a third-party identity provider (where supported)
        or link an external integration, we receive the data those services
        share with us under your authorization.
      </p>

      <h2>3. How we use your information</h2>
      <ul>
        <li>operate, maintain and improve the Service;</li>
        <li>authenticate accounts and prevent fraud, spam and abuse;</li>
        <li>route messages, voice and video to the right participants;</li>
        <li>respond to support requests and legal obligations;</li>
        <li>send service-related notifications (you can opt out of optional emails at any time);</li>
        <li>conduct aggregated analytics about feature usage and platform health.</li>
      </ul>

      <h2>4. Legal bases (EEA / UK)</h2>
      <p>
        Where the GDPR or UK GDPR applies, we rely on the following legal
        bases: (a) <strong>contract</strong> — to provide the Service you
        requested; (b) <strong>legitimate interests</strong> — to keep the
        Service safe, secure and improving; (c) <strong>consent</strong> —
        for optional features such as email newsletters or non-essential
        cookies; (d) <strong>legal obligation</strong> — when we must comply
        with applicable law.
      </p>

      <h2>5. Sharing</h2>
      <p>
        We do not sell or rent your personal data. We share it only with:
      </p>
      <ul>
        <li>
          <strong>Service providers</strong> that host infrastructure,
          deliver media (e.g. SFU/TURN servers), send transactional email,
          provide error reporting, or perform other operational tasks under
          a contract that requires confidentiality and data protection;
        </li>
        <li>
          <strong>Other users</strong> — content you post in a server or
          channel is visible to its members;
        </li>
        <li>
          <strong>Legal recipients</strong> when required to comply with
          valid legal process or to protect the rights, property or safety
          of Gangio, our users or the public;
        </li>
        <li>
          <strong>Successors</strong> in connection with a merger,
          acquisition or sale of assets, subject to confidentiality.
        </li>
      </ul>

      <h2>6. International transfers</h2>
      <p>
        Gangio is operated globally. Personal data may be transferred to and
        processed in countries other than your own. When we transfer
        personal data from the EEA, UK or Switzerland, we use appropriate
        safeguards such as Standard Contractual Clauses.
      </p>

      <h2>7. Retention</h2>
      <p>
        We retain account data for as long as your account is active.
        Messages are retained until you or your community owner delete them.
        Backups may persist for a limited period after deletion (typically
        up to 30 days) for disaster recovery. Aggregated, de-identified data
        may be retained indefinitely.
      </p>

      <h2>8. Your rights</h2>
      <p>
        Depending on where you live you have rights to access, correct,
        delete, port and restrict processing of your personal data, and to
        object to certain processing. EEA/UK residents may lodge a complaint
        with their local data protection authority. California residents
        have rights under the CCPA/CPRA. To exercise any right, visit the{" "}
        <a href="/contact">contact</a> page or use the in-app account
        deletion control.
      </p>

      <h2>9. Children</h2>
      <p>
        The Service is not directed to children under 13 (or under the age
        of digital consent in your country). If we learn we have collected
        personal data from a child without parental consent, we will delete
        it. Parents/guardians can contact us at any time.
      </p>

      <h2>10. Security</h2>
      <p>
        We use industry-standard technical and organizational measures
        including TLS in transit, encrypted password storage, principle of
        least privilege, and continuous monitoring. No system is 100%
        secure; please choose a strong, unique password and enable
        multi-factor authentication where available.
      </p>

      <h2>11. Cookies and similar technologies</h2>
      <p>
        See our <a href="/cookies">Cookie Policy</a> for details on the
        cookies and local-storage technologies we use, and how to control
        them.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update this Privacy Policy from time to time. Material
        changes will be announced via the app or by email before they take
        effect.
      </p>

      <h2>13. Contact</h2>
      <p>
        For privacy questions, data-subject requests or to reach our Data
        Protection contact, visit the <a href="/contact">contact</a> page.
      </p>
    </LegalLayout>
  );
}
