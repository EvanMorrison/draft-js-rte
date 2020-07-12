import styled from '@emotion/styled';
import PrimarySecondaryStyle from './primary-secondary.style';
import { offColor as colorHelper } from 'off-color';

const PrimaryStyle = styled(PrimarySecondaryStyle)`
  &.disabled {
    border-color: ${props => props.theme.colors.pageBackground};
    background: ${props => colorHelper(props.theme.colors.primary).rgba(0.6)};
  }

  &.danger.disabled {
    border-color: ${props => props.theme.colors.pageBackground};
    background: ${props => colorHelper(props.theme.colors.danger).rgba(0.6)};
  }

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
