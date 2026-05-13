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
  BiRegularCompass,
  BiRegularDesktop,
  BiRegularGlobe,
  BiRegularLock,
  BiRegularMicrophone,
  BiRegularPalette,
  BiSolidCheckCircle,
} from "solid-icons/bi";
import { FiArrowUpRight } from "solid-icons/fi";
import {
  HiOutlineBars3,
  HiOutlineChevronDown,
  HiOutlineXMark,
} from "solid-icons/hi";
import {
  IoLogoAndroid,
  IoLogoApple,
  IoLogoGithub,
  IoLogoMicrosoft,
} from "solid-icons/io";
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

const CYCLE_WORDS = [
  "people",
  "squad",
  "crew",
  "family",
  "tribe",
  "guild",
  "community",
];

const FLOATING_AVATARS = [
  { id: "luna", color: "#7c5cff", x: -8, y: -22, size: 64, delay: 0 },
  { id: "kai", color: "#22d3ee", x: 88, y: -8, size: 52, delay: 0.6 },
  { id: "nova", color: "#f472b6", x: -14, y: 60, size: 56, delay: 1.2 },
  { id: "finn", color: "#34d399", x: 92, y: 70, size: 48, delay: 0.9 },
  { id: "rae", color: "#fbbf24", x: 50, y: -28, size: 44, delay: 1.5 },
  { id: "ash", color: "#f97316", x: 96, y: 36, size: 38, delay: 0.3 },
];

const FLOATING_CHATS = [
  { x: -22, y: 8, color: "#7c5cff", name: "luna", text: "ranked tonight?" },
  { x: 80, y: 88, color: "#34d399", name: "finn", text: "im in. let me eat first" },
  { x: -18, y: 78, color: "#f472b6", name: "nova", text: "GG WP everyone" },
];

const THEMES: { name: string; bg: string; accent: string; text: string }[] = [
  { name: "Midnight", bg: "#0b0c13", accent: "#7c5cff", text: "#ffffff" },
  { name: "Paper", bg: "#fafaf7", accent: "#111111", text: "#0a0a0a" },
  { name: "Forest", bg: "#0e1a14", accent: "#34d399", text: "#ecfdf5" },
  { name: "Sunset", bg: "#1a0f12", accent: "#f97316", text: "#fff7ed" },
  { name: "Ocean", bg: "#0b1220", accent: "#22d3ee", text: "#ecfeff" },
  { name: "Rose", bg: "#fbf1f4", accent: "#e11d48", text: "#0a0a0a" },
];

const WORD_GRADIENTS = [
  "linear-gradient(135deg, #7c5cff 0%, #5865f2 100%)",
  "linear-gradient(135deg, #22d3ee 0%, #7c5cff 100%)",
  "linear-gradient(135deg, #f472b6 0%, #7c5cff 100%)",
  "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
  "linear-gradient(135deg, #fbbf24 0%, #f472b6 100%)",
  "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
  "linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)",
];

function gradientForWord(i: number) {
  return WORD_GRADIENTS[i % WORD_GRADIENTS.length];
}

/* ---------------- component ---------------- */

type MegaMenu = "product" | "download" | "community" | null;

