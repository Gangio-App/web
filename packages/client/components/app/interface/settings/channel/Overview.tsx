import { createFormControl, createFormGroup } from "solid-forms";
import { Match, Show, Switch } from "solid-js";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import type { API } from "stoat.js";

import { useClient } from "@revolt/client";
import { CONFIGURATION } from "@revolt/common";
import { useModals } from "@revolt/modal";
import { Button, CircularProgress, Column, Form2, Row, Text, MenuItem, FloatingSelect } from "@revolt/ui";

import { ChannelSettingsProps } from "../ChannelSettings";

/**
 * Channel overview
 */
export default function ChannelOverview(props: ChannelSettingsProps) {
  console.log("ChannelOverview Initial:", props.channel.id, (props.channel as any).slowMode, props.channel.slowMode);
  const { t } = useLingui();
  const client = useClient();
  const { openModal } = useModals();

  /* eslint-disable solid/reactivity */
  // we want to take the initial value only
  const editGroup = createFormGroup({
    name: createFormControl(props.channel.name),
    description: createFormControl(props.channel.description || ""),
    slowMode: createFormControl(props.channel.slowMode?.toString() || "0"),
    icon: createFormControl<string | File[] | null>(
      props.channel.animatedIconURL,
    ),
  });
  /* eslint-enable solid/reactivity */

  function onReset() {
    editGroup.controls.name.setValue(props.channel.name);
    editGroup.controls.description.setValue(props.channel.description || "");
    editGroup.controls.slowMode.setValue(props.channel.slowMode?.toString() || "0");
    editGroup.controls.icon.setValue(props.channel.animatedIconURL ?? null);
  }

  async function onSubmit() {
    const changes: API.DataEditChannel & { slow_mode?: number } = {
      remove: [],
    };

    if (editGroup.controls.name.isDirty) {
      changes.name = editGroup.controls.name.value.trim();
    }

    if (editGroup.controls.description.isDirty) {
      const description = editGroup.controls.description.value.trim();

      if (description) {
        changes.description = description;
      } else {
        changes.remove!.push("Description");
      }
    }

    if (editGroup.controls.slowMode.isDirty) {
      const slowMode = parseInt(editGroup.controls.slowMode.value, 10);
      if (!isNaN(slowMode)) {
        changes.slow_mode = slowMode;
      }
    }

    if (editGroup.controls.icon.isDirty) {
      if (!editGroup.controls.icon.value) {
        changes.remove!.push("Icon");
      } else if (Array.isArray(editGroup.controls.icon.value)) {
        const body = new FormData();
        body.append("file", editGroup.controls.icon.value[0]);

        const [key, value] = client().authenticationHeader;
        const data: { id: string } = await fetch(
          `${CONFIGURATION.DEFAULT_MEDIA_URL}/icons`,
          {
            method: "POST",
            body,
            headers: {
              [key]: value,
            },
          },
        ).then((res) => res.json());

        changes.icon = data.id;
      }
    }

    console.log("Saving changes for channel:", props.channel.id, changes);
    await props.channel.edit(changes);
  }

  const submit = Form2.useSubmitHandler(editGroup, onSubmit, onReset);

  return (
    <Column gap="xl">
      <form onSubmit={submit}>
        <Column>
          <Text class="label">
            <Trans>Channel Info</Trans>
          </Text>
          <Form2.FileInput
            control={editGroup.controls.icon}
            accept="image/*"
            imageJustify={false}
          />
          <Form2.TextField
            name="name"
            control={editGroup.controls.name}
            label={t`Channel Name`}
          />
          <Form2.TextField
            autosize
            min-rows={2}
            name="description"
            control={editGroup.controls.description}
            label={t`Channel Description`}
            placeholder={t`This channel is about...`}
          />
          <FloatingSelect
            label={t`Slowmode`}
            value={editGroup.controls.slowMode.value}
            onChange={(e) => {
              editGroup.controls.slowMode.setValue((e.target as any).value);
              editGroup.controls.slowMode.markDirty(true);
            }}
          >
            <MenuItem value="0"><Trans>Off</Trans></MenuItem>
            <MenuItem value="5">5s</MenuItem>
            <MenuItem value="10">10s</MenuItem>
            <MenuItem value="15">15s</MenuItem>
            <MenuItem value="30">30s</MenuItem>
            <MenuItem value="60">1m</MenuItem>
            <MenuItem value="120">2m</MenuItem>
            <MenuItem value="300">5m</MenuItem>
            <MenuItem value="600">10m</MenuItem>
            <MenuItem value="900">15m</MenuItem>
            <MenuItem value="1800">30m</MenuItem>
            <MenuItem value="3600">1h</MenuItem>
            <MenuItem value="7200">2h</MenuItem>
            <MenuItem value="21600">6h</MenuItem>
          </FloatingSelect>
          <Row>
            <Form2.Reset group={editGroup} onReset={onReset} />
            <Form2.Submit group={editGroup} requireDirty>
              <Trans>Save</Trans>
            </Form2.Submit>
            <Show when={editGroup.isPending}>
              <CircularProgress />
            </Show>
          </Row>
        </Column>
      </form>
      <Column>
        <Text class="label">
          <Trans>Mark as Mature</Trans>
        </Text>
        <Text>
          <Trans>
            Users will be asked to confirm their age before opening this
            channel.
          </Trans>
        </Text>
        <div>
          <Button
            onPress={() =>
              openModal({
                type: "channel_toggle_mature",
                channel: props.channel,
              })
            }
          >
            <Switch fallback={<Trans>Mark as Mature</Trans>}>
              <Match when={props.channel.mature}>
                <Trans>Unmark as Mature</Trans>
              </Match>
            </Switch>
          </Button>
        </div>
      </Column>
    </Column>
  );
}
