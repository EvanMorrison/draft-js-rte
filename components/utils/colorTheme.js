import ColorHelper from "./colorHelper";
import { clone, isNil } from "lodash";

export default class ColorTheme {
  constructor(data) {
    this.colors = {};

    // WARNING: Order matters
    [
      // Page
      {old: null, new: "pageBackground"},
      {old: null, new: "textOnPageBackground"},
      {old: null, new: "shadowOnPage"},
      {old: "link_text", new: "linkText"},
      {old: null, new: "border"},
      {old: null, new: "blockSectionBorder"},
      {old: null, new: "inputBorder"},
      {old: null, new: "inputDisabled"},
      {old: null, new: "inputLabel"},
      {old: null, new: "inputNote"},
      {old: null, new: "richTextBorder"},
      {old: null, new: "selectBorder"},
      {old: null, new: "toggleBackground"},
      {old: null, new: "textareaBorder"},
      {old: null, new: "crumbsBorder"},
      {old: null, new: "tabsBorder"},
      {old: null, new: "accordionBorder"},

      // Danger
      {old: null, new: "danger"},
      {old: null, new: "textOnDanger"},

      // Success
      {old: null, new: "success"},
      {old: null, new: "textOnSuccess"},

      // Warning
      {old: null, new: "warning"},
      {old: null, new: "textOnWarning"},

      // Primary
      {old: "primary_color", new: "primary"},
      {old: null, new: "primaryActive"},
      {old: "primary_color_dark", new: "primaryDark"},
      {old: null, new: "primaryHighlight"},
      {old: "primary_color_light", new: "primaryLight"},
      {old: null, new: "primarySelected"},
      {old: null, new: "badgeBackground"},
      {old: null, new: "textOnBadgeBackground"},
      {old: "text_on_primary", new: "textOnPrimary"},
      {old: null, new: "textOnPrimaryActive"},
      {old: null, new: "textOnPrimaryHighlight"},
      {old: null, new: "textOnPrimarySelected"},
      {old: "text_primary", new: "textPrimary"},
      {old: null, new: "header"},
      {old: null, new: "headerActive"},
      {old: null, new: "headerHighlight"},
      {old: null, new: "headerSearchArrow"},
      {old: null, new: "headerSelected"},
      {old: null, new: "headerSlogan"},
      {old: null, new: "headerTitle"},
      {old: null, new: "textOnHeader"},
      {old: null, new: "textOnHeaderNavMenuTitle"},
      {old: null, new: "textOnHeaderNavMenuLink"},
      {old: null, new: "subHeader"},
      {old: null, new: "subHeaderHighlight"},
      {old: null, new: "subHeaderSelected"},
      {old: null, new: "textOnSubHeader"},
      {old: null, new: "blockSectionHeader"},
      {old: null, new: "blockSectionBackground"},
      {old: null, new: "altBlockSectionHeader"},
      {old: null, new: "textOnAltBlockSectionHeader"},
      {old: null, new: "textOnBlockSectionBackground"},
      {old: null, new: "textOnBlockSectionHeader"},
      {old: null, new: "checkbox"},
      {old: null, new: "radio"},

      // Secondary
      {old: "secondary_color", new: "secondary"},
      {old: "secondary_color_dark", new: "secondaryDark"},
      {old: null, new: "secondaryHighlight"},
      {old: "secondary_color_light", new: "secondaryLight"},
      {old: null, new: "secondarySelected"},
      {old: "text_on_secondary", new: "textOnSecondary"},
      {old: null, new: "textOnSecondaryHighlight"},
      {old: null, new: "textOnSecondarySelected"},

      // Admin
      {old: "entity_bgc", new: "adminTableBackground"},
      {old: "entity_col_bgc", new: "adminTableColumnBackground"},
      {old: "entity_col_text", new: "adminTableColumnText"},
      {old: "entity_row_hov", new: "adminTableRowHover"},
      {old: "entity_row_sel", new: "adminTableRowSelected"},
      {old: "entity_row_text", new: "adminTableRowText"},

      // Flag
      {old: "flag_color", new: "flag"},
      {old: "flag_shadow_color", new: "flagShadow"},

      // Forms
      {old: "form_error", new: "formError"},
      {old: "form_value", new: "formValue"},

      // Info
      {old: "info_color", new: "info"},
      {old: "info_color_dark", new: "infoDark"},
      {old: "info_color_light", new: "infoLight"},
      {old: "info_color_text", new: "infoText"},

      // Reports
      {old: "primary_report_header", new: "primaryReportHeader"},
      {old: "primary_header_text", new: "textOnPrimaryReportHeader"},
      {old: "secondary_report_header", new: "secondaryReportHeader"},
      {old: "secondary_header_text", new: "textOnSecondaryReportHeader"},
      {old: "tertiary_report_header", new: "tertiaryReportHeader"},
      {old: "tertiary_header_text", new: "textOnTertiaryReportHeader"},
      {old: "quaternary_report_header", new: "quaternaryReportHeader"},
      {old: "quaternary_header_text", new: "textOnQuaternaryReportHeader"},
      {old: "result_data_text", new: "reportResultDataText"},

      // Tables
      {old: "table_color", new: "table"},
      {old: "table_header_text", new: "tableHeaderText"},
      {old: "table_high_color", new: "tableHigh"},
      {old: null, new: "textOnTableHigh"},
      {old: "table_low_color", new: "tableLow"},
      {old: "table_row_color", new: "tableRow"},

      // Mesa (spanish for Table)
      {old: null, new: "mesaRow"},
      {old: null, new: "mesaRowSelected"},
      {old: null, new: "mesaHeaderBorder"}

    ].forEach((color) => {
      if(!isNil(data[color.new])) {
        this.colors[color.new] = data[color.new];
      } else if(!isNil(data[color.old])) {
        this.colors[color.new] = "#" + data[color.old];
      } else {
        this.colors[color.new] = this.calcColor(color.new);
      }
    });
  }

