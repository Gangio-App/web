import {
  For,
  Show,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  BiRegularCode,
  BiRegularGlobe,
  BiRegularLock,
  BiSolidCheckCircle,
} from "solid-icons/bi";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBookOpen,
  FiCode,
  FiCoffee,
  FiCompass,
  FiDownload,
  FiDroplet,
  FiGithub,
  FiHardDrive,
  FiHash,
  FiHeadphones,
  FiHeart,
  FiMenu,
  FiMic,
  FiMonitor,
  FiPhoneOff,
  FiShield,
  FiUsers,
  FiVideo,
  FiX,
  FiZap,
} from "solid-icons/fi";
import { IoLogoApple, IoLogoMicrosoft } from "solid-icons/io";
import { css, cx } from "styled-system/css";
import { styled } from "styled-system/jsx";

import Wordmark from "../../public/assets/web/wordmark.svg?component-solid";
import desktopShot from "../../assets/web/landing/desktop-screenshot.png";
import iosShot from "../../assets/web/landing/ios.webp";
import streamVideo from "../../assets/web/landing/video-stream_gangioHD_Homepage.mp4?url";
import serverIcon1 from "../../assets/web/landing/theme-component/gg_landing_server1_icon.png";
import serverIcon2 from "../../assets/web/landing/theme-component/gg_landing_server2_icon.png";

/* ---------------- constants ---------------- */

const URLS = {
  windows:
    "https://github.com/Gangio-App/for-desktop/releases/download/v1.3.16/gangio-desktop-setup.exe",
  macos:
    "https://github.com/gangio/for-desktop/releases/latest/download/Gangio.dmg",
  ios: "https://testflight.apple.com/join/4EqcbpG8",
  signup: "/login/create",
  login: "/login/auth",
  donate: "https://buymeacoffee.com/korybantes",
  bluesky: "https://bsky.app/profile/gangio.pro",
  github: "https://github.com/Gangio-App",
};

const THEMES: { name: string; bg: string; accent: string; text: string }[] = [
  { name: "Midnight", bg: "#0b0c13", accent: "#7c5cff", text: "#ffffff" },
  { name: "Paper", bg: "#fafaf7", accent: "#111111", text: "#0a0a0a" },
  { name: "Forest", bg: "#0e1a14", accent: "#34d399", text: "#ecfdf5" },
  { name: "Sunset", bg: "#1a0f12", accent: "#f97316", text: "#fff7ed" },
  { name: "Ocean", bg: "#0b1220", accent: "#22d3ee", text: "#ecfeff" },
  { name: "Rose", bg: "#fbf1f4", accent: "#e11d48", text: "#0a0a0a" },
];

/* Servers shown in the interactive theme preview. Auto-cycles every few
 * seconds so the demo feels alive — you can also click a server to switch
 * manually. The "${theme}" token in messages is replaced at render time. */
type PreviewServer = {
  id: string;
  name: string;
  icon: "letter" | string; // "letter" or an image url
  letter?: string;
  channels: { name: string; active?: boolean; mentions?: number }[];
  messages: {
    user: string;
    avatar: "accent" | "muted" | string;
    text: string;
    badge?: "bot" | "mod";
  }[];
  typing?: { user: string; avatar: "accent" | "muted" | string };
};

const PREVIEW_SERVERS: PreviewServer[] = [
  {
    id: "gangio",
    name: "Gangio HQ",
    icon: "letter",
    letter: "g",
    channels: [
      { name: "general" },
      { name: "announcements", active: true, mentions: 2 },
      { name: "off-topic" },
    ],
    messages: [
      {
        user: "luna",
        avatar: "accent",
        text: "pick any color you want — it's your server.",
      },
      {
        user: "kai",
        avatar: "muted",
        text: "this theme is ${theme}. nice.",
      },
    ],
    typing: { user: "korybantes", avatar: "accent" },
  },
  {
    id: "design",
    name: "Design Lab",
    icon: serverIcon1,
    channels: [
      { name: "showcase", active: true },
      { name: "feedback", mentions: 1 },
      { name: "resources" },
    ],
    messages: [
      {
        user: "ren",
        avatar: "accent",
        text: "shipped a new wordmark — thoughts?",
      },
      {
        user: "noor",
        avatar: "muted",
        text: "buttery. ship it.",
      },
    ],
    typing: { user: "milo", avatar: "muted" },
  },
  {
    id: "voice",
    name: "Late Night Voice",
    icon: serverIcon2,
    channels: [
      { name: "lobby", active: true },
      { name: "music" },
      { name: "gaming", mentions: 4 },
    ],
    messages: [
      {
        user: "korybantes",
        avatar: "accent",
        text: "joining voice in 2",
      },
      {
        user: "alex",
        avatar: "muted",
        text: "lfg. queue up?",
      },
    ],
    typing: { user: "luna", avatar: "accent" },
  },
];

const MEGAMENU: Record<
  string,
  {
    title: string;
    columns: {
      heading: string;
      items: {
        icon: any;
        label: string;
        desc: string;
        href: string;
      }[];
    }[];
    feature?: { title: string; desc: string; href: string; cta: string };
  }
> = {
  product: {
    title: "Product",
    columns: [
      {
        heading: "Chat",
        items: [
          {
            icon: FiHash,
            label: "Channels & DMs",
            desc: "Group chats, threads, reactions, and search.",
            href: "#features",
          },
          {
            icon: FiHeadphones,
            label: "Voice & video",
            desc: "HD voice, video calls, and screen sharing.",
            href: "#voice",
          },
        ],
      },
      {
        heading: "Make it yours",
        items: [
          {
            icon: FiDroplet,
            label: "Themes",
            desc: "Six built-in themes plus full CSS support.",
            href: "#themes",
          },
          {
            icon: FiCode,
            label: "Bots & API",
            desc: "First-class public API for builders.",
            href: "#features",
          },
        ],
      },
    ],
    feature: {
      title: "Stream HD in 60FPS",
      desc: "Crystal-clear voice, 1080p video, and game-ready screen sharing — all built in.",
      href: "#voice",
      cta: "See it in action",
    },
  },
  download: {
    title: "Download",
    columns: [
      {
        heading: "Desktop",
        items: [
          {
            icon: IoLogoMicrosoft,
            label: "Windows",
            desc: "Native installer for Windows 10 & 11.",
            href: "/download#windows",
          },
          {
            icon: IoLogoApple,
            label: "macOS",
            desc: "Universal DMG — Apple Silicon & Intel.",
            href: "/download#macos",
          },
          {
            icon: FiHardDrive,
            label: "Linux",
            desc: "AppImage, .deb, .rpm builds.",
            href: "/download#linux",
          },
        ],
      },
      {
        heading: "Mobile & Web",
        items: [
          {
            icon: IoLogoApple,
            label: "iOS — TestFlight",
            desc: "Public beta on iPhone and iPad.",
            href: "/download#ios",
          },
          {
            icon: BiRegularGlobe,
            label: "Web app",
            desc: "Use Gangio in any modern browser.",
            href: URLS.login,
          },
          {
            icon: FiGithub,
            label: "All releases",
            desc: "Source builds and changelogs on GitHub.",
            href: "https://github.com/Gangio-App/for-desktop/releases",
          },
        ],
      },
    ],
    feature: {
      title: "We'll pick the right build for you",
      desc: "The download page auto-detects your OS so you never grab the wrong installer.",
      href: "/download",
      cta: "Open download page",
    },
  },
  resources: {
    title: "Resources",
    columns: [
      {
        heading: "Get Gangio",
        items: [
          {
            icon: FiDownload,
            label: "Download",
            desc: "Native apps for Windows, macOS, and iOS.",
            href: "/#download",
          },
          {
            icon: FiCompass,
            label: "Discover",
            desc: "Find communities to join right now.",
            href: "/discover/servers",
          },
        ],
      },
      {
        heading: "Trust & Safety",
        items: [
          {
            icon: FiShield,
            label: "Safety Center",
            desc: "Tools, blocking, reports, and crisis resources.",
            href: "/safety",
          },
          {
            icon: FiUsers,
            label: "Community Guidelines",
            desc: "How we keep Gangio kind and inclusive.",
            href: "/guidelines",
          },
          {
            icon: FiBookOpen,
            label: "Privacy Policy",
            desc: "What we collect, why, and your data rights.",
            href: "/privacy",
          },
          {
            icon: FiCoffee,
            label: "Buy me a coffee",
            desc: "Support development. Keep Gangio free forever.",
            href: URLS.donate,
          },
        ],
      },
    ],
    feature: {
      title: "Open source. Always.",
      desc: "Audit our code. Self-host. Fork it. The privacy policy is short enough to actually read.",
      href: "/privacy",
      cta: "Read the policy",
    },
  },
};

