import Button from "./";
import React from "react";
import { FlexGrid, FlexItem } from "flex-item";

const ButtonExamples = () => {
  return(
    <div>
      <FlexGrid>
        <FlexItem>
          <Button type="primary" size="sm">Primary</Button>
          <br/>
          <Button type="primary" size="md">Primary</Button>
          <br/>
          <Button type="primary" size="lg">Primary</Button>
        </FlexItem>
        <FlexItem>
          <Button type="secondary" size="sm">Secondary</Button>
          <br/>
          <Button type="secondary" size="md">Secondary</Button>
          <br/>
          <Button type="secondary" size="lg">Secondary</Button>
        </FlexItem>
        <FlexItem>
          <span style={{marginLeft: "12px"}}><Button type="tertiary" size="sm">Tertiary</Button></span>
          <br/>
          <span style={{marginLeft: "6px"}}><Button type="tertiary" size="md">Tertiary</Button></span>
          <br/>
          <Button type="tertiary" size="lg">Tertiary</Button>
        </FlexItem>
        <FlexItem>
          <Button disabled size="sm">Disabled</Button>
          <br/>
          <Button disabled size="md">Disabled</Button>
          <br/>
          <Button disabled size="lg">Disabled</Button>
        </FlexItem>
      </FlexGrid>
      <br/>
      <FlexGrid>
        <FlexItem>
          <Button type="primary" size="sm" danger>Danger</Button>
          <br/>
          <Button type="primary" size="md" danger>Danger</Button>
          <br/>
          <Button type="primary" size="lg" danger>Danger</Button>
        </FlexItem>
        <FlexItem>
          <Button type="secondary" size="sm" danger>Danger</Button>
          <br/>
          <Button type="secondary" size="md" danger>Danger</Button>
          <br/>
          <Button type="secondary" size="lg" danger>Danger</Button>
        </FlexItem>
        <FlexItem>
          <span style={{marginLeft: "12px"}}><Button type="tertiary" size="sm" danger>Danger</Button></span>
          <br/>
          <span style={{marginLeft: "6px"}}><Button type="tertiary" size="md" danger>Danger</Button></span>
          <br/>
          <Button type="tertiary" size="lg" danger>Danger</Button>
        </FlexItem>
        <FlexItem>
          <Button disabled size="sm" danger>Danger</Button>
          <br/>
          <Button disabled size="md" danger>Danger</Button>
          <br/>
          <Button disabled size="lg" danger>Danger</Button>
        </FlexItem>
      </FlexGrid>
    </div>
  );
};

export default ButtonExamples;
