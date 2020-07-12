import styled from '@emotion/styled';

export default styled.div`
  &.info-note {
    font-size: 12px;
    color: ${props => props.theme.colors.inputNote};
    opacity: 0.7;
    margin-bottom: 3px;
  }
`;
