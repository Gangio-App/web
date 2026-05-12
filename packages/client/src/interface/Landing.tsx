import { For, Show, createMemo, createSignal } from "solid-js";

import {
  BiRegularCode,
  BiRegularGlobe,
  BiRegularLock,
  BiSolidCheckCircle,
} from "solid-icons/bi";
import { FiArrowUpRight } from "solid-icons/fi";
import { IoLogoApple, IoLogoMicrosoft } from "solid-icons/io";
import { css, cx } from "styled-system/css";
import { styled } from "styled-system/jsx";

import Wordmark from "../../public/assets/web/wordmark.svg?component-solid";
import desktopShot from "../../assets/web/landing/desktop-screenshot.png";
import iosShot from "../../assets/web/landing/ios.webp";

/* ---------------- constants ---------------- */

const URLS = {
  windows:
    "https://github.com/Gangio-App/for-desktop/releases/download/v1.3.16/gangio-desktop-setup.exe",
  macos:
    "https://github.com/gangio/for-desktop/releases/latest/download/Gangio.dmg",
  ios: "https://testflight.apple.com/join/4EqcbpG8",
  signup: "/login/create",
  login: "/login/auth",
};

const THEMES: { name: string; bg: string; accent: string; text: string }[] = [
  { name: "Midnight", bg: "#0b0c13", accent: "#7c5cff", text: "#ffffff" },
  { name: "Paper", bg: "#fafaf7", accent: "#111111", text: "#0a0a0a" },
  { name: "Forest", bg: "#0e1a14", accent: "#34d399", text: "#ecfdf5" },
  { name: "Sunset", bg: "#1a0f12", accent: "#f97316", text: "#fff7ed" },
  { name: "Ocean", bg: "#0b1220", accent: "#22d3ee", text: "#ecfeff" },
  { name: "Rose", bg: "#fbf1f4", accent: "#e11d48", text: "#0a0a0a" },
];

/* ---------------- component ---------------- */

