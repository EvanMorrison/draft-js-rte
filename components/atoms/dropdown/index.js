import React from "react";
import PropTypes from "prop-types";
import Style, { left, right } from "./dropdown.style";

const Dropdown = ({orientation, open, top, children, className}) => (
  (open || null) &&
  <Style className={`dropdown ${className ?? ""}`} css={[{top}, orientation === "left" ? left : right]}>
    <div className="dropdown-content">
      {children}
    </div>
  </Style>
);

Dropdown.componentDescription = "Generic dropdown menu.";
Dropdown.componentKey = "dropdown";
Dropdown.componentName = "Dropdown menu";

Dropdown.propTypes = {
  /** Boolean whether to show or not */
  open: PropTypes.bool,
  /** Left or right aligned. Options are "left" or "right". */
  orientation: PropTypes.oneOf(["left", "right"]),
  /** Distance from top positioned absolute. */
  top: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

Dropdown.defaultProps = {
  orientation: "right",
  top: "50px"
};

export default Dropdown;
