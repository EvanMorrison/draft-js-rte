import { css } from '@emotion/react';

const dropdownStyle = props => css`
  .rich-text-toolbar .editor-controls .control-row &.dropdown-button {
    > .button {
      width: ${props.controlWidth}px;

      .btn-content {
        width: calc(${props.controlWidth}px - 15px);
      }
    }

    div.dropdown {
      width: ${props.dropdownWidth};
    }
  }
`;

export default dropdownStyle;

export const richEditorDropdown = props => css`
  .dropdown-button {
    margin: 3px 4px;

    > .button {
      height: 30px;
      min-height: 30px;
      position: relative;
      padding: 2px;
      line-height: 1.2rem;

      .btn-content {
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        span {
          margin: auto;
        }

        svg:last-of-type {
          font-size: 10px;
        }

        .fa-chevron-down {
          position: absolute;
          top: 40%;
          right: 3px;
        }
      }
    }

    .dropdown {
      width: fit-content;

      &[class*='left'] {
        left: 0;
      }

      &[class*='right'] {
        right: 0;
      }

      .dropdown-content {
        text-align: left;
        white-space: nowrap;
        max-height: ${props.maxDropdownHeight}px;
        overflow-y: auto;

        li {
          padding: 6px 12px;
        }
      }
    }
  }
`;
