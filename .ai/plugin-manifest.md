# The plugin manifest (`src/index.js`)

Read this when you create or edit `src/index.js` or `package.json`. This is the file your
`package.json` `main`/`module`/`browser` fields point to (bundled into `dist/`). It defines all of
the necessary information MotorCortex needs in order to properly load your plugin and make your
Incidents available to developers. Without it your plugin just can’t be loaded to MotorCortex.

## Repo file structure

- `src/index.js` — the manifest: lists and exposes all available incidents of the plugin. Notice
  that for each incident there's an `attributesValidationRules` object which is a
  `fastest-validator` compatible object that defines the schema of acceptable attributes by each
  exposed incident. A special key `Clip` exposes custom clips (if any) by the plugin.
- `src/Incidents/` — where all of the exportable incidents should live. The boilerplate repo comes
  with 4 preset, empty boilerplate incidents to get you started (`Effect.js`, `Combo.js`,
  `Clip.js`, `HTMLClip.js`). **These are examples, not part of any real plugin:** keep and rename
  only the ones your plugin implements, delete the rest, and prune the corresponding entries from
  `src/index.js` — the finished manifest must export only real incidents/clips.
- `package.json` — always make sure the name of the plugin and its version are up to date. Also
  there's the right place to declare any dependencies. When starting a new plugin from the
  boilerplate, set `name`, `description` and `repository` to the new plugin's identity first.
- `demo/` — the local demo app used by `npm start`.

## The exported object

The manifest default-exports a plain plugin-definition object with the following properties:

- `npm_name`: mandatory, specifies the unique name of your plugin and should be identical to your
  `package.json` “name” field
- `version`: the plugin version — import both from `package.json` so they never drift
- `incidents`: an array of all of the Incidents exposed by your plugin
- `Clip`: that’s where you can place your Custom Browser Clip
- `audio`: (optional) your plugin's audio capabilities
- `compositeAttributes`: (optional) if your Incidents support composite attributes this is the place
  to define them

Real plugins sometimes also carry extra convenience keys (e.g. `helpers: {}` in
`@donkeyclip/motorcortex-threejs`, `utils: { fromLonLat }` in `@donkeyclip/motorcortex-ol`); they
are passed through and do not affect loading.

### Export template (plain object, ESM)

The manifest default-exports a **plain object**. `Plugin` exists only as a TypeScript _type_ in
`@donkeyclip/motorcortex` — there is no runtime `Plugin` class, so `new Plugin({...})` throws.
Consumers turn the object into a usable plugin with `loadPlugin()` (see `demo/index.js`). This is
exactly the shape used by real plugins such as `@donkeyclip/motorcortex-threejs` and
`@donkeyclip/motorcortex-ol`:

```js
import MyIncident from "./Incidents/MyIncident.js";
import MyCustomClip from "./Incidents/MyCustomClip.js";
import { name, version } from "../package.json";

export default {
  npm_name: name, // don't touch this — must equal package.json "name"
  version, // don't touch this
  incidents: [
    {
      exportable: MyIncident,
      name: "MyIncident",
      attributesValidationRules: {
        animatedAttrs: {
          type: "object",
          props: {
            opacity: { type: "number", min: 0, max: 1 },
          },
        },
      },
    },
  ],
  Clip: {
    exportable: MyCustomClip,
  },
};
```

## `incidents`

`incidents` holds an array of objects each of which defines the exposed Incident. The structure of
this object is simple:

- `exportable`: a direct reference to the Class of the Incident
- `name`: the name of your Incident in the outer world. For example if you name it “MyIncident”,
  then your Incident will be available on `YourPlugin.MyIncident`
- `attributesValidationRules`: this object defines the attributes that your Incident expects /
  supports. Under the hood validation is performed by the
  [fastest-validator](https://github.com/icebob/fastest-validator) library, so the object here
  follows all the rules of the specific library. See [validation-rules.md](validation-rules.md).

- `originalDims`: (optional) for Incidents that are Clips/Animations, the natural dimensions of
  the composition, e.g. `originalDims: { width: "600px", height: "400px" }` (the starter's
  `MyHTMLClip` entry shows this).

Even though `attributesValidationRules` is optional it is bad practice not to define it.

## `Clip`

In contrast with normal Incidents, each plugin can only define just one Custom (Browser) Clip. When
defining a Custom Clip then you should not put it on the `incidents` array but you should place it
on the `Clip` keyword of your manifest. The schema though is identical to the schema of Incidents
within the `incidents` array only this time you don’t need to define the name of it. The name will
always be `.Clip`.

```js
Clip: {
  exportable: MyCustomClipClass,
  attributesValidationRules: {...}
}
```

## `audio`

The `audio` key defines your plugin's audio capabilities. It accepts one of the following values:

| Value    | Description                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `"off"`  | (default) No audio capabilities                                                                                              |
| `"on"`   | The plugin's Clip participates in MC's built-in audio system. audioSources can be loaded and audio Incidents can target them |
| `"only"` | Audio-only Clip with no visual context. Uses MC's internal AudioClip. No DOM rendering                                       |

These three are the only accepted values (verified against motorcortex 9.26.0:
`AUDIO_OPTIONS = 'on' | 'only' | 'off'`). There is **no** `audio: "custom"` option — see
[audio.md](audio.md) for what to do when a plugin embeds media with its own sound.

```js
export default {
  npm_name: "my-audio-plugin",
  incidents: [/* ... */],
  Clip: { exportable: MyAudioCapableClip },
  audio: "on",
};
```

## `compositeAttributes`

There are cases that an Effect of yours might handle / animate an attribute that is composite. By
composite we mean that this attribute is defined by a set of attributes. For example the position of
an element on a 2D space should be defined as a composite attribute consisting of x and y,
`transform` on css should be the combination of `translateX`, `translateY`, etc.

By defining your composite attributes you help MotorCortex handle these cases properly in terms of
conflicts checks. For example, if Incident A alters the value of `position.x` and Incident B alters
the value of `position.y` of the same element, as soon as they alter the attributes of the same
composite attribute they can not overlap with each other.

Defining your `compositeAttributes` is very easy. The only thing you need to do is to define an
object, the keys of which specify the name of your composite attributes and the value of which
define an array containing (as strings) the names of the attributes that form it. E.g.

```js
compositeAttributes: {
  position: ["x", "y"];
}
```

or

```js
compositeAttributes: {
  transform: [
    "translateX",
    "translateY",
    "translateZ",
    "rotate",
    "rotateX",
    "rotateY",
    "rotateZ",
    "scale",
    "scaleX",
    "scaleY",
    "scaleZ",
    "skewX",
    "skewY",
    "perspective",
  ];
}
```

Real-world examples: `motorcortex-threejs` declares `rotation`/`position`/`scale` (each
`["x", "y", "z"]`-based) and `motorcortex-ol` declares `{ goto: ["center", "zoom"] }`.
