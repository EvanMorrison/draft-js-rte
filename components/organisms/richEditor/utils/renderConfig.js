import React from 'react'; // eslint-disable-line no-unused-vars
import { Image, HorizontalRule, Pagebreak, StyledBlock, Table, ListItem } from './blockRenderComponents';
import { camelCase, isEmpty, kebabCase } from 'lodash';
import { COLORS, FONTS, FONT_SIZES, MAX_LIST_DEPTH, defaultPreTagStyling } from './constants';
import { Map, OrderedSet } from 'immutable';
import { DefaultDraftInlineStyle, genKey } from 'draft-js';

/**
 * blockRenderMap, customStyleMap, customStyleFn & getBlockRendererFn are used by draft.js to convert its internal data structure
 * into html for display in the editor's content-editable area.
 */
export const blockRenderMap = {
  unstyled: {
    element: 'div',
  },
  // using section tag for paragraph block type because Draftjs inserts extra divs within the content, resulting in
  // a validateDOMNesting warning if p tag is used (<div> cannot be a descendant of <p>).
  // This is only used while content is displayed in the editor. When the paragraph block type
  // is exported to formLinker a <p> tag is used, as provided in the getStateToHtmlOptions function below.
  paragraph: {
    element: 'section',
  },
  // pasted-list-item is used for ul/ol lists that were pasted into the editor from another source, e.g. google docs
  // and thus are formatted differently than natively created lists
  'pasted-list-item': {
    element: 'ol',
  },
  table: {
    element: 'div',
  },
};

export const customStyleMap = (() => {
  const styleMap = { ...DefaultDraftInlineStyle };
  ['backgroundColor', 'color'].forEach(style => {
    COLORS.forEach(color => {
      styleMap[`${style}.${color}`] = { [style]: color };
    });
  });
  FONTS.forEach(font => {
    styleMap[`fontFamily.${font}`] = { fontFamily: font };
  });
  FONT_SIZES.forEach(size => {
    styleMap[`fontSize.${size}`] = { fontSize: `${size}pt` };
  });
  return styleMap;
})();

// this is for handling inline styles, including draft's default styles, styles from the customStyleMap, and those from the style attribute of the html
export const customStyleFn = style => {
  // "style" is an Immutable.js OrderedSet of inline styles for a given range of characters that share the same styling

  // handle draftjs default styles
  const defaultStyles = style.intersect(['BOLD', 'CODE', 'ITALIC', 'UNDERLINE']).reduce((map, v) => {
    return map.merge(customStyleMap[v]);
  }, Map());

  style = style.subtract(['BOLD', 'CODE', 'ITALIC', 'UNDERLINE']);

  // separate out any entries that are a string of multiple styles
  let groupedStyles = style.filter(v => v.includes(':'));
  style = style.subtract(groupedStyles);

  // convert string containing multiple styles to a CSS styles object
  groupedStyles = groupedStyles.reduce((map, v) => {
    v = convertStyleStringToObject(v);
    v = Map(v).mapKeys(k => camelCase(k));
    return map.merge(v);
  }, Map());

  // convert style strings with single style to CSS styles objects and merge with groupedStyles
  style = style
    .map(v => v.split('.'))
    .filter(v => v.every(vv => vv.length))
    .reduce((map, v) => {
      const key = v.shift().trim();
      const val = v.join('.').trim();
      return map.merge({ [key]: val });
    }, groupedStyles.merge(defaultStyles))
    .toJS();

  if (isEmpty(style)) {
    return null;
  }
  return style;
};

export const getBlockRendererFn = (editor, getEditorState, onChange) => block => {
  const type = block.getType();
  switch (type) {
    case 'atomic':
      return {
        component: Image,
        editable: false,
        props: {
          editor,
          getEditorState,
          onChange,
        },
      };
    case 'horizontal-rule':
      return {
        component: HorizontalRule,
      };
    case 'page-break':
      return {
        component: Pagebreak,
      };
    case 'pasted-list-item':
      return {
        component: ListItem,
        editable: true,
      };
    case 'unstyled':
    case 'paragraph':
    case 'header-one':
    case 'header-two':
    case 'header-three':
    case 'header-four':
    case 'header-five':
    case 'header-six':
    case 'code-block':
      return {
        component: StyledBlock,
        editable: true,
      };
    case 'table':
      return {
        component: Table,
        editable: true,
        props: {
          editor,
        },
      };
    default:
      return null;
  }
};

let tableKey;

