import styled from '@emotion/styled';

export default styled.div`
  position: relative;

  .tooltip.top,
  .tooltip.bottom {
    white-space: pre-wrap;
    margin-left: 6px;

    .tooltip-content {
      font-size: 11px;
      line-height: 14px;
    }
  }

  &:hover {
    .tooltip:not(:hover) {
      opacity: 1;
      visibility: visible;
      transition: opacity 200ms 500ms ease;
    }
  }
`;