export function Landing() {
  const [theme, setTheme] = createSignal(0);

  const isIOS = createMemo(() =>
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent),
  );

  const t = () => THEMES[theme()];

  return (
    <Root>
      {/* NAV */}
      <Nav>
        <NavInner>
          <a href="/" class={brandLink()}>
            <Wordmark
              class={css({
                height: "24px",
                width: "auto",
                color: "#0a0a0a",
              })}
            />
          </a>
          <NavLinks>
            <a href="#features">Features</a>
            <a href="#voice">Voice & video</a>
            <a href="#themes">Themes</a>
            <a href="#download">Download</a>
            <a href="/discover/servers">Discover</a>
          </NavLinks>
          <NavCtas>
            <a class={ghostBtn()} href={URLS.login}>
              Log in
            </a>
            <a class={primaryBtn()} href={URLS.signup}>
              Sign up
            </a>
          </NavCtas>
        </NavInner>
      </Nav>

      {/* HERO */}
      <Hero>
        <HeroCopy>
          <Eyebrow>
            <Pill>Public Beta</Pill>
            <span>A chat app that puts your community first.</span>
          </Eyebrow>

          <H1>
            Your space.<br />
            <Accent>Your community.</Accent>
          </H1>

          <Sub>
            Gangio is a free and open-source chat platform for friends, groups,
            and communities — with crystal-clear voice, HD video, and screen
            sharing built in.
          </Sub>

          <CtaRow>
            <a class={primaryBtnLg()} href={URLS.signup}>
              Get started — it's free
            </a>
            <a class={ghostBtnLg()} href="#download">
              Download the app
            </a>
          </CtaRow>

          <TrustRow>
            <TrustItem>
              <BiSolidCheckCircle size={14} /> No ads
            </TrustItem>
            <TrustItem>
              <BiSolidCheckCircle size={14} /> No tracking
            </TrustItem>
            <TrustItem>
              <BiSolidCheckCircle size={14} /> Open source
            </TrustItem>
          </TrustRow>
        </HeroCopy>

        <HeroShot>
          <HeroShotFrame>
            <img
              src={desktopShot}
              alt="Gangio desktop app"
              loading="eager"
              class={css({
                width: "100%",
                height: "auto",
                display: "block",
              })}
            />
          </HeroShotFrame>
        </HeroShot>
      </Hero>

      {/* HEADLINE STATEMENT */}
      <BigStatement>
        <BigStatementText>
          Chat that actually <Accent>feels like chat.</Accent>
        </BigStatementText>
        <BigStatementSub>
          Built for the way people really hang out online — not for ad revenue,
          not for investors, not for growth metrics.
        </BigStatementSub>
      </BigStatement>

      {/* VOICE & VIDEO */}
      <DarkSection id="voice">
        <VoiceGrid>
          <VoiceCopy>
            <SectionEyebrow>Voice & Video</SectionEyebrow>
            <VoiceTitle>
              HD voice.<br />
              Crisp video.<br />
              <Accent>Zero drama.</Accent>
            </VoiceTitle>
            <VoiceLead>
              Drop into a voice channel and talk. Share your screen in full HD.
              Jump on a video call. All with noise suppression and echo
              cancellation baked in — no plugins, no pro tier.
            </VoiceLead>

            <VoiceFeatures>
              <VoiceFeature>
                <VoiceFeatureTitle>HD screen sharing</VoiceFeatureTitle>
                <VoiceFeatureDesc>
                  Share a window, a tab, or your whole display in up to 1080p —
                  game nights, watch parties, pair programming.
                </VoiceFeatureDesc>
              </VoiceFeature>
              <VoiceFeature>
                <VoiceFeatureTitle>Low-latency voice</VoiceFeatureTitle>
                <VoiceFeatureDesc>
                  Server-based voice channels with noise suppression and echo
                  cancellation, so you sound like yourself.
                </VoiceFeatureDesc>
              </VoiceFeature>
              <VoiceFeature>
                <VoiceFeatureTitle>Video calls</VoiceFeatureTitle>
                <VoiceFeatureDesc>
                  1-on-1 or group video. Mute, deafen, and camera controls
                  where you expect them.
                </VoiceFeatureDesc>
              </VoiceFeature>
            </VoiceFeatures>
          </VoiceCopy>

          <VoiceVisual>
            <VoiceTile data-a="1">
              <VoiceAvatar style={{ background: "#7c5cff" }}>L</VoiceAvatar>
              <VoiceName>luna</VoiceName>
              <VoiceWave>
                <WaveBar style={{ "--h": "40%" }} />
                <WaveBar style={{ "--h": "80%" }} />
                <WaveBar style={{ "--h": "60%" }} />
                <WaveBar style={{ "--h": "95%" }} />
                <WaveBar style={{ "--h": "50%" }} />
              </VoiceWave>
              <VoiceBadge>Speaking</VoiceBadge>
            </VoiceTile>
            <VoiceTile data-a="2">
              <VoiceAvatar style={{ background: "#22d3ee" }}>K</VoiceAvatar>
              <VoiceName>kai</VoiceName>
              <VoiceBadge data-muted>Muted</VoiceBadge>
            </VoiceTile>
            <VoiceTile data-a="3" data-share="true">
              <VoiceShareLabel>Screen share · 1080p</VoiceShareLabel>
              <VoiceShareInner>
                <VoiceShareDot style={{ background: "#ff5f57" }} />
                <VoiceShareDot style={{ background: "#febc2e" }} />
                <VoiceShareDot style={{ background: "#28c840" }} />
              </VoiceShareInner>
            </VoiceTile>
            <VoiceTile data-a="4">
              <VoiceAvatar style={{ background: "#f472b6" }}>N</VoiceAvatar>
              <VoiceName>nova</VoiceName>
              <VoiceWave>
                <WaveBar style={{ "--h": "30%" }} />
                <WaveBar style={{ "--h": "70%" }} />
                <WaveBar style={{ "--h": "50%" }} />
              </VoiceWave>
            </VoiceTile>
          </VoiceVisual>
        </VoiceGrid>
      </DarkSection>

      {/* FEATURES */}
      <Section id="features">
        <SectionHeader>
          <SectionEyebrow>Everything you need</SectionEyebrow>
          <SectionTitle>
            Built for conversation.<br />
            <Muted>Not for metrics.</Muted>
          </SectionTitle>
          <SectionLead>
            All the features you've come to expect from a modern chat app —
            without the bloat, the ads, or the data harvesting.
          </SectionLead>
        </SectionHeader>

        <FeatureGrid>
          <FeatureCard>
            <FeatureNum>01</FeatureNum>
            <FeatureTitle>Messaging that feels right</FeatureTitle>
            <FeatureDesc>
              Markdown, code blocks, embeds, threads, reactions, and search.
              DMs, group chats, and full server channels.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureNum>02</FeatureNum>
            <FeatureTitle>Moderation, done right</FeatureTitle>
            <FeatureDesc>
              Granular roles, audit logs, and powerful permissions. Run a
              server of three or three thousand — same tools.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureNum>03</FeatureNum>
            <FeatureTitle>Bots and a real API</FeatureTitle>
            <FeatureDesc>
              A first-class public API and bot platform — the same one we use
              to build the official apps.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureNum>04</FeatureNum>
            <FeatureTitle>Your data, your rules</FeatureTitle>
            <FeatureDesc>
              End-to-end encrypted DMs. Self-hostable. Open source. The privacy
              policy is short enough to actually read.
            </FeatureDesc>
          </FeatureCard>
        </FeatureGrid>
      </Section>

      {/* THEMES */}
      <ThemesSection id="themes">
        <ThemesHeader>
          <SectionEyebrow>Make it yours</SectionEyebrow>
          <SectionTitle>
            Pick a theme.<br />
            <Muted>Or build your own.</Muted>
          </SectionTitle>
          <SectionLead>
            Six built-in themes, custom color accents, and full CSS support —
            so your server looks like your server, not like everybody else's.
          </SectionLead>
        </ThemesHeader>

        <ThemePreview
          style={{
            background: t().bg,
            color: t().text,
          }}
        >
          <ThemePreviewBody>
            <ThemePreviewSidebar
              style={{ borderColor: `${t().text}15` }}
            >
              <ThemePreviewServer style={{ background: t().accent }}>
                g
              </ThemePreviewServer>
              <ThemePreviewServer style={{ background: `${t().text}10` }} />
              <ThemePreviewServer style={{ background: `${t().text}10` }} />
            </ThemePreviewSidebar>
            <ThemePreviewChannels
              style={{ borderColor: `${t().text}15` }}
            >
              <ThemePreviewLabel style={{ color: `${t().text}60` }}>
                COMMUNITY
              </ThemePreviewLabel>
              <ThemePreviewChannel style={{ color: `${t().text}70` }}>
                # general
              </ThemePreviewChannel>
              <ThemePreviewChannel
                data-active
                style={{
                  background: `${t().accent}20`,
                  color: t().text,
                }}
              >
                # announcements
              </ThemePreviewChannel>
              <ThemePreviewChannel style={{ color: `${t().text}70` }}>
                # off-topic
              </ThemePreviewChannel>
            </ThemePreviewChannels>
            <ThemePreviewMain>
              <ThemePreviewMessage>
                <ThemePreviewAvatar style={{ background: t().accent }} />
                <ThemePreviewMessageBody>
                  <ThemePreviewName style={{ color: t().text }}>
                    luna
                  </ThemePreviewName>
                  <ThemePreviewText style={{ color: `${t().text}99` }}>
                    pick any color you want — it's your server.
                  </ThemePreviewText>
                </ThemePreviewMessageBody>
              </ThemePreviewMessage>
              <ThemePreviewMessage>
                <ThemePreviewAvatar style={{ background: `${t().text}30` }} />
                <ThemePreviewMessageBody>
                  <ThemePreviewName style={{ color: t().text }}>kai</ThemePreviewName>
                  <ThemePreviewText style={{ color: `${t().text}99` }}>
                    this theme is {t().name.toLowerCase()}. nice.
                  </ThemePreviewText>
                </ThemePreviewMessageBody>
              </ThemePreviewMessage>
            </ThemePreviewMain>
          </ThemePreviewBody>
        </ThemePreview>

        <ThemeSwatches>
          <For each={THEMES}>
            {(th, i) => (
              <ThemeSwatch
                type="button"
                data-active={theme() === i() ? "true" : undefined}
                onClick={() => setTheme(i())}
                aria-label={`Select ${th.name} theme`}
              >
                <ThemeSwatchDot style={{ background: th.bg }}>
                  <ThemeSwatchAccent style={{ background: th.accent }} />
                </ThemeSwatchDot>
                <ThemeSwatchName>{th.name}</ThemeSwatchName>
              </ThemeSwatch>
            )}
          </For>
        </ThemeSwatches>
      </ThemesSection>

      {/* DOWNLOAD */}
      <Section id="download">
        <SectionHeader>
          <SectionEyebrow>Get the app</SectionEyebrow>
          <SectionTitle>
            Gangio on every screen.<br />
            <Muted>Wherever you are.</Muted>
          </SectionTitle>
        </SectionHeader>

        <DownloadGrid>
          <PhoneCol>
            <Phone>
              <PhoneNotch />
              <PhoneScreen
                src={iosShot}
                alt="Gangio iOS app"
                loading="lazy"
              />
            </Phone>
          </PhoneCol>

          <DownloadCol>
            <Show when={isIOS()}>
              <IosBanner>
                <IosBannerHeader>
                  <IoLogoApple size={20} />
                  <strong>You're on iOS</strong>
                </IosBannerHeader>
                <p>
                  Join the public TestFlight beta to install Gangio on your
                  iPhone or iPad.
                </p>
                <a
                  class={primaryBtnLg()}
                  href={URLS.ios}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join TestFlight
                  <FiArrowUpRight size={18} />
                </a>
              </IosBanner>
            </Show>

            <DownloadList>
              <DownloadItem>
                <DownloadItemIcon>
                  <IoLogoApple size={22} />
                </DownloadItemIcon>
                <DownloadItemBody>
                  <DownloadItemTitle>iOS — TestFlight beta</DownloadItemTitle>
                  <DownloadItemDesc>
                    Public beta. Get early access on iPhone and iPad.
                  </DownloadItemDesc>
                </DownloadItemBody>
                <a
                  class={primaryBtn()}
                  href={URLS.ios}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join
                </a>
              </DownloadItem>

              <DownloadItem>
                <DownloadItemIcon>
                  <IoLogoMicrosoft size={20} />
                </DownloadItemIcon>
                <DownloadItemBody>
                  <DownloadItemTitle>Windows</DownloadItemTitle>
                  <DownloadItemDesc>
                    Native installer for Windows 10 and 11.
                  </DownloadItemDesc>
                </DownloadItemBody>
                <a
                  class={outlineBtn()}
                  href={URLS.windows}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </DownloadItem>

              <DownloadItem>
                <DownloadItemIcon>
                  <IoLogoApple size={22} />
                </DownloadItemIcon>
                <DownloadItemBody>
                  <DownloadItemTitle>macOS</DownloadItemTitle>
                  <DownloadItemDesc>
                    Universal DMG for Apple Silicon and Intel.
                  </DownloadItemDesc>
                </DownloadItemBody>
                <a
                  class={outlineBtn()}
                  href={URLS.macos}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </DownloadItem>

              <DownloadItem>
                <DownloadItemIcon>
                  <BiRegularGlobe size={20} />
                </DownloadItemIcon>
                <DownloadItemBody>
                  <DownloadItemTitle>Web</DownloadItemTitle>
                  <DownloadItemDesc>
                    Use Gangio in any modern browser — no install required.
                  </DownloadItemDesc>
                </DownloadItemBody>
                <a class={outlineBtn()} href={URLS.login}>
                  Open
                </a>
              </DownloadItem>
            </DownloadList>
          </DownloadCol>
        </DownloadGrid>
      </Section>

      {/* FINAL CTA */}
      <FinalSection>
        <FinalWrap>
          <FinalEyebrow>Ready?</FinalEyebrow>
          <FinalTitle>
            Find your <Accent>people.</Accent>
          </FinalTitle>
          <FinalLead>
            Create an account in seconds. Bring your friends. Build the place
            you've always wanted to hang out.
          </FinalLead>
          <CtaRow>
            <a class={primaryBtnLg()} href={URLS.signup}>
              Create your account
            </a>
            <a class={ghostBtnLg()} href="#download">
              Download for desktop
            </a>
          </CtaRow>
        </FinalWrap>
      </FinalSection>

      {/* FOOTER */}
      <Footer>
        <FooterTop>
          <FooterBrand>
            <Wordmark
              class={css({ height: "28px", width: "auto", color: "#0a0a0a" })}
            />
            <FooterTag>
              A free and open-source chat platform for communities.
            </FooterTag>
            <FooterBadges>
              <FooterBadge>
                <BiRegularLock size={12} /> Encrypted
              </FooterBadge>
              <FooterBadge>
                <BiRegularCode size={12} /> Open source
              </FooterBadge>
            </FooterBadges>
          </FooterBrand>

          <FooterCols>
            <FooterCol>
              <FooterColTitle>Product</FooterColTitle>
              <a href="#features">Features</a>
              <a href="#voice">Voice & video</a>
              <a href="#themes">Themes</a>
              <a href="#download">Download</a>
              <a href="/discover/servers">Discover</a>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Account</FooterColTitle>
              <a href={URLS.login}>Log in</a>
              <a href={URLS.signup}>Sign up</a>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Legal</FooterColTitle>
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Community</FooterColTitle>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </FooterCol>
          </FooterCols>
        </FooterTop>

        <FooterBottom>
          <span>© {new Date().getFullYear()} Gangio</span>
          <span>Made with care.</span>
        </FooterBottom>
      </Footer>
    </Root>
  );
}

