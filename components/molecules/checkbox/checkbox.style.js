import styled from '@emotion/styled';

export default styled.div`
  &.checkbox {
    display: inline-block;
    vertical-align: top;
    cursor: pointer;

    input[type='checkbox'] {
      position: absolute;
      left: -9999px;
    }

    svg {
      fill: ${props => props.theme.colors.checkbox};
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    label.form-label.size-sm {
      font-size: 14px;
    }

    label.form-label.size-lg {
      font-size: 18px;

      .label-content {
        margin-left: 28px;
      }
    }

    label.form-label {
      position: relative;
      overflow-y: visible;
      display: inline-block;
      opacity: 0.8;
      line-height: 22px;
      height: 22px;
      font-size: 16px;
      color: ${props => props.theme.colors.textOnPageBackground};
      cursor: pointer;
      user-select: text;

      span.fa-layers {
        position: absolute;
        top: 0;
        bottom: 0;
        margin: auto;
      }

      &:focus-within {
        svg:first-of-type {
          border-radius: 15%;
          border-color: ${props => props.theme.colors.info};
          box-shadow: 0 0 8px 0 ${props => props.theme.colors.info};
        }
      }

      &.disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .label-content {
        display: block;
        margin-left: 20px;
        color: ${props => props.theme.colors.textOnPageBackground};
      }

      &.error .label-content {
        color: ${props => props.theme.colors.danger};

        .error-text {
          font-size: 14px;
        }
      }
    }
  }

  &.checked {
    label.form-label {
      opacity: 1;

      &.disabled {
        opacity: 0.5;
      }
    }
  }
`;
