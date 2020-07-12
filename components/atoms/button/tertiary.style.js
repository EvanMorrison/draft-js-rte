import styled from '@emotion/styled';
import ButtonStyle from './button.style';
import { offColor as colorHelper } from 'off-color';

const TertiaryStyle = styled(ButtonStyle)`
  &.disabled {
    color: ${props => colorHelper(props.theme.colors.primary).rgba(0.6)};
  }

  &.danger.disabled {
    color: ${props => colorHelper(props.theme.colors.danger).rgba(0.6)};
  }

  border: 1px solid transparent;
  color: ${props => props.theme.colors.primary};
  fill: ${props => props.theme.colors.primary};
  background-color: ${props => props.theme.colors.pageBackground};

  &:hover:not(.disabled) {
    transition: background-color 200ms ease, color 200ms ease, fill 200ms ease;
    background-color: ${props => colorHelper(props.theme.colors.primary).selected().hex()};
    color: ${props => props.theme.colors.textOnPrimarySelected};
    fill: ${props => props.theme.colors.textOnPrimarySelected};
  }

  &:active:not(.disabled) {
    transition: background-color 200ms ease, color 200 ease, fill 200 ease;
    background-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.textOnPrimary};
    fill: ${props => props.theme.colors.textOnPrimary};
  }

  &.danger {
    color: ${props => props.theme.colors.danger};
    fill: ${props => props.theme.colors.danger};

    &:hover:not(.disabled) {
      transition: background-color 200ms ease, color 200ms ease, fill 200ms ease;
      background-color: ${props => colorHelper(props.theme.colors.danger).selected().hex()};
      color: ${props => props.theme.colors.textOnPrimarySelected};
      fill: ${props => props.theme.colors.textOnPrimarySelected};
    }

    &:active:not(.disabled) {
      transition: background-color 200ms ease, color 200 ease, fill 200 ease;
      background-color: ${props => props.theme.colors.danger};
      color: ${props => props.theme.colors.textOnDanger};
      fill: ${props => props.theme.colors.textOnDanger};
    }
  }
`;

export default TertiaryStyle;
