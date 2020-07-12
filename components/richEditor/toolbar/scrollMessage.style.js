import styled from '@emotion/styled';
import { offColor as colorHelper } from 'off-color';

export default styled.div`
  &.message {
    transition: all 0.2s;
    height: 0;
    width: 100%;
    background: ${props => colorHelper(props.theme.colors.warning).lighten(0.3).hex()};
    text-align: center;
    font-weight: bold;
    opacity: 0;
  }

  &.message.show {
    opacity: 1;
    height: 25px;
    padding: 5px 0;
    margin: 6px 0 -2px 0;
  }
`;
