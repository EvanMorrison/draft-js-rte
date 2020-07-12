import styled from '@emotion/styled';

const TextareaStyle = styled.textarea`
  &.textarea {
    width: 100%;
    max-width: 100%;
    line-height: 18px;
    padding: 6px;
    border-radius: 5px;
    transition: border 200ms ease;
    color: ${props => props.theme.colors.textOnPageBackground};
    border-color: ${props => props.theme.colors.textareaBorder};
    background: ${props => props.theme.colors.pageBackground};
    font-size: 16px;
    font-family: ${props => props.theme.fonts[0]};

    &:focus {
      border-color: ${props => props.theme.colors.info};
      box-shadow: 0 0 8px -1px ${props => props.theme.colors.info};
    }

    &.error {
      border-color: ${props => props.theme.colors.danger};
      background: ${props => props.theme.colors.pageBackground};
    }

    &.disabled {
      cursor: not-allowed;
      background: ${props => props.theme.colors.inputDisabled};
      opacity: 0.6;
    }
  }
`;

export default TextareaStyle;
