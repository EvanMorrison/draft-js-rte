import React from "react"; // eslint-disable-line no-unused-vars
import { Image, HorizontalRule, StyledBlock, Table } from "./blockRenderComponents";
import { camelCase, isEmpty, isNil, kebabCase } from "lodash";
import { COLORS, FONTS, FONT_SIZES, MAX_LIST_DEPTH } from "./constants";
import { Map, OrderedSet } from "immutable";
import { genKey } from "draft-js";

/**
 * blockRenderMap, customStyleMap, customStyleFn & getBlockRendererFn are used by draft.js to convert its internal data structure
 * into html for display in the editor's content-editable area.
 */
export const blockRenderMap = {
  "unstyled": {
    element: "div",
  },
  // using section tag for paragraph block type because Draftjs inserts extra divs within the content, resulting in
  // a validateDOMNesting warning if p tag is used (<div> cannot be a descendant of <p>).
  // This is only used while content is displayed in the editor. When the paragraph block type
  // is exported to formLinker a <p> tag is used, as provided in the getStateToHtmlOptions function below.
  "paragraph": {
    element: "section",
  },
  "table": {
    element: "div",
  },
};

export const customStyleMap = (() => {
  let styleMap = {"STRIKETHROUGH": {textDecoration: "line-through"}};
  ["backgroundColor", "color"].forEach((style) => {
    COLORS.forEach((color) => {
      styleMap[`${style}.${color}`] = {[style]: color};
    });
  });
  FONTS.forEach((font) => {
    styleMap[`fontFamily.${font}`] = {fontFamily: font};
  });
  FONT_SIZES.forEach((size) => {
    styleMap[`fontSize.${size}`] = {fontSize: `${size}pt`};
  });
  return styleMap;
})();

// this is for handling styles not matched by the defaultStyleMap or customStyleMap
export const customStyleFn = style => { // "style" is an Immutable.js OrderedSet of inline styles for a given range of characters that share the same styling
  // exclude styles matched by the defaut or customStyleMap
  style = style
    .subtract(["BOLD", "CODE", "ITALIC", "UNDERLINE"])
    .filter(v => isNil(customStyleMap[v]));

  // separate out any entries that are a string of multiple styles
  let groupedStyles = style.filter(v => v.includes(";"));
  style = style.subtract(groupedStyles);

  // convert string containing multiple styles to a CSS styles object
  groupedStyles = groupedStyles
    .reduce((map, v) => {
      v = convertStyleStringToObject(v);
      v = Map(v).mapKeys(k => camelCase(k));
      return(map.merge(v));
    }, Map());

  // convert style strings with single style to CSS styles objects and merge with groupedStyles
  style = style
    .map(v => v.split("."))
    .filter(v => v.every(vv => vv.length))
    .reduce((map, v) => {
      let key = v.shift().trim();
      let val = v.join(".").trim();
      return(map.merge({[key]: val}));
    }, groupedStyles).toJS();

  if(isEmpty(style)) { return(null); }
  return(style);
};

export const getBlockRendererFn = (editor, getEditorState, onChange) => (block) => {
  const type = block.getType();
  switch(type) {
    case "atomic":
      return{
        component: Image,
        editable: false,
        props: {
          editor,
          getEditorState,
          onChange
        }
      };
    case "horizontal-rule":
      return{
        component: HorizontalRule,
      };
    case "unstyled":
    case "paragraph":
    case "header-one":
    case "header-two":
    case "header-three":
    case "header-four":
    case "header-five":
    case "header-six":
      return{
        component: StyledBlock,
        editable: true,
      };
    case "table":
      return{
        component: Table,
        editable: true,
        props: {
          editor,
        }
      };
    default:
      return(null);
  }
};

let tableKey;

/**
 * functions for converting html into draft.js data structure state
 */
