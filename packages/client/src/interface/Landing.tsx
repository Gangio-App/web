import {
  For,
  Show,
  createEffect,
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
  BiRegularDesktop,
  BiRegularGlobe,
  BiRegularLock,
  BiRegularMicrophone,
  BiRegularPalette,
  BiSolidCheckCircle,
  BiSolidVolumeFull,
} from "solid-icons/bi";
import { FiArrowUpRight, FiHash } from "solid-icons/fi";
import { HiOutlineBars3 as HiOutlineMenu, HiOutlineXMark as HiOutlineX } from "solid-icons/hi";
import {
  IoLogoApple,
  IoLogoGithub,
  IoLogoMicrosoft,
} from "solid-icons/io";
import { styled } from "styled-system/jsx";

import Wordmark from "../../public/assets/web/wordmark.svg?component-solid";

/* ------------------------------------------------------------------ */
/* Constants                                                           */
/* ------------------------------------------------------------------ */

const BLURPLE = "#8a93ff";
const BLURPLE_DARK = "#6a72e6";
const BLURPLE_SOFT = "rgba(184,192,255,0.22)";

const URLS = {
  open: "/login",
  signup: "/login/create",
  windows:
    "https://github.com/Gangio-App/for-desktop/releases/latest/download/gangio-setup.exe",
  macos:
    "https://github.com/Gangio-App/for-desktop/releases/latest/download/gangio.dmg",
  ios: "https://testflight.apple.com/join/4EqcbpG8",
  github: "https://github.com/Gangio-App",
  discover: "/discover/servers",
};

type TextChannel = {
  id: string;
  type: "text";
  name: string;
  topic: string;
  messages: Array<{
    author: string;
    color: string;
    time: string;
    text: string;
  }>;
};

type VoiceChannel = {
  id: string;
  type: "voice";
  name: string;
  topic: string;
  participants: Array<{
    name: string;
    color: string;
    speaking: boolean;
    muted: boolean;
  }>;
};

type StreamChannel = {
  id: string;
  type: "stream";
  name: string;
  topic: string;
  streamer: { name: string; color: string };
  viewers: Array<{ name: string; color: string }>;
};

type Channel = TextChannel | VoiceChannel | StreamChannel;

const HERO_CHANNELS: Channel[] = [
  {
    id: "general",
    type: "text",
    name: "general",
    topic: "Welcome to Gangio HQ — say hi!",
    messages: [
      {
        author: "luna",
        color: "#5865f2",
        time: "2:14 PM",
        text: "hey everyone! welcome to the server",
      },
      {
        author: "kai",
        color: "#22d3ee",
        time: "2:15 PM",
        text: "anyone up for ranked tonight?",
      },
      {
        author: "nova",
        color: "#f472b6",
        time: "2:15 PM",
        text: "im down. let me eat first 🍜",
      },
      {
        author: "finn",
        color: "#34d399",
        time: "2:16 PM",
        text: "GG GG GG can't wait",
      },
    ],
  },
  {
    id: "introductions",
    type: "text",
    name: "introductions",
    topic: "Tell us about yourself",
    messages: [
      {
        author: "rae",
        color: "#fbbf24",
        time: "12:01 PM",
        text: "Hi! I'm new here, love art and gaming :)",
      },
      {
        author: "ash",
        color: "#f97316",
        time: "12:03 PM",
        text: "welcome rae! check out #gaming and say hi",
      },
      {
        author: "io",
        color: "#a78bfa",
        time: "12:04 PM",
        text: "we have an art-share channel too if you wanna post stuff",
      },
    ],
  },
  {
    id: "gaming",
    type: "text",
    name: "gaming",
    topic: "Game chat — all platforms welcome",
    messages: [
      {
        author: "kai",
        color: "#22d3ee",
        time: "9:14 PM",
        text: "valorant patch notes are wild",
      },
      {
        author: "luna",
        color: "#5865f2",
        time: "9:15 PM",
        text: "agree, jett feels different now",
      },
      {
        author: "finn",
        color: "#34d399",
        time: "9:16 PM",
        text: "queue up?",
      },
    ],
  },
  {
    id: "voice-general",
    type: "voice",
    name: "General Voice",
    topic: "Hang out with friends",
    participants: [
      { name: "luna", color: "#5865f2", speaking: false, muted: false },
      { name: "kai", color: "#22d3ee", speaking: true, muted: false },
      { name: "nova", color: "#f472b6", speaking: false, muted: true },
      { name: "finn", color: "#34d399", speaking: false, muted: false },
    ],
  },
  {
    id: "stream-gaming",
    type: "stream",
    name: "Gaming Lounge",
    topic: "Live screen share — HD 1080p",
    streamer: { name: "luna", color: "#5865f2" },
    viewers: [
      { name: "kai", color: "#22d3ee" },
      { name: "nova", color: "#f472b6" },
      { name: "finn", color: "#34d399" },
    ],
  },
];

const SERVER_RAIL = [
  { id: "g", label: "G", color: BLURPLE, active: true },
  { id: "r", label: "R", color: "#22d3ee" },
  { id: "a", label: "A", color: "#f472b6" },
  { id: "n", label: "N", color: "#34d399" },
];

