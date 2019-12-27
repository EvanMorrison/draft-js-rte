import styled from "@emotion/styled";

const ExampleStyle = styled.div`
  .block-section {
    margin-bottom: 12px;
  }

  .icon-revert-color, .icon-applicant-pending, .icon-applicant-ready, .icon-batch-order, .icon-draft-icon, .icon-new-order, .icon-xml-ready, .icon-new-order {
    width: 32px;
    height: 32px;
  }

  h4 {
    color: ${props => props.theme.colors.primaryHighlight};
    border-bottom: 1px solid ${props => props.theme.colors.primaryHighlight};
    margin-bottom: 18px;
    margin-top: 24px;

    &:first-of-type {
      margin-top: 0;
    }
  }

  .flex-item {
    align-items: center;

    .label {
      font-size: 0.8em;
      margin: 8px 0 16px;
    }
  }
`;

export default ExampleStyle;
