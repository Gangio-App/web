import { onCleanup, onMount } from "solid-js";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BiRegularBot,
  BiRegularChat,
  BiRegularCode,
  BiRegularGlobe,
  BiRegularMicrophone,
  BiRegularPalette,
  BiRegularShield,
  BiSolidBolt,
} from "solid-icons/bi";
import {
  HiOutlineArrowRight,
  HiOutlineLockClosed,
  HiOutlineSparkles,
} from "solid-icons/hi";
import { css, cx } from "styled-system/css";
import { styled } from "styled-system/jsx";

gsap.registerPlugin(ScrollTrigger);

/**
 * Public landing page (gangio.pro/)
 *
 * Shown to logged-out users at the root path.
 * Logged-in users skip this and land directly in the app.
 */
export function Landing() {
  let rootRef: HTMLDivElement | undefined;

  onMount(() => {
    if (!rootRef) return;

    const ctx = gsap.context(() => {
      // Hero: staggered intro
      gsap.from("[data-anim='hero-item']", {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.05,
      });

      // Hero mock window
      gsap.from("[data-anim='hero-mock']", {
        y: 40,
        opacity: 0,
        duration: 1.1,
        ease: "power3.out",
        delay: 0.35,
      });
      gsap.to("[data-anim='hero-mock']", {
        y: -10,
        duration: 5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.4,
      });

      // Subtle background glow drift
      gsap.to("[data-anim='glow']", {
        x: 60,
        y: -30,
        duration: 14,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      // Section reveals on scroll
      gsap.utils.toArray<HTMLElement>("[data-anim='reveal']").forEach((el) => {
        gsap.from(el, {
          y: 36,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      });

      // Stats counters
      gsap.utils.toArray<HTMLElement>("[data-anim='stat']").forEach((el) => {
        const target = parseInt(el.dataset.target ?? "0", 10);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          onUpdate: () => {
            el.textContent = formatStat(Math.round(obj.val));
          },
        });
      });
    }, rootRef);

    onCleanup(() => ctx.revert());
  });

  return (
    <Root ref={rootRef}>
      <Nav>
        <NavInner>
          <Brand>gangio</Brand>
          <NavLinks>
            <a href="#features">Features</a>
            <a href="#why">Why Gangio</a>
            <a href="/discover/servers">Discover</a>
            <a href="/download">Download</a>
          </NavLinks>
          <NavCtas>
            <a class={ghostBtn()} href="/login/auth">
              Log in
            </a>
            <a class={primaryBtn()} href="/login/create">
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
            <a class={primaryBtnLg()} href="/login/create">
              Get started
              <HiOutlineArrowRight size={18} />
            </a>
            <a class={ghostBtnLg()} href="/login/auth">
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
              <MockServer />
              <MockServer />
              <MockServer />
              <MockServer />
            </MockSidebar>
            <MockChannels>
              <MockChannelHeader>community</MockChannelHeader>
              <MockChannel>
                <span>#</span>general
              </MockChannel>
              <MockChannel data-active>
                <span>#</span>announcements
              </MockChannel>
              <MockChannel>
                <span>#</span>off-topic
              </MockChannel>
              <MockChannelHeader>voice</MockChannelHeader>
              <MockChannel>
                <BiRegularMicrophone size={12} />
                Lounge
              </MockChannel>
            </MockChannels>
            <MockMain>
              <MockMessage>
                <MockAvatar style={{ background: "#7c5cff" }} />
                <MockMessageBody>
                  <MockMeta>
                    <MockName>luna</MockName>
                    <MockTime>just now</MockTime>
                  </MockMeta>
                  <MockText>welcome to the new server everyone.</MockText>
                </MockMessageBody>
              </MockMessage>
              <MockMessage>
                <MockAvatar style={{ background: "#22d3ee" }} />
                <MockMessageBody>
                  <MockMeta>
                    <MockName>kai</MockName>
                    <MockTime>2m</MockTime>
                  </MockMeta>
                  <MockText>this looks insanely clean.</MockText>
                </MockMessageBody>
              </MockMessage>
              <MockMessage>
                <MockAvatar style={{ background: "#f472b6" }} />
                <MockMessageBody>
                  <MockMeta>
                    <MockName>nova</MockName>
                    <MockTime>4m</MockTime>
                  </MockMeta>
                  <MockText>finally, a chat app that respects us.</MockText>
                </MockMessageBody>
              </MockMessage>
              <MockTyping>
                <MockTypingDot />
                <MockTypingDot style={{ "animation-delay": "0.15s" }} />
                <MockTypingDot style={{ "animation-delay": "0.3s" }} />
                <span>finn is typing…</span>
              </MockTyping>
            </MockMain>
          </MockBody>
        </HeroMock>
      </Hero>

      {/* FEATURES */}
      <Section id="features">
        <SectionHeader data-anim="reveal">
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
          <FeatureCard data-anim="reveal">
            <FeatureIcon>
              <BiRegularChat size={22} />
            </FeatureIcon>
            <FeatureTitle>Messaging that feels right</FeatureTitle>
            <FeatureDesc>
              Markdown, code blocks, embeds, threads, reactions, and search.
              DMs, group chats, and full server channels.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard data-anim="reveal">
            <FeatureIcon>
              <BiRegularMicrophone size={22} />
            </FeatureIcon>
            <FeatureTitle>Voice and video</FeatureTitle>
            <FeatureDesc>
              Crystal-clear, low-latency voice with screen sharing, noise
              suppression, and echo cancellation.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard data-anim="reveal">
            <FeatureIcon>
              <BiRegularShield size={22} />
            </FeatureIcon>
            <FeatureTitle>Moderation, done right</FeatureTitle>
            <FeatureDesc>
              Granular roles, audit logs, and powerful permissions. Run a
              server of three or three thousand — same tools, no upsells.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard data-anim="reveal">
            <FeatureIcon>
              <BiRegularPalette size={22} />
            </FeatureIcon>
            <FeatureTitle>Make it yours</FeatureTitle>
            <FeatureDesc>
              Custom emojis, themes, and CSS. Set a profile banner without
              paying for it. The little things matter.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard data-anim="reveal">
            <FeatureIcon>
              <BiRegularBot size={22} />
            </FeatureIcon>
            <FeatureTitle>Bots and a real API</FeatureTitle>
            <FeatureDesc>
              A first-class public API and bot platform. The same one we use
              to build the official apps.
            </FeatureDesc>
          </FeatureCard>

          <FeatureCard data-anim="reveal">
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
        <SectionHeader data-anim="reveal">
          <SectionEyebrow>Why Gangio</SectionEyebrow>
          <SectionTitle>
            Answers to you, <SectionTitleMuted>not investors.</SectionTitleMuted>
          </SectionTitle>
        </SectionHeader>

        <WhyGrid>
          <WhyCard data-anim="reveal">
            <WhyTitle>No ads. No tracking. No upsells.</WhyTitle>
            <WhyDesc>
              We don't sell your data and we never will. The privacy policy is
              short enough to actually read.
            </WhyDesc>
          </WhyCard>
          <WhyCard data-anim="reveal">
            <WhyTitle>Free and open source.</WhyTitle>
            <WhyDesc>
              The whole stack is public. Audit it, fork it, host it on your own
              hardware. It's yours.
            </WhyDesc>
          </WhyCard>
          <WhyCard data-anim="reveal">
            <WhyTitle>Built for the long term.</WhyTitle>
            <WhyDesc>
              No board to please. Every decision starts and ends with the
              people actually using the software.
            </WhyDesc>
          </WhyCard>
          <WhyCard data-anim="reveal">
            <WhyTitle>Take it everywhere.</WhyTitle>
            <WhyDesc>
              Your account, conversations, and settings stay in sync across
              every device — Windows, macOS, Linux, and web.
            </WhyDesc>
          </WhyCard>
        </WhyGrid>
      </Section>

      {/* STATS */}
      <Section>
        <Stats>
          <Stat data-anim="reveal">
            <StatNumber data-anim="stat" data-target="42000">
              0
            </StatNumber>
            <StatLabel>Members worldwide</StatLabel>
          </Stat>
          <Stat data-anim="reveal">
            <StatNumber data-anim="stat" data-target="1200">
              0
            </StatNumber>
            <StatLabel>Active communities</StatLabel>
          </Stat>
          <Stat data-anim="reveal">
            <StatNumber data-anim="stat" data-target="100">
              0
            </StatNumber>
            <StatLabel>% open source</StatLabel>
          </Stat>
        </Stats>
      </Section>

      {/* FINAL CTA */}
      <Section>
        <FinalCta data-anim="reveal">
          <FinalCtaInner>
            <SectionEyebrow>Ready when you are</SectionEyebrow>
            <FinalTitle>Find your people.</FinalTitle>
            <FinalLead>
              Create an account in seconds. Bring your friends. Build the place
              you've always wanted to hang out.
            </FinalLead>
            <CtaRow>
              <a class={primaryBtnLg()} href="/login/create">
                Get started
                <HiOutlineArrowRight size={18} />
              </a>
              <a class={ghostBtnLg()} href="/download">
                Download for desktop
              </a>
            </CtaRow>
          </FinalCtaInner>
        </FinalCta>
      </Section>

      <Footer>
        <FooterTop>
          <FooterBrand>
            <Brand>gangio</Brand>
            <FooterTag>
              A free and open-source chat platform for communities.
            </FooterTag>
          </FooterBrand>

          <FooterCols>
            <FooterCol>
              <FooterColTitle>Product</FooterColTitle>
              <a href="#features">Features</a>
              <a href="/discover/servers">Discover</a>
              <a href="/download">Download</a>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Account</FooterColTitle>
              <a href="/login/auth">Log in</a>
              <a href="/login/create">Sign up</a>
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

function formatStat(n: number) {
  if (n >= 1000) {
    const k = (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1);
    return `${k}K+`;
  }
  return `${n}`;
}

/* ---------------- styles ---------------- */

const Root = styled("div", {
  base: {
    width: "100%",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    background: "#0a0a0f",
    color: "#fff",
    fontFamily:
      "'Plus Jakarta Sans Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontFeatureSettings: "'cv11', 'ss01'",
    fontSynthesis: "none",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  },
});

const Nav = styled("header", {
  base: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(16px) saturate(180%)",
    background: "rgba(10, 10, 15, 0.7)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
});

const NavInner = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    maxWidth: "1280px",
    margin: "0 auto",
    "@media (max-width: 768px)": { padding: "14px 20px" },
  },
});

const Brand = styled("div", {
  base: {
    fontSize: "1.35rem",
    fontWeight: 800,
    letterSpacing: "-0.025em",
    fontStyle: "italic",
    color: "#fff",
  },
});

const NavLinks = styled("nav", {
  base: {
    display: "flex",
    gap: "32px",
    "& a": {
      color: "rgba(255,255,255,0.65)",
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
    transition: "transform 0.15s, background 0.15s",
    "&:hover": { background: "#e8e8f0", transform: "translateY(-1px)" },
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
      border: "1px solid rgba(255,255,255,0.12)",
      "&:hover": { background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.2)" },
    }),
  );

const Hero = styled("section", {
  base: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1.05fr 1fr",
    gap: "56px",
    alignItems: "center",
    padding: "112px 32px 128px",
    maxWidth: "1280px",
    margin: "0 auto",
    "@media (max-width: 1024px)": {
      gridTemplateColumns: "1fr",
      padding: "72px 24px 96px",
      gap: "56px",
    },
  },
});

const Glow = styled("div", {
  base: {
    position: "absolute",
    top: "-200px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "900px",
    height: "600px",
    background:
      "radial-gradient(closest-side, rgba(124,92,255,0.35), transparent 70%)",
    filter: "blur(40px)",
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
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.8rem",
    fontWeight: 500,
    letterSpacing: "0.01em",
  },
});

const H1 = styled("h1", {
  base: {
    fontSize: "clamp(2.75rem, 6vw, 4.75rem)",
    fontWeight: 800,
    lineHeight: 1.02,
    letterSpacing: "-0.035em",
    margin: 0,
  },
});

const Gradient = styled("span", {
  base: {
    background:
      "linear-gradient(135deg, #c4b5fd 0%, #7c5cff 40%, #5865f2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
});

const Sub = styled("p", {
  base: {
    fontSize: "1.125rem",
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
    marginTop: "20px",
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.85rem",
  },
});

const TrustItem = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
  },
});

