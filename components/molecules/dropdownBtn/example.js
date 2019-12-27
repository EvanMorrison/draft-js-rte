import DropdownBtn from "./";
import React from "react";

class DropdownButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      openLeft: false,
      openRight: false
    };
  }

  handleLeftClick() {
    this.setState({openLeft: !this.state.openLeft});
  }

  handleRightClick() {
    this.setState({openRight: !this.state.openRight});
  }

  render() {
    return(
      <DropdownBtn dropdownTop="34px" buttonContent="Click to open a Dropdown" dropdownOpen={this.state.openLeft} buttonDisabled={this.props.disabled || false} dropdownOrientation="left" onButtonClick={() => this.handleLeftClick()}>
        <ul>
          <li>One</li>
          <li>Two</li>
          <li>Three</li>
        </ul>
      </DropdownBtn>
    );
  }
}

export default DropdownButton;