/* ---------------- styles ---------------- */

/* base */

const Root = styled("div", {
  base: {
    width: "100%",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    background: "#ffffff",
    color: "#0a0a0a",
    fontFamily:
      "'Plus Jakarta Sans Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    fontSynthesis: "none",
  },
});

const Accent = styled("span", {
  base: { color: "#7c5cff" },
});

const Muted = styled("span", {
  base: { color: "#9a9a9a" },
});

/* nav */

const Nav = styled("header", {
  base: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(14px) saturate(180%)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
});

const NavInner = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    maxWidth: "1320px",
    margin: "0 auto",
    "@media (max-width: 768px)": { padding: "14px 20px" },
  },
});

const brandLink = () =>
  css({
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
  });

const NavLinks = styled("nav", {
  base: {
    display: "flex",
    gap: "28px",
    "& a": {
      color: "#555",
      textDecoration: "none",
      fontSize: "0.9rem",
      fontWeight: 500,
      transition: "color 0.15s",
      "&:hover": { color: "#0a0a0a" },
    },
    "@media (max-width: 960px)": { display: "none" },
  },
});

const NavCtas = styled("div", {
  base: { display: "flex", gap: "8px", alignItems: "center" },
});

/* buttons */

const ghostBtn = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 16px",
    borderRadius: "10px",
    color: "#0a0a0a",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 600,
    transition: "background 0.15s",
    "&:hover": { background: "rgba(0,0,0,0.05)" },
  });

