import Checkbox from '../../molecules/checkbox';
// import Currency from '../../atoms/currency';
import Input from '../../atoms/input';
import Info from '../../atoms/info';
import Label from '../../atoms/label';
// import MultiSelect from '../../molecules/multiSelect';
import PropTypes from 'prop-types';
// import RadioBtn from '../../molecules/radioBtn';
import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import RichEditor from '../..//organisms/richEditor';
// import Select from '../../atoms/select';
import Style from './field.style';
// import SummernoteEditor from '../../organisms/summernote';
import Textarea from '../../atoms/textarea';
import { get, isEmpty, isNil } from 'lodash';

const reducer = (state, action = false) => {
  if (action) {
    return 'setValues';
  } else return ++state > 0 ? state : 0;
};

const Field = ({ setRef = () => {}, formLinker, ...props }) => {
  const inputRef = useRef();
  const [state, forceUpdate] = useReducer(reducer, 0);

  const handleChange = value => {
    if (props.inputDisabled) {
      return null;
    }
    formLinker.setValue(props.name, value);

    props.onChange(value);
  };

  const handleBlur = () => {
    if (props.type !== 'summernote') {
      formLinker.validate(props.name);
    }
    props.onBlur();
  };

  const handleFocus = () => {
    formLinker.setError(props.name, []);
    props.onFocus();
  };

  const setRefFn = useCallback(
    el => {
      if (el !== null) {
        inputRef.current = el;
        setRef(el);
        formLinker.setRef(props.name, { forceUpdate, inputRef });
      }
    },
    [formLinker, props.name, setRef]
  );

  useEffect(() => {
    formLinker.setRef(props.name, { forceUpdate, inputRef });
    return () => {
      formLinker.setRef(props.name, null);
    };
  }, [formLinker, props.name]);

  const isValueSet = useRef(false);
  useEffect(() => {
    if (
      !isValueSet.current &&
      state === 'setValues' &&
      ['editor', 'summernote'].includes(props.type) &&
      inputRef.current
    ) {
      isValueSet.current = true;
      inputRef.current.reset(formLinker.getValue(props.name));
    } else if (isValueSet.current && state === 'setValues') {
      isValueSet.current = false;
    }
  }, [formLinker, props.name, props.type, state]);

  const renderInfo = () => {
    if (props.type === 'checkbox') {
      return null;
    }

    return <Info info={props.info} />;
  };

  const renderInput = () => {
    const commonProps = {
      onBlur: handleBlur,
      onChange: handleChange,
      onFocus: handleFocus,
      value: formLinker.getValue(props.name),
      error: formLinker.getError(props.name) && !isEmpty(formLinker.getError(props.name)),
    };
    switch (props.type) {
      case 'checkbox': {
        const checkProps = {
          checkStatus: formLinker.getValue(props.name),
          hollow: true,
          onCheck: handleChange,
          error: formLinker.getError(props.name),
        };

        const classes = ['checkbox-wrapper', checkProps.checkStatus && 'active', `size-${props.size}`]
          .filter(Boolean)
          .join(' ');

        return (
          <div className={classes}>
            <Checkbox {...props} {...checkProps} ref={inputRef} />
            <Info {...props} />
          </div>
        );
      }
      case 'text':
        return <Textarea {...props} {...commonProps} ref={inputRef} />;
      // case 'select':
      //   return <Select {...props} {...commonProps} ref={inputRef} />;
      // case 'radio':
      //   return <RadioBtn {...props} {...commonProps} ref={inputRef} />;
      // case 'multiSelect':
      //   return <MultiSelect {...props} {...commonProps} ref={setRefFn} />;
      case 'editor':
        return <RichEditor {...props} {...commonProps} ref={setRefFn} formLinker={formLinker} />;
      // case 'summernote':
      //   return <SummernoteEditor {...props} {...commonProps} ref={setRefFn} formLinker={formLinker} />;
      // case 'currency':
      //   return <Currency {...props} {...commonProps} type={props.inputType} ref={inputRef} />;
      default:
        return <Input {...props} {...commonProps} type={props.inputType} ref={inputRef} />;
    }
  };

  const renderLabel = () => {
    if (props.type === 'checkbox') {
      return null;
    }

    const item = get(formLinker.schema, props.name);
    const required = !isNil(item) && item.includes('required');

    return (
      <Label
        label={props.label}
        errors={formLinker.getError(props.name)}
        name={props.name}
        required={required}
        size={props.size}
        disabled={props.disabled}
      />
    );
  };

  const classes = ['form-field', props.type === 'checkbox' && 'checkbox-type'].filter(Boolean).join(' ');

  if (isNil(formLinker)) {
    console.error('Warning: Field requires FormLinker.');
  } else if (isNil(props.name)) {
    console.error('Warning: Field requires name.');
  } else if (!get(formLinker.schema, props.name)) {
    console.error(`Warning: The ${props.name} field name is not found in the schema.`);
  }

  return (
    <Style className={classes}>
      {renderLabel()}
      {renderInfo()}
      {renderInput()}
    </Style>
  );
};

Field.componentDescription = 'Field is a combination of input, label, select, and error components.';
Field.componentKey = 'field';
Field.componentName = 'Form field';

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
  info: PropTypes.node,
  /** Applies only to basic input (when "type" prop is omitted). Options are "text", "number", "currency", "password", "hidden". Defaults to "text". */
  inputType: PropTypes.string,
  /** Label text. */
  label: PropTypes.node,
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
  /** Array of objects to provide the multiSelect, select, & radio field types. */
  options: PropTypes.array,
  /** String for the placeholder text inside an input. */
  placeholder: PropTypes.string,
  /** Select type only. Whether or not to have a default "None" option for the select. */
  showNoneOption: PropTypes.bool,
  /** Size of input. Options are "lg", "md", and "sm". */
  size: PropTypes.oneOf(['lg', 'md', 'sm']),
  /** Type of input. Options are [none] (defaults to basic input), "checkbox", "currency", "editor", "multiSelect", "radio", "select", "summernote", "text" (textarea). */
  type: PropTypes.oneOf([
    'input',
    'currency',
    'checkbox',
    'radio',
    'select',
    'multiSelect',
    'text',
    'editor',
    'summernote',
  ]),
};

Field.defaultProps = {
  onBlur: () => {},
  onChange: () => {},
  onFocus: () => {},
  size: 'md',
};

export default Field;
