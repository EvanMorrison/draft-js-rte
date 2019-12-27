import styled from "@emotion/styled";

export default styled.button`
  position: relative;
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
  background: none;
  padding: 0 18px;
  font-size: 20px;
  line-height: 30px;
  min-height: 32px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  font-weight: ${props => props.theme.fontWeights[1]};
  display: inline-block;
  width: fit-content;
  overflow: visible;

  .btn-content {
    font-size: 20px;
    white-space: nowrap;
  }

  svg {
    pointer-events: none;
  }

  &.block {
    display: block;
    width: 100%;
  }

  &.size-lg {
    font-size: 24px;
    line-height: 38px;
    min-height: 40px;
    padding: 0 24px;

    .btn-content {
      font-size: 24px;
    }
  }

  &.size-sm {
    font-size: 16px;
    line-height: 22px;
    min-height: 24px;
    padding: 0 12px;

    .btn-content {
      font-size: 16px;
    }
  }

  &.disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }

  &:hover {
    .tooltip:not(:hover) {
      opacity: 1;
      visibility: visible;

      &.right {
        left: calc(100% + 11px);
      }

      &.left {
        right: calc(100% + 11px);
      }

      &.top {
        margin-left: 11px;
      }

      &.bottom {
        margin-left: 11px;
      }
    }
  }
`;
