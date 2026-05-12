import {
  For,
  Show,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

import gsap from "gsap";
import {
  BiRegularBot,
  BiRegularChat,
  BiRegularCode,
  BiRegularGlobe,
  BiRegularHash,
  BiRegularMicrophone,
  BiRegularPalette,
  BiRegularShield,
  BiSolidBolt,
  BiSolidVolumeFull,
} from "solid-icons/bi";
import {
  HiOutlineArrowRight,
  HiOutlineLockClosed,
  HiOutlineSparkles,
} from "solid-icons/hi";
import { IoLogoApple, IoLogoMicrosoft } from "solid-icons/io";
import { css, cx } from "styled-system/css";
import { styled } from "styled-system/jsx";

import Wordmark from "../../public/assets/web/wordmark.svg?component-solid";
import iosScreenshot from "../../assets/web/landing/ios.webp";

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

type ChatMessage = {
  user: string;
  color: string;
  time: string;
  text: string;
};

const CHANNELS: Record<
  string,
  { name: string; topic: string; messages: ChatMessage[] }
> = {
  announcements: {
    name: "announcements",
    topic: "Server-wide announcements and updates.",
    messages: [
      {
        user: "luna",
        color: "#7c5cff",
        time: "just now",
        text: "Welcome to the new server everyone.",
      },
      {
        user: "kai",
        color: "#22d3ee",
        time: "2m",
        text: "this looks insanely clean.",
      },
      {
        user: "nova",
        color: "#f472b6",
        time: "4m",
        text: "Finally, a chat app that respects us.",
      },
    ],
  },
  general: {
    name: "general",
    topic: "Hang out, chat, anything goes.",
    messages: [
      {
        user: "finn",
        color: "#34d399",
        time: "1m",
        text: "morning gang 🌅",
      },
      {
        user: "rae",
        color: "#fbbf24",
        time: "3m",
        text: "anyone up for a movie night later?",
      },
      {
        user: "luna",
        color: "#7c5cff",
        time: "5m",
        text: "yes please. bringing snacks.",
      },
    ],
  },
  "off-topic": {
    name: "off-topic",
    topic: "Memes, side quests, off-the-wall takes.",
    messages: [
      {
        user: "nova",
        color: "#f472b6",
        time: "just now",
        text: "hot take: pineapple does belong on pizza",
      },
      {
        user: "kai",
        color: "#22d3ee",
        time: "1m",
        text: "you're banned",
      },
      {
        user: "finn",
        color: "#34d399",
        time: "2m",
        text: "i'm with nova on this one",
      },
    ],
  },
  showcase: {
    name: "showcase",
    topic: "Share what you're working on.",
    messages: [
      {
        user: "rae",
        color: "#fbbf24",
        time: "6m",
        text: "shipped the new landing today 🚀",
      },
      {
        user: "luna",
        color: "#7c5cff",
        time: "8m",
        text: "the gradient on this is *chef's kiss*",
      },
    ],
  },
};

const CHANNEL_ORDER = ["announcements", "general", "off-topic", "showcase"];

/* ---------------- component ---------------- */

export function Landing() {
  let rootRef: HTMLDivElement | undefined;

  const [activeChannel, setActiveChannel] = createSignal("announcements");

  const isIOS = createMemo(() =>
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent),
  );

  onMount(() => {
    if (!rootRef) return;

    const ctx = gsap.context(() => {
      gsap.from("[data-anim='hero-item']", {
        y: 24,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.07,
        delay: 0.05,
      });

      gsap.from("[data-anim='hero-mock']", {
        y: 36,
        opacity: 0,
        duration: 1.0,
        ease: "power3.out",
        delay: 0.3,
      });

      gsap.to("[data-anim='hero-mock']", {
        y: -8,
        duration: 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.2,
      });

      gsap.to("[data-anim='glow']", {
        x: 40,
        duration: 16,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    }, rootRef);

    onCleanup(() => ctx.revert());
  });

  const ch = () => CHANNELS[activeChannel()];

  return (
    <Root ref={rootRef}>
      <BackgroundLayer />
      <Grid />

      <Nav>
        <NavInner>
          <a href="/" class={brandLink()}>
            <Wordmark
              class={css({
                height: "26px",
                width: "auto",
                color: "#fff",
              })}
            />
          </a>
          <NavLinks>
            <a href="#features">Features</a>
            <a href="#why">Why Gangio</a>
            <a href="/discover/servers">Discover</a>
            <a href="#download">Download</a>
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
        <Glow data-anim="glow" />

        <HeroContent>
          <Eyebrow data-anim="hero-item">
            <HiOutlineSparkles size={14} />
            <span>A new home for your community</span>
          </Eyebrow>

          <H1 data-anim="hero-item">
            Your space.<br />
            <Gradient>Your community.</Gradient>
          </H1>

          <Sub data-anim="hero-item">
            Gangio is a free and open-source chat platform for friends, groups,
            and communities. Voice, video, and text — built the way you always
            wished it would be.
          </Sub>

          <CtaRow data-anim="hero-item">
            <a class={primaryBtnLg()} href={URLS.signup}>
              Get started
              <HiOutlineArrowRight size={18} />
            </a>
            <a class={ghostBtnLg()} href={URLS.login}>
              Open in browser
            </a>
          </CtaRow>

          <TrustRow data-anim="hero-item">
            <TrustItem>
              <HiOutlineLockClosed size={14} />
              <span>Encrypted DMs</span>
            </TrustItem>
            <TrustItem>
              <BiRegularCode size={14} />
              <span>Open source</span>
            </TrustItem>
            <TrustItem>
              <BiRegularGlobe size={14} />
              <span>Self-hostable</span>
            </TrustItem>
          </TrustRow>
        </HeroContent>

        <HeroMock data-anim="hero-mock">
          <MockChrome>
            <MockDot style={{ background: "#ff5f57" }} />
            <MockDot style={{ background: "#febc2e" }} />
            <MockDot style={{ background: "#28c840" }} />
            <MockChromeAddress>gangio.pro</MockChromeAddress>
          </MockChrome>
          <MockBody>
            <MockSidebar>
              <MockServer data-active>G</MockServer>
              <MockServer style={{ background: "#3b3f4d" }} />
              <MockServer style={{ background: "#3b3f4d" }} />
              <MockServer style={{ background: "#3b3f4d" }} />
              <MockServer style={{ background: "#3b3f4d" }} />
            </MockSidebar>
            <MockChannels>
              <MockServerName>
                <strong>Gangio Official</strong>
              </MockServerName>
              <MockChannelHeader>text channels</MockChannelHeader>
              <For each={CHANNEL_ORDER}>
                {(key) => (
                  <MockChannel
                    type="button"
                    data-active={activeChannel() === key ? "true" : undefined}
                    onClick={() => setActiveChannel(key)}
                  >
                    <BiRegularHash size={13} />
                    {CHANNELS[key].name}
                  </MockChannel>
                )}
              </For>
              <MockChannelHeader>voice channels</MockChannelHeader>
              <MockChannel type="button" disabled>
                <BiSolidVolumeFull size={13} />
                Lounge
                <MockVoiceCount>3</MockVoiceCount>
              </MockChannel>
            </MockChannels>
            <MockMain>
              <MockMainHeader>
                <BiRegularHash size={16} />
                <strong>{ch().name}</strong>
                <MockTopic>{ch().topic}</MockTopic>
              </MockMainHeader>
              <MockMessages>
                <For each={ch().messages}>
                  {(m) => (
                    <MockMessage>
                      <MockAvatar style={{ background: m.color }} />
                      <MockMessageBody>
                        <MockMeta>
                          <MockName>{m.user}</MockName>
                          <MockTime>{m.time}</MockTime>
                        </MockMeta>
                        <MockText>{m.text}</MockText>
                      </MockMessageBody>
                    </MockMessage>
                  )}
                </For>
                <MockTyping>
                  <MockTypingDot />
                  <MockTypingDot style={{ "animation-delay": "0.15s" }} />
                  <MockTypingDot style={{ "animation-delay": "0.3s" }} />
                  <span>someone is typing…</span>
                </MockTyping>
              </MockMessages>
            </MockMain>
          </MockBody>
        </HeroMock>
      </Hero>

      <Divider />

      {/* FEATURES */}
      <Section id="features">
        <SectionHeader>
          <SectionEyebrow>What's inside</SectionEyebrow>
          <SectionTitle>
            Everything you need.<br />
            <SectionTitleMuted>Nothing you don't.</SectionTitleMuted>
          </SectionTitle>
          <SectionLead>
            All the features you've come to expect — built thoughtfully, without
            the bloat, the ads, or the data harvesting.
          </SectionLead>
        </SectionHeader>

        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon>
              <BiRegularChat size={22} />
            </FeatureIcon>
            <FeatureTitle>Messaging that feels right</FeatureTitle>
            <FeatureDesc>
              Markdown, code blocks, embeds, threads, reactions, and search.
              DMs, group chats, and full server channels.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <BiRegularMicrophone size={22} />
            </FeatureIcon>
            <FeatureTitle>Voice and video</FeatureTitle>
            <FeatureDesc>
              Crystal-clear, low-latency voice with screen sharing, noise
              suppression, and echo cancellation.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <BiRegularShield size={22} />
            </FeatureIcon>
            <FeatureTitle>Moderation, done right</FeatureTitle>
            <FeatureDesc>
              Granular roles, audit logs, and powerful permissions. Run a
              server of three or three thousand — same tools, no upsells.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <BiRegularPalette size={22} />
            </FeatureIcon>
            <FeatureTitle>Make it yours</FeatureTitle>
            <FeatureDesc>
              Custom emojis, themes, and CSS. Set a profile banner without
              paying for it. The little things matter.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <BiRegularBot size={22} />
            </FeatureIcon>
            <FeatureTitle>Bots and a real API</FeatureTitle>
            <FeatureDesc>
              A first-class public API and bot platform — the same one we use
              to build the official apps.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>
              <BiSolidBolt size={22} />
            </FeatureIcon>
            <FeatureTitle>Fast everywhere</FeatureTitle>
            <FeatureDesc>
              Native desktop, mobile, and web. Built on SolidJS for instant
              interactions and tiny bundles.
            </FeatureDesc>
          </FeatureCard>
        </FeatureGrid>
      </Section>

      {/* WHY */}
      <Section id="why">
        <SectionHeader>
          <SectionEyebrow>Why Gangio</SectionEyebrow>
          <SectionTitle>
            Answers to you,{" "}
            <SectionTitleMuted>not investors.</SectionTitleMuted>
          </SectionTitle>
        </SectionHeader>

        <WhyGrid>
          <WhyCard>
            <WhyTitle>No ads. No tracking. No upsells.</WhyTitle>
            <WhyDesc>
              We don't sell your data and we never will. The privacy policy is
              short enough to actually read.
            </WhyDesc>
          </WhyCard>
          <WhyCard>
            <WhyTitle>Free and open source.</WhyTitle>
            <WhyDesc>
              The whole stack is public. Audit it, fork it, host it on your own
              hardware. It's yours.
            </WhyDesc>
          </WhyCard>
          <WhyCard>
            <WhyTitle>Built for the long term.</WhyTitle>
            <WhyDesc>
              No board to please. Every decision starts and ends with the
              people actually using the software.
            </WhyDesc>
          </WhyCard>
          <WhyCard>
            <WhyTitle>Take it everywhere.</WhyTitle>
            <WhyDesc>
              Your account, conversations, and settings stay in sync across
              every device — Windows, macOS, iOS, and the web.
            </WhyDesc>
          </WhyCard>
        </WhyGrid>
      </Section>

      {/* DOWNLOAD */}
      <Section id="download">
        <SectionHeader>
          <SectionEyebrow>Get the app</SectionEyebrow>
          <SectionTitle>
            Gangio on every screen.{" "}
            <SectionTitleMuted>Wherever you are.</SectionTitleMuted>
          </SectionTitle>
          <SectionLead>
            One account, everywhere. Native apps for desktop and iOS, plus a
            fast web client.
          </SectionLead>
        </SectionHeader>

        <DownloadGrid>
          {/* Phone mockup with iOS screenshot */}
          <PhoneCol>
            <Phone>
              <PhoneNotch />
              <PhoneScreen
                src={iosScreenshot}
                alt="Gangio iOS app"
                loading="lazy"
              />
              <PhoneSide data-side="right" />
              <PhoneSide data-side="left-1" />
              <PhoneSide data-side="left-2" />
              <PhoneSide data-side="left-3" />
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
                  <HiOutlineArrowRight size={18} />
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
                  <DownloadItemDesc>Native installer for Windows 10 and 11.</DownloadItemDesc>
                </DownloadItemBody>
                <a
                  class={ghostBtnSm()}
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
                  <DownloadItemDesc>Universal DMG for Apple Silicon and Intel.</DownloadItemDesc>
                </DownloadItemBody>
                <a
                  class={ghostBtnSm()}
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
                <a class={ghostBtnSm()} href={URLS.login}>
                  Open
                </a>
              </DownloadItem>
            </DownloadList>
          </DownloadCol>
        </DownloadGrid>
      </Section>

      {/* FINAL CTA */}
      <Section>
        <FinalCta>
          <FinalCtaInner>
            <SectionEyebrow>Ready when you are</SectionEyebrow>
            <FinalTitle>Find your people.</FinalTitle>
            <FinalLead>
              Create an account in seconds. Bring your friends. Build the place
              you've always wanted to hang out.
            </FinalLead>
            <CtaRow>
              <a class={primaryBtnLg()} href={URLS.signup}>
                Get started
                <HiOutlineArrowRight size={18} />
              </a>
              <a class={ghostBtnLg()} href="#download">
                Download for desktop
              </a>
            </CtaRow>
          </FinalCtaInner>
        </FinalCta>
      </Section>

      <Footer>
        <FooterTop>
          <FooterBrand>
            <Wordmark
              class={css({ height: "30px", width: "auto", color: "#fff" })}
            />
            <FooterTag>
              A free and open-source chat platform for communities.
            </FooterTag>
          </FooterBrand>

          <FooterCols>
            <FooterCol>
              <FooterColTitle>Product</FooterColTitle>
              <a href="#features">Features</a>
              <a href="/discover/servers">Discover</a>
              <a href="#download">Download</a>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Account</FooterColTitle>
              <a href={URLS.login}>Log in</a>
              <a href={URLS.signup}>Sign up</a>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Legal</FooterColTitle>
              <a href="/terms">Terms of Service</a>
              <a href="/privacy">Privacy Policy</a>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Connect</FooterColTitle>
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

const Root = styled("div", {
  base: {
    position: "relative",
    width: "100%",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    background: "#0c0d12",
    color: "#fff",
    fontFamily:
      "'Plus Jakarta Sans Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  },
});

const BackgroundLayer = styled("div", {
  base: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(124,92,255,0.18), transparent 60%), linear-gradient(180deg, #0c0d12 0%, #0a0b10 100%)",
    pointerEvents: "none",
    zIndex: 0,
  },
});

const Grid = styled("div", {
  base: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    maskImage:
      "radial-gradient(ellipse 70% 50% at 50% 0%, black, transparent 70%)",
    WebkitMaskImage:
      "radial-gradient(ellipse 70% 50% at 50% 0%, black, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
});

const Nav = styled("header", {
  base: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(14px) saturate(180%)",
    background: "rgba(12, 13, 18, 0.65)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
});

const NavInner = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 32px",
    maxWidth: "1280px",
    margin: "0 auto",
    "@media (max-width: 768px)": { padding: "12px 20px" },
  },
});

const brandLink = () =>
  css({
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    color: "#fff",
  });

const NavLinks = styled("nav", {
  base: {
    display: "flex",
    gap: "30px",
    "& a": {
      color: "rgba(255,255,255,0.68)",
      textDecoration: "none",
      fontSize: "0.9rem",
      fontWeight: 500,
      transition: "color 0.2s",
      "&:hover": { color: "#fff" },
    },
    "@media (max-width: 900px)": { display: "none" },
  },
});

const NavCtas = styled("div", {
  base: { display: "flex", gap: "8px", alignItems: "center" },
});

const ghostBtn = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "10px",
    color: "#fff",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 600,
    transition: "background 0.2s",
    "&:hover": { background: "rgba(255,255,255,0.06)" },
  });

