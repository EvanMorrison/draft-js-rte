import styled from '@emotion/styled';

export default styled.div`
  &.tooltip {
    border-radius: 5px;
    background-color: ${props => props.theme.colors.pageBackground};
    color: ${props => props.theme.colors.textOnPageBackground};
    border: 2px solid ${props => props.theme.colors.border};
    box-shadow: 2px 2px 14px -7px ${props => props.theme.colors.shadowOnPage};
    z-index: ${props => props.theme.zIndexes.modalOverlayModal + 100};
    padding: 6px 12px;
    white-space: pre-wrap;
    width: max-content;

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

    &.lg {
      font-size: 14px;
      line-height: 18px;
    }

    &.md {
      font-size: 12px;
      line-height: 14px;
    }

    &.sm {
      font-size: 11px;
      line-height: 12px;
      padding: 4px 8px;

      :before {
        border-width: 8px;
      }
      :after {
        border-width: 6px;
      }
    }

    &.top {
      &:before {
        top: 100%;
        border-color: ${props => props.theme.colors.border} transparent transparent transparent;
        border-bottom-width: 0;
      }

      &:after {
        top: 100%;
        border-color: ${props => props.theme.colors.pageBackground} transparent transparent transparent;
        border-bottom-width: 0;
      }
    }

    &.right {
      &:before {
        right: 100%;
        border-color: transparent ${props => props.theme.colors.border} transparent transparent;
        border-left-width: 0;
      }

      &:after {
        right: 100%;
        border-color: transparent ${props => props.theme.colors.pageBackground} transparent transparent;
        border-left-width: 0;
      }
    }

    &.bottom {
      &:before {
        bottom: 100%;
        border-color: transparent transparent ${props => props.theme.colors.border} transparent;
        border-top-width: 0;
      }

      &:after {
        bottom: 100%;
        border-color: transparent transparent ${props => props.theme.colors.pageBackground} transparent;
        border-top-width: 0;
      }
    }

    &.left {
      &:before {
        left: 100%;
        border-color: transparent transparent transparent ${props => props.theme.colors.border};
        border-right-width: 0;
      }

      &:after {
        left: 100%;
        border-color: transparent transparent transparent ${props => props.theme.colors.pageBackground};
        border-right-width: 0;
      }
    }
  }
`;