const primaryBtn = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 18px",
    borderRadius: "10px",
    background: "#0a0a0a",
    color: "#fff",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 700,
    transition: "transform 0.15s, background 0.15s",
    "&:hover": { background: "#1a1a1a", transform: "translateY(-1px)" },
  });

const outlineBtn = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "9px 16px",
    borderRadius: "10px",
    color: "#0a0a0a",
    textDecoration: "none",
    fontSize: "0.88rem",
    fontWeight: 600,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    transition: "all 0.15s",
    "&:hover": {
      background: "#0a0a0a",
      color: "#fff",
      borderColor: "#0a0a0a",
    },
  });

const primaryBtnLg = () =>
  cx(
    primaryBtn(),
    css({
      padding: "14px 24px",
      fontSize: "0.98rem",
      borderRadius: "12px",
    }),
  );

const ghostBtnLg = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "14px 24px",
    borderRadius: "12px",
    color: "#0a0a0a",
    textDecoration: "none",
    fontSize: "0.98rem",
    fontWeight: 600,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    transition: "all 0.15s",
    "&:hover": {
      background: "rgba(0,0,0,0.04)",
      borderColor: "rgba(0,0,0,0.22)",
    },
  });

/* hero */

const Hero = styled("section", {
  base: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1fr 1.1fr",
    gap: "56px",
    alignItems: "center",
    padding: "96px 32px 80px",
    maxWidth: "1320px",
    margin: "0 auto",
    "@media (max-width: 1024px)": {
      gridTemplateColumns: "1fr",
      padding: "64px 24px 56px",
      gap: "48px",
    },
  },
});

