import ColorTheme from './colorTheme'
import zIndexes from './z-indexes'

export { default as globalStyle } from './globalStyle'

let colors = new ColorTheme({
  primary: "#035",
  textOnPrimary: "#FFF",
  secondary: "#AAA",
  info: "#10AFFF",
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
  zIndexes
};