import { JSX, For, Show, createSignal } from "solid-js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import {
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiChevronDown,
  FiCoffee,
  FiCompass,
  FiDownload,
  FiGithub,
  FiHeart,
  FiMenu,
  FiShield,
  FiUsers,
  FiX,
} from "solid-icons/fi";
import { BiRegularCode, BiRegularLock } from "solid-icons/bi";

import Wordmark from "../../../public/assets/web/wordmark.svg?component-solid";

/* ---------- shared between all legal/policy pages ---------- */

const URLS = {
  signup: "/login/create",
  login: "/login/auth",
  donate: "https://buymeacoffee.com/korybantes",
  bluesky: "https://bsky.app/profile/gangio.pro",
  github: "https://github.com/Gangio-App",
};

export const LEGAL_PAGES: { href: string; label: string; desc: string }[] = [
  { href: "/terms", label: "Terms of Service", desc: "Your agreement with Gangio." },
  { href: "/privacy", label: "Privacy Policy", desc: "What we collect and why." },
  { href: "/cookies", label: "Cookie Policy", desc: "How we use cookies and storage." },
  { href: "/acceptable-use", label: "Acceptable Use", desc: "What you can and can't do here." },
  { href: "/guidelines", label: "Community Guidelines", desc: "How we keep communities healthy." },
  { href: "/safety", label: "Safety Center", desc: "Tools, reporting, and resources." },
  { href: "/contact", label: "Contact", desc: "Reach the team." },
];

/* Visual nav links shown in the LegalLayout top bar — these point at the
 * Landing page anchors so people don't get stranded on legal pages. */
const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Product", href: "/#features" },
  { label: "Resources", href: "/#voice" },
  { label: "Download", href: "/download" },
  { label: "Discover", href: "/discover/servers" },
];

/* Inline Bluesky butterfly logo. */
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

export type LegalLayoutProps = {
  title: string;
  /** Short tagline shown under the title. */
  tagline?: string;
  /** Pretty date or "Last updated" string. */
  updated?: string;
  /** Quick TL;DR summary shown in a callout above the body. */
  summary?: string;
  /** Path of the current page so the side nav can highlight it. */
  current?: string;
  children: JSX.Element;
};

/**
 * LegalLayout — shared chrome for every legal/policy page.
 *
 * Visual goal: the navbar and footer must look identical to the marketing
 * Landing page, so users moving from `/` to `/privacy` to `/terms` never
 * feel like they've been thrown into a different (or older) site.
 *
 * On mobile the desktop sidebar would dump every legal title before the
 * actual page content, which is awful — so on small viewports we collapse
 * the side-nav into an accordion that opens on demand and the article
 * starts immediately under the title.
 */
