import React from 'react'
import iconLibrary from './utils/iconLIbrary'
import Head from 'next/head'
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
      <Global styles={globalStyle}/>
      <Head>
        <link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet"/>
      </Head>
      {props.children}
    </ThemeProvider>
  )
}

export default AppLayout
