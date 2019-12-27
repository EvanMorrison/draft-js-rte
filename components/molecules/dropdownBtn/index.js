import Inner from "./inner";
import PropTypes from "prop-types";
import React from "react";

class DropdownBtn extends React.Component {
  render() {
    return(<Inner {...this.props}/>);
  }
}

DropdownBtn.componentDescription = "Button that opens a dropdown menu.";
DropdownBtn.componentKey = "dropdownBtn";
DropdownBtn.componentName = "Dropdown button";

DropdownBtn.propDescriptions = {
  buttonBorderRadius: "Border radius around button.",
  buttonContent: "Content of button.",
  buttonDisabled: "Flag to disable button.",
  buttonSize: "Button size. Options are \"lg\", \"md\", and \"sm\".",
  buttonType: "Button type. Options are \"primary\", \"secondary\", and \"tertiary\".",
  children: "Content of dropdown.",
  dropdownOpen: "Boolean whether the dropdown is open.",
  dropdownOrientation: "Left or right aligned dropdown. Options are \"right\" or \"left\".",
  dropdownTop: "Distance of dropdown from top positioned absolute.",
  onButtonClick: "Callback function when button is clicked."
};

DropdownBtn.propTypes = {
  buttonContent: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string
  ]),
  buttonDisabled: PropTypes.bool,
  buttonSize: PropTypes.string,
  buttonType: PropTypes.string,
  dropdownOpen: PropTypes.bool,
  dropdownOrientation: PropTypes.string,
  dropdownTop: PropTypes.string,
  onButtonClick: PropTypes.func
};

DropdownBtn.defaultProps = {
  onButtonClick: () => {}
};

export default DropdownBtn;
