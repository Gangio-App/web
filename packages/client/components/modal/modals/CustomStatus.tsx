import { createFormControl, createFormGroup } from "solid-forms";
import { createMemo, createSignal } from "solid-js";

import { Trans, useLingui } from "@lingui-solid/solid/macro";

import { Column, Dialog, DialogProps, Form2 } from "@revolt/ui";

import { useModals } from "..";
import { Modals } from "../types";

/**
 * Modal for editing user's custom status
 */
export function CustomStatusModal(
  props: DialogProps & Modals & { type: "custom_status" },
) {
  const { t } = useLingui();
  const { showError } = useModals();
  const [submitting, setSubmitting] = createSignal(false);

  /* eslint-disable solid/reactivity */
  const group = createFormGroup({
    text: createFormControl(props.client.user?.status?.text ?? ""),
  });
  /* eslint-enable solid/reactivity */

  const currentText = createMemo(() => props.client.user?.status?.text ?? "");

  async function onSubmit() {
    if (group.isPending || submitting()) return;

    try {
      const text = group.controls.text.value;
      const next = text.trim();
      const prev = currentText().trim();

      // Avoid spamming PATCH if nothing has changed.
      if (next === prev) {
        props.onClose();
        return;
      }

      setSubmitting(true);
      await props.client.user!.edit({
        status: {
          ...props.client.user?.status,
          text: next.length > 0 ? next : undefined,
        },
      });
      props.onClose();
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  }

  const submit = Form2.useSubmitHandler(group, onSubmit);

  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      title={<Trans>Set your status</Trans>}
      actions={[
        { text: <Trans>Close</Trans> },
        {
          text: <Trans>Save</Trans>,
          onClick: () => {
            onSubmit();
            return false;
          },
          isDisabled: group.isPending || submitting() || !Form2.canSubmit(group),
        },
      ]}
      isDisabled={group.isPending}
    >
      <form onSubmit={submit}>
        <Column>
          <Form2.TextField
            name="text"
            control={group.controls.text}
            label={t`Custom status`}
          />
        </Column>
      </form>
    </Dialog>
  );
}