const ghostBtnSm = () =>
  cx(
    ghostBtn(),
    css({
      padding: "8px 14px",
      fontSize: "0.85rem",
      border: "1px solid rgba(255,255,255,0.12)",
      "&:hover": {
        background: "rgba(255,255,255,0.06)",
        borderColor: "rgba(255,255,255,0.22)",
      },
    }),
  );

const primaryBtn = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    borderRadius: "10px",
    background: "#fff",
    color: "#0a0a0f",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 700,
    transition: "transform 0.15s, background 0.15s, box-shadow 0.15s",
    boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset",
    "&:hover": {
      background: "#ececf4",
      transform: "translateY(-1px)",
    },
  });

const primaryBtnLg = () =>
  cx(
    primaryBtn(),
    css({
      padding: "13px 22px",
      fontSize: "0.95rem",
      borderRadius: "12px",
    }),
  );

const ghostBtnLg = () =>
  cx(
    ghostBtn(),
    css({
      padding: "13px 22px",
      fontSize: "0.95rem",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.14)",
      "&:hover": {
        background: "rgba(255,255,255,0.06)",
        borderColor: "rgba(255,255,255,0.22)",
      },
    }),
  );

const Hero = styled("section", {
  base: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1.05fr 1fr",
    gap: "56px",
    alignItems: "center",
    padding: "96px 32px 112px",
    maxWidth: "1280px",
    margin: "0 auto",
    zIndex: 1,
    "@media (max-width: 1024px)": {
      gridTemplateColumns: "1fr",
      padding: "64px 24px 80px",
      gap: "56px",
    },
  },
});