export function Landing() {
  const [theme, setTheme] = createSignal(0);
  const [wordIdx, setWordIdx] = createSignal(0);
  const [onlineCount, setOnlineCount] = createSignal(12847);
  const [scrolled, setScrolled] = createSignal(false);
  const [openMenu, setOpenMenu] = createSignal<MegaMenu>(null);
  const [mobileOpen, setMobileOpen] = createSignal(false);

  let rootRef: HTMLDivElement | undefined;
  let heroRef: HTMLDivElement | undefined;
  let stageRef: HTMLDivElement | undefined;
  let closeMenuTimer: ReturnType<typeof setTimeout> | undefined;

  const isIOS = createMemo(() =>
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent),
  );

  const t = () => THEMES[theme()];

  /* Mega menu open/close with small delay so quick mouse movements between
     items don't flicker the panel away. */
  function showMenu(name: MegaMenu) {
    if (closeMenuTimer) clearTimeout(closeMenuTimer);
    setOpenMenu(name);
  }
  function scheduleClose() {
    if (closeMenuTimer) clearTimeout(closeMenuTimer);
    closeMenuTimer = setTimeout(() => setOpenMenu(null), 140);
  }

  onMount(() => {
    /* cycling word */
    const wordTimer = setInterval(() => {
      setWordIdx((i) => (i + 1) % CYCLE_WORDS.length);
    }, 1800);

    /* live counter — drifts up to feel alive */
    const countTimer = setInterval(() => {
      setOnlineCount((c) => c + Math.floor(Math.random() * 5) - 1);
    }, 2500);

    /* Scroll listener: shrink nav after scrolling past 30px */
    const onScroll = () => {
      const el = rootRef;
      if (!el) return;
      setScrolled(el.scrollTop > 30);
    };
    rootRef?.addEventListener("scroll", onScroll, { passive: true });

    if (!heroRef) {
      return () => {
        clearInterval(wordTimer);
        clearInterval(countTimer);
        rootRef?.removeEventListener("scroll", onScroll);
      };
    }

    /* Nav intro: slide down once on first paint */
    gsap.fromTo(
      "[data-nav='root']",
      { y: -28, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" },
    );

    const ctx = gsap.context(() => {
      /* hero intro: timeline (set explicit start AND end so missing animations never leave hidden) */
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        "[data-hero='eyebrow']",
        { y: 14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6 },
      )
        .fromTo(
          "[data-hero='title-line']",
          { y: 30, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08 },
          "-=0.3",
        )
        .fromTo(
          "[data-hero='sub']",
          { y: 14, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.55 },
          "-=0.3",
        )
        .fromTo(
          "[data-hero='cta']",
          { y: 14, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.08 },
          "-=0.3",
        )
        .fromTo(
          "[data-hero='trust']",
          { y: 10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5 },
          "-=0.25",
        )
        .fromTo(
          "[data-hero='stage']",
          { y: 40, autoAlpha: 0, scale: 0.96 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 1.1, ease: "power4.out" },
          "-=0.9",
        )
        .fromTo(
          "[data-hero='avatar']",
          { scale: 0, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "back.out(2)",
          },
          "-=0.7",
        )
        .fromTo(
          "[data-hero='chat']",
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.15 },
          "-=0.5",
        );

      /* ambient float on avatars */
      gsap.utils.toArray<HTMLElement>("[data-hero='avatar']").forEach((el) => {
        gsap.to(el, {
          y: "+=14",
          duration: 2.5 + Math.random() * 2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: Math.random() * 1.5,
        });
      });

      /* ambient drift on chat bubbles */
      gsap.utils.toArray<HTMLElement>("[data-hero='chat']").forEach((el) => {
        gsap.to(el, {
          y: "+=8",
          duration: 3 + Math.random() * 2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      /* aurora drift */
      gsap.to("[data-hero='aurora-1']", {
        x: 80,
        y: -40,
        duration: 14,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      gsap.to("[data-hero='aurora-2']", {
        x: -60,
        y: 60,
        duration: 18,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      /* mouse parallax on the stage */
      const stage = stageRef;
      if (stage) {
        const onMove = (e: MouseEvent) => {
          const rect = stage.getBoundingClientRect();
          const cx = (e.clientX - rect.left) / rect.width - 0.5;
          const cy = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to("[data-hero='shot']", {
            rotationY: cx * 8,
            rotationX: -cy * 6,
            duration: 0.6,
            ease: "power2.out",
            transformPerspective: 1200,
          });
          gsap.to("[data-hero='avatar']", {
            x: (i) => cx * (10 + (i % 3) * 8),
            y: (i) => cy * (10 + (i % 3) * 6),
            duration: 0.6,
            ease: "power2.out",
          });
        };
        const onLeave = () => {
          gsap.to("[data-hero='shot']", {
            rotationY: 0,
            rotationX: 0,
            duration: 0.8,
            ease: "power3.out",
          });
          gsap.to("[data-hero='avatar']", {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          });
        };
        stage.addEventListener("mousemove", onMove);
        stage.addEventListener("mouseleave", onLeave);
        onCleanup(() => {
          stage.removeEventListener("mousemove", onMove);
          stage.removeEventListener("mouseleave", onLeave);
        });
      }

      /* magnetic primary CTA */
      const magnets = gsap.utils.toArray<HTMLElement>("[data-magnetic]");
      magnets.forEach((btn) => {
        const onMove = (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(btn, {
            x: x * 0.25,
            y: y * 0.3,
            duration: 0.3,
            ease: "power2.out",
          });
        };
        const onLeave = () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.55,
            ease: "elastic.out(1, 0.5)",
          });
        };
        btn.addEventListener("mousemove", onMove);
        btn.addEventListener("mouseleave", onLeave);
        onCleanup(() => {
          btn.removeEventListener("mousemove", onMove);
          btn.removeEventListener("mouseleave", onLeave);
        });
      });
    }, heroRef);

    onCleanup(() => {
      clearInterval(wordTimer);
      clearInterval(countTimer);
      rootRef?.removeEventListener("scroll", onScroll);
      if (closeMenuTimer) clearTimeout(closeMenuTimer);
      ctx.revert();
    });
  });

  return (
    <Root ref={rootRef}>
      {/* NAV */}
      <Nav
        data-nav="root"
        data-scrolled={scrolled() ? "true" : undefined}
        onMouseLeave={scheduleClose}
      >
        <NavInner data-scrolled={scrolled() ? "true" : undefined}>
          <NavLeft>
            <a href="/" class={brandLink()} aria-label="Gangio home">
              <BrandLogo />
              <Wordmark
                class={css({
                  height: "22px",
                  width: "auto",
                  color: "#0a0a0a",
                })}
              />
            </a>
            <NavLinks>
              <NavItem
                type="button"
                aria-expanded={openMenu() === "product"}
                data-active={openMenu() === "product" ? "true" : undefined}
                onMouseEnter={() => showMenu("product")}
                onFocusIn={() => showMenu("product")}
                onClick={() =>
                  setOpenMenu(openMenu() === "product" ? null : "product")
                }
              >
                Product
                <NavChevron
                  data-open={openMenu() === "product" ? "true" : undefined}
                >
                  <HiOutlineChevronDown size={14} />
                </NavChevron>
              </NavItem>

              <NavItem
                type="button"
                aria-expanded={openMenu() === "download"}
                data-active={openMenu() === "download" ? "true" : undefined}
                onMouseEnter={() => showMenu("download")}
                onFocusIn={() => showMenu("download")}
                onClick={() =>
                  setOpenMenu(openMenu() === "download" ? null : "download")
                }
              >
                Download
                <NavChevron
                  data-open={openMenu() === "download" ? "true" : undefined}
                >
                  <HiOutlineChevronDown size={14} />
                </NavChevron>
              </NavItem>

              <NavItem
                type="button"
                aria-expanded={openMenu() === "community"}
                data-active={openMenu() === "community" ? "true" : undefined}
                onMouseEnter={() => showMenu("community")}
                onFocusIn={() => showMenu("community")}
                onClick={() =>
                  setOpenMenu(
                    openMenu() === "community" ? null : "community",
                  )
                }
              >
                Community
                <NavChevron
                  data-open={openMenu() === "community" ? "true" : undefined}
                >
                  <HiOutlineChevronDown size={14} />
                </NavChevron>
              </NavItem>

              <NavItemLink
                href="/discover/servers"
                onMouseEnter={() => showMenu(null)}
              >
                Discover
              </NavItemLink>
            </NavLinks>
          </NavLeft>

          <NavRight>
            <OpenAppBtn href={URLS.login}>
              <OpenAppBtnGlow />
              <span>Open app</span>
              <OpenAppArrow>→</OpenAppArrow>
            </OpenAppBtn>

            <MobileToggle
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <Show
                when={mobileOpen()}
                fallback={<HiOutlineBars3 size={22} />}
              >
                <HiOutlineXMark size={22} />
              </Show>
            </MobileToggle>
          </NavRight>
        </NavInner>

        {/* MEGA MENU PANELS */}
        <MegaPanel
          data-open={openMenu() === "product" ? "true" : undefined}
          onMouseEnter={() => showMenu("product")}
          onMouseLeave={scheduleClose}
        >
          <MegaInner data-cols="2">
            <MegaSection>
              <MegaTitle>Built in</MegaTitle>
              <MegaLinks>
                <MegaLink href="#features">
                  <MegaIcon style={{ background: "rgba(124,92,255,0.12)", color: "#7c5cff" }}>
                    <BiRegularChat size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>Messaging</MegaLinkTitle>
                    <MegaLinkDesc>
                      Markdown, threads, reactions, search.
                    </MegaLinkDesc>
                  </MegaLinkBody>
                </MegaLink>

                <MegaLink href="#voice">
                  <MegaIcon style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
                    <BiRegularMicrophone size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>
                      Voice & video
                      <NewBadge>LIVE</NewBadge>
                    </MegaLinkTitle>
                    <MegaLinkDesc>
                      HD voice, video, screen sharing.
                    </MegaLinkDesc>
                  </MegaLinkBody>
                </MegaLink>

                <MegaLink href="#voice">
                  <MegaIcon style={{ background: "rgba(34,211,238,0.12)", color: "#22d3ee" }}>
                    <BiRegularDesktop size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>Screen share</MegaLinkTitle>
                    <MegaLinkDesc>
                      1080p 60fps streaming to your friends.
                    </MegaLinkDesc>
                  </MegaLinkBody>
                </MegaLink>

                <MegaLink href="#themes">
                  <MegaIcon style={{ background: "rgba(244,114,182,0.12)", color: "#f472b6" }}>
                    <BiRegularPalette size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>Themes</MegaLinkTitle>
                    <MegaLinkDesc>
                      Make your space yours. Full CSS support.
                    </MegaLinkDesc>
                  </MegaLinkBody>
                </MegaLink>
              </MegaLinks>
            </MegaSection>

            <MegaSection>
              <MegaTitle>Built for</MegaTitle>
              <MegaLinks>
                <MegaLink href="#features">
                  <MegaIcon style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>
                    <BiRegularBot size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>Bots & API</MegaLinkTitle>
                    <MegaLinkDesc>
                      First-class public API. Build anything.
                    </MegaLinkDesc>
                  </MegaLinkBody>
                </MegaLink>

                <MegaLink href="#features">
                  <MegaIcon style={{ background: "rgba(251,191,36,0.12)", color: "#f59e0b" }}>
                    <BiRegularLock size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>Privacy</MegaLinkTitle>
                    <MegaLinkDesc>
                      Encrypted DMs. No ads. No tracking.
                    </MegaLinkDesc>
                  </MegaLinkBody>
                </MegaLink>

                <MegaLink href="#features">
                  <MegaIcon style={{ background: "rgba(124,92,255,0.12)", color: "#7c5cff" }}>
                    <BiRegularCode size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>Open source</MegaLinkTitle>
                    <MegaLinkDesc>
                      AGPLv3. Audit it, fork it, host it.
                    </MegaLinkDesc>
                  </MegaLinkBody>
                </MegaLink>

                <MegaLink href="#features">
                  <MegaIcon style={{ background: "rgba(34,211,238,0.12)", color: "#22d3ee" }}>
                    <BiRegularGlobe size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>Self-hosted</MegaLinkTitle>
                    <MegaLinkDesc>
                      Run on your own hardware. It's yours.
                    </MegaLinkDesc>
                  </MegaLinkBody>
                </MegaLink>
              </MegaLinks>
            </MegaSection>

            <MegaFeatured>
              <MegaFeaturedTag>FEATURED</MegaFeaturedTag>
              <MegaFeaturedTitle>What's new in Gangio.</MegaFeaturedTitle>
              <MegaFeaturedDesc>
                Voice channels, screen share at 1080p 60fps, and a public
                TestFlight for iOS. Now in beta.
              </MegaFeaturedDesc>
              <MegaFeaturedCta href="#voice">
                See what's new <FiArrowUpRight size={14} />
              </MegaFeaturedCta>
            </MegaFeatured>
          </MegaInner>
        </MegaPanel>

        <MegaPanel
          data-open={openMenu() === "download" ? "true" : undefined}
          onMouseEnter={() => showMenu("download")}
          onMouseLeave={scheduleClose}
        >
          <MegaInner data-cols="dl">
            <MegaSection>
              <MegaTitle>Desktop</MegaTitle>
              <MegaLinks>
                <MegaDownloadLink
                  href={URLS.windows}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MegaIcon style={{ background: "rgba(0,120,212,0.12)", color: "#0078d4" }}>
                    <IoLogoMicrosoft size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>Windows</MegaLinkTitle>
                    <MegaLinkDesc>Native installer · Windows 10/11</MegaLinkDesc>
                  </MegaLinkBody>
                  <MegaDownloadCta>Download</MegaDownloadCta>
                </MegaDownloadLink>

                <MegaDownloadLink
                  href={URLS.macos}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MegaIcon style={{ background: "rgba(0,0,0,0.06)", color: "#0a0a0a" }}>
                    <IoLogoApple size={20} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>macOS</MegaLinkTitle>
                    <MegaLinkDesc>Universal · Apple Silicon + Intel</MegaLinkDesc>
                  </MegaLinkBody>
                  <MegaDownloadCta>Download</MegaDownloadCta>
                </MegaDownloadLink>
              </MegaLinks>
            </MegaSection>

            <MegaSection>
              <MegaTitle>Mobile & Web</MegaTitle>
              <MegaLinks>
                <MegaDownloadLink
                  href={URLS.ios}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MegaIcon style={{ background: "rgba(124,92,255,0.12)", color: "#7c5cff" }}>
                    <IoLogoApple size={20} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>
                      iOS
                      <NewBadge>BETA</NewBadge>
                    </MegaLinkTitle>
                    <MegaLinkDesc>Public TestFlight beta</MegaLinkDesc>
                  </MegaLinkBody>
                  <MegaDownloadCta>Join</MegaDownloadCta>
                </MegaDownloadLink>

                <MegaDownloadLink href="#download" data-disabled>
                  <MegaIcon style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>
                    <IoLogoAndroid size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>Android</MegaLinkTitle>
                    <MegaLinkDesc>Coming soon</MegaLinkDesc>
                  </MegaLinkBody>
                  <MegaDownloadCta data-soft>Soon</MegaDownloadCta>
                </MegaDownloadLink>

                <MegaDownloadLink href={URLS.login}>
                  <MegaIcon style={{ background: "rgba(34,211,238,0.12)", color: "#22d3ee" }}>
                    <BiRegularGlobe size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>Web</MegaLinkTitle>
                    <MegaLinkDesc>Open in any modern browser</MegaLinkDesc>
                  </MegaLinkBody>
                  <MegaDownloadCta>Open</MegaDownloadCta>
                </MegaDownloadLink>
              </MegaLinks>
            </MegaSection>
          </MegaInner>
        </MegaPanel>

        <MegaPanel
          data-open={openMenu() === "community" ? "true" : undefined}
          onMouseEnter={() => showMenu("community")}
          onMouseLeave={scheduleClose}
        >
          <MegaInner data-cols="2">
            <MegaSection>
              <MegaTitle>Connect</MegaTitle>
              <MegaLinks>
                <MegaLink href="/discover/servers">
                  <MegaIcon style={{ background: "rgba(124,92,255,0.12)", color: "#7c5cff" }}>
                    <BiRegularCompass size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>Discover servers</MegaLinkTitle>
                    <MegaLinkDesc>
                      Find communities that match your vibe.
                    </MegaLinkDesc>
                  </MegaLinkBody>
                </MegaLink>

                <MegaLink
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MegaIcon style={{ background: "rgba(0,0,0,0.06)", color: "#0a0a0a" }}>
                    <IoLogoGithub size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>
                      GitHub <FiArrowUpRight size={12} />
                    </MegaLinkTitle>
                    <MegaLinkDesc>
                      Source code, issues, and contributions.
                    </MegaLinkDesc>
                  </MegaLinkBody>
                </MegaLink>
              </MegaLinks>
            </MegaSection>

            <MegaSection>
              <MegaTitle>Company</MegaTitle>
              <MegaLinks>
                <MegaLink href="/terms">
                  <MegaIcon style={{ background: "rgba(0,0,0,0.06)", color: "#0a0a0a" }}>
                    <BiRegularCode size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>Terms of service</MegaLinkTitle>
                    <MegaLinkDesc>
                      The rules of the road.
                    </MegaLinkDesc>
                  </MegaLinkBody>
                </MegaLink>

                <MegaLink href="/privacy">
                  <MegaIcon style={{ background: "rgba(34,211,238,0.12)", color: "#22d3ee" }}>
                    <BiRegularLock size={18} />
                  </MegaIcon>
                  <MegaLinkBody>
                    <MegaLinkTitle>Privacy policy</MegaLinkTitle>
                    <MegaLinkDesc>
                      Short enough to actually read.
                    </MegaLinkDesc>
                  </MegaLinkBody>
                </MegaLink>
              </MegaLinks>
            </MegaSection>
          </MegaInner>
        </MegaPanel>
      </Nav>

      {/* MOBILE OVERLAY */}
      <MobileOverlay data-open={mobileOpen() ? "true" : undefined}>
        <MobileLinks>
          <MobileLink href="#features" onClick={() => setMobileOpen(false)}>
            Features
          </MobileLink>
          <MobileLink href="#voice" onClick={() => setMobileOpen(false)}>
            Voice & video
          </MobileLink>
          <MobileLink href="#themes" onClick={() => setMobileOpen(false)}>
            Themes
          </MobileLink>
          <MobileLink href="#download" onClick={() => setMobileOpen(false)}>
            Download
          </MobileLink>
          <MobileLink
            href="/discover/servers"
            onClick={() => setMobileOpen(false)}
          >
            Discover
          </MobileLink>
        </MobileLinks>
        <MobileCta href={URLS.login}>
          Open app <FiArrowUpRight size={18} />
        </MobileCta>
      </MobileOverlay>

      {/* HERO */}
      <Hero ref={heroRef}>
        {/* aurora background */}
        <Aurora data-hero="aurora-1" data-which="1" />
        <Aurora data-hero="aurora-2" data-which="2" />
        <HeroGrid />
        <Noise />

        <HeroCopy>
          <Eyebrow data-hero="eyebrow">
            <Pill>
              <PillDot />
              Public Beta
            </Pill>
            <span>For the ones who find their people online.</span>
          </Eyebrow>

          <H1>
            <HeroLine data-hero="title-line">Your space.</HeroLine>
            <HeroLine data-hero="title-line">
              <Muted>Your</Muted>{" "}
              <CycleSlot>
                <For each={CYCLE_WORDS}>
                  {(word, i) => (
                    <CycleWord
                      data-active={wordIdx() === i() ? "true" : undefined}
                      style={{ "--accent": gradientForWord(i()) }}
                    >
                      {word}.
                    </CycleWord>
                  )}
                </For>
              </CycleSlot>
            </HeroLine>
          </H1>

          <Sub data-hero="sub">
            Built for raid parties, late-night ranked queues, and the friends
            you've never met in person. Crystal-clear voice, HD video, screen
            sharing — and a place that actually feels like yours.
          </Sub>

          <CtaRow>
            <a
              class={primaryBtnHero()}
              href={URLS.signup}
              data-hero="cta"
              data-magnetic
            >
              <span>Get started — it's free</span>
              <CtaArrow>→</CtaArrow>
            </a>
            <a class={ghostBtnLg()} href="#download" data-hero="cta">
              Download the app
            </a>
          </CtaRow>

          <LiveCounter data-hero="trust">
            <LivePulse />
            <strong>{onlineCount().toLocaleString()}</strong>
            <span>people online right now</span>
            <Sep>·</Sep>
            <TrustItem>
              <BiSolidCheckCircle size={14} /> No ads
            </TrustItem>
            <TrustItem>
              <BiSolidCheckCircle size={14} /> No tracking
            </TrustItem>
            <TrustItem>
              <BiSolidCheckCircle size={14} /> Open source
            </TrustItem>
          </LiveCounter>
        </HeroCopy>

        {/* Right side: floating community */}
        <HeroStage ref={stageRef} data-hero="stage">
          <StageGlow />

          {/* Floating chat bubbles */}
          <For each={FLOATING_CHATS}>
            {(c) => (
              <FloatingChat
                data-hero="chat"
                style={{
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                }}
              >
                <FloatingChatAvatar style={{ background: c.color }} />
                <FloatingChatBody>
                  <FloatingChatName style={{ color: c.color }}>
                    {c.name}
                  </FloatingChatName>
                  <FloatingChatText>{c.text}</FloatingChatText>
                </FloatingChatBody>
              </FloatingChat>
            )}
          </For>

          {/* Floating avatar orbs */}
          <For each={FLOATING_AVATARS}>
            {(a) => (
              <FloatingAvatar
                data-hero="avatar"
                style={{
                  left: `${a.x}%`,
                  top: `${a.y}%`,
                  width: `${a.size}px`,
                  height: `${a.size}px`,
                  background: a.color,
                  "box-shadow": `0 20px 40px -10px ${a.color}55, 0 0 0 4px ${a.color}15`,
                }}
              >
                <FloatingAvatarPulse style={{ background: a.color }} />
                {a.id[0].toUpperCase()}
              </FloatingAvatar>
            )}
          </For>

          {/* Desktop screenshot */}
          <ShotWrap data-hero="shot">
            <ShotFrame>
              <ShotChrome>
                <ShotDot style={{ background: "#ff5f57" }} />
                <ShotDot style={{ background: "#febc2e" }} />
                <ShotDot style={{ background: "#28c840" }} />
                <ShotUrl>gangio.pro</ShotUrl>
              </ShotChrome>
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
            </ShotFrame>
            <ShotReflection />
          </ShotWrap>
        </HeroStage>
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
            {/*
              VIDEO GOES HERE — once you drop screenshare.mp4 into
              packages/client/assets/web/landing/, replace this comment with:

              <StreamVideo
                src={streamVideo}
                autoplay
                muted
                loop
                playsinline
              />

              and add at the top:
                import streamVideo from "../../assets/web/landing/screenshare.mp4";
            */}

            {/* Animated placeholder (shown until video is wired up) */}
            <StreamPlaceholder>
              <StreamPlaceholderGrid />
              <StreamPlaceholderGlow />
              <StreamPlaceholderText>
                <strong>Live preview</strong>
                <span>Your stream will play here</span>
              </StreamPlaceholderText>
            </StreamPlaceholder>

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
              <ControlBtn aria-label="Mic">🎙</ControlBtn>
              <ControlBtn aria-label="Camera">📷</ControlBtn>
              <ControlBtn data-active aria-label="Share screen">⛶</ControlBtn>
              <ControlBtn data-danger aria-label="Leave">⤬</ControlBtn>
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
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    borderBottom: "1px solid transparent",
    transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s",
    "&[data-scrolled='true']": {
      background: "rgba(255,255,255,0.88)",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
      boxShadow: "0 8px 30px -10px rgba(0,0,0,0.08)",
    },
  },
});

const NavInner = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    padding: "16px 24px",
    maxWidth: "1360px",
    margin: "0 auto",
    transition: "padding 0.25s",
    "&[data-scrolled='true']": { padding: "10px 24px" },
    "@media (max-width: 768px)": { padding: "12px 18px" },
  },
});

