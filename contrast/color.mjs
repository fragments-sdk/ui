// Colour maths for the contrast lane: parse the strings `getComputedStyle` returns, convert
// them to sRGB, composite alpha the way a browser paints it, and score pairs.
//
// Conversions follow the CSS Color 4 sample code (D65 white for every RGB space, Bradford
// for D50 spaces). WCAG 2 luminance uses the sRGB piecewise transfer; the APCA lightness
// contrast (reported, never gated) follows its published constants.

const SRGB_TO_XYZ = [
  [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
  [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
  [0.01933081871559182, 0.11919477979462598, 0.9505321522496607],
];
const XYZ_TO_SRGB = [
  [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
  [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
  [0.05563007969699366, -0.20397695888897652, 1.0569715142428786],
];
const P3_TO_XYZ = [
  [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
  [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
  [0, 0.04511338185890264, 1.043944368900976],
];
const A98_TO_XYZ = [
  [0.5766690429101305, 0.1855582379065463, 0.1882286462349947],
  [0.29734497525053605, 0.6273635662554661, 0.07529145849399788],
  [0.02703136138641234, 0.07068885253582723, 0.9913375368376388],
];
const REC2020_TO_XYZ = [
  [0.6369580483012914, 0.14461690358620832, 0.1688809751641721],
  [0.2627002120112671, 0.6779980715188708, 0.05930171646986196],
  [0, 0.028072693049087428, 1.060985057710791],
];
const PROPHOTO_TO_XYZ_D50 = [
  [0.7977666449006423, 0.13518129740053308, 0.0313477341283922],
  [0.2880748288194013, 0.711835234241873, 0.00008993693872564],
  [0, 0, 0.8251046025104602],
];
const D50_TO_D65 = [
  [0.955473421488075, -0.02309845494876471, 0.06325924320057072],
  [-0.0283697093338637, 1.0099953980813041, 0.021041441191917323],
  [0.012314014864481998, -0.020507649298898964, 1.330365926242124],
];
const D50_WHITE = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];
const OKLAB_TO_LMS = [
  [1, 0.3963377773761749, 0.2158037573099136],
  [1, -0.1055613458156586, -0.0638541728258133],
  [1, -0.0894841775298119, -1.2914855480194092],
];
const LMS_TO_XYZ = [
  [1.2268798758459243, -0.5578149944602171, 0.2813910456659647],
  [-0.0405757452148008, 1.112286803280317, -0.0717110580655164],
  [-0.0763729366746601, -0.4214933324022432, 1.5869240198367816],
];
const XYZ_TO_LMS = [
  [0.819022437996703, 0.3619062600528904, -0.1288737815209879],
  [0.0329836539323885, 0.9292868615863434, 0.0361446663506424],
  [0.0481771893596242, 0.2642395317527308, 0.6335478284694309],
];
const LMS_TO_OKLAB = [
  [0.210454268309314, 0.7936177747023054, -0.0040720430116193],
  [1.9779985324311684, -2.42859224204858, 0.450593709617411],
  [0.0259040424655478, 0.7827717124575296, -0.8086757549230774],
];

const multiply = (m, v) => m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);

const srgbToLinear = (c) => {
  const a = Math.abs(c);
  return a <= 0.04045 ? c / 12.92 : Math.sign(c) * ((a + 0.055) / 1.055) ** 2.4;
};
const linearToSrgb = (c) => {
  const a = Math.abs(c);
  return a <= 0.0031308 ? c * 12.92 : Math.sign(c) * (1.055 * a ** (1 / 2.4) - 0.055);
};
const a98ToLinear = (c) => Math.sign(c) * Math.abs(c) ** (563 / 256);
const prophotoToLinear = (c) => {
  const a = Math.abs(c);
  return a <= 16 / 512 ? c / 16 : Math.sign(c) * a ** 1.8;
};
const rec2020ToLinear = (c) => {
  const alpha = 1.09929682680944;
  const beta = 0.018053968510807;
  const a = Math.abs(c);
  return a < beta * 4.5 ? c / 4.5 : Math.sign(c) * ((a + alpha - 1) / alpha) ** (1 / 0.45);
};

function labToXyzD50([l, a, b]) {
  const kappa = 24389 / 27;
  const epsilon = 216 / 24389;
  const f1 = (l + 16) / 116;
  const f0 = a / 500 + f1;
  const f2 = f1 - b / 200;
  const xyz = [
    f0 ** 3 > epsilon ? f0 ** 3 : (116 * f0 - 16) / kappa,
    l > kappa * epsilon ? ((l + 16) / 116) ** 3 : l / kappa,
    f2 ** 3 > epsilon ? f2 ** 3 : (116 * f2 - 16) / kappa,
  ];
  return xyz.map((value, index) => value * D50_WHITE[index]);
}

function oklabToXyz(lab) {
  return multiply(
    LMS_TO_XYZ,
    multiply(OKLAB_TO_LMS, lab).map((value) => value ** 3)
  );
}

export function xyzToOklab(xyz) {
  return multiply(LMS_TO_OKLAB, multiply(XYZ_TO_LMS, xyz).map(Math.cbrt));
}

const polarToLab = ([l, c, h]) => {
  const radians = ((Number.isNaN(h) ? 0 : h) * Math.PI) / 180;
  return [l, c * Math.cos(radians), c * Math.sin(radians)];
};

function hslToSrgb([h, s, l]) {
  const hue = (((Number.isNaN(h) ? 0 : h) % 360) + 360) % 360;
  const sat = s / 100;
  const light = l / 100;
  const f = (n) => {
    const k = (n + hue / 30) % 12;
    const a = sat * Math.min(light, 1 - light);
    return light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [f(0), f(8), f(4)];
}

function hwbToSrgb([h, w, b]) {
  const white = w / 100;
  const black = b / 100;
  if (white + black >= 1) {
    const grey = white / (white + black);
    return [grey, grey, grey];
  }
  return hslToSrgb([h, 100, 50]).map((c) => c * (1 - white - black) + white);
}

/** XYZ (D65) for any parsed colour. */
export function toXyz({ space, coords }) {
  switch (space) {
    case "srgb":
      return multiply(SRGB_TO_XYZ, coords.map(srgbToLinear));
    case "srgb-linear":
      return multiply(SRGB_TO_XYZ, coords);
    case "display-p3":
      return multiply(P3_TO_XYZ, coords.map(srgbToLinear));
    case "a98-rgb":
      return multiply(A98_TO_XYZ, coords.map(a98ToLinear));
    case "rec2020":
      return multiply(REC2020_TO_XYZ, coords.map(rec2020ToLinear));
    case "prophoto-rgb":
      return multiply(D50_TO_D65, multiply(PROPHOTO_TO_XYZ_D50, coords.map(prophotoToLinear)));
    case "xyz-d65":
      return coords;
    case "xyz-d50":
      return multiply(D50_TO_D65, coords);
    case "lab":
      return multiply(D50_TO_D65, labToXyzD50(coords));
    case "lch":
      return multiply(D50_TO_D65, labToXyzD50(polarToLab(coords)));
    case "oklab":
      return oklabToXyz(coords);
    case "oklch":
      return oklabToXyz(polarToLab(coords));
    case "hsl":
      return multiply(SRGB_TO_XYZ, hslToSrgb(coords).map(srgbToLinear));
    case "hwb":
      return multiply(SRGB_TO_XYZ, hwbToSrgb(coords).map(srgbToLinear));
    default:
      throw new Error(`Unsupported colour space: ${space}`);
  }
}

/** Gamma-encoded sRGB channels (0..1, possibly out of gamut) for XYZ (D65). */
export const xyzToSrgb = (xyz) => multiply(XYZ_TO_SRGB, xyz).map(linearToSrgb);

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

const RGB_SPACES = new Set([
  "srgb",
  "srgb-linear",
  "display-p3",
  "a98-rgb",
  "prophoto-rgb",
  "rec2020",
  "xyz",
  "xyz-d50",
  "xyz-d65",
]);

const NAMED = new Map([
  ["transparent", [0, 0, 0, 0]],
  ["black", [0, 0, 0, 1]],
  ["white", [1, 1, 1, 1]],
]);

function parseHue(token) {
  if (token === "none") return Number.NaN;
  const match = /^(-?[\d.]+(?:e[-+]?\d+)?)(deg|rad|grad|turn)?$/i.exec(token);
  if (!match) throw new Error(`Bad hue: ${token}`);
  const value = Number(match[1]);
  switch ((match[2] ?? "deg").toLowerCase()) {
    case "rad":
      return (value * 180) / Math.PI;
    case "grad":
      return value * 0.9;
    case "turn":
      return value * 360;
    default:
      return value;
  }
}

/** A number, a percentage scaled so 100% = `percentScale`, or `none` (0). */
function parseComponent(token, percentScale) {
  if (token === "none") return 0;
  if (token.endsWith("%")) return (Number(token.slice(0, -1)) / 100) * percentScale;
  const value = Number(token);
  if (!Number.isFinite(value)) throw new Error(`Bad component: ${token}`);
  return value;
}

function parseAlpha(token) {
  if (token === undefined) return 1;
  return Math.min(1, Math.max(0, parseComponent(token, 1)));
}

function splitArguments(body) {
  const [main, alpha] = body.split("/").map((part) => part.trim());
  const tokens = main.replace(/,/g, " ").split(/\s+/).filter(Boolean);
  return { tokens, alpha };
}

/**
 * Parse a computed colour string into `{ space, coords, alpha }`. Accepts the forms the three
 * engines serialise: hex, rgb()/rgba(), hsl()/hsla(), hwb(), lab(), lch(), oklab(), oklch(),
 * color(<space> …) and the keywords transparent, black and white.
 */
export function parseColor(input) {
  const text = String(input).trim().toLowerCase();
  if (NAMED.has(text)) {
    const [r, g, b, alpha] = NAMED.get(text);
    return { space: "srgb", coords: [r, g, b], alpha };
  }
  const hex = /^#([0-9a-f]{3,8})$/.exec(text);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) {
      digits = [...digits].map((d) => d + d).join("");
    }
    if (digits.length !== 6 && digits.length !== 8) throw new Error(`Bad hex colour: ${input}`);
    const values = digits.match(/../g).map((pair) => parseInt(pair, 16) / 255);
    return { space: "srgb", coords: values.slice(0, 3), alpha: values[3] ?? 1 };
  }
  const fn = /^([a-z-]+)\((.*)\)$/.exec(text);
  if (!fn) throw new Error(`Unrecognised colour: ${input}`);
  const [, name, body] = fn;
  const { tokens, alpha } = splitArguments(body);
  // Legacy comma syntax (rgb/rgba/hsl/hsla only) carries alpha as a fourth argument.
  const legacy = body.includes(",") && /^(rgba?|hsla?)$/.test(name);
  const legacyAlpha = legacy && tokens.length === 4 && alpha === undefined ? tokens.pop() : alpha;

  switch (name) {
    case "rgb":
    case "rgba":
      return {
        space: "srgb",
        coords: tokens.map((t) => parseComponent(t, 255) / 255),
        alpha: parseAlpha(legacyAlpha),
      };
    case "hsl":
    case "hsla":
      return {
        space: "hsl",
        coords: [
          parseHue(tokens[0]),
          parseComponent(tokens[1], 100),
          parseComponent(tokens[2], 100),
        ],
        alpha: parseAlpha(legacyAlpha),
      };
    case "hwb":
      return {
        space: "hwb",
        coords: [
          parseHue(tokens[0]),
          parseComponent(tokens[1], 100),
          parseComponent(tokens[2], 100),
        ],
        alpha: parseAlpha(alpha),
      };
    case "lab":
      return {
        space: "lab",
        coords: [
          parseComponent(tokens[0], 100),
          parseComponent(tokens[1], 125),
          parseComponent(tokens[2], 125),
        ],
        alpha: parseAlpha(alpha),
      };
    case "lch":
      return {
        space: "lch",
        coords: [
          parseComponent(tokens[0], 100),
          parseComponent(tokens[1], 150),
          parseHue(tokens[2]),
        ],
        alpha: parseAlpha(alpha),
      };
    case "oklab":
      return {
        space: "oklab",
        coords: [
          parseComponent(tokens[0], 1),
          parseComponent(tokens[1], 0.4),
          parseComponent(tokens[2], 0.4),
        ],
        alpha: parseAlpha(alpha),
      };
    case "oklch":
      return {
        space: "oklch",
        coords: [parseComponent(tokens[0], 1), parseComponent(tokens[1], 0.4), parseHue(tokens[2])],
        alpha: parseAlpha(alpha),
      };
    case "color": {
      const [space, ...rest] = tokens;
      if (!RGB_SPACES.has(space)) throw new Error(`Unsupported color() space: ${space}`);
      return {
        space: space === "xyz" ? "xyz-d65" : space,
        coords: rest.map((t) => parseComponent(t, 1)),
        alpha: parseAlpha(alpha),
      };
    }
    default:
      throw new Error(`Unsupported colour function: ${name}()`);
  }
}

// ---------------------------------------------------------------------------
// Gamut mapping and painting
// ---------------------------------------------------------------------------

const EPSILON = 1e-6;
const inGamut = (rgb) => rgb.every((c) => c >= -EPSILON && c <= 1 + EPSILON);
const clip = (rgb) => rgb.map((c) => Math.min(1, Math.max(0, c)));

function oklchOf(rgb) {
  const [l, a, b] = xyzToOklab(multiply(SRGB_TO_XYZ, rgb.map(srgbToLinear)));
  return [l, Math.hypot(a, b), (Math.atan2(b, a) * 180) / Math.PI];
}

const deltaEok = (left, right) => {
  const a = xyzToOklab(multiply(SRGB_TO_XYZ, left.map(srgbToLinear)));
  const b = xyzToOklab(multiply(SRGB_TO_XYZ, right.map(srgbToLinear)));
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
};

const oklchToSrgb = (lch) => xyzToSrgb(oklabToXyz(polarToLab(lch)));

/** CSS Color 4 gamut mapping to sRGB: reduce OKLCH chroma until the clip is within a JND. */
export function gamutMap(rgb) {
  if (inGamut(rgb)) return clip(rgb);
  const [l, c, h] = oklchOf(rgb);
  if (l >= 1) return [1, 1, 1];
  if (l <= 0) return [0, 0, 0];
  const jnd = 0.02;
  let min = 0;
  let max = c;
  let minInGamut = true;
  let current = rgb;
  let clipped = clip(current);
  if (deltaEok(clipped, current) < jnd) return clipped;
  while (max - min > 0.0001) {
    const chroma = (min + max) / 2;
    current = oklchToSrgb([l, chroma, h]);
    if (minInGamut && inGamut(current)) {
      min = chroma;
      continue;
    }
    clipped = clip(current);
    const delta = deltaEok(clipped, current);
    if (delta < jnd) {
      if (jnd - delta < 0.0001) return clipped;
      minInGamut = false;
      min = chroma;
    } else {
      max = chroma;
    }
  }
  return clipped;
}

/**
 * Gamma-encoded sRGB for a parsed colour. sRGB-family input skips the XYZ round trip, so an
 * 8-bit `rgb()` reading paints exactly the channels the engine returned.
 */
function srgbOf(parsed) {
  if (parsed.space === "srgb") return parsed.coords;
  if (parsed.space === "hsl") return hslToSrgb(parsed.coords);
  if (parsed.space === "hwb") return hwbToSrgb(parsed.coords);
  return xyzToSrgb(toXyz(parsed));
}

/**
 * The sRGB paints a colour can take on screen: clipped and CSS4-mapped (identical when the
 * colour is in gamut). Contrast is gated on the worst of them.
 */
export function renderings(parsed) {
  const rgb = srgbOf(parsed);
  if (inGamut(rgb)) return [{ rendering: "srgb", rgb: clip(rgb), alpha: parsed.alpha }];
  return [
    { rendering: "clip", rgb: clip(rgb), alpha: parsed.alpha },
    { rendering: "map", rgb: gamutMap(rgb), alpha: parsed.alpha },
  ];
}

/** Paint `top` over an opaque `bottom` in gamma-encoded sRGB, as browsers composite. */
export const over = (top, alpha, bottom) => top.map((c, i) => c * alpha + bottom[i] * (1 - alpha));

/** Round to the 8-bit value a display receives. */
export const quantize = (rgb) =>
  rgb.map((c) => Math.round(Math.min(1, Math.max(0, c)) * 255) / 255);

export const toHex = (rgb) =>
  `#${quantize(rgb)
    .map((c) =>
      Math.round(c * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;

// ---------------------------------------------------------------------------
// Scores
// ---------------------------------------------------------------------------

/** WCAG 2 relative luminance of gamma-encoded sRGB. */
export const relativeLuminance = (rgb) => {
  const [r, g, b] = rgb.map(srgbToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2 contrast ratio between two opaque sRGB colours. */
export function wcagRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** APCA lightness contrast (Lc) of `text` on `background`, both opaque sRGB. Reported only. */
export function apcaLc(text, background) {
  const y = ([r, g, b]) => {
    const value = 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
    return value < 0.022 ? value + (0.022 - value) ** 1.414 : value;
  };
  const yText = y(text);
  const yBackground = y(background);
  if (Math.abs(yBackground - yText) < 0.0005) return 0;
  if (yBackground > yText) {
    const sapc = (yBackground ** 0.56 - yText ** 0.57) * 1.14;
    return sapc < 0.1 ? 0 : (sapc - 0.027) * 100;
  }
  const sapc = (yBackground ** 0.65 - yText ** 0.62) * 1.14;
  return sapc > -0.1 ? 0 : (sapc + 0.027) * 100;
}
