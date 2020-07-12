import styled from '@emotion/styled';
import Button from './button.style';
import { offColor as colorHelper } from 'off-color';

const PrimarySecondaryStyle = styled(Button)`
  &:hover:not(.disabled) {
    transition: background-color 200ms ease, color 200ms ease, fill 200ms ease;
    background-color: ${props => colorHelper(props.theme.colors.primary).selected().hex()};
    color: ${props => props.theme.colors.textOnPrimarySelected};
    fill: ${props => props.theme.colors.textOnPrimarySelected};
  }

  &:active:not(.disabled) {
    transition: background-color 200ms ease, color 200ms ease, fill 200ms ease;
    background-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.textOnPrimary};
    fill: ${props => props.theme.colors.textOnPrimary};

    &.secondary {
      transition: background-color 200ms ease, color 200ms ease, fill 200ms ease;
      border-color: ${props => props.theme.colors.primary};
      color: ${props => props.theme.colors.textOnPrimary};
      fill: ${props => props.theme.colors.textOnPrimary};
      background-color: ${props => props.theme.colors.primary};
    }
  }

  &.danger {
    &:hover:not(.disabled) {
      transition: background-color 200ms ease, color 200ms ease, fill 200ms ease;
      background-color: ${props => colorHelper(props.theme.colors.danger).selected().hex()};
      color: ${props => props.theme.colors.textOnDanger};
      fill: ${props => props.theme.colors.textOnDanger};
      border-color: ${props => colorHelper(props.theme.colors.danger).selected().hex()};
    }

    &:active:not(.disabled) {
      transition: background-color 200ms ease, color 200ms ease, fill 200ms ease;
      background-color: ${props => props.theme.colors.danger};
      color: ${props => props.theme.colors.textOnDanger};
      fill: ${props => props.theme.colors.textOnDanger};

      &.secondary {
        transition: background-color 200ms ease, color 200ms ease, fill 200ms ease;
        border-color: ${props => props.theme.colors.danger};
        color: ${props => props.theme.colors.textOnDanger};
        fill: ${props => props.theme.colors.textOnDanger};
        background-color: ${props => props.theme.colors.danger};
      }
    }
  }
`;

export default PrimarySecondaryStyle;
