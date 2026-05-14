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
} from "solid-icons/bi";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiCheck,
  FiChevronDown,
  FiCoffee,
  FiCpu,
  FiDownload,
  FiGithub,
  FiHardDrive,
  FiHeart,
  FiMenu,
  FiMonitor,
  FiShield,
  FiSmartphone,
  FiUsers,
  FiX,
  FiZap,
} from "solid-icons/fi";
import { IoLogoApple, IoLogoMicrosoft } from "solid-icons/io";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import Wordmark from "../../public/assets/web/wordmark.svg?component-solid";
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
  donate: "https://buymeacoffee.com/korybantes",
  bluesky: "https://bsky.app/profile/gangio.pro",
  github: "https://github.com/Gangio-App",
  releases: "https://github.com/Gangio-App/for-desktop/releases",
};

const APP_VERSION = "1.3.16";

type OS = "windows" | "macos" | "ios" | "android" | "linux" | "unknown";

type PlatformDef = {
  id: OS;
  name: string;
  tag: string;
  desc: string;
  icon: typeof IoLogoApple;
  href: string;
  external?: boolean;
  size?: string;
  arch?: string;
  primaryCta: string;
  secondaryNote?: string;
};

const PLATFORMS: PlatformDef[] = [
  {
    id: "windows",
    name: "Windows",
    tag: `Windows 10 / 11 · x64`,
    desc: "Native installer with desktop integration, autostart, and global push-to-talk.",
    icon: IoLogoMicrosoft,
    href: URLS.windows,
    external: true,
    size: "~92 MB",
    arch: "x64 · NSIS",
    primaryCta: "Download .exe",
    secondaryNote: "After download, run the installer and follow the prompts.",
  },
  {
    id: "macos",
    name: "macOS",
    tag: "macOS 11 Big Sur or newer",
    desc: "Universal DMG built for both Apple Silicon and Intel Macs.",
    icon: IoLogoApple,
    href: URLS.macos,
    external: true,
    size: "~104 MB",
    arch: "Universal (arm64 + x64)",
    primaryCta: "Download .dmg",
    secondaryNote: "Drag Gangio into Applications and you're done.",
  },
  {
    id: "ios",
    name: "iOS",
    tag: "iPhone & iPad · Public TestFlight",
    desc: "Join the public beta on TestFlight to install Gangio on your iPhone or iPad.",
    icon: IoLogoApple,
    href: URLS.ios,
    external: true,
    primaryCta: "Join TestFlight",
    secondaryNote: "Beta — expect rapid updates and the occasional rough edge.",
  },
  {
    id: "linux",
    name: "Linux",
    tag: "AppImage · deb · rpm",
    desc: "Builds for major distributions are available on our GitHub releases page.",
    icon: FiHardDrive,
    href: URLS.releases,
    external: true,
    primaryCta: "View releases",
    secondaryNote: "Snap, Flatpak, and Pacman packages coming soon.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is Gangio really free?",
    a: "Yes, completely. Gangio is free to use, has no ads, and never sells your data. If you'd like to support development, you can drop a tip via Buy me a coffee — it's appreciated but never required.",
  },
  {
    q: "Why is the macOS app unsigned?",
    a: "Apple charges for code-signing certificates. While we work on funding that, you may need to right-click → Open the first time, or run `xattr -cr /Applications/Gangio.app` in Terminal to remove the quarantine flag.",
  },
  {
    q: "Where is the Linux build?",
    a: "Linux builds (AppImage, .deb, .rpm) are published to our GitHub releases. Native Snap and Flatpak packages are on the roadmap.",
  },
  {
    q: "Can I use Gangio without installing anything?",
    a: "Yes — the web app at gangio.pro works in any modern browser with the same features as the desktop app, including voice and video calls.",
  },
  {
    q: "How do I get the Android app?",
    a: "An Android beta is in development. Subscribe to our Bluesky for launch updates.",
  },
  {
    q: "Is the source code open?",
    a: "Yes — Gangio is open source under permissive licenses. The desktop and web clients are at github.com/Gangio-App.",
  },
];

/* Inline Bluesky butterfly logo (matching Landing). */
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

/* ---------- OS detection ---------- */

function detectOS(): OS {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as { MSStream?: unknown }).MSStream)
    return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Macintosh|Mac OS X/i.test(ua)) return "macos";
  if (/Windows NT/i.test(ua)) return "windows";
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return "linux";
  return "unknown";
}

const OS_LABEL: Record<OS, string> = {
  windows: "Windows",
  macos: "macOS",
  ios: "iOS",
  android: "Android",
  linux: "Linux",
  unknown: "your device",
};

/* ---------------- component ---------------- */

