import { For, Show } from "solid-js";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { Channel } from "stoat.js";
import { styled } from "styled-system/jsx";

import { useUsers } from "@revolt/markdown/users";
import { useVoice } from "@revolt/rtc";
import { Avatar, Ripple, Text } from "@revolt/ui/components/design";
import { Row } from "@revolt/ui/components/layout";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

/**
 * Call card (preview)
 */
export function VoiceCallCardPreview(props: { channel: Channel }) {
  const voice = useVoice();
  const { t } = useLingui();

  const ids = () => [...props.channel.voiceParticipants.keys()];
  const users = useUsers(ids);

  function subtext() {
    const names = users()
      .map((user) => user?.username)
      .filter((x) => x);

    return names.length ? t`With ${names.join(", ")}` : t`Start the call`;
  }

  return (
    <Preview onClick={() => voice.connect(props.channel)}>
      <Ripple />
      <Row css={{ "--align": "center", "margin-bottom": "var(--gap-sm)" }}>
        <For each={users()} fallback={<div style={{ "background": "var(--md-sys-color-primary)", color: "var(--md-sys-color-on-primary)", padding: "16px", "border-radius": "100%" }}><Symbol size={48}>voice_chat</Symbol></div>}>
          {(user) => (
            <Avatar size={48} src={user?.avatar} fallback={user?.username} />
          )}
        </For>
      </Row>
      <TitleText>
        <Show
          when={voice.state() === "READY"}
          fallback={<Trans>Switch to this voice channel</Trans>}
        >
          <Trans>Join the voice channel</Trans>
        </Show>
      </TitleText>
      <Text class="body">{subtext()}</Text>
    </Preview>
  );
}

const Preview = styled("div", {
  base: {
    position: "relative", // <Ripple />
    borderRadius: "var(--borderRadius-xl)",

    height: "100%",
    justifyContent: "center",
    alignItems: "center", // CENTER it!

    display: "flex",
    flexDirection: "column",
    gap: "var(--gap-sm)",
    padding: "36px var(--gap-xl)",

    color: "var(--md-sys-color-on-primary-container)", // Use contrasting text for primary container!
  },
});

const TitleText = styled("div", {
  base: {
    fontSize: "1.4rem",
    fontWeight: 700,
    textAlign: "center",
  }
});
