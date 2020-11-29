import styled from '@emotion/styled';

export default styled.div`
  padding: 12px;

  .form-field {
    margin-bottom: 16px;

    label.form-label div.label-content {
      color: ${props => props.theme.colors.primary};
    }
  }

  .button {
    margin-top: 32px;
  }
`;
