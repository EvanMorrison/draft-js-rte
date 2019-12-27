import Button from "./index";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { text, boolean, radios } from "@storybook/addon-knobs";

storiesOf("Atoms", module)
  .add("Button", () => (
    <Button size={radios("size", ["sm", "md", "lg"], "md")}
      block={boolean("block", false)}
      type={radios("type", ["primary", "secondary", "tertiary"], "secondary")}
      danger={boolean("danger", false)}
      disabled={boolean("disabled", false)}
      onClick={action("click")}
      tooltip={text("tooltip", "Click this Button")}
      tooltipOrientation={radios("tooltipOrientation", ["top", "bottom", "right", "left"], "top")}
    >
      {text("label", "button")}
    </Button>
  ), {
    info: {
      propTables: [Button]
    },
    jest: ["button"]
  });