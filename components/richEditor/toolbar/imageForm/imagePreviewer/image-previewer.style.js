import styled from "@emotion/styled";
import hexRgb from "hex-rgb";

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
    border: 3px dashed rgba(${props => hexRgb(props.theme.colors.primary, {format: "array"}).slice(0, 3).join()}, 0.5);
    text-align: center;
    cursor: pointer;
    padding: 15px;

    .icon-overlay {
      position: absolute;
      top: 0;
      left: 0;
      height: 75px;
      width: 100%;
      background: transparent;
      background: linear-gradient(transparent, ${props => props.theme.colors.pageBackground});
    }

    .icon-cloud {
      fill: rgba(${props => hexRgb(props.theme.colors.primary, {format: "array"}).slice(0, 3).join()}, 0.8);
      margin-top: -15px;
    }

    .upload-logo-text {
      color: ${props => props.theme.colors.primaryActive};
      font-weight: ${props => props.theme.fontWeights[1]};

      &.upload-sub {
        font-weight: ${props => props.theme.fontWeights[0]};
      }

      &.file-size-limit {
        color: rgba(${props => hexRgb(props.theme.colors.primary, {format: "array"}).slice(0, 3).join()}, 0.5);
        line-height: 1.2rem;
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
      color: rgba(${props => hexRgb(props.theme.colors.primary, {format: "array"}).slice(0, 3).join()}, 0.5);
      font-style: italic;
    }

    .dropzone {
      display: none;
    }
  }
`;
