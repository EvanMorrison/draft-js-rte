import styled from '@emotion/styled';

export default styled.div`
  padding: 12px;

  .error {
    color: ${props => props.theme.colors.danger};
  }

  .form-field {
    margin-bottom: 16px;

    label.form-label div.label-content {
      color: ${props => props.theme.colors.primary};
    }
  }

  .image-editor {
    .error {
      white-space: normal;
    }
  }

  .button {
    margin-top: 16px;
  }
`;
