import Controls from './toolbar/controls';
import DraftStyles from './draftjs.style';
import EditorStyle from './editor.style';
import LinkPopover from './linkPopover';
import PropTypes from 'prop-types';
import RawHtmlStyle from './rawHtml.style';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import ScrollMessage from './toolbar/scrollMessage';
import StatusBar from './statusBar';
import Textarea from '../atoms/textarea';
import ToolbarStyle from './toolbar.style';
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from 'draft-js-export-html';
import { debounce, isArray, isNil, unionWith } from 'lodash';
import { Map, OrderedSet } from 'immutable';
import { Keys, MAX_LIST_DEPTH, MAX_INDENT_DEPTH } from './utils/constants';
import {
  blockRenderMap,
  customStyleMap,
  customStyleFn,
  getBlockRendererFn,
  stateFromHtmlOptions,
  getStateToHtmlOptions,
} from './utils/renderConfig';
import {
  AtomicBlockUtils,
  CharacterMetadata,
  ContentBlock,
  ContentState,
  DefaultDraftBlockRenderMap,
  Editor,
  EditorState,
  genKey,
  getDefaultKeyBinding,
  KeyBindingUtil,
  Modifier,
  RichUtils,
  SelectionState,
} from 'draft-js';

const { hasCommandModifier } = KeyBindingUtil;
const customBlockRenderMap = Map(blockRenderMap);
const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(customBlockRenderMap);

