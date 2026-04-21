import { Trans } from "@lingui-solid/solid/macro";
import { Channel, User } from "stoat.js";
import { Dialog, DialogProps, iconSize } from "@revolt/ui";
import { useVoice } from "@revolt/rtc";

import MdCall from "@material-design-icons/svg/outlined/call.svg?component-solid";
import MdCallEnd from "@material-design-icons/svg/outlined/call_end.svg?component-solid";

import { Modals } from "../types";

export function IncomingCallModal(
  props: DialogProps & Modals & { type: "incoming_call" }
) {
  const voice = useVoice();

  const handleAccept = () => {
    voice.connect(props.channel);
    props.onClose();
  };

  return (
    <Dialog
      icon={<MdCall {...iconSize(24)} />}
      show={props.show}
      onClose={props.onClose}
      title={<Trans>Incoming Call</Trans>}
      actions={[
        {
          text: <Trans>Accept</Trans>,
          onClick: handleAccept,
        },
        {
          text: <Trans>Decline</Trans>,
          onClick: props.onClose,
        },
      ]}
    >
      <Trans>
        Incoming call from <b>{props.caller?.username || "Unknown"}</b>
      </Trans>
    </Dialog>
  );
}
