import IconExample from "./example";
import { storiesOf } from "@storybook/react";

storiesOf("Atoms", module)
  .add("Icons", () => <IconExample/>, {
    info: {disable: true},
    jest: ["icon"],
  });
