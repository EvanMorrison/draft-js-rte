import styled from "@emotion/styled";

export default styled.div`
  &.rich-editor-dropdown {
    .dropdown-button {
      > .button {
        position: relative;
        padding: 2px;
        line-height: 1.2rem;
        width: ${props => props.controlWidth}px;
        margin: 0 4px;

        .btn-content {
          font-size: 14px;
          width: calc(${props => props.controlWidth}px - 15px);
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
        width: ${props => props.dropdownWidth}px;
        right: 0;

        .dropdown-content {
          text-align: left;
          white-space: nowrap;
          max-height: ${props => props.maxHeight}px;
          overflow-y: auto;

          li {
            padding: 6px 12px;
          }
        }
      }
    }
  }
`;