const RichEditor = React.forwardRef((props, ref) => {
  const editor = useRef(null);
  const editorDOMRef = useRef(null);

  // STATE
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [activeStyles, setActiveStyles] = useState({});
  const [editLink, setEditLink] = useState(false);
  const [hasScrolling, setHasScrolling] = useState(false);
  const [height, setHeight] = useState(props.height ?? 'auto');
  const [isImageActive, setIsImageActive] = useState(false);
  const [richMode, setRichMode] = useState(true);
  const [showLinkPopover, setShowLinkPopover] = useState(false);

  useEffect(() => {
    if (!isNil(props.value ?? props.formLinker?.getValue(props.name))) {
      reset(props.value ?? props.formLinker?.getValue(props.name));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (richMode) {
      if (editor.current) {
        editorDOMRef.current = editor.current.editorContainer.closest('.rich-text-editor');
      }
    }
  }, [richMode]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (editorDOMRef.current) {
      setHasScrolling(editorDOMRef.current.scrollHeight > editorDOMRef.current.clientHeight);
    }
  });

  const blockStyle = block => {
    const type = block.getType();
    const depth = block.getDepth();
    const data = block.getData();
    const classes = [];
    if (depth > 0 && type.includes('list-item')) {
      classes.push('indent' + depth);
    }
    data.map((v, k) => {
      switch (k) {
        case 'text-align':
        case 'float':
          classes.push(`${k}-${v}`);
          break;
        default:
          return null;
      }
    });
    if (classes.length) return classes.join(' ');
  };

  const html = useRef(null);
  const plainText = useRef(null);

  const exportStateToHTML = newEditorState => {
    const currentContent = newEditorState.getCurrentContent();
    const options = getStateToHtmlOptions(currentContent);
    const htmlContent = currentContent.hasText() ? stateToHTML(currentContent, options) : null;
    html.current = htmlContent;
    props.onChange(htmlContent);
  };

  const getEditorState = () => {
    return editorState;
  };

  const handleBeforeInput = (chars, newEditorState) => {
    const selection = newEditorState.getSelection();
    if (!selection.isCollapsed()) {
      return handleKeypressWhenSelectionNotCollapsed(newEditorState, chars);
    }
    return 'not-handled';
  };

  const handleClickEditLink = () => {
    // used to open the insert-link dropdown
    setEditLink(true);
  };

  useEffect(() => {
    setEditLink(false);
  }, [editLink]);

  const handleDeleteKey = () => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const startBlock = contentState.getBlockForKey(selection.getStartKey());
    const endBlock = contentState.getBlockForKey(selection.getEndKey());
    const nextBlock = contentState.getBlockAfter(endBlock.getKey());
    const endOffset = selection.getEndOffset();
    // prevent deleting entire table cell
    if (selection.isCollapsed()) {
      const length = startBlock.getLength();
      if (endOffset === length && nextBlock.getType() === 'table') {
        return 'handled';
      } else {
        return 'not-handled';
      }
    } else {
      return handleKeypressWhenSelectionNotCollapsed();
    }
  };

  const handleDrop = (selection, data, isInternal) => {
    // when dropping text into a table cell only allow plain text
    // to be inserted or the table will become corrupted
    const text = data.data.getData("text");
    let content = editorState.getCurrentContent();
    let block = content.getBlockForKey(selection.getStartKey());
    if(block.getType() === "table") {
      content = Modifier.insertText(content, selection, text);
      onChange(EditorState.push(editorState, content, "insert-characters"));
      return(true);
    }
  };

  const handleKeyCommand = (command, newEditorState) => {
    switch (command) {
      case 'backspace': {
        // removing images ("atomic" blocktype) with backspace requires special handling or the image tag and dataUrl can be left in the content but not visible.
        let contentState = newEditorState.getCurrentContent();
        let selectionState = newEditorState.getSelection();
        const startKey = selectionState.getStartKey();
        const offset = selectionState.getStartOffset();
        const collapsed = selectionState.isCollapsed();
        const blockBefore = contentState.getBlockBefore(startKey);
        const currentBlockType = RichUtils.getCurrentBlockType(newEditorState);
        if (collapsed && offset === 0 && blockBefore && blockBefore.getType() === 'atomic') {
          newEditorState = removeSizeDataFromBlock(newEditorState, blockBefore);
          newEditorState = EditorState.acceptSelection(newEditorState, selectionState);
          onChange(RichUtils.onBackspace(newEditorState));
          return 'handled';
        } else if (currentBlockType === 'atomic') {
          const currentBlock = contentState.getBlockForKey(startKey);
          newEditorState = removeSizeDataFromBlock(newEditorState, currentBlock);
          newEditorState = EditorState.acceptSelection(newEditorState, selectionState);
          newEditorState = RichUtils.onBackspace(newEditorState);
          contentState = newEditorState.getCurrentContent();
          selectionState = newEditorState.getSelection();
          const key = selectionState.getAnchorKey();
          let selection = SelectionState.createEmpty(key);
          selection = selection.set('focusOffset', 1);
          contentState = Modifier.removeRange(contentState, selection, 'backward');
          onChange(EditorState.push(newEditorState, contentState, 'backspace-character'));
          return 'handled';
        } else if (currentBlockType === 'table' && collapsed && offset === 0) {
          return 'handled';
        } else if (currentBlockType !== 'table' && collapsed && blockBefore?.getType() === 'table' && offset === 0) {
          handleTabInTable('previous', true);
          return 'handled';
        } else if (collapsed && offset === 0 && blockBefore?.getType() === 'page-break') {
          let selection = SelectionState.createEmpty(blockBefore.getKey());
          contentState = Modifier.setBlockData(contentState, selection, Map({}));
          contentState = Modifier.setBlockType(contentState, selection, 'unstyled');
          selection = selection.merge({
            focusKey: selectionState.getFocusKey(),
            focusOffset: 0,
            hasFocus: true,
          });
          contentState = Modifier.removeRange(contentState, selection, 'backward');
          onChange(EditorState.push(newEditorState, contentState, 'remove-range'));
          return 'handled';
        } else if (currentBlockType === 'page-break') {
          contentState = Modifier.setBlockData(contentState, selectionState, Map({}));
          contentState = Modifier.setBlockType(contentState, selectionState, 'unstyled');
          let selection = selectionState;
          if (collapsed && contentState.getBlockAfter(startKey)) {
            selection = selection.merge({
              focusKey: contentState.getBlockAfter(startKey).getKey(),
              focusOffset: 0,
              hasFocus: true,
            });
          }
          contentState = Modifier.removeRange(contentState, selection, 'backward');
          onChange(EditorState.push(newEditorState, contentState, 'remove-range'));
          return 'handled';
        } else if (!collapsed) {
          return handleKeypressWhenSelectionNotCollapsed(newEditorState);
        } else {
          return 'not-handled';
        }
      }
      case 'BOLD':
        toggleInlineStyle('BOLD');
        return 'handled';
      case 'bullet_list':
        toggleListType('BULLETLIST');
        return 'handled';
      case 'delete':
        return handleDeleteKey();
      case 'float_left':
        toggleBlockData({ float: 'left' });
        return 'handled';
      case 'float_right':
        toggleBlockData({ float: 'right' });
        return 'handled';
      case 'INDENT':
        setIndent('INDENT');
        return 'handled';
      case 'ITALIC':
        toggleInlineStyle('ITALIC');
        return 'handled';
      case 'ordered_list':
        toggleListType('ORDEREDLIST');
        return 'handled';
      case 'OUTDENT':
        setIndent('OUTDENT');
        return 'handled';
      case 'UNDERLINE':
        toggleInlineStyle('UNDERLINE');
        return 'handled';
      case 'shiftTab':
        return 'handled';
      case 'tab':
        return 'handled';
      default:
        return 'not-handled';
    }
  };

  const handleKeypressWhenSelectionNotCollapsed = (newEditorState = editorState, chars = '') => {
    let selection = newEditorState.getSelection();
    let content = newEditorState.getCurrentContent();
    let startKey = selection.getStartKey();
    const startBlock = content.getBlockForKey(startKey);
    const endKey = selection.getEndKey();
    const endBlock = content.getBlockForKey(endKey);
    const prevBlock = content.getBlockBefore(startKey);
    const nextBlock = content.getBlockAfter(endKey);
    const firstCell =
      startBlock.getType() === 'table' && selection.getStartOffset() === 0 && prevBlock?.getType() !== 'table';
    const firstTableKey = startBlock.getData().get('tableKey');
    const lastCell =
      endBlock.getType() === 'table' &&
      selection.getEndOffset() === endBlock.getLength() &&
      nextBlock?.getType() !== 'table';
    const lastTableKey = endBlock.getData().get('tableKey');
    const sameTable = firstTableKey === lastTableKey;

    if (startBlock === endBlock || (startBlock.getType() !== 'table' && endBlock.getType() !== 'table')) {
      return 'not-handled';
    }

    let blockMap = content.getBlockMap();
    const startOffset = selection.getStartOffset();
    const endOffset = selection.getEndOffset();
    let blocks = blockMap
      .toSeq()
      .skipUntil(v => v === startBlock)
      .takeUntil(v => v === nextBlock) // take up to but not including nextBlock
      .map(block => {
        let text;
        const type = block.getType();
        if (block === startBlock) {
          text = block.getText().slice(0, startOffset) + chars;
          return block.set('text', type === 'table' ? text || ' ' : text);
        }
        if (block === endBlock) {
          text = block.getText().slice(endOffset, block.getLength());
          return block.set('text', type === 'table' ? text || ' ' : text);
        }
        return block.set('text', type === 'table' ? ' ' : '');
      })
      .toOrderedMap();

    switch (true) {
      case startBlock.getType() !== 'table' && lastCell: // remove all selected blocks
      case firstCell && lastCell: // remove all selected blocks
        blockMap = blockMap.merge(blocks);
        blockMap = blockMap.filter(
          (block, key) => !blocks.has(key) || (block.getType() !== 'table' && block.getText())
        );
        break;
      case firstCell && endBlock.getType() !== 'table': {
        // remove all selected blocks, but preserve inline style/entities in partial block after selection
        content = Modifier.removeRange(content, selection, 'backward');
        blockMap = content.getBlockMap();
        const firstBlock = blockMap.first().set('type', 'unstyled').set('data', Map());
        blockMap = blockMap.merge([[firstBlock.getKey(), firstBlock]]);
        break;
      }
      case sameTable: {
        // clear cell contents in part of a table
        blocks = blocks.butLast();
        blockMap = blockMap.merge(blocks);
        let subSelection = SelectionState.createEmpty(endKey);
        subSelection = subSelection.merge({
          focusOffset: selection.getEndOffset(),
        });
        content = content.set('blockMap', blockMap);
        content = Modifier.removeRange(content, subSelection, 'backward');
        blockMap = content.getBlockMap();
        break;
      }
      case firstCell: {
        // remove selected blocks, but just clear contents of blocks matching lastTableKey
        const notLastTable = blocks.filter(block => block.getData().get('tableKey') !== lastTableKey);
        blockMap = blockMap.merge(blocks.butLast());
        blockMap = blockMap.filter((_, key) => !notLastTable.has(key));
        let subSelection = SelectionState.createEmpty(endKey);
        subSelection = subSelection.set('focusOffset', selection.getEndOffset());
        content = content.set('blockMap', blockMap);
        content = Modifier.removeRange(content, subSelection, 'backward');
        blockMap = content.getBlockMap();
        break;
      }
      case lastCell: {
        // clear contents of blocks matching firstTableKey & remove all other selected blocks
        const notFirstTable = blocks.filter(block => block.getData().get('tableKey') !== firstTableKey);
        blockMap = blockMap.merge(blocks);
        blockMap = blockMap.filter((_, key) => !notFirstTable.has(key));
        break;
      }
      case startBlock.getType() === 'table' && endBlock.getType() === 'table' && !sameTable: {
        // clear contents of firstTableKey & lastTableKey, & delete all blocks in between, but leave one empty block to separate the tables.
        const notTable = blocks.filter(block => !block.getData().get('tableKey'));
        const separatorBlock = notTable.first();
        blockMap = blockMap.merge(blocks.butLast());
        blockMap = blockMap.filter((_, key) => !notTable.has(key) || key === separatorBlock.getKey());
        blockMap = blockMap.merge([[separatorBlock.getKey(), separatorBlock.set('text', ' ')]]);
        let subSelection = SelectionState.createEmpty(endKey);
        subSelection = subSelection.set('focusOffset', selection.getEndOffset());
        content = content.set('blockMap', blockMap);
        content = Modifier.removeRange(content, subSelection, 'backward');
        blockMap = content.getBlockMap();
        break;
      }
      case startBlock.getType() !== 'table' && endBlock.getType() === 'table': {
        //
        if (prevBlock.getType() === 'table') {
          const separatorBlock = blocks.first().set('text', ' ');
          blocks = blocks.merge([[separatorBlock.getKey(), separatorBlock]]);
        }
        blockMap = blockMap.merge(blocks.butLast());
        blockMap = blockMap.filter(block => block.getLength());
        let subSelection = SelectionState.createEmpty(endKey);
        subSelection = subSelection.set('focusOffset', selection.getEndOffset());
        content = content.set('blockMap', blockMap);
        content = Modifier.removeRange(content, subSelection, 'backward');
        blockMap = content.getBlockMap();
        break;
      }
      default: {
        // clear contents of firstTableKey, delete other blocks
        const notTableStart = blocks.find(block => !block.getData().get('tableKey')).getKey();
        const table = blocks.filter(block => block.getData().get('tableKey') === firstTableKey);
        blockMap = blockMap.merge(table);
        content = content.set('blockMap', blockMap);
        let subSelection = SelectionState.createEmpty(notTableStart);
        subSelection = subSelection.merge({
          focusKey: endKey,
          focusOffset: endOffset,
        });
        content = Modifier.removeRange(content, subSelection, 'backward');
        blockMap = content.getBlockMap();
      }
    }
    // create a new collapsed selection positioned where the former selection started
    const selectionKey = blockMap.has(startKey)
      ? startKey
      : blockMap.has(endKey)
      ? endKey
      : prevBlock?.getKey() || nextBlock?.getKey();
    selection = SelectionState.createEmpty(selectionKey);
    selection = selection.merge({
      anchorKey: selectionKey,
      anchorOffset: startOffset + chars.length,
      focusKey: selectionKey,
      focusOffset: startOffset + chars.length,
    });
    content = content.set('blockMap', blockMap);
    newEditorState = EditorState.push(newEditorState, content, 'remove-range');
    newEditorState = EditorState.forceSelection(newEditorState, selection);
    onChange(newEditorState);
    return 'handled';
  };

  const handlePastedText = (text, html, editorState) => {
    // when pasting into a table cell only allow plain text
    // to be inserted or the table will become corrupted
    let content = editorState.getCurrentContent();
    let selection = editorState.getSelection();
    let block = content.getBlockForKey(selection.getStartKey());
    if(block.getType() === "table") {
      content = Modifier.insertText(content, selection, text);
      onChange(EditorState.push(editorState, content, "insert-characters"));
      return(true);
    }
  };

  const handleReturn = (e, editorState) => {
    if (e.shiftKey) {
      const newEditorState = RichUtils.insertSoftNewline(editorState);
      const contentState = Modifier.replaceText(newEditorState.getCurrentContent(), newEditorState.getSelection(), ' ');
      onChange(EditorState.push(newEditorState, contentState, 'insert-characters'));
      return 'handled';
    }
    if (RichUtils.getCurrentBlockType(editorState) === 'table') {
      onChange(RichUtils.insertSoftNewline(editorState));
      return 'handled';
    }
    return 'not-handled';
  };

  const handleTabInTable = (direction = 'next', collapsed = false) => {
    let selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    let targetKey = selection.getAnchorKey();
    let targetBlock = contentState.getBlockForKey(targetKey);
    do {
      if (direction === 'next') {
        targetBlock = contentState.getBlockAfter(targetKey);
      } else {
        targetBlock = contentState.getBlockBefore(targetKey);
      }
      targetKey = targetBlock && targetBlock.getKey();
    } while (targetKey && ['atomic', 'horizontal-rule'].includes(targetBlock.getType()));
    if (!targetBlock) {
      targetBlock = contentState.getBlockForKey(selection.getAnchorKey());
    }
    const isTargetTable = targetBlock.getType() === 'table' && !collapsed;
    const endOffset = targetBlock.getLength();
    selection = SelectionState.createEmpty(targetBlock.getKey());
    selection = selection.merge({
      anchorOffset: isTargetTable || direction === 'next' ? 0 : endOffset,
      focusOffset: isTargetTable || direction === 'previous' ? endOffset : 0,
    });
    onChange(EditorState.forceSelection(editorState, selection));
  };

  const insertCustomListItem = item => {
    let contentState = editorState.getCurrentContent();
    let selectionState = editorState.getSelection();
    const currentStyle = editorState.getCurrentInlineStyle();
    if (typeof item !== 'string') item = item.props.children;
    contentState = contentState.createEntity('KEYWORD', 'MUTABLE', { keyword: item });
    const entityKey = contentState.getLastCreatedEntityKey();
    contentState = Modifier.replaceText(contentState, selectionState, item, currentStyle, entityKey);
    let newEditorState = EditorState.push(editorState, contentState, 'insert-characters');
    const selectionFocus = selectionState.getFocusOffset();
    const selectionAnchor = selectionState.getAnchorOffset();
    selectionState = selectionState.merge({
      focusOffset: selectionFocus + item.length,
      anchorOffset: selectionAnchor + item.length,
    });
    newEditorState = EditorState.forceSelection(newEditorState, selectionState);
    onChange(newEditorState);
  };

  const newImgFile = useRef(null);
  const insertImage = ({ imgUrl, imgFile }) => {
    if (RichUtils.getCurrentBlockType(editorState) === 'table') {
      return null;
    }
    if (!imgUrl && imgFile) {
      newImgFile.current = imgFile;
      props.onUpload(newImgFile, insertImageHandleResponse);
      return;
    }
    newImgFile.current = null;
    let contentState = editorState.getCurrentContent();
    contentState = contentState.createEntity('IMAGE', 'IMMUTABLE', { src: imgUrl });
    const entityKey = contentState.getLastCreatedEntityKey();
    const newEditorState = AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
    onChange(newEditorState);
  };

  const insertImageHandleResponse = (valid, resp) => {
    if (valid) {
      insertImage({ imgUrl: resp });
    } else {
      const fileReader = new window.FileReader();
      fileReader.readAsDataURL(newImgFile.current);
      fileReader.onloadend = e => {
        insertImage({ imgUrl: e.target.result });
      };
    }
  };

  const insertLink = ({ linkUrl, displayText, newTab, entityKey }) => {
    const isNew = isNil(entityKey);
    let contentState = editorState.getCurrentContent();
    let selectionState = editorState.getSelection();
    let currentStyles = editorState.getCurrentInlineStyle();
    let data = { url: linkUrl };
    if (newTab) {
      data = {
        ...data,
        target: '_blank',
        // noreferrer includes noopener behavior and also supresses the referrer header information
        // https://html.spec.whatwg.org/multipage/links.html#link-type-noreferrer
        // Though many articles suggest using rel="noreferrer noopener", it is actually redundant.
        rel: 'noreferrer',
      };
    }
    // different handling if inserting a new link vs replacing content of existing link
    if (isNew) {
      contentState = contentState.createEntity('LINK', 'SEGMENTED', data);
      entityKey = contentState.getLastCreatedEntityKey();
    } else {
      const block = contentState.getBlockForKey(selectionState.getAnchorKey());
      const priorBlock = contentState.getBlockBefore(selectionState.getAnchorKey());
      block.findEntityRanges(
        metadata => {
          return metadata.includes(entityKey);
        },
        (start, end) => {
          selectionState = selectionState.merge({
            anchorOffset: start,
            focusOffset: end,
          });
          if (start > 0) {
            currentStyles = block.getInlineStyleAt(+start - 1);
          } else {
            if (priorBlock) {
              currentStyles = priorBlock.getInlineStyleAt(+priorBlock.getLength() - 1);
            } else {
              currentStyles = [];
            }
          }
        }
      );
      contentState = contentState.replaceEntityData(entityKey, data);
    }
    const inlineStyles = OrderedSet(['UNDERLINE', 'color.#0088FF']).union(currentStyles);
    contentState = Modifier.replaceText(contentState, selectionState, displayText, inlineStyles, entityKey);
    let newEditorState = EditorState.push(editorState, contentState, 'insert-characters');
    // after inserting the link text, set the selection point to the end of the link text
    const key = selectionState.getFocusKey();
    let newSelection = SelectionState.createEmpty(key);
    const offset = +selectionState.getAnchorOffset() + displayText.length;
    newSelection = newSelection.merge({
      focusOffset: offset,
      anchorOffset: offset,
    });
    // refocus on the editor content, update editorState with the selection point set to the end of the link text, & styling for next inserted characters to match non-link text
    editor.current.focus();
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);
    newEditorState = EditorState.setInlineStyleOverride(newEditorState, OrderedSet(currentStyles));
    onChange(newEditorState);
  };

  const insertTable = size => {
    let selection = editorState.getSelection();

    if (!selection.isCollapsed()) {
      return null;
    }
    // don't insert a table within a table
    if (editorState.getCurrentContent().getBlockForKey(selection.getAnchorKey()).getType() === 'table') {
      return null;
    }

    const defaultCellStyle = { border: '1px solid rgba(0, 0, 0, 0.2)', padding: '6px', 'text-align': 'center' };
    const cols = Array(size.cols).fill(1);
    const tableShape = Array(size.rows)
      .fill(cols)
      .map(row => row.map(() => ({ element: 'td', style: { ...defaultCellStyle } })));

    const tableKey = genKey();
    const newBlocks = [];
    tableShape.forEach((row, i) => {
      row.forEach((cell, j) => {
        let data = Map({
          tableKey,
          tablePosition: `${tableKey}-${i}-${j}`,
          'text-align': 'center',
        });
        if (i === 0 && j === 0) {
          data = data
            .set('tableShape', tableShape)
            .set('tableStyle', { 'border-collapse': 'collapse', margin: '15px 0', width: '100%' })
            .set('rowStyle', []);
        }
        const newBlock = new ContentBlock({ key: genKey(), type: 'table', text: ' ', data });
        newBlocks.push(newBlock);
      });
    });
    const selectionKey = selection.getAnchorKey();
    let contentState = editorState.getCurrentContent();
    contentState = Modifier.splitBlock(contentState, selection);
    const blockArray = contentState.getBlocksAsArray();
    const currBlock = contentState.getBlockForKey(selectionKey);
    const index = blockArray.findIndex(block => block === currBlock);
    const isEnd = index === blockArray.length - 1;
    if (blockArray[index]?.getType() === 'table') {
      newBlocks.unshift(new ContentBlock({ key: genKey() }));
    }
    if (blockArray[index + 1]?.getType() === 'table') {
      newBlocks.push(new ContentBlock({ key: genKey() }));
    }
    blockArray.splice(index + 1, 0, ...newBlocks);
    if (isEnd) {
      blockArray.push(new ContentBlock({ key: genKey() }));
    }
    const entityMap = contentState.getEntityMap();
    contentState = ContentState.createFromBlockArray(blockArray, entityMap);
    let newEditorState = EditorState.push(editorState, contentState, 'insert-fragment');
    const key = newBlocks[0].getKey();
    selection = SelectionState.createEmpty(key);
    newEditorState = EditorState.acceptSelection(newEditorState, selection);
    onChange(newEditorState);
  };

  const mapKeyToEditorCommand = e => {
    if (
      !editorState.getCurrentContent().hasText() &&
      ['unstyled', 'paragraph'].includes(editorState.getCurrentContent().getFirstBlock().getType())
    ) {
      (async () => {
        const currentStyle = editorState.getCurrentInlineStyle().toArray();
        // merge user selected styles with defaults, overriding defaults where they conflict
        const styles = unionWith(currentStyle, props.defaultStyles, (v1, v2) => v1.split('.')[0] === v2.split('.')[0]);
        await onChange(EditorState.setInlineStyleOverride(editorState, OrderedSet(styles)));
      })();
    }
    if (e.keyCode === Keys.B && e.shiftKey && hasCommandModifier(e)) {
      return 'bullet_list';
    } else if (e.keyCode === Keys.B && hasCommandModifier(e)) {
      return 'BOLD';
    } else if (e.keyCode === Keys.L && e.shiftKey && hasCommandModifier(e)) {
      return 'ordered_list';
    } else if (e.keyCode === Keys.L && hasCommandModifier(e)) {
      return 'float_left';
    } else if (e.keyCode === Keys.R && hasCommandModifier(e)) {
      return 'float_right';
    } else if (e.keyCode === Keys.I && hasCommandModifier(e)) {
      return 'ITALIC';
    } else if (e.keyCode === Keys[']'] && hasCommandModifier(e)) {
      return 'INDENT';
    } else if (e.keyCode === Keys.U && hasCommandModifier(e)) {
      return 'UNDERLINE';
    } else if (e.keyCode === Keys['['] && hasCommandModifier(e)) {
      return 'OUTDENT';
    } else if (e.keyCode === Keys.Backspace && !hasCommandModifier(e) && !e.altKey) {
      return 'backspace';
      // Tab & shift+Tab handled here instead of handleKeyCommand because RichUtils.onTab requires event reference
    } else if (e.keyCode === Keys.Delete) {
      return 'delete';
    } else if (e.keyCode === Keys.Tab && e.shiftKey) {
      const currentBlockType = RichUtils.getCurrentBlockType(editorState);
      if (currentBlockType.includes('list-item')) {
        onChange(RichUtils.onTab(e, editorState, MAX_LIST_DEPTH));
      } else if (currentBlockType === 'table') {
        handleTabInTable('previous');
      }
      return 'shiftTab';
    } else if (e.keyCode === Keys.Tab) {
      const currentBlockType = RichUtils.getCurrentBlockType(editorState);
      if (RichUtils.getCurrentBlockType(editorState).includes('list-item')) {
        onChange(RichUtils.onTab(e, editorState, MAX_LIST_DEPTH));
      } else if (currentBlockType === 'table') {
        handleTabInTable('next');
      } else {
        const newContentState = Modifier.replaceText(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          '     '
        );
        onChange(EditorState.push(editorState, newContentState, 'insert-characters'));
      }
      return 'tab';
    }
    return getDefaultKeyBinding(e);
  };

  const updateFormData = useRef(debounce(exportStateToHTML, 500, { leading: true }));

  const onChange = useCallback(
    newEditorState => {
      const selection = newEditorState.getSelection();
      let content = newEditorState.getCurrentContent();
      if (selection.isCollapsed() && RichUtils.getCurrentBlockType(newEditorState) === 'table') {
        const block = content.getBlockForKey(selection.getAnchorKey());
        if (!block.getLength()) {
          content = Modifier.insertText(content, selection, ' ');
          newEditorState = EditorState.push(newEditorState, content, 'insert-characters');
        }
      }
      let blockMap = content.getBlockMap();
      const activeBlock = blockMap.find(block => block.getData().get('isActive'));
      if (activeBlock) {
        if (isImageActive) {
          let data = activeBlock.getData();
          data = data.delete('isActive');
          const inactiveBlock = activeBlock.set('data', data);
          blockMap = blockMap.set(activeBlock.getKey(), inactiveBlock);
          const newContent = content.set('blockMap', blockMap);
          newEditorState = EditorState.push(newEditorState, newContent, 'change-block-data');
          newEditorState = EditorState.forceSelection(newEditorState, selection);
        }
        setIsImageActive(isImageActive => !isImageActive);
      }

      let showLinkPopover = false;
      if (selection.isCollapsed()) {
        const blockKey = selection.getAnchorKey();
        const offset = selection.getAnchorOffset();
        const contentState = newEditorState.getCurrentContent();
        const block = contentState.getBlockForKey(blockKey);
        const entityKey = block.getEntityAt(offset);
        if (entityKey) {
          const entity = contentState.getEntity(entityKey);
          if (entity.get('type') === 'LINK' && !props.disabled) {
            showLinkPopover = true;
          }
        }
      }
      updateFormData.current(newEditorState);
      const styleList = newEditorState.getCurrentInlineStyle().toList();
      const activeStyles = {};
      styleList.forEach(s => {
        const [type, value] = s.split('.');
        activeStyles[type] = value;
      });
      setShowLinkPopover(showLinkPopover);
      setActiveStyles(activeStyles);
      plainText.current = newEditorState.getCurrentContent().getPlainText();
      setEditorState(newEditorState);
    },
    [isImageActive, props.disabled]
  );

  // if the editor is set to disabled while an image is active for resizing, turn off the active state.
  useEffect(() => {
    if (props.disabled) {
      let blockMap = editorState.getCurrentContent().getBlockMap();
      const activeBlock = blockMap.find(block => block.getData().get('isActive'));
      if (activeBlock) {
        let data = activeBlock.getData();
        data = data.delete('isActive');
        const inactiveBlock = activeBlock.set('data', data);
        blockMap = blockMap.set(activeBlock.getKey(), inactiveBlock);
        const newContent = editorState.getCurrentContent().set('blockMap', blockMap);
        const newEditorState = EditorState.push(editorState, newContent, 'change-block-data');
        onChange(newEditorState);
      }
      setIsImageActive(false);
    }
  }, [props.disabled, editorState, onChange]);

  const onBlur = () => {
    setActiveStyles({});
    props.onBlur();
  };

  const removeSizeDataFromBlock = (newEditorState, block) => {
    const data = block.getData().delete('height').delete('width');
    block = block.set('data', data);
    let contentState = newEditorState.getCurrentContent();
    let blockMap = contentState.getBlockMap();
    blockMap = blockMap.set(block.getKey(), block);
    contentState = contentState.set('blockMap', blockMap);
    newEditorState = EditorState.push(newEditorState, contentState, 'change-block-data');
    return newEditorState;
  };

  const reset = newHtml => {
    if (newHtml === html.current) return;

    // html conversion normally ignores <hr> tags, but using this character substitution it can be configured to preserve them.
    const inputHTML = (newHtml ?? props.value ?? props.fl?.getValue(props.name) ?? '').replace(
      /<hr\/?>/g,
      '<div>---hr---</div>'
    );

    /**
     * Special parsing for legacy Instascreen data.
     *
     * This code:
     * 1. removes <style> tags which are sometime present from pasted word content.
     * 2. Some content created in summernote or otherwise has text that's not wrapped in any html
     * tag mixed with other content that is in tags. In the draft-js richEditor all the unwrapped
     * text gets lumped together in one div at the start of the document.goes through and wraps
     * those text nodes in <div> tags separately and in order with the rest of the content.
     * 3. Finds tags that contain style white-space: pre-wrap and substitutes non-breaking space characters
     * for spaces and <br> tags for newline characters so they get preserved when converted to draft.js state.
     */
    const domParser = new DOMParser();
    const tempDoc = domParser.parseFromString(inputHTML, 'text/html');
    const parsedHTML = tempDoc.querySelector('body');
    let child = parsedHTML.firstChild;
    while (child) {
      let newChild;
      if (child.tagName === 'STYLE') {
        newChild = child.nextSibling;
        parsedHTML.removeChild(child);
        child = newChild;
        continue;
      }
      if (!child.tagName || child.tagName === 'BR') {
        newChild = tempDoc.createElement('div');
        const clone = child.cloneNode(true);
        newChild.appendChild(clone);
        parsedHTML.insertBefore(newChild, child.nextSibling);
        parsedHTML.removeChild(child);
      }
      child = (newChild || child).nextSibling;
    }
    if (inputHTML.includes('white-space:')) {
      const traverse = node => {
        if (!node) return;
        if (/white-space:\s*(pre|pre-wrap);?/.test(node.getAttribute('style'))) {
          node.innerHTML = node.innerHTML
            .replace(/\n/g, '<br>')
            .replace(/\s{2}/g, '&nbsp;&nbsp;')
            .replace(/&nbsp;\s/g, '&nbsp;&nbsp;');
          let style = node.getAttribute('style');
          style = style.replace(/white-space:\s*(pre|pre-wrap);?/, '');
          node.setAttribute('style', style);
        }
        traverse(node.firstElementChild);
        traverse(node.nextElementSibling);
      };
      traverse(parsedHTML.firstElementChild);
    }
    const s = new XMLSerializer();
    const newContent = s.serializeToString(parsedHTML);
    // end special parsing

    let newEditorState = EditorState.createWithContent(stateFromHTML(newContent, stateFromHtmlOptions));
    newEditorState = EditorState.moveSelectionToEnd(newEditorState);
    onChange(supplementalCustomBlockStyleFn(newEditorState));
    setTimeout(() => {
      // this is a fix for tables. Rendering tables forces the editor to take focus.
      // Here we check if the editorState before the onChange completes had focus
      // and if not then remove focus again after the update
      const selection = editorState.getSelection();
      if (!selection.getHasFocus() && editor.current) {
        editor.current.blur();
      }
    });
  };

  const getPlainText = delimiter => {
    return editorState.getCurrentContent().getPlainText(delimiter);
  };

  /**
   * Used in combination with useRef, this hook customizes the instance value that is exposed
   * to parent components when using ref. Meaning the collection of functions returned from this
   * hook will be methods on the instance of this Editor rendered in a parent component.
   * For example, when rendering this Editor through the Field component like
   * <Field type="editor" setRef={ el => { editorRef.current = el;} } />, in the parent you are
   * able to call editorRef.current.focus() or editorRef.current.getPlainText(), etc.
   * See React documentation at https://reactjs.org/docs/hooks-reference.html#useimperativehandle
   *  */
  useImperativeHandle(ref, () => ({
    focus: () => focus(),
    blur: () => editor.current.blur(),
    reset: newHtml => reset(newHtml),
    getPlainText: delimiter => getPlainText(delimiter),
    insertCustomListItem: item => insertCustomListItem(item),
    toggleEditMode: () => toggleEditMode(),
    addEventListener: (event, fn) => editorDOMRef.current.addEventListener(event, fn),
    removeEventListener: (event, fn) => editorDOMRef.current.removeEventListener(event, fn),
  }));

  const setAlignment = alignment => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    let newContentState = Modifier.mergeBlockData(contentState, selectionState, { 'text-align': alignment });
    const tableBlocks = tableBlocksInSelection(newContentState);
    if (tableBlocks) {
      newContentState = setAlignmentInTable(alignment, newContentState, tableBlocks);
    }
    onChange(EditorState.push(editorState, newContentState, 'change-block-data'));
  };

  const setAlignmentInTable = (alignment, content, blocks) => {
    // because cell style data is kept in the tableShape array stored with
    // the first block in the table, we have to update that information here
    let blockMap = content.getBlockMap();
    const tableKey = blocks.first().getData().get('tableKey');
    let firstTableBlock = blockMap.find(block => block.getData().get('tablePosition') === `${tableKey}-0-0`);
    const tableShape = firstTableBlock.getData().get('tableShape');
    blocks.forEach(block => {
      const [_, row, col] = block.getData().get('tablePosition').split('-');
      tableShape[row][col].style = {
        ...tableShape[row][col].style,
        'text-align': alignment,
      };
    });
    let data = firstTableBlock.getData();
    data = data.set('tableShape', tableShape);
    firstTableBlock = firstTableBlock.merge({ data });
    blockMap = blockMap.merge([[firstTableBlock.getKey(), firstTableBlock]]);
    content = content.merge({ blockMap });
    return content;
  };

  const setBlockType = blockType => {
    let contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    if (tableBlocksInSelection()) {
      return null;
    }
    const anchorKey = selectionState.getAnchorKey();
    let block = contentState.getBlockForKey(anchorKey);
    // for page-break block type we want to insert a new block rather than just convert the current block type
    if (blockType === 'page-break') {
      const newKey = genKey();
      const newBlock = new ContentBlock({ key: newKey, type: 'page-break', text: '\n' });
      let offset = selectionState.getAnchorOffset();
      if (offset > 0) {
        contentState = Modifier.splitBlock(contentState, selectionState);
      }
      block = contentState.getBlockForKey(anchorKey);
      offset = selectionState.getAnchorOffset();
      const blockArray = contentState.getBlocksAsArray();
      const index = blockArray.findIndex(b => b === block);
      blockArray.splice(index + (offset && 1), 0, newBlock);
      const entityMap = contentState.getEntityMap();
      contentState = ContentState.createFromBlockArray(blockArray, entityMap);
      let newEditorState = EditorState.push(editorState, contentState, 'insert-fragment');
      let selection = SelectionState.createEmpty(anchorKey);
      selection = selection.merge({
        anchorOffset: offset,
        focusKey: anchorKey,
        focusOffset: offset,
        hasFocus: true,
      });
      newEditorState = EditorState.acceptSelection(newEditorState, selection);
      onChange(newEditorState);
    } else {
      const depth = block.getDepth();
      const newContentState = Modifier.setBlockType(contentState, selectionState, blockType);
      const newEditorState = EditorState.push(editorState, newContentState, 'change-block-type');
      setIndent(undefined, newEditorState, 4, 20, depth);
    }
  };

  const tableBlocksInSelection = (content = editorState.getCurrentContent()) => {
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const endKey = selection.getEndKey();
    const nextKey = content.getKeyAfter(endKey);
    const blockMap = content.getBlockMap();
    const blocks = blockMap
      .toSeq()
      .skipUntil((_, k) => k === startKey)
      .takeUntil((_, k) => k === nextKey)
      .filter(block => block.getType() === 'table')
      .toOrderedMap();
    if (!blocks.size) {
      return null;
    }
    return blocks;
  };

  const focus = () => {
    if (editor.current && !props.disabled) {
      editor.current.focus();
    }
  };

  const setFocusToEnd = () => {
    if (props.disabled) {
      return null;
    }
    const selectionState = editorState.getSelection();
    if (!selectionState.getHasFocus()) {
      onChange(EditorState.moveFocusToEnd(editorState));
    }
  };

  const setIndent = (
    direction,
    newEditorState = editorState,
    listMax = MAX_LIST_DEPTH,
    indentMax = MAX_INDENT_DEPTH,
    setDepth
  ) => {
    const selectionState = newEditorState.getSelection();
    const contentState = newEditorState.getCurrentContent();
    const adjustment = direction === 'INDENT' ? 1 : -1;
    const startKey = selectionState.getStartKey();
    const endKey = selectionState.getEndKey();
    let blockMap = contentState.getBlockMap();
    const blocks = blockMap
      .toSeq()
      .skipUntil((_, k) => k === startKey)
      .takeUntil((_, k) => k === endKey)
      .concat([[endKey, blockMap.get(endKey)]])
      .map(block => {
        const depth = block.getDepth();
        const maxDepth = block.getType().indexOf('list-item') > -1 ? listMax : indentMax;
        const newDepth = setDepth !== undefined ? setDepth : Math.max(0, Math.min(depth + adjustment, maxDepth));
        return block.set('depth', newDepth);
      });

    blockMap = blockMap.merge(blocks);
    const newContentState = contentState.merge({
      blockMap,
      selectionBefore: selectionState,
      selectionAfter: selectionState,
    });
    newEditorState = EditorState.push(newEditorState, newContentState, 'adjust-depth');
    onChange(newEditorState);
  };

  const setSelectionIfNone = currentEditorState => {
    let selection = currentEditorState.getSelection();
    if (!selection.getHasFocus()) {
      const content = currentEditorState.getCurrentContent();
      const firstBlock = content.getFirstBlock();
      const key = firstBlock.getKey();
      selection = SelectionState.createEmpty(key);
      return EditorState.forceSelection(currentEditorState, selection);
    }
    return currentEditorState;
  };

  const supplementalCustomBlockStyleFn = newEditorState => {
    const contentState = newEditorState.getCurrentContent();
    const selectionState = newEditorState.getSelection();
    let blockMap = contentState.getBlockMap();
    const blocks = blockMap.map(block => {
      let depth = block.getData().get('depth');
      const margin = block.getData().get('margin-left');
      if (margin || depth) {
        depth = depth !== undefined ? depth : parseInt(margin.replace(/rem|em/, '') / 2.5, 10);
        block = block.set('depth', depth);
        let data = block.getData();
        data = data.remove('margin-left');
        block = block.set('data', data);
      }

      block.findEntityRanges(
        v => {
          const key = v.getEntity();
          return key !== null && contentState.getEntity(key).getType() === 'LINK';
        },
        (start, end) => {
          const characterList = block.getCharacterList().map((v, k) => {
            if (start <= k && k < end) {
              v = CharacterMetadata.applyStyle(v, 'UNDERLINE');
              v = CharacterMetadata.applyStyle(v, 'color.#0088FF');
              return v;
            }
            return v;
          });
          block = block.set('characterList', characterList);
        }
      );
      return block;
    });
    blockMap = blockMap.merge(blocks);
    const newContentState = contentState.merge({
      blockMap,
      selectionBefore: selectionState,
      selectionAfter: selectionState,
    });
    newEditorState = EditorState.push(newEditorState, newContentState, 'adjust-depth');
    return newEditorState;
  };

  const toggleBlockData = newData => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
    const block = contentState.getBlockForKey(selectionState.getAnchorKey());
    let data = block.getData();
    Object.keys(newData).forEach(key => {
      if (data.get(key) === newData[key]) {
        data = data.remove(key);
      } else {
        data = data.merge(newData);
      }
    });
    const newContentState = Modifier.setBlockData(contentState, selectionState, data);
    onChange(EditorState.push(editorState, newContentState, 'change-block-data'));
  };

  const inTextMode = useRef(false);
  const toggleEditMode = () => {
    if (richMode) {
      const currentHeight = editorDOMRef.current.getBoundingClientRect().height;
      setRichMode(false);
      setHeight(currentHeight);
      inTextMode.current = true;
    } else {
      setRichMode(true);
      setHeight(props.height ? height : 'auto');
    }
  };

  useEffect(() => {
    if (richMode && inTextMode.current) {
      inTextMode.current = false;
      reset();
    }
  }, [richMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleInlineStyle = inlineStyle => {
    let newEditorState = setSelectionIfNone(editorState);
    // if the new style is a compound style type (fontFamily, fontSize, color, or backgroundColor) and the current style includes the same type,
    // remove the current matching style type before turning on the new style.
    const existingMatch = newEditorState
      .getCurrentInlineStyle() // getCurrentInlineStyle() returns an Immutable OrderedSet
      .filter(style => style.includes('.') && style.split('.')[0] === inlineStyle.split('.')[0]) // compound styles are dot-delimited e.g. fontFamily.Arial
      .toList()
      .get(0);
    if (existingMatch) {
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, existingMatch);
    }
    if (inlineStyle.endsWith('unset')) {
      onChange(newEditorState);
    } else {
      onChange(RichUtils.toggleInlineStyle(newEditorState, inlineStyle));
    }
  };

  const toggleListType = listType => {
    if (RichUtils.getCurrentBlockType(editorState) === 'table') {
      return null;
    }
    const blockType = listType === 'BULLETLIST' ? 'unordered-list-item' : 'ordered-list-item';
    onChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const blockRendererFn = getBlockRendererFn(editor.current, getEditorState, onChange);

  // custom blockRendererFn does not update editable state of custom blocks when props.disabled changes, so handle it here
  useEffect(() => {
    if (props.disabled) {
      const editableDivs = editor.current.editor.querySelectorAll(`[contenteditable='${props.disabled}']`);
      editableDivs.forEach(div => {
        div.setAttribute('contenteditable', 'false');
        div.setAttribute('data-editable-disabled', 'true');
      });
    } else if (!props.disabled) {
      const editableDivs = editor.current.editor.querySelectorAll("[data-editable-disabled='true']");
      editableDivs.forEach(div => {
        div.setAttribute('contenteditable', 'true');
        div.removeAttribute('data-editable-disabled');
      });
    }
  }, [props.disabled]);

  const noToolbar = props.toolbar === 'none' || (isArray(props.toolbar) && props.toolbar[0] === 'none');

  const [scrollBottom, setScrollBottom] = useState(false);
  const handleScrolling = (e) => {
    console.log(e.target.scrollHeight, e.target.scrollTop + e.target.clientHeight)
    setScrollBottom(e.target.scrollTop + e.target.clientHeight + 12 >= e.target.scrollHeight);
  }

  const renderToolbar = () => {
    const selection = editorState.getSelection();
    const block = editorState.getCurrentContent().getBlockForKey(selection.getStartKey());
    const controlProps = {
      activeStyles: activeStyles,
      blockType: block.getType(),
      blockData: block.getData(),
      currentStyle: editorState.getSelection().getHasFocus() && editorState.getCurrentInlineStyle(),
      editor: editor,
      editorState: editorState,
      openLinkForm: editLink,
      alignmentSelect: alignment => setAlignment(alignment),
      blockDataToggle: data => toggleBlockData(data),
      blockTypeSelect: type => setBlockType(type),
      customListSelect: item => insertCustomListItem(item),
      colorSelect: color => toggleInlineStyle(color),
      editModeToggle: () => toggleEditMode(),
      fontFamilySelect: font => toggleInlineStyle(font),
      fontSizeSelect: size => toggleInlineStyle(size),
      indentChange: action => setIndent(action),
      inlineToggle: inlineStyle => toggleInlineStyle(inlineStyle),
      insertImage: img => insertImage(img),
      insertLink: link => insertLink(link),
      insertTable: size => insertTable(size),
      listToggle: listType => toggleListType(listType),
    };

    return <Controls {...controlProps} {...props} />;
  };

  if (richMode) {
    return (
      <div id={props.name}>
        <ToolbarStyle
          className='rich-text-toolbar'
          maxDropdownHeight={Math.min(editorDOMRef.current?.getBoundingClientRect().height + 50 || 470, 570)}
        >
          {props.disabled && <div className='disabled-toolbar'></div>}
          {renderToolbar()}
        </ToolbarStyle>
        <EditorStyle
          className={`rich-text-editor${noToolbar ? ' no-toolbar' : ''}`}
          onClick={setFocusToEnd}
          css={{ height, minHeight: props.minHeight, maxHeight: props.maxHeight }}
          onScroll={handleScrolling}
        >
          <DraftStyles>
            <Editor
              ref={editor}
              editorState={editorState}
              placeholder={props.placeholder}
              blockRendererFn={blockRendererFn}
              blockRenderMap={extendedBlockRenderMap}
              customStyleMap={customStyleMap}
              customStyleFn={customStyleFn}
              blockStyleFn={contentBlock => blockStyle(contentBlock)}
              handleBeforeInput={(chars, editorState) => handleBeforeInput(chars, editorState)}
              handleDrop={(selection, data, isInternal) => handleDrop(selection, data, isInternal)}
              handleKeyCommand={(command, editorState) => handleKeyCommand(command, editorState)}
              handlePastedText={(text, html, editorState) => handlePastedText(text, html, editorState)}
              handleReturn={(e, editorState) => handleReturn(e, editorState)}
              keyBindingFn={e => mapKeyToEditorCommand(e)}
              onChange={editorState => onChange(editorState)}
              onFocus={() => props.onFocus()}
              onBlur={onBlur}
              readOnly={props.disabled}
            />
          </DraftStyles>
        </EditorStyle>
        {!noToolbar && <StatusBar {...props} html={html.current ?? 0} text={plainText.current ?? 0}  hasScrolling={hasScrolling} scrollBottom={scrollBottom} />}
        {showLinkPopover && editor.current && (
          <LinkPopover editorRef={editor.current} editorState={editorState} editLink={handleClickEditLink} />
        )}
      </div>
    );
  } else {
    return (
      <RawHtmlStyle className='raw-html'>
        <ToolbarStyle className='rich-text-toolbar'>
          <Controls
            toolbar={['viewHtml']}
            editModeToggle={toggleEditMode}
            tooltipOrientation={props.tooltipOrientation}
          />
        </ToolbarStyle>
        <Textarea className='public-DraftEditor-content' rows={height / 14} {...props} />
      </RawHtmlStyle>
    );
  }
});

