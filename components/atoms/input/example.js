import Field from "../../molecules/field";
import FormLinker from "form-linker";
import React from "react";

class InputExample extends React.Component {
  constructor(props) {
    super(props);

    this.fl = new FormLinker({
      onChange: () => this.formChanged()
    });
  }

  formChanged() {
    this.forceUpdate();
  }

  render() {
    let fieldProps = {
      formLinker: this.fl
    };

    return(
      <Field {...fieldProps} label="Plain" name="string" required/>
    );
  }
}

export default InputExample;
