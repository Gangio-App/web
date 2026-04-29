import {
  BiSolidFile,
  BiSolidFileImage,
  BiSolidFileTxt,
  BiSolidVideoRecording,
} from "solid-icons/bi";
import {
  For,
  Match,
  Show,
  Switch,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { Portal } from "solid-js/web";
import { Motion, Presence } from "solid-motionone";

import { Plural } from "@lingui-solid/solid/macro";

import { useModals } from "@revolt/modal";

interface Props {
  /**
   * Callback for dropped files
   * @param files List of files
   */
  onFiles: (files: File[]) => void;

  /**
   * Whether to allow dropping files while in a modal
   */
  allowInModal?: boolean;

  /**
   * Target name to display (e.g. "#channel" or "@username")
   */
  targetName?: string;
}

// Inject the keyframes once
const STYLE_ID = "file-drop-overlay-keyframes";
function ensureKeyframes() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes fileDropBorderRotate {
      0% { --file-drop-angle: 0deg; }
      100% { --file-drop-angle: 360deg; }
    }
    @keyframes fileDropPulseRing {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
      50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0; }
    }
    @keyframes fileDropIconFloat {
      0%, 100% { transform: translate(-50%, -60%) translateY(0); }
      50% { transform: translate(-50%, -60%) translateY(-6px); }
    }
    @keyframes fileDropDashOffset {
      0% { stroke-dashoffset: 0; }
      100% { stroke-dashoffset: -30; }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Collect files that are dropped anywhere in the page.
 * Displays a themed upload overlay using the app's Material You design tokens.
 */
export function FileDropAnywhereCollector(props: Props) {
  const { isOpen } = useModals();
  const [showIndicator, setShowIndicator] = createSignal(false);
  const [items, setItems] = createSignal<DataTransferItem[]>([]);

  onMount(ensureKeyframes);

  /**
   * Use a counter-based approach for drag tracking.
   * dragenter increments, dragleave decrements.
   * When counter reaches 0, the drag has truly left the window.
   * This prevents flickering when dragging over child elements.
   */
  let dragCounter = 0;

  function onDragEnter(event: DragEvent) {
    if (isOpen() && !props.allowInModal) return;
    event.preventDefault();
    dragCounter++;
    if (dragCounter === 1 && event.dataTransfer) {
      const hasFiles = Array.from(event.dataTransfer.types).includes("Files");
      if (hasFiles) {
        setShowIndicator(true);
        setItems([...event.dataTransfer.items]);
      }
    }
  }

  function onDragOver(event: DragEvent) {
    if (isOpen() && !props.allowInModal) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  }

  function onDragLeave(event: DragEvent) {
    event.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      setShowIndicator(false);
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    dragCounter = 0;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      props.onFiles([...files]);
    }
    setShowIndicator(false);
  }

  onMount(() => {
    document.addEventListener("dragenter", onDragEnter);
    document.addEventListener("dragover", onDragOver);
    document.addEventListener("dragleave", onDragLeave);
    document.addEventListener("drop", onDrop);
  });

  onCleanup(() => {
    document.removeEventListener("dragenter", onDragEnter);
    document.removeEventListener("dragover", onDragOver);
    document.removeEventListener("dragleave", onDragLeave);
    document.removeEventListener("drop", onDrop);
  });

  /**
   * Generate fanned-out rotation angles for each item
   */
  const previewItems = () => {
    const all = items();
    const count = Math.min(all.length, 5);
    return all.slice(0, count).map((item, index) => {
      const spread = 14;
      const angle =
        count === 1
          ? 0
          : -spread + (index / (count - 1)) * (spread * 2);
      return { item, angle };
    });
  };

  return (
    <Presence>
      <Show when={showIndicator()}>
        <Portal>
          {/* Scrim — uses the app's blur setting */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              inset: "0",
              "z-index": "99999",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
              background:
                "color-mix(in srgb, var(--md-sys-color-scrim) 60%, transparent)",
              "backdrop-filter": "var(--effects-blur-md)",
              "pointer-events": "none",
            }}
          >
            {/* Card */}
            <Motion.div
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 18 }}
              transition={{ duration: 0.3, easing: [0.05, 0.7, 0.1, 1.0] }}
              style={{
                position: "relative",
                display: "flex",
                "flex-direction": "column",
                "align-items": "center",
                "justify-content": "center",
                width: "320px",
                padding: "40px 32px 36px",
                "border-radius": "var(--borderRadius-xl)",
                background: "var(--md-sys-color-surface-container-high)",
                overflow: "hidden",
              }}
            >
              {/* Animated dashed border — SVG rounded rect */}
              <svg
                style={{
                  position: "absolute",
                  inset: "0",
                  width: "100%",
                  height: "100%",
                  "pointer-events": "none",
                }}
              >
                <rect
                  x="2"
                  y="2"
                  rx="26"
                  ry="26"
                  style={{
                    width: "calc(100% - 4px)",
                    height: "calc(100% - 4px)",
                    fill: "none",
                    stroke: "var(--md-sys-color-primary)",
                    "stroke-width": "2.5",
                    "stroke-dasharray": "10 6",
                    "stroke-linecap": "round",
                    opacity: "0.55",
                    animation: "fileDropDashOffset 1.2s linear infinite",
                  }}
                />
              </svg>

              {/* Subtle glow behind icon area */}
              <div
                style={{
                  position: "absolute",
                  top: "28%",
                  left: "50%",
                  width: "140px",
                  height: "140px",
                  transform: "translate(-50%, -50%)",
                  background:
                    "radial-gradient(circle, color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent) 0%, transparent 70%)",
                  "pointer-events": "none",
                }}
              />

              {/* Pulsing ring behind icons */}
              <div
                style={{
                  position: "absolute",
                  top: "30%",
                  left: "50%",
                  width: "100px",
                  height: "100px",
                  "border-radius": "var(--borderRadius-full)",
                  border:
                    "2px solid color-mix(in srgb, var(--md-sys-color-primary) 30%, transparent)",
                  animation: "fileDropPulseRing 2.4s ease-in-out infinite",
                  "pointer-events": "none",
                }}
              />

              {/* Stacked file icons */}
              <div
                style={{
                  position: "relative",
                  width: "120px",
                  height: "90px",
                  "margin-bottom": "20px",
                }}
              >
                <For each={previewItems()}>
                  {(preview, index) => (
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: `translate(-50%, -60%) rotate(${preview.angle}deg)`,
                        color: "var(--md-sys-color-primary)",
                        filter:
                          "drop-shadow(0 2px 6px color-mix(in srgb, var(--md-sys-color-shadow) 25%, transparent))",
                        animation:
                          index() === 0
                            ? "fileDropIconFloat 2.8s ease-in-out infinite"
                            : "none",
                        transition:
                          "transform 0.35s cubic-bezier(0.2, 0, 0, 1)",
                      }}
                    >
                      <Switch fallback={<BiSolidFile size={52} />}>
                        <Match when={preview.item.type.startsWith("text/")}>
                          <BiSolidFileTxt size={52} />
                        </Match>
                        <Match when={preview.item.type.startsWith("image/")}>
                          <BiSolidFileImage size={52} />
                        </Match>
                        <Match when={preview.item.type.startsWith("video/")}>
                          <BiSolidVideoRecording size={52} />
                        </Match>
                      </Switch>
                    </div>
                  )}
                </For>
              </div>

              {/* Text */}
              <Motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 }}
                style={{
                  "text-align": "center",
                  "z-index": "1",
                }}
              >
                <div
                  style={{
                    "font-size": "17px",
                    "font-weight": "600",
                    "margin-bottom": "6px",
                    color: "var(--md-sys-color-on-surface)",
                    "font-family": "var(--fonts-primary)",
                  }}
                >
                  <Show
                    when={props.targetName}
                    fallback={
                      <Plural
                        value={items().length}
                        one="Drop to upload"
                        other="Drop # files"
                      />
                    }
                  >
                    Upload to {props.targetName}
                  </Show>
                </div>
                <div
                  style={{
                    "font-size": "13px",
                    color: "var(--md-sys-color-on-surface-variant)",
                    "line-height": "1.45",
                    "font-family": "var(--fonts-primary)",
                  }}
                >
                  You can add a comment before sending
                </div>
              </Motion.div>
            </Motion.div>
          </Motion.div>
        </Portal>
      </Show>
    </Presence>
  );
}