export function DownloadPage() {
  const [os, setOs] = createSignal<OS>("unknown");
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const [openFaq, setOpenFaq] = createSignal<number | null>(0);

  let rootRef: HTMLDivElement | undefined;
  let heroTitleRef: HTMLHeadingElement | undefined;
  let heroSubtitleRef: HTMLParagraphElement | undefined;
  let heroChipRef: HTMLDivElement | undefined;
  let heroCtaRef: HTMLDivElement | undefined;
  let phoneRef: HTMLDivElement | undefined;
  let phoneGlowRef: HTMLDivElement | undefined;

  const triggers: ScrollTrigger[] = [];
  const tweens: gsap.core.Tween[] = [];

  const detected = createMemo(() => os());
  const primaryPlatform = createMemo<PlatformDef | undefined>(() =>
    PLATFORMS.find((p) => p.id === detected()) ?? PLATFORMS[0],
  );
  const otherPlatforms = createMemo(() =>
    PLATFORMS.filter((p) => p.id !== primaryPlatform()?.id),
  );

  onMount(() => {
    setOs(detectOS());

    gsap.registerPlugin(ScrollTrigger);
    const scroller = rootRef;

    /* Hero entrance: stagger title → subtitle → chip → ctas */
    const heroTimeline = gsap.timeline({
      defaults: { ease: "power3.out" },
    });
    if (heroTitleRef) {
      heroTimeline.fromTo(
        heroTitleRef,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        0,
      );
    }
    if (heroSubtitleRef) {
      heroTimeline.fromTo(
        heroSubtitleRef,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        0.15,
      );
    }
    if (heroChipRef) {
      heroTimeline.fromTo(
        heroChipRef,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        0.3,
      );
    }
    if (heroCtaRef) {
      heroTimeline.fromTo(
        heroCtaRef,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        0.45,
      );
    }

    /* Phone: float continuously + drift glow */
    if (phoneRef) {
      const float = gsap.to(phoneRef, {
        y: -14,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      tweens.push(float);
    }
    if (phoneGlowRef) {
      const glowTween = gsap.to(phoneGlowRef, {
        opacity: 0.55,
        scale: 1.05,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      tweens.push(glowTween);
    }

    /* Section reveals */
    const revealTargets =
      rootRef?.querySelectorAll<HTMLElement>("[data-reveal]") ?? [];
    revealTargets.forEach((el) => {
      gsap.set(el, { y: 28, opacity: 0 });
      const t = ScrollTrigger.create({
        scroller,
        trigger: el,
        start: "top 85%",
        once: true,
        animation: gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
        }),
      });
      triggers.push(t);
    });

    ScrollTrigger.refresh();
  });

  onCleanup(() => {
    triggers.forEach((t) => t.kill());
    tweens.forEach((t) => t.kill());
  });

  const trackDownload = (platformId: OS) => {
    if (typeof window !== "undefined") {
      try {
        // eslint-disable-next-line no-console
        console.info("[download] click", platformId);
      } catch {
        /* no-op */
      }
    }
  };

  return (
    <Root ref={rootRef}>
      {/* NAV — visually identical to Landing */}
      <Nav>
        <NavInner>
          <a href="/" class={brandLink()} aria-label="Gangio home">
            <Wordmark
              class={css({ height: "26px", width: "auto", color: "#0a0a0a" })}
            />
          </a>

          <NavLinks>
            <NavLink href="/#features">Product</NavLink>
            <NavLink href="/#voice">Voice & Video</NavLink>
            <NavLink href="/download" data-active="true">
              Download
            </NavLink>
            <NavLink href="/discover/servers">Discover</NavLink>
          </NavLinks>

          <NavCtas>
            <a class={navOpenAppBtn()} href={URLS.login}>
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
      </Nav>

      {/* MOBILE DRAWER */}
      <Show when={drawerOpen()}>
        <DrawerScrim onClick={() => setDrawerOpen(false)} />
        <Drawer>
          <DrawerHeader>
            <Wordmark class={css({ height: "24px", color: "#0a0a0a" })} />
            <DrawerClose
              type="button"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            >
              <FiX size={22} />
            </DrawerClose>
          </DrawerHeader>
          <DrawerLinks>
            <DrawerHeading>Browse</DrawerHeading>
            <DrawerLink href="/" onClick={() => setDrawerOpen(false)}>
              Home
            </DrawerLink>
            <DrawerLink
              href="/#features"
              onClick={() => setDrawerOpen(false)}
            >
              Product
            </DrawerLink>
            <DrawerLink
              href="/discover/servers"
              onClick={() => setDrawerOpen(false)}
            >
              Discover
            </DrawerLink>

            <DrawerHeading>Get the app</DrawerHeading>
            <For each={PLATFORMS}>
              {(p) => (
                <DrawerLink
                  href={p.href}
                  target={p.external ? "_blank" : undefined}
                  rel={p.external ? "noopener noreferrer" : undefined}
                  onClick={() => setDrawerOpen(false)}
                >
                  {p.name}
                </DrawerLink>
              )}
            </For>
          </DrawerLinks>
          <DrawerCta>
            <a class={navOpenAppBtn()} href={URLS.login}>
              Open app
              <FiArrowRight size={16} />
            </a>
          </DrawerCta>
        </Drawer>
      </Show>

      {/* HERO */}
      <Hero>
        <HeroBg>
          <HeroBlob class={css({ top: "-120px", left: "-80px" })} />
          <HeroBlob
            class={css({
              top: "10%",
              right: "-100px",
              background:
                "radial-gradient(circle, rgba(34,211,238,0.18), transparent 70%)",
            })}
          />
        </HeroBg>

        <HeroInner>
          <HeroCopy>
            <HeroEyebrow>
              <FiDownload size={14} />
              Download
              <Pill>v{APP_VERSION}</Pill>
            </HeroEyebrow>
            <HeroTitle ref={heroTitleRef}>
              Gangio for{" "}
              <Accent>{OS_LABEL[detected()]}</Accent>
              <br />
              <Muted>and every other screen.</Muted>
            </HeroTitle>
            <HeroSubtitle ref={heroSubtitleRef}>
              A free, open-source chat app with crystal-clear voice, 1080p
              video, and game-ready screen sharing. Native apps for Windows,
              macOS and iOS — and a full-featured web client.
            </HeroSubtitle>

            <DetectChip ref={heroChipRef}>
              <Show
                when={detected() !== "unknown"}
                fallback={
                  <>
                    <FiMonitor size={14} />
                    Pick a platform below
                  </>
                }
              >
                <FiCheck size={14} />
                We detected{" "}
                <strong>{OS_LABEL[detected()]}</strong>
                <span>·</span>
                <a href={`#${primaryPlatform()?.id ?? "windows"}`}>
                  Skip to download
                </a>
              </Show>
            </DetectChip>

            <HeroCtas ref={heroCtaRef}>
              <Show when={primaryPlatform()}>
                {(plat) => {
                  const PrimaryIcon = plat().icon;
                  return (
                    <a
                      class={primaryBtnLg()}
                      href={plat().href}
                      target={plat().external ? "_blank" : undefined}
                      rel={
                        plat().external ? "noopener noreferrer" : undefined
                      }
                      onClick={() => trackDownload(plat().id)}
                    >
                      <PrimaryIcon size={18} />
                      {detected() === plat().id
                        ? `Download for ${plat().name}`
                        : plat().primaryCta}
                      <FiArrowRight size={16} />
                    </a>
                  );
                }}
              </Show>
              <a class={ghostBtnLg()} href="#all-platforms">
                See all platforms
                <FiArrowRight size={14} />
              </a>
            </HeroCtas>

            <TrustRow>
              <TrustItem>
                <BiRegularLock size={14} /> Encrypted by default
              </TrustItem>
              <TrustItem>
                <BiRegularCode size={14} /> 100% open source
              </TrustItem>
              <TrustItem>
                <FiZap size={14} /> Updates auto-applied
              </TrustItem>
            </TrustRow>
          </HeroCopy>

          {/* PHONE MOCKUP */}
          <PhoneStage>
            <PhoneGlow ref={phoneGlowRef} />
            <Phone ref={phoneRef}>
              <PhoneNotch />
              <PhoneScreen
                src={iosShot}
                alt="Gangio iOS app preview"
                loading="eager"
              />
              <PhoneShine />
            </Phone>
            <PhoneFloatingBadge>
              <IoLogoApple size={14} />
              iOS public beta — TestFlight
            </PhoneFloatingBadge>
          </PhoneStage>
        </HeroInner>
      </Hero>

      {/* iOS / TESTFLIGHT BANNER (shown to iPhone users, available to all) */}
      <Show when={detected() === "ios"}>
        <IosBannerWrap data-reveal>
          <IosBanner>
            <IosBannerHeader>
              <IoLogoApple size={20} />
              <strong>You're on iOS</strong>
            </IosBannerHeader>
            <p>
              Tap below and we'll send you to TestFlight to install Gangio
              on your iPhone or iPad in seconds.
            </p>
            <a
              class={primaryBtnLg()}
              href={URLS.ios}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackDownload("ios")}
            >
              Join TestFlight
              <FiArrowUpRight size={18} />
            </a>
          </IosBanner>
        </IosBannerWrap>
      </Show>

      {/* ALL PLATFORMS */}
      <Section id="all-platforms" data-reveal>
        <SectionHeader>
          <SectionEyebrow>All platforms</SectionEyebrow>
          <SectionTitle>
            One account.
            <br />
            <Muted>Every device.</Muted>
          </SectionTitle>
          <SectionLead>
            Native installers built and signed by us — no third-party
            wrappers, no telemetry, no surprises.
          </SectionLead>
        </SectionHeader>

        <PlatformGrid>
          <For each={PLATFORMS}>
            {(p) => (
              <PlatformCard
                id={p.id}
                data-recommended={
                  detected() === p.id ? "true" : undefined
                }
              >
                <PlatformCardHead>
                  <PlatformIcon>
                    <p.icon size={26} />
                  </PlatformIcon>
                  <Show when={detected() === p.id}>
                    <PlatformBadge>
                      <FiCheck size={11} /> Recommended for you
                    </PlatformBadge>
                  </Show>
                </PlatformCardHead>
                <PlatformName>{p.name}</PlatformName>
                <PlatformTag>{p.tag}</PlatformTag>
                <PlatformDesc>{p.desc}</PlatformDesc>

                <PlatformMeta>
                  <Show when={p.size}>
                    <PlatformMetaItem>
                      <FiHardDrive size={12} /> {p.size}
                    </PlatformMetaItem>
                  </Show>
                  <Show when={p.arch}>
                    <PlatformMetaItem>
                      <FiCpu size={12} /> {p.arch}
                    </PlatformMetaItem>
                  </Show>
                </PlatformMeta>

                <a
                  class={
                    detected() === p.id ? primaryBtn() : outlineBtn()
                  }
                  href={p.href}
                  target={p.external ? "_blank" : undefined}
                  rel={p.external ? "noopener noreferrer" : undefined}
                  onClick={() => trackDownload(p.id)}
                >
                  {p.primaryCta}
                  <FiArrowRight size={14} />
                </a>

                <Show when={p.secondaryNote}>
                  <PlatformNote>{p.secondaryNote}</PlatformNote>
                </Show>
              </PlatformCard>
            )}
          </For>

          {/* Web — special card spans full row width */}
          <PlatformCard data-web="true">
            <PlatformCardHead>
              <PlatformIcon>
                <BiRegularGlobe size={26} />
              </PlatformIcon>
              <PlatformBadge data-tone="info">
                <FiSmartphone size={11} /> No install needed
              </PlatformBadge>
            </PlatformCardHead>
            <PlatformName>Web app</PlatformName>
            <PlatformTag>Any modern browser</PlatformTag>
            <PlatformDesc>
              Same experience as the desktop app — voice, video, screen
              share, themes — all in your browser.
            </PlatformDesc>
            <a class={primaryBtn()} href={URLS.login}>
              Open web app
              <FiArrowRight size={14} />
            </a>
            <PlatformNote>
              Works on Chrome, Firefox, Safari, and Edge.
            </PlatformNote>
          </PlatformCard>
        </PlatformGrid>
      </Section>

      {/* SYSTEM REQUIREMENTS */}
      <Section data-reveal>
        <SectionHeader>
          <SectionEyebrow>System requirements</SectionEyebrow>
          <SectionTitle>
            Runs <Accent>fast</Accent>{" "}
            <Muted>on hardware you already own.</Muted>
          </SectionTitle>
        </SectionHeader>
        <ReqGrid>
          <ReqCard>
            <ReqIcon>
              <IoLogoMicrosoft size={22} />
            </ReqIcon>
            <ReqTitle>Windows</ReqTitle>
            <ReqList>
              <li>Windows 10 or 11 (64-bit)</li>
              <li>4 GB RAM</li>
              <li>250 MB free disk</li>
              <li>WebRTC-capable network</li>
            </ReqList>
          </ReqCard>
          <ReqCard>
            <ReqIcon>
              <IoLogoApple size={22} />
            </ReqIcon>
            <ReqTitle>macOS</ReqTitle>
            <ReqList>
              <li>macOS 11 Big Sur or newer</li>
              <li>Apple Silicon or Intel</li>
              <li>4 GB RAM</li>
              <li>300 MB free disk</li>
            </ReqList>
          </ReqCard>
          <ReqCard>
            <ReqIcon>
              <IoLogoApple size={22} />
            </ReqIcon>
            <ReqTitle>iOS</ReqTitle>
            <ReqList>
              <li>iOS 18 or newer</li>
              <li>iPhone 8 or newer</li>
              <li>iPad (6th gen) or newer</li>
              <li>TestFlight installed</li>
            </ReqList>
          </ReqCard>
          <ReqCard>
            <ReqIcon>
              <FiHardDrive size={22} />
            </ReqIcon>
            <ReqTitle>Linux</ReqTitle>
            <ReqList>
              <li>glibc 2.31+ (Ubuntu 20.04+)</li>
              <li>x86_64</li>
              <li>AppImage / .deb / .rpm</li>
              <li>PulseAudio or PipeWire</li>
            </ReqList>
          </ReqCard>
        </ReqGrid>
      </Section>

      {/* FAQ */}
      <Section data-reveal>
        <SectionHeader>
          <SectionEyebrow>FAQ</SectionEyebrow>
          <SectionTitle>
            Quick answers.<br />
            <Muted>The boring stuff, made short.</Muted>
          </SectionTitle>
        </SectionHeader>
        <FaqList>
          <For each={FAQS}>
            {(faq, i) => (
              <FaqItem data-open={openFaq() === i() ? "true" : undefined}>
                <FaqTrigger
                  type="button"
                  aria-expanded={openFaq() === i()}
                  onClick={() =>
                    setOpenFaq((cur) => (cur === i() ? null : i()))
                  }
                >
                  <span>{faq.q}</span>
                  <FiChevronDown
                    size={18}
                    style={{
                      transform:
                        openFaq() === i()
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  />
                </FaqTrigger>
                <Show when={openFaq() === i()}>
                  <FaqAnswer>{faq.a}</FaqAnswer>
                </Show>
              </FaqItem>
            )}
          </For>
        </FaqList>
      </Section>

      {/* FINAL CTA BANNER (matches Landing) */}
      <FinalBanner data-reveal>
        <FinalBannerInner>
          <FinalEyebrow>
            <Pill>Ready when you are</Pill>
          </FinalEyebrow>
          <FinalTitle>
            Get Gangio.<br />
            <Muted>Hang out anywhere.</Muted>
          </FinalTitle>
          <FinalLead>
            Free forever. No ads. Take it everywhere — your laptop, your
            phone, your browser.
          </FinalLead>
          <CtaRow>
            <Show when={primaryPlatform()}>
              {(plat) => {
                const FinalIcon = plat().icon;
                return (
                  <a
                    class={primaryBtnLg()}
                    href={plat().href}
                    target={plat().external ? "_blank" : undefined}
                    rel={
                      plat().external ? "noopener noreferrer" : undefined
                    }
                  >
                    <FinalIcon size={18} />
                    Download for {plat().name}
                    <FiArrowRight size={16} />
                  </a>
                );
              }}
            </Show>
            <a class={ghostBtnLg()} href={URLS.login}>
              Or use the web app
            </a>
          </CtaRow>
        </FinalBannerInner>
      </FinalBanner>

      {/* FOOTER */}
      <Footer>
        <FooterTop>
          <FooterBrand>
            <Wordmark
              class={css({ height: "26px", width: "auto", color: "#0a0a0a" })}
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
              <FooterBadge>
                <FiUsers size={12} /> Public Beta
              </FooterBadge>
            </FooterBadges>
          </FooterBrand>

          <FooterCols>
            <FooterCol>
              <FooterColTitle>Product</FooterColTitle>
              <a href="/">Home</a>
              <a href="/download">Download</a>
              <a href="/discover/servers">Discover</a>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Legal</FooterColTitle>
              <a href="/terms">Terms</a>
              <a href="/privacy">Privacy</a>
              <a href="/cookies">Cookies</a>
              <a href="/acceptable-use">Acceptable Use</a>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Trust &amp; Safety</FooterColTitle>
              <a href="/safety">Safety</a>
              <a href="/guidelines">Guidelines</a>
              <a href="/contact">Contact</a>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Connect</FooterColTitle>
              <a href={URLS.bluesky} target="_blank" rel="noopener noreferrer">
                Bluesky
              </a>
              <a href={URLS.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href={URLS.donate} target="_blank" rel="noopener noreferrer">
                Buy me a coffee
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
              aria-label="Buy me a coffee"
            >
              <FiCoffee size={16} />
            </FooterSocial>
            <FooterSocial
              href="/contact"
              aria-label="Contact"
              data-heart="true"
            >
              <FiHeart size={16} />
            </FooterSocial>
          </FooterSocials>
        </FooterBottom>
      </Footer>
    </Root>
  );
}

/* ---------------- styled ---------------- */

const Root = styled("div", {
  base: {
    width: "100%",
    height: "100%",
    overflowX: "hidden",
    overflowY: "auto",
    background: "#ffffff",
    color: "#0a0a0a",
    fontFamily:
      "'Plus Jakarta Sans Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    fontSynthesis: "none",
  },
});

const Accent = styled("span", { base: { color: "#7c5cff" } });
const Muted = styled("span", { base: { color: "#9a9a9a" } });

/* nav */

const Nav = styled("header", {
  base: {
    position: "sticky",
    top: 0,
    zIndex: 60,
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

const NavLink = styled("a", {
  base: {
    padding: "8px 14px",
    borderRadius: "999px",
    color: "#0a0a0a",
    fontSize: "0.92rem",
    fontWeight: 600,
    textDecoration: "none",
    transition: "background 0.15s",
    "&:hover": { background: "rgba(0,0,0,0.05)" },
    "&[data-active='true']": {
      background: "rgba(124,92,255,0.1)",
      color: "#7c5cff",
    },
  },
});

const NavCtas = styled("div", {
  base: { display: "flex", alignItems: "center", gap: "10px" },
});

const navOpenAppBtn = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    borderRadius: "999px",
    background: "#0a0a0a",
    color: "#ffffff !important",
    fontSize: "0.88rem",
    fontWeight: 700,
    textDecoration: "none",
    transition: "transform 0.15s, background 0.15s",
    "&:hover": { background: "#1a1a1a", transform: "translateY(-1px)" },
  });

const NavBurger = styled("button", {
  base: {
    display: "none",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    color: "#0a0a0a",
    "@media (max-width: 960px)": { display: "inline-flex" },
  },
});

/* drawer */

const DrawerScrim = styled("div", {
  base: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 80,
    backdropFilter: "blur(2px)",
  },
});

const Drawer = styled("aside", {
  base: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 81,
    width: "min(86vw, 360px)",
    background: "#fff",
    boxShadow: "-20px 0 60px -20px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
  },
});

const DrawerHeader = styled("header", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 22px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
});

const DrawerClose = styled("button", {
  base: {
    background: "rgba(0,0,0,0.05)",
    border: "none",
    borderRadius: "999px",
    width: "36px",
    height: "36px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#0a0a0a",
  },
});

const DrawerLinks = styled("nav", {
  base: {
    flex: 1,
    overflowY: "auto",
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
});

const DrawerHeading = styled("div", {
  base: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#888",
    padding: "14px 12px 6px",
  },
});

const DrawerLink = styled("a", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "10px",
    color: "#0a0a0a",
    fontSize: "0.95rem",
    fontWeight: 600,
    textDecoration: "none",
    "&:hover": { background: "rgba(0,0,0,0.04)" },
  },
});

