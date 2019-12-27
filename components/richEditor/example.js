import FormLinker from "form-linker";
import RichEditor from "./";
import React, { useRef } from "react";

const RichTextEditor = () => {
  const fl = useRef(new FormLinker({
    data: {editor: ""},
    schema: {editor: "string"}
  }));

  return(<RichEditor name="editor" formLinker={fl.current}/>);
};

export default RichTextEditor;