const Glow = styled("div", {
  base: {
    position: "absolute",
    top: "-120px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "1100px",
    height: "560px",
    background:
      "radial-gradient(closest-side, rgba(124,92,255,0.4), transparent 70%)",
    filter: "blur(20px)",
    pointerEvents: "none",
    zIndex: 0,
  },
});

const HeroContent = styled("div", {
  base: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
});

const Eyebrow = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    width: "fit-content",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.85)",
    fontSize: "0.8rem",
    fontWeight: 500,
  },
});

const H1 = styled("h1", {
  base: {
    fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
    fontWeight: 800,
    lineHeight: 1.02,
    letterSpacing: "-0.035em",
    margin: 0,
  },
});

const Gradient = styled("span", {
  base: {
    background:
      "linear-gradient(135deg, #c4b5fd 0%, #7c5cff 45%, #5865f2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
});

const Sub = styled("p", {
  base: {
    fontSize: "1.1rem",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.55,
    maxWidth: "540px",
    margin: 0,
  },
});

const CtaRow = styled("div", {
  base: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "8px",
  },
});

const TrustRow = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginTop: "16px",
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.82rem",
  },
});

const TrustItem = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
});

/* ---- desktop mock ---- */

const HeroMock = styled("div", {
  base: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    aspectRatio: "5 / 4",
    borderRadius: "14px",
    background: "linear-gradient(180deg, #14161f 0%, #0f1118 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow:
      "0 50px 120px -30px rgba(0,0,0,0.65), 0 0 0 1px rgba(124,92,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
});

