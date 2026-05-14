import { LegalLayout } from "./legal/LegalLayout";

const LAST_UPDATED = "May 14, 2026";

export function Safety() {
  return (
    <LegalLayout
      current="/safety"
      title="Safety Center"
      tagline="Tools, tips and resources for staying safe on Gangio."
      updated={LAST_UPDATED}
      summary="Use blocking, muting and report tools whenever you need them. Owners and moderators have moderation tools at the server level. If you or someone you know is in crisis, contact a local emergency number or one of the helplines listed below."
    >
      <p>
        Safety is foundational to Gangio. This page is a quick guide to the
        protections available to you, the responsibilities of moderators
        and our team, and the external resources that can help when
        something serious happens.
      </p>

      <h2>For everyone</h2>
      <h3>Privacy controls</h3>
      <ul>
        <li>
          Choose who can DM you (everyone, only friends, or nobody) in
          Settings → Privacy.
        </li>
        <li>
          Limit who can add you as a friend or who can see your activity.
        </li>
        <li>Hide your online status with invisible mode.</li>
      </ul>

      <h3>Block, mute and ignore</h3>
      <ul>
        <li>
          <strong>Block</strong> someone to remove them from your DMs and
          server interactions everywhere on Gangio.
        </li>
        <li>
          <strong>Mute</strong> a server, channel or DM to stop
          notifications without breaking ties.
        </li>
        <li>
          <strong>Ignore</strong> a user to hide their messages without
          notifying them.
        </li>
      </ul>

      <h3>Reporting abuse</h3>
      <p>
        Right-click a message → Report. You can also report a user
        profile or a server. Add details — what you saw, when, and any
        message links — to help us act faster. Reports are confidential.
      </p>

      <h2>For server owners and moderators</h2>
      <ul>
        <li>
          Define a clear set of rules and pin them in a #rules channel.
          Reference our <a href="/guidelines">Community Guidelines</a>.
        </li>
        <li>
          Use <strong>roles &amp; permissions</strong> to limit who can
          post, attach files, or invite others.
        </li>
        <li>
          Enable <strong>verification</strong> levels (e.g. require email
          or phone) for new members in high-risk communities.
        </li>
        <li>
          Use <strong>slowmode</strong>, <strong>auto-moderation</strong>{" "}
          filters, and link/file restrictions to reduce abuse and spam.
        </li>
        <li>Keep a moderator log channel and act on reports promptly.</li>
      </ul>

      <h2>Account security</h2>
      <ul>
        <li>Use a unique password and enable multi-factor authentication.</li>
        <li>
          Be suspicious of DMs containing links to &quot;free Nitro&quot;,
          &quot;giveaways&quot; or login pages — Gangio will never ask
          for your password outside the official login screen.
        </li>
        <li>
          Review active sessions in Settings → Security and revoke any
          you don&apos;t recognise.
        </li>
      </ul>

      <h2>Crisis resources</h2>
      <p>
        If you or someone you know is in immediate danger, call your local
        emergency number. You can also reach out to one of these
        confidential helplines:
      </p>
      <ul>
        <li>
          <strong>USA:</strong>{" "}
          <a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer">
            988 Suicide &amp; Crisis Lifeline
          </a>
        </li>
        <li>
          <strong>UK &amp; Ireland:</strong>{" "}
          <a href="https://www.samaritans.org" target="_blank" rel="noopener noreferrer">
            Samaritans (116 123)
          </a>
        </li>
        <li>
          <strong>Worldwide:</strong>{" "}
          <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">
            findahelpline.com
          </a>
        </li>
        <li>
          <strong>Child sexual exploitation:</strong>{" "}
          <a href="https://www.missingkids.org/gethelpnow/cybertipline" target="_blank" rel="noopener noreferrer">
            NCMEC CyberTipline
          </a>{" "}
          — and please report it to us via the{" "}
          <a href="/contact">contact</a> page.
        </li>
      </ul>

      <h2>Law-enforcement requests</h2>
      <p>
        Law-enforcement requests for user data should be sent to the email
        listed on our <a href="/contact">contact</a> page. We respond to
        properly served legal process and to emergency disclosure requests
        consistent with applicable law.
      </p>
    </LegalLayout>
  );
}