const HeroCopy = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
});

const Eyebrow = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#555",
    fontSize: "0.88rem",
    flexWrap: "wrap",
  },
});

const Pill = styled("span", {
  base: {
    padding: "3px 10px",
    borderRadius: "999px",
    background: "#0a0a0a",
    color: "#fff",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
});

const H1 = styled("h1", {
  base: {
    fontSize: "clamp(3rem, 7vw, 6rem)",
    fontWeight: 800,
    lineHeight: 0.96,
    letterSpacing: "-0.045em",
    margin: 0,
  },
});

const Sub = styled("p", {
  base: {
    fontSize: "1.15rem",
    color: "#555",
    lineHeight: 1.5,
    maxWidth: "520px",
    margin: 0,
  },
});

const CtaRow = styled("div", {
  base: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "6px",
  },
});

const TrustRow = styled("div", {
  base: {
    display: "flex",
    gap: "22px",
    flexWrap: "wrap",
    marginTop: "14px",
    color: "#777",
    fontSize: "0.85rem",
  },
});

const TrustItem = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    "& svg": { color: "#0a0a0a" },
  },
});

const HeroShot = styled("div", {
  base: {
    position: "relative",
    width: "100%",
  },
});

const HeroShotFrame = styled("div", {
  base: {
    width: "100%",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow:
      "0 40px 80px -20px rgba(0,0,0,0.18), 0 8px 24px -8px rgba(0,0,0,0.08)",
    background: "#f5f5f5",
  },
});

/* big statement */

const BigStatement = styled("section", {
  base: {
    padding: "120px 32px",
    maxWidth: "1100px",
    margin: "0 auto",
    textAlign: "left",
    "@media (max-width: 768px)": { padding: "80px 24px" },
  },
});

const BigStatementText = styled("h2", {
  base: {
    fontSize: "clamp(2.5rem, 7vw, 6rem)",
    fontWeight: 800,
    lineHeight: 0.98,
    letterSpacing: "-0.045em",
    margin: 0,
    maxWidth: "14ch",
  },
});

const BigStatementSub = styled("p", {
  base: {
    marginTop: "28px",
    fontSize: "1.15rem",
    color: "#555",
    lineHeight: 1.5,
    maxWidth: "540px",
  },
});

/* dark section (voice) */

