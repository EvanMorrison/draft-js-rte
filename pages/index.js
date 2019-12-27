import React, { useReducer, useRef } from 'react'
import Head from 'next/head'
import Content from './indexContent.mdx'
import Editor from '../components/richEditor'
import FormLinker from 'form-linker'

const Home = () => {
  const [_, forceUpdate] = useReducer(x => x + 1, 0)

  const demoContent = `<div>Here is some sample content for the <u style="text-decoration: underline">rich text editor</u>. It will demonstrate paragraphs and custom block-level styling, and the use of tables. The Github repo is <a href="https://github.com/EvanMorrison/draft-js-rte"><span style="color: #0088FF"><u style="text-decoration: underline">here</u></span></a> and the Draft.js documentation is <a href="https://draftjs.org"><span style="color: #0088FF"><u style="text-decoration: underline">here</u></span></a>. If you click on the links in the previous sentence, then you can edit them.</div>
  <div><br></div>
  <div style="text-align: center;padding: 15px;background: #8DD;border: 1px solid #555;border-radius: 3px">Thank you for completing the application process. You should receive the results within 3 business days.</div>
  <div><br></div>
  <hr>
  <table style="border-collapse: collapse; margin: 15px 0; width: 80%; margin-left: 20%"><tbody><tr><td style="padding: 6px; text-align: left">&nbsp;<strong><span style='color:#0088FF'>ABC Company</span></strong><br>123 Circle Rd.<br>Springfield, UT 84201<br>Phone: 801-233-3332</td><td style="padding: 6px; text-align: left"><strong><span style='color:#0088FF'>XYZ Partners Ltd.</span></strong><br>789 Circuit Ave.<br>Anytown, UT 84111<br>Phone: 385-335-5555</td></tr></tbody></table> 
  <hr>
  <div><br></div>
  <table style="border-collapse: collapse; margin: 15px 0; width: 100%"><tbody><tr style="background-color: rgba(240, 240, 240, 0.8)"><th style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">Table Heading </th><th style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">Column A</th><th style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">Column B</th><th style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">Column C</th></tr><tr><td style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">Criteria for passing</td><td style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">50</td><td style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">37</td><td style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">44</td></tr></tbody></table>
 <div><br></div>`;

  const formLinker = useRef(new FormLinker({
    data: {
      editor: demoContent,
    },
    schema: {
      editor: "string",
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
            <Content/>
            <Editor
              formLinker={formLinker.current}
              name="editor"
              minHeight={150}
              height={350}
              maxHeight={800}
              placeholder="Enter your content here"
              toolbar={['withImages']}
              tooltipOrientation="bottom"
              onChange={forceUpdate}
            />
            <h4 css={{marginTop: 30, marginBottom: 0}}>
              Output Preview
            </h4>
            <div css={{width: "100%", padding: 12, border: "1px solid #000", minHeight: 350}}>
              <div dangerouslySetInnerHTML={{__html: formLinker.current.data.editor}}></div>
            </div>
          </div>
        </section>
    </div>
  )
}

export default Home
