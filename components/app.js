import React from 'react'
import { globalStyle, theme } from './utils/theme.config'
import { ThemeProvider } from 'emotion-theming'
import { Global } from '@emotion/core'

const AppLayout = props => {
  return(
    <ThemeProvider theme={theme}>
      <Global style={globalStyle}/>
      {props.children}
    </ThemeProvider>
  )
}

export default AppLayout
