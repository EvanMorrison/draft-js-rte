import styled from "@emotion/styled";
import ColorHelper from "../../utils/colorHelper";

export default styled.div`
  &.message {
    transition: all 0.2s;
    height: 0;
    width: 100%;
    background: ${props => new ColorHelper(props.theme.colors.warning).lighten(0.3)};
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