const DarkSection = styled("section", {
  base: {
    background: "#0a0a0a",
    color: "#fff",
    padding: "128px 32px",
    "@media (max-width: 768px)": { padding: "80px 24px" },
  },
});

const VoiceGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "72px",
    alignItems: "center",
    maxWidth: "1280px",
    margin: "0 auto",
    "@media (max-width: 1024px)": {
      gridTemplateColumns: "1fr",
      gap: "56px",
    },
  },
});

const VoiceCopy = styled("div", {
  base: { display: "flex", flexDirection: "column", gap: "20px" },
});

const VoiceTitle = styled("h2", {
  base: {
    fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
    fontWeight: 800,
    lineHeight: 0.96,
    letterSpacing: "-0.04em",
    margin: 0,
  },
});

const VoiceLead = styled("p", {
  base: {
    fontSize: "1.1rem",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.55,
    maxWidth: "520px",
    margin: 0,
  },
});

const VoiceFeatures = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginTop: "16px",
  },
});

const VoiceFeature = styled("div", {
  base: {
    paddingTop: "20px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
});

const VoiceFeatureTitle = styled("h3", {
  base: {
    fontSize: "1.1rem",
    fontWeight: 700,
    margin: 0,
  },
});

const VoiceFeatureDesc = styled("p", {
  base: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "0.95rem",
    lineHeight: 1.55,
    margin: 0,
    maxWidth: "480px",
  },
});

const VoiceVisual = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridTemplateRows: "auto auto",
    gap: "14px",
    "@media (max-width: 540px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

const VoiceTile = styled("div", {
  base: {
    position: "relative",
    aspectRatio: "4 / 3",
    borderRadius: "16px",
    background: "#15161d",
    border: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "20px",
    overflow: "hidden",
    "&[data-share='true']": {
      gridColumn: "1 / -1",
      aspectRatio: "16 / 7",
      background:
        "repeating-linear-gradient(45deg, #1a1b24 0, #1a1b24 10px, #15161d 10px, #15161d 20px)",
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },
  },
});

const VoiceAvatar = styled("div", {
  base: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: "#fff",
  },
});

const VoiceName = styled("div", {
  base: {
    fontWeight: 700,
    fontSize: "0.95rem",
  },
});

const VoiceWave = styled("div", {
  base: {
    display: "flex",
    alignItems: "flex-end",
    gap: "3px",
    height: "18px",
  },
});

const WaveBar = styled("span", {
  base: {
    width: "3px",
    height: "var(--h)",
    background: "#7c5cff",
    borderRadius: "2px",
    animation: "landing-wave 1s ease-in-out infinite",
    "&:nth-child(2)": { animationDelay: "0.1s" },
    "&:nth-child(3)": { animationDelay: "0.2s" },
    "&:nth-child(4)": { animationDelay: "0.3s" },
    "&:nth-child(5)": { animationDelay: "0.4s" },
  },
});

const VoiceBadge = styled("div", {
  base: {
    fontSize: "0.72rem",
    padding: "3px 10px",
    borderRadius: "999px",
    background: "rgba(124,92,255,0.18)",
    color: "#c4b5fd",
    fontWeight: 600,
    "&[data-muted]": {
      background: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.6)",
    },
  },
});

const VoiceShareLabel = styled("div", {
  base: {
    fontSize: "0.72rem",
    padding: "4px 10px",
    borderRadius: "6px",
    background: "rgba(124,92,255,0.2)",
    color: "#c4b5fd",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
});

const VoiceShareInner = styled("div", {
  base: {
    display: "flex",
    gap: "6px",
    marginTop: "auto",
  },
});

const VoiceShareDot = styled("span", {
  base: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
});

/* sections */

const Section = styled("section", {
  base: {
    padding: "128px 32px",
    maxWidth: "1280px",
    margin: "0 auto",
    "@media (max-width: 768px)": { padding: "80px 24px" },
  },
});

const SectionHeader = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginBottom: "64px",
    maxWidth: "720px",
  },
});

const SectionEyebrow = styled("div", {
  base: {
    color: "#7c5cff",
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
  },
});

const SectionTitle = styled("h2", {
  base: {
    fontSize: "clamp(2.25rem, 5.5vw, 4.25rem)",
    fontWeight: 800,
    lineHeight: 0.98,
    letterSpacing: "-0.04em",
    margin: 0,
  },
});

const SectionLead = styled("p", {
  base: {
    fontSize: "1.05rem",
    color: "#555",
    lineHeight: 1.6,
    margin: 0,
    maxWidth: "560px",
  },
});

/* feature grid */

const FeatureGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1px",
    background: "rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "20px",
    overflow: "hidden",
    "@media (max-width: 720px)": {
      gridTemplateColumns: "1fr",
    },
  },
});