const DrawerCta = styled("div", {
  base: {
    padding: "16px 22px 22px",
    borderTop: "1px solid rgba(0,0,0,0.06)",
  },
});

/* hero */

const Hero = styled("section", {
  base: {
    position: "relative",
    overflow: "hidden",
    padding: "84px 32px 96px",
    "@media (max-width: 768px)": { padding: "56px 20px 64px" },
  },
});

const HeroBg = styled("div", {
  base: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    overflow: "hidden",
  },
});

const HeroBlob = styled("div", {
  base: {
    position: "absolute",
    width: "520px",
    height: "520px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(124,92,255,0.22), transparent 70%)",
    filter: "blur(40px)",
  },
});

const HeroInner = styled("div", {
  base: {
    position: "relative",
    maxWidth: "1320px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    alignItems: "center",
    gap: "64px",
    "@media (max-width: 960px)": {
      gridTemplateColumns: "1fr",
      gap: "48px",
    },
  },
});

const HeroCopy = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    alignItems: "flex-start",
    "@media (max-width: 960px)": { alignItems: "center", textAlign: "center" },
  },
});

const HeroEyebrow = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "rgba(124,92,255,0.08)",
    color: "#7c5cff",
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    border: "1px solid rgba(124,92,255,0.18)",
  },
});