const MENU_KEYS = Object.keys(MEGAMENU);

/* Inline Bluesky butterfly logo (solid-icons has no stable Bluesky export). */
function BlueskyIcon(props: { size?: number }) {
  const s = props.size ?? 16;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M5.9 3.7c2.7 2 5.6 6.2 6.7 8.4 1-2.2 4-6.4 6.7-8.4 1.9-1.4 5.1-2.6 5.1 1.1 0 .7-.4 6.1-.7 7-1 3-4 3.7-6.7 3.3 4.7.8 5.9 3.5 3.3 6.2-5 5.1-7.2-1.3-7.7-2.9-.1-.3-.2-.5-.2-.5s-.1.2-.2.5c-.5 1.7-2.7 8.1-7.7 3-2.6-2.7-1.4-5.4 3.3-6.2-2.7.4-5.7-.3-6.6-3.3-.3-.9-.7-6.3-.7-7C.5 1.1 3.7 2.3 5.6 3.7h.3z" />
    </svg>
  );
}

/* ---------------- component ---------------- */

export function Landing() {
  // Hide landing entirely on the Electron desktop app — that build only
  // ever needs the login page to bootstrap into the app shell.
  if (
    typeof window !== "undefined" &&
    typeof (window as any).native !== "undefined"
  ) {
    if (typeof window.location !== "undefined") {
      window.location.replace("/login/auth");
    }
    return null;
  }

  const [theme, setTheme] = createSignal(0);
  const [openMenu, setOpenMenu] = createSignal<string | null>(null);
  const [lastMenu, setLastMenu] = createSignal<string>(MENU_KEYS[0]);
  const [drawerOpen, setDrawerOpen] = createSignal(false);

  /* Interactive theme-preview state */
  const [activeServer, setActiveServer] = createSignal(0);
  const [messageKey, setMessageKey] = createSignal(0);
  const [showTyping, setShowTyping] = createSignal(false);
  /* When the user manually picks a server / theme, freeze auto-cycle for
   * a while so the demo doesn't fight their interaction. */
  let pauseUntil = 0;
  const pauseAutoCycle = (ms = 12000) => {
    pauseUntil = Date.now() + ms;
  };

  const server = () => PREVIEW_SERVERS[activeServer()];

  const activeMenuIndex = () => MENU_KEYS.indexOf(lastMenu());

  const isIOS = createMemo(() =>
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent),
  );

  const t = () => THEMES[theme()];

  let rootRef: HTMLDivElement | undefined;
  let heroShotRef: HTMLDivElement | undefined;
  let heroSectionRef: HTMLDivElement | undefined;
  const triggers: ScrollTrigger[] = [];

  let menuCloseTimer: ReturnType<typeof setTimeout> | undefined;
  const openMenuFor = (key: string) => {
    if (menuCloseTimer) clearTimeout(menuCloseTimer);
    setLastMenu(key);
    setOpenMenu(key);
  };
  const scheduleClose = () => {
    if (menuCloseTimer) clearTimeout(menuCloseTimer);
    menuCloseTimer = setTimeout(() => setOpenMenu(null), 120);
  };

  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    // The Landing root is itself the scroll container (height:100%; overflow:auto),
    // so ScrollTrigger needs to read scroll events from it, not from window.
    const scroller = rootRef;

    // Hero screenshot scales up + flattens as the user scrolls through the hero.
    if (heroShotRef && heroSectionRef) {
      gsap.set(heroShotRef, {
        scale: 0.78,
        rotateX: 14,
        y: 0,
        transformPerspective: 1400,
        transformOrigin: "50% 0%",
      });

      const t1 = ScrollTrigger.create({
        scroller,
        trigger: heroSectionRef,
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
        animation: gsap.to(heroShotRef, {
          scale: 1,
          rotateX: 0,
          ease: "none",
        }),
      });
      triggers.push(t1);
    }

    // Subtle scroll-driven reveal for sections (translateY only — no opacity
    // hiding, so content stays visible if JS fails).
    const revealTargets =
      rootRef?.querySelectorAll<HTMLElement>("[data-reveal]") ??
      document.querySelectorAll<HTMLElement>("[data-reveal]");
    revealTargets.forEach((el) => {
      gsap.set(el, { y: 28 });
      const t = ScrollTrigger.create({
        scroller,
        trigger: el,
        start: "top 85%",
        once: true,
        animation: gsap.to(el, { y: 0, duration: 0.8, ease: "power3.out" }),
      });
      triggers.push(t);
    });

    // Recompute positions after fonts/images settle (otherwise start/end
    // can be measured before layout stabilises and the hero never fires).
    ScrollTrigger.refresh();
  });

  /* Theme-preview "alive" loop: every 5.5s nudge to the next server, with a
   * typing indicator appearing 2.5s after each switch and clearing 2s
   * later. Pauses for ~12s after any manual interaction so the demo
   * doesn't talk over the user. */
  let previewTimer: ReturnType<typeof setInterval> | undefined;
  let typingTimer: ReturnType<typeof setTimeout> | undefined;
  let typingHideTimer: ReturnType<typeof setTimeout> | undefined;

  const scheduleTyping = () => {
    if (typingTimer) clearTimeout(typingTimer);
    if (typingHideTimer) clearTimeout(typingHideTimer);
    setShowTyping(false);
    typingTimer = setTimeout(() => {
      setShowTyping(true);
      typingHideTimer = setTimeout(() => setShowTyping(false), 2200);
    }, 2400);
  };

  onMount(() => {
    scheduleTyping();
    previewTimer = setInterval(() => {
      if (Date.now() < pauseUntil) return;
      setActiveServer((i) => (i + 1) % PREVIEW_SERVERS.length);
      setMessageKey((k) => k + 1);
      scheduleTyping();
    }, 5500);
  });

  onCleanup(() => {
    triggers.forEach((t) => t.kill());
    if (previewTimer) clearInterval(previewTimer);
    if (typingTimer) clearTimeout(typingTimer);
    if (typingHideTimer) clearTimeout(typingHideTimer);
  });

  const selectServer = (i: number) => {
    if (i === activeServer()) return;
    setActiveServer(i);
    setMessageKey((k) => k + 1);
    scheduleTyping();
    pauseAutoCycle();
  };

  const selectTheme = (i: number) => {
    setTheme(i);
    pauseAutoCycle();
  };

  return (
    <Root ref={rootRef}>
      {/* NAV */}
      <Nav data-menu-open={openMenu() !== null ? "true" : undefined}>
        <NavInner>
          <a href="/" class={brandLink()} aria-label="Gangio home">
            <Wordmark
              class={css({
                height: "26px",
                width: "auto",
                color: "#0a0a0a",
              })}
            />
          </a>

          <NavLinks>
            <For each={Object.entries(MEGAMENU)}>
              {([key, menu]) => (
                <NavMenuItem
                  onMouseEnter={() => openMenuFor(key)}
                  onMouseLeave={scheduleClose}
                  onFocusIn={() => openMenuFor(key)}
                  onFocusOut={scheduleClose}
                >
                  <NavMenuTrigger
                    type="button"
                    data-active={openMenu() === key ? "true" : undefined}
                    aria-expanded={openMenu() === key}
                  >
                    {menu.title}
                  </NavMenuTrigger>
                </NavMenuItem>
              )}
            </For>
            <NavMenuItem>
              <NavLinkPlain href="/discover/servers">Discover</NavLinkPlain>
            </NavMenuItem>
          </NavLinks>

          <NavCtas>
            <a class={primaryBtn()} href={URLS.login}>
              Open app
              <FiArrowRight size={14} />
            </a>
            <NavBurger
              type="button"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <FiMenu size={22} />
            </NavBurger>
          </NavCtas>
        </NavInner>

        {/* Megamenu panel — renders ALL menus in a track for swipe transitions */}
        <MegamenuWrap
          data-open={openMenu() !== null ? "true" : undefined}
          onMouseEnter={() => {
            if (menuCloseTimer) clearTimeout(menuCloseTimer);
          }}
          onMouseLeave={scheduleClose}
        >
          <MegamenuClip>
            <MegamenuTrack
              style={{
                transform: `translateX(calc(var(--mm-w) * ${-activeMenuIndex()}))`,
              }}
            >
              <For each={Object.values(MEGAMENU)}>
                {(menu) => (
                  <MegamenuPanelOuter>
                    <MegamenuPanel>
                      <MegamenuColumns>
                        <For each={menu.columns}>
                          {(col) => (
                            <MegamenuCol>
                              <MegamenuHeading>{col.heading}</MegamenuHeading>
                              <For each={col.items}>
                                {(item) => (
                                  <MegamenuItem
                                    href={item.href}
                                    onClick={() => setOpenMenu(null)}
                                    target={
                                      item.href.startsWith("http")
                                        ? "_blank"
                                        : undefined
                                    }
                                    rel={
                                      item.href.startsWith("http")
                                        ? "noopener noreferrer"
                                        : undefined
                                    }
                                  >
                                    <MegamenuItemIcon>
                                      <item.icon size={18} />
                                    </MegamenuItemIcon>
                                    <div>
                                      <MegamenuItemTitle>
                                        {item.label}
                                      </MegamenuItemTitle>
                                      <MegamenuItemDesc>
                                        {item.desc}
                                      </MegamenuItemDesc>
                                    </div>
                                  </MegamenuItem>
                                )}
                              </For>
                            </MegamenuCol>
                          )}
                        </For>
                      </MegamenuColumns>
                      <Show when={menu.feature}>
                        {(feat) => (
                          <MegamenuFeature
                            href={feat().href}
                            onClick={() => setOpenMenu(null)}
                          >
                            <MegamenuFeatureBadge>
                              <FiZap size={12} />
                              Featured
                            </MegamenuFeatureBadge>
                            <MegamenuFeatureTitle>
                              {feat().title}
                            </MegamenuFeatureTitle>
                            <MegamenuFeatureDesc>
                              {feat().desc}
                            </MegamenuFeatureDesc>
                            <MegamenuFeatureCta>
                              {feat().cta} <FiArrowRight size={14} />
                            </MegamenuFeatureCta>
                          </MegamenuFeature>
                        )}
                      </Show>
                    </MegamenuPanel>
                  </MegamenuPanelOuter>
                )}
              </For>
            </MegamenuTrack>
          </MegamenuClip>
        </MegamenuWrap>
      </Nav>

      {/* Backdrop blur for megamenu */}
      <PageBlur data-open={openMenu() !== null ? "true" : undefined} />

      {/* Mobile drawer */}
      <Show when={drawerOpen()}>
        <DrawerScrim onClick={() => setDrawerOpen(false)} />
        <Drawer>
          <DrawerHeader>
            <Wordmark
              class={css({ height: "24px", color: "#0a0a0a" })}
            />
            <DrawerClose
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            >
              <FiX size={22} />
            </DrawerClose>
          </DrawerHeader>
          <DrawerLinks>
            <For each={Object.values(MEGAMENU)}>
              {(menu) => (
                <>
                  <DrawerHeading>{menu.title}</DrawerHeading>
                  <For each={menu.columns.flatMap((c) => c.items)}>
                    {(item) => (
                      <DrawerLink
                        href={item.href}
                        onClick={() => setDrawerOpen(false)}
                      >
                        <item.icon size={18} />
                        {item.label}
                      </DrawerLink>
                    )}
                  </For>
                </>
              )}
            </For>
            <DrawerHeading>More</DrawerHeading>
            <DrawerLink
              href="/discover/servers"
              onClick={() => setDrawerOpen(false)}
            >
              <FiCompass size={18} />
              Discover
            </DrawerLink>
          </DrawerLinks>
          <DrawerCta>
            <a class={primaryBtnLg()} href={URLS.login}>
              Open app
              <FiArrowRight size={16} />
            </a>
          </DrawerCta>
        </Drawer>
      </Show>

      {/* HERO */}
      <Hero ref={heroSectionRef}>
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

          <Show
            when={isIOS()}
            fallback={
              <CtaRow>
                <a class={primaryBtnLg()} href={URLS.signup}>
                  Get started — it's free
                  <FiArrowRight size={16} />
                </a>
                <a
                  class={cx(ghostBtnLg(), hideOnMobile())}
                  href="#download"
                >
                  Download the app
                </a>
              </CtaRow>
            }
          >
            <IosHeroBanner>
              <IosHeroBadge>
                <IoLogoApple size={16} /> You're on iOS
              </IosHeroBadge>
              <IosHeroText>
                Get the public TestFlight beta — Gangio runs natively on
                iPhone and iPad.
              </IosHeroText>
              <IosHeroCtas>
                <a
                  class={primaryBtnLg()}
                  href={URLS.ios}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join iOS TestFlight
                  <FiArrowUpRight size={16} />
                </a>
                <a class={ghostBtnLg()} href={URLS.signup}>
                  Or use the web app
                </a>
              </IosHeroCtas>
            </IosHeroBanner>
          </Show>

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

        <HeroShotWrap>
          <HeroShot ref={heroShotRef}>
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
          <HeroShotGlow />
        </HeroShotWrap>
      </Hero>

      {/* HEADLINE STATEMENT */}
      <BigStatement data-reveal>
        <BigStatementText>
          Chat that actually <Accent>feels like chat.</Accent>
        </BigStatementText>
        <BigStatementSub>
          Built for the way people really hang out online — not for ad revenue,
          not for investors, not for growth metrics.
        </BigStatementSub>
      </BigStatement>

      {/* VOICE & VIDEO */}
      <DarkSection id="voice" data-reveal>
        <VoiceHeader>
          <SectionEyebrow data-on-dark>Voice & Video</SectionEyebrow>
          <VoiceTitle>
            Stream it.<br />
            Game it.<br />
            <Accent>Live it.</Accent>
          </VoiceTitle>
          <VoiceLead>
            Drop into a voice channel and talk. Stream your screen in full HD.
            Jump on a video call. Noise suppression, echo cancellation, and
            low-latency voice — all built in. No plugins. No pro tier.
          </VoiceLead>
        </VoiceHeader>

        <StreamCard>
          {/* Top HUD bar */}
          <StreamHud>
            <StreamHudLeft>
              <LiveBadge>
                <LiveDot />
                <span>LIVE</span>
              </LiveBadge>
              <StreamMeta>
                <StreamTitle>luna's stream</StreamTitle>
                <StreamSub>Valorant · 1080p · 60FPS</StreamSub>
              </StreamMeta>
            </StreamHudLeft>
            <StreamHudRight>
              <StreamStat>
                <StreamStatDot data-color="green" />
                <span>24 watching</span>
              </StreamStat>
              <StreamStat>
                <span>00:14:32</span>
              </StreamStat>
            </StreamHudRight>
          </StreamHud>

          {/* The stream itself */}
          <StreamStage>
            <StreamVideo
              src={streamVideo}
              autoplay
              muted
              loop
              playsinline
              preload="metadata"
              aria-label="Gangio screen-share preview"
            />

            {/* On-screen quality overlay */}
            <QualityChip>
              <QualityDot />
              1080p · 60
            </QualityChip>

            {/* Floating chat overlay (right side) */}
            <ChatOverlay>
              <ChatLine>
                <ChatName style={{ color: "#22d3ee" }}>kai</ChatName>{" "}
                <ChatText>nice clutch</ChatText>
              </ChatLine>
              <ChatLine>
                <ChatName style={{ color: "#f472b6" }}>nova</ChatName>{" "}
                <ChatText>1v3 incoming</ChatText>
              </ChatLine>
              <ChatLine>
                <ChatName style={{ color: "#34d399" }}>finn</ChatName>{" "}
                <ChatText>GG GG GG</ChatText>
              </ChatLine>
            </ChatOverlay>
          </StreamStage>

          {/* Participants strip */}
          <ParticipantStrip>
            <ParticipantStripLabel>
              In voice · 4 connected
            </ParticipantStripLabel>
            <ParticipantList>
              <Participant data-streaming="true">
                <ParticipantAvatar style={{ background: "#7c5cff" }}>
                  L
                  <StreamingBadge>LIVE</StreamingBadge>
                </ParticipantAvatar>
                <ParticipantInfo>
                  <ParticipantName>luna</ParticipantName>
                  <ParticipantStatus>Streaming</ParticipantStatus>
                </ParticipantInfo>
              </Participant>

              <Participant>
                <ParticipantAvatar style={{ background: "#22d3ee" }}>
                  K
                </ParticipantAvatar>
                <ParticipantInfo>
                  <ParticipantName>kai</ParticipantName>
                  <ParticipantWave>
                    <WaveBar style={{ "--h": "30%" }} />
                    <WaveBar style={{ "--h": "70%" }} />
                    <WaveBar style={{ "--h": "50%" }} />
                    <WaveBar style={{ "--h": "85%" }} />
                  </ParticipantWave>
                </ParticipantInfo>
              </Participant>

              <Participant data-muted="true">
                <ParticipantAvatar style={{ background: "#f472b6" }}>
                  N
                </ParticipantAvatar>
                <ParticipantInfo>
                  <ParticipantName>nova</ParticipantName>
                  <ParticipantStatus data-muted>Muted</ParticipantStatus>
                </ParticipantInfo>
              </Participant>

              <Participant>
                <ParticipantAvatar style={{ background: "#34d399" }}>
                  F
                </ParticipantAvatar>
                <ParticipantInfo>
                  <ParticipantName>finn</ParticipantName>
                  <ParticipantWave>
                    <WaveBar style={{ "--h": "60%" }} />
                    <WaveBar style={{ "--h": "40%" }} />
                    <WaveBar style={{ "--h": "75%" }} />
                  </ParticipantWave>
                </ParticipantInfo>
              </Participant>
            </ParticipantList>

            {/* Control bar */}
            <ControlBar>
              <ControlBtn type="button" aria-label="Mic">
                <FiMic size={18} />
              </ControlBtn>
              <ControlBtn type="button" aria-label="Camera">
                <FiVideo size={18} />
              </ControlBtn>
              <ControlBtn type="button" data-active aria-label="Share screen">
                <FiMonitor size={18} />
              </ControlBtn>
              <ControlBtn type="button" data-danger aria-label="Leave">
                <FiPhoneOff size={18} />
              </ControlBtn>
            </ControlBar>
          </ParticipantStrip>
        </StreamCard>

        <VoiceFeatures>
          <VoiceFeature>
            <VoiceFeatureNum>01</VoiceFeatureNum>
            <VoiceFeatureTitle>HD screen sharing</VoiceFeatureTitle>
            <VoiceFeatureDesc>
              Share a window, tab, or your whole display in up to 1080p 60fps —
              game nights, watch parties, pair programming.
            </VoiceFeatureDesc>
          </VoiceFeature>
          <VoiceFeature>
            <VoiceFeatureNum>02</VoiceFeatureNum>
            <VoiceFeatureTitle>Low-latency voice</VoiceFeatureTitle>
            <VoiceFeatureDesc>
              Server-based voice channels with noise suppression and echo
              cancellation, so you sound like yourself.
            </VoiceFeatureDesc>
          </VoiceFeature>
          <VoiceFeature>
            <VoiceFeatureNum>03</VoiceFeatureNum>
            <VoiceFeatureTitle>Video calls</VoiceFeatureTitle>
            <VoiceFeatureDesc>
              1-on-1 or group video with mute, deafen, and camera controls
              right where you expect them.
            </VoiceFeatureDesc>
          </VoiceFeature>
        </VoiceFeatures>
      </DarkSection>

      {/* DOWNLOAD */}
      <Section id="download" data-reveal>
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

      {/* FEATURES */}
      <Section id="features" data-reveal>
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
      <ThemesSection id="themes" data-reveal>
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
          {/* Top window chrome — fake macOS traffic lights + server name */}
          <ThemePreviewChrome
            style={{ borderColor: `${t().text}10` }}
          >
            <ChromeDots>
              <ChromeDot style={{ background: "#ff5f57" }} />
              <ChromeDot style={{ background: "#febc2e" }} />
              <ChromeDot style={{ background: "#28c840" }} />
            </ChromeDots>
            <ChromeServerName style={{ color: `${t().text}aa` }}>
              {server().name}
            </ChromeServerName>
            <ChromePresence>
              <PresenceDot style={{ background: "#22c55e" }} />
              <span style={{ color: `${t().text}aa` }}>online</span>
            </ChromePresence>
          </ThemePreviewChrome>

          <ThemePreviewBody>
            <ThemePreviewSidebar
              style={{ borderColor: `${t().text}15` }}
            >
              <For each={PREVIEW_SERVERS}>
                {(s, i) => (
                  <ServerButton
                    type="button"
                    aria-label={`Switch to ${s.name}`}
                    data-active={activeServer() === i() ? "true" : undefined}
                    onClick={() => selectServer(i())}
                    style={{
                      "--ind-color": t().accent,
                    }}
                  >
                    <ServerActiveBar
                      style={{ background: t().accent }}
                    />
                    <Show
                      when={s.icon === "letter"}
                      fallback={
                        <ServerImg
                          src={s.icon}
                          alt={s.name}
                          style={{
                            "box-shadow": activeServer() === i()
                              ? `0 0 0 2px ${t().bg}, 0 0 0 4px ${t().accent}`
                              : "none",
                          }}
                        />
                      }
                    >
                      <ServerLetter
                        style={{
                          background:
                            activeServer() === i()
                              ? t().accent
                              : `${t().text}12`,
                          color:
                            activeServer() === i()
                              ? "#fff"
                              : `${t().text}aa`,
                          "box-shadow": activeServer() === i()
                            ? `0 0 0 2px ${t().bg}, 0 0 0 4px ${t().accent}`
                            : "none",
                        }}
                      >
                        {s.letter}
                      </ServerLetter>
                    </Show>
                  </ServerButton>
                )}
              </For>
              <ServerDivider style={{ background: `${t().text}12` }} />
              <ServerAdd style={{
                background: `${t().text}08`,
                color: `${t().text}66`,
                borderColor: `${t().text}18`,
              }}>
                +
              </ServerAdd>
            </ThemePreviewSidebar>

            <ThemePreviewChannels
              style={{ borderColor: `${t().text}15` }}
            >
              <ThemePreviewLabel style={{ color: `${t().text}60` }}>
                {server().name.toUpperCase()}
              </ThemePreviewLabel>
              <For each={server().channels}>
                {(ch) => (
                  <ThemePreviewChannel
                    data-active={ch.active ? "true" : undefined}
                    style={{
                      color: ch.active ? t().text : `${t().text}70`,
                      background: ch.active
                        ? `${t().accent}20`
                        : "transparent",
                    }}
                  >
                    <span># {ch.name}</span>
                    <Show when={ch.mentions}>
                      <MentionPill style={{ background: t().accent }}>
                        {ch.mentions}
                      </MentionPill>
                    </Show>
                  </ThemePreviewChannel>
                )}
              </For>

              <ChannelsSpacer />

              {/* Voice channels block at the bottom of the channel list */}
              <ThemePreviewLabel style={{ color: `${t().text}60` }}>
                VOICE
              </ThemePreviewLabel>
              <VoiceChannel style={{ color: `${t().text}80` }}>
                <FiHeadphones size={11} />
                <span>General Voice</span>
                <VoicePulse style={{ background: t().accent }} />
              </VoiceChannel>
            </ThemePreviewChannels>

            <ThemePreviewMainCol>
              {/* Channel header */}
              <ChannelHeader
                style={{ borderColor: `${t().text}10` }}
              >
                <ChannelHeaderHash style={{ color: `${t().text}60` }}>
                  #
                </ChannelHeaderHash>
                <ChannelHeaderName style={{ color: t().text }}>
                  {(server().channels.find((c) => c.active)?.name) ??
                    server().channels[0].name}
                </ChannelHeaderName>
                <ChannelHeaderDivider
                  style={{ background: `${t().text}20` }}
                />
                <ChannelHeaderTopic style={{ color: `${t().text}66` }}>
                  pick a theme, build your vibe.
                </ChannelHeaderTopic>
              </ChannelHeader>

              {/* Animated message list — keyed by activeServer + messageKey so
                  the entrance animation replays on every switch. */}
              <ThemePreviewMain data-key={messageKey()}>
                <For each={server().messages}>
                  {(m, i) => (
                    <ThemePreviewMessage
                      style={{ "animation-delay": `${i() * 90}ms` }}
                    >
                      <ThemePreviewAvatar
                        style={{
                          background:
                            m.avatar === "accent"
                              ? t().accent
                              : m.avatar === "muted"
                              ? `${t().text}30`
                              : m.avatar,
                        }}
                      />
                      <ThemePreviewMessageBody>
                        <ThemePreviewMessageRow>
                          <ThemePreviewName style={{ color: t().text }}>
                            {m.user}
                          </ThemePreviewName>
                          <Show when={m.badge}>
                            <UserBadge
                              style={{
                                background: t().accent,
                                color: "#fff",
                              }}
                            >
                              {m.badge}
                            </UserBadge>
                          </Show>
                          <MessageTime style={{ color: `${t().text}40` }}>
                            now
                          </MessageTime>
                        </ThemePreviewMessageRow>
                        <ThemePreviewText
                          style={{ color: `${t().text}cc` }}
                        >
                          {m.text.replace(
                            "${theme}",
                            t().name.toLowerCase(),
                          )}
                        </ThemePreviewText>
                      </ThemePreviewMessageBody>
                    </ThemePreviewMessage>
                  )}
                </For>

                {/* Typing indicator */}
                <Show when={showTyping() && server().typing}>
                  <TypingRow>
                    <ThemePreviewAvatar
                      style={{
                        background:
                          server().typing!.avatar === "accent"
                            ? t().accent
                            : `${t().text}30`,
                        width: "24px",
                        height: "24px",
                      }}
                    />
                    <TypingBubble
                      style={{
                        background: `${t().text}10`,
                        color: `${t().text}cc`,
                      }}
                    >
                      <strong style={{ color: t().text }}>
                        {server().typing!.user}
                      </strong>{" "}
                      is typing
                      <TypingDots>
                        <TypingDot
                          style={{
                            background: `${t().text}aa`,
                            "animation-delay": "0ms",
                          }}
                        />
                        <TypingDot
                          style={{
                            background: `${t().text}aa`,
                            "animation-delay": "160ms",
                          }}
                        />
                        <TypingDot
                          style={{
                            background: `${t().text}aa`,
                            "animation-delay": "320ms",
                          }}
                        />
                      </TypingDots>
                    </TypingBubble>
                  </TypingRow>
                </Show>
              </ThemePreviewMain>

              {/* Composer */}
              <ChatComposer
                style={{
                  background: `${t().text}08`,
                  borderColor: `${t().text}12`,
                }}
              >
                <ComposerPlus style={{ color: `${t().text}60` }}>
                  +
                </ComposerPlus>
                <ComposerPlaceholder style={{ color: `${t().text}50` }}>
                  Message #
                  {(server().channels.find((c) => c.active)?.name) ??
                    server().channels[0].name}
                </ComposerPlaceholder>
                <ComposerSendCircle
                  style={{ background: t().accent }}
                  aria-hidden="true"
                />
              </ChatComposer>
            </ThemePreviewMainCol>
          </ThemePreviewBody>
        </ThemePreview>

        <ThemeSwatches>
          <For each={THEMES}>
            {(th, i) => (
              <ThemeSwatch
                type="button"
                data-active={theme() === i() ? "true" : undefined}
                onClick={() => selectTheme(i())}
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

      {/* FINAL CTA */}
      <FinalSection data-reveal>
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
              <FiArrowRight size={16} />
            </a>
            <Show
              when={isIOS()}
              fallback={
                <a
                  class={cx(ghostBtnDarkLg(), hideOnMobile())}
                  href="#download"
                >
                  Download for desktop
                </a>
              }
            >
              <a
                class={ghostBtnDarkLg()}
                href={URLS.ios}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IoLogoApple size={18} />
                Get on iOS — TestFlight
              </a>
            </Show>
          </CtaRow>
        </FinalWrap>
      </FinalSection>

      {/* DONATION BANNER */}
      <DonateBanner data-reveal>
        <DonateInner>
          <DonateLeft>
            <DonateIconCircle>
              <FiHeart size={18} />
            </DonateIconCircle>
            <DonateCopy>
              <DonateTitle>Support an independent platform</DonateTitle>
              <DonateText>
                Gangio is built by a tiny team. Your donation funds servers,
                development, and keeps the app free forever.
              </DonateText>
            </DonateCopy>
          </DonateLeft>
          <DonateCta
            href={URLS.donate}
            target="_blank"
            rel="noopener noreferrer"
          >
            Donate <FiArrowRight size={14} />
          </DonateCta>
        </DonateInner>
      </DonateBanner>

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
              <FooterColTitle>App</FooterColTitle>
              <a href={URLS.login}>Open app</a>
              <a href={URLS.ios} target="_blank" rel="noopener noreferrer">
                iOS TestFlight
              </a>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Legal</FooterColTitle>
              <a href="/terms">Terms of Service</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="/cookies">Cookie Policy</a>
              <a href="/acceptable-use">Acceptable Use</a>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Trust & Safety</FooterColTitle>
              <a href="/safety">Safety Center</a>
              <a href="/guidelines">Community Guidelines</a>
              <a href="/contact">Contact</a>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Connect</FooterColTitle>
              <a
                href={URLS.bluesky}
                target="_blank"
                rel="noopener noreferrer"
              >
                Bluesky
              </a>
              <a
                href={URLS.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                href={URLS.donate}
                target="_blank"
                rel="noopener noreferrer"
              >
                Donate Gangio
              </a>
            </FooterCol>
          </FooterCols>
        </FooterTop>

        <FooterBottom>
          <span>© {new Date().getFullYear()} Gangio</span>
          <FooterSocials>
            <FooterSocial
              href={URLS.bluesky}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bluesky"
            >
              <BlueskyIcon size={16} />
            </FooterSocial>
            <FooterSocial
              href={URLS.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <FiGithub size={16} />
            </FooterSocial>
            <FooterSocial
              href={URLS.donate}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Donate Gangio"
            >
              <FiCoffee size={16} />
            </FooterSocial>
          </FooterSocials>
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
    zIndex: 60,
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(14px) saturate(180%)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    transition: "border-color 0.2s",
    "&[data-menu-open='true']": {
      borderBottomColor: "rgba(0,0,0,0.04)",
    },
  },
});

const NavInner = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 32px",
    maxWidth: "1320px",
    margin: "0 auto",
    gap: "24px",
    "@media (max-width: 768px)": { padding: "12px 20px" },
  },
});