RichEditor.componentDescription = 'Rich Text Editor';
RichEditor.componentKey = 'richEditor';
RichEditor.componentName = 'RichEditor';
RichEditor.displayName = 'RichEditor';

RichEditor.propTypes = {
  /** One or more custom lists of insertable text or symbols (eg. keywords or emojis). Properties are "controlDisplay", "controlDimensions", and "availableItems". */
  customControls: PropTypes.object,
  /** A list of default inline styles, e.g. ["BOLD", "ITALIC", "UNDERLINE", "color.#FF0000", "fontSize.10", "fontFamily.Arial"] */
  defaultStyles: PropTypes.arrayOf(PropTypes.string),
  /** Sets the initial height (in pixels) for the editor's input area. */
  height: PropTypes.number,
  /** Sets the minimum height (in pixels) for the editor's input area. */
  minHeight: PropTypes.number,
  /** Sets the maximum allowed height (in pixels) for the editor's input area. */
  maxHeight: PropTypes.number,
  /** The name for the editor component instance. */
  name: PropTypes.string,
  /** If present, suppress showing the scroll message when content overflows the editor's container element */
  noScrollMessage: PropTypes.bool,
  /** Text to display when editor is empty. */
  placeholder: PropTypes.string,
  /** An array of strings containing the names of the controls to include in the toolbar. Set prop to ["none"] to use the editor without a toolbar, or ["defaultControls", <nameOfCustomControl1>, ...] if using the customControls prop. Use "spacer" one or more times to add some space between groups of controls. */
  toolbar: PropTypes.array,
  /** Top, bottom, left or right tooltip alignment. */
  tooltipOriention: PropTypes.string,
  /** Callback function called when editor loses focus. */
  onBlur: PropTypes.func,
  /** Callback function to execute on changes in editor content. */
  onChange: PropTypes.func,
  /** Callback function called when editor receives focus. */
  onFocus: PropTypes.func,
  /** A callback to handle uploading an image file, returning a url */
  onUpload: PropTypes.func,
  /** Create a ref to the editor component. Required if access to the editor's reset method is needed for the purpose of resetting/replacing the editor content after the component has mounted. */
  setRef: PropTypes.func,
  /** Content of the editor as html string. */
  value: PropTypes.string,
};

RichEditor.defaultProps = {
  defaultStyles: [],
  minHeight: 250,
  maxHeight: 600,
  tooltipOriention: 'top',
  onChange: () => {},
  onBlur: () => {},
  onFocus: () => {},
  onUpload: (_, callback) => {
    callback();
  },
};

export default RichEditor;
