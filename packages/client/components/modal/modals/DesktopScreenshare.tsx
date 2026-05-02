import { createResource, createSignal, For, Show } from "solid-js";
import { styled } from "styled-system/jsx";
import { Dialog, DialogProps, Button } from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";
import { Modals } from "../types";

const TABS = ["Applications", "Entire Screen"] as const;
type TabType = typeof TABS[number];

type DesktopSource = {
  id: string;
  name: string;
  display_id: string;
  thumbnailDataUrl: string;
  appIconDataUrl?: string;
};

export function DesktopScreenshareModal(props: DialogProps & Modals & { type: "desktop_screenshare" }) {
  const [tab, setTab] = createSignal<TabType>("Applications");

  const [sources] = createResource<DesktopSource[]>(async () => {
    if ((window as any).native?.getDesktopSources) {
      return await (window as any).native.getDesktopSources({ types: ["window", "screen"], thumbnailSize: { width: 300, height: 300 }, fetchWindowIcons: true });
    }
    return [];
  });

  const filteredSources = () => {
    if (!sources()) return [];
    if (tab() === "Applications") {
      return sources()!.filter(s => s.id.startsWith("window"));
    } else {
      return sources()!.filter(s => s.id.startsWith("screen"));
    }
  };

  const handleSelect = (id: string) => {
    props.callback(id);
    props.onClose();
  };

  const handleClose = () => {
    props.callback(undefined);
    props.onClose();
  };

  // Prevent default close behavior since we want to pass undefined if canceled.
  const handlePropClose = () => {
    handleClose();
  };

  return (
    <Dialog
      show={props.show}
      onClose={handlePropClose}
      title={
        <div style={{ display: "flex", "align-items": "center", gap: "var(--gap-sm)" }}>
          Share your screen
          <span style={{ 
            background: "var(--md-sys-color-primary)", 
            color: "var(--md-sys-color-on-primary)", 
            "font-size": "0.75rem", 
            padding: "2px 8px", 
            "border-radius": "var(--borderRadius-full)", 
            "font-weight": 700, 
            "letter-spacing": "0.5px", 
            "text-transform": "uppercase" 
          }}>
            New
          </span>
        </div>
      }
      actions={[{ text: "Cancel", onClick: handleClose }]}
    >
      <div style={{ width: "800px", "max-width": "100%", height: "550px", display: "flex", "flex-direction": "column" }}>
        <TabsContainer>
          <For each={TABS}>
            {t => (
              <TabButton active={tab() === t} onClick={() => setTab(t)}>
                {t}
              </TabButton>
            )}
          </For>
        </TabsContainer>

        <div style={{ padding: "0 var(--gap-md) var(--gap-sm)", color: "var(--md-sys-color-on-surface-variant)", "font-size": "0.85rem", display: "flex", "align-items": "center", gap: "var(--gap-xs)" }}>
          <Symbol size={16}>info</Symbol>
          <span>Tip: If a game is missing, try <b>Borderless Fullscreen</b> or share <b>Entire Screen</b>. Audio is supported on Desktop app.</span>
        </div>

        <Show when={!sources.loading} fallback={<div style={{ padding: "var(--gap-xl)", "text-align": "center" }}>Loading sources...</div>}>
          <GridWrapper>
            <Grid>
              <For each={filteredSources()}>
                {source => {
                  const isValidThumbnail = source.thumbnailDataUrl && source.thumbnailDataUrl.length > 30;
                  const isValidAppIcon = source.appIconDataUrl && source.appIconDataUrl.length > 30;
                  return (
                   <ThumbnailContainer onClick={() => handleSelect(source.id)}>
                     <ThumbnailImageWrapper>
                       <Show 
                         when={isValidThumbnail} 
                         fallback={<Symbol size={48} style={{ opacity: 0.15, "position": "absolute" }}>screenshot_monitor</Symbol>}
                       >
                          <ThumbnailImage 
                            src={source.thumbnailDataUrl}
                            onError={(e: any) => { e.currentTarget.style.opacity = '0'; }}
                          />
                       </Show>
                       <Show when={isValidAppIcon}>
                         <AppIconOverlay 
                           src={source.appIconDataUrl!} 
                           onError={(e: any) => { e.currentTarget.style.opacity = '0'; }}
                         />
                       </Show>
                     </ThumbnailImageWrapper>
                     <ThumbnailName>{source.name}</ThumbnailName>
                   </ThumbnailContainer>
                  );
                }}
              </For>
            </Grid>
          </GridWrapper>
        </Show>
      </div>
    </Dialog>
  );
}

const TabsContainer = styled("div", {
  base: {
    display: "flex",
    gap: "var(--gap-sm)",
    borderBottom: "1px solid var(--md-sys-color-outline-variant)",
    marginBottom: "var(--gap-md)",
  }
});

const TabButton = styled("button", {
  base: {
    padding: "var(--gap-sm) var(--gap-md)",
    cursor: "pointer",
    fontWeight: 600,
    color: "var(--md-sys-color-on-surface-variant)",
    background: "transparent",
    borderBottom: "2px solid transparent",
    transition: "color 0.2s, border-bottom 0.2s",
    
    _hover: {
      color: "var(--md-sys-color-on-surface)",
      background: "var(--md-sys-color-surface-container-highest)",
      borderRadius: "var(--borderRadius-sm) var(--borderRadius-sm) 0 0",
    }
  },
  variants: {
    active: {
      true: {
        color: "var(--md-sys-color-primary)",
        borderBottom: "2px solid var(--md-sys-color-primary)",
      }
    }
  }
});

const GridWrapper = styled("div", {
  base: {
    flexGrow: 1,
    overflowY: "auto",
    padding: "var(--gap-md)",
  }
});

const Grid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "var(--gap-lg)",
  }
});

const ThumbnailContainer = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    borderRadius: "var(--borderRadius-lg)",
    background: "var(--md-sys-color-surface-container)",
    border: "2px solid transparent",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    overflow: "hidden", // clip image and names flush!
    
    _hover: {
      transform: "translateY(-4px)",
      background: "var(--md-sys-color-surface-container-high)",
      border: "2px solid var(--md-sys-color-primary)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
      "& img:first-of-type": {
        filter: "brightness(1.05)",
      }
    },
    
    _active: {
      transform: "translateY(-1px)",
      boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
    }
  }
});

const ThumbnailImageWrapper = styled("div", {
  base: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    background: "var(--md-sys-color-surface-container-highest)",
    borderBottom: "1px solid var(--md-sys-color-outline-variant)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
});

const ThumbnailImage = styled("img", {
  base: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: "brightness(0.95)",
    transition: "filter 0.2s",
  }
});

const AppIconOverlay = styled("img", {
  base: {
    position: "absolute",
    bottom: "var(--gap-sm)",
    right: "var(--gap-sm)",
    width: "28px",
    height: "28px",
    padding: "2px",
    borderRadius: "var(--borderRadius-sm)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
    background: "var(--md-sys-color-surface)",
  }
});

const ThumbnailName = styled("div", {
  base: {
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "var(--md-sys-color-on-surface)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textAlign: "center",
    padding: "var(--gap-sm)",
  }
});
