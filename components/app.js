import React from 'react'
import iconLibrary from './utils/iconLIbrary'
import { globalStyle, theme } from './utils/theme.config'
import { ThemeProvider } from 'emotion-theming'
import { Global } from '@emotion/core'

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
