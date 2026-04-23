import { createSignal, createMemo, Show } from "solid-js";
import { createFormControl, createFormGroup } from "solid-forms";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { styled } from "styled-system/jsx";
import { css } from "styled-system/css";

import { Column, Dialog, DialogProps, Form2, Text } from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import { useModals } from "..";
import { Modals } from "../types";

/**
 * Change account password
 */
export function EditPasswordModal(
  props: DialogProps & Modals & { type: "edit_password" },
) {
  const { t } = useLingui();
  const { showError } = useModals();

  const [isSuccess, setIsSuccess] = createSignal(false);

  const group = createFormGroup({
    password: createFormControl("", { required: true }),
    currentPassword: createFormControl("", { required: true }),
  });

  const passwordStrength = createMemo(() => {
    const pwd = group.controls.password.value;
    if (!pwd) return 0;
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    
    return score;
  });

  const strengthColor = () => {
    const score = passwordStrength();
    if (score <= 1) return "var(--md-sys-color-error)";
    if (score <= 3) return "var(--md-sys-color-warning, #fbc02d)";
    return "var(--md-sys-color-success, #4caf50)";
  };

  const strengthLabel = () => {
    const score = passwordStrength();
    if (score === 0) return "";
    if (score <= 1) return t`Weak`;
    if (score <= 3) return t`Medium`;
    return t`Strong`;
  };

  async function onSubmit() {
    try {
      await props.client.account.changePassword(
        group.controls.password.value,
        group.controls.currentPassword.value,
      );

      setIsSuccess(true);
      setTimeout(() => {
        props.onClose();
      }, 2000);
    } catch (err) {
      showError(err);
    }
  }

  const submit = Form2.useSubmitHandler(group, onSubmit);

  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      title={<Trans>Change login password</Trans>}
      actions={isSuccess() ? [] : [
        { text: <Trans>Close</Trans> },
        {
          text: <Trans>Change</Trans>,
          onClick: () => {
            onSubmit();
            return false;
          },
          isDisabled: !Form2.canSubmit(group) || passwordStrength() <= 1,
        },
      ]}
      isDisabled={group.isPending || isSuccess()}
    >
      <Switch>
        <Match when={isSuccess()}>
          <SuccessContainer>
            <Symbol size={64} class={css({ color: "var(--md-sys-color-primary)" })}>check_circle</Symbol>
            <Text size="large" class="title">
              <Trans>Password updated successfully!</Trans>
            </Text>
            <Text size="small">
              <Trans>Closing this window shortly...</Trans>
            </Text>
          </SuccessContainer>
        </Match>
        <Match when={!isSuccess()}>
          <form onSubmit={submit}>
            <Column>
              <Form2.TextField
                name="password"
                control={group.controls.password}
                label={t`New Password`}
                type="password"
                placeholder={t`Enter a new password.`}
                toggle-password
              />
              
              <Show when={group.controls.password.value}>
                <StrengthMeter>
                  <StrengthBar style={{ 
                    width: `${(passwordStrength() / 4) * 100}%`,
                    background: strengthColor()
                  }} />
                  <StrengthText style={{ color: strengthColor() }}>
                    {strengthLabel()}
                  </StrengthText>
                </StrengthMeter>
              </Show>

              <Show when={group.controls.password.value && passwordStrength() <= 1}>
                <Text size="small" class={css({ color: "var(--md-sys-color-error)", marginTop: "-12px", marginBottom: "8px" })}>
                  <Trans>Password is too weak. Please use a stronger password.</Trans>
                </Text>
              </Show>

              <Form2.TextField
                name="currentPassword"
                control={group.controls.currentPassword}
                label={t`Current Password`}
                type="password"
                placeholder={t`Enter your current password...`}
                toggle-password
              />
            </Column>
          </form>
        </Match>
      </Switch>
    </Dialog>
  );
}

const SuccessContainer = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    padding: "32px 0",
    textAlign: "center"
  }
});

const StrengthMeter = styled("div", {
  base: {
    marginTop: "-12px",
    marginBottom: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  }
});

const StrengthBar = styled("div", {
  base: {
    height: "4px",
    borderRadius: "2px",
    transition: "all 0.3s ease",
    background: "var(--md-sys-color-surface-variant)"
  }
});

const StrengthText = styled("span", {
  base: {
    fontSize: "12px",
    fontWeight: "bold",
    alignSelf: "flex-end"
  }
});

