import PrimaryStyle from './primary.style';
import PropTypes from 'prop-types';
import React from 'react';
import SecondaryStyle from './secondary.style';
import TertiaryStyle from './tertiary.style';
import Tooltip from '../tooltip';
import { isNil } from 'lodash';

const Button = ({
  block,
  children,
  className,
  danger,
  disabled,
  hasTooltipWhenDisabled,
  onClick,
  size,
  tooltip,
  tooltipOrientation,
  tooltipContainer,
  tooltipMaxWidth,
  tooltipSize,
  type,
}) => {
  const handleClick = e => {
    stopPropagation(e);
    if (!disabled) {
      onClick();
    }
  };

  const stopPropagation = e => {
    if (typeof e !== 'undefined') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const renderContent = () => {
    const tooltipProps = {
      orientation: tooltipOrientation,
      container: tooltipContainer,
      maxWidth: tooltipMaxWidth,
      size: tooltipSize,
    };
    return [
      <div key='btn-content' className='btn-content'>
        {children}
      </div>,
      !isNil(tooltip) && (!disabled || hasTooltipWhenDisabled) && (
        <Tooltip key='dropdown' {...tooltipProps}>
          {tooltip}
        </Tooltip>
      ),
    ];
  };

  const classes = [
    'button',
    danger && 'danger',
    disabled && 'disabled',
    type,
    `size-${size}`,
    block && 'block',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const props = {
    children: renderContent(),
    onClick: e => handleClick(e),
    type: 'button',
  };

  if (type === 'primary') {
    return <PrimaryStyle className={classes} {...props} />;
  } else if (type === 'tertiary') {
    return <TertiaryStyle className={classes} {...props} />;
  } else {
    return <SecondaryStyle className={classes} {...props} />;
  }
};

Button.componentDescription = 'Standard extendable button.';
Button.componentKey = 'button';
Button.componentName = 'Button';

Button.propTypes = {
  /** Full width button. */
  block: PropTypes.bool,
  /** class to be added to className */
  className: PropTypes.string,
  /** Button color will be theme's "danger" color. */
  danger: PropTypes.bool,
  /** Boolean whether the button is disabled. */
  disabled: PropTypes.bool,
  /** Whether to show the tooltip even if the button is disabled */
  hasTooltipWhenDisabled: PropTypes.bool,
  /** Callback function when button is clicked. */
  onClick: PropTypes.func,
  /** Button size. Options are "lg", "md", and "sm". */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Tooltip message. Only shown when button is enabled unless hasTooltipWhenDisabled prop is true. */
  tooltip: PropTypes.node,
  /** Top, bottom, left or right tooltip alignment. */
  tooltipOrientation: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  /** Boundary container that the tooltip should not overflow. Can be a query selector string or a ref to an element. */
  tooltipContainer: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  /** max width of the tooltip */
  tooltipMaxWidth: PropTypes.number,
  /** adjusts font-size and line height of tooltip */
  tooltipSize: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Button style type. Options are "primary", "secondary", and "tertiary". */
  type: PropTypes.oneOf(['primary', 'secondary', 'tertiary']),
};

Button.defaultProps = {
  block: false,
  className: '',
  danger: false,
  disabled: false,
  onClick: () => {},
  size: 'md',
  type: 'secondary',
  tooltipSize: 'lg',
};

export default Button;
