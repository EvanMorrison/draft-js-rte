import React, { useReducer, useRef } from 'react'
import Head from 'next/head'
import Editor from '../components/richEditor'
import FormLinker from 'form-linker'

const Home = () => {
  const [_, forceUpdate] = useReducer(x => x + 1, 0)

  const formLinker = useRef(new FormLinker({
    data: {
      editor: ""
    },
    schema: {
      editor: "string"
    }
  }))

  return(
    <div>
      <Head>
        <title>Home</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Editor
        formLinker={formLinker.current}
        name="editor"
        minHeight={150}
        height={250}
        maxHeight={600}
        toolbar={['withImages']}
        tooltipOrientation="bottom"
        onChange={forceUpdate}
      />
      <div css={{marginTop: 15, width: "100%", padding: 12, border: "1px solid #000", minHeight: 150}}>
        <div dangerouslySetInnerHTML={{__html: formLinker.current.data.editor}}></div>
      </div>
    </div>
  )
}

export default Home