/**
 * functions for converting html into draft.js data structure state
 */
export const stateFromHtmlOptions = {
  // collect block level metadata
  customBlockFn: element => {
    const style = element.getAttribute('style') || '';
    const className = element.getAttribute('class') || '';
    let data = convertStyleStringToObject(style) || {};
    data = className
      .split(' ')
      .filter(c => c.length)
      .reduce((map, c) => {
        const key = c.includes('depth') ? 'depth' : c;
        const val = key === 'depth' ? +c.slice(5) : 'class';
        map[key] = val;
        return map;
      }, data);
    // identify lists that were pasted in from another source rather than created natively in the editor. These get handled as a custom block type.
    if (
      element.tagName === 'LI' &&
      (element.parentNode.getAttribute('start') || element.style.listStyleType !== 'none') &&
      !element.className.split(' ').find(c => ['ordered-list-item', 'unordered-list-item'].includes(c))
    ) {
      const listType = element.parentNode.tagName === 'UL' ? 'ul' : 'ol';
      if (element.parentNode.firstElementChild === element) {
        data.listStyles = convertStyleStringToObject(element.parentNode.getAttribute('style') ?? 'margin-left: 36pt;');
        data.listStart =
          element.getAttribute('start') ?? element.parentNode.getAttribute('start') ?? (listType === 'ul' ? 0 : 1);
        let start = data.listStart;
        for (const child of element.parentNode.children) {
          if (listType === 'ul') {
            child.setAttribute('start', 0);
          } else {
            child.setAttribute('start', start++);
          }
        }
      } else {
        data.listStart = element.getAttribute('start');
      }
      data['list-style-type'] = element.style.listStyleType || (listType === 'ul' ? 'disc' : 'decimal');
      return { type: 'pasted-list-item', data };
    }

    if (element.firstChild && element.firstChild.tagName === 'IMG') {
      let style = element.firstChild.getAttribute('style');
      style = convertStyleStringToObject(style);
      data = {
        ...data,
        ...(style && { imgStyle: Map(style) }),
      };
      return { type: 'atomic', data }
    }
    if (element.tagName === 'PRE') {
      if (!data.background) {
        data = convertStyleStringToObject(defaultPreTagStyling.map(v => v.join(': ')).join('; '));
      }
      return { type: 'code-block', data };
    }
    if (/break-after:|break-before:/.test(element.style.cssText)) {
      return { type: 'page-break', data };
    }
    if (element.tagName === 'P') {
      const noMargin =
        element.style.margin?.startsWith('0') ||
        (element.style.marginTop?.startsWith('0') && element.style.marginBottom?.startsWith('0'));
      if (noMargin) return { type: 'unstyled', data };
      return { type: 'paragraph', data };
    }
    if ((element.innerText || '').startsWith('---hr---')) {
      return { type: 'horizontal-rule', data };
    }
    if (['TD', 'TH'].includes(element.tagName)) {
      /**
       * To preserve tables when converting html into Draft block types, we store the full
       * table specifications with the first "cell", and save the table position for the others
       */
      const tableEl = element.closest('table');
      const tHeadEl = element.closest('thead') ?? tableEl.querySelector('thead');
      const tBodyEl = element.closest('tbody') ?? tableEl.querySelector('tbody');
      const tableRows = tableEl.querySelectorAll('tr');
      // But if this table has a nested table within it
      // don't render the outer table or Draft-js will crash
      if (tableEl.querySelector('table')) {
        return { type: 'unstyled', data };
      }

      // empty elements get ignored and can break a table, replace unrendered characters,
      // ensure at minimum there is an non-breaking space
      if (isEmpty(element.textContent.replace(/\s/g, ''))) {
        element.innerHTML = '&nbsp;';
      }

      const prevCell = element.previousElementSibling;
      const row = element.parentNode;
      const prevRow = row.previousElementSibling;
      // Check if this is not the first cell in the table, if it's not then we traverse the table
      // structure just far enough to get the cell's position and store it in the data used to create
      // the corresponding Draft block
      if (prevCell || prevRow || (tHeadEl && [tableEl, tBodyEl].includes(row.parentNode))) {
        let found = false;
        for (let i = 0, rows = tableRows, rowCount = rows.length; i < rowCount; i++) {
          for (let j = 0, cells = rows[i].children, colCount = cells.length; j < colCount; j++) {
            if (cells[j] === element) {
              data.tableKey = tableKey;
              data.tablePosition = `${tableKey}-${i}-${j}`;
              data.colspan = cells[j].getAttribute('colspan');
              data.rowspan = cells[j].getAttribute('rowspan');
              found = true;
              break;
            }
          }
          if (found) {
            break;
          }
        }
        return { type: 'table', data };
      }
      // Only the first cell in the table will go through the processing below, so the Draft block
      // created for it will have all the necessary data to render the empty table structure into
      // which we render the rest of the table blocks.
      const colgroup = tableEl.querySelector('colgroup');
      const tableShape = [];
      tableKey = genKey();
      data.tableKey = tableKey;
      data.tablePosition = `${tableKey}-0-0`;
      data.tableStyle = convertStyleStringToObject(tableEl.getAttribute('style')) || {
        margin: '15px 0',
        width: '100%',
      };
      data.tableStyle['border-collapse'] = 'collapse';
      for (let i = 0, rows = tableRows, rowCount = rows.length; i < rowCount; i++) {
        tableShape.push([]);
        const defaultStyle = {};
        if (i === 0) {
          if (element.tagName === 'TH') {
            defaultStyle['background-color'] = 'rgba(240, 240, 240, 0.8)';
          }
          data.rowStyle = [convertStyleStringToObject(rows[i].getAttribute('style')) || defaultStyle];
        } else {
          data.rowStyle.push(convertStyleStringToObject(rows[i].getAttribute('style')) || defaultStyle);
        }
        for (let j = 0, cells = rows[i].children, colCount = cells.length; j < colCount; j++) {
          const defaultStyle = { border: '1px solid rgba(0, 0, 0, 0.2)', padding: '6px', 'text-align': 'center' };
          if (cells[j].tagName === 'TH') {
            defaultStyle['font-weight'] = 'bold';
          }
          const cellStyle = convertStyleStringToObject(cells[j].getAttribute('style')) || defaultStyle;
          tableShape[i][j] = {
            element: cells[j].tagName === 'TD' ? 'td' : 'th',
            style: cellStyle,
            colspan: cells[j].getAttribute('colspan'),
            rowspan: cells[j].getAttribute('rowspan'),
          };
        }
      }

      data.tableShape = tableShape;
      data.tableColgroup = colgroup?.outerHTML;
      return { type: 'table', data };
    }
    return { data };
  },

  // collect inline style data - inline type elements are passed through this function (span, img, a, etc.)
  customInlineFn: (element, { Style, Entity }) => {
    if (element.tagName === 'IMG') {
      // image styling is handled in the customBlockFn above
      return null;
    }
    if (element.tagName === 'A') {
      let data = {};
      if (element.hasAttribute('target')) {
        data = { target: element.getAttribute('target'), rel: 'noreferrer' };
      }
      return Entity('LINK', { ...data, url: element.getAttribute('href') });
    }
    let style = element.getAttribute('style');

    if (!style) {
      return null;
    }

    // if the element has multiple styles applied pass them all together as-is because the html import library's
    // "Style" function currently doesn't support processing multiple styles separately
    if (style.includes(';')) {
      return Style(style);
    }
    // otherwise format the style to match the customStyleMap
    style = style.split(':');
    const key = camelCase(style.shift().trim());
    const val = style.join(':').trim();
    style = `${key}.${val}`;
    if (style === 'textDecoration.underline') {
      return null;
    } // underline is handled automatically, don't override it
    return Style(style);
  },
};

