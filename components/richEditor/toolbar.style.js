import styled from "@emotion/styled";
import HexRgb from "hex-rgb";

export default styled.div`
  &.rich-text-toolbar {
    position: relative;

    .disabled-toolbar {
      position: absolute;
      z-index: 1;
      top: 1px;
      left: 1px;
      height: calc(100% - 1px);
      width: calc(100% - 2px);
      background: rgba(255, 255, 255, 0.5);
    }

    .editor-controls {
      position: relative;
      min-height: 50px;
      padding: 3px 6px;
      margin: 0;
      background: ${props => props.theme.colors.pageBackground};
      border: 1px solid ${props => props.theme.colors.richTextBorder};
      border-bottom: 1px solid transparent;
      border-radius: 3px 3px 0 0;
      user-select: none;

      .control-row {
        padding: 3px 0;
      }

      .control-group {
        flex: 1;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-flow: row wrap;

        .rich-editor-style-button {
          color: rgba(${props => HexRgb(props.theme.colors.textOnPageBackground, {format: "array"}).slice(0, 3).join()}, 0.75);
          cursor: pointer;
          display: inline-block;
          margin: 3px 0;
          padding: 4px 6px;
          border: 1px solid transparent;
          border-radius: 2px;

          svg {
            width: 14px;
            height: 14px;
            fill: currentColor;
          }

          &:hover {
            background: ${props => props.theme.colors.primary};
            color: ${props => props.theme.colors.textOnPrimary};
          }
        }

        .rich-editor-active-button {
          color: ${props => props.theme.colors.textOnPageBackground};
          border: 1px solid rgba(${props => HexRgb(props.theme.colors.textOnPageBackground, {format: "array"}).slice(0, 3).join()}, 0.4);
          background: rgba(${props => HexRgb(props.theme.colors.textOnPageBackground, {format: "array"}).slice(0, 3).join()}, 0.1);
          box-shadow: inset 0 0 4px rgba(${props => HexRgb(props.theme.colors.textOnPageBackground, {format: "array"}).slice(0, 3).join()}, 0.3);

          svg {
            fill: currentColor;
          }
        }

        .spacer {
          margin: 0 10px;
        }
      }
    }
  }
`;
