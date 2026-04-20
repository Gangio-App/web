import { createSignal, Show, For } from "solid-js";
import { createFormControl, createFormGroup } from "solid-forms";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { css } from "styled-system/css";

import { useNavigate } from "@revolt/routing";
import { Column, Dialog, DialogProps, Form2, Text, CategoryButton } from "@revolt/ui";

import { useModals } from "..";
import { Modals } from "../types";

import MdCreate from "@material-design-icons/svg/outlined/add_circle.svg?component-solid";
import MdGroups from "@material-design-icons/svg/outlined/groups.svg?component-solid";
import MdSchool from "@material-design-icons/svg/outlined/school.svg?component-solid";
import MdSportsEsports from "@material-design-icons/svg/outlined/sports_esports.svg?component-solid";

/**
 * Modal to create a new server
 */
export function CreateServerModal(
  props: DialogProps & Modals & { type: "create_server" },
) {
  const navigate = useNavigate();
  const { showError } = useModals();
  const { t, i18n } = useLingui();

  const [step, setStep] = createSignal<"start" | "identity">("start");

  const group = createFormGroup({
    name: createFormControl("", { required: true }),
    icon: createFormControl<string | File[] | null>(null),
  });

  const templates = [
    {
      id: "gaming",
      name: <Trans>Gaming</Trans>,
      nameText: i18n()._("Gaming"),
      icon: <MdSportsEsports fill="currentColor" />,
      description: <Trans>Play games with your friends</Trans>,
    },
    {
      id: "school",
      name: <Trans>School Club</Trans>,
      nameText: i18n()._("School Club"),
      icon: <MdSchool fill="currentColor" />,
      description: <Trans>Study and collaborate together</Trans>,
    },
    {
      id: "community",
      name: <Trans>Community</Trans>,
      nameText: i18n()._("Community"),
      icon: <MdGroups fill="currentColor" />,
      description: <Trans>A place for everyone to hang out</Trans>,
    },
  ];

  async function onSubmit() {
    try {
      const server = await props.client.servers.createServer({
        name: group.controls.name.value,
      });

      if (Array.isArray(group.controls.icon.value)) {
        const icon = await props.client.uploadFile(
          "icons",
          group.controls.icon.value[0],
        );
        await server.edit({
          icon,
        });
      }

      setTimeout(() => navigate(`/server/${server.id}`));
      props.onClose();
    } catch (error) {
      showError(error);
    }
  }

  const submit = Form2.useSubmitHandler(group, onSubmit);

  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      title={
        step() === "start" ? (
          <Trans>Create a server</Trans>
        ) : (
          <Trans>Customize your server</Trans>
        )
      }
      actions={
        step() === "start"
          ? [{ text: <Trans>Close</Trans> }]
          : [
              {
                text: <Trans>Back</Trans>,
                onClick: () => {
                  setStep("start");
                  return false;
                },
              },
              {
                text: <Trans>Create</Trans>,
                onClick: () => {
                  onSubmit();
                  return false;
                },
                isDisabled: !Form2.canSubmit(group),
              },
            ]
      }
      isDisabled={group.isPending}
    >
      <Show
        when={step() === "identity"}
        fallback={
          <Column gap="md">
            <Text size="small" class={css({ "text-align": "center" })}>
              <Trans>
                Your server is where you and your friends hang out. Make yours
                and start talking.
              </Trans>
            </Text>

            <CategoryButton.Group>
              <CategoryButton
                onClick={() => setStep("identity")}
                icon={<MdCreate fill="currentColor" />}
                action="chevron"
                description={<Trans>Start from a blank slate</Trans>}
              >
                <Trans>Create My Own</Trans>
              </CategoryButton>
            </CategoryButton.Group>

            <Text size="small" class={css({ opacity: 0.6 })}>
              <Trans>Or start from a template</Trans>
            </Text>

            <CategoryButton.Group>
              <For each={templates}>
                {(template) => (
                  <CategoryButton
                    onClick={() => {
                      group.controls.name.setValue(
                        `${props.client.user?.username}'s ${template.nameText}`,
                      );
                      setStep("identity");
                    }}
                    icon={template.icon}
                    action="chevron"
                    description={template.description}
                  >
                    {template.name}
                  </CategoryButton>
                )}
              </For>
            </CategoryButton.Group>
          </Column>
        }
      >
        <form onSubmit={submit}>
          <Column gap="lg">
            <Text size="small" class={css({ "text-align": "center" })}>
              <Trans>
                Give your new server a personality with a name and an icon. You
                can always change this later.
              </Trans>
            </Text>

            <Column
              gap="md"
              class={css({
                padding: "lg",
                "border-radius": "16px",
                background: "rgba(255,255,255,0.04)",
              })}
            >
              <Column
                gap="md"
                class={css({
                  alignItems: "center",
                })}
              >
                <Form2.FileInput
                  control={group.controls.icon}
                  accept="image/*"
                  label={t`Server Icon`}
                  imageRounded
                  imageSize="64px"
                  imageJustify={false}
                />
              </Column>

              <Form2.TextField
                name="name"
                control={group.controls.name}
                label={t`Server Name`}
                placeholder={t`Enter a server name`}
              />
            </Column>

            <Text size="tiny" style={{ opacity: 0.6 }}>
              <Trans>By creating this server, you agree to</Trans>
              {" "}
              <a
                href="https://gangio.pro/terms"
                target="_blank"
                rel="noreferrer"
              >
                <Trans>Acceptable Use Policy</Trans>
              </a>
              <Trans>.</Trans>
            </Text>
          </Column>
        </form>
      </Show>
    </Dialog>
  );
}
