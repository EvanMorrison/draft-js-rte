import HexRgb from "hex-rgb";
import { clone } from "lodash";

export default class{
  constructor(value) {
    this.color = HexRgb(clone(value), {format: "array"}).slice(0, 3);
  }

  changeHue(hue) {
    var hsl = this.rgbToHsl(this.color);
    if(hue > 1) {
      hue = 1;
    } else if(hue < 0) {
      hue = 0;
    }
    hsl[0] = hue;
    this.color = this.hslToRgb(hsl);
  }

  changeLumens(lumens) {
    var hsl = this.rgbToHsl(this.color);
    if(lumens > 1) {
      lumens = 1;
    } else if(lumens < 0) {
      lumens = 0;
    }
    hsl[2] = lumens;
    this.color = this.hslToRgb(hsl);
  }

  changeSaturation(saturation) {
    var hsl = this.rgbToHsl(this.color);
    if(saturation > 1) {
      saturation = 1;
    } else if(saturation < 0) {
      saturation = 0;
    }
    hsl[1] = saturation;
    this.color = this.hslToRgb(hsl);
  }

  dark() {
    return(((this.color[0] * 299 + this.color[1] * 587 + this.color[2] * 114) / 1000) < 128);
  }

  darken(ratio) {
    var hsl = this.rgbToHsl(this.color);
    let newLum = hsl[2] - ratio;
    if(newLum < 0) {
      newLum = 0;
    }
    hsl[2] = newLum;
    this.color = this.hslToRgb(hsl);
  }

  desaturate(ratio) {
    var hsl = this.rgbToHsl(this.color);
    hsl[1] -= hsl[1] * ratio;
    this.color = this.hslToRgb(hsl);
  }

  hslToRgb(hsl) {
    let h = hsl[0];
    let s = hsl[1];
    let l = hsl[2];

    let r, g, b;

    if(s === 0) {
      r = g = b = l; // achromatic
    } else {
      let hue2rgb = function hue2rgb(p, q, t) {
        if(t < 0) { t += 1; }
        if(t > 1) { t -= 1; }
        if(t < 1 / 6) { return(p + (q - p) * 6 * t); }
        if(t < 0.5) { return(q); }
        if(t < 2 / 3) { return(p + (q - p) * (2 / 3 - t) * 6); }
        return(p);
      };

      let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      let p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return([Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]);
  }

  huePercent() {
    return(this.rgbToHsl(this.color)[0]);
  }

  hueShift(ratio) {
    var hsl = this.rgbToHsl(this.color);
    hsl[0] -= ratio;
    this.color = this.hslToRgb(hsl);
  }

  lighten(ratio) {
    var hsl = this.rgbToHsl(this.color);
    let newLum = hsl[2] + ratio;
    if(newLum > 1) {
      newLum = 1;
    }
    hsl[2] = newLum;
    this.color = this.hslToRgb(hsl);
  }

  light() {
    return(!this.dark());
  }

  toHsl() {
    return(this.rgbToHsl(this.color));
  }

  rgbToHsl(rgb) {
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h = (max + min) / 2;
    let s = (max + min) / 2;
    let l = (max + min) / 2;

    if(max === min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return([h, s, l]);
  }

  rotate(degrees) {
    var hsl = this.rgbToHsl(this.color);
    var hue = hsl[0] * 360;
    hue = (hue + degrees) % 360;
    hue = hue < 0 ? 360 + hue : hue;
    hsl[0] = hue / 360;
    this.color = this.hslToRgb(hsl);
  }

  saturate(ratio) {
    var hsl = this.rgbToHsl(this.color);
    hsl[1] += hsl[1] * ratio;
    this.color = this.hslToRgb(hsl);
  }

  toRGBA() {
    return(this.color);
  }
};