const FEATURES = [
  {
    icon: BiSolidVolumeFull,
    title: "Crystal-clear voice chat",
    body:
      "Low-latency voice rooms with noise suppression and per-user volume — built for late-night squad sessions.",
  },
  {
    icon: BiRegularDesktop,
    title: "HD screen sharing",
    body:
      "Stream your screen in 1080p 60fps to your whole crew, with hardware acceleration and zero pop-ups.",
  },
  {
    icon: BiRegularPalette,
    title: "Themes that feel like you",
    body: "Pick from curated themes or build your own — every surface, accent and font.",
  },
  {
    icon: BiRegularBot,
    title: "Bots and integrations",
    body: "Plug in moderation, music, mini-games and your own bots through a clean API.",
  },
  {
    icon: BiRegularLock,
    title: "Private by default",
    body: "End-to-end encrypted DMs, optional 2FA, and a transparent open-source codebase.",
  },
  {
    icon: BiRegularCode,
    title: "Open source",
    body: "Fork it, host it, contribute. Gangio is built in the open with a community-first license.",
  },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function Landing() {
  const [scrolled, setScrolled] = createSignal(false);
  const [mobileOpen, setMobileOpen] = createSignal(false);
  const [activeChannelId, setActiveChannelId] = createSignal("general");

  const activeChannel = createMemo(
    () => HERO_CHANNELS.find((c) => c.id === activeChannelId()) ?? HERO_CHANNELS[0],
  );

  const isIOS = createMemo(() =>
    /iPad|iPhone|iPod/.test(navigator.userAgent || ""),
  );

  let rootRef: HTMLDivElement | undefined;
  let mockContentRef: HTMLDivElement | undefined;

  onMount(() => {
    /* Hero intro */
    gsap.set("[data-hero-intro]", { y: 28, autoAlpha: 0 });
    gsap.to("[data-hero-intro]", {
      y: 0,
      autoAlpha: 1,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.08,
      delay: 0.05,
    });

    /* Sticky nav scroll listener */
    const onScroll = () => {
      const top = rootRef?.scrollTop ?? window.scrollY ?? 0;
      setScrolled(top > 24);
    };
    rootRef?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* Section fade-ups via IntersectionObserver */
    const reveal = document.querySelectorAll<HTMLElement>("[data-reveal]");
    reveal.forEach((el) => gsap.set(el, { y: 32, autoAlpha: 0 }));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(entry.target, {
              y: 0,
              autoAlpha: 1,
              duration: 0.8,
              ease: "power3.out",
            });
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, root: rootRef ?? null, rootMargin: "0px 0px -10% 0px" },
    );
    reveal.forEach((el) => io.observe(el));

    onCleanup(() => {
      rootRef?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    });
  });

  /* Animate mock content cross-fade on channel switch */
  createEffect(() => {
    activeChannelId();
    if (!mockContentRef) return;
    gsap.fromTo(
      mockContentRef,
      { autoAlpha: 0, y: 6 },
      { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" },
    );
  });

  return (
    <Root ref={rootRef}>
      {/* ---------- NAV ---------- */}
      <Nav data-scrolled={scrolled() ? "true" : undefined}>
        <NavInner>
          <NavBrand href="/">
            <Wordmark height="22" width="auto" />
          </NavBrand>
          <NavCenter>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#voice">Voice & Video</NavLink>
            <NavLink href="#download">Download</NavLink>
            <NavLink href={URLS.discover}>Discover</NavLink>
            <NavLink href={URLS.github} target="_blank" rel="noopener">
              GitHub
            </NavLink>
          </NavCenter>
          <NavRight>
            <OpenAppBtn href={URLS.open}>
              Open app
              <FiArrowUpRight />
            </OpenAppBtn>
            <MobileToggle
              type="button"
              aria-label="Menu"
              onClick={() => setMobileOpen(!mobileOpen())}
            >
              <Show when={mobileOpen()} fallback={<HiOutlineMenu />}>
                <HiOutlineX />
              </Show>
            </MobileToggle>
          </NavRight>
        </NavInner>
        <Show when={mobileOpen()}>
          <MobileSheet>
            <MobileLink href="#features" onClick={() => setMobileOpen(false)}>
              Features
            </MobileLink>
            <MobileLink href="#voice" onClick={() => setMobileOpen(false)}>
              Voice & Video
            </MobileLink>
            <MobileLink href="#download" onClick={() => setMobileOpen(false)}>
              Download
            </MobileLink>
            <MobileLink href={URLS.discover}>Discover</MobileLink>
            <MobileLink href={URLS.github} target="_blank" rel="noopener">
              GitHub
            </MobileLink>
            <OpenAppBtn href={URLS.open} style={{ "margin-top": "12px" }}>
              Open app
              <FiArrowUpRight />
            </OpenAppBtn>
          </MobileSheet>
        </Show>
      </Nav>

      {/* ---------- HERO ---------- */}
      <Hero>
        <HeroInner>
          <HeroCopy>
            <Eyebrow data-hero-intro>
              <EyebrowDot /> Public beta · Open source
            </Eyebrow>
            <H1 data-hero-intro>
              Imagine a place
              <br />
              where you{" "}
              <Highlight>belong</Highlight>.
            </H1>
            <Sub data-hero-intro>
              Gangio is the place to talk, hang out and play with your friends —
              voice, video, screen share, and chat that actually feels alive.
            </Sub>
            <CtaRow data-hero-intro>
              <PrimaryCta href={URLS.open}>
                Open Gangio
                <FiArrowUpRight />
              </PrimaryCta>
              <GhostCta href="#download">Download the app</GhostCta>
            </CtaRow>
            <TrustRow data-hero-intro>
              <TrustItem>
                <BiSolidCheckCircle /> Free forever
              </TrustItem>
              <TrustItem>
                <BiSolidCheckCircle /> No ads, no tracking
              </TrustItem>
              <TrustItem>
                <BiSolidCheckCircle /> Open source
              </TrustItem>
            </TrustRow>
          </HeroCopy>

          {/* ---------- INTERACTIVE PRODUCT MOCK ---------- */}
          <HeroMock data-hero-intro>
            <MockChrome>
              <MockTraffic>
                <span style={{ background: "#ff5f57" }} />
                <span style={{ background: "#febc2e" }} />
                <span style={{ background: "#28c840" }} />
              </MockTraffic>
              <MockUrl>app.gangio.pro</MockUrl>
              <MockChromeRight />
            </MockChrome>
            <MockBody>
              {/* Server rail */}
              <ServerRail>
                <For each={SERVER_RAIL}>
                  {(s) => (
                    <ServerIcon
                      data-active={s.active ? "true" : undefined}
                      style={{ "background-color": s.color }}
                    >
                      {s.label}
                    </ServerIcon>
                  )}
                </For>
                <ServerDivider />
                <ServerAdd>+</ServerAdd>
              </ServerRail>

              {/* Channel rail */}
              <ChannelRail>
                <ServerHeader>
                  Gangio HQ
                  <ServerHeaderChevron>⌄</ServerHeaderChevron>
                </ServerHeader>
                <ChannelGroupLabel>Text channels</ChannelGroupLabel>
                <For
                  each={HERO_CHANNELS.filter((c) => c.type === "text")}
                >
                  {(ch) => (
                    <ChannelLink
                      type="button"
                      data-active={
                        activeChannelId() === ch.id ? "true" : undefined
                      }
                      onClick={() => setActiveChannelId(ch.id)}
                    >
                      <FiHash />
                      <span>{ch.name}</span>
                    </ChannelLink>
                  )}
                </For>
                <ChannelGroupLabel>Voice channels</ChannelGroupLabel>
                <For
                  each={HERO_CHANNELS.filter(
                    (c) => c.type === "voice" || c.type === "stream",
                  )}
                >
                  {(ch) => (
                    <ChannelLink
                      type="button"
                      data-active={
                        activeChannelId() === ch.id ? "true" : undefined
                      }
                      onClick={() => setActiveChannelId(ch.id)}
                    >
                      <BiSolidVolumeFull />
                      <span>{ch.name}</span>
                    </ChannelLink>
                  )}
                </For>
              </ChannelRail>

              {/* Main pane */}
              <MockMain>
                <MockHeader>
                  <Show
                    when={activeChannel().type === "text"}
                    fallback={<BiSolidVolumeFull />}
                  >
                    <FiHash />
                  </Show>
                  <MockHeaderName>{activeChannel().name}</MockHeaderName>
                  <MockHeaderTopic>{activeChannel().topic}</MockHeaderTopic>
                </MockHeader>

                <MockContent ref={mockContentRef}>
                  <Show when={activeChannel().type === "text"}>
                    <For each={(activeChannel() as TextChannel).messages}>
                      {(m) => (
                        <Message>
                          <Avatar style={{ "background-color": m.color }}>
                            {m.author[0].toUpperCase()}
                          </Avatar>
                          <MessageBody>
                            <MessageHeader>
                              <MessageAuthor style={{ color: m.color }}>
                                {m.author}
                              </MessageAuthor>
                              <MessageTime>{m.time}</MessageTime>
                            </MessageHeader>
                            <MessageText>{m.text}</MessageText>
                          </MessageBody>
                        </Message>
                      )}
                    </For>
                  </Show>

                  <Show when={activeChannel().type === "voice"}>
                    <VoiceGrid>
                      <For each={(activeChannel() as VoiceChannel).participants}>
                        {(p) => (
                          <VoiceTile
                            data-speaking={p.speaking ? "true" : undefined}
                          >
                            <VoiceAvatar
                              style={{ "background-color": p.color }}
                            >
                              {p.name[0].toUpperCase()}
                            </VoiceAvatar>
                            <VoiceName>{p.name}</VoiceName>
                            <VoiceMicBadge data-muted={p.muted ? "true" : undefined}>
                              <BiRegularMicrophone />
                            </VoiceMicBadge>
                          </VoiceTile>
                        )}
                      </For>
                    </VoiceGrid>
                  </Show>

                  <Show when={activeChannel().type === "stream"}>
                    <StreamFrame>
                      <StreamLive>
                        <span /> LIVE
                      </StreamLive>
                      <StreamPlaceholder>
                        <BiRegularDesktop />
                        <span>HD screen share preview</span>
                      </StreamPlaceholder>
                      <StreamFooter>
                        <StreamStreamer>
                          <Avatar
                            style={{
                              "background-color": (
                                activeChannel() as StreamChannel
                              ).streamer.color,
                            }}
                          >
                            {(activeChannel() as StreamChannel).streamer.name[0].toUpperCase()}
                          </Avatar>
                          <span>
                            {(activeChannel() as StreamChannel).streamer.name} is
                            streaming
                          </span>
                        </StreamStreamer>
                        <StreamViewers>
                          <For each={(activeChannel() as StreamChannel).viewers}>
                            {(v) => (
                              <Avatar
                                style={{
                                  "background-color": v.color,
                                  width: "24px",
                                  height: "24px",
                                  "font-size": "10px",
                                }}
                              >
                                {v.name[0].toUpperCase()}
                              </Avatar>
                            )}
                          </For>
                        </StreamViewers>
                      </StreamFooter>
                    </StreamFrame>
                  </Show>
                </MockContent>

                <Show when={activeChannel().type === "text"}>
                  <MockInput>
                    <span>Message #{activeChannel().name}</span>
                  </MockInput>
                </Show>
              </MockMain>
            </MockBody>
          </HeroMock>
        </HeroInner>
      </Hero>

      {/* ---------- DOWNLOAD STRIP (right after hero) ---------- */}
      <DownloadSection id="download" data-reveal>
        <SectionHead>
          <SectionEyebrow>Download</SectionEyebrow>
          <SectionTitle>Get Gangio on every device</SectionTitle>
          <SectionLead>
            Native apps for desktop, mobile and web — pick up exactly where you
            left off.
          </SectionLead>
        </SectionHead>
        <DownloadGrid>
          <DownloadCard href={URLS.windows}>
            <IoLogoMicrosoft />
            <DownloadCardTitle>Windows</DownloadCardTitle>
            <DownloadCardSub>Windows 10 · 11</DownloadCardSub>
          </DownloadCard>
          <DownloadCard href={URLS.macos}>
            <IoLogoApple />
            <DownloadCardTitle>macOS</DownloadCardTitle>
            <DownloadCardSub>Apple Silicon · Intel</DownloadCardSub>
          </DownloadCard>
          <DownloadCard href={URLS.ios} target="_blank" rel="noopener">
            <IoLogoApple />
            <DownloadCardTitle>iOS · TestFlight</DownloadCardTitle>
            <DownloadCardSub>
              {isIOS() ? "Tap to join the beta" : "Public beta"}
            </DownloadCardSub>
          </DownloadCard>
          <DownloadCard href={URLS.open}>
            <BiRegularGlobe />
            <DownloadCardTitle>Web</DownloadCardTitle>
            <DownloadCardSub>Open in your browser</DownloadCardSub>
          </DownloadCard>
        </DownloadGrid>
      </DownloadSection>

      {/* ---------- VOICE & VIDEO ---------- */}
      <VoiceSection id="voice" data-reveal>
        <SectionHead>
          <SectionEyebrow>Voice & Video</SectionEyebrow>
          <SectionTitle>Where hanging out is easy</SectionTitle>
          <SectionLead>
            Hop into a voice channel and you’re instantly with your friends —
            crystal-clear voice, HD video and 1080p screen share, all in one
            click.
          </SectionLead>
        </SectionHead>
        <StreamCard>
          <StreamCardHeader>
            <StreamCardLeft>
              <BiSolidVolumeFull />
              <strong>Gaming Lounge</strong>
              <StreamLive>
                <span /> LIVE
              </StreamLive>
            </StreamCardLeft>
            <StreamCardRight>
              <BiRegularChat /> 4 in voice
            </StreamCardRight>
          </StreamCardHeader>
          <StreamCardStage>
            <StreamCardVideo>
              {/* Drop in the user's MP4 here when provided:
                  <video src={...} autoplay muted loop playsinline /> */}
              <StreamCardPlaceholder>
                <BiRegularDesktop />
                <span>HD screen share · 1080p 60fps</span>
              </StreamCardPlaceholder>
            </StreamCardVideo>
          </StreamCardStage>
          <StreamCardSpeakers>
            <For
              each={[
                { name: "luna", color: "#5865f2", speaking: true },
                { name: "kai", color: "#22d3ee", speaking: false },
                { name: "nova", color: "#f472b6", speaking: false, muted: true },
                { name: "finn", color: "#34d399", speaking: false },
              ]}
            >
              {(p) => (
                <SpeakerTile data-speaking={p.speaking ? "true" : undefined}>
                  <SpeakerAvatar style={{ "background-color": p.color }}>
                    {p.name[0].toUpperCase()}
                  </SpeakerAvatar>
                  <SpeakerName>{p.name}</SpeakerName>
                  <SpeakerMic data-muted={p.muted ? "true" : undefined}>
                    <BiRegularMicrophone />
                  </SpeakerMic>
                </SpeakerTile>
              )}
            </For>
          </StreamCardSpeakers>
        </StreamCard>
      </VoiceSection>

      {/* ---------- FEATURES ---------- */}
      <FeaturesSection id="features" data-reveal>
        <SectionHead>
          <SectionEyebrow>Features</SectionEyebrow>
          <SectionTitle>Everything you need, nothing you don’t</SectionTitle>
          <SectionLead>
            One app for chat, voice, video and community — clean, fast and
            yours.
          </SectionLead>
        </SectionHead>
        <FeaturesGrid>
          <For each={FEATURES}>
            {(f) => (
              <FeatureCard>
                <FeatureIcon>
                  <f.icon />
                </FeatureIcon>
                <FeatureTitle>{f.title}</FeatureTitle>
                <FeatureBody>{f.body}</FeatureBody>
              </FeatureCard>
            )}
          </For>
        </FeaturesGrid>
      </FeaturesSection>

      {/* ---------- FINAL CTA ---------- */}
      <CtaSection data-reveal>
        <CtaInner>
          <CtaTitle>Ready to find your people?</CtaTitle>
          <CtaSub>
            Free to use, free to host, free to own. Jump in — your community is
            waiting.
          </CtaSub>
          <CtaActions>
            <PrimaryCta href={URLS.open}>
              Open Gangio
              <FiArrowUpRight />
            </PrimaryCta>
            <GhostCta href={URLS.signup}>Create an account</GhostCta>
          </CtaActions>
        </CtaInner>
      </CtaSection>

      {/* ---------- FOOTER ---------- */}
      <Footer>
        <FooterInner>
          <FooterBrand>
            <Wordmark height="20" width="auto" />
            <FooterTagline>Talk. Hang out. Belong.</FooterTagline>
          </FooterBrand>
          <FooterCols>
            <FooterCol>
              <FooterColTitle>Product</FooterColTitle>
              <FooterLink href="#features">Features</FooterLink>
              <FooterLink href="#voice">Voice & Video</FooterLink>
              <FooterLink href="#download">Download</FooterLink>
              <FooterLink href={URLS.discover}>Discover</FooterLink>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Company</FooterColTitle>
              <FooterLink href="/terms">Terms</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href={URLS.github} target="_blank" rel="noopener">
                <IoLogoGithub style={{ "margin-right": "6px" }} />
                GitHub
              </FooterLink>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Get the app</FooterColTitle>
              <FooterLink href={URLS.windows}>Windows</FooterLink>
              <FooterLink href={URLS.macos}>macOS</FooterLink>
              <FooterLink href={URLS.ios} target="_blank" rel="noopener">
                iOS · TestFlight
              </FooterLink>
            </FooterCol>
          </FooterCols>
        </FooterInner>
        <FooterBottom>
          <span>© {new Date().getFullYear()} Gangio. Made with care.</span>
          <span>Built open. Hosted by you. Owned by everyone.</span>
        </FooterBottom>
      </Footer>
    </Root>
  );
}