const NavLeft = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "28px",
  },
});

const NavRight = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
});

const brandLink = () =>
  css({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    color: "#0a0a0a",
    transition: "transform 0.2s",
    "&:hover": { transform: "translateY(-1px)" },
  });

const BrandLogo = styled("span", {
  base: {
    width: "30px",
    height: "30px",
    borderRadius: "9px",
    background:
      "conic-gradient(from 200deg at 50% 50%, #7c5cff, #5865f2, #22d3ee, #f472b6, #7c5cff)",
    boxShadow:
      "0 6px 18px -4px rgba(124,92,255,0.55), inset 0 1px 0 rgba(255,255,255,0.4)",
    flexShrink: 0,
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: "5px",
      borderRadius: "5px",
      background: "#fff",
    },
    "&::after": {
      content: '"g"',
      position: "absolute",
      inset: 0,
      display: "grid",
      placeItems: "center",
      fontWeight: 900,
      fontSize: "1.05rem",
      fontStyle: "italic",
      color: "#0a0a0a",
      letterSpacing: "-0.06em",
      zIndex: 1,
    },
  },
});

const NavLinks = styled("nav", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    "@media (max-width: 900px)": { display: "none" },
  },
});

const NavItem = styled("button", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "8px 12px",
    borderRadius: "10px",
    background: "transparent",
    border: "none",
    color: "#444",
    fontFamily: "inherit",
    fontSize: "0.92rem",
    fontWeight: 600,
    letterSpacing: "-0.005em",
    cursor: "pointer",
    transition: "background 0.18s, color 0.18s",
    position: "relative",
    "&:hover, &[data-active='true']": {
      background: "rgba(0,0,0,0.05)",
      color: "#0a0a0a",
    },
  },
});

