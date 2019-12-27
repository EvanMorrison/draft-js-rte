import Color from "./color";
import RgbHex from "rgb-hex";
import { clone } from "lodash";

const ColorHelper = class{
  constructor(value) {
    this.color = new Color(clone(value));
  }

  active() {
    if(this.color.light()) {
      this.color.darken(0.123);
    } else {
      this.color.lighten(0.123);
    }
    return(this.convertToStr());
  }

  complementary() {
    this.color.rotate(180);
    return(this.convertToStr());
  }

  complementaryHighlight() {
    this.color.rotate(180);
    if(this.color.light()) {
      this.color.darken(0.1).desaturate(0.1);
    } else {
      this.color.lighten(0.1).saturate(0.1);
    }
    return(this.convertToStr());
  }

  convertToStr() {
    let arr = this.color.toRGBA();
    for(let i = 0; i < 3; i++) {
      if(arr[i] > 255) {
        arr[i] = 255;
      } else if(arr[i] < 0) {
        arr[i] = 0;
      }
    }
    return("#" + RgbHex(arr[0], arr[1], arr[2]));
  }

  darken(contrast) {
    this.color.darken(contrast);
    return(this.convertToStr());
  }

  decreaseContrast(contrast) {
    if(this.color.light()) {
      this.color.darken(contrast);
    } else {
      this.color.lighten(contrast);
    }
    return(this.convertToStr());
  }

  highlight() {
    if(this.color.light()) {
      this.color.darken(0.10);
    } else {
      this.color.lighten(0.10);
    }
    return(this.convertToStr());
  }

  hueShift(contrast) {
    if(this.color.huePercent() > 0.5) {
      this.color.hueShift(-1 * contrast);
    } else {
      this.color.hueShift(contrast);
    }
    return(this.convertToStr());
  }

  increaseContrast(contrast) {
    if(this.color.light()) {
      this.color.lighten(contrast);
    } else {
      this.color.darken(contrast);
    }
    return(this.convertToStr());
  }

  lighten(contrast) {
    this.color.lighten(contrast);
    return(this.convertToStr());
  }

  selected() {
    if(this.color.light()) {
      this.color.darken(0.066);
    } else {
      this.color.lighten(0.066);
    }
    return(this.convertToStr());
  }

  shadowColor() {
    if(this.color.light()) {
      return("#000000");
    } else {
      return("#FFFFFF");
    }
  }

  textColor() {
    if(this.color.light()) {
      return("#333333");
    } else {
      return("#FFFFFF");
    }
  }
};

export default ColorHelper;