export default Landing;

/* ------------------------------------------------------------------ */
/* Styled                                                              */
/* ------------------------------------------------------------------ */

const Root = styled("div", {
  base: {
    position: "relative",
    height: "100%",
    overflowY: "auto",
    overflowX: "hidden",
    backgroundColor: "#fafaf7",
    color: "#0a0a0a",
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    scrollBehavior: "smooth",
  },
});

/* --- Nav ---------------------------------------------------------- */

const Nav = styled("header", {
  base: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    width: "100%",
    transition: "background-color 200ms ease, border-color 200ms ease, backdrop-filter 200ms ease",
    backgroundColor: "rgba(250,250,247,0)",
    borderBottom: "1px solid transparent",
    "&[data-scrolled='true']": {
      backgroundColor: "rgba(250,250,247,0.85)",
      backdropFilter: "saturate(180%) blur(14px)",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
    },
  },
});

const NavInner = styled("div", {
  base: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    color: "#0a0a0a",
  },
});

const NavBrand = styled("a", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    color: "#0a0a0a",
    flexShrink: 0,
    "&:hover": { color: BLURPLE },
    transition: "color 160ms ease",
  },
});

const NavCenter = styled("nav", {
  base: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    "@media (max-width: 880px)": { display: "none" },
  },
});