export const stateFromHtmlOptions = {
  // collect block level metadata
  customBlockFn: element => {
    let style = element.getAttribute("style") || "";
    let className = element.getAttribute("class") || "";
    let data = convertStyleStringToObject(style) || {};
    data = className.split(" ")
      .filter(c => c.length)
      .reduce((map, c) => {
        let key = (c.includes("depth")) ? "depth" : c;
        let val = key === "depth" ? +c.slice(5) : "class";
        map[key] = val;
        return(map);
      }, data);
    if(element.tagName === "FIGURE" && element.firstChild && element.firstChild.tagName === "IMG") {
      let style = element.firstChild.getAttribute("style");
      style = convertStyleStringToObject(style);
      data = {
        ...data,
        ...style && {imgStyle: Map(style)},
      };
    }
    if(element.tagName === "P") {
      return({type: "paragraph", data});
    }
    if((element.innerText || "").startsWith("---hr---")) {
      return({type: "horizontal-rule", data});
    }
    if(["TD", "TH"].includes(element.tagName)) {
      // empty elements get ignored and can break a table, replace unrendered characters
      if(isEmpty(element.textContent.replace(/\n|\s/g, ""))) {
        element.innerHTML = element.innerHTML.replace(/\n|<br>|<br\/>/g, "<br>").replace(/\s/g, "&nbsp;");
      }
      /**
       * To preserve tables when converting html into Draft block types, we store the full
       * table specifications with the first "cell", and save the table position for the others
       */
      const tableEl = element.closest("table");
      const prevCell = element.previousElementSibling;
      const row = element.parentNode;
      const prevRow = row.previousElementSibling;
      // Check if this is not the first cell in the table, if it's not then we traverse the table
      // structure just far enough to get the cell's position and store it in the data used to create
      // the corresponding Draft block
      if(prevCell || prevRow) {
        let found = false;
        for(let i = 0, rows = tableEl.querySelectorAll("tr"), rowCount = rows.length; i < rowCount; i++) {
          for(let j = 0, cells = rows[i].children, colCount = cells.length; j < colCount; j++) {
            if(cells[j] === element) {
              data.tableKey = tableKey;
              data.tablePosition = `${tableKey}-${i}-${j}`;
              found = true;
              break;
            }
          }
          if(found) { break; }
        }
        return({type: "table", data});
      }
      // Only the first cell in the table will go through the processing below, so the Draft block
      // created for it will have all the necessary data to render the empty table structure into
      // which we render the rest of the table blocks.
      const tableShape = [];
      tableKey = genKey();
      data.tableKey = tableKey;
      data.tablePosition = `${tableKey}-0-0`;
      data.tableStyle = convertStyleStringToObject(tableEl.getAttribute("style")) || {"border-collapse": "collapse", margin: "15px 0", width: "100%"};
      for(let i = 0, rows = tableEl.querySelectorAll("tr"), rowCount = rows.length; i < rowCount; i++) {
        tableShape.push([]);
        let defaultStyle = {};
        if(i === 0) {
          if(element.tagName === "TH") {
            defaultStyle["background-color"] = "rgba(240, 240, 240, 0.8)";
          }
          data.rowStyle = [convertStyleStringToObject(rows[i].getAttribute("style")) || defaultStyle];
        } else {
          data.rowStyle.push(convertStyleStringToObject(rows[i].getAttribute("style")) || defaultStyle);
        }
        for(let j = 0, cells = rows[i].children, colCount = cells.length; j < colCount; j++) {
          let defaultStyle = {border: "1px solid rgba(0, 0, 0, 0.2)", padding: "6px", "text-align": "center"};
          if(cells[j].tagName === "TH") {
            defaultStyle["font-weight"] = "bold";
          }
          let cellStyle = convertStyleStringToObject(cells[j].getAttribute("style")) || defaultStyle;
          tableShape[i][j] = {
            element: cells[j].tagName === "TD" ? "td" : "th",
            style: cellStyle
          };
        }
      }
      data.tableShape = tableShape;
      return({type: "table", data});
    }
    return{data};
  },

  // collect inline style data - inline type elements are passed through this function (span, img, a, etc.)
  customInlineFn: (element, {Style, Entity}) => {
    if(element.tagName === "IMG") { // image styling is handled in the customBlockFn above
      return(null);
    }
    if(element.tagName === "A") {
      return(Entity("LINK", {url: element.getAttribute("href")}));
    }
    let style = element.getAttribute("style");

    if(!style) { return(null); }

    // if the element has multiple styles applied pass them all together as-is because the html import library's
    // "Style" function currently doesn't support processing multiple styles separately
    if(style.includes(";")) {
      return(Style(style));
    }
    // otherwise format the style to match the customStyleMap
    style = style.split(":");
    let key = camelCase(style.shift().trim());
    let val = style.join(":").trim();
    style = `${key}.${val}`;
    if(style === "textDecoration.underline") { return(null); } // underline is handled automatically, don't override it
    return(Style(style));
  }
};

// helper function converts style attribute string into key-value pairs
function convertStyleStringToObject(style = "", data = {}) {
  if(!style) { return(null); }
  return(
    style.split(";")
      .filter(s => s.includes(":"))
      .map(s => s.split(":"))
      .reduce((map, s) => {
        let key = s.shift().trim();
        let val = s.join(":").trim();
        map[key] = val;
        return(map);
      }, data)
  );
}

/**
 * function receives contentState from a draft.js instance and returns a set of helper functions
 * used to convert draft.js internal state into html for export outside of draft.js.
 */
