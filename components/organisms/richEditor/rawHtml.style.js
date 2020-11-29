import styled from '@emotion/styled';
import { offColor as colorHelper } from 'off-color';

export default styled.div`
  &.raw-html {
    .editor-controls {
      display: flex;
      justify-content: flex-end;
      align-items: center;

      .control-group {
        flex: 0 0 20%;

        .rich-editor-style-button {
          padding: 4px 6px;
          cursor: pointer;
          border-radius: 2px;
          background: ${props => colorHelper(props.theme.colors.textOnPageBackground).rgba(0.2)};

          svg {
            height: 18px;
            width: 18px;
            fill: ${props => props.theme.colors.textOnPageBackground};
          }
        }
      }
    }
  }
`;
