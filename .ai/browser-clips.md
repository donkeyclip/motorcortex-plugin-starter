# Custom (Browser) Clips

Read this when the native HTMLClip is not enough — canvas, SVG, WebGL, maps, video — and your plugin
needs to expose a whole new Clip type with its own entities and its own Effects. Extend
`BrowserClip`.

These go to the `Clip` key of the manifest, while Animations go to the normal `incidents` listing.
See [plugin-manifest.md](plugin-manifest.md).

There might be cases that the "native" HTMLClip exposed by MC is not good enough to serve your
Plugin's special needs. For example Clips that use webGL or canvas or anything else that can not be
represented as just HTML and CSS or Clips that do very specific things and accept tailored made
Effects (e.g. a map clip that will accept pan and zoom effects).

In such cases the developer needs to extend the `BrowserClip` and create new types of Clips that on
initialisation they render whatever needs to be rendered and define custom entities kept in their
context so they can be later accessed via selectors from (also) custom Effects.

For example, let's suppose that we want to create a Clip that takes on its attributes an object that
defines a number of circles and rectangles to be rendered, renders them on a canvas and exposes them
via selectors so they can be targeted by Effects which will be able to change their looks and
position.

```js
import { BrowserClip } from "@donkeyclip/motorcortex";

class MyCustomClip extends BrowserClip {
  // overwrite the onAfterRender method
  onAfterRender() {
    // create a canvas
    const ctx = this.context.document.createElement("canvas");

    // draw all rects and circles in it. Here you have full access to the attributes passed to your
    // Clip on initialization via the "this.attrs" property
    // ...

    // store each of the rects and circles as custom entities via the "setCustomEntity" method
    // provided. The setCustomEntity method accepts exactly three arguments: the id of the custom
    // element, the custom element itself, optionally an array of the classes the element belongs to
    this.setCustomEntity("myRect_1", myRectObject, ["class1", "class2"]);

    // put the canvas on the Clip's DOM. this.context.rootElement always refers to the root HTML
    // element of your Clip, which can host whatever an HTML element can host
    this.context.rootElement.appendChild(ctx);
  }
}
```

## How to think / mind the portability

The type of elements that your Clip supports (rectangles and circles in our example, a map or a
video in another example etc) is up to the plugin developer to decide. In general, the way to think
is the following:

1. Decide on what your Custom Clip will render and what Effects it will support
2. Decide on the entities that your Clip will expose via selectors so they can be accessed via
   Effects
3. Develop your Clip so it accepts attributes that:

- Define the number, types and characteristics of the entities to be rendered along with any other
  information your Clip needs in order to render properly (e.g. map center, colors or any other
  relative information)
- Can be exported to JSON (no references to Class instances nor anything else that can not be stored
  as JSON). Don't forget, here you are developing a custom MotorCortex Clip and in MotorCortex all
  Clips (even the custom ones) must always be: playable, dynamic, parametric, isolated and portable.
  By extending BrowserClip MC makes sure all these specs are met except the portability. This should
  be guaranteed by you by designing your Clip to accept attrs that can be stored (and transferred)
  in JSON format.

4. Extend the BrowserClip Class to create your own Custom Clip
5. Overwrite the onAfterRender method of it so you can: a. Render your Clip (e.g. create and append a
   canvas, a map or anything else on your rootElement) b. Store all of your custom entities so they
   can be accessed via selectors by Effects (which you can develop later)

## onAfterRender

The method to overwrite is `onAfterRender`. That's where you should put all of your rendering logic
and create your custom elements.

The name "onAfterRender" refers to the host of your Clip. At this point your host, rootElement (can
be accessed by `this.context.rootElement`) is a DIV that will host your entire Clip. At this point,
this host is already rendered on the DOM so you can work with it as you would work with any other
DIV of a DOM.

If your rendering is asynchronous (loading 3D models, map tiles, etc.), pair
`this.contextLoading()` / `this.contextLoaded()` around it so the root Clip blocks until you're
ready — both `motorcortex-threejs` and `motorcortex-ol` do this. See [blockings.md](blockings.md).

## Setting custom entities

