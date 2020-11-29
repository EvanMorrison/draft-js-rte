import Button from "../../../../atoms/button";
import Field from "../../../../molecules/field";
import FormLinker from "form-linker";
// import Formatters from "../../../utils/formatters";
import ImagePreviewer from "./imagePreviewer";
// import Masks from "../../../utils/masks";
import React, { useRef, useReducer, useState } from "react";
import Styled from "./imageForm.style";
import Translator from "simple-translator";
import { cloneDeep, isEmpty } from "lodash";

const DropdownContent = props => {
  const [_, forceUpdate] = useReducer(x => x + 1, 0);
  const [hasError, setHasError] = useState(false);

  const formLinker = useRef(
    new FormLinker({
      data: {
        imgFile: null,
        imgUrl: '',
      },
      // formatters: Formatters,
      // masks: Masks,
      schema: {
        imgFile: 'file',
        imgUrl: 'string',
      },
      onChange: () => forceUpdate(),
    })
  );
  const fl = formLinker.current;

  function handleSubmit() {
    if (isEmpty(fl.getValue('imgUrl')) && isEmpty(fl.getValue('imgFile'))) {
      setHasError(true);
    } else {
      props.handleSubmit(cloneDeep(fl.data));
      fl.setValue('imgUrl', '', false);
      fl.setValue('imgFile', null, false);
    }
  }

  function resetError() {
    if (hasError) {
      setHasError(false);
    }
  }

  function renderError() {
    if (!hasError) {
      return null;
    }

    return <div className='error'>{Translator.translate('Citadel.organisms.richEditor.emptyForm')}</div>;
  }

  return (
    <Styled>
      {renderError()}
      <Field formLinker={fl} name='imgUrl' label='Full URL to image' onFocus={resetError} />
      <div>or add a file below</div>
      <ImagePreviewer formLinker={fl} name='imgFile' resetError={resetError} />
      <Button block onClick={handleSubmit}>
        Add to Document
      </Button>
    </Styled>
  );
};

export default DropdownContent;