const MockChrome = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(0,0,0,0.25)",
  },
});

const MockDot = styled("div", {
  base: { width: "11px", height: "11px", borderRadius: "50%" },
});

const MockChromeAddress = styled("div", {
  base: {
    marginLeft: "auto",
    marginRight: "auto",
    fontSize: "0.74rem",
    color: "rgba(255,255,255,0.4)",
    fontFamily: "ui-monospace, SFMono-Regular, monospace",
  },
});

const MockBody = styled("div", {
  base: { display: "flex", flex: 1, minHeight: 0 },
});

const MockSidebar = styled("div", {
  base: {
    width: "56px",
    padding: "12px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    borderRight: "1px solid rgba(255,255,255,0.04)",
    background: "rgba(0,0,0,0.25)",
  },
});

const MockServer = styled("div", {
  base: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.06)",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: "rgba(255,255,255,0.55)",
    fontSize: "0.9rem",
    transition: "all 0.2s",
    "&[data-active='true']": {
      background: "linear-gradient(135deg,#7c5cff,#5865f2)",
      color: "#fff",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(124,92,255,0.45)",
    },
  },
});

const MockChannels = styled("div", {
  base: {
    width: "170px",
    padding: "12px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    borderRight: "1px solid rgba(255,255,255,0.04)",
    background: "rgba(255,255,255,0.015)",
    "@media (max-width: 540px)": { display: "none" },
  },
});

