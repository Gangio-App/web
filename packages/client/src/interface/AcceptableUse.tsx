import { LegalLayout } from "./legal/LegalLayout";

const LAST_UPDATED = "May 14, 2026";

export function AcceptableUse() {
  return (
    <LegalLayout
      current="/acceptable-use"
      title="Acceptable Use Policy"
      tagline="The technical rules that keep Gangio fast, safe and reliable for everyone."
      updated={LAST_UPDATED}
      summary="Don't abuse the infrastructure: no spam, scraping, malware, brute-force attacks, or trying to take the service down. Use the official APIs as documented and respect rate limits. We may throttle, block or terminate access for abuse."
    >
      <p>
        This Acceptable Use Policy (&quot;AUP&quot;) sets out what you can
        and cannot do with the Gangio platform from a technical and
        operational standpoint. It supplements our{" "}
        <a href="/terms">Terms of Service</a> and{" "}
        <a href="/guidelines">Community Guidelines</a>.
      </p>

      <h2>1. Prohibited activities</h2>
      <ul>
        <li>
          <strong>Abuse of infrastructure:</strong> denial-of-service,
          flooding, intentionally generating high error rates, or otherwise
          attempting to overwhelm any Gangio system.
        </li>
        <li>
          <strong>Unauthorized access:</strong> probing, scanning, or
          testing the security of the Service without our prior written
          consent (except via our Vulnerability Disclosure program — see
          below).
        </li>
        <li>
          <strong>Malware &amp; harmful code:</strong> distributing viruses,
          trojans, ransomware, spyware, miners, exploit kits or any code
          designed to disrupt, damage or take unauthorized control of any
          system.
        </li>
        <li>
          <strong>Spam &amp; mass messaging:</strong> sending unsolicited
          messages, friend requests, server invites, or DMs at scale; any
          form of pyramid scheme or chain message.
        </li>
        <li>
          <strong>Phishing &amp; social engineering:</strong> impersonating
          Gangio staff, support, or any other party to deceive users.
        </li>
        <li>
          <strong>Scraping &amp; unauthorized automation:</strong> using
          bots, scrapers, headless browsers or other automated agents
          outside of our published APIs.
        </li>
        <li>
          <strong>Circumvention:</strong> bypassing rate limits, IP blocks,
          enforcement actions, account suspensions or any access controls.
        </li>
        <li>
          <strong>Identity abuse:</strong> creating accounts using stolen,
          synthetic or fraudulent identities.
        </li>
      </ul>

      <h2>2. API and bot use</h2>
      <p>
        If you build on top of Gangio you must use our official API and
        comply with its documentation, including authentication
        requirements, scopes, rate limits and webhook signatures. Bots must
        clearly identify themselves and respect user privacy preferences
        (e.g. do not collect message content for users who did not opt in).
      </p>

      <h2>3. Reverse engineering</h2>
      <p>
        Except as expressly permitted by applicable law (including
        interoperability rights under EU law), you may not reverse engineer,
        decompile, disassemble or otherwise attempt to derive the source
        code of closed-source components of the Service.
      </p>

      <h2>4. Self-hosting and forks</h2>
      <p>
        Gangio is open source under the licenses listed in our public
        repositories. Self-hosters and forks are welcome but they must use
        their own infrastructure and branding, and may not present their
        deployment as official Gangio service.
      </p>

      <h2>5. Vulnerability Disclosure</h2>
      <p>
        We welcome responsible security research. Please report
        vulnerabilities privately via the <a href="/contact">contact</a>{" "}
        page (subject &quot;Security&quot;) or by opening a private
        advisory on our GitHub. Do not access data that is not yours, and
        give us reasonable time to remediate before public disclosure.
      </p>

      <h2>6. Enforcement</h2>
      <p>
        Violations of this AUP may result in temporary or permanent
        restriction of access, deletion of offending content, revocation
        of API keys, IP-level blocking, account suspension and reports to
        law enforcement where appropriate. We may take action without
        notice when necessary to protect the Service or its users.
      </p>
    </LegalLayout>
  );
}