// helper function converts style attribute string into key-value pairs
function convertStyleStringToObject(style = '', data = {}) {
  if (!style) {
    return null;
  }
  return style
    .split(';')
    .filter(s => s.includes(':'))
    .map(s => s.split(':'))
    .reduce((map, s) => {
      const key = s.shift().trim();
      const val = s.join(':').trim();
      map[key] = val;
      return map;
    }, data);
}

/**
 * function receives contentState from a draft.js instance and returns a set of helper functions
 * used to convert draft.js internal state into html for export outside of draft.js.
 */
export const getStateToHtmlOptions = contentState => ({
  /**
   * NOTE: the rich text editor relies on the following styles for ordered lists. For ordered list numbering to display correctly
   * these styles should be included in the style tag or style sheet of any document that includes content from the rich text editor:
   * .ordered-list-item:before { left: -36px; position: absolute; text-align: right; width: 30px; }
   * .ordered-list-item:before { content: counter(ol0) ". "; counter-increment: ol0; }
   * .ordered-list-item.depth1:before { content: counter(ol1, lower-alpha) ") "; counter-increment: ol1; }
   * .ordered-list-item.depth2:before { content: counter(ol2, lower-roman) ". "; counter-increment: ol2; }
   * .ordered-list-item.depth3:before { content: counter(ol3, upper-alpha) ". "; counter-increment: ol3; }
   * .ordered-list-item.depth4:before { content: counter(ol4) ". "; counter-increment: ol4; }
   * .list.depth0:first-of-type { counter-reset: ol0; }
   * .list.depth1:first-of-type { counter-reset: ol1; }
   * .list.depth2:first-of-type { counter-reset: ol2; }
   * .list.depth3:first-of-type { counter-reset: ol3; }
   * .list.depth4:first-of-type { counter-reset: ol4; }
   **/
  inlineStyles: (() => {
    const styles = {
      BOLD: { style: { fontWeight: 'bold' } },
      ITALIC: { style: { fontStyle: 'italic' } },
      UNDERLINE: { style: { textDecoration: 'underline' } },
      STRIKETHROUGH: { style: { textDecoration: 'line-through' } },
    };
    ['backgroundColor', 'color'].forEach(style => {
      COLORS.forEach(color => {
        styles[`${style}.${color}`] = { style: { [style]: color } };
      });
    });
    FONTS.forEach(font => {
      styles[`fontFamily.${font}`] = { style: { fontFamily: font } };
    });
    FONT_SIZES.forEach(size => {
      styles[`fontSize.${size}`] = { style: { fontSize: `${size}pt` } };
    });
    return styles;
  })(),

  // this handles converting any inline styles not matched by the inlineStyles map above (custom added styles)
  inlineStyleFn: style => {
    style = customStyleFn(style);
    return (
      style && {
        element: 'span',
        style,
      }
    );
  },

  // Converting (rendering) custom block types, like "paragraph" and "horizontal-rule" to html is handled here
  blockRenderers: {
    'code-block': block => {
      const blockStyles = OrderedSet(defaultPreTagStyling.map(v => v.join(': ')));
      return `<pre${getClassesAndStyles({ block, blockStyles })}>${buildHtmlForBlockText(
        '',
        block,
        contentState
      )}</pre>`;
    },
    'page-break': block => {
      return '<div style="page-break-after: always"><br></div>';
    },
    // each draft.js block of type "paragraph" is passed through this function for export as html
    paragraph: block => {
      if (block.getLength() === 0) {
        return `<p${getClassesAndStyles({ block })}><br></p>`;
      }
      // get block-level styling and classes if any
      // "result" will be the html eventually returned from this function
      const result = `<p${getClassesAndStyles({ block })}>${buildHtmlForBlockText('', block, contentState)}</p>`;
      return result;
    },
    unstyled: block => {
      if (block.getLength() === 0) {
        return `<div${getClassesAndStyles({ block })}><br></div>`;
      }
      // get block-level styling and classes if any
      // "result" will be the html eventually returned from this function
      const result = `<div${getClassesAndStyles({ block })}>${buildHtmlForBlockText('', block, contentState)}</div>`;
      return result;
    },
    'horizontal-rule': block => {
      return '<hr>';
    },
    atomic: block => {
      const data = block.getData();
      let figStyle = [];
      let imgStyle = [];
      let classes = [];
      data.forEach((v, k) => {
        if (v === 'class') {
          classes.push(k);
        } else if (k === 'imgStyle') {
          // styles on img tag are saved under the key imgStyle
          v.forEach((vv, kk) => imgStyle.push(`${kk}: ${vv}`));
        } else {
          figStyle.push(`${k}: ${v}`);
        }
      });
      const float = data.get('float');
      if (float && !data.get('margin')) {
        figStyle.push(float === 'right' ? 'margin: 0 8px 0 0' : 'margin: 0 0 0 8px');
      }
      if (block.get('depth')) {
        figStyle.push(`margin-left: ${block.get('depth') * 2.5}em; `);
      }
      classes = classes.join(' ') && ` class="${classes.join(' ')}"`;
      figStyle = figStyle.join('; ') && ` style="${figStyle.join('; ')}"`;
      imgStyle = ` style="${imgStyle.join('; ')}"`;

      const { src } = (block.getEntityAt(0) && contentState.getEntity(block.getEntityAt(0)).getData()) || {};
      return `<figure${classes}${figStyle}><img src="${src}"${imgStyle}/></figure>`;
    },
    'pasted-list-item': block => {
      const prevBlock = contentState.getBlockBefore(block.getKey());
      if (prevBlock?.getType() === block.getType()) {
        return '';
      }
      const data = block.getData();
      let start = data.get('listStart');
      start = (start && ` start="${start}"`) || '';
      let listStyles = Map(data.get('listStyles'))
        .reduce((set, v, k) => {
          return set.add(`${k}: ${v}`);
        }, OrderedSet())
        .toArray()
        .join('; ');
      listStyles = listStyles && ` style="${listStyles}"`;
      const listItems = contentState
        .getBlockMap()
        .skipUntil(v => v === block)
        .takeWhile(v => v.getType().endsWith('list-item'))
        .toList();
      const listTag = block.getData().get('listStart') > 0 ? 'ol' : 'ul';
      let currentDepth = block.getDepth();
      return `<${listTag}${listStyles}${start}>${listItems
        .map(block => {
          const depth = block.getDepth();
          const openTag = depth > currentDepth ? `<${listTag}><li` : depth < currentDepth ? `</${listTag}><li` : '<li';
          currentDepth = depth;
          return `
${openTag}${getClassesAndStyles({ block })}>${buildHtmlForBlockText('', block, contentState)}</li>`;
        })
        .toArray()
        .join('')}</${listTag}>`;
    },
    table: block => {
      const prevBlock = contentState.getBlockBefore(block.getKey());
      if (prevBlock && prevBlock.getType() === 'table') {
        return '';
      }
      const data = block.getData();
      const tableShape = data.get('tableShape');
      if (!tableShape) {
        return '<table><tbody><tr><td>&nbsp;</td></tr></tbody></table>';
      }
      let tableStyle = Map(data.get('tableStyle'))
        .reduce((set, v, k) => {
          return set.add(`${k}: ${v}`);
        }, OrderedSet())
        .toArray()
        .join('; ');
      tableStyle = tableStyle && ` style="${tableStyle}"`;
      const tableKey = data.get('tableKey');
      const tableBlocks = contentState
        .getBlockMap()
        .skipUntil(v => v.getType() === 'table' && v.getData().get('tableKey') === tableKey)
        .takeWhile(v => v.getType() === 'table')
        .toList();
      const colgroup = data.get('tableColgroup') ?? '';
      let cellCounter = 0;
      return `<table${tableStyle}>${colgroup}<tbody>${tableShape
        .map((row, i) => {
          let rowStyle = Map(block.getData().get('rowStyle')[i])
            .reduce((set, v, k) => {
              return set.add(`${k}: ${v}`);
            }, OrderedSet())
            .toArray()
            .join('; ');
          rowStyle = rowStyle && ` style="${rowStyle}"`;
          return `<tr${rowStyle}>${row
            .map((cell, j) => {
              const tag = cell.element;
              let cellStyle = Map(cell.style)
                .reduce((set, v, k) => {
                  return set.add(`${k}: ${v}`);
                }, OrderedSet())
                .toArray()
                .join('; ');
              cellStyle = cellStyle && ` style="${cellStyle}"`;
              let cellBlock = tableBlocks.get(cellCounter);
              let colspan = cellBlock.getData().get('colspan');
              colspan = colspan ? ` colspan=${colspan}` : '';
              let rowspan = cellBlock.getData().get('rowspan');
              rowspan = rowspan ? ` rowspan=${rowspan}` : '';

              const [, rowNum, colNum] = cellBlock?.getData().get('tablePosition').split('-') ?? [];
              if (i !== +rowNum || j !== +colNum) {
                cellBlock = null;
              } else {
                cellCounter++;
              }
              return `<${tag}${cellStyle}${colspan}${rowspan}>${buildHtmlForBlockText(
                '',
                cellBlock,
                contentState
              )}</${tag}>`;
            })
            .join('')}</tr>`;
        })
        .join('')}</tbody></table>`;
    },
  },

  blockStyleFn: block => {
    const type = block.getType();
    const depth = block.getDepth();
    const data = block.getData();
    const attributes = {};
    let styles = OrderedSet();
    let classes = OrderedSet();

    data.forEach((v, k) => {
      if (v === 'class') {
        classes = classes.add(k);
      } else if (!['depth', 'listStyles', 'listStart'].includes(k)) {
        styles = styles.add(`${k}: ${v}`);
      }
    });

    if (depth > 0 && !type.includes('list-item')) {
      styles = styles.add(`margin-left:${2.5 * depth}em`);
    } else if (type.includes('unordered-list-item') && depth <= MAX_LIST_DEPTH) {
      classes.remove('ordered-list-item');
      classes = OrderedSet.of('list', 'unordered-list-item', `depth${depth}`).union(classes);
      styles = OrderedSet.of(
        `margin-left:${1.5 + (depth === 0 ? 1 : 0)}em`,
        `list-style-type: ${depth === 0 ? 'disc' : depth === 1 ? 'circle' : 'square'}`,
        'position: relative'
      ).union(styles);
    } else if (type.includes('ordered-list-item') && depth <= MAX_LIST_DEPTH) {
      classes.remove('unordered-list-item');
      classes = OrderedSet.of('list', 'ordered-list-item', `depth${depth}`).union(classes);
      styles = OrderedSet.of(
        `margin-left: ${1.5 + (depth === 0 ? 1 : 0)}em`,
        'list-style-type: none',
        'position: relative'
      ).union(styles);
    }

    if (type === 'blockquote')
      styles = styles.add(
        "color: #999999; font-family: 'Hoefler Text', Georgia, serif; font-style: italic; line-height: 1.15em; border: none; border-left: 5px solid rgba(100, 100, 100, 0.5); margin: 0 2em; padding-left: 1em;"
      );
    if (classes.size) attributes.class = classes.toArray().join(' ');
    if (styles.size) attributes.style = styles.toArray().join(';');
    return { attributes };
  },

  defaultBlockTag: 'div',

  entityStyleFn: entity => {
    const entityType = entity.get('type').toLowerCase();
    if (entityType === 'video') {
      const { src } = entity.getData();
      return {
        element: 'video',
        attributes: {
          src: src,
        },
      };
    }
  },
});

