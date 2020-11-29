import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EditorBlock, EditorState } from 'draft-js';
import { defaultPreTagStyling } from './constants';
import { camelCase } from 'lodash';
import { Map } from 'immutable';

/**
 * The components in this file are used to render various Draft block types for display in the
 * editor.
 */

export const HorizontalRule = props => <hr />;

export const Pagebreak = props => (
  <div style={{ color: '#BBBBBB', margin: '1em 0' }}>-------------------page break-------------------</div>
);

export const Image = props => {
  const image = useRef(null);
  const container = useRef(null);
  const {
    block,
    contentState,
    blockProps: { editor, getEditorState, onChange },
  } = props;

  // function used to update block data and propagate it to editorState
  const updateBlockData = useCallback(
    (newData = {}, data = block.getData()) => {
      data = data.merge(newData);
      const newBlock = block.set('data', data);
      let blockMap = getEditorState().getCurrentContent().getBlockMap();
      blockMap = blockMap.set(block.getKey(), newBlock);
      const newContent = getEditorState().getCurrentContent().set('blockMap', blockMap);
      const selection = getEditorState().getSelection();
      let editorState = EditorState.push(getEditorState(), newContent, 'change-block-data');
      editorState = EditorState.forceSelection(editorState, selection);
      onChange(editorState);
    },
    [block, getEditorState, onChange]
  );

  // turn on resizing when the image is clicked
  const handleClick = () => {
    if (editor.editor.getAttribute('contenteditable') === 'false') {
      return null;
    }
    const data = block.getData();
    if (!data.get('isActive')) {
      updateBlockData({ isActive: true });
      keepActive.current = true;
      setResize('both');
    }
  };

  // turn off resizing when isActive is removed from the block data (removal is done in the onChange method in index.js)
  const keepActive = useRef(false);
  const [resize, setResize] = useState('none');
  useEffect(() => {
    const { isActive } = block.getData();
    if (!isActive && !keepActive.current) {
      setResize('none');
    } else {
      keepActive.current = false;
    }
  }, [block]);

  // save the size info to local state, or if size data isn't present in block-data get it from the loaded image, with a fallback to a default of 250 x 250
  const data = block.getData();
  let imgStyle = data.get('imgStyle');
  let figStyle = data.delete('imgStyle');
  imgStyle =
    (imgStyle &&
      data
        .get('imgStyle')
        .mapKeys(k => camelCase(k))
        .toJS()) ||
    {};
  figStyle =
    (figStyle &&
      figStyle
        .filter(v => v !== 'class')
        .mapKeys(k => camelCase(k))
        .toJS()) ||
    {};
  const { height, width } = imgStyle;
  delete imgStyle.height;
  delete imgStyle.width;
  const [size, setSize] = useState({ height, width });

  const handleImgLoaded = () => {
    const { naturalHeight, naturalWidth } = image.current;
    if (!size.height || !size.width) {
      if (naturalHeight && naturalWidth) {
        const height = `${naturalHeight}px`;
        const width = `${naturalWidth}px`;
        updateBlockData({ imgStyle: Map({ 'object-fit': 'contain', height, width }) });
        setSize({ height, width });
      } else {
        setSize({ height: '250px', width: '250px' });
      }
    }
  };

  // if the dimensions of the container div change, update state and block-data
  const handleMouseUp = () => {
    let { height, width } = container.current.getBoundingClientRect();
    height = `${height}px`;
    width = `${width}px`;
    if (size.height !== height || size.width !== width) {
      updateBlockData({ imgStyle: Map(block.getData().get('imgStyle')).merge({ height, width }) });
      setSize({ height, width });
    }
  };

  const { src } = (block.getEntityAt(0) && contentState.getEntity(block.getEntityAt(0)).getData()) || {};
  const borderColor = theme => (resize === 'both' ? theme.colors.textOnPageBackground : 'transparent');
  return (
    <div
      ref={container}
      css={theme => [
        figStyle,
        {
          position: 'relative',
          zIndex: 1,
          display: 'inline-block',
          overflow: 'hidden',
          padding: 5,
          resize,
          border: `1px dashed ${borderColor(theme)}`,
        },
        size.height && size,
      ]}
      onClick={handleClick}
      onMouseUp={handleMouseUp}
    >
      <img ref={image} src={src} width='100%' height='100%' css={imgStyle} onLoad={handleImgLoaded} />
    </div>
  );
};

