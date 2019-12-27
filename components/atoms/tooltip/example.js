import Button from "../button";
import React from "react";
import { FlexGrid, FlexItem } from "flex-item";

class TooltipExample extends React.Component {
  render() {
    return(
      <FlexGrid>
        <FlexItem>
          <Button tooltip="Example tooltip" tooltipOrientation="right">Right Tooltip</Button>
        </FlexItem>
        <FlexItem>
          <Button tooltip="Example tooltip">Top Tooltip</Button>
        </FlexItem>
        <FlexItem>
          <Button tooltip="Example tooltip" tooltipOrientation="bottom">Bottom Tooltip</Button>
        </FlexItem>
        <FlexItem>
          <Button tooltip="Example tooltip" tooltipOrientation="left">Left Tooltip</Button>
        </FlexItem>
      </FlexGrid>
    );
  }
}

export default TooltipExample;
