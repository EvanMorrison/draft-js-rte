import React from 'react';
import Style from './preview.style';

const ImagePreview = props => {
  return (
    <Style width={props.previewWidth} height={props.previewHeight}>
      <img src={props.src} />
    </Style>
  );
};

export default ImagePreview;
