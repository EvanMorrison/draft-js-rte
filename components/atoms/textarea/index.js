import PropTypes from 'prop-types';
import React from 'react';
import Style from './textarea.style';

const Textarea = React.forwardRef((props, ref) => {
  function handleKeyUp(e) {
    if (e.keyCode === 13) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  const classes = ['textarea', props.error && 'error', props.disabled && 'disabled', props.className]
    .filter(Boolean)
    .join(' ');

  const textareaProps = {
    disabled: props.disabled,
    id: props.name,
    maxLength: props.maxLength,
    name: props.name,
    placeholder: props.placeholder,
    onBlur: props.onBlur,
    onChange: e => props.onChange(e.target.value),
    onFocus: props.onFocus,
    value: props.value ?? '',
    rows: props.rows,
  };

  return <Style className={classes} {...textareaProps} onKeyUp={handleKeyUp} ref={ref} />;
});

Textarea.componentDescription = 'Form textarea element. Used for all form text boxes.';
Textarea.componentKey = 'textarea';
Textarea.componentName = 'Form field text area';
Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  disabled: PropTypes.bool,
  maxLength: PropTypes.string,
  name: PropTypes.string,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  rows: PropTypes.number,
  value: PropTypes.string,
};

Textarea.defaultProps = {
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  rows: 7,
};

export default Textarea;
