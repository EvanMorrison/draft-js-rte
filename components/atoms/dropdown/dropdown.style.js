import styled from '@emotion/styled';
import { css } from '@emotion/react';

const DropdownStyle = styled.div`
  display: block;
  position: absolute;
  border-radius: 5px;
  background-color: ${props => props.theme.colors.textOnPrimary};
  border: 2px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.primary};
  z-index: ${props => props.theme.zIndexes.dropDown};

  .dropdown-content {
    > ul {
      &:first-of-type {
        border-top: none;

        > li {
          &:first-of-type {
            border-top-right-radius: 5px;
            border-top-left-radius: 5px;
          }
        }
      }

      &:last-of-type {
        > li {
          &:last-of-type {
            border-bottom-right-radius: 5px;
            border-bottom-left-radius: 5px;
          }
        }
      }
    }
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid ${props => props.theme.colors.primarySelected};

    li {
      padding: 10px 20px;
      cursor: pointer;

      a {
        text-decoration: none;
        white-space: nowrap;
        color: ${props => props.theme.colors.primary};

        svg {
          fill: ${props => props.theme.colors.primary};
        }
      }

      &:hover {
        background: ${props => props.theme.colors.primary};
        color: ${props => props.theme.colors.textOnPrimary};

        svg {
          fill: ${props => props.theme.colors.textOnPrimary};
        }

        &.danger {
          color: ${props => props.theme.colors.textOnDanger};
          filter: saturate(150%);

          svg {
            fill: ${props => props.theme.colors.textOnDanger};
          }

          a {
            color: ${props => props.theme.colors.textOnDanger};
          }
        }

        a {
          color: ${props => props.theme.colors.textOnPrimary};
        }
      }

      &.danger {
        background: ${props => props.theme.colors.danger};
        color: ${props => props.theme.colors.textOnDanger};

        svg {
          fill: ${props => props.theme.colors.textOnDanger};
        }

        a {
          color: ${props => props.theme.colors.textOnDanger};
        }
      }
    }
  }

  &:before,
  &:after {
    content: '';
    position: absolute;
    top: -10px;
    width: 0;
    height: 0;
    border-style: solid;
    border-color: transparent transparent ${props => props.theme.colors.textOnPrimary} transparent;
  }

  &:before {
    border-width: 0 12px 12px;
    border-color: transparent transparent ${props => props.theme.colors.border} transparent;
  }

  &:after {
    border-width: 0 10px 10px;
    border-color: transparent transparent ${props => props.theme.colors.textOnPrimary} transparent;
  }
`;

export default DropdownStyle;

export const left = css`
  left: 10px;

  &:before {
    top: -12px;
    left: 8px;
  }

  &:after {
    left: 10px;
  }
`;

export const right = css`
  right: 10px;

  &:before {
    top: -12px;
    right: 8px;
  }

  &:after {
    right: 10px;
  }
`;
