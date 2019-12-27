import Colors from "../../utils/colors-en";
import Ellipsis from "../../atoms/ellipsis/en";
import Form from "../../atoms/form/en";
import HeaderSearch from "../../molecules/headerSearch/en";
import RichEditor from "../../organisms/richEditor/en";
import Table from "../../organisms/table/en";

export default {
  atoms: {
    ellipsis: Ellipsis,
    form: Form
  },
  molecules: {
    headerSearch: HeaderSearch
  },
  organisms: {
    richEditor: RichEditor,
    table: Table
  },
  utils: {
    colors: Colors
  }
};
