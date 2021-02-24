import styled from '@emotion/styled';

const ToastsStyle = styled.div`
  position: fixed;
  right: 10%;
  z-index: 10000;

  @media (max-width: ${props => props.theme.dimensions.tabletBreakpoint}px) {
    top: 0;
    right: 0;
  }
`;

export default ToastsStyle;