export const getStateToHtmlOptions = (contentState) => ({
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
    let styles = {
      BOLD: {element: "strong"},
      ITALIC: {element: "em"},
      UNDERLINE: {style: {textDecoration: "underline"}},
      STRIKETHROUGH: {style: {textDecoration: "line-through"}}
    };
    ["backgroundColor", "color"].forEach((style) => {
      COLORS.forEach((color) => {
        styles[`${style}.${color}`] = {style: {[style]: color}};
      });
    });
    FONTS.forEach((font) => {
      styles[`fontFamily.${font}`] = {style: {fontFamily: font}};
    });
    FONT_SIZES.forEach((size) => {
      styles[`fontSize.${size}`] = {style: {fontSize: `${size}pt`}};
    });
    return styles;
  })(),

  // this handles converting any inline styles not matched by the inlineStyles map above (custom added styles)
  inlineStyleFn: style => {
    style = customStyleFn(style);
    return(style && {
      element: "span",
      style
    });
  },

  // Converting (rendering) custom block types, like "paragraph" and "horizontal-rule" to html is handled here
  blockRenderers: {
    // each draft.js block of type "paragraph" is passed through this function for export as html
    paragraph: block => {
      if(block.getLength() === 0) {
        return("<p><br></p>");
      }
      // get block-level styling and classes if any
      const data = block.getData();
      let blockStyles = [];
      let classes = [];
      data.forEach((v, k) => {
        if(v === "class") {
          classes.push(k);
        } else {
          blockStyles.push(`${k}: ${v}`);
        }
      });
      const margin = block.get("depth");
      if(margin) {
        blockStyles.push(`margin-left: ${margin * 2.5}em`);
      }
      // convert arrays to either empty strings (if arrays are empty) or strings of class name and style attributes respectively
      classes = classes.join(" ") && ` class="${classes.join(" ")}"`;
      blockStyles = blockStyles.join("; ") && ` style="${blockStyles.join("; ")}"`;
      // "result" will be the html eventually returned from this function
      let result = `<p${classes}${blockStyles}>${buildHtmlForBlockText("", block, contentState)}</p>`;
      return(result);
    },
    "horizontal-rule": block => {
      return("<hr>");
    },
    atomic: block => {
      const data = block.getData();
      let figStyle = [];
      let imgStyle = [];
      let classes = [];
      data.forEach((v, k) => {
        if(v === "class") {
          classes.push(k);
        } else if(k === "imgStyle") { // styles on img tag are saved under the key imgStyle
          v.forEach((vv, kk) => imgStyle.push(`${kk}: ${vv}`));
        } else {
          figStyle.push(`${k}: ${v}`);
        }
      });
      let float = data.get("float");
      if(float && !data.get("margin")) {
        figStyle.push(float === "right" ? "margin: 0 8px 0 0" : "margin: 0 0 0 8px");
      }
      if(block.get("depth")) {
        figStyle.push(`margin-left: ${block.get("depth") * 2.5}em; `);
      }
      classes = classes.join(" ") && ` class="${classes.join(" ")}"`;
      figStyle = figStyle.join("; ") && ` style="${figStyle.join("; ")}"`;
      imgStyle = ` style="${imgStyle.join("; ")}"`;

      const {src} = (block.getEntityAt(0) && contentState.getEntity(block.getEntityAt(0)).getData()) || {};
      return(
        `<figure${classes}${figStyle}><img src="${src}"${imgStyle}/></figure>`
      );
    },
    table: block => {
      const prevBlock = contentState.getBlockBefore(block.getKey());
      if(prevBlock && prevBlock.getType() === "table") {
        return("");
      }
      let data = block.getData();
      let tableShape = data.get("tableShape");
      if(!tableShape) {
        return("<table><tbody><tr><td>&nbsp;</td></tr></tbody></table>");
      }
      let tableStyle = Map(data.get("tableStyle"))
        .reduce((set, v, k) => {
          return(set.add(`${k}: ${v}`));
        }, OrderedSet())
        .toArray()
        .join("; ");
      tableStyle = tableStyle && ` style="${tableStyle}"`;
      const tableKey = data.get("tableKey");
      let tableBlocks = contentState
        .getBlockMap()
        .skipUntil(v => v.getType() === "table" && v.getData().get("tableKey") === tableKey)
        .takeWhile(v => v.getType() === "table")
        .toList();

      return(`<table${tableStyle}><tbody>${tableShape.map((row, i) => {
        let rowStyle = Map(block.getData().get("rowStyle")[i])
          .reduce((set, v, k) => {
            return(set.add(`${k}: ${v}`));
          }, OrderedSet())
          .toArray()
          .join("; ");
        rowStyle = rowStyle && ` style="${rowStyle}"`;
        return(
          `<tr${rowStyle}>${row.map((cell, j) => {
            let tag = cell.element;
            let cellStyle = Map(cell.style)
              .reduce((set, v, k) => {
                return(set.add(`${k}: ${v}`));
              }, OrderedSet())
              .toArray()
              .join("; ");
            cellStyle = cellStyle && ` style="${cellStyle}"`;
            return(`<${tag}${cellStyle}>${buildHtmlForBlockText("", tableBlocks.get(i * row.length + j), contentState)}</${tag}>`);
          }).join("")}</tr>`
        );
      }).join("")}</tbody></table>`);
    }
  },

  blockStyleFn: block => {
    const type = block.getType();
    const depth = block.getDepth();
    const data = block.getData();
    let attributes = {};
    let styles = [];
    let classes = [];
    if(depth > 0 && !type.includes("list-item")) {
      styles.push(`margin-left:${2.5 * depth}em`);
    } else if(type.includes("unordered-list-item") && depth <= MAX_LIST_DEPTH) {
      classes.push(`list unordered-list-item depth${depth}`);
      styles.push(`margin-left:${1.5 + (depth === 0 ? 1 : 0)}em; list-style-type: ${(depth === 0 ? "disc" : depth === 1 ? "circle" : "square")}; position: relative`);
    } else if(type.includes("ordered-list-item") && depth <= MAX_LIST_DEPTH) {
      classes.push(`list ordered-list-item depth${depth}`);
      styles.push(`margin-left:${1.5 + (depth === 0 ? 1 : 0)}em; list-style-type: none; position: relative`);
    }
    data.forEach((v, k) => {
      if(v === "class") {
        classes.push(k);
      } else {
        styles.push(`${k}: ${v}`);
      }
    });
    if(type === "blockquote") styles.push("color: #999999; font-family: 'Hoefler Text', Georgia, serif; font-style: italic; line-height: 1.15em; border-left: 5px solid rgba(100, 100, 100, 0.5); margin: 0 2em; padding-left: 1em;");
    if(type === "code-block") styles.push("font-size:1em");
    if(classes.length) attributes["class"] = classes.join(" ");
    if(styles.length) attributes["style"] = styles.join(";");
    return{attributes};
  },

  defaultBlockTag: "div",

  entityStyleFn: (entity) => {
    const entityType = entity.get("type").toLowerCase();
    if(entityType === "video") {
      const {src} = entity.getData();
      return({
        element: "video",
        attributes: {
          src: src
        }
      });
    }
  }
});

