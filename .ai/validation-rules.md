# attributesValidationRules

Read this when you write the validation schema of any exposed Incident or Clip. Validation is
performed under the hood by [fastest-validator](https://github.com/icebob/fastest-validator), so the
schema follows all the rules of that library, plus the MotorCortex-specific types listed below.

`attributesValidationRules` is a key that can be added on any incident listed on the `incidents` key
of the manifest of any plugin as well as on the `Clip` key, if the plugin exposes a Custom Clip.

Even though `attributesValidationRules` is optional it's strongly recommended as by defining it:

- MotorCortex validates attributes on run time, preventing invalid data, something that can crash
  your Incidents making them look bad and buggy
- DonkeyClip app reads the `attributesValidationRules` and automatically creates the form for adding
  or editing Incidents of your plugins

Example of a manifest:

```js
import MyIncident from "./Incidents/MyIncident.js";

export default {
  npm_name: "my-plugin-name",
  incidents: [
    {
      exportable: MyIncident,
      name: "MyIncident",
      attributesValidationRules: {
        animatedAttrs: {
          type: "object",
          // validation rules
        },
      },
    },
  ],
};
```

`attributesValidationRules` is an object whose keys define the expected keys of the `attrs` that the
Incident supports. For example an Incident that supports the `opacity` and `width` animatedAttrs and
also the `type` attribute would expect something like this as its attrs on instantiation:

```js
// MyPlugin = loadPlugin(pluginDefinition) — see demo/index.js
const myIncident = new MyPlugin.MySpecialIncident(
  {
    type: "typeA",
    animatedAttrs: {
      opacity: 0.5,
      width: "500px",
    },
  },
  {
    selector: "selector",
    duration: 1000,
  },
);
```

A basic validation ruleset for this Incident can be defined in the following way:

```js
import MySpecialIncident from "./Incidents/MySpecialIncident.js";

export default {
  npm_name: "my-plugin-name",
  incidents: [
    {
      exportable: MySpecialIncident,
      name: "MySpecialIncident",
      attributesValidationRules: {
        type: {
          type: "enum",
          values: ["typeA", "typeB"],
        },
        animatedAttrs: {
          type: "object",
          strict: true,
          props: {
            opacity: {
              type: "number",
              min: 0,
              max: 1,
            },
            width: {
              type: "measurement",
              min: 0,
              units: [
                "cm",
                "mm",
                "in",
                "px",
                "pt",
                "pc",
                "em",
                "ex",
                "ch",
                "rem",
                "vw",
                "vh",
                "vmin",
                "vmax",
                "%",
              ],
            },
          },
        },
      },
    },
  ],
};
```

Notice the `units` key on the `width` attribute. `units` enums the list of supported units of the
attribute, separately from the rest of its definition. The way we’ve defined it here, width can be
any number greater than 0 followed by any of the supported units (“800px”, “50%”, etc).

## List of supported validation rules

### number

`type: "number"`

_Used for plain numbers (either integers or floats)_

**Supported properties:**

- `min` (defines the minimum accepted value)
- `max` (defines the maximum accepted value)
- `integer` (boolean, default true, defines if the value must be an integer or not)

### measurement

`type: "measurement"`

Used to define quantities measured in units (e.g. px, rad, %)

**Supported properties:**

- `min` (defines the minimum accepted value)
- `max` (defines the maximum accepted value)
- `integer` (boolean, default true, defines if the value must be an integer or not)
- `units` (a list of supported units. Defaults to unitless, so no units are expected)

### string

`type: "string"`

**Supported properties:**

- `textarea` (boolean, default false, defines whether the UI should render it as text area)
- `empty` (if true an empty string is accepted “ “. Defaults to true)
- `min` (minimum string length)
- `max` (maximum string length)
- `length` (fixed string length is only accepted)
- `pattern` (regex pattern)

### color

`type: "color"`

**No supported properties**

### enum

`type: "enum"`

**Supported properties:**

- `values` (an array containing all the accepted values)

### boolean

`type: "boolean"`

**No supported properties**

### object

`type: "object"`

**Supported properties:**

- `props` (an object, the keys’ names of which define its supported properties and the value of each
  key defines the validation rule of it)
- `strict` (boolean, defaults to true. If true only properties of its `props` key will be accepted.
  Otherwise any other property name will be accepted and treated as a small string)

### array

`type: "array"`

**Supported properties:**

- `empty`: if true the validator accepts an empty array `[]`
- `min`: Minimum count of elements
- `max`: Maximum count of elements
- `length`: Fix count of elements
- `contains`: The array must contain this element too
- `unique`: The array must be unique (array of objects is always unique)
- `enum`: Every element must be an element of the enum array
- `items`: Schema for array items