const MockServerName = styled("div", {
  base: {
    fontSize: "0.84rem",
    color: "#fff",
    padding: "8px 8px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    marginBottom: "8px",
  },
});

const MockChannelHeader = styled("div", {
  base: {
    fontSize: "0.62rem",
    fontWeight: 700,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "10px 8px 4px",
  },
});

const MockChannel = styled("button", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 8px",
    borderRadius: "6px",
    fontSize: "0.82rem",
    color: "rgba(255,255,255,0.55)",
    fontWeight: 500,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "background 0.15s, color 0.15s",
    "&:hover:not(:disabled)": {
      background: "rgba(255,255,255,0.04)",
      color: "rgba(255,255,255,0.85)",
    },
    "&[data-active='true']": {
      background: "rgba(255,255,255,0.08)",
      color: "#fff",
    },
    "&:disabled": { cursor: "default", opacity: 0.7 },
  },
});

const MockVoiceCount = styled("span", {
  base: {
    marginLeft: "auto",
    fontSize: "0.7rem",
    color: "rgba(255,255,255,0.4)",
  },
});

const MockMain = styled("div", {
  base: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
});

const MockMainHeader = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: "0.92rem",
    color: "#fff",
    "& strong": { fontWeight: 700 },
  },
});

const MockTopic = styled("span", {
  base: {
    marginLeft: "8px",
    paddingLeft: "10px",
    borderLeft: "1px solid rgba(255,255,255,0.1)",
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.45)",
    fontWeight: 400,
    "@media (max-width: 760px)": { display: "none" },
  },
});

