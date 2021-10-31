import Controls from './toolbar/controls';
import DraftStyles from './draftjs.style';
import EditorStyle from './editor.style';
import LinkPopover from './linkPopover';
import Prism from 'prismjs';
import codeviewStyle from './codeView.style';
import PropTypes from 'prop-types';
import RawHtmlStyle from './rawHtml.style';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import StatusBar from './statusBar';
import ToolbarStyle from './toolbar.style';
import useOnClickOutside from 'use-onclickoutside';
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from 'draft-js-export-html';
import { debounce, isArray, isNil, unionWith, kebabCase } from 'lodash';
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
  const editorWrapperRef = useRef(null);
  const linkPopoverRef = useRef(null);
  const clickOutsideRef = useRef(false);

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
      setHasScrolling(editorDOMRef.current.scrollHeight > editorDOMRef.current.clientHeight + 24);
    }
  });

  // register a click occurring outside the editor, but not in link popovers,
  // which are rendered outside the editor
  useOnClickOutside(editorWrapperRef, e => {
    if (!linkPopoverRef.current?.contains(e.target)) {
      clickOutsideRef.current = true;
    }
  });

  // used for pasting or dropping content into the editor
  const addHtmlToDocument = (newHtml, currentEditorState = editorState) => {
    if (!newHtml) return false;
    if (!currentEditorState.getCurrentContent().hasText()) {
      reset(newHtml);
      return true;
    } else {
      let newEditorState = convertHtmlToEditorState(newHtml);
      const newBlockMap = newEditorState.getCurrentContent().getBlockMap();

      const newContent = Modifier.replaceWithFragment(
        currentEditorState.getCurrentContent(),
        currentEditorState.getSelection(),
        newBlockMap
      );
      newEditorState = EditorState.push(currentEditorState, newContent, 'insert-fragment');
      onChange(newEditorState);
      const currentEditor = editor.current;
      const hasFocus = editorState.getSelection().getHasFocus();
      setTimeout(() => {
        syncContenteditable(props.disabled);
        currentEditor?.blur();
        setTimeout(() => {
          if (hasFocus) {
            currentEditor?.focus();
          }
        });
      });
      return true;
    }
  };

  const addTextToDocument = text => {
    let contentState = editorState.getCurrentContent();
    let selectionState = editorState.getSelection();
    const currentStyle = editorState.getCurrentInlineStyle();
    if (typeof text !== 'string') text = text.props?.children;
    contentState = Modifier.replaceText(contentState, selectionState, text, currentStyle);
    let newEditorState = EditorState.push(editorState, contentState, 'insert-characters');
    const selectionFocus = selectionState.getFocusOffset();
    const selectionAnchor = selectionState.getAnchorOffset();
    selectionState = selectionState.merge({
      focusOffset: selectionFocus + text.length,
      anchorOffset: selectionAnchor + text.length,
    });
    newEditorState = EditorState.forceSelection(newEditorState, selectionState);
    onChange(newEditorState);
  };

  const blockStyle = block => {
    const type = block.getType();
    const depth = block.getDepth();
    const data = block.getData();
    const classes = [];
    if (depth > 0 && !type.includes('list-item')) {
      classes.push('indent' + depth);
    }
    if (type === 'pasted-list-item') {
      const indent = data.get('margin-left') ?? '00';
      if (indent.slice(0, 2) > 36) {
        classes.push('indent1');
      }
    }
    data.forEach((v, k) => {
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
  const plaintext = useRef(null);

  const convertEditorStateToHtml = (state = editorState) => {
    const currentContent = state.getCurrentContent();
    const options = getStateToHtmlOptions(currentContent);
    const htmlContent = currentContent.hasText() ? stateToHTML(currentContent, options) : null;
    return htmlContent;
  };

  // this is used by reset() and addHtmlToDocument() when pasting or dropping content into the editor.
  const convertHtmlToEditorState = newHtml => {
    // html conversion normally ignores <hr> tags, but using this character substitution it can be configured to preserve them.
    const inputHtml = (newHtml ?? props.value ?? props.fl?.getValue(props.name) ?? '').replace(
      /<hr\/?>/g,
      '<div>---hr---</div>'
    );

    /**
     * Special parsing for legacy Instascreen data and content pasted in from other sources (google docs, summernote, etc.)
     *
     * This code:
     * 1. removes <style> tags which are sometime present from pasted word content.
     * 2. Some content created in summernote or otherwise has text that's not wrapped in any html
     * tag mixed with other content that is in tags. In the draft-js richEditor all the unwrapped
     * text gets lumped together in one div at the start of the document. This code goes through and wraps
     * those text nodes in <div> tags separately and in order with the rest of the content.
     * 3. Finds tags that contain style white-space: pre-wrap and substitutes non-breaking space characters
     * for spaces and <br> tags for newline characters so they get preserved when converted to draft.js state.
     * 4. Finds block-level tags (div, p) inside <li> list items and <td> table cells and converts them to inline <span> elements,
     * otherwise the div & p tags would take precedence and the list or table structure gets lost in the conversion.
     */
    const blockTags = [
      'div',
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'table',
      'ol',
      'ul',
      'hr',
      'pre',
      'section',
      'header',
      'nav',
      'main',
      'blockquote',
    ];
    const domParser = new DOMParser();
    const tempDoc = domParser.parseFromString(inputHtml, 'text/html');
    const parsedHTML = tempDoc.querySelector('body');
    let child = parsedHTML.firstChild;
    if (parsedHTML.children.length === 1 && child.tagName === 'TABLE') {
      child = document.createElement('br');
      parsedHTML.insertBefore(child, parsedHTML.firstChild);
      parsedHTML.appendChild(document.createElement('br'));
    }
    while (child) {
      // remove Style tags
      if (child.tagName === 'STYLE') {
        const nextChild = child.nextSibling;
        parsedHTML.removeChild(child);
        child = nextChild;
        continue;
      }
      // handle text content that is not within block elements
      if (!blockTags.includes(child.tagName?.toLowerCase())) {
        const wrapper = tempDoc.createElement('div');
        let nextChild = child.nextSibling;
        wrapper.appendChild(child);
        while (nextChild && !blockTags.includes(nextChild.tagName?.toLowerCase())) {
          const currentChild = nextChild;
          nextChild = currentChild.nextSibling;
          wrapper.appendChild(currentChild);
        }
        parsedHTML.insertBefore(wrapper, nextChild);
        child = nextChild;
      }

      child = child?.nextSibling;
    }

    // recursive function to walk the full DOM tree, making modifications as needed
    // to preserve formatting during conversion to internal state for draft.js
    const traverse = (node, isNestedBlock) => {
      if (!node) return;
      // elements formatted with spacing and soft line-breaks
      if (/white-space:\s*(pre|pre-wrap);?/.test(node.getAttribute('style'))) {
        node.innerHTML = node.innerHTML
          .replace(/\n/g, '<br>')
          .replace(/\s{2}/g, '&nbsp;&nbsp;')
          .replace(/&nbsp;\s/g, '&nbsp;&nbsp;');
        let style = node.getAttribute('style');
        style = style.replace(/white-space:\s*(pre|pre-wrap);?/, '');
        node.setAttribute('style', style);
      }
      // replace block elements inside lists with inline <span> elements
      if (isNestedBlock && ['DIV', 'P', 'INPUT'].includes(node.tagName)) {
        const newNode = changeTag(node, 'span');
        node.replaceWith(newNode);
        node = newNode;
      }
      // If a nested table has a single row and cell, switch it to a span as a single cell's contents of the outer table
      if (isNestedBlock && node.tagName === 'TABLE') {
        if (node.firstElementChild.tagName === 'TBODY') {
          const numRows = node.firstElementChild.children.length;
          if (numRows === 1) {
            const numCells = node.firstElementChild.firstElementChild.children.length;
            if (numCells === 1) {
              let cell = node.firstElementChild.firstElementChild.firstElementChild;
              if (['DVI', 'P'].includes(cell.firstElementChild.tagName)) {
                cell = cell.firstElementChild;
              }
              const newNode = changeTag(cell, 'span');
              node.replaceWith(newNode);
            }
          }
        }
      }
      traverse(node.nextElementSibling, isNestedBlock);
      isNestedBlock = isNestedBlock || node.tagName === 'LI' || node.tagName === 'TD' || node.tagName === 'TH';
      traverse(node.firstElementChild, isNestedBlock);
    };

    traverse(parsedHTML.firstElementChild);

    // function used within traverse() for converting block elements to inline span elements
    function changeTag(element, tag) {
      // prepare the elements
      const newElem = document.createElement(tag);
      const clone = element.cloneNode(true);
      // move the children from the clone to the new element
      while (clone.firstChild) {
        newElem.appendChild(clone.firstChild);
      }
      // copy the attributes
      for (const attr of clone.attributes) {
        if (attr.name === 'value') {
          newElem.textContent = attr.value;
        } else {
          newElem.setAttribute(attr.name, attr.value);
        }
      }
      return newElem;
    }

    const s = new XMLSerializer();
    const newContent = s.serializeToString(parsedHTML);
    // end special parsing

    let newEditorState = EditorState.createWithContent(stateFromHTML(newContent, stateFromHtmlOptions));
    newEditorState = EditorState.moveSelectionToEnd(newEditorState);
    return supplementalCustomBlockStyleFn(newEditorState);
  };

  const exportStateToHTML = newEditorState => {
    const htmlContent = convertEditorStateToHtml(newEditorState);
    html.current = htmlContent;
    props.onChange(htmlContent);
  };

  const getEditorState = () => {
    return editorState;
  };

  const handleBeforeInput = (chars, newEditorState) => {
    if (props.maxLength && html.current?.length >= props.maxLength) {
      return 'handled';
    }
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
    const text = data.data.getData('text');
    let content = editorState.getCurrentContent();
    const block = content.getBlockForKey(selection.getStartKey());
    if (block.getType() === 'table') {
      content = Modifier.insertText(content, selection, text);
      onChange(EditorState.push(editorState, content, 'insert-characters'));
      return true;
    }
    return addHtmlToDocument(data.data.getData('text/html'));
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
        } else if (
          collapsed &&
          offset === 0 &&
          ['pasted-list-item', 'ordered-list-item', 'unordered-list-item'].includes(currentBlockType)
        ) {
          contentState = Modifier.setBlockType(contentState, selectionState, 'unstyled');
          onChange(EditorState.push(newEditorState, contentState, 'change-block-type'));
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
    const startKey = selection.getStartKey();
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
        if (!blockMap.size) {
          const key = genKey();
          blockMap = blockMap.merge([[key, new ContentBlock({ key, type: 'unstyled', text: '', data: Map() })]]);
        }
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
        if (prevBlock?.getType() === 'table') {
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
      : prevBlock?.getKey() || nextBlock?.getKey() || blockMap.first().getKey();
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

  const handlePastedText = (text, pastedHtml, editorState) => {
    if (props.maxLength && html.current?.length >= props.maxLength) {
      return true;
    }

    // when pasting into a table cell only allow plain text
    // to be inserted or the table will become corrupted
    let content = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const block = content.getBlockForKey(selection.getStartKey());
    if (block.getType() === 'table') {
      if (selection.isCollapsed()) {
        content = Modifier.insertText(content, selection, text);
      } else {
        content = Modifier.replaceText(content, selection, text);
      }
      onChange(EditorState.push(editorState, content, 'insert-characters'));
      return true;
    }
    return addHtmlToDocument(pastedHtml, editorState);
  };

  const handlePastedFiles = files => {
    insertImage({ imgFile: files[0] });
  };

  const handleReturn = (e, editorState) => {
    if (props.maxLength && html.current?.length >= props.maxLength) {
      return 'handled';
    }
    if (e.shiftKey) {
      const newEditorState = RichUtils.insertSoftNewline(editorState);
      const contentState = Modifier.replaceText(newEditorState.getCurrentContent(), newEditorState.getSelection(), ' ');
      onChange(EditorState.push(newEditorState, contentState, 'insert-characters'));
      return 'handled';
    } else if (RichUtils.getCurrentBlockType(editorState) === 'table') {
      onChange(RichUtils.insertSoftNewline(editorState));
      return 'handled';
    } else if (
      RichUtils.getCurrentBlockType(editorState) === 'pasted-list-item' &&
      editorState.getSelection().isCollapsed()
    ) {
      let content = editorState.getCurrentContent();
      let selection = editorState.getSelection();
      let currentBlock = content.getBlockForKey(selection.getAnchorKey());
      content = Modifier.splitBlock(content, selection);
      let newEditorState = EditorState.push(editorState, content, selection, 'split-block');
      let nextBlock = content.getBlockAfter(selection.getAnchorKey());
      const key = nextBlock.getKey();
      while (nextBlock?.getType() === 'pasted-list-item') {
        let data = currentBlock.getData();
        data = data.merge({ listStart: +data.get('listStart') > 0 ? data.get('listStart') + 1 : 0 });
        content = Modifier.setBlockData(
          newEditorState.getCurrentContent(),
          SelectionState.createEmpty(nextBlock.getKey()),
          data
        );
        newEditorState = EditorState.push(newEditorState, content, 'change-block-data');
        currentBlock = content.getBlockForKey(nextBlock.getKey());
        nextBlock = content.getBlockAfter(nextBlock.getKey());
      }
      selection = selection.merge({
        anchorKey: key,
        focusKey: key,
        anchorOffset: 0,
        focusOffset: 0,
        hasFocus: true,
      });
      newEditorState = EditorState.forceSelection(newEditorState, selection);
      onChange(newEditorState);
      return 'handled';
    }
    return 'not-handled';
  };

  const handleTabInTable = (direction = 'next', collapsed = false) => {
    let newEditorState = editorState;
    let selection = editorState.getSelection();
    let contentState = editorState.getCurrentContent();
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
    if (!targetBlock && direction === 'next') {
      selection = selection.merge({
        anchorOffset: contentState.getBlockForKey(selection.getAnchorKey()).getLength(),
        focusOffset: contentState.getBlockForKey(selection.getAnchorKey()).getLength(),
      });
      contentState = Modifier.splitBlock(contentState, selection);
      targetBlock = contentState.getLastBlock();
      selection = SelectionState.createEmpty(targetBlock.getKey());
      contentState = Modifier.setBlockType(contentState, selection, 'unstyled');
      targetBlock = contentState.getLastBlock();
      newEditorState = EditorState.push(editorState, contentState, 'split-block');
    } else if (!targetBlock) {
      targetBlock = contentState.getBlockForKey(selection.getAnchorKey());
    }
    const isTargetTable = targetBlock.getType() === 'table' && !collapsed;
    const endOffset = targetBlock.getLength();
    selection = SelectionState.createEmpty(targetBlock.getKey());
    selection = selection.merge({
      anchorOffset: isTargetTable || direction === 'next' ? 0 : endOffset,
      focusOffset: isTargetTable || direction === 'previous' ? endOffset : 0,
    });
    onChange(EditorState.forceSelection(newEditorState, selection));
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
    // refocus on the editor content, update editorState with the selection point set to the end of the link text,
    // & styling for next inserted characters to match non-link text
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

      let linkPopoverOpen = false;
      if (selection.isCollapsed()) {
        const blockKey = selection.getAnchorKey();
        const offset = selection.getAnchorOffset();
        const contentState = newEditorState.getCurrentContent();
        const block = contentState.getBlockForKey(blockKey);
        const entityKey = block?.getEntityAt(offset);
        if (entityKey && !clickOutsideRef.current) {
          const entity = contentState.getEntity(entityKey);
          if (entity.get('type') === 'LINK' && !props.disabled) {
            linkPopoverOpen = true;
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
      setShowLinkPopover(linkPopoverOpen);
      setActiveStyles(activeStyles);
      plaintext.current = newEditorState.getCurrentContent().getPlainText();
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

  const onFocus = () => {
    clickOutsideRef.current = false;
    props.onFocus();
  };

  const removeSizeDataFromBlock = (newEditorState, block) => {
    const data = block.getData().delete('height').delete('width').delete('imgStyle');
    block = block.set('data', data);
    let contentState = newEditorState.getCurrentContent();
    let blockMap = contentState.getBlockMap();
    blockMap = blockMap.set(block.getKey(), block);
    contentState = contentState.set('blockMap', blockMap);
    newEditorState = EditorState.push(newEditorState, contentState, 'change-block-data');
    return newEditorState;
  };

  const syncContenteditable = disabled => {
    if (disabled) {
      const editableDivs = editor.current?.editor.querySelectorAll('[contenteditable="true"]') ?? [];
      editableDivs.forEach(div => {
        div.setAttribute('contenteditable', 'false');
        div.setAttribute('data-editable-disabled', 'true');
      });
    } else if (!disabled) {
      const editableDivs = editor.current?.editor.querySelectorAll('[data-editable-disabled="true"]') ?? [];
      editableDivs.forEach(div => {
        div.setAttribute('contenteditable', 'true');
        div.removeAttribute('data-editable-disabled');
      });
    }
  };

  const reset = newHtml => {
    if (newHtml === html.current) return;

    let newEditorState = convertHtmlToEditorState(newHtml);
    if (newHtml) {
      newEditorState = EditorState.moveFocusToEnd(newEditorState);
    } else if (newHtml === null) {
      newEditorState = moveSelectionToStart(newEditorState);
    }
    onChange(newEditorState);
    // Resetting forces the editor to take focus, so here we check if the editorState
    // had focus before the reset() and if not then remove focus again.
    // Also keep the contenteditable state in sync with props.disabled because
    // reset() leaves all contenteditable === true.
    const hasFocus = editorState.getSelection().getHasFocus();
    const currentEditor = editor.current;
    setTimeout(() => {
      syncContenteditable(props.disabled);
      currentEditor?.blur();
      setTimeout(() => {
        if (hasFocus) {
          currentEditor?.focus();
        }
      });
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
    reset: newHtml => reset(newHtml), // replaces entire content of editor with new content created from the html
    getPlainText: delimiter => getPlainText(delimiter),
    insertCustomListItem: item => addTextToDocument(item), // an alias for insert text, kept for backward compatability
    insertText: text => addTextToDocument(text), // inserts plain text at the current selection point in the editor
    insertHtml: additionalHtml => addHtmlToDocument(additionalHtml), // inserts html at the current selection point in the editor
    toggleEditMode: (newMode) => toggleEditMode(newMode),
    addEventListener: (event, fn) => editorDOMRef.current.addEventListener(event, fn),
    removeEventListener: (event, fn) => editorDOMRef.current.removeEventListener(event, fn),
    getEditorRef: () => editor.current,
    moveSelectionToStart: () => {
      onChange(moveSelectionToStart(editorState));
    },
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
        const maxDepth = block.getType().includes('list-item') ? listMax : indentMax;
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
    const selection = currentEditorState.getSelection();
    if (!selection.getHasFocus()) {
      return moveSelectionToStart(currentEditorState);
    }
    return currentEditorState;
  };

  const moveSelectionToStart = currentEditorState => {
    let selection = currentEditorState.getSelection();
    const content = currentEditorState.getCurrentContent();
    const firstBlock = content.getFirstBlock();
    const key = firstBlock.getKey();
    selection = SelectionState.createEmpty(key);
    return EditorState.forceSelection(currentEditorState, selection);
  };

  const supplementalCustomBlockStyleFn = newEditorState => {
    const contentState = newEditorState.getCurrentContent();
    const selectionState = newEditorState.getSelection();
    let blockMap = contentState.getBlockMap();
    const blocks = blockMap.map(block => {
      let depth = block.getData().get('depth');
      const margin = block.getData().get('margin-left');
      if ((margin && /em$/.test(margin)) || depth) {
        depth = depth !== undefined ? depth : parseInt(margin.replace(/rem|em/, '') / 2.5, 10);
        block = block.set('depth', depth);
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
  const toggleEditMode = (newMode) => {
    if (newMode === 'richText' && richMode) return;
    if (newMode === 'codeView' && !richMode) return;
    if (richMode) {
      const currentHeight = editorDOMRef.current.getBoundingClientRect().height;
      setRichMode(false);
      setHeight(currentHeight);
      inTextMode.current = true;
    } else {
      props.onChange(codeviewRef.current?.textContent);
      setRichMode(true);
      setHeight(props.height ? height : 'auto');
    }
  };

  useEffect(() => {
    if (richMode && inTextMode.current) {
      inTextMode.current = false;
      reset(props.value);
    }
  }, [richMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleInlineStyle = inlineStyle => {
    let newEditorState = setSelectionIfNone(editorState);

    if (/^fontSize\.\d{1,2}$/.test(inlineStyle)) inlineStyle += 'pt';
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

    // deal with style attributes imported from html as a string
    let key = kebabCase(Object.keys(customStyleMap[inlineStyle] ?? {})[0]);
    if (!key && inlineStyle.endsWith('.unset')) key = kebabCase(inlineStyle.split('.')[0]);
    newEditorState
      .getCurrentInlineStyle()
      .filter(style => style.includes(':'))
      .filter(style => key && style.includes(key))
      .forEach(style => {
        const rexp = new RegExp(`${key}:\\s+(.*?;+\\s+|.*$)`);
        const newString = style.replace(rexp, '');
        newEditorState = RichUtils.toggleInlineStyle(newEditorState, style); // remove the full style string
        newEditorState = RichUtils.toggleInlineStyle(newEditorState, newString); // add back the modified string with the conflicting style removed
      });

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

  // for pasted-list-item block-type, need to set certain attributes on the ol parent.
  useEffect(() => {
    const listItems = editorDOMRef.current.querySelectorAll('[data-start]');
    listItems.forEach(item => {
      const list = item.closest('ol');
      list.setAttribute('start', item.getAttribute('data-start'));
      list.setAttribute('style', 'margin-left: 36pt; ' + item.getAttribute('data-list-style'));
      list.setAttribute('data-list', 'true');
    });
  });

  const blockRendererFn = getBlockRendererFn(editor.current, getEditorState, onChange);

  // custom blockRendererFn does not update editable state of custom blocks when props.disabled changes, so handle it here
  useEffect(() => {
    syncContenteditable(props.disabled);
  }, [props.disabled]);

  const noToolbar = props.toolbar === 'none' || (isArray(props.toolbar) && props.toolbar[0] === 'none');

  const [scrollTop, setScrollTop] = useState(false);
  const [scrollBottom, setScrollBottom] = useState(false);
  const handleScrolling = e => {
    setScrollBottom(e.target.scrollTop + e.target.clientHeight + 12 >= e.target.scrollHeight);
    setScrollTop(e.target.scrollTop === 0);
  };
  const codeviewRef = useRef(null);

  const renderToolbar = () => {
    if (noToolbar) {
      return null;
    } else {
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
        customListSelect: item => addTextToDocument(item),
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
    }
  };

  const editorClasses = [
    'rich-text-editor',
    noToolbar && 'no-toolbar',
    !props.maxLength && props.noScrollMessage && 'no-statusbar',
  ]
    .filter(Boolean)
    .join(' ');

  if (richMode) {
    return (
      <div id={props.name} ref={editorWrapperRef} onClick={() => (clickOutsideRef.current = false)}>
        <ToolbarStyle
          className='rich-text-toolbar'
          maxDropdownHeight={Math.min(editorDOMRef.current?.getBoundingClientRect().height + 50 || 470, 570)}
        >
          {props.disabled && <div className='disabled-toolbar'></div>}
          {renderToolbar()}
        </ToolbarStyle>
        <EditorStyle
          className={editorClasses}
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
              handlePastedFiles={files => handlePastedFiles(files)}
              handleReturn={(e, editorState) => handleReturn(e, editorState)}
              keyBindingFn={e => mapKeyToEditorCommand(e)}
              onChange={editorState => onChange(editorState)}
              onFocus={onFocus}
              onBlur={onBlur}
              readOnly={props.disabled}
            />
          </DraftStyles>
        </EditorStyle>
        {(props.maxLength || !props.noScrollMessage) && (
          <StatusBar
            {...props}
            html={html.current}
            text={plaintext.current}
            hasScrolling={hasScrolling}
            scrollTop={scrollTop}
            scrollBottom={scrollBottom}
          />
        )}
        {showLinkPopover && editor.current && (
          <LinkPopover
            ref={linkPopoverRef}
            editorRef={editor.current}
            editorState={editorState}
            editLink={handleClickEditLink}
          />
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
        <div css={codeviewStyle}>
          <pre
            ref={codeviewRef}
            className='language-html'
            css={theme => ({
              margin: 0,
              resize: 'vertical',
              overflowY: 'auto',
              border: `1px solid ${theme.colors.richTextBorder}`,
              borderTop: 'none',
              borderRadius: '0 0 3px 3px',
              height,
            })}
          >
            <div
              onBlur={() => props.onChange(codeviewRef.current.textContent)}
              contentEditable='true'
              dangerouslySetInnerHTML={{ __html: Prism.highlight(props.value ?? '', Prism.languages.html, 'html') }}
            ></div>
          </pre>
        </div>
      </RawHtmlStyle>
    );
  }
});

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
