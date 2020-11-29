import styled from '@emotion/styled';

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
    line-height: 34px;
    min-height: 36px;
    padding: 0 24px;

    .btn-content {
      font-size: 24px;
    }
  }

  &.size-sm {
    font-size: 16px;
    line-height: 24px;
    min-height: 26px;
    padding: 0 12px;

    .btn-content {
      font-size: 16px;
    }
  }

  &.disabled {
    cursor: not-allowed;
  }

  &:focus {
    border-color: ${props => props.theme.colors.info};
    box-shadow: 0 0 8px -1px ${props => props.theme.colors.info};
  }
`;
