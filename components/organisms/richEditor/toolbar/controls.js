import ColorList from './colorList';
import ControlButton from './button';
import Dropdown from './richEditorDropdown';
import Icon from '../../../atoms/icon';
import ImageForm from './imageForm';
import LinkForm from './linkForm';
import ListContent from './basicList';
import React from 'react';
import TableGrid from './tableGrid';
import Translator from 'simple-translator';
import { availableControls, controlSets } from '../utils/constants';
import { isNil } from 'lodash';

const Controls = props => {
  const renderControls = () => {
    let controls = isNil(props.toolbar) ? ['default'] : [...props.toolbar];
    controls = expandControlSets(controls);
    return renderControlGroups(controls);
  };

  const expandControlSets = controls => {
    return controls.flatMap(entry => {
      if (Array.isArray(entry) && controlSets[entry]) {
        return [controlSets[entry]];
      }
      return controlSets[entry] || [entry];
    });
  };

  const renderControlGroups = (controls, id) => {
    const results = controls.map((controlName, index) => {
      if (Array.isArray(controlName)) {
        return (
          <div className='control-group' key={index}>
            {renderControlGroups(controlName, index)}
          </div>
        );
      }
      if (availableControls[controlName]) {
        return controlRenderFunctions[availableControls[controlName].method](controlName, index);
      }

      const { customControls } = props;
      if (React.isValidElement(customControls[controlName])) {
        return React.cloneElement(customControls[controlName], { key: controlName });
      }
      if (customControls && customControls[controlName]) {
        return customListDropdown(controlName, props.customControls[controlName]);
      }
      return null;
    });
    return (
      <div key={id} className='control-row'>
        {results}
      </div>
    );
  };

  const customListDropdown = (controlName, controlData) => {
    const customListProps = {
      activeOption: controlData,
      editor: props.editor,
      key: controlName,
      list: controlData.availableItems,
      ...controlData.dimensions,
      onSelect: type => props.customListSelect(type),
    };
    return <Dropdown render={props => <ListContent {...props} />} {...customListProps} />;
  };

  const controlRenderFunctions = {
    listDropdown: controlName => {
      let current;
      if (controlName === 'alignment') {
        current = props.blockData.get('text-align');
      }
      if (controlName === 'blockType') {
        current = props.blockType === 'pasted-list-item' ? 'ordered-list-item' : props.blockType;
      }
      if (controlName === 'fontFamily') {
        current = props.activeStyles.fontFamily || '--';
      }
      if (controlName === 'fontSize') {
        current = props.activeStyles.fontSize || '--';
      }
      const controlProps = {
        activeOption: availableControls[controlName].activeOption(current),
        controlWidth: availableControls[controlName].controlWidth,
        dropdownWidth: availableControls[controlName].dropdownWidth,
        editor: props.editor,
        key: controlName,
        list: availableControls[controlName].list,
        onSelect: selection => props[controlName + 'Select'](selection),
      };
      if (controlName === 'color') {
        return <Dropdown render={props => <ColorList {...props} />} {...controlProps} />;
      } else {
        return <Dropdown render={props => <ListContent {...props} />} {...controlProps} />;
      }
    },

    formDropdown: controlName => {
      const controlProps = {
        activeOption: availableControls[controlName].activeOption(),
        allowInput: true,
        controlWidth: availableControls[controlName].controlWidth,
        dropdownWidth: availableControls[controlName].dropdownWidth,
        editor: props.editor,
        editorState: props.editorState,
        key: controlName,
        onSelect: item => props[controlName](item),
      };
      if (controlName === 'insertImage') {
        return <Dropdown render={props => <ImageForm {...props} />} {...controlProps} />;
      } else {
        return <Dropdown open={props.openLinkForm} render={props => <LinkForm {...props} />} {...controlProps} />;
      }
    },

    tableDropdown: controlName => {
      const controlProps = {
        activeOption: availableControls[controlName].activeOption(),
        controlWidth: availableControls[controlName].controlWidth,
        dropdownWidth: availableControls[controlName].dropdownWidth,
        editor: props.editor,
        key: controlName,
        onSelect: size => props[controlName](size),
      };
      return <Dropdown render={props => <TableGrid {...props} />} {...controlProps} />;
    },

    controlButton: controlName => {
      let active = props.currentStyle ? props.currentStyle.has(controlName.toUpperCase()) : null;
      let style = controlName.toUpperCase();
      if (controlName === 'floatRight') {
        active = props.blockData.get('float') === 'right';
        style = { float: 'right' };
      }
      if (controlName === 'bulletList' || controlName === 'numberList') {
        const blockType =
          controlName === 'bulletList' ? 'unordered-list-item' : ['ordered-list-item', 'pasted-list-item'];
        active = blockType === props.blockType || (controlName === 'numberList' && blockType.includes(props.blockType));
      }
      const btnProps = {
        active,
        key: controlName,
        label: <Icon name={availableControls[controlName].icon} />,
        onToggle: props[availableControls[controlName].callback],
        style,
        tooltip: Translator.translate(availableControls[controlName].tooltip || ''),
        tooltipOrientation: props.tooltipOrientation,
      };

      return <ControlButton {...btnProps} />;
    },

    spacer: (_, index) => {
      return <div className='spacer' key={'spacer' + index}></div>;
    },
  };

  return <div className='editor-controls'>{renderControls()}</div>;
};

export default Controls;
