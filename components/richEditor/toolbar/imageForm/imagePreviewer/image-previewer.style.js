import styled from '@emotion/styled';
import { offColor as colorHelper } from 'off-color';

export default styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  margin: 15px 0;

  .mobile-dropzone {
    display: none;
  }

  .dropzone {
    position: relative;
    overflow: hidden;
    flex: 1;
    max-width: 400px;
    border: 3px dashed ${props => colorHelper(props.theme.colors.primary).rgba(0.5)};
    text-align: center;
    cursor: pointer;
    padding: 15px;
    background: linear-gradient(transparent, ${props => colorHelper(props.theme.colors.primary).rgba(0.2)});

    .icon-overlay {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 100%;
      background: transparent;
      background: linear-gradient(transparent, ${props => props.theme.colors.pageBackground});
    }

    .icon-cloud {
      fill: ${props => colorHelper(props.theme.colors.primary).rgba(0.8)};
      margin-top: -15px;
    }

    .upload-logo-text {
      color: ${props => props.theme.colors.primaryActive};
      font-weight: ${props => props.theme.fontWeights[1]};

      &.upload-sub {
        font-weight: ${props => props.theme.fontWeights[0]};
      }
    }
  }

  .buttton {
    margin: 8px 0;
  }

  .error {
    margin-top: 15px;
    color: ${props => props.theme.colors.danger};
  }

  @media (max-width: ${props => props.theme.dimensions.desktopBreakpoint}px) {
    .mobile-dropzone {
      display: block;
      white-space: normal;
      color: ${props => colorHelper(props.theme.colors.primary).rgba(0.5)};
      font-style: italic;
    }

    .dropzone {
      display: none;
    }
  }
`;