const Pill = styled("span", {
  base: {
    padding: "1px 8px",
    borderRadius: "999px",
    background: "rgba(124,92,255,0.15)",
    color: "#5b3fd9",
    fontSize: "0.72rem",
    fontWeight: 700,
  },
});

const HeroTitle = styled("h1", {
  base: {
    fontSize: "clamp(2.4rem, 5.5vw, 4.4rem)",
    fontWeight: 800,
    letterSpacing: "-0.035em",
    lineHeight: 1,
    margin: 0,
  },
});

const HeroSubtitle = styled("p", {
  base: {
    fontSize: "1.05rem",
    lineHeight: 1.55,
    color: "#444",
    maxWidth: "560px",
    margin: 0,
  },
});

const DetectChip = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 6px 18px -8px rgba(0,0,0,0.12)",
    fontSize: "0.84rem",
    color: "#444",
    fontWeight: 600,
    "& svg": { color: "#16a34a" },
    "& strong": { color: "#0a0a0a" },
    "& span": { color: "#bbb" },
    "& a": {
      color: "#7c5cff",
      textDecoration: "none",
      fontWeight: 700,
      "&:hover": { textDecoration: "underline" },
    },
  },
});

const HeroCtas = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "12px",
    marginTop: "8px",
  },
});

const TrustRow = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    marginTop: "6px",
  },
});