const MockMessages = styled("div", {
  base: {
    flex: 1,
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    minHeight: 0,
  },
});

const MockMessage = styled("div", {
  base: { display: "flex", gap: "12px", alignItems: "flex-start" },
});

const MockAvatar = styled("div", {
  base: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    flexShrink: 0,
  },
});

const MockMessageBody = styled("div", {
  base: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 },
});

const MockMeta = styled("div", {
  base: { display: "flex", alignItems: "baseline", gap: "8px" },
});

const MockName = styled("div", {
  base: { fontWeight: 700, fontSize: "0.85rem", color: "#fff" },
});

const MockTime = styled("div", {
  base: { fontSize: "0.7rem", color: "rgba(255,255,255,0.35)" },
});

const MockText = styled("div", {
  base: { fontSize: "0.85rem", color: "rgba(255,255,255,0.72)" },
});

const MockTyping = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.4)",
    marginTop: "auto",
    paddingTop: "12px",
  },
});

const MockTypingDot = styled("span", {
  base: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.5)",
    animation: "landing-typing 1.2s infinite ease-in-out",
  },
});

/* ---- sections ---- */

const Divider = styled("div", {
  base: {
    maxWidth: "1280px",
    height: "1px",
    margin: "0 auto",
    background:
      "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
    position: "relative",
    zIndex: 1,
  },
});

