import { css } from "@emotion/core";

export default css`
  * {
    margin: 0px;
    padding: 0px;
    box-sizing: border-box;
  }

  *:focus {
    outline: 0;
  }

  *:before, *:after {
    box-sizing: border-box;
  }

  #content-section {
    max-width: initial;

    .container {
      margin: 0px auto;
    }
  }

  #common-area, #common-area-fluid, #editor-area, #form-main {
    margin: 0 auto;
    max-width: 1200px;
    padding-top: 20px;
    width: 100%;
  }

  #page-title {
    margin: 1em auto;
    max-width: 1200px;
  }

  #profile-form {
    margin: 0 auto;
    max-width: 1200px;
  }

  .list-options, .list-table, table.fixed {
    width: 100%;
  }

  /* nested list styling for draft.js */
  .ordered-list-item:before {
    left: -36px; position: absolute; text-align: right; width: 30px;
  }

  .ordered-list-item:before {
    content: counter(ol0) ". "; counter-increment: ol0;
  }

  .ordered-list-item.depth1:before {
    content: counter(ol1, lower-alpha) ") "; counter-increment: ol1;
  }

  .ordered-list-item.depth2:before {
    content: counter(ol2, lower-roman) ". "; counter-increment: ol2;
  }

  .ordered-list-item.depth3:before {
    content: counter(ol3, upper-alpha) ". "; counter-increment: ol3;
  }

  .ordered-list-item.depth4:before {
    content: counter(ol4) ". "; counter-increment: ol4;
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
