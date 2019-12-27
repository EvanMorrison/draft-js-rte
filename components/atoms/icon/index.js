import PropTypes from "prop-types";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class Icon extends React.Component {
  icon(original) {
    const name = original.substring(0, original.length - 4);

    if((original.length - original.indexOf("reg")) === 3) {
      return(["far", name]);
    } else if((original.length - original.indexOf("lgt")) === 3) {
      return(["fal", name]);
    } else if((original.length - original.indexOf("sld")) === 3) {
      return(["fas", name]);
    } else {
      console.error("You have not provided a valid icon type");
      return(["fas", name]);
    }
  }

  render() {
    let props = {
      border: this.props.border,
      color: this.props.color,
      fixedWidth: this.props.fixedWidth,
      flip: this.props.flip,
      icon: this.icon(this.props.name),
      inverse: this.props.inverse,
      listItem: this.props.listItem,
      onClick: (e) => this.props.onClick(e),
      pulse: this.props.pulse,
      rotation: this.props.rotation,
      size: this.props.size,
      spin: this.props.spin,
      transform: this.props.transform
    };

    return(<FontAwesomeIcon {...props}/>);
  }
}

Icon.componentDescription = "Icon library.";
Icon.componentKey = "icon";
Icon.componentName = "Icon";

Icon.propDescriptions = {
  border: "Border",
  fixedWidth: "Fixed width",
  flip: "Flip",
  inverse: "Inverse",
  listItem: "List item",
  name: "Name of the icon.",
  pulse: "Pulse",
  rotation: "Rotate",
  size: "Size of icon. Options for fa icons are \"xs\", \"sm\", \"lg\", \"2x\", \"3x\", \"4x\", \"5x\", \"6x\", \"7x\", \"8x\", \"9x\", \"10x\"",
  spin: "Spin",
  transform: "Advanced transformation."
};

Icon.propTypes = {
  border: PropTypes.bool,
  color: PropTypes.string,
  fixedWidth: PropTypes.bool,
  flip: PropTypes.string,
  inverse: PropTypes.bool,
  listItem: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  pulse: PropTypes.bool,
  rotation: PropTypes.number,
  size: PropTypes.string,
  spin: PropTypes.bool
};

Icon.defaultProps = {
  onClick: () => {}
};

export default Icon;