const brandLink = () =>
  css({
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    flexShrink: 0,
  });

const NavLinks = styled("nav", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flex: 1,
    justifyContent: "center",
    "@media (max-width: 960px)": { display: "none" },
  },
});

const NavMenuItem = styled("div", {
  base: { position: "relative", display: "flex" },
});

const NavMenuTrigger = styled("button", {
  base: {
    appearance: "none",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    color: "#444",
    fontSize: "0.92rem",
    fontWeight: 500,
    padding: "10px 14px",
    borderRadius: "8px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    transition: "color 0.15s, background 0.15s",
    "&:hover, &[data-active='true']": {
      color: "#0a0a0a",
      background: "rgba(0,0,0,0.04)",
    },
  },
});

const NavLinkPlain = styled("a", {
  base: {
    color: "#444",
    textDecoration: "none",
    fontSize: "0.92rem",
    fontWeight: 500,
    padding: "10px 14px",
    borderRadius: "8px",
    transition: "color 0.15s, background 0.15s",
    "&:hover": { color: "#0a0a0a", background: "rgba(0,0,0,0.04)" },
  },
});

const NavCtas = styled("div", {
  base: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexShrink: 0,
  },
});

const NavBurger = styled("button", {
  base: {
    display: "none",
    appearance: "none",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#0a0a0a",
    padding: "8px",
    borderRadius: "8px",
    transition: "background 0.15s",
    "&:hover": { background: "rgba(0,0,0,0.05)" },
    "@media (max-width: 960px)": { display: "inline-flex" },
  },
});

