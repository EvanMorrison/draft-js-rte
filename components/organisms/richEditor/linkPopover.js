import Button from '../../atoms/button';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { throttle } from 'lodash';
import { css } from '@emotion/react';

const LinkPopover = React.forwardRef(({ editorRef, editorState, editLink }, ref) => {
  const editor = useRef(editorRef.editor.closest('.rich-text-editor'));

  const getLinkData = useCallback(() => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const blockKey = selectionState.getAnchorKey();
    const offset = selectionState.getAnchorOffset();
    const block = contentState.getBlockForKey(blockKey);
    const entityKey = block.getEntityAt(offset);
    let dataOffset;
    let count = 0;
    block.findStyleRanges(
      char => {
        const key = char.getEntity();
        if (key === entityKey) {
          dataOffset = count;
        }
        count++;
        return key && contentState.getEntity(key).get('type') === 'LINK';
      },
      () => {}
    );
    const elem = editor.current.querySelector(`span[data-offset-key='${blockKey}-0-${dataOffset}']`);
    let { left, bottom } = (elem && elem.getBoundingClientRect()) || {};
    const editorPosition = editor.current.getBoundingClientRect();
    if (bottom > editorPosition.bottom || bottom < editorPosition.top) {
      left = -1000;
    }
    const { url } = contentState.getEntity(entityKey).getData();
    return { left, bottom, url };
  }, [editorState]);

  const [linkState, setLinkState] = useState(getLinkData());

  useEffect(() => {
    setLinkState(getLinkData());
  }, [editorState, getLinkData]);

  useEffect(() => {
    document.onscroll = throttle(function (event) {
      setLinkState(getLinkData());
    }, 14);
    const body = document.getElementById('body');
    if (body) {
      body.onscroll = throttle(function (event) {
        setLinkState(getLinkData());
      }, 14);
    }
    const editorBox = editor.current;
    editorBox.onscroll = throttle(function (event) {
      setLinkState(getLinkData());
    }, 14);
    return () => {
      document.onscroll = null;
      editorBox.onscroll = null;
      if (body) {
        body.onscroll = null;
      }
    };
  }, [editorState, getLinkData]);

  const style = theme => css`
    position: fixed;
    left: 0;
    top: 0;
    padding: 6px;
    border: 1px solid ${theme.colors.border};
    border-radius: 3px;
    background: ${theme.colors.pageBackground};
    z-index: 1;
    font-family: ${theme.fonts[0]};
    font-size: 14px;
    box-shadow: 2px 2px 12px -6px ${theme.colors.shadowOnPage};

    :before {
      content: '';
      position: absolute;
      border-style: solid;
      border-width: 5px;
      border-color: transparent transparent ${theme.colors.pageBackground} transparent;
      filter: drop-shadow(0 -1px 0 ${theme.colors.border});
      top: -10px;
      left: 5px;
    }
  `;

  const target = useRef(document.body);
  useEffect(() => {
    target.current = document.createElement('div');
    document.body.appendChild(target.current);

    return () => {
      document.body.removeChild(target.current);
    };
  }, []);

  return createPortal(
    <div
      ref={ref}
      css={theme => [
        { transform: `translate(${linkState.left}px, ${linkState.bottom + 5}px)` },
        style(theme),
        !linkState.left && { display: 'none' },
      ]}
    >
      <a
        css={{
          maxWidth: 300,
          display: 'inline-block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        href={linkState.url}
        rel='noreferrer'
        target='_blank'
      >
        {linkState.url}
      </a>
      <span css={{ marginLeft: 3 }}>
        <Button type='tertiary' size='sm' onClick={editLink}>
          Edit
        </Button>
      </span>
    </div>,
    target.current
  );
});

export default LinkPopover;