const HeroMock = styled("div", {
  base: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    aspectRatio: "5 / 4",
    borderRadius: "16px",
    background: "rgba(15, 15, 22, 0.85)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow:
      "0 40px 100px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,92,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
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
    padding: "12px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(0,0,0,0.2)",
  },
});

const MockDot = styled("div", {
  base: { width: "11px", height: "11px", borderRadius: "50%" },
});

const MockChromeAddress = styled("div", {
  base: {
    marginLeft: "auto",
    marginRight: "auto",
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.4)",
    fontFamily: "monospace",
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
    background: "rgba(255,255,255,0.05)",
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
    },
  },
});

const MockChannels = styled("div", {
  base: {
    width: "150px",
    padding: "16px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    borderRight: "1px solid rgba(255,255,255,0.04)",
    background: "rgba(255,255,255,0.015)",
    "@media (max-width: 540px)": { display: "none" },
  },
});

const MockChannelHeader = styled("div", {
  base: {
    fontSize: "0.65rem",
    fontWeight: 700,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    padding: "10px 8px 6px",
  },
});

const MockChannel = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 8px",
    borderRadius: "6px",
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.5)",
    fontWeight: 500,
    "& span": { color: "rgba(255,255,255,0.3)" },
    "&[data-active='true']": {
      background: "rgba(255,255,255,0.06)",
      color: "#fff",
    },
  },
});