/* megamenu */

const MegamenuWrap = styled("div", {
  base: {
    "--mm-w": "min(900px, calc(100vw - 64px))",
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
    opacity: 0,
    transform: "translateY(-8px)",
    transition: "opacity 0.22s ease, transform 0.22s ease",
    "&[data-open='true']": {
      pointerEvents: "auto",
      opacity: 1,
      transform: "translateY(0)",
    },
    "@media (max-width: 960px)": { display: "none" },
  },
});

const MegamenuClip = styled("div", {
  base: {
    marginTop: "10px",
    width: "var(--mm-w)",
    overflow: "hidden",
    borderRadius: "20px",
  },
});

const MegamenuTrack = styled("div", {
  base: {
    display: "flex",
    transition: "transform 0.42s cubic-bezier(0.65, 0.05, 0.36, 1)",
    willChange: "transform",
  },
});

const MegamenuPanelOuter = styled("div", {
  base: {
    width: "var(--mm-w)",
    flexShrink: 0,
    padding: "1px",
    display: "flex",
  },
});

const MegamenuPanel = styled("div", {
  base: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "20px",
    boxShadow:
      "0 30px 80px -20px rgba(0,0,0,0.18), 0 12px 36px -10px rgba(0,0,0,0.1)",
    padding: "24px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "24px",
    width: "100%",
  },
});

