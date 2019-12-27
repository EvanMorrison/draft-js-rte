import PropTypes from "prop-types";
import React from "react";
import Style from "./input.style";
import { isEmpty, isNil } from "lodash";
import { ClassNames } from "@emotion/core";

const Input = props => {
  function blur() {
    props.formLinker.validate(props.name);
    props._update();
    props.onBlur();
  }

  function change(e) {
    props.formLinker.setValue(props.name, e.target.value);
    props._update();
    props.onChange();
  }

  function focus() {
    props.formLinker.setError(props.name, []);
    props._update();
    props.onFocus();
  }

  function type() {
    let type = "text";
    if(props.type === "password") {
      type = "password";
    } else if(props.type === "number" || props.type === "rgb") {
      type = "number";
    }
    return(type);
  }

  let classes = {
    "size-sm": props.size === "sm",
    "size-lg": props.size === "lg",
    "error": !isEmpty(props.formLinker.getError(props.name)),
    "currency": props.type === "currency"
  };
  let value = props.formLinker.getValue(props.name);
  let inputProps = {
    disabled: props.disabled,
    hidden: props.type === "hidden",
    maxLength: props.maxLength,
    name: props.name,
    onBlur: () => blur(),
    onChange: (e) => change(e),
    onFocus: () => focus(),
    placeholder: props.placeholder,
    type: type(),
    value: (isNil(value) ? "" : value)
  };

  return(
    <ClassNames>
      {({cx}) => <Style className={cx(classes, "input", `input-name-${props.name}`)} {...inputProps}/>}
    </ClassNames>
  );
};

Input.componentDescription = "Form input element. Used for all form inputs.";
Input.componentKey = "Form field input";
Input.componentName = "Form field input";

Input.propDescriptions = {
  formLinker: "Form linker instance.",
  label: "Label text.",
  maxLength: "Max number of characters allowed in the input",
  name: "Used as a unique identifier for this input in its form. Duplicate names can be used as long as they are in seperate forms.",
  onBlur: "Callback function when input is blurred.",
  onChange: "Callback function when input is changed.",
  onFocus: "Callback function when input is focused.",
  size: "Size of input. Options are \"lg\", \"md\", and \"sm\".",
  type: "Type of input. Options are \"currency\", \"creditCard\", \"date\", \"email\", \"number\", \"percent\", \"phone\", \"ssn\", \"ssnLast4\", \"string\".",
  _update: "Private callback function to rerender parent on input change, focus, or blur."
};

Input.propTypes = {
  disabled: PropTypes.bool,
  formLinker: PropTypes.object.isRequired,
  maxLength: PropTypes.string,
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  size: PropTypes.string,
  type: PropTypes.string,
  _update: PropTypes.func
};

Input.defaultProps = {
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  size: "md",
  type: "string",
  _update: () => {}
};

export default Input;
