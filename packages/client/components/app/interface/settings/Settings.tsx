import {
  type JSX,
  Accessor,
  createContext,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  untrack,
  useContext,
  Show,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";

import { Rerun } from "@solid-primitives/keyed";

import { SettingsConfiguration, SettingsEntry, SettingsList } from ".";
import { SettingsContent } from "./_layout/Content";
import { SettingsSidebar } from "./_layout/Sidebar";
import { styled } from "styled-system/jsx";

export interface SettingsProps {
  /**
   * Close settings
   */
  onClose?: () => void;

  /**
   * Settings context
   */
  context: never;
}

/**
 * Transition animation
 */
export type SettingsTransition = "normal" | "to-child" | "to-parent";

/**
 * Provide navigation to child components
 */
const SettingsNavigationContext = createContext<{
  page: Accessor<string | undefined>;
  navigate: (path: string | SettingsEntry) => void;
}>();

/**
 * Generic Settings component
 */
export function Settings(props: SettingsProps & SettingsConfiguration<never>) {
  const [page, setPage] = createSignal<undefined | string>(
    // eslint-disable-next-line
    (props.context as any)?.page,
  );
  const [transition, setTransition] =
    createSignal<SettingsTransition>("normal");

  const [isMobile, setIsMobile] = createSignal(false);

  onMount(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(media.matches);
    update();

    media.addEventListener("change", update);
    onCleanup(() => media.removeEventListener("change", update));
  });

  /**
   * Navigate to a certain page
   */
  function navigate(entry: string | SettingsEntry) {
    let id;
    if (typeof entry === "object") {
      if (entry.onClick) {
        entry.onClick();
      } else if (entry.href) {
        window.open(entry.href, "_blank");
      } else if (entry.id) {
        id = entry.id;
      }
    } else {
      id = entry;
    }

    if (!id) return;

    const current = page();
    if (current?.startsWith(id)) {
      setTransition("to-parent");
    } else if (current && id.startsWith(current)) {
      setTransition("to-child");
    } else {
      setTransition("normal");
    }

    setPage(id);
  }

  let touchStartX = 0;
  let touchStartY = 0;

  const onTouchStart = (e: TouchEvent) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!isMobile() || !page()) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = Math.abs(touchEndY - touchStartY);

    // Swipe threshold: 100px from left to right, with low vertical deviation
    if (deltaX > 100 && deltaY < 60) {
      setTransition("to-parent");
      setPage(undefined);
    }
  };

  return (
    <SettingsNavigationContext.Provider
      value={{
        page,
        navigate,
      }}
    >
      <MemoisedList context={props.context} list={props.list}>
        {(list) => (
          <Layout onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <Show when={!isMobile() || !page()}>
              <SettingsSidebar
                list={list}
                page={page}
                setPage={setPage}
                autoSelectFirst={!isMobile()}
              />
            </Show>

            <Show when={!isMobile() || page()}>
              <SettingsContent
                page={page}
                list={list}
                title={props.title}
                onClose={props.onClose}
                onBack={isMobile() ? () => setPage(undefined) : undefined}
              >
                <Presence exitBeforeEnter>
                  <Rerun on={page}>
                    <Motion.div
                      style={
                        untrack(transition) === "normal"
                          ? {}
                          : { visibility: "hidden" }
                      }
                      ref={(el) =>
                        untrack(transition) !== "normal" &&
                        setTimeout(
                          () => (el.style.visibility = "visible"),
                          250,
                        )
                      }
                      initial={
                        transition() === "normal"
                          ? { opacity: 0, y: 50 }
                          : transition() === "to-child"
                            ? {
                                x: "100vw",
                              }
                            : { x: "-100vw" }
                      }
                      animate={{
                        opacity: 1,
                        x: 0,
                        y: 0,
                      }}
                      exit={
                        transition() === "normal"
                          ? undefined
                          : transition() === "to-child"
                            ? {
                                x: "-100vw",
                              }
                            : { x: "100vw" }
                      }
                      transition={{
                        duration: 0.2,
                        easing: [0.17, 0.67, 0.58, 0.98],
                      }}
                    >
                      {props.render({ page }, props.context)}
                    </Motion.div>
                  </Rerun>
                </Presence>
              </SettingsContent>
            </Show>
          </Layout>
        )}
      </MemoisedList>
    </SettingsNavigationContext.Provider>
  );
}

const Layout = styled("div", {
  base: {
    width: "100%",
    height: "100%",
    display: "flex",
    minWidth: 0,
    minHeight: 0,

    "@media (max-width: 768px)": {
      flexDirection: "column",
      padding: 0,
      borderRadius: 0,
      background: "var(--md-sys-color-surface-container-low)",
    },
  },
});

/**
 * Memoise the list but generate it within context
 */
function MemoisedList(props: {
  context: never;
  list: (context: never) => SettingsList<unknown>;
  children: (list: Accessor<SettingsList<unknown>>) => JSX.Element;
}) {
  /**
   * Generate list of categories / links
   */
  const list = createMemo(() => props.list(props.context));

  return <>{props.children(list)}</>;
}

/**
 * Use settings navigation context
 */
export const useSettingsNavigation = () =>
  useContext(SettingsNavigationContext)!;