const FeatureCard = styled("div", {
  base: {
    padding: "40px 36px",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minHeight: "220px",
    transition: "background 0.2s",
    "&:hover": { background: "#fafaf7" },
    "@media (max-width: 540px)": { padding: "32px 28px" },
  },
});

const FeatureNum = styled("div", {
  base: {
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#7c5cff",
    letterSpacing: "0.1em",
    marginBottom: "8px",
  },
});

const FeatureTitle = styled("h3", {
  base: {
    fontSize: "1.35rem",
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.015em",
  },
});

const FeatureDesc = styled("p", {
  base: {
    color: "#555",
    lineHeight: 1.6,
    fontSize: "0.98rem",
    margin: 0,
    maxWidth: "440px",
  },
});

/* themes */

const ThemesSection = styled("section", {
  base: {
    padding: "128px 32px",
    maxWidth: "1280px",
    margin: "0 auto",
    "@media (max-width: 768px)": { padding: "80px 24px" },
  },
});

const ThemesHeader = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginBottom: "48px",
    maxWidth: "720px",
  },
});

const ThemePreview = styled("div", {
  base: {
    width: "100%",
    borderRadius: "20px",
    border: "1px solid rgba(0,0,0,0.08)",
    overflow: "hidden",
    transition: "background 0.4s, color 0.4s",
    boxShadow:
      "0 30px 60px -20px rgba(0,0,0,0.15), 0 8px 20px -6px rgba(0,0,0,0.06)",
  },
});

const ThemePreviewBody = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "64px 180px 1fr",
    minHeight: "300px",
    "@media (max-width: 640px)": {
      gridTemplateColumns: "56px 1fr",
      "& > :nth-child(2)": { display: "none" },
    },
  },
});

const ThemePreviewSidebar = styled("div", {
  base: {
    padding: "14px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderRight: "1px solid",
  },
});

const ThemePreviewServer = styled("div", {
  base: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: "#fff",
    fontSize: "0.9rem",
  },
});

const ThemePreviewChannels = styled("div", {
  base: {
    padding: "16px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    borderRight: "1px solid",
  },
});

const ThemePreviewLabel = styled("div", {
  base: {
    fontSize: "0.62rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    padding: "8px 10px 4px",
  },
});

const ThemePreviewChannel = styled("div", {
  base: {
    padding: "7px 10px",
    borderRadius: "6px",
    fontSize: "0.82rem",
    fontWeight: 500,
    transition: "all 0.3s",
  },
});

const ThemePreviewMain = styled("div", {
  base: {
    padding: "22px 26px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
});

const ThemePreviewMessage = styled("div", {
  base: { display: "flex", gap: "12px", alignItems: "flex-start" },
});

const ThemePreviewAvatar = styled("div", {
  base: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    flexShrink: 0,
    transition: "background 0.3s",
  },
});

const ThemePreviewMessageBody = styled("div", {
  base: { display: "flex", flexDirection: "column", gap: "2px" },
});

const ThemePreviewName = styled("div", {
  base: {
    fontWeight: 700,
    fontSize: "0.88rem",
    transition: "color 0.3s",
  },
});

const ThemePreviewText = styled("div", {
  base: {
    fontSize: "0.85rem",
    transition: "color 0.3s",
  },
});

const ThemeSwatches = styled("div", {
  base: {
    display: "flex",
    gap: "12px",
    marginTop: "32px",
    flexWrap: "wrap",
  },
});

const ThemeSwatch = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 14px 8px 8px",
    borderRadius: "999px",
    border: "1px solid rgba(0,0,0,0.1)",
    background: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
    "&:hover": { borderColor: "rgba(0,0,0,0.25)" },
    "&[data-active='true']": {
      background: "#0a0a0a",
      borderColor: "#0a0a0a",
      color: "#fff",
    },
  },
});

const ThemeSwatchDot = styled("span", {
  base: {
    position: "relative",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.1)",
  },
});

const ThemeSwatchAccent = styled("span", {
  base: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "50%",
  },
});

const ThemeSwatchName = styled("span", {
  base: {
    fontSize: "0.85rem",
    fontWeight: 600,
  },
});

/* download */

const DownloadGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 360px) 1fr",
    gap: "64px",
    alignItems: "center",
    "@media (max-width: 900px)": {
      gridTemplateColumns: "1fr",
      gap: "48px",
      justifyItems: "center",
    },
  },
});

const PhoneCol = styled("div", {
  base: { display: "flex", justifyContent: "center" },
});

