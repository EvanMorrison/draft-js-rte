import React from 'react'
import iconLibrary from './utils/iconLIbrary'
import { globalStyle, theme } from './utils/theme.config'
import { ThemeProvider } from 'emotion-theming'
import { Global } from '@emotion/core'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

const AppLayout = props => {
  iconLibrary();

  return(
    <ThemeProvider theme={theme}>
      <Global style={globalStyle}/>
      {props.children}
    </ThemeProvider>
  )
}

export default AppLayout
