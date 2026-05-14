import { JSX, For } from "solid-js";
import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import {
  FiArrowLeft,
  FiArrowUpRight,
  FiBookOpen,
  FiCoffee,
  FiGithub,
  FiHeart,
  FiShield,
  FiUsers,
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
 * LegalLayout — shared chrome for all legal/policy pages.
 *
 * Renders a clean, branded top navbar (matching the Landing design),
 * a sidebar with quick links between every legal page, a long-form
 * content area with sensible typography defaults, and the same footer
 * used on the marketing site. Designed to be lightweight (no GSAP, no
 * megamenu) so it loads fast for compliance audits and crawlers.
 */
export function LegalLayout(props: LegalLayoutProps) {
  return (
    <Root>
      {/* NAV */}
      <Nav>
        <NavInner>
          <NavLeft>
            <a href="/" class={navHomeBtn()} aria-label="Back to home">
              <FiArrowLeft size={16} />
              <span>Home</span>
            </a>
            <NavBrand href="/">
              <Wordmark
                class={css({ height: "22px", width: "auto", color: "#0a0a0a" })}
              />
            </NavBrand>
          </NavLeft>
          <NavCtas>
            <a class={navOpenAppBtn()} href={URLS.login}>
              Open app
              <FiArrowUpRight size={14} />
            </a>
          </NavCtas>
        </NavInner>
      </Nav>

      {/* PAGE */}
      <Page>
        <Aside aria-label="Legal navigation">
          <AsideTitle>Legal & Policies</AsideTitle>
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
        </Aside>

        <Article>
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
              <For each={LEGAL_PAGES}>
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
    background: "#fafaf7",
    color: "#0a0a0a",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    overflowX: "hidden",
    overflowY: "auto",
    "& a": { color: "#0a0a0a" },
  },
});

/* nav */

const Nav = styled("header", {
  base: {
    position: "sticky",
    top: 0,
    zIndex: 60,
    background: "rgba(250,250,247,0.85)",
    backdropFilter: "saturate(160%) blur(14px)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
});

const NavInner = styled("div", {
  base: {
    maxWidth: "1320px",
    margin: "0 auto",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
});

const NavLeft = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
});

const NavBrand = styled("a", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    color: "#0a0a0a",
    textDecoration: "none",
  },
});

const NavCtas = styled("div", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
});

const navHomeBtn = () =>
  css({
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#0a0a0a",
    background: "rgba(0,0,0,0.04)",
    textDecoration: "none",
    transition: "background 0.15s",
    "&:hover": { background: "rgba(0,0,0,0.08)" },
    "@media (max-width: 540px)": { "& span": { display: "none" } },
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
      gap: "24px",
      padding: "32px 20px 64px",
    },
  },
});

/* aside / sidebar */

const Aside = styled("aside", {
  base: {
    position: "sticky",
    top: "88px",
    alignSelf: "start",
    "@media (max-width: 960px)": { position: "static", top: "auto" },
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
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
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

/* article */

const Article = styled("article", {
  base: {
    maxWidth: "780px",
    width: "100%",
  },
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
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
    "@media (max-width: 540px)": { gridTemplateColumns: "1fr 1fr" },
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