const MegamenuColumns = styled("div", {
  base: {
    gridColumn: "1 / 3",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
});

const MegamenuCol = styled("div", {
  base: { display: "flex", flexDirection: "column", gap: "4px" },
});

const MegamenuHeading = styled("div", {
  base: {
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    padding: "8px 10px 4px",
  },
});

const MegamenuItem = styled("a", {
  base: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "10px",
    borderRadius: "12px",
    color: "#0a0a0a",
    textDecoration: "none",
    transition: "background 0.15s",
    "&:hover": { background: "rgba(0,0,0,0.035)" },
  },
});

const MegamenuItemIcon = styled("span", {
  base: {
    flexShrink: 0,
    width: "36px",
    height: "36px",
    display: "grid",
    placeItems: "center",
    borderRadius: "10px",
    background: "rgba(124,92,255,0.08)",
    color: "#7c5cff",
  },
});

const MegamenuItemTitle = styled("div", {
  base: {
    fontSize: "0.92rem",
    fontWeight: 700,
    color: "#0a0a0a",
    marginBottom: "2px",
  },
});

const MegamenuItemDesc = styled("div", {
  base: {
    fontSize: "0.8rem",
    color: "#666",
    lineHeight: 1.45,
  },
});

const MegamenuFeature = styled("a", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "20px",
    borderRadius: "16px",
    background: "linear-gradient(160deg, #faf7ff 0%, #f0ebff 100%)",
    color: "#0a0a0a",
    textDecoration: "none",
    border: "1px solid rgba(124,92,255,0.15)",
    transition: "transform 0.15s, box-shadow 0.15s",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 12px 30px -10px rgba(124,92,255,0.3)",
    },
  },
});

