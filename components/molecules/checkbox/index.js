import Icon from '../../atoms/icon';
import Label from '../../atoms/label';
import PropTypes from 'prop-types';
import React from 'react';
import Style from './checkbox.style';
import { useTheme } from '@emotion/react';

const Checkbox = React.forwardRef(({ testid, ...props }, ref) => {
  const theme = useTheme();

  function handleClick(e) {
    if (!props.disabled) {
      props.onCheck(!props.checkStatus, e);
    }
  }

  const iconName = props.checkStatus ? 'check-square-sld' : 'square-sld';

  const classes = [
    'checkbox',
    props.checkStatus ? 'checked' : 'unchecked',
    props.disabled && 'disabled',
    props.className,
    `size-${props.size}`,
  ]
    .filter(Boolean)
    .join(' ');

  if (props.noLabel) {
    return (
      <Style className={classes}>
        <input type='checkbox' disabled={props.disabled} ref={ref} />
        <span className='fa-layers'>
          <Icon
            {...props}
            color={props.fillColor || theme.colors.pageBackground}
            name='square-sld'
            size={props.size === 'md' ? null : props.size}
          />
          <Icon
            {...props}
            color={props.color || theme.colors.checkbox}
            name={iconName}
            size={props.size === 'md' ? null : props.size}
            onClick={handleClick}
            testid={testid}
          />
        </span>
      </Style>
    );
  }

  return (
    <Style className={classes}>
      <Label {...props} for={props.name} errors={props.error}>
        <input
          name={props.name}
          id={props.name}
          type='checkbox'
          disabled={props.disabled}
          onClick={handleClick}
          ref={ref}
        />
        <span className='fa-layers'>
          <Icon
            {...props}
            color={props.fillColor || theme.colors.pageBackground}
            name='square-sld'
            size={props.size === 'md' ? null : props.size}
          />
          <Icon
            {...props}
            color={props.color || theme.colors.checkbox}
            name={iconName}
            size={props.size === 'md' ? null : props.size}
            testid={testid ?? props.name}
          />
        </span>
      </Label>
    </Style>
  );
});

Checkbox.componentDescription = 'Checkbox to toggle check/uncheck';
Checkbox.componentKey = 'checkbox';
Checkbox.componentName = 'Checkbox';
Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
  checkStatus: PropTypes.bool,
  className: PropTypes.string,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  errors: PropTypes.array,
  fillColor: PropTypes.string,
  label: PropTypes.node,
  name: PropTypes.string,
  noLabel: PropTypes.bool,
  onCheck: PropTypes.func,
  size: PropTypes.string,
};

Checkbox.defaultProps = {
  onCheck: () => {},
  size: 'md',
};

export default Checkbox;
