export const MAX_INDENT_DEPTH = 20;
export const MAX_LIST_DEPTH = 4;
export const COLORS = [
  '#000000',
  '#FFFFFF',
  '#888888',
  '#AAAAAA',
  '#EEEEEE',
  '#880000',
  '#CC0000',
  '#FF0000',
  '#FFCCCC',
  '#FF8800',
  '#FFCC00',
  '#FFFF00',
  '#CCFF00',
  '#88FF00',
  '#008800',
  '#00CC00',
  '#00CC88',
  '#00CCCC',
  '#CCEEFF',
  '#00CCFF',
  '#0088FF',
  '#0000FF',
  '#8800FF',
  '#CC00CC',
  '#CC0088',
];
export const FONTS = [
  'Arial',
  'Arial Black',
  'Comic Sans MS',
  'Courier New',
  'Helvetica Neue',
  'Helvetica',
  'Impact',
  'Lucida Grande',
  'Tahoma',
  'Times New Roman',
  'Verdana',
];
export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 18, 24, 36];

export const defaultPreTagStyling = [
  ['padding', '9.5px'],
  ['margin', '0 0 10px'],
  ['border', '1px solid rgb(204, 204, 204)'],
  ['background', 'rgb(245, 245, 245)'],
];

export const availableAlignments = [
  { type: 'left', display: { icon: 'align-left-sld' } },
  { type: 'center', display: { icon: 'align-center-sld' } },
  { type: 'right', display: { icon: 'align-right-sld' } },
  { type: 'justify', display: { icon: 'align-justify-sld' } },
];

export const availableBlockTypes = [
  { type: 'unstyled', display: { name: 'normal' }, tag: 'div' },
  { type: 'paragraph', display: { name: 'paragraph' }, tag: 'p' },
  { type: 'unordered-list-item', display: { name: ' bullet list', style: { fontSize: '14px' }, icon: 'list-ul-sld' } },
  { type: 'ordered-list-item', display: { name: ' number list', style: { fontSize: '14px' }, icon: 'list-ol-sld' } },
  {
    type: 'horizontal-rule',
    display: { name: 'h-rule', style: { fontSize: '14px' } },
    tag: 'hr',
  },
  {
    type: 'page-break',
    display: { name: 'page-break', style: { fontSize: '14px' } },
    tag: 'div',
  },
  { type: 'header-one', display: { name: 'H1', style: { fontSize: '26px', fontWeight: '700' } }, tag: 'h1' },
  { type: 'header-two', display: { name: 'H2', style: { fontSize: '24px', fontWeight: '700' } }, tag: 'h2' },
  { type: 'header-three', display: { name: 'H3', style: { fontSize: '18.72px', fontWeight: '700' } }, tag: 'h3' },
  { type: 'header-four', display: { name: 'H4', style: { fontSize: '16px', fontWeight: '700' } }, tag: 'h4' },
  { type: 'header-five', display: { name: 'H5', style: { fontSize: '13.3', fontWeight: '700' } }, tag: 'h5' },
  { type: 'header-six', display: { name: 'H6', style: { fontSize: '12px', fontWeight: '700' } }, tag: 'h6' },
  {
    type: 'blockquote',
    display: { name: 'blockquote', style: { fontFamily: "'Hoefler Text', Georgia, serif", fontStyle: 'italic' } },
    tag: 'blockquote',
  },
  { type: 'code-block', display: { name: 'monospace', style: { fontFamily: 'monospace' } }, tag: 'pre' },
];

export const availableColors = (() => {
  const availableColors = [];
  ['color', 'backgroundColor'].forEach(style => {
    COLORS.forEach(color => {
      availableColors.push({ type: `${style}.${color}`, display: { name: color } });
    });
  });
  return availableColors;
})();

export const availableFonts = (() => {
  return FONTS.map(font => {
    return { type: `fontFamily.${font}`, display: { name: font, style: { fontFamily: font } } };
  });
})();

export const availableFontSizes = (() => {
  return FONT_SIZES.map(size => {
    return { type: `fontSize.${size}`, display: { name: size } };
  });
})();