  exportTheme() {
    return(this.colors);
  }

  calcColor(color) {
    switch(color) {
      case "accordionBorder": return(clone(this.colors.tabsBorder));
      case "altBlockSectionHeader": return(new ColorHelper(this.colors.primary).decreaseContrast(0.07));
      case "badgeBackground": return(new ColorHelper(this.colors.primary).lighten(0.125));
      case "blockSectionBackground": return(clone(this.colors.pageBackground));
      case "blockSectionBorder": return(clone(this.colors.border));
      case "blockSectionHeader": return(new ColorHelper(this.colors.pageBackground).decreaseContrast(0.2));
      case "border": return(new ColorHelper(this.colors.pageBackground).decreaseContrast(0.35));
      case "checkbox": return(clone(this.colors.primary));
      case "crumbsBorder": return(clone(this.colors.border));
      case "danger": return("#E74C3C");
      case "flagShadow": return(new ColorHelper(this.colors.flag).shadowColor());
      case "header": return(clone(this.colors.primary));
      case "headerActive": return(new ColorHelper(this.colors.header).active());
      case "headerHighlight": return(new ColorHelper(this.colors.header).highlight());
      case "headerSearchArrow": return(clone(this.colors.header));
      case "headerSelected": return(new ColorHelper(this.colors.header).selected());
      case "headerSlogan": return(this.calcTextColor(this.colors.header));
      case "headerTitle": return(this.calcTextColor(this.colors.header));
      case "infoDark": return(new ColorHelper(this.colors.info).darken(0.25));
      case "infoLight": return(new ColorHelper(this.colors.info).lighten(0.25));
      case "inputBorder": return(new ColorHelper(this.colors.border).decreaseContrast(0.34));
      case "inputDisabled": return(new ColorHelper(this.colors.pageBackground).decreaseContrast(0.1));
      case "inputLabel": return(clone(this.colors.inputBorder));
      case "inputNote": return(clone(this.colors.inputBorder));
      case "linkText": return(clone(this.colors.textOnPageBackground));
      case "mesaRow": return(new ColorHelper(this.colors.pageBackground).darken(0.025));
      case "mesaHeaderBorder": return(new ColorHelper(this.colors.border).decreaseContrast(0.06));
      case "mesaRowSelected": return(new ColorHelper(this.colors.pageBackground).darken(0.15));
      case "pageBackground": return("#FFFFFF");
      case "primaryActive": return(new ColorHelper(this.colors.primary).active());
      case "primaryDark": return(new ColorHelper(this.colors.primary).darken(0.25));
      case "primaryHighlight": return(new ColorHelper(this.colors.primary).highlight());
      case "primaryLight": return(new ColorHelper(this.colors.primary).lighten(0.25));
      case "primarySelected": return(new ColorHelper(this.colors.primary).selected());
      case "quaternaryReportHeader": return(new ColorHelper(this.colors.primaryReportHeader).lighten(3.5));
      case "radio": return(clone(this.colors.checkbox));
      case "richTextBorder": return(clone(this.colors.inputBorder));
      case "secondaryDark": return(new ColorHelper(this.colors.secondary).darken(0.25));
      case "secondaryHighlight": return(new ColorHelper(this.colors.secondary).highlight());
      case "secondaryLight": return(new ColorHelper(this.colors.secondary).lighten(0.25));
      case "secondaryReportHeader": return(new ColorHelper(this.colors.primaryReportHeader).lighten(0.75));
      case "secondarySelected": return(new ColorHelper(this.colors.secondary).selected());
      case "selectBorder": return(clone(this.colors.inputBorder));
      case "shadowOnPage": return(new ColorHelper(this.colors.pageBackground).shadowColor());
      case "subHeader": return(new ColorHelper(this.colors.header).increaseContrast(0.036));
      case "subHeaderHighlight": return(new ColorHelper(this.colors.subHeader).lighten(0.25));
      case "subHeaderSelected": return(new ColorHelper(this.colors.subHeader).active());
      case "success": return("#008000");
      case "tabsBorder": return(clone(this.colors.border));
      case "tertiaryReportHeader": return(new ColorHelper(this.colors.primaryReportHeader).lighten(2.25));
      case "textareaBorder": return(clone(this.colors.inputBorder));
      case "textOnAltBlockSectionHeader": return(this.calcTextColor(this.colors.altBlockSectionHeader));
      case "textOnBadgeBackground": return(this.calcTextColor(this.colors.badgeBackground));
      case "textOnBlockSectionBackground": return(this.calcTextColor(this.colors.blockSectionBackground));
      case "textOnBlockSectionHeader": return(this.calcTextColor(this.colors.blockSectionHeader));
      case "textOnDanger": return(this.calcTextColor(this.colors.danger));
      case "textOnHeader": return(this.calcTextColor(this.colors.header));
      case "textOnHeaderNavMenuTitle": return(clone(this.colors.textOnHeader));
      case "textOnHeaderNavMenuLink": return(clone(this.colors.textOnHeader));
      case "textOnInfo": return(this.calcTextColor(this.colors.info));
      case "textOnPageBackground": return(this.calcTextColor(this.colors.pageBackground));
      case "textOnPrimary": return(this.calcTextColor(this.colors.primary));
      case "textOnPrimaryActive": return(this.calcTextColor(this.colors.primaryActive));
      case "textOnPrimaryHighlight": return(this.calcTextColor(this.colors.primaryHighlight));
      case "textOnPrimaryReportHeader": return(this.calcTextColor(this.colors.primaryReportHeader));
      case "textOnPrimarySelected": return(this.calcTextColor(this.colors.primarySelected));
      case "textOnQuaternaryReportHeader": return(this.calcTextColor(this.colors.quaternaryReportHeader));
      case "textOnSecondary": return(this.calcTextColor(this.colors.secondary));
      case "textOnSecondaryHighlight": return(this.calcTextColor(this.colors.secondaryHighlight));
      case "textOnSecondaryReportHeader": return(this.calcTextColor(this.colors.secondaryReportHeader));
      case "textOnSecondarySelected": return(this.calcTextColor(this.colors.secondarySelected));
      case "textOnSubHeader": return(this.calcTextColor(this.colors.subHeader));
      case "textOnSuccess": return(this.calcTextColor(this.colors.success));
      case "textOnTableHigh": return(this.calcTextColor(this.colors.tableHigh));
      case "textOnTertiaryReportHeader": return(this.calcTextColor(this.colors.tertiaryReportHeader));
      case "textOnWarning": return(this.calcTextColor(this.colors.warning));
      case "textPrimary": return(this.colors.primary);
      case "toggleBackground": return(new ColorHelper(this.colors.border).decreaseContrast(0.12));
      case "warning": return("#FFA429");
      default: return("#000000");
    }
  }

  calcTextColor(color) {
    return(new ColorHelper(color).textColor());
  }
};
