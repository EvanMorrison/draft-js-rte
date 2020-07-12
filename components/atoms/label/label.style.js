import styled from '@emotion/styled';

const LabelStyle = styled.label`
  &.form-label {
    display: block;
    line-height: 16px;
    font-size: 14px;
    color: ${props => props.theme.colors.inputLabel};
    text-align: left;
    width: fit-content;
    margin: 0;
    padding: 0;
    overflow-y: hidden;
    border-radius: 2px;

    .label-content {
      color: ${props => props.theme.colors.inputLabel};
    }

    .required-star {
      color: ${props => props.theme.colors.danger};
      padding-left: 3px;
    }

    &.disabled {
      opacity: 0.6;
    }

    &.error {
      .error-text {
        display: inline-block;
        font-weight: ${props => props.theme.fontWeights[2]};
      }

      .label-content {
        color: ${props => props.theme.colors.danger};

        .error-text {
          color: ${props => props.theme.colors.danger};
        }
      }
    }

    &.size-sm {
      font-size: 12px;
      line-height: 14px;
    }

    &.size-lg {
      font-size: 16px;
      line-height: 18px;
    }
  }
`;

export default LabelStyle;
