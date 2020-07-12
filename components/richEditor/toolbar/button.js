import PropTypes from "prop-types";
import React from "react";
import Style from "./button.style";
import Tooltip from "../../atoms/tooltip";
import { ClassNames } from "@emotion/core";

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
      <Tooltip key='dropdown' orientation={props.tooltipOrientation}>
        {props.tooltip}
      </Tooltip>
    );
  }

  const classes = {
    'rich-editor-style-button': true,
    'rich-editor-active-button': props.active,
  };

  return (
    <Style>
      <ClassNames>
        {({ cx }) => (
          <div className={cx(classes)} onMouseDown={e => onToggle(e)}>
            {props.label}
            {renderTooltip()}
          </div>
        )}
      </ClassNames>
    </Style>
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
