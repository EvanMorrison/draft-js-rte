import styled from "@emotion/styled";
import PrimarySecondaryStyle from "./primary-secondary.style";

const PrimaryStyle = styled(PrimarySecondaryStyle)`
  border-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textOnPrimary};
  fill: ${props => props.theme.colors.textOnPrimary};
  background: ${props => props.theme.colors.primary};

  &.danger {
    border-color: ${props => props.theme.colors.danger};
    color: ${props => props.theme.colors.textOnDanger};
    fill: ${props => props.theme.colors.textOnDanger};
    background: ${props => props.theme.colors.danger};
  }
`;

export default PrimaryStyle;
