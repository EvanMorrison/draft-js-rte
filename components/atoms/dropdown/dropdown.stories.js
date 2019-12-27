import Dropdown from "./index";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { boolean, radios, text } from "@storybook/addon-knobs";

storiesOf("Atoms", module)
  .add("Dropdown", () => (
    <Dropdown
      onClick={action("click")}
      orientation={radios("orientation", ["right", "left"], "left")}
      open={boolean("open", true)}
      top={text("top", "180px") }
    >
      <ul>
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
      </ul>
    </Dropdown>
  ), {
    info: {
      propTables: [Dropdown]
    },
    jest: ["dropDown"]
  });
