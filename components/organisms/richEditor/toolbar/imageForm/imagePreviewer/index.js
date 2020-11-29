import Button from "../../../../../atoms/button";
import Dropzone from "react-dropzone";
import Icon from "../../../../../atoms/icon";
import ImagePreview from "./preview";
import React, { useEffect, useRef, useState} from "react";
import Style from "./image-previewer.style";
import Translator from "simple-translator";

const ImagePreviewer = props => {
  const [hasError, setHasError] = useState(false);
  const [image, setImage] = useState(null);

  const isOpen = useRef(props.isOpen);
  useEffect(() => {
    if (isOpen.current && !props.isOpen) {
      isOpen.current = false;
      setImage(null);
    }
  }, [props.isOpen]);

  function clear() {
    setHasError(false);
    setImage(null);
    props.formLinker.setValue(props.name, null);
  }

  function drop(files) {
    setHasError(false);
    props.resetError();
    readFile(files[0]);
  }

  function dropError(files) {
    setHasError(true);
  }

  function readFile(file) {
    const FR = new FileReader();
    FR.addEventListener('load', e => {
      props.formLinker.setValue(props.name, file);
      setImage(e.target.result);
    });
    FR.readAsDataURL(file);
  }

  function renderContent() {
    if (image === null) {
      return renderDropzone();
    } else {
      return (
        <React.Fragment>
          <div css={{ display: 'flex', width: '100%' }}>
            <div css={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <ImagePreview src={image} previewWidth={'100%'} previewHeight={256} />
            </div>
          </div>
          <Button block type='tertiary' onClick={clear}>
            Clear
          </Button>
        </React.Fragment>
      );
    }
  }

  function renderDropzone() {
    return (
      <div>
        <div className='mobile-dropzone'>{Translator.translate('Citadel.organisms.richEditor.mobileError')}</div>
        <Dropzone
          multiple={false}
          maxSize={5000000}
          accept={'image/*'}
          style={{}}
          className='dropzone'
          onDropAccepted={drop}
          onDropRejected={dropError}
        >
          <div className='icon-overlay' />
          <Icon name='cloud-upload-alt-sld' />
          <h3 className='upload-logo-text'>{Translator.translate('Citadel.organisms.richEditor.upload')}</h3>
          <h3 className='upload-logo-text upload-sub'>
            {Translator.translate('Citadel.organisms.richEditor.uploadSub')}
          </h3>
          <h4 className='file-size-limit upload-logo-text'>
            {Translator.translate('Citadel.organisms.richEditor.maxFileSize')}
            <br />
            <span className='lighter-text'>{Translator.translate('Citadel.organisms.richEditor.imageFormats')}</span>
          </h4>
        </Dropzone>
        {renderError()}
      </div>
    );
  }

  function renderError() {
    if (!hasError) {
      return <noscript />;
    }
    return <div className='error'>{Translator.translate('Citadel.organisms.richEditor.uploadFailed')}</div>;
  }

  return <Style className='image-editor'>{renderContent()}</Style>;
};

export default ImagePreviewer;