const TrustItem = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#666",
    fontSize: "0.82rem",
    fontWeight: 600,
    "& svg": { color: "#7c5cff" },
  },
});

const primaryBtn = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    borderRadius: "999px",
    background: "#0a0a0a",
    color: "#ffffff !important",
    fontSize: "0.88rem",
    fontWeight: 700,
    textDecoration: "none",
    transition: "transform 0.15s, background 0.15s",
    "&:hover": { background: "#1a1a1a", transform: "translateY(-1px)" },
  });

const primaryBtnLg = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 22px",
    borderRadius: "999px",
    background: "#0a0a0a",
    color: "#ffffff !important",
    fontSize: "1rem",
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: "0 14px 36px -16px rgba(0,0,0,0.5)",
    transition: "transform 0.18s, background 0.18s, box-shadow 0.18s",
    "&:hover": {
      background: "#1a1a1a",
      transform: "translateY(-2px)",
      boxShadow: "0 18px 40px -14px rgba(0,0,0,0.55)",
    },
  });

const ghostBtnLg = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "14px 22px",
    borderRadius: "999px",
    background: "transparent",
    color: "#0a0a0a",
    fontSize: "1rem",
    fontWeight: 700,
    textDecoration: "none",
    border: "1px solid rgba(0,0,0,0.12)",
    transition: "background 0.15s, transform 0.15s",
    "&:hover": {
      background: "rgba(0,0,0,0.04)",
      transform: "translateY(-1px)",
    },
  });

