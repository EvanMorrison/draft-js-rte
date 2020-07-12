import React from 'react';
import PropTypes from 'prop-types';
import Style from './label.style';
import Translator from 'simple-translator';
import { isEmpty, isNil } from 'lodash';

const Label = props => {
  function renderError() {
    if (props.errors.length === 0) {
      return null;
    }

    const errors = props.errors.map(error => {
      return Translator.translate(error);
    });

    return <div className='error-text'>&nbsp;-&nbsp;{errors.join(', ')}</div>;
  }

  function renderStar() {
    if (isNil(props.label) || isEmpty(props.label) || !props.required) {
      return null;
    }

    return <span className='required-star'>*</span>;
  }

  const classes = ['form-label', `size-${props.size}`, props.disabled && 'disabled', props.errors.length > 0 && 'error']
    .filter(Boolean)
    .join(' ');

  return (
    <Style className={classes} htmlFor={props.name} onClick={() => props.onClick()}>
      {props.children}
      <div className='label-content'>
        {props.label}
        {renderStar()}
        {renderError()}
      </div>
    </Style>
  );
};

Label.componentDescription = 'Badge for emphasising important numbers.';
Label.componentKey = 'label';
Label.componentName = 'Form field label';

Label.propTypes = {
  disabled: PropTypes.bool,
  errors: PropTypes.array,
  onClick: PropTypes.func,
  label: PropTypes.node,
  required: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

Label.defaultProps = {
  disabled: false,
  errors: [],
  onClick: () => {},
  required: false,
  size: 'md',
};

export default Label;