const dropdownControls = {
  alignment: {
    activeOption: (alignment = 'left') => availableAlignments.find(a => a.type === alignment),
    controlWidth: 40,
    dropdownWidth: 40,
    list: availableAlignments,
    method: 'listDropdown',
  },
  blockType: {
    activeOption: blockType => availableBlockTypes.find(b => b.type === blockType),
    controlWidth: 90,
    dropdownWidth: 135,
    list: availableBlockTypes,
    method: 'listDropdown',
  },
  color: {
    activeOption: () => ({ display: { icon: 'paint-brush-sld' } }),
    controlWidth: 40,
    dropdownWidth: 280,
    list: availableColors,
    method: 'listDropdown',
  },
  fontFamily: {
    activeOption: font =>
      availableFonts.find(f => f.display.name === font) || {
        display: { name: 'theme default', style: { fontStyle: 'italic' } },
      },
    controlWidth: 130,
    dropdownWidth: 155,
    list: [...availableFonts, { type: 'fontFamily.unset', display: { name: 'reset', style: { fontStyle: 'italic' } } }],
    method: 'listDropdown',
  },
  fontSize: {
    activeOption: fontSize =>
      availableFontSizes.find(size => size.display.name === +fontSize) || { display: { name: '--' } },
    controlWidth: 40,
    dropdownWidth: 65,
    list: [
      ...availableFontSizes,
      { type: 'fontSize.unset', display: { name: 'reset', style: { fontStyle: 'italic' } } },
    ],
    method: 'listDropdown',
  },
  insertImage: {
    activeOption: () => ({ display: { icon: 'image-sld' } }),
    controlWidth: 40,
    dropdownWidth: 400,
    icon: 'image-sld',
    method: 'formDropdown',
  },
  insertLink: {
    activeOption: () => ({ display: { icon: 'link-sld' } }),
    controlWidth: 40,
    dropdownWidth: 400,
    icon: 'link-sld',
    method: 'formDropdown',
  },
  insertTable: {
    activeOption: () => ({ display: { icon: 'table-sld' } }),
    controlWidth: 40,
    dropdownWidth: 160,
    icon: 'table-sld',
    method: 'tableDropdown',
  },
};

export const availableControls = {
  ...dropdownControls,
  bold: {
    callback: 'inlineToggle',
    icon: 'bold-sld',
    method: 'controlButton',
  },
  bulletList: {
    callback: 'listToggle',
    icon: 'list-ul-sld',
    method: 'controlButton',
    tooltip: 'Citadel.organisms.richEditor.tooltips.bulletList',
  },
  floatRight: {
    callback: 'blockDataToggle',
    icon: 'long-arrow-alt-right-sld',
    method: 'controlButton',
    tooltip: 'Citadel.organisms.richEditor.tooltips.floatRight',
  },
  indent: {
    callback: 'indentChange',
    icon: 'indent-sld',
    method: 'controlButton',
    tooltip: 'Citadel.organisms.richEditor.tooltips.indent',
  },
  italic: {
    callback: 'inlineToggle',
    icon: 'italic-sld',
    method: 'controlButton',
  },
  numberList: {
    callback: 'listToggle',
    icon: 'list-ol-sld',
    method: 'controlButton',
    tooltip: 'Citadel.organisms.richEditor.tooltips.numberList',
  },
  outdent: {
    callback: 'indentChange',
    icon: 'outdent-sld',
    method: 'controlButton',
    tooltip: 'Citadel.organisms.richEditor.tooltips.outdent',
  },
  spacer: {
    method: 'spacer',
  },
  strikethrough: {
    callback: 'inlineToggle',
    icon: 'strikethrough-sld',
    method: 'controlButton',
  },
  underline: {
    callback: 'inlineToggle',
    icon: 'underline-sld',
    method: 'controlButton',
  },
  viewHtml: {
    callback: 'editModeToggle',
    icon: 'code-sld',
    method: 'controlButton',
  },
};

const commonControls = [
  'bold',
  'italic',
  'underline',
  'fontFamily',
  'fontSize',
  'blockType',
  'alignment',
  'bulletList',
  'numberList',
  'outdent',
  'indent',
  'color',
  'insertLink',
  'insertTable',
];

export const controlSets = {
  basic: ['bold', 'italic', 'underline', 'bulletList', 'numberList'],
  default: [...commonControls, 'viewHtml'],
  withImages: [...commonControls, 'insertImage', 'viewHtml'],
};

export const Keys = {
  B: 66,
  Backspace: 8,
  Delete: 127,
  E: 69,
  Enter: 13,
  I: 73,
  J: 74,
  L: 76,
  R: 82,
  T: 84,
  Tab: 9,
  U: 85,
  '[': 219,
  ']': 221,
};
