import { onCleanup, onMount } from "solid-js";
import { Trans } from "@lingui-solid/solid/macro";
import { Channel, User } from "stoat.js";
import { Dialog, DialogProps, iconSize } from "@revolt/ui";
import { useVoice } from "@revolt/rtc";

import MdCall from "@material-design-icons/svg/outlined/call.svg?component-solid";

import { Modals } from "../types";

export function OutgoingCallModal(
  props: DialogProps & Modals & { type: "outgoing_call" }
) {
  const voice = useVoice();
  const ringtone = new Audio("/assets/web/sounds/call/outgoing_ringing.mp3");
  ringtone.loop = true;

  onMount(() => {
    ringtone.play().catch((e) => console.error("Failed to play ringtone:", e));
  });

  onCleanup(() => {
    ringtone.pause();
    ringtone.src = "";
  });

  const handleCancel = () => {
    // Logic to stop the call (maybe notify backend)
    props.onClose();
  };

  const recipientName = () => props.recipient?.username || "Unknown";

  return (
    <Dialog
      icon={<MdCall {...iconSize(24)} />}
      show={props.show}
      onClose={props.onClose}
      title={<Trans>Calling...</Trans>}
      actions={[
        {
          text: <Trans>Cancel</Trans>,
          onClick: handleCancel,
        },
      ]}
    >
      <Trans>
        Calling <b>{recipientName()}</b>
      </Trans>
    </Dialog>
  );
}
