import Info from "./index";
import { storiesOf } from "@storybook/react";
import { text } from "@storybook/addon-knobs";

storiesOf("Atoms", module)
  .add("Info", () => (
    <Info info={text("Info", "Give more information about something")}/>
  ), {
    info: {
      propTables: [Info]
    },
  });
