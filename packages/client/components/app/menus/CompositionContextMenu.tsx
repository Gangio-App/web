import { Show, createSignal, onMount } from "solid-js";

import { Trans } from "@lingui-solid/solid/macro";

import MdContentPaste from "@material-design-icons/svg/outlined/content_paste.svg?component-solid";
import MdContentCopy from "@material-design-icons/svg/outlined/content_copy.svg?component-solid";
import MdContentCut from "@material-design-icons/svg/outlined/content_cut.svg?component-solid";
import MdSelectAll from "@material-design-icons/svg/outlined/select_all.svg?component-solid";
import MdImage from "@material-design-icons/svg/outlined/image.svg?component-solid";

import {
  ContextMenu,
  ContextMenuButton,
  ContextMenuDivider,
} from "./ContextMenu";

interface Props {
  /**
   * Called to paste text from clipboard into the editor
   */
  onPasteText?: () => void;

  /**
   * Called to paste an image from clipboard as a file attachment
   */
  onPasteImage?: () => void;

  /**
   * Called to copy selected text to clipboard
   */
  onCopy?: () => void;

  /**
   * Called to cut selected text to clipboard
   */
  onCut?: () => void;

  /**
   * Called to select all text in the editor
   */
  onSelectAll?: () => void;

  /**
   * Whether the clipboard currently has an image
   */
  hasClipboardImage?: boolean;
}

/**
 * Context menu for the message composition area.
 * Replaces the browser's default context menu with useful editing options
 * like Paste, Paste Image, Copy, Cut, and Select All.
 */
export function CompositionContextMenu(props: Props) {
  return (
    <ContextMenu>
      <ContextMenuButton icon={MdContentCut} onClick={props.onCut}>
        <Trans>Cut</Trans>
      </ContextMenuButton>
      <ContextMenuButton icon={MdContentCopy} onClick={props.onCopy}>
        <Trans>Copy</Trans>
      </ContextMenuButton>
      <ContextMenuButton icon={MdContentPaste} onClick={props.onPasteText}>
        <Trans>Paste</Trans>
      </ContextMenuButton>
      <Show when={props.hasClipboardImage}>
        <ContextMenuButton icon={MdImage} onClick={props.onPasteImage}>
          <Trans>Paste Image</Trans>
        </ContextMenuButton>
      </Show>
      <ContextMenuDivider />
      <ContextMenuButton icon={MdSelectAll} onClick={props.onSelectAll}>
        <Trans>Select All</Trans>
      </ContextMenuButton>
    </ContextMenu>
  );
}
