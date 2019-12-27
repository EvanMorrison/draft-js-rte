import Button from "../../../atoms/button";
// import Formatters from "../../../../utils/formatters";
import FormLinker from "form-linker";
// import Masks from "../../../../utils/masks";
import React, { useEffect, useReducer, useRef } from "react";
import Styled from "./linkForm.style";
import { isEmpty } from "lodash";

const DropdownContent = props => {
  const [_, forceUpdate] = useReducer(x => x + 1, 0);
  const formLinker = useRef(new FormLinker({
    data: {
      entityKey: null,
      displayText: "",
      linkUrl: ""
    },
    // formatters: Formatters,
    // masks: Masks,
    schema: {
      entityKey: "string",
      displayText: "string.required",
      linkUrl: "string.required"
    }
  }));
  const fl = formLinker.current;

  useEffect(() => {
    // if current selection point includes an existing link, populate the form with the link's text and url.
    const contentState = props.editorState.getCurrentContent();
    const selection = props.editorState.getSelection();
    const key = selection.getAnchorKey();
    const block = contentState.getBlockForKey(key);

    let entityKey = block.getEntityAt(selection.getAnchorOffset());
    let linkUrl = "";
    let displayText = "";
    if(entityKey) {
      const entity = contentState.getEntity(entityKey);
      if(entity.getType() === "LINK") {
        linkUrl = entity.getData().url;
        block.findEntityRanges(metadata => {
          return(metadata.includes(entityKey));
        },
        (start, end) => {
          displayText = block.getText().slice(start, end);
        });
      } else {
        entityKey = null;
      }
    }

    formLinker.current.setValuesFromParsed({linkUrl, displayText, entityKey});
    forceUpdate();
  }, [props.editorState]);

  function handleSubmit() {
    fl.validateAll();
    if(isEmpty(fl.errors)) {
      props.handleSubmit({...fl.data});
      fl.setValue("linkUrl", "", false);
      fl.setValue("displayText", "", false);
      fl.setValue("entityKey", null, false);
    }
  }

  const Field = require("../../../molecules/field").default;

  return(
    <Styled>
      <Field formLinker={fl} name="linkUrl" label="Full link URL"/>
      <Field formLinker={fl} name="displayText" label="Link text"/>
      <Button block onClick={() => handleSubmit()}>Add to Document</Button>
    </Styled>
  );
};

export default DropdownContent;
