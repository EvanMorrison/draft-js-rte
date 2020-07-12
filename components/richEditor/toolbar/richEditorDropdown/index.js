import DropdownBtn from "../../../molecules/dropdownBtn";
import Icon from "../../../atoms/icon";
import PropTypes from "prop-types";
import React from "react";
import style from "./dropdown.style";

export default class RichEditorDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.dropdownRef = React.createRef();

    const { controlWidth, dropdownWidth } = this.props;
    this.state = {
      open: false,
      controlWidth: controlWidth || 50,
      dropdownWidth: (dropdownWidth && dropdownWidth + 'px') || 'fit-content',
      orientation: 'left',
    };
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.open && this.props.open) {
      this.handleButtonClick();
    }
  }

  handleButtonClick() {
    this.setState(({ open }) => ({ open: !open }));
  }

  handleSubmit(style) {
    this.props.onSelect(style);

    this.handleButtonClick();
  }

  renderBtnContent() {
    const { name, icon, style } = this.props.activeOption.display;
    return (
      <React.Fragment>
        {icon ? <Icon name={icon} /> : null}
        {name ? <span style={style}>{name}</span> : null}
        <Icon name='chevron-down-sld' />
      </React.Fragment>
    );
  }

  render() {
    const dropdownProps = {
      buttonContent: this.renderBtnContent(),
      dropdownOpen: this.state.open,
      dropdownOrientation: this.state.orientation,
      dropdownTop: 42,
      onButtonClick: () => this.handleButtonClick(),
      container: this.props.editor.current?.editorContainer,
      css: style(this.state),
      ...(!this.props.allowInput && { onMouseDown: e => e.preventDefault() }),
    };
    const contentProps = {
      handleSubmit: result => this.handleSubmit(result),
      open: this.state.open,
      ...this.props,
    };
    return <DropdownBtn {...dropdownProps}>{this.props.render(contentProps)}</DropdownBtn>;
  }
}

RichEditorDropdown.propTypes = {
  activeOption: PropTypes.shape({
    display: PropTypes.object.isRequired,
    type: PropTypes.string,
  }),
  allowInput: PropTypes.bool,
  render: PropTypes.func,
};

RichEditorDropdown.defaultProps = {
  activeOption: { display: {} },
  allowInput: false,
  render: () => {},
};
