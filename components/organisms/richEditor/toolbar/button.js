import PropTypes from 'prop-types';
import React from 'react';
import Tooltip from '../../../atoms/tooltip';

const Button = props => {
  function onToggle(e) {
    e.preventDefault();
    props.onToggle(props.style);
  }

  function renderTooltip() {
    if (!props.tooltip) {
      return null;
    }

    return (
      <Tooltip key='dropdown' size='sm' orientation={props.tooltipOrientation}>
        {props.tooltip}
      </Tooltip>
    );
  }

  const classes = [[props.style], 'rich-editor-style-button', props.active && 'rich-editor-active-button']
    .filter(Boolean)
    .join(' ');

  return (
    <div css={{ position: 'relative' }}>
      <div className={classes} onMouseDown={e => onToggle(e)}>
        {props.label}
        {renderTooltip()}
      </div>
    </div>
  );
};

Button.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.element,
  onToggle: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  tooltip: PropTypes.string,
};

Button.defaultProps = {
  onToggle: () => {},
  tooltip: '',
};

export default Button;
