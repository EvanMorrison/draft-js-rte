const List = [
  'codeBlockIcon',
  'scrollableTrackVertical',
  'scrollableThumbVertic',
  'widgetOverlayRootLevel',
  'widget',
  'flexGrid',
  'blockSection',
  'subHeader',
  'messages',
  'header',
  'headerSearchIcon',
  'headerMenu',
  'headerMobileMenu',
  'headerSearchMenu',
  'dropDown',
  'modal',
  'modalOverlay',
  'modalOverlayModal',
  'widgetOverlay',
  'widgetSelectorOverlay',
];

const ListToObject = {};
List.forEach((item, key) => {
  ListToObject[item] = (key + 1) * 10;
});

export default ListToObject;