const NavItemLink = styled("a", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "10px",
    color: "#444",
    textDecoration: "none",
    fontSize: "0.92rem",
    fontWeight: 600,
    transition: "background 0.18s, color 0.18s",
    "&:hover": {
      background: "rgba(0,0,0,0.05)",
      color: "#0a0a0a",
    },
  },
});

const NavChevron = styled("span", {
  base: {
    display: "inline-flex",
    color: "#888",
    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&[data-open='true']": {
      transform: "rotate(180deg)",
      color: "#0a0a0a",
    },
  },
});

/* Open App button */

const OpenAppBtn = styled("a", {
  base: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px 10px 20px",
    borderRadius: "12px",
    background: "#0a0a0a",
    color: "#fff",
    textDecoration: "none",
    fontSize: "0.92rem",
    fontWeight: 700,
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow:
      "0 8px 24px -8px rgba(124,92,255,0.45), inset 0 1px 0 rgba(255,255,255,0.1)",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
      transform: "translateX(-100%)",
      transition: "transform 0.8s",
    },
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow:
        "0 14px 32px -10px rgba(124,92,255,0.6), inset 0 1px 0 rgba(255,255,255,0.15)",
    },
    "&:hover::before": { transform: "translateX(100%)" },
    "& > *": { position: "relative", zIndex: 1 },
  },
});