const NavLink = styled("a", {
  base: {
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#333",
    textDecoration: "none",
    transition: "color 160ms ease, background-color 160ms ease",
    "&:hover": {
      color: BLURPLE,
      backgroundColor: BLURPLE_SOFT,
    },
  },
});

const NavRight = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
});

const OpenAppBtn = styled("a", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 18px",
    borderRadius: "999px",
    backgroundColor: BLURPLE,
    color: "white",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none",
    boxShadow: "0 6px 18px rgba(138,147,255,0.35)",
    transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
    "&:hover": {
      backgroundColor: BLURPLE_DARK,
      transform: "translateY(-1px)",
      boxShadow: "0 10px 24px rgba(138,147,255,0.45)",
    },
  },
});

const MobileToggle = styled("button", {
  base: {
    display: "none",
    width: "40px",
    height: "40px",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "10px",
    background: "white",
    color: "#0a0a0a",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    cursor: "pointer",
    "@media (max-width: 880px)": { display: "inline-flex" },
  },
});

const MobileSheet = styled("div", {
  base: {
    display: "none",
    flexDirection: "column",
    padding: "12px 24px 24px",
    background: "white",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    "@media (max-width: 880px)": { display: "flex" },
  },
});

const MobileLink = styled("a", {
  base: {
    padding: "12px 8px",
    color: "#0a0a0a",
    fontSize: "16px",
    fontWeight: 500,
    textDecoration: "none",
    borderBottom: "1px solid rgba(0,0,0,0.04)",
  },
});

