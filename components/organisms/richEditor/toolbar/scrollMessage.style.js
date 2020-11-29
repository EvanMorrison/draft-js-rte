import styled from '@emotion/styled';

export default styled.div`
  &.message {
    flex: 1;
    transition: all 0.2s;
    border-radius: 0 0 3px 3px;
    opacity: 0;
    height: 0;

    div {
      background: #ffcf8f;
      text-align: center;
      font-weight: bold;
      font-size: 12px;
      width: 100%;
      height: 100%;
    }
  }

  
  &.message.show {
    opacity: 1;
    height: 17px;
  }

  &.message.scroll-bottom div {
    opacity: 0.3;
  }
`;