const MockMain = styled("div", {
  base: {
    flex: 1,
    padding: "20px 22px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    minWidth: 0,
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
  base: { fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" },
});

const MockTyping = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.4)",
    marginTop: "auto",
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

const Section = styled("section", {
  base: {
    position: "relative",
    padding: "120px 32px",
    maxWidth: "1200px",
    margin: "0 auto",
    "@media (max-width: 768px)": { padding: "80px 24px" },
  },
});

const SectionHeader = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "64px",
    maxWidth: "680px",
  },
});

const SectionEyebrow = styled("div", {
  base: {
    color: "rgba(124,92,255,0.9)",
    fontSize: "0.78rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
});

const SectionTitle = styled("h2", {
  base: {
    fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    margin: 0,
  },
});

const SectionTitleMuted = styled("span", {
  base: { color: "rgba(255,255,255,0.45)" },
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
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
});

const FeatureCard = styled("div", {
  base: {
    padding: "32px 28px",
    background: "#0a0a0f",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    transition: "background 0.3s",
    "&:hover": { background: "rgba(124,92,255,0.04)" },
  },
});

const FeatureIcon = styled("div", {
  base: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    background: "rgba(124,92,255,0.12)",
    border: "1px solid rgba(124,92,255,0.25)",
    color: "#c4b5fd",
    marginBottom: "4px",
  },
});