/* --- Hero --------------------------------------------------------- */

const Hero = styled("section", {
  base: {
    position: "relative",
    paddingTop: "40px",
    paddingBottom: "100px",
    "@media (max-width: 980px)": { paddingTop: "20px", paddingBottom: "60px" },
  },
});

const HeroInner = styled("div", {
  base: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "0 24px",
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) minmax(0,1.15fr)",
    gap: "56px",
    alignItems: "center",
    "@media (max-width: 1080px)": {
      gridTemplateColumns: "1fr",
      gap: "40px",
    },
  },
});

const HeroCopy = styled("div", {
  base: { display: "flex", flexDirection: "column", gap: "20px" },
});

const Eyebrow = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    alignSelf: "flex-start",
    padding: "6px 14px",
    borderRadius: "999px",
    backgroundColor: BLURPLE_SOFT,
    color: BLURPLE,
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
});

const EyebrowDot = styled("span", {
  base: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: BLURPLE,
    boxShadow: `0 0 0 4px ${BLURPLE_SOFT}`,
  },
});

const H1 = styled("h1", {
  base: {
    margin: 0,
    fontSize: "clamp(40px, 5.6vw, 76px)",
    fontWeight: 800,
    lineHeight: 1.02,
    letterSpacing: "-0.03em",
    color: "#0a0a0a",
  },
});

const Highlight = styled("span", {
  base: {
    color: BLURPLE,
    position: "relative",
    whiteSpace: "nowrap",
  },
});

const Sub = styled("p", {
  base: {
    margin: 0,
    fontSize: "clamp(16px, 1.4vw, 19px)",
    lineHeight: 1.55,
    color: "#4a4a4a",
    maxWidth: "560px",
  },
});

