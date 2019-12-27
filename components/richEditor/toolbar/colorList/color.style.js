import styled from "@emotion/styled";

export default styled.div`
  .group {
    display: flex;
    flex-wrap: wrap;
    margin: 8px;

    .heading {
      flex: 0 0 100%;
      line-height: 2rem;
    }

    .swatch {
      width: ${props => (props.dropdownWidth - (props.columns + 16)) / props.columns}px;
      height: ${props => (props.dropdownWidth - (props.columns + 16)) / props.columns}px;
      display: inline-block;
      margin: 0;
      padding: 0;
      border: 0.5px solid #EEEEEE;

      :hover {
        cursor: pointer;
      }
    }

    .reset {
      flex: 0 0 100%;
      text-align: center;

      :hover {
        cursor: pointer;
      }
    }
  }
`;
