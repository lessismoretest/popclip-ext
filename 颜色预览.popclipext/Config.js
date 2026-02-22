// #popclip
// name: 颜色预览
// identifier: com.lessismore.popclip.color-preview
// entitlements: [dynamic]
// language: javascript
// module: true
// regex: "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|rgb\\s*\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*\\)|rgba\\s*\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*[\\d\\.]+\\s*\\)|hsl\\s*\\(\\s*\\d+\\s*,\\s*\\d+%\\s*,\\s*\\d+%\\s*\\)"

const hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/;
const rgbRegex = /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/;
const rgbaRegex = /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([\d\.]+)\s*\)/;
const hslRegex = /hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/;

function componentToHex(c) {
  var hex = parseInt(c).toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hslToHex(h, s, l) {
  h = parseInt(h) / 360;
  s = parseInt(s) / 100;
  l = parseInt(l) / 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    r = hue2rgb(h + 1/3);
    g = hue2rgb(h);
    b = hue2rgb(h - 1/3);
  }
  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

exports.actions = (input) => {
  const text = input.text.trim().toLowerCase();
  let hexColor = null;

  if (hexRegex.test(text)) {
    const match = text.match(hexRegex);
    hexColor = match[0];
  } else if (rgbRegex.test(text) || rgbaRegex.test(text)) {
    const match = text.match(rgbRegex) || text.match(rgbaRegex);
    hexColor = rgbToHex(match[1], match[2], match[3]);
  } else if (hslRegex.test(text)) {
    const match = text.match(hslRegex);
    hexColor = hslToHex(match[1], match[2], match[3]);
  }

  if (hexColor) {
    // 使用 SVG 矩形来显示颜色，并添加 preserve-color 修饰符确保颜色被渲染
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${hexColor}"/></svg>`;
    return [{
      title: `Color: ${hexColor}`,
      icon: `preserve-color svg:${svgString}`,
      code: () => {
        popclip.copyText(input.text);
      }
    }];
  }
};
