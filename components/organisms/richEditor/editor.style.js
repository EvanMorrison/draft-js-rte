import styled from '@emotion/styled';

export default styled.div`
  &.rich-text-editor {
    position: relative;
    padding: 12px;
    border: 1px solid ${props => props.theme.colors.richTextBorder};
    border-top: none;
    border-bottom: none;
    overflow-y: auto;
    resize: vertical;

    &.no-toolbar {
      border-top: 1px solid ${props => props.theme.colors.richTextBorder};
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
    }

    &.no-statusbar {
      border-bottom: 1px solid ${props => props.theme.colors.richTextBorder};
      border-bottom-left-radius: 3px;
      border-bottom-right-radius: 3px;
    }

    section {
      margin-top: 1em;
      margin-bottom: 1em;
    }

    blockquote {
      color: #999999;
      font-family: 'Hoefler Text', Georgia, serif;
      font-style: italic;
      line-height: 1.15rem;
      border-left: 5px solid rgba(100, 100, 100, 0.5);
      margin: 0 2rem;
      padding-left: 1rem;
    }

    .text-align-center {
      text-align: center;
    }

    .text-align-justify {
      text-align: justify;
    }

    .text-align-left {
      text-align: left;
    }

    .text-align-right {
      text-align: right;
    }

    .float-left {
      float: left;
    }

    .float-right {
      float: right;
    }

    .indent0 {
      margin-left: 0;
    }

    .indent1 {
      margin-left: 2.5rem;
    }

    .indent2 {
      margin-left: 5rem;
    }

    .indent3 {
      margin-left: 7.5rem;
    }

    .indent4 {
      margin-left: 10rem;
    }

    .indent5 {
      margin-left: 12.5rem;
    }

    .indent6 {
      margin-left: 15rem;
    }

    .indent7 {
      margin-left: 17.5rem;
    }

    .indent8 {
      margin-left: 20rem;
    }

    .indent9 {
      margin-left: 22.5rem;
    }

    .indent10 {
      margin-left: 25rem;
    }

    .indent11 {
      margin-left: 27.5rem;
    }

    .indent12 {
      margin-left: 30rem;
    }

    .indent13 {
      margin-left: 32.5rem;
    }

    .indent14 {
      margin-left: 35rem;
    }

    .indent15 {
      margin-left: 37.5rem;
    }

    .indent16 {
      margin-left: 40rem;
    }

    .indent17 {
      margin-left: 42.5rem;
    }

    .indent18 {
      margin-left: 45rem;
    }

    .indent19 {
      margin-left: 47.5rem;
    }

    .indent20 {
      margin-left: 50rem;
    }
  }
`;
