import BlockSection from "../blockSection";
import Icon from "./";
import React from "react";
import Style from "./example.style";
import { FlexGrid, FlexItem } from "flex-item";

class Icons extends React.Component {
  renderIcon(icon, rotate) {
    return(
      <FlexItem key={icon}>
        <Icon name={icon} size="2x" rotation={rotate}/>
        <span className="label">{icon}</span>
      </FlexItem>
    );
  }

  render() {
    const perRow = 7;

    return(
      <Style>
        <BlockSection header="Nav">
          <h4>Chevrons</h4>
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("chevron-down-sld")}
            {this.renderIcon("chevron-left-sld")}
            {this.renderIcon("chevron-right-sld")}
            {this.renderIcon("chevron-up-sld")}
          </FlexGrid>
          <h4>Arrows</h4>
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("arrow-down-sld")}
            {this.renderIcon("arrow-left-sld")}
            {this.renderIcon("arrow-right-sld")}
            {this.renderIcon("arrow-up-sld")}
          </FlexGrid>
          <h4>Steps</h4>
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("step-backward-sld")}
            {this.renderIcon("backward-sld")}
            {this.renderIcon("forward-sld")}
            {this.renderIcon("step-forward-sld")}
          </FlexGrid>
          <h4>Menu</h4>
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("bars-sld")}
          </FlexGrid>
        </BlockSection>
        <BlockSection header="Text Editor">
          <h4>Align</h4>
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("align-center-sld")}
            {this.renderIcon("align-justify-sld")}
            {this.renderIcon("align-left-sld")}
            {this.renderIcon("align-right-sld")}
          </FlexGrid>
          <h4>List</h4>
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("list-ul-sld")}
            {this.renderIcon("list-ol-sld")}
          </FlexGrid>
          <h4>Indent</h4>
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("outdent-sld")}
            {this.renderIcon("indent-sld")}
          </FlexGrid>
          <h4>Misc</h4>
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("bold-sld")}
            {this.renderIcon("font-sld")}
            {this.renderIcon("image-sld")}
            {this.renderIcon("italic-sld")}
            {this.renderIcon("quote-right-sld")}
            {this.renderIcon("paint-brush-sld")}
            {this.renderIcon("table-lgt")}
            {this.renderIcon("underline-sld")}
            {this.renderIcon("strikethrough-sld")}
          </FlexGrid>
        </BlockSection>
        <BlockSection header="Pages">
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("applicant-pending")}
            {this.renderIcon("applicant-ready")}
            {this.renderIcon("batch-order")}
            {this.renderIcon("draft-icon")}
            {this.renderIcon("new-order")}
            {this.renderIcon("xml-ready")}
          </FlexGrid>
        </BlockSection>
        <BlockSection header="Buttons">
          <h4>Add/Edit/Delete</h4>
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("check-sld")}
            {this.renderIcon("times-reg")}
            {this.renderIcon("plus-reg")}
            {this.renderIcon("pencil-alt-sld")}
            {this.renderIcon("trash-alt-sld")}
          </FlexGrid>
          <h4>Search</h4>
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("search-sld")}
            {this.renderIcon("search-plus-sld")}
            {this.renderIcon("search-minus-sld")}
          </FlexGrid>
          <h4>Expand</h4>
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("compress-alt-sld", 90)}
            {this.renderIcon("expand-alt-sld", 90)}
          </FlexGrid>
          <h4>Visibility</h4>
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("eye-sld")}
            {this.renderIcon("eye-slash-sld")}
          </FlexGrid>
          <h4>Download</h4>
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("cloud-upload-sld")}
            {this.renderIcon("download-sld")}
          </FlexGrid>
          <h4>Misc</h4>
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("calendar-alt-reg")}
            {this.renderIcon("cog-sld")}
            {this.renderIcon("revert-color")}
            {this.renderIcon("filter-sld")}
            {this.renderIcon("print-sld")}
            {this.renderIcon("question-sld")}
            {this.renderIcon("user-sld")}
            {this.renderIcon("map-marker-alt-sld")}
            {this.renderIcon("sync-alt-sld")}
            {this.renderIcon("ban-sld")}
            {this.renderIcon("exclamation-circle-sld")}
            {this.renderIcon("exclamation-triangle-sld")}
            {this.renderIcon("clock-reg")}
            {this.renderIcon("sticky-note-reg")}
          </FlexGrid>
        </BlockSection>
        <BlockSection header="Forms">
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("check-square-reg")}
            {this.renderIcon("square-reg")}
            {this.renderIcon("square-sld")}
            {this.renderIcon("circle-sld")}
            {this.renderIcon("circle-reg")}
            {this.renderIcon("dot-circle-reg")}
            {this.renderIcon("dollar-sign-sld")}
          </FlexGrid>
        </BlockSection>
        <BlockSection header="Table">
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("flag-sld")}
            {this.renderIcon("sort-up-sld")}
            {this.renderIcon("sort-down-sld")}
          </FlexGrid>
        </BlockSection>
        <BlockSection header="Colors">
          <FlexGrid maxPerRow={perRow}>
            {this.renderIcon("tint-sld")}
            {this.renderIcon("lock-sld")}
          </FlexGrid>
        </BlockSection>
      </Style>
    );
  }
}

export default Icons;