function buildHtmlForBlockText(result, block, contentState) {
  if(!block) {
    return("<span>&nbsp;</span>");
  }
  // now build the html for all inline styles for each "styleRange" in the block. A styleRange is
  // any sequence in the block where the characters share the same inline styling.
  block.findStyleRanges(() => true, (s, e) => {
    let close = "";
    let styles = block.getInlineStyleAt(s);
    // separate out styles handled by the default or customStyleMap so they aren't lost in the customStyleFn
    let defaultStyles = styles.intersect(["BOLD", "CODE", "ITALIC", "UNDERLINE"]);
    defaultStyles = defaultStyles.union(
      styles.filter(v => !isNil(customStyleMap[v]))
    );
    // the remaining styles can be processed by customStyleFn
    styles = Map(customStyleFn(styles))
      .reduce((set, v, k) => {
        return(set.add(`${k}${(v ? `.${v}` : "")}`));
      }, OrderedSet());
    // now recombine the default and custom styles
    styles = defaultStyles.union(styles);

    // If a styleRange overlaps with an "entity" that starts and ends at the same points in the block
    // the entity represents an embeded link
    const startKey = block.getEntityAt(s);
    const endKey = block.getEntityAt(e - 1);
    const entity = startKey && startKey === endKey ? contentState.getEntity(startKey) : null;
    styles.forEach(style => {
      switch(style.split(".")[0]) {
        case "ITALIC":
          result += "<em>";
          close = "</em>" + close;
          break;
        case "BOLD":
          result += "<strong>";
          close = "</strong>" + close;
          break;
        case "UNDERLINE":
          result += "<u style='text-decoration: underline'>";
          close = "</u>" + close;
          break;
        default:
          let arr = style.split(".");
          let key = kebabCase(arr.shift());
          let val = arr.join(".");
          if(key === "font-size" && /^\d*$/.test(val)) {
            val += "pt";
          }
          result += `<span style='${key}:${val}'>`;
          close = "</span>" + close;
      }
    });
    // Now add the text content of the block for the current styleRange. If a "link" entity exists for this range
    // then wrap the text content in an anchor tag and add the href.
    // The multiple "replace" calls prevent empty paragraphs and extra spaces from collapsing and failing to render.
    const textContent = block.getText().slice(s, e).replace(/\n/g, "<br>").replace(/\s{2,}?/g, "&nbsp;&nbsp;").replace(/^\s$/g, "&nbsp;");
    if(entity && entity.get("type") === "LINK") {
      const {url} = entity.getData();
      result += `<a href='${url}'>${textContent}</a>`;
    } else {
      result += textContent;
    }
    result += close;
  });
  return(result);
}