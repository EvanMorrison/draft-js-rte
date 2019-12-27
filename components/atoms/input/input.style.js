import styled from "@emotion/styled";

export default styled.input`
  &.input {
    width: 100%;
    height: 32px;
    line-height: 32px;
    padding: 0 6px;
    border-radius: 5px;
    border: 1px solid ${props => props.theme.colors.inputBorder};
    transition: border 200ms ease;
    color: ${props => props.theme.colors.textOnPageBackground};
    background: ${props => props.theme.colors.pageBackground};
    font-size: 16px;

    &.size-lg {
      height: 40px;
      line-height: 40px;
      font-size: 21px;
    }

    &.size-sm {
      height: 24px;
      line-height: 24px;
      font-size: 12px;
    }

    &.currency {
      padding-left: 18px;
    }

    &::placeholder {
      opacity: 0.75;
      font-weight: ${props => props.theme.fontWeights[0]};
    }

    &:-ms-input-placeholder {
      opacity: 0.75;
      font-weight: ${props => props.theme.fontWeights[0]};
    }

    &:focus {
      border-color: ${props => props.theme.colors.info};
      box-shadow: 0 0 8px -1px ${props => props.theme.colors.info};
    }

    &:disabled {
      cursor: not-allowed;
      user-select: none;
      background: ${props => props.theme.colors.inputDisabled};
      opacity: 0.6;
    }

    &.error {
      border-color: ${props => props.theme.colors.danger};
      background: ${props => props.theme.colors.pageBackground};
    }

    &[type=number] {
      padding-right: 0;
    }
  }
`;