const Section = styled("section", {
  base: {
    position: "relative",
    padding: "112px 32px",
    maxWidth: "1200px",
    margin: "0 auto",
    zIndex: 1,
    "@media (max-width: 768px)": { padding: "72px 24px" },
  },
});

const SectionHeader = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "56px",
    maxWidth: "680px",
  },
});

const SectionEyebrow = styled("div", {
  base: {
    color: "#c4b5fd",
    fontSize: "0.76rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.14em",
  },
});

const SectionTitle = styled("h2", {
  base: {
    fontSize: "clamp(2rem, 4.5vw, 3rem)",
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    margin: 0,
  },
});

const SectionTitleMuted = styled("span", {
  base: { color: "rgba(255,255,255,0.4)" },
});

const SectionLead = styled("p", {
  base: {
    fontSize: "1.05rem",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.6,
    margin: 0,
    maxWidth: "580px",
  },
});

const FeatureGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
});

const FeatureCard = styled("div", {
  base: {
    padding: "30px 28px",
    background: "#0e0f15",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    transition: "background 0.3s",
    "&:hover": { background: "rgba(124,92,255,0.05)" },
  },
});

const FeatureIcon = styled("div", {
  base: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.18), rgba(88,101,242,0.12))",
    border: "1px solid rgba(124,92,255,0.25)",
    color: "#c4b5fd",
    marginBottom: "4px",
  },
});

const FeatureTitle = styled("h3", {
  base: {
    fontSize: "1.08rem",
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.01em",
  },
});

const FeatureDesc = styled("p", {
  base: {
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.6,
    fontSize: "0.92rem",
    margin: 0,
  },
});

const WhyGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "32px",
    "@media (max-width: 768px)": { gridTemplateColumns: "1fr" },
  },
});

const WhyCard = styled("div", {
  base: {
    padding: "28px 0",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
});

const WhyTitle = styled("h3", {
  base: {
    fontSize: "1.2rem",
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.015em",
  },
});

const WhyDesc = styled("p", {
  base: {
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.6,
    fontSize: "0.95rem",
    margin: 0,
    maxWidth: "440px",
  },
});

/* ---- download ---- */

const DownloadGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "minmax(280px, 420px) 1fr",
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
  base: {
    display: "flex",
    justifyContent: "center",
  },
});

const Phone = styled("div", {
  base: {
    position: "relative",
    width: "100%",
    maxWidth: "320px",
    aspectRatio: "9 / 19.5",
    borderRadius: "44px",
    padding: "12px",
    background:
      "linear-gradient(180deg, #2a2c38 0%, #15161d 50%, #2a2c38 100%)",
    boxShadow:
      "0 50px 100px -30px rgba(124,92,255,0.4), 0 30px 80px -20px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.1)",
  },
});