const MegamenuFeatureBadge = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#7c5cff",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
});

const MegamenuFeatureTitle = styled("div", {
  base: {
    fontSize: "1.05rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
});

const MegamenuFeatureDesc = styled("div", {
  base: {
    fontSize: "0.85rem",
    color: "#555",
    lineHeight: 1.5,
    flex: 1,
  },
});

const MegamenuFeatureCta = styled("div", {
  base: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#7c5cff",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "4px",
  },
});

const PageBlur = styled("div", {
  base: {
    position: "fixed",
    inset: 0,
    zIndex: 40,
    background: "rgba(255,255,255,0.4)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    pointerEvents: "none",
    opacity: 0,
    transition: "opacity 0.22s ease",
    "&[data-open='true']": { opacity: 1 },
  },
});

/* mobile drawer */

const DrawerScrim = styled("div", {
  base: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 70,
    backdropFilter: "blur(4px)",
    animation: "landing-fade-in 0.2s ease",
  },
});

const Drawer = styled("aside", {
  base: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "min(360px, 100vw)",
    background: "#fff",
    zIndex: 71,
    display: "flex",
    flexDirection: "column",
    boxShadow: "-20px 0 60px -10px rgba(0,0,0,0.2)",
    animation: "landing-slide-in 0.28s ease",
  },
});

const DrawerHeader = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 20px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
});

const DrawerClose = styled("button", {
  base: {
    appearance: "none",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#0a0a0a",
    padding: "6px",
    borderRadius: "8px",
    "&:hover": { background: "rgba(0,0,0,0.05)" },
  },
});

const DrawerLinks = styled("nav", {
  base: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 12px 24px",
  },
});

const DrawerHeading = styled("div", {
  base: {
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    padding: "16px 12px 6px",
  },
});

const DrawerLink = styled("a", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "10px",
    color: "#0a0a0a",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: 600,
    transition: "background 0.15s",
    "&:hover": { background: "rgba(0,0,0,0.04)" },
  },
});

const DrawerCta = styled("div", {
  base: {
    padding: "16px 20px 24px",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    "& a": { width: "100%", justifyContent: "center" },
  },
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

/* dark-section ghost button — for use on the dark FinalSection.
   Default: white text + white border, transparent bg.
   Hover: white bg + dark text. Always remains visible on dark. */
const ghostBtnDarkLg = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 24px",
    borderRadius: "12px",
    color: "#fff",
    textDecoration: "none",
    fontSize: "0.98rem",
    fontWeight: 600,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "transparent",
    transition: "all 0.15s",
    "&:hover": {
      background: "#fff",
      color: "#0a0a0a",
      borderColor: "#fff",
      transform: "translateY(-1px)",
    },
  });

/* utility — hide on mobile (< 640px) */
const hideOnMobile = () =>
  css({
    "@media (max-width: 640px)": { display: "none" },
  });

/* hero */

const Hero = styled("section", {
  base: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "56px",
    padding: "80px 32px 120px",
    maxWidth: "1320px",
    margin: "0 auto",
    overflow: "visible",
    "@media (max-width: 768px)": { padding: "56px 20px 80px", gap: "40px" },
  },
});

const HeroCopy = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "22px",
    maxWidth: "820px",
    width: "100%",
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
    fontSize: "clamp(3rem, 8.5vw, 7rem)",
    fontWeight: 900,
    lineHeight: 0.95,
    letterSpacing: "-0.05em",
    margin: 0,
  },
});

const Sub = styled("p", {
  base: {
    fontSize: "1.18rem",
    color: "#555",
    lineHeight: 1.5,
    maxWidth: "560px",
    margin: 0,
  },
});

const CtaRow = styled("div", {
  base: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "8px",
    justifyContent: "center",
    "@media (max-width: 480px)": {
      flexDirection: "column",
      width: "100%",
      "& a": { justifyContent: "center" },
    },
  },
});

const TrustRow = styled("div", {
  base: {
    display: "flex",
    gap: "22px",
    flexWrap: "wrap",
    marginTop: "12px",
    color: "#777",
    fontSize: "0.85rem",
    justifyContent: "center",
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

const HeroShotWrap = styled("div", {
  base: {
    position: "relative",
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "center",
  },
});

const HeroShot = styled("div", {
  base: {
    position: "relative",
    width: "100%",
    zIndex: 2,
    willChange: "transform",
  },
});

const HeroShotFrame = styled("div", {
  base: {
    width: "100%",
    borderRadius: "18px",
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow:
      "0 60px 140px -30px rgba(0,0,0,0.28), 0 20px 60px -20px rgba(124,92,255,0.18), 0 8px 24px -8px rgba(0,0,0,0.08)",
    background: "#f5f5f5",
  },
});

const HeroShotGlow = styled("div", {
  base: {
    position: "absolute",
    zIndex: 1,
    inset: "20% 8% -10% 8%",
    background:
      "radial-gradient(ellipse at center, rgba(124,92,255,0.35), transparent 60%)",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
});

/* iOS-only hero variant (replaces CtaRow when on iPhone/iPad) */

const IosHeroBanner = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "20px 24px",
    borderRadius: "16px",
    background: "linear-gradient(160deg, #faf7ff 0%, #f0ebff 100%)",
    border: "1px solid rgba(124,92,255,0.18)",
    width: "100%",
    maxWidth: "520px",
    marginTop: "8px",
  },
});

const IosHeroBadge = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 12px",
    borderRadius: "999px",
    background: "#0a0a0a",
    color: "#fff",
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
});

const IosHeroText = styled("p", {
  base: {
    margin: 0,
    color: "#444",
    fontSize: "0.95rem",
    lineHeight: 1.5,
    textAlign: "center",
    maxWidth: "440px",
  },
});

const IosHeroCtas = styled("div", {
  base: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    "@media (max-width: 480px)": {
      flexDirection: "column",
      "& a": { justifyContent: "center" },
    },
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

const VoiceHeader = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    maxWidth: "780px",
    margin: "0 auto 56px",
    textAlign: "center",
    alignItems: "center",
  },
});

const VoiceTitle = styled("h2", {
  base: {
    fontSize: "clamp(2.75rem, 6.5vw, 5.5rem)",
    fontWeight: 900,
    lineHeight: 0.95,
    letterSpacing: "-0.045em",
    margin: 0,
    textTransform: "none",
  },
});

const VoiceLead = styled("p", {
  base: {
    fontSize: "1.1rem",
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.55,
    maxWidth: "640px",
    margin: 0,
  },
});

/* gamer-stream card */

const StreamCard = styled("div", {
  base: {
    position: "relative",
    maxWidth: "1180px",
    margin: "0 auto",
    background: "#101117",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
    boxShadow:
      "0 60px 120px -30px rgba(124,92,255,0.5), 0 30px 80px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "20px",
      padding: "1px",
      background:
        "linear-gradient(135deg, rgba(124,92,255,0.6), rgba(124,92,255,0.05) 30%, transparent 50%, rgba(124,92,255,0.05) 70%, rgba(124,92,255,0.5))",
      WebkitMask:
        "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
      WebkitMaskComposite: "xor",
      maskComposite: "exclude",
      pointerEvents: "none",
    },
  },
});

const StreamHud = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "16px 22px",
    background: "rgba(0,0,0,0.45)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    flexWrap: "wrap",
  },
});

const StreamHudLeft = styled("div", {
  base: { display: "flex", alignItems: "center", gap: "16px" },
});

const StreamHudRight = styled("div", {
  base: { display: "flex", alignItems: "center", gap: "14px" },
});

