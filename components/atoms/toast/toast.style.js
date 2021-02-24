import styled from '@emotion/styled';
import { css, keyframes } from '@emotion/core';
import { colorHelper } from '../../citadel';

export const enterOverlay = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const progress = width => keyframes`
  from {
    width: ${width}%;
  }
  to {
    width: 0;
  }
`;

export const timerBar = css`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 5px;
  border-radius: 2px;
  background: #fff;
  opacity: 0.8;
`;

const ToastStyle = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 370px;
  width: min-content;
  padding: 14px 30px 14px 25px;
  padding-right: 30px;
  padding-left: 25px;
  font-size: 14px;
  line-height: 1.5rem;
  border-radius: 5px;
  box-shadow: 0 0 24px -6px ${props => props.theme.colors.shadowOnPage};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textOnPrimary};
  overflow: auto;

  .message {
    margin-right: 12px;
    min-width: 200px;
  }

  .timer {
    margin-right: 12px;
  }

  .action {
    margin-right: 8px;

    button.action-default {
      min-width: 50px;
      white-space: nowrap;
      background: transparent;
      font-size: 14px;
      color: ${props => props.theme.colors.textOnPrimary};
      font-weight: 500;
      cursor: pointer;
      padding: 6px 8px;
      border-radius: 5px;
      border: 1px solid ${props => colorHelper(props.theme.colors.textOnPrimary).rgba(0.4)};
      opacity: 0.9;
      user-select: none;

      :hover {
        opacity: 1;
        border-width: 1px;
        transform: scale(1.02);
        border-color: ${props => colorHelper(props.theme.colors.textOnPrimary).rgba(0.6)};
      }

      :active {
        transform: scale(1);
      }
    }
  }

  &.multi-button {
    flex-wrap: wrap;

    .message {
      flex: 1 1 100%;
    }

    .action {
      flex: 1;
      display: flex;
      justify-content: space-around;
      margin-top: 12px;
      margin-right: 0;

      button.action-default ~ button.action-default {
        margin-left: 12px;
      }
    }
  }

  .dismiss {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    padding: 3px 10px 6px 10px;
    font-size: 18px;
    opacity: 0.4;
    user-select: none;

    &:hover {
      opacity: 0.8;
    }
  }

  &.success {
    background: ${props => props.theme.colors.success};
    color: ${props => props.theme.colors.textOnSuccess};

    button.action-default {
      color: ${props => props.theme.colors.textOnSuccess};
      border-color: ${props => colorHelper(props.theme.colors.textOnSuccess).rgba(0.4)};

      &:hover {
        border-color: ${props => colorHelper(props.theme.colors.textOnSuccess).rgba(0.6)};
      }
    }
  }

  &.action-required {
    box-shadow: 0 0 18px -4px rgba(200, 200, 200, 0.3);

    .timer,
    .dismiss {
      display: none;
    }
  }

  &.info {
    background: ${props => props.theme.colors.info};
    color: ${props => props.theme.colors.infoText};

    button.action-default {
      color: ${props => props.theme.colors.infoText};
      border-color: ${props => colorHelper(props.theme.colors.infoText).rgba(0.4)};

      &:hover {
        border-color: ${props => colorHelper(props.theme.colors.infoText).rgba(0.6)};
      }
    }
  }

  &.warning {
    background: ${props => props.theme.colors.warning};
    color: ${props => props.theme.colors.textOnWarning};

    button.action-default {
      color: ${props => props.theme.colors.textOnWarning};
      border-color: ${props => colorHelper(props.theme.colors.textOnWarning).rgba(0.4)};

      &:hover {
        border-color: ${props => colorHelper(props.theme.colors.textOnWarning).rgba(0.6)};
      }
    }
  }

  &.error {
    background: ${props => props.theme.colors.danger};
    color: ${props => props.theme.colors.textOnDanger};

    button.action-default {
      color: ${props => props.theme.colors.textOnDanger};
      border-color: ${props => colorHelper(props.theme.colors.textOnDanger).rgba(0.4)};

      &:hover {
        border-color: ${props => colorHelper(props.theme.colors.textOnDanger).rgba(0.6)};
      }
    }
  }

  @media (max-width: ${props => props.theme.dimensions.tabletBreakpoint - 200}px) {
    width: 100vw;
    max-width: 100vw;
    border-radius: 0;

    &.multi-button .action {
      flex-wrap: wrap;
      align-content: space-between;

      button.action-default {
        margin-bottom: 12px;
      }
    }
  }
`;

export default ToastStyle;