const outlineBtn = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    borderRadius: "999px",
    background: "transparent",
    color: "#0a0a0a",
    fontSize: "0.88rem",
    fontWeight: 700,
    textDecoration: "none",
    border: "1px solid rgba(0,0,0,0.15)",
    transition: "background 0.15s, transform 0.15s",
    "&:hover": {
      background: "rgba(0,0,0,0.04)",
      transform: "translateY(-1px)",
    },
  });

/* phone mockup */

const PhoneStage = styled("div", {
  base: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "560px",
    "@media (max-width: 960px)": { minHeight: "440px" },
  },
});

const PhoneGlow = styled("div", {
  base: {
    position: "absolute",
    width: "440px",
    height: "440px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(124,92,255,0.45), transparent 65%)",
    filter: "blur(60px)",
    opacity: 0.3,
    pointerEvents: "none",
  },
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
    overflow: "hidden",
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

const PhoneShine = styled("div", {
  base: {
    position: "absolute",
    inset: 0,
    borderRadius: "44px",
    pointerEvents: "none",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.06) 100%)",
  },
});

const PhoneFloatingBadge = styled("div", {
  base: {
    position: "absolute",
    bottom: "12%",
    right: "8%",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#fff",
    color: "#0a0a0a",
    fontSize: "0.78rem",
    fontWeight: 700,
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 14px 30px -14px rgba(0,0,0,0.25)",
    "@media (max-width: 960px)": { bottom: "4%", right: "8%" },
  },
});