const LiveBadge = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "6px 12px",
    borderRadius: "8px",
    background: "#ef4444",
    color: "#fff",
    fontSize: "0.78rem",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    boxShadow: "0 0 24px rgba(239,68,68,0.45)",
  },
});

const LiveDot = styled("span", {
  base: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#fff",
    animation: "landing-live 1.4s ease-in-out infinite",
  },
});

const StreamMeta = styled("div", {
  base: { display: "flex", flexDirection: "column", gap: "2px" },
});

const StreamTitle = styled("div", {
  base: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#fff",
  },
});

const StreamSub = styled("div", {
  base: {
    fontSize: "0.74rem",
    color: "rgba(255,255,255,0.5)",
    fontFamily: "ui-monospace, SFMono-Regular, monospace",
    letterSpacing: "0.04em",
  },
});

const StreamStat = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.7)",
    fontFamily: "ui-monospace, SFMono-Regular, monospace",
    fontVariantNumeric: "tabular-nums",
  },
});

const StreamStatDot = styled("span", {
  base: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#34d399",
    boxShadow: "0 0 8px #34d399",
    "&[data-color='green']": { background: "#34d399", boxShadow: "0 0 8px #34d399" },
  },
});

/* The stream stage */

const StreamStage = styled("div", {
  base: {
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 9",
    background: "#0a0a0f",
    overflow: "hidden",
  },
});

const StreamVideo = styled("video", {
  base: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 1,
  },
});

const QualityChip = styled("div", {
  base: {
    position: "absolute",
    top: "16px",
    right: "16px",
    zIndex: 3,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 10px",
    borderRadius: "6px",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(6px)",
    color: "#fff",
    fontSize: "0.72rem",
    fontWeight: 700,
    fontFamily: "ui-monospace, SFMono-Regular, monospace",
    letterSpacing: "0.04em",
    border: "1px solid rgba(255,255,255,0.1)",
  },
});

const QualityDot = styled("span", {
  base: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#34d399",
    boxShadow: "0 0 8px #34d399",
  },
});

const ChatOverlay = styled("div", {
  base: {
    position: "absolute",
    right: "16px",
    bottom: "16px",
    zIndex: 3,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    maxWidth: "260px",
    "@media (max-width: 640px)": { display: "none" },
  },
});

const ChatLine = styled("div", {
  base: {
    padding: "6px 12px",
    borderRadius: "8px",
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(8px)",
    fontSize: "0.82rem",
    border: "1px solid rgba(255,255,255,0.06)",
    animation: "landing-fade-in 0.4s ease",
  },
});

const ChatName = styled("span", {
  base: {
    fontWeight: 700,
    marginRight: "6px",
  },
});

const ChatText = styled("span", {
  base: { color: "rgba(255,255,255,0.85)" },
});

/* Participants strip (bottom of card) */

const ParticipantStrip = styled("div", {
  base: {
    padding: "18px 22px 20px",
    background: "rgba(0,0,0,0.35)",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
});

const ParticipantStripLabel = styled("div", {
  base: {
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
});

const ParticipantList = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    "@media (max-width: 760px)": { gridTemplateColumns: "repeat(2, 1fr)" },
    "@media (max-width: 420px)": { gridTemplateColumns: "1fr" },
  },
});

const Participant = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "all 0.2s",
    "&[data-streaming='true']": {
      border: "1px solid rgba(124,92,255,0.5)",
      background: "rgba(124,92,255,0.12)",
      boxShadow: "0 0 20px rgba(124,92,255,0.25)",
    },
    "&[data-muted='true']": { opacity: 0.7 },
  },
});

const ParticipantAvatar = styled("div", {
  base: {
    position: "relative",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    color: "#fff",
    fontSize: "0.95rem",
    flexShrink: 0,
  },
});

const StreamingBadge = styled("span", {
  base: {
    position: "absolute",
    bottom: "-4px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "1px 6px",
    borderRadius: "4px",
    background: "#ef4444",
    color: "#fff",
    fontSize: "0.55rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    border: "2px solid #101117",
  },
});

const ParticipantInfo = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },
});

const ParticipantName = styled("div", {
  base: {
    fontSize: "0.88rem",
    fontWeight: 700,
    color: "#fff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});

const ParticipantStatus = styled("div", {
  base: {
    fontSize: "0.72rem",
    color: "#c4b5fd",
    fontWeight: 600,
    "&[data-muted]": { color: "rgba(255,255,255,0.45)" },
  },
});

const ParticipantWave = styled("div", {
  base: {
    display: "flex",
    alignItems: "flex-end",
    gap: "2px",
    height: "12px",
  },
});

const WaveBar = styled("span", {
  base: {
    width: "2.5px",
    height: "var(--h)",
    background: "#34d399",
    borderRadius: "1.5px",
    animation: "landing-wave 0.9s ease-in-out infinite",
    "&:nth-child(2)": { animationDelay: "0.1s" },
    "&:nth-child(3)": { animationDelay: "0.2s" },
    "&:nth-child(4)": { animationDelay: "0.3s" },
    "&:nth-child(5)": { animationDelay: "0.4s" },
  },
});

const ControlBar = styled("div", {
  base: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    paddingTop: "6px",
  },
});

const ControlBtn = styled("button", {
  base: {
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: "1.1rem",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    transition: "all 0.15s",
    fontFamily: "inherit",
    "&:hover": {
      background: "rgba(255,255,255,0.1)",
      transform: "translateY(-1px)",
    },
    "&[data-active]": {
      background: "rgba(124,92,255,0.25)",
      borderColor: "rgba(124,92,255,0.5)",
      color: "#c4b5fd",
      boxShadow: "0 0 16px rgba(124,92,255,0.35)",
    },
    "&[data-danger]": {
      background: "rgba(239,68,68,0.15)",
      borderColor: "rgba(239,68,68,0.4)",
      color: "#fca5a5",
      "&:hover": { background: "rgba(239,68,68,0.25)" },
    },
  },
});

/* Voice features below the card */

const VoiceFeatures = styled("div", {
  base: {
    maxWidth: "1180px",
    margin: "64px auto 0",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
    "@media (max-width: 800px)": { gridTemplateColumns: "1fr" },
  },
});

const VoiceFeature = styled("div", {
  base: {
    padding: "28px 24px",
    background: "#0a0a0a",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "background 0.2s",
    "&:hover": { background: "#101117" },
  },
});

const VoiceFeatureNum = styled("div", {
  base: {
    fontSize: "0.74rem",
    fontWeight: 700,
    color: "#7c5cff",
    letterSpacing: "0.12em",
    marginBottom: "4px",
    fontFamily: "ui-monospace, SFMono-Regular, monospace",
  },
});

const VoiceFeatureTitle = styled("h3", {
  base: {
    fontSize: "1.15rem",
    fontWeight: 700,
    margin: 0,
    letterSpacing: "-0.01em",
  },
});

const VoiceFeatureDesc = styled("p", {
  base: {
    color: "rgba(255,255,255,0.55)",
    fontSize: "0.92rem",
    lineHeight: 1.55,
    margin: 0,
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

const ThemePreviewChrome = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    borderBottom: "1px solid",
    transition: "border-color 0.3s",
    "@media (max-width: 640px)": { padding: "8px 12px" },
  },
});

const ChromeDots = styled("div", {
  base: { display: "flex", gap: "6px", flexShrink: 0 },
});

const ChromeDot = styled("span", {
  base: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    display: "block",
  },
});

const ChromeServerName = styled("div", {
  base: {
    flex: 1,
    textAlign: "center",
    fontSize: "0.78rem",
    fontWeight: 600,
    letterSpacing: "0.01em",
    transition: "color 0.3s",
  },
});

const ChromePresence = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.72rem",
    fontWeight: 600,
    "@media (max-width: 640px)": { display: "none" },
  },
});

const PresenceDot = styled("span", {
  base: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    display: "inline-block",
    boxShadow: "0 0 0 2px rgba(34,197,94,0.25)",
  },
});

const ThemePreviewBody = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "64px 200px 1fr",
    minHeight: "380px",
    "@media (max-width: 720px)": {
      gridTemplateColumns: "56px 1fr",
      "& > :nth-child(2)": { display: "none" },
    },
  },
});

const ThemePreviewSidebar = styled("div", {
  base: {
    padding: "14px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    borderRight: "1px solid",
    transition: "border-color 0.3s",
  },
});

/* Click-able server button with a left-edge active bar (Discord/Gangio
 * style). The active indicator is positioned absolutely so the icon
 * itself never shifts when toggled. */