On `onAfterRender` method you can define and store custom entities in your context so it can later
be accessed by Effects' selectors. The concept is straightforward:

- Each entity must have a unique id
- Each entity can belong to a number of different classes

_You can store as entities literally anything you want. A map object, an svg element, a rectangle on
a canvas, a 3d light, anything._

As each custom entity has an id and can belong to a number of classes, Effects can access them via
selectors that are extremely similar with plain CSS selectors (`#` and `.`). Only this time you need
to add the `!` character in front of the selector to indicate that you target a custom entity.

**Examples**

- `!#idX`: targets the custom entity with id === "idX"
- `!.classX`: targets all custom entities that belong to the class `.classX`

But how exactly do you define your custom entities? Via the `setCustomEntity` method of BrowserClip.

`setCustomEntity` method takes exactly three arguments:

1. The id of the entity (must be unique among all custom entities)
2. The entity itself
3. Optionally an array of strings defining the classes it belongs to

## Supporting addCustomEntity

While `setCustomEntity` registers entities created during `onAfterRender`, users may also want to add
entities **dynamically at runtime** via `addCustomEntity`. This API exists since
`@donkeyclip/motorcortex` **9.24.0** — this starter's devDependency (`^9.22.1`) resolves to a
version that has it, but check the peer range you declare.

To support this, your BrowserClip subclass should override two methods: `renderCustomEntity` and
`hideEntity`.

### renderCustomEntity

`renderCustomEntity(definition, parentId)` is called when the user invokes `addCustomEntity`. It
receives the user-provided `definition` object and must:

1. Create the actual element (DOM node, SVG element, canvas object, map feature, etc.)
2. Append it to the Clip's context (e.g. the rootElement, an SVG canvas, a map layer)
3. Return the entity object

If the definition is invalid, return `null`.

> **`html_element` convention:** if your entity has a DOM node that should be animatable by
> CSSEffect, set an `html_element` property on the returned object pointing to that node. CSSEffect
> will automatically resolve it.

#### Default implementation (BrowserClip)

BrowserClip provides a default `renderCustomEntity` that parses an HTML string and appends it to the
root element. This is what HTMLClip uses:

```js
// Definition: { html: "<div>...</div>" }
// BrowserClip parses the HTML, appends to rootElement, returns the DOM node
```

#### SVG plugin example

An SVG plugin creates SVG elements and wraps them in groups for positioning and animation:

```js
class SvgClip extends BrowserClip {
  renderCustomEntity(definition) {
    if (!definition?.svg) return null;

    // Create an outer <g> for SVG positioning
    const outer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const x = definition.x || 0;
    const y = definition.y || 0;
    if (x !== 0 || y !== 0) {
      outer.setAttribute("transform", `translate(${x}, ${y})`);
    }

    // Create an inner <g> for CSS animations
    const inner = document.createElementNS("http://www.w3.org/2000/svg", "g");
    const temp = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    temp.innerHTML = definition.svg;
    while (temp.firstChild) inner.appendChild(temp.firstChild);

    outer.appendChild(inner);
    this._svg.appendChild(outer);

    // html_element points to the inner <g>, CSSEffect animates this node
    return { html_element: inner, _outerG: outer };
  }
}
```

#### Map plugin example

A map plugin creates OpenLayers features from geographic definitions. OpenLayers 10 uses ESM
entrypoints with `.js` suffixes, so import the classes explicitly in the plugin package rather than
relying on the older OpenLayers 6 import style:

```js
import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import CircleStyle from "ol/style/Circle.js";
import Fill from "ol/style/Fill.js";
import Style from "ol/style/Style.js";
import { fromLonLat } from "ol/proj.js";

class MapClip extends BrowserClip {
  renderCustomEntity(definition) {
    if (!definition?.type) return null;

    let geometry, style;
    if (definition.type === "point") {
      geometry = new Point(fromLonLat(definition.coords));
      style = new Style({
        image: new CircleStyle({
          radius: definition.size || 8,
          fill: new Fill({ color: definition.color || "#e76f51" }),
        }),
      });
    }
    // ... handle "line", "polygon", etc.

    const feature = new Feature({ geometry });
    feature.setStyle(style);
    this._vectorSource.addFeature(feature);
    return feature;
  }
}
```