// this component is used to render most Draft block types in the editor,
// such as paragraph, unstyled, and the six heading levels
export const StyledBlock = props => {
  const { block } = props;
  let blockStyles = block
    .getData()
    .filter(v => v !== 'class')
    .reduce((styles, v, k) => {
      return styles.set(camelCase(k), v);
    }, Map());
  if (block.getType() === 'code-block') {
    const defaultStyle = Map(defaultPreTagStyling);
    blockStyles = defaultStyle.merge(blockStyles);
  }
  if (block.getDepth()) {
    blockStyles = blockStyles.set('marginLeft', `${block.getDepth() * 2.5}em`);
  }
  return (
    <div style={blockStyles.toJS()}>
      <EditorBlock {...props} />
    </div>
  );
};

/**
 * Except for ordered & unordered lists, Draft does not natively support nesting a group of blocks
 * in a parent element as is needed for tables.
 * To handle tables, we store the table's size and styling specifications in the first table block
 * and render the entire table DOM structure when we render that first block, setting a data attribute
 * on each <td> element for its position in the table. Then as each subsequent block is rendered we use
 * createPortal from React-Dom to target the correct <td> element in the table to render that block into.
 */
let refreshCount = 0; // used to prevent endless updating loop if table data is defective

export const Table = props => {
  const {
    block,
    contentState,
    blockProps: { editor },
  } = props;
  const prevBlock = contentState.getBlockBefore(block.getKey());
  const prevBlockIsSameTable =
    prevBlock &&
    prevBlock.getType() === 'table' &&
    prevBlock.getData().get('tableKey') === block.getData().get('tableKey');
  // if this is not the first table block, then the table's DOM structure has been rendered and we target the <td> element in the applicable position
  if (prevBlockIsSameTable) {
    const position = block.getData().get('tablePosition');
    const target = editor && editor.editor.querySelector(`[data-position='${position}']`);
    if (target) {
      return createPortal(<EditorBlock {...props} />, target);
    }
    /**
     * If the target isn't in the DOM and this is the last cell in the table,
     * force the editor to render its internal DOM, otherwise the table contents may
     * not be visible in the editor until it receives focus.
     * Note restoreEditorDOM is a pre-defined function on the editor.
     * It also causes the editor to receive focus, so a fix to prevent unintented
     * focus is in the reset() function of index.js
     */
    const nextBlock = contentState.getBlockAfter(block.getKey());
    const nextBlockType = nextBlock && nextBlock.getType();
    if (editor && nextBlockType !== 'table' && !refreshCount++) {
      editor.restoreEditorDOM();
    }
    return null;
  }
  // here we know we are rendering the first block of the table and will render the whole DOM structure of the table
  const data = block.getData();
  const tableKey = data.get('tableKey');
  const tableStyle = Map(data.get('tableStyle'))
    .mapKeys(k => camelCase(k))
    .toJS();
  const tableShape = data.get('tableShape');

  if (Array.isArray(tableShape)) {
    refreshCount = 0;
    return (
      <table css={tableStyle} id={tableKey}>
        <tbody>
          {tableShape.map((row, i) => (
            <tr
              key={i}
              css={
                data.get('rowStyle')[i] &&
                Map(data.get('rowStyle')[i])
                  .mapKeys(k => camelCase(k))
                  .toJS()
              }
            >
              {row.map((cell, j) => {
                const cellStyle = Map(cell.style)
                  .mapKeys(k => camelCase(k))
                  .toJS();
                if (cell.element === 'th') {
                  return (
                    <th key={j} css={cellStyle} data-position={`${tableKey}-${i}-${j}`}>
                      {!!((i === 0) & (j === 0)) && <EditorBlock {...props} />}
                    </th>
                  );
                }
                return (
                  <td key={j} css={cellStyle} data-position={`${tableKey}-${i}-${j}`}>
                    {!!((i === 0) & (j === 0)) && <EditorBlock {...props} />}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    return <EditorBlock {...props} />;
  }
};
