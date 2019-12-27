import ColorTheme from './colorTheme'

export { default as globalStyle } from './globalStyle'

let colors = new ColorTheme({
  primary: "#2C3E50",
  textOnHeader: "#FFFFFF",
  secondary: "#C5C5C5",
  info: "#10AFFF",
  primary_report_header: "3D3D3D",
  headerSlogan: "#19AD47",
  subHeaderSelected: "#19AD47",
  table: "#00385B",
  tableRow: "#DCEEFF",
  tableHigh: "#337799",
  tableHeaderText: "#EEEEEE"
}).exportTheme();

const dimensions = {
  columnPadding: 3,
  containerWidth: 1200,
  desktopBreakpoint: 992,
  tabletBreakpoint: 768,
  footerHeight: 32,
  headerWidth: 1200,
  headerHeight: 60,
  headerMiniHeight: 30,
  logoWidth: 150,
  subHeaderHeight: 24
};

export const theme = {
  aspect: null,
  colors,
  dimensions,
  fonts: ["Roboto, sans-serif", "Lato, sans-serif"],
  fontWeights: [300, 400, 700],
  zIndexes: null
};