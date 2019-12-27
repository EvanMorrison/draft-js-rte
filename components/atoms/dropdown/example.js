import Dropdown from "./";
import React, { useState } from "react";

const Example = () => {
  const [open, setOpen] = useState(false);

  return([
    <div onClick={() => setOpen(!open)}>Click to open dropdown</div>,
    <Dropdown open={open}>
      <ul>
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
      </ul>
    </Dropdown>
  ]);
};

export default Example;
