import React from 'react'
import iconLibrary from './utils/iconLIbrary'
import english from './utils/translations/en'
import Head from 'next/head'
import Translator from 'simple-translator'
import { globalStyle, theme } from './utils/theme.config'
import { Global, ThemeProvider } from '@emotion/react'
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css' // Import the CSS
config.autoAddCss = false // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

const AppLayout = props => {
  iconLibrary()
  Translator.registerDefaultLanguage("en", english)
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