const OpenAppBtnGlow = styled("span", {
  base: {
    position: "absolute",
    inset: 0,
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, rgba(124,92,255,0.6), rgba(34,211,238,0.4), rgba(244,114,182,0.5))",
    opacity: 0,
    filter: "blur(12px)",
    transition: "opacity 0.3s",
    zIndex: 0,
    "a:hover &": { opacity: 0.8 },
  },
});

const OpenAppArrow = styled("span", {
  base: {
    display: "inline-flex",
    transition: "transform 0.25s",
    "a:hover &": { transform: "translateX(3px)" },
  },
});

/* Mobile */

const MobileToggle = styled("button", {
  base: {
    display: "none",
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "transparent",
    border: "1px solid rgba(0,0,0,0.08)",
    color: "#0a0a0a",
    cursor: "pointer",
    placeItems: "center",
    transition: "background 0.15s",
    "&:hover": { background: "rgba(0,0,0,0.04)" },
    "@media (max-width: 900px)": { display: "grid" },
  },
});

const MobileOverlay = styled("div", {
  base: {
    position: "fixed",
    top: "62px",
    left: 0,
    right: 0,
    bottom: 0,
    background: "#fff",
    zIndex: 49,
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    transform: "translateY(-12px)",
    opacity: 0,
    pointerEvents: "none",
    transition: "opacity 0.25s, transform 0.25s",
    "&[data-open='true']": {
      transform: "translateY(0)",
      opacity: 1,
      pointerEvents: "auto",
    },
    "@media (min-width: 901px)": { display: "none" },
  },
});

