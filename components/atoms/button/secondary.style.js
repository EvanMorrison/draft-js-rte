import styled from '@emotion/styled';
import PrimarySecondaryStyle from './primary-secondary.style';
import { offColor as colorHelper } from 'off-color';

const SecondaryStyle = styled(PrimarySecondaryStyle)`
  &.disabled {
    border-color: ${props => colorHelper(props.theme.colors.primary).rgba(0.6)};
    background: ${props => colorHelper(props.theme.colors.pageBackground).rgba(0.6)};
    color: ${props => colorHelper(props.theme.colors.primary).rgba(0.6)};
  }

  &.danger.disabled {
    border-color: ${props => colorHelper(props.theme.colors.danger).rgba(0.6)};
    color: ${props => colorHelper(props.theme.colors.danger).rgba(0.6)};
  }

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