function getClassesAndStyles({ block, blockStyles = OrderedSet(), classes = OrderedSet() }) {
  const data = block.getData();
  data
    .filter((v, k) => !['depth', 'listStyles', 'listStart'].includes(k))
    .forEach((v, k) => {
      if (v === 'class') {
        classes = classes.add(k);
      } else {
        blockStyles = blockStyles.add(`${k}: ${v}`);
      }
    });
  const margin = block.get('depth');
  if (margin) {
    blockStyles = OrderedSet.of([`margin-left: ${margin * 2.5}em`]).union(blockStyles);
  }
  // convert classes & styles to strings and return
  classes = (classes.size && ` class="${classes.toArray().join(' ')}"`) || '';
  blockStyles = (blockStyles.size && ` style="${blockStyles.toArray().join('; ')}"`) || '';
  return `${classes}${blockStyles}`;
}

function buildHtmlForBlockText(result, block, contentState) {
  if (!block) {
    return '<span>&nbsp;</span>';
  }
  // now build the html for all inline styles for each "styleRange" in the block. A styleRange is
  // any sequence in the block where the characters share the same inline styling.
  block.findStyleRanges(
    () => true,
    (s, e) => {
      let close = '';
      let styles = block.getInlineStyleAt(s);
      styles = Map(customStyleFn(styles))
        .reduce((styleSet, v, k) => {
          k = kebabCase(k);
          if (k === 'font-size' && /^\d*$/.test(v)) v += 'pt';
          return styleSet.add(`${k}: ${v}`);
        }, OrderedSet())
        .toArray()
        .join('; ');

      styles = styles ? ` style="${styles}"` : '';
      // If a styleRange overlaps with an "entity" that starts and ends at the same points in the block
      // the entity represents an embeded link
      const startKey = block.getEntityAt(s);
      const endKey = block.getEntityAt(e - 1);
      const entity = startKey && startKey === endKey ? contentState.getEntity(startKey) : null;

      if (styles) {
        result += `<span${styles}>`;
        close = '</span>' + close;
      }
      // Now add the text content of the block for the current styleRange. If a "link" entity exists for this range
      // then wrap the text content in an anchor tag and add the href.
      // The multiple "replace" calls prevent empty paragraphs and extra spaces from collapsing and failing to render.
      const textContent = block
        .getText()
        .slice(s, e)
        .replace(/\n/g, '<br>')
        .replace(/\s{2,}?/g, '&nbsp;&nbsp;')
        .replace(/^\s$/g, '&nbsp;');
      if (entity && entity.get('type') === 'LINK') {
        const { url, target } = entity.getData();
        result += `<a href="${url}" ${target ? `target="${target}" rel="noreferrer"` : ''}>${textContent}</a>`;
      } else {
        result += textContent;
      }
      result += close;
    }
  );
  return result;
}
