// import Icons from './icons';
import PropTypes from 'prop-types';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Icon = props => {
  function icon(original) {
    const name = original.substring(0, original.length - 4);

    if (original.length - original.indexOf('reg') === 3) {
      return ['far', name];
    } else if (original.length - original.indexOf('lgt') === 3) {
      return ['fal', name];
    } else if (original.length - original.indexOf('sld') === 3) {
      return ['fas', name];
    } else {
      console.error('You have not provided a valid icon type');
      return ['fas', name];
    }
  }

  // if (
  //   [
  //     'applicant-pending',
  //     'applicant-ready',
  //     'batch-order',
  //     'draft-icon',
  //     'new-order',
  //     'revert-color',
  //     'xml-ready',
  //   ].includes(props.name)
  // ) {
  //   return (
  //     <svg viewBox='0 0 1024 1024' className={'icon-' + props.name} onClick={() => props.onClick()}>
  //       <path d={Icons[props.name]} />
  //     </svg>
  //   );
  // }

  const iconProps = {
    border: props.border,
    color: props.color,
    'data-testid': props.testid,
    fixedWidth: props.fixedWidth,
    flip: props.flip,
    icon: icon(props.name),
    inverse: props.inverse,
    listItem: props.listItem,
    onClick: e => props.onClick(e),
    pulse: props.pulse,
    rotation: props.rotation,
    size: props.size,
    spin: props.spin,
    style: props.style,
    title: props.title,
    transform: props.transform,
  };

  return <FontAwesomeIcon {...iconProps} />;
};

Icon.componentDescription = 'Icon library.';
Icon.componentKey = 'icon';
Icon.componentName = 'Icon';

Icon.propTypes = {
  border: PropTypes.bool,
  color: PropTypes.string,
  fixedWidth: PropTypes.bool,
  flip: PropTypes.string,
  inverse: PropTypes.bool,
  listItem: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  pulse: PropTypes.bool,
  rotation: PropTypes.number,
  size: PropTypes.string,
  spin: PropTypes.bool,
  style: PropTypes.object,
};

Icon.defaultProps = {
  onClick: () => {},
};

export default Icon;