const CtaRow = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "8px",
  },
});

const PrimaryCta = styled("a", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 24px",
    borderRadius: "12px",
    backgroundColor: BLURPLE,
    color: "white",
    fontSize: "16px",
    fontWeight: 600,
    textDecoration: "none",
    boxShadow: "0 10px 30px rgba(138,147,255,0.4)",
    transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
    "&:hover": {
      backgroundColor: BLURPLE_DARK,
      transform: "translateY(-2px)",
      boxShadow: "0 16px 40px rgba(138,147,255,0.5)",
    },
  },
});

const GhostCta = styled("a", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 22px",
    borderRadius: "12px",
    backgroundColor: "white",
    color: "#0a0a0a",
    fontSize: "16px",
    fontWeight: 600,
    textDecoration: "none",
    border: "1px solid rgba(0,0,0,0.08)",
    transition: "transform 160ms ease, border-color 160ms ease, color 160ms ease",
    "&:hover": {
      borderColor: BLURPLE,
      color: BLURPLE,
      transform: "translateY(-2px)",
    },
  },
});

const TrustRow = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    marginTop: "8px",
  },
});

const TrustItem = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#666",
    "& svg": { color: BLURPLE, fontSize: "14px" },
  },
});

/* --- Hero Mock ---------------------------------------------------- */

const HeroMock = styled("div", {
  base: {
    position: "relative",
    width: "100%",
    background: "white",
    borderRadius: "20px",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow:
      "0 30px 80px -20px rgba(20,20,40,0.25), 0 8px 32px -8px rgba(20,20,40,0.12)",
    overflow: "hidden",
  },
});

const MockChrome = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 14px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    background: "#f5f5f1",
  },
});

const MockTraffic = styled("div", {
  base: {
    display: "flex",
    gap: "6px",
    "& > span": {
      display: "inline-block",
      width: "12px",
      height: "12px",
      borderRadius: "50%",
    },
  },
});

const MockUrl = styled("div", {
  base: {
    flex: 1,
    textAlign: "center",
    fontSize: "12px",
    color: "#999",
    fontFamily: "ui-monospace, monospace",
  },
});

const MockChromeRight = styled("div", {
  base: { width: "44px" },
});

const MockBody = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "64px 200px 1fr",
    minHeight: "440px",
    "@media (max-width: 540px)": {
      gridTemplateColumns: "56px 1fr",
      "& [data-rail-channel]": { display: "none" },
    },
  },
});

const ServerRail = styled("div", {
  base: {
    background: "#1f2024",
    padding: "12px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
});

const ServerIcon = styled("div", {
  base: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "16px",
    cursor: "pointer",
    transition: "border-radius 200ms ease, transform 200ms ease",
    "&:hover": { borderRadius: "10px", transform: "scale(1.04)" },
    "&[data-active='true']": {
      borderRadius: "10px",
      boxShadow: "0 0 0 3px rgba(255,255,255,0.18)",
    },
  },
});

const ServerDivider = styled("div", {
  base: {
    width: "32px",
    height: "1px",
    background: "rgba(255,255,255,0.1)",
    margin: "4px 0",
  },
});

const ServerAdd = styled("div", {
  base: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    background: "transparent",
    border: "1px dashed rgba(255,255,255,0.25)",
    color: "rgba(255,255,255,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    cursor: "pointer",
    transition: "all 200ms ease",
    "&:hover": {
      borderRadius: "10px",
      borderColor: BLURPLE,
      color: BLURPLE,
      background: "rgba(138,147,255,0.1)",
    },
  },
});

const ChannelRail = styled("div", {
  base: {
    background: "#2a2c33",
    color: "rgba(255,255,255,0.85)",
    padding: "8px 0",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    "@media (max-width: 540px)": { display: "none" },
  },
});

const ServerHeader = styled("div", {
  base: {
    padding: "14px 16px",
    fontWeight: 700,
    fontSize: "14px",
    color: "white",
    borderBottom: "1px solid rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 1px 0 rgba(255,255,255,0.04)",
  },
});

const ServerHeaderChevron = styled("span", {
  base: { fontSize: "14px", opacity: 0.6 },
});

const ChannelGroupLabel = styled("div", {
  base: {
    padding: "12px 16px 6px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.45)",
  },
});

const ChannelLink = styled("button", {
  base: {
    appearance: "none",
    border: "none",
    background: "transparent",
    width: "100%",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    margin: "1px 8px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 500,
    color: "rgba(255,255,255,0.6)",
    cursor: "pointer",
    transition: "background-color 120ms ease, color 120ms ease",
    "& svg": { fontSize: "16px", flexShrink: 0, opacity: 0.7 },
    "&:hover": { background: "rgba(255,255,255,0.06)", color: "white" },
    "&[data-active='true']": {
      background: BLURPLE,
      color: "white",
      "& svg": { opacity: 1 },
    },
  },
});

const MockMain = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    background: "white",
  },
});

const MockHeader = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "14px 18px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    fontSize: "15px",
    "& > svg": { color: "#888", fontSize: "18px" },
  },
});

const MockHeaderName = styled("strong", {
  base: { color: "#0a0a0a", fontWeight: 700 },
});

const MockHeaderTopic = styled("span", {
  base: {
    color: "#888",
    fontSize: "13px",
    paddingLeft: "10px",
    borderLeft: "1px solid rgba(0,0,0,0.08)",
    marginLeft: "4px",
    "@media (max-width: 540px)": { display: "none" },
  },
});

