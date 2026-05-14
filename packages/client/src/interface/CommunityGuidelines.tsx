import { LegalLayout } from "./legal/LegalLayout";

const LAST_UPDATED = "May 14, 2026";

export function CommunityGuidelines() {
  return (
    <LegalLayout
      current="/guidelines"
      title="Community Guidelines"
      tagline="The behaviour we expect from everyone using Gangio."
      updated={LAST_UPDATED}
      summary="Be kind, be safe, and don't post things that hurt other people. Communities and moderators may add their own rules on top of these. Severe or repeated violations may result in suspension or removal from the platform."
    >
      <p>
        Gangio exists so people can hang out, build communities and play
        together. These Community Guidelines apply everywhere on Gangio —
        public servers, private DMs, voice and video calls, usernames,
        avatars and profile content. They sit on top of our{" "}
        <a href="/terms">Terms of Service</a> and{" "}
        <a href="/acceptable-use">Acceptable Use Policy</a>.
      </p>

      <h2>1. Respect other people</h2>
      <ul>
        <li>
          No harassment, hate speech, or targeted attacks based on race,
          ethnicity, national origin, caste, religion, gender, gender
          identity, sexual orientation, disability or serious illness.
        </li>
        <li>
          No threats of violence or content that glorifies violence against
          a person or group.
        </li>
        <li>No doxxing — sharing private personal information without consent.</li>
        <li>
          No coordinated harassment or brigading. If you see it happening,
          report it and step away.
        </li>
      </ul>

      <h2>2. Protect minors</h2>
      <p>
        We have <strong>zero tolerance</strong> for content that sexualizes
        minors. We report Child Sexual Abuse Material (CSAM) to law
        enforcement and the National Center for Missing &amp; Exploited
        Children (NCMEC) where applicable. Grooming, sextortion or
        attempting to contact minors for sexual purposes will result in an
        immediate ban and reports to authorities.
      </p>

      <h2>3. Don&apos;t glorify self-harm</h2>
      <p>
        We don&apos;t allow content that promotes, encourages, or provides
        instructions for self-harm or suicide. If you or someone you know
        is struggling, please reach out to a local crisis line — see our{" "}
        <a href="/safety">Safety Center</a> for resources.
      </p>

      <h2>4. No illegal or dangerous content</h2>
      <ul>
        <li>No promotion of terrorism or violent extremism.</li>
        <li>
          No sale or facilitation of regulated goods (firearms, drugs,
          stolen items, hacking services, etc.).
        </li>
        <li>
          No malware, exploits, or content that compromises the security of
          other systems.
        </li>
      </ul>

      <h2>5. Keep adult content in adult spaces</h2>
      <p>
        Sexually explicit content involving consenting adults may only
        appear in age-gated channels created for that purpose, where
        permitted by local law. It must never be posted in public channels,
        in profile pictures, banners, status messages, server names or
        usernames.
      </p>

      <h2>6. Don&apos;t spam or manipulate the platform</h2>
      <ul>
        <li>No mass-messaging, advertising, phishing or scams.</li>
        <li>No fake engagement, vote-rigging, or coordinated inauthentic behaviour.</li>
        <li>
          No evading bans (using alt accounts, VPNs to bypass bans, etc.).
        </li>
      </ul>

      <h2>7. Respect intellectual property</h2>
      <p>
        Don&apos;t share content that infringes copyright, trademark or
        other IP. If you believe content on Gangio infringes your rights,
        send a notice via the <a href="/contact">contact</a> page.
      </p>

      <h2>8. Server and moderator responsibilities</h2>
      <p>
        If you run a community on Gangio, you are responsible for the
        content posted in your spaces. You must enforce these Guidelines,
        respond to abuse reports promptly, and avoid creating servers that
        exist primarily to violate the Guidelines.
      </p>

      <h2>9. Reporting</h2>
      <p>
        Report violations from inside the app (right-click on a message →
        Report) or through the <a href="/contact">contact</a> page. The
        more information you can provide (server, channel, message link,
        date/time), the faster we can act. False reports can themselves
        violate these Guidelines.
      </p>

      <h2>10. Enforcement</h2>
      <p>
        Depending on severity and recency, enforcement actions can include
        warnings, content removal, feature limits, temporary suspensions,
        permanent bans, server takedowns and reports to law enforcement.
        We aim to be proportionate and consistent, and we err on the side
        of protecting victims.
      </p>

      <h2>11. Appeals</h2>
      <p>
        If you believe an enforcement action was a mistake, you can appeal
        from the email we send when the action is taken, or via the{" "}
        <a href="/contact">contact</a> page.
      </p>
    </LegalLayout>
  );
}