/* iOS banner */

const IosBannerWrap = styled("div", {
  base: {
    maxWidth: "1320px",
    margin: "0 auto",
    padding: "0 32px",
    "@media (max-width: 768px)": { padding: "0 20px" },
  },
});

const IosBanner = styled("div", {
  base: {
    padding: "22px 26px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #0a0a0f 0%, #1a1d2b 100%)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    border: "1px solid rgba(124,92,255,0.25)",
    boxShadow: "0 30px 70px -30px rgba(124,92,255,0.5)",
    "& p": { margin: 0, color: "rgba(255,255,255,0.8)", fontSize: "0.96rem" },
  },
});

const IosBannerHeader = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "1rem",
  },
});

/* sections */

const Section = styled("section", {
  base: {
    padding: "96px 32px",
    maxWidth: "1320px",
    margin: "0 auto",
    "@media (max-width: 768px)": { padding: "64px 20px" },
  },
});

const SectionHeader = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "12px",
    marginBottom: "48px",
  },
});

const SectionEyebrow = styled("div", {
  base: {
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "#7c5cff",
  },
});

const SectionTitle = styled("h2", {
  base: {
    fontSize: "clamp(2rem, 4.2vw, 3.4rem)",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    lineHeight: 1.05,
    margin: 0,
  },
});

const SectionLead = styled("p", {
  base: {
    fontSize: "1.05rem",
    color: "#555",
    maxWidth: "640px",
    margin: 0,
    lineHeight: 1.55,
  },
});

/* platform cards */

const PlatformGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    "@media (max-width: 700px)": { gridTemplateColumns: "1fr" },
  },
});

const PlatformCard = styled("div", {
  base: {
    position: "relative",
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.07)",
    borderRadius: "20px",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    alignItems: "flex-start",
    boxShadow: "0 8px 24px -16px rgba(0,0,0,0.12)",
    transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 18px 40px -20px rgba(0,0,0,0.18)",
      borderColor: "rgba(124,92,255,0.25)",
    },
    "&[data-recommended='true']": {
      borderColor: "rgba(124,92,255,0.45)",
      boxShadow:
        "0 18px 40px -16px rgba(124,92,255,0.25), 0 0 0 1px rgba(124,92,255,0.25) inset",
    },
    "&[data-web='true']": {
      gridColumn: "1 / -1",
      background:
        "linear-gradient(135deg, #faf7ff 0%, #f0ebff 100%)",
      borderColor: "rgba(124,92,255,0.2)",
    },
  },
});

const PlatformCardHead = styled("div", {
  base: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "4px",
  },
});

const PlatformIcon = styled("div", {
  base: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    background: "rgba(0,0,0,0.04)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#0a0a0a",
  },
});

const PlatformBadge = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    borderRadius: "999px",
    background: "rgba(124,92,255,0.12)",
    color: "#7c5cff",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    "&[data-tone='info']": {
      background: "rgba(34,211,238,0.14)",
      color: "#0891b2",
    },
  },
});

const PlatformName = styled("h3", {
  base: {
    fontSize: "1.4rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    margin: "8px 0 0",
  },
});

const PlatformTag = styled("div", {
  base: {
    fontSize: "0.82rem",
    color: "#7c5cff",
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
});

const PlatformDesc = styled("p", {
  base: {
    color: "#555",
    fontSize: "0.95rem",
    lineHeight: 1.55,
    margin: "4px 0 8px",
  },
});

const PlatformMeta = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "8px",
  },
});

const PlatformMetaItem = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "3px 10px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.05)",
    color: "#444",
    fontSize: "0.72rem",
    fontWeight: 600,
  },
});

