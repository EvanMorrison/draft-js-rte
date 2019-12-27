import styled from "@emotion/styled";
import PrimarySecondaryStyle from "./primary-secondary.style";

const SecondaryStyle = styled(PrimarySecondaryStyle)`
  border-color: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.primary};
  fill: ${props => props.theme.colors.primary};
  background: ${props => props.theme.colors.pageBackground};

  &.danger {
    border-color: ${props => props.theme.colors.danger};
    color: ${props => props.theme.colors.danger};
    fill: ${props => props.theme.colors.danger};
    background: ${props => props.theme.colors.pageBackground};
  }
`;

export default SecondaryStyle;
