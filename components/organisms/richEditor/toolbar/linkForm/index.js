import Button from "../../../../atoms/button";
import Field from "../../../../molecules/field";
// import Formatters from "../../../../utils/formatters";
import FormLinker from "form-linker";
// import Masks from "../../../../utils/masks";
import React, { useEffect, useRef, useState } from "react";
import Styled from "./linkForm.style";
import { isEmpty } from "lodash";

const DropdownContent = props => {
  const formLinker = useRef(
    new FormLinker({
      data: {
        entityKey: null,
        displayText: '',
        linkUrl: '',
        newTab: true,
      },
      // formatters: Formatters,
      // masks: Masks,
      schema: {
        entityKey: 'string',
        displayText: 'string.required',
        linkUrl: 'string.required',
        newTab: 'boolean',
      },
    })
  );
  const fl = formLinker.current;

  const [textDirty, setTextDirty] = useState(false);

  useEffect(() => {
    // if current selection point includes an existing link, populate the form with the link's text and url.
    const contentState = props.editorState.getCurrentContent();
    const selection = props.editorState.getSelection();
    const key = selection.getAnchorKey();
    const block = contentState.getBlockForKey(key);

    let entityKey = block.getEntityAt(selection.getAnchorOffset());
    let linkUrl = '';
    let newTab = true;
    let displayText = '';
    if (entityKey) {
      const entity = contentState.getEntity(entityKey);
      if (entity.getType() === 'LINK') {
        newTab = entity.getData().target === '_blank';
        linkUrl = entity.getData().url;
        block.findEntityRanges(
          metadata => {
            return metadata.includes(entityKey);
          },
          (start, end) => {
            displayText = block.getText().slice(start, end);
          }
        );
      } else {
        entityKey = null;
      }
    }

    formLinker.current.setValuesFromParsed({ linkUrl, displayText, newTab, entityKey });
  }, [props.editorState]);

  function handleSubmit() {
    fl.validateAll();
    if (isEmpty(fl.errors)) {
      props.handleSubmit({ ...fl.data });
      fl.setValue('linkUrl', '', false);
      fl.setValue('displayText', '', false);
      fl.setValue('entityKey', null, false);
    }
  }

  function handleUrlChange(newLink = !fl.getValue('entityKey'), url = fl.getValue('linkUrl')) {
    if (newLink && !textDirty) {
      fl.setValue('displayText', url);
    }
  }

  return (
    <Styled>
      <Field formLinker={fl} name='linkUrl' label='Full URL' onChange={handleUrlChange} />
      <Field formLinker={fl} name='displayText' label='Text to display' onFocus={() => setTextDirty(true)} />
      <Field formLinker={fl} name='newTab' label='Open link in new tab' type='checkbox' />
      <Button block onClick={() => handleSubmit()}>
        Add to Document
      </Button>
    </Styled>
  );
};

export default DropdownContent;