const MobileLinks = styled("nav", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
});

const MobileLink = styled("a", {
  base: {
    padding: "16px 4px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    color: "#0a0a0a",
    textDecoration: "none",
    fontSize: "1.4rem",
    fontWeight: 700,
    letterSpacing: "-0.015em",
  },
});

const MobileCta = styled("a", {
  base: {
    marginTop: "auto",
    padding: "18px 22px",
    borderRadius: "14px",
    background: "#0a0a0a",
    color: "#fff",
    textDecoration: "none",
    fontSize: "1.1rem",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
});

/* Mega menu */

const MegaPanel = styled("div", {
  base: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 24px 50px -20px rgba(0,0,0,0.18)",
    opacity: 0,
    visibility: "hidden",
    transform: "translateY(-12px)",
    transition:
      "opacity 0.22s cubic-bezier(0.4, 0, 0.2, 1), transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.22s",
    pointerEvents: "none",
    "&[data-open='true']": {
      opacity: 1,
      visibility: "visible",
      transform: "translateY(0)",
      pointerEvents: "auto",
    },
    "@media (max-width: 900px)": { display: "none" },
  },
});

const MegaInner = styled("div", {
  base: {
    display: "grid",
    gap: "32px",
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "32px 40px 36px",
    "&[data-cols='2']": {
      gridTemplateColumns: "1fr 1fr 1.1fr",
    },
    "&[data-cols='dl']": {
      gridTemplateColumns: "1fr 1fr",
    },
    "@media (max-width: 1000px)": {
      "&[data-cols='2']": { gridTemplateColumns: "1fr 1fr" },
      "& > :last-child[data-featured]": { display: "none" },
    },
  },
});

const MegaSection = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
});

const MegaTitle = styled("div", {
  base: {
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    paddingLeft: "12px",
    marginBottom: "4px",
  },
});

const MegaLinks = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
});

const MegaLink = styled("a", {
  base: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "11px 12px",
    borderRadius: "12px",
    textDecoration: "none",
    color: "#0a0a0a",
    transition: "background 0.15s, transform 0.15s",
    "&:hover": {
      background: "rgba(0,0,0,0.04)",
      transform: "translateX(2px)",
    },
  },
});

const MegaIcon = styled("span", {
  base: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    transition: "transform 0.2s",
    "a:hover &": { transform: "scale(1.05)" },
  },
});

const MegaLinkBody = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
    flex: 1,
  },
});

const MegaLinkTitle = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.92rem",
    fontWeight: 700,
    color: "#0a0a0a",
    letterSpacing: "-0.005em",
  },
});

const MegaLinkDesc = styled("div", {
  base: {
    fontSize: "0.8rem",
    color: "#666",
    lineHeight: 1.4,
  },
});

const NewBadge = styled("span", {
  base: {
    padding: "1px 6px",
    borderRadius: "4px",
    background: "#ef4444",
    color: "#fff",
    fontSize: "0.58rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
  },
});

