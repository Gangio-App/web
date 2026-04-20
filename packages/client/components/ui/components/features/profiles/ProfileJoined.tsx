import { Show } from "solid-js";
import { ServerMember, User } from "stoat.js";
import { useTime } from "@revolt/i18n";
import { styled } from "styled-system/jsx";
import { Text } from "../../design";
import { Row, Column } from "../../layout";


export function ProfileJoined(props: { user: User; member?: ServerMember }) {
  const dayjs = useTime();

  const formatDate = (date: Date) => {
    return dayjs(date).format("D MMM YYYY");
  };

  return (
    <Column gap="xs" style={{ padding: "0 4px" }}>
      <Title>Member Since</Title>
      
      <Column gap="xs">
        <Row align gap="sm">
          <Column gap="none">
             <LabelText>Gangio</LabelText>
             <DateText>{formatDate(props.user.createdAt)}</DateText>
          </Column>
        </Row>

        <Show when={props.member}>
          <Row align gap="sm">
            <Icon src={props.member!.server!.animatedIconURL} />
             <Column gap="none">
                <LabelText>{props.member!.server!.name}</LabelText>
                <DateText>{formatDate(props.member!.joinedAt!)}</DateText>
             </Column>
          </Row>
        </Show>
      </Column>
    </Column>
  );
}

const Title = styled("div", {
  base: {
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "var(--md-sys-color-on-surface-variant)",
    marginBottom: "4px",
    letterSpacing: "0.05em",
  },
});

const DateText = styled("span", {
  base: {
    fontSize: "13px",
    opacity: 0.8,
  },
});

const LabelText = styled("span", {
  base: {
    fontSize: "11px",
    fontWeight: "600",
    opacity: 0.8,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  }
});

const Icon = styled("img", {
  base: {
    width: "20px",
    height: "20px",
    borderRadius: "4px",
    objectFit: "cover",
  },
});