const PhoneNotch = styled("div", {
  base: {
    position: "absolute",
    top: "22px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "100px",
    height: "28px",
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

const PhoneSide = styled("div", {
  base: {
    position: "absolute",
    background: "#1e1f28",
    borderRadius: "2px",
    "&[data-side='right']": {
      right: "-2px",
      top: "180px",
      width: "3px",
      height: "70px",
    },
    "&[data-side='left-1']": {
      left: "-2px",
      top: "110px",
      width: "3px",
      height: "30px",
    },
    "&[data-side='left-2']": {
      left: "-2px",
      top: "160px",
      width: "3px",
      height: "50px",
    },
    "&[data-side='left-3']": {
      left: "-2px",
      top: "220px",
      width: "3px",
      height: "50px",
    },
  },
});

const DownloadCol = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
  },
});

const IosBanner = styled("div", {
  base: {
    padding: "20px 22px",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.18), rgba(88,101,242,0.1))",
    border: "1px solid rgba(124,92,255,0.35)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    "& p": {
      margin: 0,
      color: "rgba(255,255,255,0.75)",
      fontSize: "0.95rem",
      lineHeight: 1.5,
    },
    "& a": { width: "fit-content" },
  },
});

const IosBannerHeader = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.9rem",
    color: "#fff",
  },
});

const DownloadList = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    overflow: "hidden",
  },
});

const DownloadItem = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "18px 22px",
    background: "#0e0f15",
    transition: "background 0.2s",
    "&:hover": { background: "rgba(124,92,255,0.04)" },
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
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    flexShrink: 0,
  },
});

const DownloadItemBody = styled("div", {
  base: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
});

const DownloadItemTitle = styled("div", {
  base: {
    fontWeight: 700,
    fontSize: "0.95rem",
    color: "#fff",
  },
});

const DownloadItemDesc = styled("div", {
  base: {
    fontSize: "0.82rem",
    color: "rgba(255,255,255,0.55)",
  },
});

/* ---- final cta ---- */

const FinalCta = styled("div", {
  base: {
    position: "relative",
    padding: "80px 48px",
    borderRadius: "24px",
    background:
      "radial-gradient(circle at 25% 20%, rgba(124,92,255,0.22), transparent 60%), radial-gradient(circle at 75% 80%, rgba(88,101,242,0.14), transparent 60%), rgba(255,255,255,0.02)",
    border: "1px solid rgba(124,92,255,0.22)",
    overflow: "hidden",
    "@media (max-width: 768px)": { padding: "56px 28px" },
  },
});

const FinalCtaInner = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxWidth: "640px",
  },
});

const FinalTitle = styled("h2", {
  base: {
    fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    margin: 0,
  },
});

const FinalLead = styled("p", {
  base: {
    color: "rgba(255,255,255,0.65)",
    fontSize: "1.05rem",
    lineHeight: 1.55,
    maxWidth: "520px",
    margin: 0,
  },
});

/* ---- footer ---- */

const Footer = styled("footer", {
  base: {
    position: "relative",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "64px 32px 32px",
    maxWidth: "1280px",
    margin: "0 auto",
    zIndex: 1,
    "@media (max-width: 768px)": { padding: "48px 24px 24px" },
  },
});

const FooterTop = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "1.2fr 2fr",
    gap: "48px",
    paddingBottom: "48px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr", gap: "40px" },
  },
});

const FooterBrand = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "320px",
  },
});

const FooterTag = styled("p", {
  base: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.9rem",
    lineHeight: 1.55,
    margin: 0,
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
      color: "rgba(255,255,255,0.55)",
      textDecoration: "none",
      fontSize: "0.88rem",
      transition: "color 0.2s",
      "&:hover": { color: "#fff" },
    },
  },
});

const FooterColTitle = styled("div", {
  base: {
    color: "#fff",
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
    color: "rgba(255,255,255,0.4)",
    fontSize: "0.85rem",
    "@media (max-width: 540px)": {
      flexDirection: "column",
      gap: "8px",
      alignItems: "flex-start",
    },
  },
});
