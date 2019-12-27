import FormLinker from "form-linker";
import RichEditor from "./index";
import { storiesOf } from "@storybook/react";
import { array, boolean, object, number, text } from "@storybook/addon-knobs";

const fl = new FormLinker({
  data: {},
  schema: {}
});

// using this intermediate component to avoid a react hooks error
const Editor = props => (
  <RichEditor
    {...props}
  />
);

storiesOf("Organisms", module)
  .add("RichEditor", () => (
    <Editor
      formLinker={fl}
      name="editor"
      disabled={boolean("disabled", false)}
      minHeight={number("minHeight", 300)}
      maxHeight={number("maxHeight", 300)}
      placeholder={text("placeholder", "Enter content here")}
      defaultStyles={array("defaultStyles", ["fontFamily.Arial", "fontSize.12"])}
      noScrollMessage={boolean("noScrollMessage", false)}
      toolbar={array("toolbar", ["withImages", "myCustomControl"])}
      customControls={object("customControls", {
        myCustomControl: {
          display: {name: "Insert Keywords", style: {fontSize: "12px"}},
          dimensions: {controlWidth: 120},
          availableItems: [
            {display: {name: "Fancy", style: {fontSize: "14px", color: "#0088CC"}}},
            {display: {name: "Keyword", style: {fontSize: "14px", color: "#0088CC"}}},
            {display: {name: "List", style: {fontSize: "14px", color: "#0088CC"}}}
          ]
        }
      })}
    />
  ), {
    info: {
      propTables: [RichEditor],
      propTablesExclude: [Editor],
    },
    jest: ["richEditor"]
  });