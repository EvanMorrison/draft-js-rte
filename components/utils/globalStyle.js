import { css } from "@emotion/react";

const globalStyle = theme => css`
  :root {
    font-family: ${theme.fonts[0]};
    font-size: 16px;
    color: ${theme.colors.textOnPageBackground};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  *:focus {
    outline: 0;
  }

  *:before,
  *:after {
    box-sizing: border-box;
  }

  p {
    margin: 15px 0;
  }

  p ~ ul {
    margin: -15px 0 0 30px;
  }

  .list-options, .list-table, table.fixed {
    width: 100%;
  }

  /* nested list styling for draft.js */
  .ordered-list-item:before {
    content: counter(ol0) '. ';
    counter-increment: ol0;
    left: -36px;
    position: absolute;
    text-align: right;
    width: 30px;
  }

  .ordered-list-item.depth1:before {
    content: counter(ol1, lower-alpha) ') ';
    counter-increment: ol1;
  }

  .ordered-list-item.depth2:before {
    content: counter(ol2, lower-roman) '. ';
    counter-increment: ol2;
  }

  .ordered-list-item.depth3:before {
    content: counter(ol3, upper-alpha) '. ';
    counter-increment: ol3;
  }

  .ordered-list-item.depth4:before {
    content: counter(ol4) '. ';
    counter-increment: ol4;
  }

  .list.depth0:first-of-type {
    counter-reset: ol0;
  }

  .list.depth1:first-of-type {
    counter-reset: ol1;
  }

  .list.depth2:first-of-type {
    counter-reset: ol2;
  }

  .list.depth3:first-of-type {
    counter-reset: ol3;
  }

  .list.depth4:first-of-type {
    counter-reset: ol4;
  }
`;

export default globalStyle;
