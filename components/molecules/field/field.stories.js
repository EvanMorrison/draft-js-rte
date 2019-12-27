import FormLinker from "form-linker";
import React, { useState, useEffect, useRef } from "react";
import { storiesOf } from "@storybook/react";
import { boolean, object, number, select, text } from "@storybook/addon-knobs";
import { Formatters, Masks, Field } from "../../citadel";

const stories = storiesOf("Molecules", module);

const typeOptions = ["plain", "checkbox", "currency", "multiSelect", "radio", "select", "text", "editor", "summernote"];

const inputTypes = ["currency", "date", "email", "number", "percent", "phone", "ssn", "ssnLast4", "string"];

const selectionOptions = [
  {label: "JavaScript", value: "js"},
  {label: "Elixir", value: "elixir"},
  {label: "Java", value: "java"},
  {label: "Python", value: "python"}
];

const setRequiredInSchema = (isRequired, fl) => {
  let schemaProperty = fl.schema.storyInput;
  if(isRequired) {
    fl.schema = {storyInput: schemaProperty + ".required"};
  } else {
    fl.schema = {storyInput: schemaProperty.replace(".required", "")};
    fl.validateAll();
  }
};

const Wrapper = (props) => {
  const formLinker = useRef(new FormLinker({
    formatters: Formatters,
    masks: Masks,
    schema: {
      storyInput: "string"
    }
  }));
  const fl = formLinker.current;

  const [maxWidth, setMaxWidth] = useState("400px");
  const [_, setForceUpdate] = useState(props.type + props.inputType);

  useEffect(() => {
    if(["editor", "summernote", "text"].includes(props.type)) {
      setMaxWidth("1200px");
      fl.schema = {storyInput: "string"};
    } else {
      setMaxWidth("400px");
    }
    if(props.type === "currency") {
      fl.schema = {storyInput: "currency"};
    } else if(props.type === "radio" || props.type === "select") {
      fl.schema = {storyInput: "string"};
      fl.setValue("storyInput", "");
    } else if(props.type === "multiSelect") {
      setMaxWidth("600px");
      fl.schema = {storyInput: "array"};
      fl.setValue("storyInput", []);
    } else if(props.type === "checkbox") {
      fl.schema = {storyInput: "boolean"};
      fl.setValue("storyInput", false);
    } else {
      fl.schema = {storyInput: props.inputType};
      fl.setValue("storyInput", "");
    }
    setRequiredInSchema(props.required, fl);
    setForceUpdate(props.type + props.inputType + props.required);
  }, [props.type, props.inputType, props.required, fl]);

  let msColumns;
  if(props.type === "multiSelect") {
    msColumns = select("columns", [1, 2, 3, 4], 2);
  } else {
    msColumns = null;
  }

  let maxLength;
  if(["plain", "text"].includes(props.type)) {
    maxLength = text("maxLength", "");
  } else {
    maxLength = null;
  }
  return(
    <div css={{maxWidth: maxWidth}}>
      <Field
        key={" " + msColumns}
        formLinker={fl}
        name="storyInput"
        type={props.type}
        inputType={props.inputType} // inputType prop only applicable if type prop is omitted (i.e. "plain" input field);
        label={text("label", `${props.type} input ${props.type === "plain" ? " - masking (inputType): " + props.inputType : ""}`)}
        placeholder={text("placeholder", `This is a ${props.type} input`)}
        info={text("info", "Optionally provide additional info or instructions with the info prop")}
        required={props.required}
        disabled={props.disabled}
        maxLength={maxLength}
        size={select("size", ["sm", "md", "lg"], "md")}
        checkboxes={props.type === "multiSelect" ? boolean("checkboxes", true) : null} // this prop only applies for multiSelect field type
        showAllSelected={props.type === "multiSelect" ? boolean("showAllSelected", false) : null} // this prop only applies for multiselect
        columns={msColumns} // applies only for multiselect
        showNoneOption={props.type === "select" ? boolean("showNoneOption", true) : null} // only applies for select field type
        noneLabel={props.type === "select" ? text("noneLabel", "Select an option") : null} // only applies for select field type
        options={props.type === "multiSelect" || props.type === "radio" || props.type === "select" ? object("options", selectionOptions) : null} // options are only applicable for radio, select, and multiSelect type fields
        minHeight={props.type === "editor" || props.type === "summernote" ? number("minHeight", 200) : null}
        maxHeight={props.type === "editor" || props.type === "summernote" ? number("maxHeight", 200) : null}
      />
    </div>
  );
};

stories.add("Field", () => {
  let type = select("type", typeOptions, "plain");
  let inputType;
  if(type === "plain") {
    inputType = select("inputType", inputTypes, "string");
  } else {
    inputType = "string";
  }
  return(
    <Wrapper
      type={type}
      inputType={inputType}
      required={boolean("required", false)}
      disabled={boolean("disabled", false)}
    />
  );
}, {
  info: {
    propTables: [Field],
    propTablesExclude: [Wrapper]
  },
  jest: ["field"]
});