export function LegalLayout(props: LegalLayoutProps) {
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const [mobileNavOpen, setMobileNavOpen] = createSignal(false);

  const currentLabel = () =>
    LEGAL_PAGES.find((p) => p.href === props.current)?.label ??
    "Browse policies";

  return (
    <Root>
      {/* NAV — same look & feel as Landing */}
      <Nav>
        <NavInner>
          <NavLeft>
            <a href="/" class={brandLink()} aria-label="Gangio home">
              <Wordmark
                class={css({
                  height: "26px",
                  width: "auto",
                  color: "#0a0a0a",
                })}
              />
            </a>
          </NavLeft>

          <NavLinksDesktop>
            <For each={NAV_LINKS}>
              {(link) => <NavLink href={link.href}>{link.label}</NavLink>}
            </For>
          </NavLinksDesktop>

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
              <FiArrowLeft size={18} /> Home
            </DrawerLink>
            <DrawerLink
              href="/download"
              onClick={() => setDrawerOpen(false)}
            >
              <FiDownload size={18} /> Download
            </DrawerLink>
            <DrawerLink
              href="/discover/servers"
              onClick={() => setDrawerOpen(false)}
            >
              <FiCompass size={18} /> Discover
            </DrawerLink>

            <DrawerHeading>Legal &amp; Policies</DrawerHeading>
            <For each={LEGAL_PAGES}>
              {(p) => (
                <DrawerLink
                  href={p.href}
                  onClick={() => setDrawerOpen(false)}
                  data-current={
                    props.current === p.href ? "true" : undefined
                  }
                >
                  <FiBookOpen size={18} /> {p.label}
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

      {/* PAGE */}
      <Page>
        {/* Desktop sidebar */}
        <AsideDesktop aria-label="Legal navigation">
          <AsideTitle>Legal &amp; Policies</AsideTitle>
          <AsideList>
            <For each={LEGAL_PAGES}>
              {(page) => (
                <AsideItem
                  href={page.href}
                  data-current={
                    props.current === page.href ? "true" : undefined
                  }
                >
                  <span>{page.label}</span>
                  <small>{page.desc}</small>
                </AsideItem>
              )}
            </For>
          </AsideList>
          <AsideHelp>
            <FiHeart size={14} />
            Have feedback?
            <a href="/contact">Contact us</a>
          </AsideHelp>
        </AsideDesktop>

        <Article>
          {/* Mobile-only: compact accordion of legal pages. Collapsed by
              default so the article shows up immediately. */}
          <MobileNav>
            <MobileNavTrigger
              type="button"
              aria-expanded={mobileNavOpen()}
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              <span>
                <FiBookOpen size={14} /> {currentLabel()}
              </span>
              <FiChevronDown
                size={16}
                style={{
                  transform: mobileNavOpen()
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              />
            </MobileNavTrigger>
            <Show when={mobileNavOpen()}>
              <MobileNavList>
                <For each={LEGAL_PAGES}>
                  {(p) => (
                    <MobileNavItem
                      href={p.href}
                      data-current={
                        props.current === p.href ? "true" : undefined
                      }
                      onClick={() => setMobileNavOpen(false)}
                    >
                      {p.label}
                    </MobileNavItem>
                  )}
                </For>
              </MobileNavList>
            </Show>
          </MobileNav>

          <Eyebrow>
            <FiBookOpen size={14} />
            <span>Legal</span>
          </Eyebrow>
          <Title>{props.title}</Title>
          {props.tagline && <Tagline>{props.tagline}</Tagline>}
          {props.updated && (
            <Updated>
              <span>Last updated</span>
              <strong>{props.updated}</strong>
            </Updated>
          )}
          {props.summary && (
            <Summary>
              <SummaryBadge>
                <FiShield size={14} />
                In short
              </SummaryBadge>
              <p>{props.summary}</p>
            </Summary>
          )}
          <Body>{props.children}</Body>

          {/* Mobile-only: contact callout below body */}
          <MobileHelp>
            <FiHeart size={14} />
            Have feedback?
            <a href="/contact">Contact us</a>
          </MobileHelp>
        </Article>
      </Page>

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
              <For each={LEGAL_PAGES.slice(0, 4)}>
                {(p) => <a href={p.href}>{p.label}</a>}
              </For>
            </FooterCol>
            <FooterCol>
              <FooterColTitle>Trust &amp; Safety</FooterColTitle>
              <For each={LEGAL_PAGES.slice(4)}>
                {(p) => <a href={p.href}>{p.label}</a>}
              </For>
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
          </FooterSocials>
        </FooterBottom>
      </Footer>
    </Root>
  );
}

/* ---------------- styles ---------------- */

const Root = styled("div", {
  base: {
    minHeight: "100vh",
    width: "100%",
    height: "100%",
    overflowX: "hidden",
    overflowY: "auto",
    background: "#fafaf7",
    color: "#0a0a0a",
    fontFamily:
      "'Plus Jakarta Sans Variable', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    "& a": { color: "inherit" },
  },
});

/* nav (matches Landing) */

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

const NavLeft = styled("div", {
  base: { display: "flex", alignItems: "center", gap: "16px", flexShrink: 0 },
});

const brandLink = () =>
  css({
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    flexShrink: 0,
  });

const NavLinksDesktop = styled("nav", {
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
    appearance: "none",
    padding: "8px 14px",
    borderRadius: "999px",
    color: "#0a0a0a",
    fontSize: "0.92rem",
    fontWeight: 600,
    textDecoration: "none",
    transition: "background 0.15s, color 0.15s",
    "&:hover": { background: "rgba(0,0,0,0.05)" },
  },
});

const NavCtas = styled("div", {
  base: { display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 },
});

const navOpenAppBtn = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 16px",
    borderRadius: "999px",
    background: "#0a0a0a",
    color: "#fff",
    fontSize: "0.88rem",
    fontWeight: 700,
    textDecoration: "none",
    transition: "transform 0.15s, background 0.15s",
    "&:hover": { background: "#1a1a1a", transform: "translateY(-1px)" },
  });

const NavBurger = styled("button", {
  base: {
    display: "none",
    appearance: "none",
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
    appearance: "none",
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
    transition: "background 0.12s",
    "&:hover": { background: "rgba(0,0,0,0.04)" },
    "&[data-current='true']": {
      color: "#7c5cff",
      background: "rgba(124,92,255,0.08)",
    },
    "& svg": { color: "#666", flexShrink: 0 },
    "&[data-current='true'] svg": { color: "#7c5cff" },
  },
});

const DrawerCta = styled("div", {
  base: {
    padding: "16px 22px 22px",
    borderTop: "1px solid rgba(0,0,0,0.06)",
  },
});

/* page */

const Page = styled("div", {
  base: {
    maxWidth: "1320px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: "48px",
    padding: "48px 32px 96px",
    "@media (max-width: 960px)": {
      gridTemplateColumns: "1fr",
      gap: "0",
      padding: "24px 20px 64px",
    },
  },
});

/* desktop sidebar (hidden on mobile) */

const AsideDesktop = styled("aside", {
  base: {
    position: "sticky",
    top: "88px",
    alignSelf: "start",
    "@media (max-width: 960px)": { display: "none" },
  },
});

const AsideTitle = styled("div", {
  base: {
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#666",
    padding: "0 12px 8px",
  },
});

const AsideList = styled("nav", {
  base: { display: "flex", flexDirection: "column", gap: "2px" },
});

const AsideItem = styled("a", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: "10px 12px",
    borderRadius: "10px",
    color: "#0a0a0a",
    textDecoration: "none",
    border: "1px solid transparent",
    transition: "background 0.12s, border-color 0.12s",
    "& span": { fontSize: "0.92rem", fontWeight: 600 },
    "& small": { fontSize: "0.78rem", color: "#777", lineHeight: 1.4 },
    "&:hover": { background: "rgba(0,0,0,0.04)" },
    "&[data-current='true']": {
      background: "#fff",
      borderColor: "rgba(0,0,0,0.08)",
      boxShadow: "0 4px 14px -8px rgba(0,0,0,0.12)",
      "& span": { color: "#7c5cff" },
    },
  },
});

