import React, { useReducer, useRef } from 'react'
import Head from 'next/head'
import Editor from '../components/richEditor'
import FormLinker from 'form-linker'
import { FlexGrid, FlexItem } from 'flex-item'

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
        <section css={{width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center"}}>
          <div css={{width: 1000, padding: 20, display: "flex", flexDirection: "column"}}>
            <Editor
              formLinker={formLinker.current}
              name="editor"
              minHeight={150}
              height={250}
              maxHeight={600}
              placeholder="Enter your content here"
              toolbar={['withImages']}
              tooltipOrientation="bottom"
              onChange={forceUpdate}
            />
            <h4 css={{marginTop: 30, marginBottom: 0}}>
              Output Preview
            </h4>
            <div css={{width: "100%", padding: 12, border: "1px solid #000", minHeight: 250}}>
              <div dangerouslySetInnerHTML={{__html: formLinker.current.data.editor}}></div>
            </div>
          </div>
        </section>
    </div>
  )
}

export default Home
