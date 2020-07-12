import styled from '@emotion/styled';

export default styled.div`
  &.tooltip {
    display: block;
    opacity: 0;
    visibility: hidden;
    position: absolute;
    transition: opacity 200ms ease;
    border-radius: 5px;
    background-color: ${props => props.theme.colors.pageBackground};
    color: ${props => props.theme.colors.textOnPageBackground};
    border: 2px solid ${props => props.theme.colors.border};
    z-index: ${props => props.theme.zIndexes.dropDown};

    .tooltip-content {
      padding: 6px 12px;
      font-size: 14px;
      line-height: 18px;
      width: max-content;
    }

    &:before,
    &:after {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
    }

    &:before {
      border-width: 12px;
    }

    &:after {
      border-width: 10px;
    }

    &.top {
      bottom: calc(100% + 12px);

      &:before {
        top: 100%;
        left: calc(50% - 6px);
        border-color: ${props => props.theme.colors.border} transparent transparent transparent;
        border-bottom-width: 0;
      }

      &:after {
        top: 100%;
        left: calc(50% - 4px);
        border-color: ${props => props.theme.colors.pageBackground} transparent transparent transparent;
        border-bottom-width: 0;
      }
    }

    &.right {
      top: calc(50% - (33px / 2));
      left: calc(100% + 4px);

      &:before {
        right: 100%;
        top: 3px;
        border-color: transparent ${props => props.theme.colors.border} transparent transparent;
        border-left-width: 0;
      }

      &:after {
        right: 100%;
        top: 5px;
        border-color: transparent ${props => props.theme.colors.pageBackground} transparent transparent;
        border-left-width: 0;
      }
    }

    &.bottom {
      top: calc(100% + 12px);

      &:before {
        bottom: 100%;
        left: calc(50% - 6px);
        border-color: transparent transparent ${props => props.theme.colors.border} transparent;
        border-top-width: 0;
      }

      &:after {
        bottom: 100%;
        left: calc(50% - 4px);
        border-color: transparent transparent ${props => props.theme.colors.pageBackground} transparent;
        border-top-width: 0;
      }
    }

    &.left {
      top: calc(50% - (33px / 2));
      right: calc(100% + 4px);

      &:before {
        left: 100%;
        top: 3px;
        border-color: transparent transparent transparent ${props => props.theme.colors.border};
        border-right-width: 0;
      }

      &:after {
        left: 100%;
        top: 5px;
        border-color: transparent transparent transparent ${props => props.theme.colors.pageBackground};
        border-right-width: 0;
      }
    }
  }
`;