const AsideHelp = styled("div", {
  base: {
    marginTop: "20px",
    padding: "14px",
    borderRadius: "12px",
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.06)",
    fontSize: "0.85rem",
    color: "#444",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
    "& svg": { color: "#e11d48" },
    "& a": {
      color: "#7c5cff",
      fontWeight: 600,
      textDecoration: "none",
      marginLeft: "4px",
      "&:hover": { textDecoration: "underline" },
    },
  },
});

/* mobile-only nav (compact accordion above the article) */

const MobileNav = styled("div", {
  base: {
    display: "none",
    marginBottom: "20px",
    "@media (max-width: 960px)": { display: "block" },
  },
});

const MobileNavTrigger = styled("button", {
  base: {
    appearance: "none",
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "12px",
    padding: "12px 14px",
    width: "100%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#0a0a0a",
    fontSize: "0.92rem",
    fontWeight: 700,
    boxShadow: "0 2px 6px -3px rgba(0,0,0,0.1)",
    "& > span": {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      "& svg": { color: "#7c5cff" },
    },
  },
});

const MobileNavList = styled("nav", {
  base: {
    marginTop: "6px",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 8px 24px -12px rgba(0,0,0,0.18)",
  },
});

const MobileNavItem = styled("a", {
  base: {
    padding: "12px 14px",
    color: "#0a0a0a",
    fontSize: "0.92rem",
    fontWeight: 600,
    textDecoration: "none",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    "&:last-child": { borderBottom: "none" },
    "&:hover": { background: "rgba(0,0,0,0.03)" },
    "&[data-current='true']": {
      color: "#7c5cff",
      background: "rgba(124,92,255,0.06)",
    },
  },
});

