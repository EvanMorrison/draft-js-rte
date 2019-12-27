import PropTypes from "prop-types";
import React from "react";
import Style from "./textarea.style";
import { isEmpty, isNil } from "lodash";
import { ClassNames } from "@emotion/core";

const Textarea = props => {
  function blur() {
    props.formLinker.validate(props.name);
    props._update();
    props.onBlur();
  }

  function change(e) {
    props.formLinker.setValue(props.name, e.target.value);
    props._update();
  }

  function focus() {
    props.formLinker.setError(props.name, []);
    props._update();
    props.onFocus();
  }

  function handleKeyUp(e) {
    if(e.keyCode === 13) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  let classes = {
    error: !isEmpty(props.formLinker.getError(props.name)),
    textarea: true,
    disabled: props.disabled,
    [props.className]: !isNil(props.className)
  };
  let textareaProps = {
    disabled: props.disabled,
    maxLength: props.maxLength,
    name: props.name,
    placeholder: props.placeholder,
    onBlur: () => blur(),
    onChange: (e) => change(e),
    onFocus: () => focus(),
    value: props.formLinker.getValue(props.name) || "",
    rows: props.rows
  };

  return(
    <ClassNames>
      {({cx}) => <Style className={cx(classes)} {...textareaProps} onKeyUp={handleKeyUp}/>}
    </ClassNames>
  );
};

Textarea.componentDescription = "Form textarea element. Used for all form text boxes.";
Textarea.componentKey = "textarea";
Textarea.componentName = "Form field text area";

Textarea.propDescriptions = {
  formLinker: "Form linker instance.",
  disabled: "Boolean whether the text area is disabled.",
  label: "Label text.",
  maxLength: "Max number of characters allowed in the text area",
  name: "Used as a unique identifier for this input in its form. Duplicate names can be used as long as they are in seperate forms.",
  onBlur: "Callback function when input is blurred.",
  onChange: "Callback function when input is changed.",
  onFocus: "Callback function when input is focused.",
  _update: "Private callback function to rerender parent on input change, focus, or blur."
};

Textarea.propTypes = {
  formLinker: PropTypes.object,
  disabled: PropTypes.bool,
  maxLength: PropTypes.string,
  name: PropTypes.string.isRequired,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  required: PropTypes.bool,
  rows: PropTypes.number,
  _update: PropTypes.func
};

Textarea.defaultProps = {
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  required: false,
  rows: 7,
  _update: () => {}
};

export default Textarea;
