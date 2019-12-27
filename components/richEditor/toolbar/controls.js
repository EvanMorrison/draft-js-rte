import ColorList from "./colorList";
import ControlButton from "./button";
import Dropdown from "./richEditorDropdown";
import Icon from "../../atoms/icon";
import ImageForm from "./imageForm";
import LinkForm from "./linkForm";
import ListContent from "./basicList";
import React from "react";
import ScrollMessage from "./scrollMessage";
import TableGrid from "./tableGrid";
import Translator from "simple-translator";
import { FlexGrid, FlexItem } from "flex-item";
import { availableControls, controlSets } from "../utils/constants";

const Controls = props => {
  const renderControls = () => {
    const controls = (props.toolbar === undefined) ? ["default"] : [...props.toolbar];
    return(renderControlGroups(controls));
  };

  const renderControlGroups = (controls, id) => {
    let results = controls.map((controlName, index) => {
      controlName = controlSets[controlName] || controlName;
      if(Array.isArray(controlName)) { return(<FlexGrid className="control-row" key={index}>{renderControlGroups(controlName, index)}</FlexGrid>); }
      if(availableControls[controlName]) { return(controlRenderFunctions[availableControls[controlName].method](controlName, index)); }
      if(controlName === "scrollMessage") { return((!props.noScrollMessage && props.hasScrolling) && <ScrollMessage key={"scroll-message"}/>); }
      const {customControls} = props;
      if(React.isValidElement(customControls[controlName])) { return(React.cloneElement(customControls[controlName], {key: controlName})); }
      if(customControls && customControls[controlName]) { return(customListDropdown(controlName, props.customControls[controlName])); }
      return(null);
    });
    return(<FlexItem key={id} className="control-group">{results}</FlexItem>);
  };

  const customListDropdown = (controlName, controlData) => {
    const customListProps = {
      activeOption: controlData,
      editorName: props.editorName,
      key: controlName,
      list: controlData.availableItems,
      ...controlData.dimensions,
      onSelect: type => props.customListSelect(type)
    };
    return(<Dropdown render={props => (<ListContent {...props}/>)} {...customListProps}/>);
  };

  const controlRenderFunctions = {
    listDropdown: (controlName) => {
      let current;
      if(controlName === "alignment") { current = props.blockData.get("text-align"); }
      if(controlName === "blockType") { current = props.blockType; }
      if(controlName === "fontFamily") { current = props.activeStyles.fontFamily || "--"; }
      if(controlName === "fontSize") { current = props.activeStyles.fontSize || "--"; }
      const controlProps = {
        activeOption: availableControls[controlName].activeOption(current),
        controlWidth: availableControls[controlName].controlWidth,
        dropdownWidth: availableControls[controlName].dropdownWidth,
        editorName: props.editorName,
        key: controlName,
        list: availableControls[controlName].list,
        onSelect: selection => props[controlName + "Select"](selection)
      };
      if(controlName === "color") {
        return(<Dropdown render={props => (<ColorList {...props}/>)} {...controlProps}/>);
      } else {
        return(<Dropdown render={props => (<ListContent {...props}/>)} {...controlProps}/>);
      }
    },

    formDropdown: (controlName) => {
      const controlProps = {
        activeOption: availableControls[controlName].activeOption(),
        allowInput: true,
        controlWidth: availableControls[controlName].controlWidth,
        dropdownWidth: availableControls[controlName].dropdownWidth,
        editorName: props.editorName,
        editorState: props.editorState,
        key: controlName,
        onSelect: item => props[controlName](item)
      };
      if(controlName === "insertImage") {
        return(<Dropdown render={props => (<ImageForm {...props}/>)} {...controlProps}/>);
      } else {
        return(<Dropdown open={props.openLinkForm} render={props => (<LinkForm {...props}/>)} {...controlProps}/>);
      }
    },

    tableDropdown: (controlName) => {
      const controlProps = {
        activeOption: availableControls[controlName].activeOption(),
        controlWidth: availableControls[controlName].controlWidth,
        dropdownWidth: availableControls[controlName].dropdownWidth,
        editorName: props.editorName,
        key: controlName,
        onSelect: size => props[controlName](size)
      };
      return(<Dropdown render={props => (<TableGrid {...props}/>)} {...controlProps}/>);
    },

    controlButton: (controlName) => {
      let active = props.currentStyle ? props.currentStyle.has(controlName.toUpperCase()) : null;
      let style = controlName.toUpperCase();
      if(controlName === "floatRight") {
        active = props.blockData.get("float") === "right";
        style = {float: "right"};
      }
      if(controlName === "bulletList" || controlName === "numberList") {
        const blockType = controlName === "bulletList" ? "unordered-list-item" : "ordered-list-item";
        active = props.blockType === blockType;
      }
      const btnProps = {
        active,
        key: controlName,
        label: <Icon name={availableControls[controlName].icon}/>,
        onToggle: props[availableControls[controlName].callback],
        style,
        tooltip: Translator.translate(availableControls[controlName].tooltip || ""),
        tooltipOrientation: props.tooltipOrientation
      };

      return(<ControlButton {...btnProps}/>);
    },

    spacer: (_, index) => {
      return(<div className="spacer" key={"spacer" + index}></div>);
    }
  };

  return(
    <FlexGrid className="editor-controls">
      {renderControls()}
    </FlexGrid>
  );
};

export default Controls;
