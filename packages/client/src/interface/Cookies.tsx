import { LegalLayout } from "./legal/LegalLayout";

const LAST_UPDATED = "May 14, 2026";

export function Cookies() {
  return (
    <LegalLayout
      current="/cookies"
      title="Cookie Policy"
      tagline="The cookies and local-storage technologies Gangio uses, and how to control them."
      updated={LAST_UPDATED}
      summary="Gangio only uses cookies and local storage that are strictly necessary to keep you signed in and run the app. We do not use advertising cookies and we do not sell data to ad networks."
    >
      <p>
        This Cookie Policy describes the cookies, local storage,
        IndexedDB and similar technologies (collectively,
        &quot;cookies&quot;) used by the Gangio websites and apps. It
        complements our <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>1. What are cookies?</h2>
      <p>
        Cookies are small pieces of data stored by your browser or app on
        your device. They allow a service to remember information across
        sessions, such as whether you are signed in or what theme you have
        chosen.
      </p>

      <h2>2. Categories of cookies we use</h2>
      <h3>Strictly necessary</h3>
      <p>
        These are required for the Service to function. They include
        authentication tokens, CSRF tokens, the active server/channel
        selection, and basic security flags. You cannot opt out of
        strictly necessary cookies and continue to use the Service.
      </p>

      <h3>Functional / preference</h3>
      <p>
        These remember your choices, such as theme, language, accent
        colour, layout density and accessibility settings. They make the
        app feel like yours.
      </p>

      <h3>Performance &amp; diagnostics</h3>
      <p>
        Aggregated, de-identified telemetry is used to detect crashes,
        latency issues and feature regressions. This data is associated
        with a random installation ID, not your account, and never sold.
      </p>

      <h3>Advertising</h3>
      <p>
        <strong>We do not use advertising cookies.</strong> We do not run
        ads on Gangio.
      </p>

      <h2>3. Local storage and IndexedDB</h2>
      <p>
        The web and desktop clients use local storage and IndexedDB to
        cache messages, attachments, draft messages and offline state so
        the app loads quickly and survives reconnections. You can clear
        this data at any time from your browser settings or the app&apos;s
        Settings → Storage section.
      </p>

      <h2>4. Third-party cookies</h2>
      <p>
        We may load assets from sub-processors such as content delivery
        networks. Where third parties set cookies, they do so as data
        processors under contract with us and only for purposes described
        in this policy. We do not embed advertising trackers.
      </p>

      <h2>5. Managing cookies</h2>
      <p>
        Most browsers let you view, manage and delete cookies. Note that
        blocking strictly necessary cookies will sign you out and may
        break the app.
      </p>

      <h2>6. Changes</h2>
      <p>
        If we add new categories of cookies, we will update this policy
        and (where required) ask for your consent through an in-app
        prompt.
      </p>
    </LegalLayout>
  );
}