const MegaDownloadLink = styled("a", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 14px",
    borderRadius: "12px",
    textDecoration: "none",
    color: "#0a0a0a",
    border: "1px solid rgba(0,0,0,0.06)",
    background: "#fff",
    transition: "all 0.15s",
    "&:hover": {
      borderColor: "rgba(0,0,0,0.18)",
      transform: "translateY(-1px)",
      boxShadow: "0 6px 14px -6px rgba(0,0,0,0.1)",
    },
    "&[data-disabled]": {
      opacity: 0.65,
      pointerEvents: "none",
    },
  },
});

const MegaDownloadCta = styled("span", {
  base: {
    padding: "6px 12px",
    borderRadius: "8px",
    background: "#0a0a0a",
    color: "#fff",
    fontSize: "0.78rem",
    fontWeight: 700,
    flexShrink: 0,
    "&[data-soft]": {
      background: "rgba(0,0,0,0.06)",
      color: "#666",
    },
  },
});

const MegaFeatured = styled("div", {
  base: {
    position: "relative",
    padding: "20px 22px",
    borderRadius: "16px",
    background:
      "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    color: "#fff",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    "&::before": {
      content: '""',
      position: "absolute",
      top: "-40%",
      right: "-30%",
      width: "240px",
      height: "240px",
      background:
        "radial-gradient(circle, rgba(124,92,255,0.45), transparent 70%)",
      filter: "blur(20px)",
    },
    "& > *": { position: "relative", zIndex: 1 },
  },
});

const MegaFeaturedTag = styled("div", {
  base: {
    fontSize: "0.66rem",
    fontWeight: 800,
    letterSpacing: "0.14em",
    color: "#c4b5fd",
  },
});

const MegaFeaturedTitle = styled("div", {
  base: {
    fontSize: "1.25rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
  },
});

const MegaFeaturedDesc = styled("p", {
  base: {
    margin: 0,
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.5,
  },
});

const MegaFeaturedCta = styled("a", {
  base: {
    marginTop: "auto",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#fff",
    textDecoration: "none",
    fontSize: "0.88rem",
    fontWeight: 700,
    width: "fit-content",
    paddingTop: "6px",
    "&:hover": { color: "#c4b5fd" },
  },
});

/* buttons */

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
    gridTemplateColumns: "1fr 1.15fr",
    gap: "48px",
    alignItems: "center",
    padding: "100px 32px 120px",
    maxWidth: "1360px",
    margin: "0 auto",
    overflow: "hidden",
    "@media (max-width: 1024px)": {
      gridTemplateColumns: "1fr",
      padding: "72px 24px 80px",
      gap: "72px",
    },
  },
});

const Aurora = styled("div", {
  base: {
    position: "absolute",
    pointerEvents: "none",
    zIndex: 0,
    filter: "blur(80px)",
    opacity: 0.7,
    borderRadius: "50%",
    "&[data-which='1']": {
      top: "-20%",
      left: "-10%",
      width: "640px",
      height: "640px",
      background:
        "radial-gradient(circle, rgba(124,92,255,0.45) 0%, rgba(124,92,255,0) 70%)",
    },
    "&[data-which='2']": {
      bottom: "-30%",
      right: "-15%",
      width: "720px",
      height: "720px",
      background:
        "radial-gradient(circle, rgba(34,211,238,0.35) 0%, rgba(244,114,182,0.25) 40%, transparent 70%)",
    },
  },
});

const HeroGrid = styled("div", {
  base: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    backgroundImage:
      "linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)",
    backgroundSize: "56px 56px",
    maskImage:
      "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(0,0,0,1), transparent 75%)",
    WebkitMaskImage:
      "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(0,0,0,1), transparent 75%)",
  },
});

const Noise = styled("div", {
  base: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
    opacity: 0.4,
    mixBlendMode: "overlay",
    backgroundImage:
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.08 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
  },
});

const HeroCopy = styled("div", {
  base: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
});

const Eyebrow = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#555",
    fontSize: "0.88rem",
    flexWrap: "wrap",
  },
});

const Pill = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 11px",
    borderRadius: "999px",
    background: "#0a0a0a",
    color: "#fff",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
});

const PillDot = styled("span", {
  base: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#34d399",
    boxShadow: "0 0 8px #34d399",
    animation: "landing-live 1.6s ease-in-out infinite",
  },
});

const H1 = styled("h1", {
  base: {
    fontSize: "clamp(3rem, 7.5vw, 6.5rem)",
    fontWeight: 900,
    lineHeight: 0.95,
    letterSpacing: "-0.05em",
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
});

const HeroLine = styled("span", {
  base: {
    display: "block",
  },
});

const CycleSlot = styled("span", {
  base: {
    position: "relative",
    display: "inline-block",
    verticalAlign: "baseline",
    minWidth: "10ch",
    height: "1em",
  },
});

const CycleWord = styled("span", {
  base: {
    position: "absolute",
    left: 0,
    top: 0,
    whiteSpace: "nowrap",
    opacity: 0,
    transform: "translateY(40%) scale(0.92)",
    filter: "blur(8px)",
    transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s",
    background: "var(--accent)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    "&[data-active='true']": {
      opacity: 1,
      transform: "translateY(0) scale(1)",
      filter: "blur(0)",
    },
  },
});

const Sub = styled("p", {
  base: {
    fontSize: "1.15rem",
    color: "#444",
    lineHeight: 1.55,
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
  },
});

const primaryBtnHero = () =>
  css({
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "16px 26px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    color: "#fff",
    textDecoration: "none",
    fontSize: "1rem",
    fontWeight: 700,
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow:
      "0 16px 36px -12px rgba(124,92,255,0.55), 0 8px 20px -8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
      transform: "translateX(-100%)",
      transition: "transform 0.8s",
    },
    "&:hover": {
      boxShadow:
        "0 22px 50px -14px rgba(124,92,255,0.7), 0 10px 24px -8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
    },
    "&:hover::before": { transform: "translateX(100%)" },
    "& > *": { position: "relative", zIndex: 1 },
  });

