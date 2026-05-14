import { LegalLayout } from "./legal/LegalLayout";

export function Contact() {
  return (
    <LegalLayout
      current="/contact"
      title="Contact"
      tagline="The fastest ways to reach the team."
      summary="For most questions, the GitHub issue tracker or our Bluesky DMs are the quickest path. Use email for legal, privacy, security or law-enforcement matters that can't be discussed in public."
    >
      <h2>General questions and bug reports</h2>
      <p>
        Open an issue or discussion on{" "}
        <a href="https://github.com/Gangio-App" target="_blank" rel="noopener noreferrer">
          our GitHub
        </a>
        . Search first — your question may already be answered.
      </p>

      <h2>Updates and casual chat</h2>
      <p>
        Follow and DM us on Bluesky:{" "}
        <a href="https://bsky.app/profile/gangio.pro" target="_blank" rel="noopener noreferrer">
          @gangio.pro
        </a>
        .
      </p>

      <h2>Email</h2>
      <ul>
        <li>
          <strong>Support:</strong>{" "}
          <a href="mailto:support@gangio.pro">support@gangio.pro</a>
        </li>
        <li>
          <strong>Privacy &amp; data requests:</strong>{" "}
          <a href="mailto:privacy@gangio.pro">privacy@gangio.pro</a>
        </li>
        <li>
          <strong>Trust &amp; Safety:</strong>{" "}
          <a href="mailto:trust@gangio.pro">trust@gangio.pro</a>
        </li>
        <li>
          <strong>Security disclosure:</strong>{" "}
          <a href="mailto:security@gangio.pro">security@gangio.pro</a>{" "}
          (please include reproduction steps and a proof-of-concept).
        </li>
        <li>
          <strong>Press &amp; partnerships:</strong>{" "}
          <a href="mailto:press@gangio.pro">press@gangio.pro</a>
        </li>
        <li>
          <strong>Law enforcement:</strong>{" "}
          <a href="mailto:legal@gangio.pro">legal@gangio.pro</a>
        </li>
      </ul>

      <h2>Reporting a user or server</h2>
      <p>
        The fastest way to report abuse is from inside the app — right
        click a message, profile or server and choose <em>Report</em>. If
        the abuse falls outside Gangio (e.g. a report involving someone
        who is no longer on the platform) email{" "}
        <a href="mailto:trust@gangio.pro">trust@gangio.pro</a>.
      </p>

      <h2>Press kit</h2>
      <p>
        Looking for our wordmark, screenshots and brand colours? Drop us
        a line at <a href="mailto:press@gangio.pro">press@gangio.pro</a>{" "}
        and we&apos;ll send the latest kit.
      </p>

      <h2>Support the project</h2>
      <p>
        Gangio is free, open source and ad-free. If you&apos;d like to
        help keep it that way:{" "}
        <a href="https://buymeacoffee.com/korybantes" target="_blank" rel="noopener noreferrer">
          Buy me a coffee
        </a>
        .
      </p>
    </LegalLayout>
  );
}