const FeatureTitle = styled("h3", {
  base: {
    fontSize: "1.1rem",
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
    fontSize: "1.25rem",
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

const Stats = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
    padding: "40px 0",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    "@media (max-width: 640px)": { gridTemplateColumns: "1fr", gap: "32px" },
  },
});

const Stat = styled("div", {
  base: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
});

const StatNumber = styled("div", {
  base: {
    fontSize: "clamp(2.25rem, 4.5vw, 3rem)",
    fontWeight: 800,
    background: "linear-gradient(135deg, #fff, #a3a3b8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.025em",
    lineHeight: 1,
  },
});

const StatLabel = styled("div", {
  base: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.9rem",
  },
});

const FinalCta = styled("div", {
  base: {
    position: "relative",
    padding: "80px 48px",
    borderRadius: "24px",
    background:
      "radial-gradient(circle at 30% 20%, rgba(124,92,255,0.18), transparent 60%), radial-gradient(circle at 70% 80%, rgba(88,101,242,0.12), transparent 60%), rgba(255,255,255,0.02)",
    border: "1px solid rgba(124,92,255,0.2)",
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

const Footer = styled("footer", {
  base: {
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "64px 32px 32px",
    maxWidth: "1280px",
    margin: "0 auto",
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
    fontSize: "0.78rem",
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
