import React from "react";
import PropTypes from "prop-types";
import Style from "./dropdown.style";
import { ClassNames } from "@emotion/core";

const Dropdown = ({orientation, open, top, children}) => {
  if(open !== true) { return(null); }

  const classes = {
    "dropdown": true,
    "left": orientation === "left",
    "right": orientation !== "left"
  };

  return(
    <ClassNames>
      {({cx}) => (
        <Style className={cx(classes)} style={{top: top}}>
          <div className="dropdown-content">
            {children}
          </div>
        </Style>
      )}
    </ClassNames>
  );
};

Dropdown.componentDescription = "Generic dropdown menu.";
Dropdown.componentKey = "dropdown";
Dropdown.componentName = "Dropdown menu";

Dropdown.propDescriptions = {
  children: "Inner content of dropdown.",
  open: "Boolean whether to show or not",
  orientation: "Left or right aligned. Options are \"left\" or \"right\".",
  top: "Distance from top positioned absolute."
};

Dropdown.propTypes = {
  /** Boolean whether to show or not */
  open: PropTypes.bool,
  /** Left or right aligned. Options are "left" or "right". */
  orientation: PropTypes.oneOf(["left", "right"]),
  /** Distance from top positioned absolute. */
  top: PropTypes.string
};

Dropdown.defaultProps = {
  orientation: "right",
  top: "50px"
};

export default Dropdown;
