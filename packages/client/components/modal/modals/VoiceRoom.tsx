import { Channel } from "stoat.js";
import { styled } from "styled-system/jsx";
import { VoiceCallCardActiveRoom } from "../../ui/components/features/voice/callCard/VoiceCallCardActiveRoom";

interface Props {
  channel: Channel;
}

/**
 * Voice Room Modal
 */
export default function VoiceRoomModal({ channel }: Props) {
  return (
    <Container>
        <VoiceCallCardActiveRoom channel={channel} />
    </Container>
  );
}

const Container = styled("div", {
  base: {
    width: "90vw",
    height: "80vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--md-sys-color-surface-container)",
    borderRadius: "var(--borderRadius-xl)",
    overflow: "hidden",
  },
});