const MobileHelp = styled("div", {
  base: {
    display: "none",
    marginTop: "32px",
    padding: "14px",
    borderRadius: "12px",
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.06)",
    fontSize: "0.88rem",
    color: "#444",
    alignItems: "center",
    gap: "6px",
    flexWrap: "wrap",
    "& svg": { color: "#e11d48" },
    "& a": {
      color: "#7c5cff",
      fontWeight: 600,
      textDecoration: "none",
      marginLeft: "4px",
    },
    "@media (max-width: 960px)": { display: "flex" },
  },
});

/* article */

const Article = styled("article", {
  base: { maxWidth: "780px", width: "100%" },
});

const Eyebrow = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "5px 10px",
    borderRadius: "999px",
    background: "rgba(124,92,255,0.1)",
    color: "#7c5cff",
    fontSize: "0.74rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "16px",
  },
});

const Title = styled("h1", {
  base: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: 800,
    letterSpacing: "-0.03em",
    lineHeight: 1.05,
    margin: 0,
  },
});

const Tagline = styled("p", {
  base: {
    marginTop: "12px",
    fontSize: "1.05rem",
    color: "#555",
    lineHeight: 1.55,
  },
});

const Updated = styled("div", {
  base: {
    marginTop: "20px",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(0,0,0,0.08)",
    background: "#fff",
    fontSize: "0.82rem",
    "& span": { color: "#666" },
    "& strong": { color: "#0a0a0a", fontWeight: 700 },
  },
});

const Summary = styled("div", {
  base: {
    marginTop: "28px",
    padding: "18px 20px",
    borderRadius: "14px",
    background: "linear-gradient(160deg, #faf7ff 0%, #f0ebff 100%)",
    border: "1px solid rgba(124,92,255,0.18)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    "& p": {
      margin: 0,
      color: "#222",
      fontSize: "0.96rem",
      lineHeight: 1.55,
    },
  },
});

const SummaryBadge = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "#7c5cff",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
});

const Body = styled("div", {
  base: {
    marginTop: "32px",
    fontSize: "1rem",
    lineHeight: 1.75,
    color: "#222",
    "& h2": {
      fontSize: "1.4rem",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      marginTop: "40px",
      marginBottom: "12px",
      color: "#0a0a0a",
      scrollMarginTop: "100px",
    },
    "& h3": {
      fontSize: "1.1rem",
      fontWeight: 700,
      marginTop: "28px",
      marginBottom: "8px",
      color: "#0a0a0a",
    },
    "& p": { margin: "0 0 14px" },
    "& a": {
      color: "#7c5cff",
      textDecoration: "underline",
      textUnderlineOffset: "3px",
      "&:hover": { color: "#5b3fd9" },
    },
    "& ul, & ol": {
      margin: "0 0 14px",
      paddingLeft: "22px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    "& li": { paddingLeft: "4px" },
    "& code": {
      fontFamily:
        'ui-monospace, SF Mono, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
      fontSize: "0.9em",
      padding: "1px 6px",
      borderRadius: "6px",
      background: "rgba(0,0,0,0.06)",
    },
    "& blockquote": {
      margin: "16px 0",
      padding: "10px 16px",
      borderLeft: "3px solid #7c5cff",
      background: "rgba(124,92,255,0.06)",
      color: "#333",
      fontStyle: "italic",
    },
    "& hr": {
      border: "none",
      borderTop: "1px solid rgba(0,0,0,0.08)",
      margin: "32px 0",
    },
    "& strong": { color: "#0a0a0a" },
  },
});

/* footer (compact, matches Landing) */

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
  },
});