const Phone = styled("div", {
  base: {
    position: "relative",
    width: "100%",
    maxWidth: "300px",
    aspectRatio: "9 / 19.5",
    borderRadius: "44px",
    padding: "12px",
    background: "linear-gradient(180deg, #2a2c38 0%, #15161d 100%)",
    boxShadow:
      "0 40px 80px -20px rgba(124,92,255,0.3), 0 30px 70px -20px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)",
  },
});

const PhoneNotch = styled("div", {
  base: {
    position: "absolute",
    top: "22px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "96px",
    height: "26px",
    borderRadius: "20px",
    background: "#000",
    zIndex: 2,
  },
});

const PhoneScreen = styled("img", {
  base: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "32px",
    display: "block",
    background: "#0a0a0f",
  },
});

const DownloadCol = styled("div", {
  base: { display: "flex", flexDirection: "column", gap: "20px", width: "100%" },
});

const IosBanner = styled("div", {
  base: {
    padding: "20px 22px",
    borderRadius: "16px",
    background: "#0a0a0a",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    "& p": {
      margin: 0,
      color: "rgba(255,255,255,0.7)",
      fontSize: "0.95rem",
      lineHeight: 1.5,
    },
    "& a": {
      width: "fit-content",
      background: "#fff",
      color: "#0a0a0a",
      "&:hover": { background: "#ececf4" },
    },
  },
});

const IosBannerHeader = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.95rem",
  },
});

const DownloadList = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    background: "rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "16px",
    overflow: "hidden",
  },
});

const DownloadItem = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px 22px",
    background: "#fff",
    transition: "background 0.15s",
    "&:hover": { background: "#fafaf7" },
    "@media (max-width: 540px)": { padding: "16px 18px", gap: "12px" },
  },
});

const DownloadItemIcon = styled("div", {
  base: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "grid",
    placeItems: "center",
    background: "#f5f5f0",
    border: "1px solid rgba(0,0,0,0.06)",
    color: "#0a0a0a",
    flexShrink: 0,
  },
});

const DownloadItemBody = styled("div", {
  base: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" },
});

const DownloadItemTitle = styled("div", {
  base: { fontWeight: 700, fontSize: "0.98rem" },
});

const DownloadItemDesc = styled("div", {
  base: { fontSize: "0.85rem", color: "#666" },
});

/* final cta */

const FinalSection = styled("section", {
  base: {
    background: "#0a0a0a",
    color: "#fff",
    padding: "140px 32px",
    "@media (max-width: 768px)": { padding: "88px 24px" },
  },
});

const FinalWrap = styled("div", {
  base: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
});

const FinalEyebrow = styled("div", {
  base: {
    color: "#c4b5fd",
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
  },
});

const FinalTitle = styled("h2", {
  base: {
    fontSize: "clamp(2.75rem, 7vw, 6rem)",
    fontWeight: 800,
    lineHeight: 0.96,
    letterSpacing: "-0.045em",
    margin: 0,
  },
});

const FinalLead = styled("p", {
  base: {
    color: "rgba(255,255,255,0.65)",
    fontSize: "1.1rem",
    lineHeight: 1.55,
    maxWidth: "540px",
    margin: 0,
  },
});

/* footer */

const Footer = styled("footer", {
  base: {
    padding: "64px 32px 32px",
    maxWidth: "1320px",
    margin: "0 auto",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    "@media (max-width: 768px)": { padding: "48px 24px 24px" },
  },
});

const FooterTop = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "1.3fr 2fr",
    gap: "48px",
    paddingBottom: "48px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr", gap: "40px" },
  },
});

const FooterBrand = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    maxWidth: "340px",
  },
});

const FooterTag = styled("p", {
  base: {
    color: "#666",
    fontSize: "0.92rem",
    lineHeight: 1.55,
    margin: 0,
  },
});

const FooterBadges = styled("div", {
  base: { display: "flex", gap: "8px", marginTop: "4px", flexWrap: "wrap" },
});

const FooterBadge = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 10px",
    borderRadius: "999px",
    background: "#f5f5f0",
    border: "1px solid rgba(0,0,0,0.06)",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#333",
  },
});

const FooterCols = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
    "@media (max-width: 640px)": { gridTemplateColumns: "repeat(2, 1fr)" },
  },
});

const FooterCol = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    "& a": {
      color: "#555",
      textDecoration: "none",
      fontSize: "0.88rem",
      transition: "color 0.15s",
      "&:hover": { color: "#0a0a0a" },
    },
  },
});

const FooterColTitle = styled("div", {
  base: {
    color: "#0a0a0a",
    fontSize: "0.76rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "4px",
  },
});

const FooterBottom = styled("div", {
  base: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "24px",
    color: "#888",
    fontSize: "0.85rem",
    "@media (max-width: 540px)": {
      flexDirection: "column",
      gap: "8px",
      alignItems: "flex-start",
    },
  },
});
