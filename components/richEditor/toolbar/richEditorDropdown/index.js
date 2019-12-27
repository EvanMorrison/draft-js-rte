import DropdownBtn from "../../../molecules/dropdownBtn";
import Icon from "../../../atoms/icon";
import PropTypes from "prop-types";
import React from "react";
import Style from "./dropdown.style";

export default class RichEditorDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.dropdownRef = React.createRef();

    const {controlWidth, dropdownWidth, maxHeight} = this.props;
    this.state = {
      open: false,
      controlWidth: controlWidth || 50,
      dropdownWidth: dropdownWidth || controlWidth || 65,
      maxHeight: (maxHeight ? Math.min(maxHeight, 470) : 470),
      orientation: "left"
    };
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.open && this.props.open) {
      this.handleOpen();
    }
  }

  handleOpen() {
    if(!this.state.open) {
      const editor = document.getElementById(this.props.editorName);
      const dimensions = editor.getBoundingClientRect();
      let left = this.dropdownRef.current.getBoundingClientRect().left - dimensions.left;
      const orientation = left < dimensions.width / 2 ? "left" : "right";
      this.setState({orientation, open: true});
    } else {
      this.setState({open: false});
    }
  }

  handleSubmit(style) {
    this.props.onSelect(style);

    this.handleOpen();
  }

  renderBtnContent() {
    const {name, icon, style} = this.props.activeOption.display;
    return(
      <React.Fragment>
        {icon ? <Icon name={icon}/> : null}
        {name ? <span style={style}>{name}</span> : null}
        <Icon name="chevron-down-sld"/>
      </React.Fragment>
    );
  }

  render() {
    const dropdownProps = {
      buttonContent: this.renderBtnContent(),
      dropdownOpen: this.state.open,
      dropdownTop: "38px",
      dropdownOrientation: this.state.orientation,
      onButtonClick: () => this.handleOpen()
    };
    const contentProps = {
      handleSubmit: (result) => this.handleSubmit(result),
      open: this.state.open,
      ...this.props
    };

    return(
      <div ref={this.dropdownRef}>
        <Style className="rich-editor-dropdown" onMouseDown={(e) => (this.props.allowInput ? null : e.preventDefault())} {...this.state}>
          <DropdownBtn {...dropdownProps} >
            {this.props.render(contentProps)}
          </DropdownBtn>
        </Style>
      </div>
    );
  }
}

RichEditorDropdown.propTypes = {
  activeOption: PropTypes.shape({
    display: PropTypes.object.isRequired,
    type: PropTypes.string
  }),
  allowInput: PropTypes.bool,
  render: PropTypes.func
};

RichEditorDropdown.defaultProps = {
  activeOption: {display: {}},
  allowInput: false,
  render: () => {}
};
