import HCaptcha, { HCaptchaFunctions } from "solid-hcaptcha";
import { For, JSX, Show, createSignal, createMemo } from "solid-js";

import { useLingui, Trans } from "@lingui-solid/solid/macro";

import { useError } from "@revolt/i18n";
import { Checkbox2, Column, Text, TextField, Row } from "@revolt/ui";
import { styled } from "styled-system/jsx";

/**
 * Available field types
 */
type Field =
  | "email"
  | "password"
  | "new-password"
  | "log-out"
  | "username"
  | "display-name"
  | "birthday"
  | "invite";

/**
 * Properties to apply to fields
 */
const useFieldConfiguration = () => {
  const { t } = useLingui();

  return {
    email: {
      type: "email" as const,
      name: () => t`Email`,
      placeholder: () => t`Please enter your email.`,
      autocomplete: "email",
    },
    password: {
      minLength: 8,
      type: "password" as const,
      "toggle-password": true,
      name: () => t`Password`,
      placeholder: () => t`Enter your current password.`,
    },
    "new-password": {
      minLength: 8,
      type: "password" as const,
      "toggle-password": true,
      autocomplete: "new-password",
      name: () => t`New Password`,
      placeholder: () => t`Enter a new password.`,
    },
    "log-out": {
      name: () => t`Log out of all other sessions`,
    },
    username: {
      minLength: 2,
      type: "text" as const,
      autocomplete: "none",
      name: () => t`Username`,
      placeholder: () => t`Enter your preferred username.`,
    },
    "display-name": {
      type: "text" as const,
      autocomplete: "none",
      name: () => t`Display Name`,
      placeholder: () => t`How should we call you?`,
    },
    birthday: {
      type: "date" as const,
      name: () => t`Date of Birth`,
      placeholder: () => t`Select your birth date.`,
    },
    invite: {
      minLength: 1,
      type: "text" as const,
      autocomplete: "none",
      name: () => t`Invite Code`,
      placeholder: () => t`Enter your invite code.`,
    },
  };
};

interface FieldProps {
  /**
   * Fields to gather
   */
  fields: (Field | FieldPreset)[];
}

interface FieldPreset {
  field: Field;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  disabled?: boolean;
}

export function Fields(props: FieldProps) {
  const fieldConfiguration = useFieldConfiguration();
  const { t } = useLingui();

  const [password, setPassword] = createSignal("");

  const passwordStrength = createMemo(() => {
    const pwd = password();
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

  return (
    <For each={props.fields}>
      {(field) => {
        // If field is just a Field value, convert it to a FieldPreset
        if (typeof field === "string") {
          field = { field: field };
        }
        return (
          <Column gap="sm">
            {field.field === "log-out" ? (
              <Checkbox2 name={field.field}>
                {fieldConfiguration[field.field].name()}
              </Checkbox2>
            ) : field.field === "birthday" ? (
              <Column gap="xs">
                <Text class="label" size="small">
                  {fieldConfiguration[field.field].name()} *
                </Text>
                <BirthdaySelects />
                <Text
                  size="small"
                  style={{
                    opacity: 0.6,
                    "font-size": "11px",
                    "margin-top": "4px",
                  }}
                >
                  <Trans>
                    You must be at least 15 years old to join Stoat.
                  </Trans>
                </Text>
              </Column>
            ) : (
              <TextField
                required
                {...fieldConfiguration[field.field]}
                name={field.field}
                label={fieldConfiguration[field.field].name()}
                placeholder={fieldConfiguration[field.field].placeholder()}
                disabled={field.disabled}
                value={field.value}
                onInput={
                  field.field === "password" || field.field === "new-password"
                    ? (e: any) => setPassword(e.currentTarget.value)
                    : undefined
                }
              />
            )}

            <Show
              when={
                (field.field === "password" ||
                  field.field === "new-password") &&
                password()
              }
            >
              <StrengthMeter>
                <StrengthTrack>
                  <StrengthBar
                    style={{
                      width: `${(passwordStrength() / 4) * 100}%`,
                      background: strengthColor(),
                    }}
                  />
                </StrengthTrack>
                <StrengthText style={{ color: strengthColor() }}>
                  {strengthLabel()}
                </StrengthText>
              </StrengthMeter>
            </Show>
          </Column>
        );
      }}
    </For>
  );
}

/**
 * Birthday selection components
 */
function BirthdaySelects() {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentYear = 2026;
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <Row gap="sm">
      <StyledSelect name="birth_day" required>
        <option value="" disabled selected>
          Day
        </option>
        <For each={days}>{(day) => <option value={day}>{day}</option>}</For>
      </StyledSelect>
      <StyledSelect name="birth_month" required>
        <option value="" disabled selected>
          Month
        </option>
        <For each={months}>
          {(month, i) => <option value={i() + 1}>{month}</option>}
        </For>
      </StyledSelect>
      <StyledSelect name="birth_year" required>
        <option value="" disabled selected>
          Year
        </option>
        <For each={years}>
          {(year) => <option value={year}>{year}</option>}
        </For>
      </StyledSelect>
    </Row>
  );
}

const StyledSelect = styled("select", {
  base: {
    flex: 1,
    background: "var(--md-sys-color-surface-container-high)",
    color: "var(--md-sys-color-on-surface)",
    border: "none",
    borderRadius: "4px",
    padding: "8px 12px",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
    "&:focus": {
      boxShadow: "0 0 0 2px var(--md-sys-color-primary)",
    },
  },
});

const StrengthMeter = styled("div", {
  base: {
    marginTop: "-8px",
    marginBottom: "4px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
});

const StrengthTrack = styled("div", {
  base: {
    height: "6px",
    width: "100%",
    background: "var(--md-sys-color-surface-container-highest)",
    borderRadius: "3px",
    overflow: "hidden",
    position: "relative",
  },
});

const StrengthBar = styled("div", {
  base: {
    height: "100%",
    borderRadius: "3px",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  },
});

const StrengthText = styled("span", {
  base: {
    fontSize: "11px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    alignSelf: "flex-end",
  },
});

interface Props {
  /**
   * Form children
   */
  children: JSX.Element;

  /**
   * Whether to include captcha token
   */
  captcha?: string;

  /**
   * Submission handler
   */
  onSubmit: (data: FormData) => Promise<void> | void;
}

/**
 * Small wrapper for HTML form
 */
export function Form(props: Props) {
  const [error, setError] = createSignal();
  const err = useError();
  let hcaptcha: HCaptchaFunctions | undefined;

  /**
   * Handle submission
   * @param event Form Event
   */
  async function onSubmit(event: Event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget as HTMLFormElement);

    if (props.captcha) {
      if (!hcaptcha) return alert("hCaptcha not loaded!");
      const response = await hcaptcha.execute();
      formData.set("captcha", response!.response);
    }

    try {
      await props.onSubmit(formData);
    } catch (err) {
      setError(err);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Column gap="lg">
        {props.children}
        <Show when={error()}>
          <Text class="label" size="small">
            {err(error())}
          </Text>
        </Show>
      </Column>
      <Show when={props.captcha}>
        <HCaptcha
          sitekey={props.captcha!}
          onLoad={(instance) => (hcaptcha = instance)}
          size="invisible"
        />
      </Show>
    </form>
  );
}
