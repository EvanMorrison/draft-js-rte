import Button from '../../atoms/button';
import Dropdown from '../../atoms/dropdown';
import PropTypes from 'prop-types';
import React, { useLayoutEffect, useRef, useState } from 'react';
import Style from './dropdown.style';
import useClickOutside from 'use-onclickoutside';
import { isElement } from 'lodash';

const DropdownBtn = ({ container, dropdownOpen, dropdownOrientation, onButtonClick, ...props }) => {
  const ref = useRef();

  useClickOutside(ref, () => {
    if (dropdownOpen) {
      onButtonClick();
    }
  });

  const [orientation, setOrientation] = useState(dropdownOrientation);
  // if a container element or container id is provided, orient the dropdown away
  // from the closest edge of the container, otherwise use the dropdownOrientation prop.
  useLayoutEffect(() => {
    let containerRef = container;
    if (dropdownOpen && container) {
      if (!isElement(container)) {
        containerRef = document.getElementById(container);
      }
      const dimensions = containerRef?.getBoundingClientRect();
      const left = ref.current?.getBoundingClientRect().left - dimensions?.left;
      setOrientation(left < dimensions?.width / 2 ? 'left' : 'right');
    } else if (dropdownOpen) {
      setOrientation(dropdownOrientation);
    }
  }, [container, dropdownOpen, dropdownOrientation]);

  const buttonProps = {
    disabled: props.buttonDisabled,
    onClick: onButtonClick,
    size: props.buttonSize,
    type: props.buttonType,
  };

  return (
    <Style ref={ref} {...props} className={`dropdown-button ${props.className ?? ''}`}>
      <Button {...buttonProps}>{props.buttonContent}</Button>
      <Dropdown open={dropdownOpen} orientation={orientation} top={props.dropdownTop}>
        {props.children}
      </Dropdown>
    </Style>
  );
};

DropdownBtn.componentDescription = 'Button that opens a dropdown menu.';
DropdownBtn.componentKey = 'dropdownBtn';
DropdownBtn.componentName = 'Dropdown button';

DropdownBtn.propTypes = {
  buttonContent: PropTypes.node,
  buttonDisabled: PropTypes.bool,
  buttonSize: PropTypes.string,
  buttonType: PropTypes.string,
  /* a container element or id to dynamically set dropdown orientation */
  container: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  dropdownOpen: PropTypes.bool,
  dropdownOrientation: PropTypes.string,
  dropdownTop: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onButtonClick: PropTypes.func,
};

DropdownBtn.defaultProps = {
  onButtonClick: () => {},
};

export default DropdownBtn;