const MockContent = styled("div", {
  base: {
    flex: 1,
    minHeight: 0,
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    overflow: "hidden",
  },
});

const Message = styled("div", {
  base: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },
});

const Avatar = styled("div", {
  base: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    color: "white",
    fontWeight: 700,
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});

const MessageBody = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },
});

const MessageHeader = styled("div", {
  base: { display: "flex", alignItems: "baseline", gap: "8px" },
});

const MessageAuthor = styled("span", {
  base: { fontWeight: 700, fontSize: "14px" },
});

const MessageTime = styled("span", {
  base: { fontSize: "11px", color: "#999" },
});

const MessageText = styled("div", {
  base: { fontSize: "14px", color: "#1a1a1a", lineHeight: 1.4 },
});

const MockInput = styled("div", {
  base: {
    margin: "0 18px 18px",
    padding: "12px 16px",
    background: "#f3f3ee",
    borderRadius: "10px",
    color: "#999",
    fontSize: "14px",
  },
});

const VoiceGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
    flex: 1,
  },
});

const VoiceTile = styled("div", {
  base: {
    position: "relative",
    background: "#f3f3ee",
    borderRadius: "12px",
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    border: "2px solid transparent",
    transition: "border-color 200ms ease",
    "&[data-speaking='true']": { borderColor: "#22c55e" },
  },
});

const VoiceAvatar = styled("div", {
  base: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    color: "white",
    fontWeight: 700,
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

const VoiceName = styled("div", {
  base: { fontSize: "13px", fontWeight: 600, color: "#1a1a1a" },
});

const VoiceMicBadge = styled("div", {
  base: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "white",
    color: "#1a1a1a",
    border: "1px solid rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    "&[data-muted='true']": { background: "#ef4444", color: "white", borderColor: "#ef4444" },
  },
});

/* Stream */

const StreamFrame = styled("div", {
  base: {
    position: "relative",
    flex: 1,
    background: "#0a0a0a",
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    color: "white",
  },
});

const StreamLive = styled("div", {
  base: {
    position: "absolute",
    top: "12px",
    left: "12px",
    zIndex: 2,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "999px",
    background: "#ef4444",
    color: "white",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    "& > span": {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "white",
      animation: "landing-pulse-out 1.6s ease-out infinite",
    },
  },
});

const StreamPlaceholder = styled("div", {
  base: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    color: "rgba(255,255,255,0.6)",
    background:
      "radial-gradient(120% 80% at 50% 30%, rgba(138,147,255,0.25) 0%, transparent 60%), #0a0a0a",
    "& > svg": { fontSize: "40px", color: BLURPLE },
    "& > span": { fontSize: "13px", fontWeight: 500 },
  },
});

const StreamFooter = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    background: "rgba(0,0,0,0.6)",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
});

const StreamStreamer = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 600,
  },
});

const StreamViewers = styled("div", {
  base: { display: "flex", gap: "-4px", "& > div": { marginLeft: "-6px", border: "2px solid rgba(0,0,0,0.6)" } },
});

/* --- Section base ------------------------------------------------- */

const SectionHead = styled("div", {
  base: {
    maxWidth: "780px",
    margin: "0 auto 48px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
});

const SectionEyebrow = styled("div", {
  base: {
    display: "inline-block",
    padding: "5px 12px",
    borderRadius: "999px",
    backgroundColor: BLURPLE_SOFT,
    color: BLURPLE,
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
});

const SectionTitle = styled("h2", {
  base: {
    margin: 0,
    fontSize: "clamp(28px, 3.6vw, 48px)",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    color: "#0a0a0a",
  },
});

const SectionLead = styled("p", {
  base: {
    margin: 0,
    fontSize: "17px",
    lineHeight: 1.55,
    color: "#555",
    maxWidth: "640px",
  },
});

/* --- Download ----------------------------------------------------- */

const DownloadSection = styled("section", {
  base: {
    padding: "60px 24px 80px",
    maxWidth: "1240px",
    margin: "0 auto",
  },
});

const DownloadGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    "@media (max-width: 880px)": { gridTemplateColumns: "repeat(2, 1fr)" },
    "@media (max-width: 480px)": { gridTemplateColumns: "1fr" },
  },
});

const DownloadCard = styled("a", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "10px",
    padding: "24px",
    background: "white",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "16px",
    color: "#0a0a0a",
    textDecoration: "none",
    transition:
      "transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
    "& > svg:first-child": { fontSize: "28px", color: BLURPLE },
    "&:hover": {
      transform: "translateY(-4px)",
      borderColor: BLURPLE,
      boxShadow: "0 16px 40px -12px rgba(138,147,255,0.25)",
    },
  },
});

const DownloadCardTitle = styled("div", {
  base: { fontSize: "16px", fontWeight: 700, color: "#0a0a0a" },
});

const DownloadCardSub = styled("div", {
  base: { fontSize: "13px", color: "#666" },
});

/* --- Voice section ------------------------------------------------ */

const VoiceSection = styled("section", {
  base: {
    padding: "80px 24px 100px",
    maxWidth: "1240px",
    margin: "0 auto",
  },
});

const StreamCard = styled("div", {
  base: {
    background: "#0d0d10",
    color: "white",
    borderRadius: "24px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow:
      "0 40px 100px -30px rgba(0,0,0,0.5), 0 0 0 1px rgba(138,147,255,0.15) inset",
  },
});

const StreamCardHeader = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "linear-gradient(180deg, rgba(138,147,255,0.08), transparent)",
  },
});

