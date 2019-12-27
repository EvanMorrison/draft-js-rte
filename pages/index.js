import React, { useRef } from 'react'
import Head from 'next/head'
import Editor from '../components/richEditor'
import FormLinker from 'form-linker'

const Home = () => {
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
      />

    </div>
  )
}

export default Home