const ServerButton = styled("button", {
  base: {
    position: "relative",
    width: "44px",
    height: "44px",
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    transition: "transform 0.18s ease-out",
    "&:hover": { transform: "translateX(1px) scale(1.02)" },
    "&:active": { transform: "scale(0.96)" },
    "&[data-active='true']": {
      animation: "landing-fade-in 0.4s ease",
    },
  },
});

const ServerActiveBar = styled("span", {
  base: {
    position: "absolute",
    left: "-12px",
    top: "50%",
    width: "4px",
    height: "8px",
    borderRadius: "0 4px 4px 0",
    transform: "translateY(-50%) scaleY(0)",
    transformOrigin: "center",
    transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.25s",
    "[data-active='true'] > &": {
      transform: "translateY(-50%) scaleY(1)",
      height: "26px",
    },
    "button:hover:not([data-active='true']) > &": {
      transform: "translateY(-50%) scaleY(1)",
      height: "10px",
    },
  },
});

const ServerLetter = styled("div", {
  base: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    fontSize: "0.95rem",
    transition:
      "background 0.25s, color 0.25s, border-radius 0.25s, box-shadow 0.25s",
    "[data-active='true'] > &": { borderRadius: "14px" },
  },
});

const ServerImg = styled("img", {
  base: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    objectFit: "cover",
    display: "block",
    transition: "border-radius 0.25s, box-shadow 0.25s",
    "[data-active='true'] > &": { borderRadius: "14px" },
  },
});

const ServerDivider = styled("div", {
  base: {
    width: "32px",
    height: "2px",
    borderRadius: "2px",
    margin: "4px 0",
    transition: "background 0.3s",
  },
});

const ServerAdd = styled("div", {
  base: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    border: "1.5px dashed",
    display: "grid",
    placeItems: "center",
    fontSize: "1.2rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
    "&:hover": { borderRadius: "14px", transform: "scale(1.04)" },
  },
});

const ThemePreviewChannels = styled("div", {
  base: {
    padding: "16px 10px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    borderRight: "1px solid",
    transition: "border-color 0.3s",
  },
});

const ThemePreviewLabel = styled("div", {
  base: {
    fontSize: "0.62rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    padding: "8px 10px 4px",
    transition: "color 0.3s",
  },
});

const ThemePreviewChannel = styled("div", {
  base: {
    padding: "7px 10px",
    borderRadius: "6px",
    fontSize: "0.82rem",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    cursor: "pointer",
    transition: "background 0.3s, color 0.3s",
    "&:not([data-active='true']):hover": {
      background: "rgba(127,127,127,0.08)",
    },
  },
});

const MentionPill = styled("span", {
  base: {
    minWidth: "18px",
    height: "18px",
    padding: "0 6px",
    borderRadius: "999px",
    color: "#fff",
    fontSize: "0.68rem",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.3s",
    animation: "landing-pulse 2.2s ease-out infinite",
  },
});

const ChannelsSpacer = styled("div", {
  base: { flex: 1, minHeight: "20px" },
});

const VoiceChannel = styled("div", {
  base: {
    padding: "7px 10px",
    borderRadius: "6px",
    fontSize: "0.78rem",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    "& > span": { flex: 1 },
    transition: "color 0.3s",
  },
});

const VoicePulse = styled("span", {
  base: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    animation: "landing-live 1.6s ease-in-out infinite",
    transition: "background 0.3s",
  },
});

const ThemePreviewMainCol = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    minHeight: "380px",
  },
});

const ChannelHeader = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 22px",
    borderBottom: "1px solid",
    transition: "border-color 0.3s",
    "@media (max-width: 720px)": { padding: "10px 16px" },
  },
});

const ChannelHeaderHash = styled("span", {
  base: {
    fontSize: "1rem",
    fontWeight: 600,
    transition: "color 0.3s",
  },
});

const ChannelHeaderName = styled("span", {
  base: {
    fontSize: "0.95rem",
    fontWeight: 700,
    transition: "color 0.3s",
  },
});

const ChannelHeaderDivider = styled("span", {
  base: {
    width: "1px",
    height: "16px",
    transition: "background 0.3s",
  },
});

const ChannelHeaderTopic = styled("span", {
  base: {
    fontSize: "0.8rem",
    fontWeight: 500,
    transition: "color 0.3s",
    "@media (max-width: 720px)": { display: "none" },
  },
});

const ThemePreviewMain = styled("div", {
  base: {
    flex: 1,
    padding: "22px 26px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    overflow: "hidden",
    "@media (max-width: 720px)": { padding: "16px 18px" },
  },
});

const ThemePreviewMessage = styled("div", {
  base: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    animation: "landing-fade-in 0.45s ease both",
  },
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
  base: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 },
});

const ThemePreviewMessageRow = styled("div", {
  base: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
  },
});

const ThemePreviewName = styled("div", {
  base: {
    fontWeight: 700,
    fontSize: "0.88rem",
    transition: "color 0.3s",
  },
});

const UserBadge = styled("span", {
  base: {
    padding: "1px 6px",
    borderRadius: "4px",
    fontSize: "0.6rem",
    fontWeight: 800,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    transition: "background 0.3s",
  },
});

const MessageTime = styled("span", {
  base: {
    fontSize: "0.7rem",
    fontWeight: 500,
    transition: "color 0.3s",
  },
});

const ThemePreviewText = styled("div", {
  base: {
    fontSize: "0.85rem",
    lineHeight: 1.45,
    transition: "color 0.3s",
  },
});

const TypingRow = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    animation: "landing-fade-in 0.3s ease both",
  },
});

const TypingBubble = styled("div", {
  base: {
    padding: "8px 14px",
    borderRadius: "14px",
    fontSize: "0.78rem",
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    transition: "background 0.3s, color 0.3s",
    "& strong": { fontWeight: 700, marginRight: "2px", transition: "color 0.3s" },
  },
});

const TypingDots = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "3px",
    marginLeft: "6px",
  },
});

const TypingDot = styled("span", {
  base: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    display: "inline-block",
    animation: "landing-typing 1.1s ease-in-out infinite",
    transition: "background 0.3s",
  },
});

const ChatComposer = styled("div", {
  base: {
    margin: "12px 22px 18px",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "background 0.3s, border-color 0.3s",
    "@media (max-width: 720px)": { margin: "10px 16px 14px" },
  },
});

const ComposerPlus = styled("span", {
  base: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    fontSize: "1rem",
    fontWeight: 500,
    flexShrink: 0,
    transition: "color 0.3s",
  },
});

const ComposerPlaceholder = styled("span", {
  base: {
    flex: 1,
    fontSize: "0.85rem",
    fontWeight: 500,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    transition: "color 0.3s",
  },
});

const ComposerSendCircle = styled("span", {
  base: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    flexShrink: 0,
    transition: "background 0.3s",
    animation: "landing-live 2.4s ease-in-out infinite",
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

/* donation banner — sits between FinalSection and Footer */

const DonateBanner = styled("section", {
  base: {
    background: "linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)",
    color: "#fff",
    padding: "32px",
    "@media (max-width: 768px)": { padding: "28px 20px" },
  },
});

const DonateInner = styled("div", {
  base: {
    maxWidth: "1320px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    "@media (max-width: 768px)": {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "20px",
    },
  },
});

const DonateLeft = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    maxWidth: "640px",
  },
});

const DonateIconCircle = styled("div", {
  base: {
    flexShrink: 0,
    width: "40px",
    height: "40px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.15)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
});

const DonateCopy = styled("div", {
  base: { display: "flex", flexDirection: "column", gap: "4px" },
});

const DonateTitle = styled("h3", {
  base: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },
});

const DonateText = styled("p", {
  base: {
    margin: 0,
    fontSize: "0.9rem",
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.78)",
  },
});

const DonateCta = styled("a", {
  base: {
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "11px 22px",
    borderRadius: "999px",
    background: "#fff",
    color: "#4f46e5",
    fontSize: "0.92rem",
    fontWeight: 700,
    textDecoration: "none",
    transition: "transform 0.15s, box-shadow 0.15s",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 12px 28px -10px rgba(0,0,0,0.35)",
    },
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
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "24px",
    "@media (max-width: 1024px)": { gridTemplateColumns: "repeat(3, 1fr)" },
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
      gap: "12px",
      alignItems: "flex-start",
    },
  },
});

const FooterSocials = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
});

const FooterSocial = styled("a", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    background: "transparent",
    border: "1px solid rgba(0,0,0,0.1)",
    color: "#444",
    textDecoration: "none",
    transition: "all 0.15s",
    "&:hover": {
      background: "#0a0a0a",
      borderColor: "#0a0a0a",
      color: "#fff",
      transform: "translateY(-1px)",
    },
  },
});