const PlatformNote = styled("div", {
  base: {
    fontSize: "0.78rem",
    color: "#888",
    marginTop: "4px",
  },
});

/* requirements */

const ReqGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    "@media (max-width: 900px)": { gridTemplateColumns: "repeat(2, 1fr)" },
    "@media (max-width: 540px)": { gridTemplateColumns: "1fr" },
  },
});

const ReqCard = styled("div", {
  base: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.07)",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
});

const ReqIcon = styled("div", {
  base: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "rgba(0,0,0,0.05)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#0a0a0a",
    marginBottom: "4px",
  },
});

const ReqTitle = styled("div", {
  base: { fontSize: "1.05rem", fontWeight: 800, letterSpacing: "-0.01em" },
});

const ReqList = styled("ul", {
  base: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    "& li": {
      fontSize: "0.86rem",
      color: "#555",
      paddingLeft: "16px",
      position: "relative",
      "&::before": {
        content: '"·"',
        position: "absolute",
        left: 0,
        color: "#7c5cff",
        fontWeight: 800,
      },
    },
  },
});

/* faq */

const FaqList = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "780px",
    margin: "0 auto",
  },
});

const FaqItem = styled("div", {
  base: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.07)",
    borderRadius: "14px",
    overflow: "hidden",
    transition: "border-color 0.2s, box-shadow 0.2s",
    "&[data-open='true']": {
      borderColor: "rgba(124,92,255,0.25)",
      boxShadow: "0 14px 30px -16px rgba(124,92,255,0.18)",
    },
  },
});

const FaqTrigger = styled("button", {
  base: {
    width: "100%",
    appearance: "none",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "18px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    color: "#0a0a0a",
    fontSize: "1rem",
    fontWeight: 700,
    textAlign: "left",
  },
});

const FaqAnswer = styled("div", {
  base: {
    padding: "0 22px 20px",
    color: "#555",
    fontSize: "0.96rem",
    lineHeight: 1.65,
  },
});

/* final banner */

const FinalBanner = styled("section", {
  base: {
    padding: "72px 32px 96px",
    "@media (max-width: 768px)": { padding: "48px 20px 64px" },
  },
});

const FinalBannerInner = styled("div", {
  base: {
    maxWidth: "1080px",
    margin: "0 auto",
    background: "linear-gradient(135deg, #faf7ff 0%, #efe9ff 100%)",
    border: "1px solid rgba(124,92,255,0.18)",
    borderRadius: "28px",
    padding: "56px 48px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "16px",
    boxShadow: "0 30px 80px -40px rgba(124,92,255,0.4)",
    "@media (max-width: 768px)": { padding: "40px 24px" },
  },
});

const FinalEyebrow = styled("div", { base: { display: "inline-flex" } });

const FinalTitle = styled("h2", {
  base: {
    fontSize: "clamp(2rem, 4.2vw, 3.2rem)",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    lineHeight: 1.05,
    margin: 0,
  },
});

const FinalLead = styled("p", {
  base: {
    fontSize: "1.05rem",
    color: "#444",
    maxWidth: "560px",
    margin: 0,
    lineHeight: 1.55,
  },
});

const CtaRow = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "12px",
    marginTop: "8px",
  },
});

/* footer (matches LegalLayout / Landing) */

const Footer = styled("footer", {
  base: {
    padding: "48px 32px 28px",
    maxWidth: "1320px",
    margin: "0 auto",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    "@media (max-width: 768px)": { padding: "40px 20px 24px" },
  },
});

const FooterTop = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "1.3fr 2fr",
    gap: "40px",
    paddingBottom: "32px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    "@media (max-width: 900px)": { gridTemplateColumns: "1fr", gap: "32px" },
  },
});

const FooterBrand = styled("div", {
  base: { display: "flex", flexDirection: "column", gap: "12px" },
});

const FooterTag = styled("p", {
  base: { color: "#666", fontSize: "0.92rem", lineHeight: 1.5, margin: 0 },
});

const FooterBadges = styled("div", {
  base: { display: "flex", flexWrap: "wrap", gap: "6px" },
});

const FooterBadge = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "3px 9px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.04)",
    border: "1px solid rgba(0,0,0,0.06)",
    fontSize: "0.74rem",
    color: "#444",
    fontWeight: 600,
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
    gap: "8px",
    "& a": {
      color: "#444",
      fontSize: "0.88rem",
      textDecoration: "none",
      transition: "color 0.12s",
      "&:hover": { color: "#0a0a0a" },
    },
  },
});

const FooterColTitle = styled("div", {
  base: {
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#0a0a0a",
    marginBottom: "4px",
  },
});

const FooterBottom = styled("div", {
  base: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "20px",
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
  base: { display: "flex", alignItems: "center", gap: "8px" },
});

const FooterSocial = styled("a", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "999px",
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
    "&[data-heart='true']:hover": {
      background: "#e11d48",
      borderColor: "#e11d48",
    },
  },
});
