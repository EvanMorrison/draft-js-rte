import PrimaryStyle from "./primary.style";
import PropTypes from "prop-types";
import React from "react";
import SecondaryStyle from "./secondary.style";
import TertiaryStyle from "./tertiary.style";
import Tooltip from "../tooltip";
import { isNil } from "lodash";
import { ClassNames } from "@emotion/core";

const Button = ({block, children, className, danger, disabled, onClick, size, tooltip, tooltipOrientation, type}) => {
  const handleClick = (e) => {
    stopPropagation(e);
    if(!disabled) {
      onClick();
    }
  };

  const stopPropagation = (e) => {
    if(typeof(e) !== "undefined") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const renderContent = () => {
    return([
      <div key="btn-content" className="btn-content">
        {children}
      </div>,
      (!isNil(tooltip) && !disabled) &&
      <Tooltip key="dropdown" orientation={tooltipOrientation}>{tooltip}</Tooltip>
    ]);
  };

  let classes = {
    "button": true,
    "danger": danger,
    "disabled": disabled,
    "primary": type === "primary",
    "secondary": type === "secondary",
    "tertiary": type === "tertiary",
    "size-lg": size === "lg",
    "size-md": size === "md",
    "size-sm": size === "sm",
    "block": block,
    [className]: true
  };

  let props = {
    children: renderContent(),
    onClick: (e) => handleClick(e),
    type: "button"
  };

  return(
    <ClassNames>
      {({cx}) => {
        if(type === "primary") {
          return(<PrimaryStyle className={cx(classes)} {...props}/>);
        } else if(type === "tertiary") {
          return(<TertiaryStyle className={cx(classes)} {...props}/>);
        } else {
          return(<SecondaryStyle className={cx(classes)} {...props}/>);
        }
      }}
    </ClassNames>
  );
};

Button.componentDescription = "Standard extendable button.";
Button.componentKey = "button";
Button.componentName = "Button";

Button.propDescriptions = {
  block: "Full width button.",
  children: "Button text or content.",
  className: "class to be added to className",
  danger: "Button color will be theme's \"danger\" color",
  disabled: "Boolean whether the button is disabled.",
  onClick: "Callback function when button is clicked.",
  size: "Button size. Options are \"lg\", \"md\", and \"sm\".",
  tooltip: "Tooltip message.",
  tooltipOrientation: "Top, bottom, left or right tooltip alignment.",
  type: "Button style type. Options are \"primary\", \"secondary\", and \"tertiary\"."
};

Button.propTypes = {
  /** Full width button. */
  block: PropTypes.bool,
  /** class to be added to className */
  className: PropTypes.string,
  /** Button color will be theme's "danger" color. */
  danger: PropTypes.bool,
  /** Boolean whether the button is disabled. */
  disabled: PropTypes.bool,
  /** Callback function when button is clicked. */
  onClick: PropTypes.func,
  /** Button size. Options are "lg", "md", and "sm". */
  size: PropTypes.string,
  /** Tooltip message. */
  tooltip: PropTypes.string,
  /** Top, bottom, left or right tooltip alignment. */
  tooltipOrientation: PropTypes.string,
  /** Button style type. Options are "primary", "secondary", and "tertiary". */
  type: PropTypes.string
};

Button.defaultProps = {
  block: false,
  className: "",
  danger: false,
  disabled: false,
  onClick: () => {},
  size: "md",
  type: "secondary"
};

export default Button;
