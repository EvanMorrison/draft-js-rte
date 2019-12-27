// import Checkbox from "../../molecules/checkbox";
// import Currency from "../../atoms/currency";
import Input from "../../atoms/input";
import Info from "../../atoms/info";
import Label from "../../atoms/label";
// import MultiSelect from "../../molecules/multiSelect";
import PropTypes from "prop-types";
// import RadioBtn from "../../molecules/radioBtn";
import React from "react";
// import RichEditor from "../../organisms/richEditor";
// import Select from "../../atoms/select";
import Style from "./field.style";
// import SummernoteEditor from "../../organisms/summernote";
import Textarea from "../../atoms/textarea";
import { get, isNil } from "lodash";
import { ClassNames } from "@emotion/core";

class Field extends React.Component {
  handleCheck() {
    if(this.props.inputDisabled) { return(null); }

    let value = this.props.formLinker.getValue(this.props.name) || false;
    value = !value;
    this.props.formLinker.setValue(this.props.name, value);
    this.forceUpdate();
    this.props.onChange();
  }

  _update() {
    this.forceUpdate();
  }

  renderInfo() {
    if(this.props.type === "checkbox") { return(null); }

    return(<Info info={this.props.info}/>);
  }

  renderInput() {
    if(this.props.type === "text") {
      return(<Textarea {...this.props} _update={() => this._update()}/>);
    } else if(this.props.type === "select") {
      return(<Select {...this.props} _update={() => this._update()}/>);
    } else if(this.props.type === "multiSelect") {
      return(<MultiSelect {...this.props} ref={this.props.setRef} _update={() => this._update()}/>);
    } else if(this.props.type === "checkbox") {
      let checkProps = {
        checkStatus: this.props.formLinker.getValue(this.props.name),
        hollow: true,
        onCheck: () => this.handleCheck()
      };

      const classes = {
        "checkbox-wrapper": true,
        "active": checkProps.checkStatus
      };

      return(
        <ClassNames>
          {({cx}) => (
            <div className={cx(classes)}>
              <Checkbox {...this.props} {...checkProps}/>
              <Info {...this.props}/>
            </div>
          )}
        </ClassNames>
      );
    } else if(this.props.type === "radio") {
      return(<RadioBtn {...this.props} _update={() => this._update()}/>);
    } else if(this.props.type === "editor") {
      return(<RichEditor {...this.props} ref={this.props.setRef}/>);
    } else if(this.props.type === "summernote") {
      return(<SummernoteEditor {...this.props} ref={this.props.setRef}/>);
    } else if(this.props.type === "currency") {
      return(<Currency {...this.props} type={this.props.inputType} _update={() => this._update()}/>);
    } else {
      return(<Input {...this.props} type={this.props.inputType} _update={() => this._update()}/>);
    }
  }

  renderLabel() {
    if(this.props.type === "checkbox") { return(null); }

    const item = get(this.props.formLinker.schema, this.props.name);
    const required = (isNil(item)) ? false : item.split(".").indexOf("required") >= 0;

    return(<Label label={this.props.label} errors={this.props.formLinker.getError(this.props.name)} name={this.props.name} required={required} disabled={this.props.disabled}/>);
  }

  render() {
    let classes = {
      "form-field": true,
      "checkbox-type": this.props.type === "checkbox"
    };
    if(isNil(this.props.formLinker)) {
      console.error("Warning: Field requires FormLinker.");
    } else if(isNil(this.props.name)) {
      console.error("Warning: Field requires name.");
    } else if(!get(this.props.formLinker.schema, this.props.name)) {
      console.error(`Warning: The ${this.props.name} field name is not found in the schema.`);
    }

    return(
      <ClassNames>
        {({cx}) => (
          <Style className={cx(classes)}>
            {this.renderLabel()}
            {this.renderInfo()}
            {this.renderInput()}
          </Style>
        )}
      </ClassNames>
    );
  }
}

Field.componentDescription = "Field is a combination of input, label, select, and error components.";
Field.componentKey = "field";
Field.componentName = "Form field";

Field.propDescriptions = {
  disabled: "Boolean to dictate whether or not the input is disabled.",
  name: "Used as a unique identifier for this input in its form. Duplicate names can be used as long as they are in seperate forms.",
  inputType: "Type of input. Options are \"currency\", \"date\", \"email\", \"multiSelect\", \"number\", \"percent\", \"phone\", \"select\", \"ssn\", \"ssnLast4\", \"string\".",
  formLinker: "Form linker instance.",
  label: "Label text.",
  maxLength: "Max number of characters allowed in the field",
  noneLabel: "String for setting the none option for the select.",
  onBlur: "Callback function when input is blurred.",
  onChange: "Callback function when input is changed.",
  onFocus: "Callback function when input is focused.",
  options: "Array of objects to provide the select options.",
  placeholder: "String for the placeholder text inside an input.",
  required: "Boolean of whether this input is required for valid form submission.",
  showNoneOption: "Boolean to indidcate whether or not to have a default none option for the select.",
  size: "Size of input. Options are \"lg\", \"md\", and \"sm\"."
};

Field.propTypes = {
  /** MultiSelect type only. Whether to use the checkbox style multiselect */
  checkboxes: PropTypes.bool,
  /** MultiSelect type only. The number of columns to group options in. Defaults to 2. */
  columns: PropTypes.oneOf([1, 2, 3, 4]),
  /** whether or not the input is disabled. */
  disabled: PropTypes.bool,
  /** Form linker instance. */
  formLinker: PropTypes.object.isRequired,
  /** Additional information or instructions displayed below the label and above the input */
  info: PropTypes.string,
  /** Applies only to basic input (when "type" prop is omitted). Sets masking type for basic input. Options are [none] (defaults to string), "currency", "date", "email", "number", "percent", "phone", "ssn", "ssnLast4", "string". */
  inputType: PropTypes.string,
  /** Label text. */
  label: PropTypes.string,
  /** Max number of characters allowed in the field */
  maxLength: PropTypes.string,
  /** Used as a unique identifier for this input in its form. Duplicate names can be used as long as they are in seperate forms. */
  name: PropTypes.string.isRequired,
  /** Select type only. String for setting the none option label for the select. */
  noneLabel: PropTypes.string,
  /** Callback function when input is blurred. */
  onBlur: PropTypes.func,
  /** Callback function when input is changed. */
  onChange: PropTypes.func,
  /** Callback function when input is focused. */
  onFocus: PropTypes.func,
  /** Callback function for inserting images in the draftjs RichEditor. Use when a service is available to upload the image and return a url for insertion in the editor */
  onUpload: PropTypes.func,
  /** Array of objects to provide the multiSelect, select, & radio field types. */
  options: PropTypes.array,
  /** String for the placeholder text inside an input. */
  placeholder: PropTypes.string,
  /** Whether this input is required for valid form submission. */
  required: PropTypes.bool,
  /** Select type only. Whether or not to have a default "None" option for the select. */
  showNoneOption: PropTypes.bool,
  /** Size of input. Options are "lg", "md", and "sm". */
  size: PropTypes.oneOf(["lg", "md", "sm"]),
  /** Type of input. Options are [none] (defaults to basic input), "checkbox", "currency", "editor", "multiSelect", "radio", "select", "summernote", "text". */
  type: PropTypes.string
};

Field.defaultProps = {
  onBlur: () => {},
  onChange: () => {},
  onFocus: () => {},
  size: "md"
};

export default Field;