const StreamCardLeft = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "15px",
    "& > svg": { color: BLURPLE, fontSize: "20px" },
    "& > strong": { fontWeight: 700 },
    "& > [data-position]": { position: "static" },
  },
});

const StreamCardRight = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "rgba(255,255,255,0.7)",
    "& > svg": { fontSize: "16px" },
  },
});

const StreamCardStage = styled("div", {
  base: { padding: "20px" },
});

const StreamCardVideo = styled("div", {
  base: {
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 9",
    background: "#000",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    "& video": {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    },
  },
});

const StreamCardPlaceholder = styled("div", {
  base: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    color: "rgba(255,255,255,0.7)",
    background:
      "radial-gradient(120% 80% at 50% 30%, rgba(138,147,255,0.3) 0%, transparent 60%), #0a0a0a",
    "& > svg": { fontSize: "48px", color: BLURPLE },
    "& > span": { fontSize: "14px", fontWeight: 500 },
  },
});

const StreamCardSpeakers = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    padding: "0 20px 20px",
    "@media (max-width: 600px)": { gridTemplateColumns: "repeat(2, 1fr)" },
  },
});

const SpeakerTile = styled("div", {
  base: {
    position: "relative",
    background: "rgba(255,255,255,0.04)",
    border: "2px solid transparent",
    borderRadius: "14px",
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    transition: "border-color 200ms ease, background-color 200ms ease",
    "&[data-speaking='true']": {
      borderColor: "#22c55e",
      background: "rgba(34,197,94,0.08)",
    },
  },
});

const SpeakerAvatar = styled("div", {
  base: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "18px",
    color: "white",
  },
});

const SpeakerName = styled("div", {
  base: { fontSize: "13px", fontWeight: 600, color: "white" },
});

const SpeakerMic = styled("div", {
  base: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    "&[data-muted='true']": { background: "#ef4444", borderColor: "#ef4444", color: "white" },
  },
});

/* --- Features ----------------------------------------------------- */

const FeaturesSection = styled("section", {
  base: {
    padding: "80px 24px 100px",
    maxWidth: "1240px",
    margin: "0 auto",
  },
});

const FeaturesGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    "@media (max-width: 880px)": { gridTemplateColumns: "repeat(2, 1fr)" },
    "@media (max-width: 540px)": { gridTemplateColumns: "1fr" },
  },
});

const FeatureCard = styled("div", {
  base: {
    background: "white",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: "16px",
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    transition: "border-color 200ms ease, transform 200ms ease",
    "&:hover": { borderColor: BLURPLE, transform: "translateY(-3px)" },
  },
});

const FeatureIcon = styled("div", {
  base: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: BLURPLE_SOFT,
    color: BLURPLE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },
});

const FeatureTitle = styled("h3", {
  base: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#0a0a0a",
  },
});

const FeatureBody = styled("p", {
  base: { margin: 0, fontSize: "14px", lineHeight: 1.55, color: "#555" },
});

/* --- Final CTA ---------------------------------------------------- */

const CtaSection = styled("section", {
  base: {
    padding: "60px 24px 100px",
  },
});

const CtaInner = styled("div", {
  base: {
    maxWidth: "920px",
    margin: "0 auto",
    background: `linear-gradient(135deg, ${BLURPLE} 0%, ${BLURPLE_DARK} 100%)`,
    color: "white",
    padding: "64px 32px",
    borderRadius: "24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 30px 80px -20px rgba(138,147,255,0.5)",
  },
});

const CtaTitle = styled("h2", {
  base: {
    margin: 0,
    fontSize: "clamp(28px, 4vw, 44px)",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  },
});

const CtaSub = styled("p", {
  base: {
    margin: 0,
    fontSize: "17px",
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.85)",
    maxWidth: "560px",
  },
});

const CtaActions = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "12px",
    marginTop: "12px",
    "& a:first-child": {
      backgroundColor: "white",
      color: BLURPLE,
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    },
    "& a:first-child:hover": {
      backgroundColor: "white",
      color: BLURPLE_DARK,
    },
    "& a:last-child": {
      backgroundColor: "transparent",
      color: "white",
      borderColor: "rgba(255,255,255,0.4)",
    },
    "& a:last-child:hover": {
      borderColor: "white",
      color: "white",
    },
  },
});

/* --- Footer ------------------------------------------------------- */

const Footer = styled("footer", {
  base: {
    borderTop: "1px solid rgba(0,0,0,0.06)",
    background: "#fff",
  },
});

const FooterInner = styled("div", {
  base: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "60px 24px 30px",
    display: "grid",
    gridTemplateColumns: "1.2fr 2fr",
    gap: "40px",
    "@media (max-width: 720px)": { gridTemplateColumns: "1fr" },
  },
});

const FooterBrand = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    color: "#0a0a0a",
  },
});

const FooterTagline = styled("div", {
  base: { fontSize: "14px", color: "#666", maxWidth: "320px" },
});

const FooterCols = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
    "@media (max-width: 540px)": { gridTemplateColumns: "repeat(2, 1fr)" },
  },
});

const FooterCol = styled("div", {
  base: { display: "flex", flexDirection: "column", gap: "10px" },
});

const FooterColTitle = styled("div", {
  base: {
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#0a0a0a",
    marginBottom: "6px",
  },
});

const FooterLink = styled("a", {
  base: {
    fontSize: "14px",
    color: "#666",
    textDecoration: "none",
    transition: "color 160ms ease",
    "&:hover": { color: BLURPLE },
  },
});

const FooterBottom = styled("div", {
  base: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "20px 24px 40px",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#999",
    flexWrap: "wrap",
    gap: "12px",
  },
});
