import React, { useReducer, useRef } from 'react'
import Head from 'next/head'
import Content from './indexContent.mdx'
import Editor from '../components/richEditor'
import FormLinker from 'form-linker'

const Home = () => {
  const [_, forceUpdate] = useReducer(x => x + 1, 0)

  const demoContent = `<div><br></div><figure style="text-align: left; margin: 0 0 0 8px; float: left"><img src="https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500" style="object-fit: contain; height: 140px; width: 256px; margin-right: 12px"/></figure>
  <p style="text-align: left">This is some sample content for the <u style='text-decoration: underline'>rich text editor</u>. It demonstrates paragraphs, custom block-level styling, the use of tables, and it has an image floated to the left of this paragraph. Feel free to modify this content or delete it all and create you own.</p>
  <p>You can click on <u style='text-decoration: underline'><span style='color:#0088FF'><a href='https://github.com/EvanMorrison/draft-js-rte'>this link</a></span></u> or <u style='text-decoration: underline'><span style='color:#0088FF'><a href='https://draftjs.org'>this link</a></span></u> in the editor to see what they point to and edit them.</p>
  <p>If you click on the image you can resize it. If you have the image selected, you can toggle float-left with cmd+L. To ensure you have the image selected rather than an adjacent paragraph, first click on the image to activate it - you'll see the dotted resize border appear - then click in the empty space between the dotted border and the image and the image will become selected.</p>
  <p style="text-align: center; padding: 15px; background: #8DD; border: 1px solid #555; border-radius: 3px">You can give a paragraph some custom styling like this while in code view and it<br>will be preserved in editor view and in the html outpout.</p>
  <hr>
  <table style="border-collapse: collapse; margin: 15px 0; width: 80%; margin-left: 20%"><tbody><tr><td style="padding: 6px; text-align: left">&nbsp;<strong><span style='color:#00CC00'>ABC Company</span></strong><br>123 Circle Rd.<br>Springfield, UT 84201<br>Phone: 801-233-3332</td><td style="padding: 6px; text-align: left"><strong><span style='color:#FF8800'>XYZ Partners Ltd.</span></strong><br>789 Circuit Ave.<br>Anytown, UT 84111<br>Phone: 385-335-5555</td></tr></tbody></table> 
  <hr>
  <div><br></div>
  <table style="border-collapse: collapse; margin: 15px 0; width: 100%"><tbody><tr style="background-color: rgba(240, 240, 240, 0.8)"><th style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">Sample Table </th><th style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">Column A</th><th style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">Column B</th><th style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">Column C</th></tr><tr><td style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">Criteria for passing</td><td style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">50</td><td style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">37</td><td style="border: 1px solid rgba(0, 0, 0, 0.2); padding: 6px; text-align: center">44</td></tr></tbody></table>
  <div style="text-align: left"><br></div>`;

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
        <title>Rich Text Editor</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
        <section css={{width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center"}}>
          <div css={{width: 1000, padding: 20, display: "flex", flexDirection: "column"}}>
            <Content/>
            <Editor
              formLinker={formLinker.current}
              name="editor"
              minHeight={150}
              height={620}
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