const CtaArrow = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.12)",
    fontSize: "0.9rem",
    transition: "transform 0.25s",
    "a:hover &": { transform: "translateX(3px)" },
  },
});

const LiveCounter = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "16px",
    color: "#666",
    fontSize: "0.88rem",
    "& strong": {
      color: "#0a0a0a",
      fontWeight: 700,
      fontFamily: "ui-monospace, SFMono-Regular, monospace",
      fontVariantNumeric: "tabular-nums",
    },
  },
});

const LivePulse = styled("span", {
  base: {
    position: "relative",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 12px rgba(34,197,94,0.6)",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: "-4px",
      borderRadius: "50%",
      background: "rgba(34,197,94,0.4)",
      animation: "landing-pulse-out 2s ease-out infinite",
    },
  },
});

const Sep = styled("span", {
  base: {
    color: "#bbb",
    margin: "0 4px",
  },
});

const TrustItem = styled("span", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "#666",
    "& svg": { color: "#0a0a0a" },
  },
});

/* hero right stage */

const HeroStage = styled("div", {
  base: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    aspectRatio: "5 / 4",
    "@media (max-width: 1024px)": { aspectRatio: "4 / 3" },
  },
});

const StageGlow = styled("div", {
  base: {
    position: "absolute",
    inset: "10% -5%",
    background:
      "radial-gradient(ellipse at 50% 50%, rgba(124,92,255,0.25), transparent 60%)",
    filter: "blur(40px)",
    pointerEvents: "none",
    zIndex: 0,
  },
});

const ShotWrap = styled("div", {
  base: {
    position: "absolute",
    inset: 0,
    margin: "auto",
    width: "92%",
    height: "fit-content",
    top: "50%",
    transform: "translateY(-50%)",
    transformStyle: "preserve-3d",
    perspective: "1200px",
    zIndex: 2,
  },
});

const ShotFrame = styled("div", {
  base: {
    position: "relative",
    width: "100%",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.1)",
    boxShadow:
      "0 60px 120px -30px rgba(124,92,255,0.45), 0 30px 60px -20px rgba(0,0,0,0.25), 0 0 0 1px rgba(124,92,255,0.08)",
    background: "#f5f5f5",
    transformStyle: "preserve-3d",
  },
});

const ShotChrome = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "10px 14px",
    background: "rgba(20,20,28,0.95)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
});

const ShotDot = styled("span", {
  base: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
});

const ShotUrl = styled("span", {
  base: {
    marginLeft: "auto",
    marginRight: "auto",
    fontSize: "0.72rem",
    color: "rgba(255,255,255,0.5)",
    fontFamily: "ui-monospace, SFMono-Regular, monospace",
  },
});

const ShotReflection = styled("div", {
  base: {
    position: "absolute",
    top: "100%",
    left: "5%",
    right: "5%",
    height: "60%",
    background: "linear-gradient(to bottom, rgba(124,92,255,0.18), transparent)",
    filter: "blur(20px)",
    transform: "scaleY(-1)",
    opacity: 0.4,
    pointerEvents: "none",
  },
});

/* floating community */

const FloatingAvatar = styled("div", {
  base: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    color: "#fff",
    fontSize: "1.05rem",
    letterSpacing: "-0.02em",
    zIndex: 3,
    cursor: "default",
    border: "3px solid #fff",
    "@media (max-width: 540px)": {
      transform: "translate(-50%, -50%) scale(0.7)",
    },
  },
});

const FloatingAvatarPulse = styled("span", {
  base: {
    position: "absolute",
    inset: "-6px",
    borderRadius: "50%",
    opacity: 0.35,
    animation: "landing-pulse-out 2.4s ease-out infinite",
  },
});

const FloatingChat = styled("div", {
  base: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "9px 13px 9px 9px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0,0,0,0.08)",
    boxShadow:
      "0 18px 40px -14px rgba(0,0,0,0.25), 0 6px 14px -6px rgba(0,0,0,0.1)",
    zIndex: 4,
    whiteSpace: "nowrap",
    "@media (max-width: 540px)": { display: "none" },
  },
});

const FloatingChatAvatar = styled("div", {
  base: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    flexShrink: 0,
  },
});

const FloatingChatBody = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "1px",
  },
});

const FloatingChatName = styled("span", {
  base: {
    fontSize: "0.72rem",
    fontWeight: 700,
  },
});

const FloatingChatText = styled("span", {
  base: {
    fontSize: "0.84rem",
    color: "#222",
    fontWeight: 500,
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

const StreamPlaceholder = styled("div", {
  base: {
    position: "absolute",
    inset: 0,
    zIndex: 0,
    background:
      "radial-gradient(ellipse at 30% 40%, rgba(124,92,255,0.35), transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(88,101,242,0.3), transparent 60%), #0b0c14",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

const StreamPlaceholderGrid = styled("div", {
  base: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
    backgroundSize: "32px 32px",
    transform: "perspective(600px) rotateX(40deg) translateY(20%) scale(1.4)",
    transformOrigin: "center bottom",
    maskImage:
      "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
    WebkitMaskImage:
      "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)",
  },
});

const StreamPlaceholderGlow = styled("div", {
  base: {
    position: "absolute",
    width: "70%",
    height: "60%",
    background:
      "radial-gradient(circle, rgba(124,92,255,0.4) 0%, transparent 70%)",
    filter: "blur(40px)",
    animation: "landing-pulse-glow 4s ease-in-out infinite",
  },
});

const StreamPlaceholderText = styled("div", {
  base: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    "& strong": {
      fontSize: "1.05rem",
      fontWeight: 700,
      color: "#fff",
      letterSpacing: "-0.01em",
    },
    "& span": {
      fontSize: "0.82rem",
      color: "rgba(255,255,255,0.5)",
    },
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
