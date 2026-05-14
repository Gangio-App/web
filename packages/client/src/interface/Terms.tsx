import { LegalLayout } from "./legal/LegalLayout";

const LAST_UPDATED = "May 14, 2026";

export function Terms() {
  return (
    <LegalLayout
      current="/terms"
      title="Terms of Service"
      tagline="The agreement between you and Gangio when you use our services."
      updated={LAST_UPDATED}
      summary="Use Gangio kindly: don't break the law, don't harm other people, and don't try to wreck the platform. We can suspend abusive accounts. Your data is yours, but you grant us a license to host and display the content you post so the service can work."
    >
      <p>
        These Terms of Service (the &quot;Terms&quot;) govern your access to and
        use of the Gangio websites, desktop and mobile applications, APIs, and
        any related services (together, the &quot;Service&quot;) provided by
        Gangio (&quot;Gangio&quot;, &quot;we&quot;, &quot;us&quot; or
        &quot;our&quot;). By creating an account or otherwise using the Service
        you agree to these Terms and to our{" "}
        <a href="/privacy">Privacy Policy</a>,{" "}
        <a href="/acceptable-use">Acceptable Use Policy</a>, and{" "}
        <a href="/guidelines">Community Guidelines</a>.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 13 years old (or the minimum age of digital
        consent in your country, if higher) to use Gangio. If you are under 18
        you confirm that a parent or legal guardian has reviewed these Terms
        and agreed on your behalf. We may at any time require age verification
        and may suspend accounts that we reasonably believe do not meet the
        eligibility requirements.
      </p>

      <h2>2. Your Account</h2>
      <p>
        You are responsible for safeguarding your account credentials and for
        every action taken from your account. Notify us immediately at{" "}
        <a href="/contact">contact</a> if you suspect unauthorized access.
        You may not impersonate another person, transfer your account to
        someone else, or operate multiple accounts to evade enforcement.
      </p>

      <h2>3. License to Use the Service</h2>
      <p>
        Subject to your compliance with these Terms, Gangio grants you a
        limited, personal, non-exclusive, non-transferable, revocable license
        to use the Service. The Service&apos;s source code is open source and
        separately licensed; nothing here restricts rights granted under that
        license.
      </p>

      <h2>4. User Content</h2>
      <p>
        You retain ownership of the messages, voice recordings, video, files,
        avatars and other materials you create or upload (&quot;User
        Content&quot;). To run the Service, however, you grant Gangio a
        worldwide, royalty-free, non-exclusive, sublicensable license to host,
        store, transmit, reproduce, modify (for technical purposes such as
        thumbnailing or transcoding), display and distribute your User Content
        for the limited purposes of operating, providing and improving the
        Service.
      </p>
      <p>
        You are solely responsible for your User Content. You represent that
        you have all rights necessary to grant this license and that your User
        Content does not violate any law or third-party right.
      </p>

      <h2>5. Acceptable Use</h2>
      <p>
        Use of the Service is subject to our{" "}
        <a href="/acceptable-use">Acceptable Use Policy</a> and{" "}
        <a href="/guidelines">Community Guidelines</a>. You agree not to:
      </p>
      <ul>
        <li>
          post content that is illegal, harassing, hateful, threatening,
          defamatory, sexually explicit involving minors, or that incites
          violence;
        </li>
        <li>
          transmit malware, attempt to gain unauthorized access, perform
          denial-of-service attacks, or otherwise interfere with the Service;
        </li>
        <li>
          spam, phish, scrape, or use automated means to interact with the
          Service except via our official APIs;
        </li>
        <li>
          impersonate any person or entity, or misrepresent your affiliation;
        </li>
        <li>resell, sublicense or commercially exploit the Service without our written consent.</li>
      </ul>

      <h2>6. Servers and Communities</h2>
      <p>
        Servers, communities and channels created on Gangio are operated by
        their owners and moderators. Gangio is not responsible for the
        moderation decisions of community owners. If you operate a community
        you must enforce our Community Guidelines and applicable law within
        your space.
      </p>

      <h2>7. Voice, Video and Live Streaming</h2>
      <p>
        Real-time voice, video and screen-share traffic is processed through
        our media infrastructure. By participating in a call you consent to
        the routing and temporary processing required to deliver media to
        other participants. Recording calls is the responsibility of the user
        who initiates the recording and may be subject to local consent laws.
      </p>

      <h2>8. Subscriptions, Donations and Payments</h2>
      <p>
        Gangio is free to use. Optional features or community-tier upgrades
        may be offered for a fee in the future. Donations made via partners
        such as Buy Me a Coffee are voluntary, non-refundable and not subject
        to these Terms.
      </p>

      <h2>9. Suspension and Termination</h2>
      <p>
        We may suspend or terminate your access to the Service, with or
        without notice, if we reasonably believe you have violated these
        Terms, our policies, or the law. You may terminate your account at
        any time from your account settings. Sections of these Terms that by
        their nature should survive termination will survive (including
        ownership, indemnity, limitation of liability and dispute resolution).
      </p>

      <h2>10. Disclaimers</h2>
      <p>
        The Service is provided <strong>&quot;AS IS&quot;</strong> and
        <strong> &quot;AS AVAILABLE&quot;</strong>. To the maximum extent
        permitted by law, Gangio disclaims all warranties, express or
        implied, including warranties of merchantability, fitness for a
        particular purpose, non-infringement, and availability or accuracy of
        content.
      </p>

      <h2>11. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Gangio and its affiliates,
        directors, employees and agents will not be liable for any indirect,
        incidental, special, consequential, exemplary or punitive damages, or
        for any loss of profits, revenue, data, goodwill, or anticipated
        savings, arising out of or relating to your use of the Service. Our
        total aggregate liability for any claim arising under these Terms
        will not exceed the greater of (a) the amount you paid Gangio in the
        12 months preceding the claim or (b) one hundred US dollars (US $100).
      </p>

      <h2>12. Indemnity</h2>
      <p>
        You will defend, indemnify and hold harmless Gangio from and against
        any claims, liabilities, damages, losses and expenses (including
        reasonable attorneys&apos; fees) arising out of or in any way
        connected with your User Content, your use of the Service in
        violation of these Terms, or your violation of any law or third-party
        right.
      </p>

      <h2>13. Changes to the Service or Terms</h2>
      <p>
        We may modify the Service and these Terms from time to time. If we
        make material changes we will provide reasonable notice (for example,
        by email or in-app banner). Continued use after the effective date of
        the change constitutes acceptance.
      </p>

      <h2>14. Governing Law</h2>
      <p>
        These Terms are governed by the laws of the jurisdiction in which
        Gangio is established, without regard to its conflict-of-laws
        principles. Mandatory consumer-protection rights under the law of
        your country of residence are not affected.
      </p>

      <h2>15. Contact</h2>
      <p>
        Questions about these Terms? Visit our <a href="/contact">contact</a>{" "}
        page or open an issue on <a href="https://github.com/Gangio-App" target="_blank" rel="noopener noreferrer">GitHub</a>.
      </p>
    </LegalLayout>
  );
}
