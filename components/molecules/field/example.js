import Field from "./";
import FormLinker from "form-linker";
import React from "react";

class FieldExamples extends React.Component {
  constructor(props) {
    super(props);

    this.fl = new FormLinker({
      onChange: () => this.forceUpdate()
    });
  }

  render() {
    let fieldProps = {
      formLinker: this.fl
    };

    return(<Field {...fieldProps} label="Label" name="field"/>);
  }
}

export default FieldExamples;