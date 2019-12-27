import DropdownBtnExample from "./example";
import DropdownBtn from "./index";
import { storiesOf } from "@storybook/react";

storiesOf("Molecules", module)
  .add("DropdownBtn", () => (<DropdownBtnExample/>), {
    info: {
      propTables: [DropdownBtn],
      propTablesExclude: [DropdownBtnExample]
    },
    jest: ["dropdownBtn"]
  });