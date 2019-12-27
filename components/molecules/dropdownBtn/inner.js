import Button from "../../atoms/button";
import Dropdown from "../../atoms/dropdown";
import OnClickOutside from "react-onclickoutside";
import React from "react";
import Style from "./dropdown.style";

class DropdownBtn extends React.Component {
  handleClickOutside(e) {
    if(this.props.dropdownOpen) {
      this.props.onButtonClick();
    }
  }

  render() {
    let buttonProps = {
      disabled: this.props.buttonDisabled,
      onClick: this.props.onButtonClick,
      size: this.props.buttonSize,
      type: this.props.buttonType
    };

    return(
      <Style className="dropdown-button">
        <Button {...buttonProps}>{this.props.buttonContent}</Button>
        <Dropdown open={this.props.dropdownOpen} orientation={this.props.dropdownOrientation} top={this.props.dropdownTop}>{this.props.children}</Dropdown>
      </Style>
    );
  }
}

export default OnClickOutside(DropdownBtn);