The `@donkeyclip/motorcortex-ol` package (in the donkeyclip monorepo,
`github.com/donkeyclip/donkeyclip`, under `packages/motorcortex-ol`) follows this OpenLayers 10
shape: it only renders serialized map definitions and incidents in the browser.

#### Polygon entities with holes

The map payload supports the Go territory shape with a `polygons` array. Each part has an `outer`
ring and may have a `holes` array of rings:

```json
{
  "type": "polygon",
  "polygons": [
    {
      "outer": [
        [20, 40],
        [22, 40],
        [22, 38],
        [20, 38],
        [20, 40]
      ],
      "holes": [
        [
          [20.5, 39.5],
          [21.5, 39.5],
          [21.5, 38.5],
          [20.5, 38.5],
          [20.5, 39.5]
        ]
      ]
    },
    {
      "outer": [
        [24, 40],
        [25, 40],
        [25, 39],
        [24, 39],
        [24, 40]
      ]
    }
  ]
}
```

`polygons` is authoritative when present, even if the entity also contains legacy `coords`. A
malformed `polygons` value rejects the entity rather than falling back to `coords`. When `polygons`
is absent, a valid legacy `coords` ring still renders. One part becomes an OpenLayers `Polygon`,
including its holes. Multiple parts become one `MultiPolygon`. The rings use raw
`[longitude, latitude]` pairs and are projected by the renderer.

Provider responses can be unavailable or malformed. Do not treat a provider shape as valid merely
because it has a polygon type. Validate it before emitting the payload and handle rejected geometry
explicitly.

#### Attribution overlays

A plugin that renders third-party map or imagery data should show attribution the same way
`@donkeyclip/motorcortex-ol` does: as a fixed, reviewed set of source ids the plugin recognizes,
never as text or a link taken directly from a provider's response. `@donkeyclip/motorcortex-ol`
closes its set to `mapbox`, `openstreetmap`, and `openhistoricalmap`; each maps to one reviewed
`{ label, href }` pair, and anything else, a typo, an unreviewed provider name, a raw URL, is
silently ignored rather than rendered or thrown. That keeps attribution copy legal and
brand-reviewed text controlled by the plugin, not by a tool call, an author, or a provider payload.

Author the overlay as plain, inline-styled HTML mounted on the clip's own root, independent of the
underlying rendering library's state, so it works regardless of the shadow root the clip renders
into and never needs to read or write feature style. Bound its layout to the clip's own rectangle
(`max-width`/`max-height` as percentages, not fixed pixels) and let it wrap or scroll internally
instead of clipping or truncating a link that does not fit, so every link stays keyboard-reachable
on a small board. See `packages/motorcortex-ol` in the donkeyclip monorepo for the full contract
this package follows, including how a source id is deduplicated across the base map, initial
config, and later incidents.

### hideEntity

`hideEntity(element)` is called when `addCustomEntity` is invoked with `hidden: true` (the default).
It should make the element invisible in whatever way is appropriate for your rendering context:

```js
// HTML/SVG, set opacity to 0
hideEntity(element) {
  const node = element?.html_element ?? element;
  if (node?.style) node.style.opacity = "0";
}

// Map features, set empty style
hideEntity(element) {
  if (element instanceof Feature) {
    element.setStyle(new Style({}));
  }
}

// 3D objects, set visible to false
hideEntity(element) {
  if (element?.visible !== undefined) element.visible = false;
}
```

The user then reveals the entity at the desired time using CSSEffect or a plugin-specific Effect
incident on the timeline.

## Custom Effects for your entities

Once you design your plugin, decide on its functionality, render and store its custom entities it's
time to create your custom Effects that will affect your custom entities. Developing a custom Effect
tailor made for your own custom entities is as simple as developing any other Effect — the only
difference is that `this.element` is now the stored registry **record** `{ id, entity, classes }`,
not an HTML Element: the payload you passed to `setCustomEntity` sits at `this.element.entity`
(e.g. `motorcortex-threejs` Effects read `this.element.entity.object`). See
[effects.md](effects.md).

If your Clip needs time to render before it can play, see [blockings.md](blockings.md).
