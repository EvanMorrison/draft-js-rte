import React from "react";
import PropTypes from "prop-types";
import Style from "./tooltip.style.js";
import { isNil } from "lodash";
import { ClassNames } from "@emotion/core";

class Tooltip extends React.Component {
  constructor(props) {
    super(props);
    this.contentRef = React.createRef();

    this.state = {
      width: 0
    };
  }

  componentDidMount() {
    if(!isNil(this.contentRef.current)) {
      this.setState({width: this.getCurrentWidth()});
    }
  }

  componentDidUpdate() {
    if(!isNil(this.contentRef.current)) {
      let currentWidth = this.getCurrentWidth();
      if(currentWidth !== this.state.width) {
        this.setState({width: currentWidth});
      }
    }
  }

  getCurrentWidth() {
    let node = this.contentRef.current;

    const nodeStyles = window.getComputedStyle(node);
    const width = node.offsetWidth;
    const borderLeftWidth = parseFloat(nodeStyles.borderLeftWidth) || 0;
    const borderRightWidth = parseFloat(nodeStyles.borderRightWidth) || 0;
    const paddingLeft = parseFloat(nodeStyles.paddingLeft) || 0;
    const paddingRight = parseFloat(nodeStyles.paddingRight) || 0;
    return(width + borderRightWidth + borderLeftWidth + paddingLeft + paddingRight);
  }

  render() {
    const classes = {
      "tooltip": true,
      "left": this.props.orientation === "left",
      "right": this.props.orientation === "right",
      "bottom": this.props.orientation === "bottom",
      "top": ["left", "right", "bottom"].indexOf(this.props.orientation) === -1
    };

    let style = {};
    if(["top", "bottom"].indexOf(this.props.orientation) !== -1) {
      style["left"] = "calc(50% - (" + (this.state.width / 2) + "px)";
    }

    return(
      <ClassNames>
        {({cx}) => (
          <Style className={cx(classes)} style={style}>
            <div ref={this.contentRef} className="tooltip-content">
              {this.props.children}
            </div>
          </Style>
        )}
      </ClassNames>
    );
  }
}

Tooltip.componentDescription = "Informational tooltip.";
Tooltip.componentKey = "tooltip";
Tooltip.componentName = "Tooltip";

Tooltip.propDescriptions = {
  orientation: "Top, bottom, left or right aligned. Options are \"top\", \"bottom\", \"right\" or \"left\"."
};

Tooltip.propTypes = {
  orientation: PropTypes.string
};

Tooltip.defaultProps = {
  orientation: "top"
};

export default Tooltip;
