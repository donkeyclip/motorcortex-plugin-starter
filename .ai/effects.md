# Developing Effects

Read this when you build an Incident that tweens attribute values of selected context elements
(the most common kind of plugin Incident). Extend `MotorCortex.Effect`.

Effects are Incidents that tween the attributes' values of selected elements of the context. Before
writing your first Effect let’s have a look at some internals that will help you nail it.

As you most probably already know as a MotorCortex user, all Effects take a `selector` on their
props which defines the elements of the context that it should be applied to. Also, on all Effects’
attrs there is a special key with the name `animatedAttrs`, which is an object holding all
attributes that should be tweened and their final values.

## MonoIncidents — what you are actually coding

The most characteristic example of Effect is the built-in CSSEffect of MotorCortex. Let's examine
the way this Effect works under the hood as it's identical with the way any other (plugin) Effect
works.

```js
const myEffect = new CSSEffect(
  {
    // attrs
    animatedAttrs: {
      width: "600px",
      top: "30px",
    },
  },
  {
    // props
    selector: ".class-a",
    duration: 2000,
  },
);
```

This Effect will change the value of “width” and “top” of each element of the class “.class-a” until
it reaches the final values (600px and 30px respectively). That’s the concept. Let’s see how it’s
done.

The moment the Incident enters the Clip it automatically (and internally) gets dissolved into
smaller pieces up until it reaches the point where the initial Incident has been analysed to
Incidents of a single element and a single attribute (we call them Mono-Incidents). The final number
of Mono-Incidents that will be produced is the product:
`numberOfAnimatedAttrs * numberOfElements`. For example, continuing with our example, if we have
three elements of the class “.class-a” then we will have 6 in total MonoIncidents created internally
on MotorCortex:

1. First element / width
2. First element / top
3. Second element / width
4. Second element / top
5. Third element / width
6. Third element / top

**When extending MotorCortex.Effect you are actually coding the mono-Incident that will be
internally produced by MotorCortex.**

## Properties available out of the box

`MotorCortex.Effect` offers the following properties (which you can use on your code):

- `element`: the element that the Incident will be applied to
- `attributeKey`: the attribute name that will be animated (this will either be “top” or “width” in
  our example, depending on which of the six MonoIncidents runs at the time)
- `targetValue`: the value of the animated attribute to be animated (e.g. “600px” or “30px”). Even
  if the final user uses dynamic values of its attributes (e.g. “@stagger” or “@expression”), the
  `targetValue` here will always be a specific, already calculated by MC value
- `selector`: a selector string that only returns `this.element`
- `initialValue`: the initial value of the animated attribute (you don’t care where this comes from.
  As a Plugin Developer you only know that MotorCortex has this calculated for you at all times)

## Methods to overwrite

Effect has also the following methods, which you should overwrite in order to define your own
Effect:

- `onGetContext`
- `getScratchValue`
- `onProgress`

### onGetContext

On instantiation of an Effect, the Effect doesn’t yet belong to a Clip and thus has no context. Once
the Incident enters a Clip it gains context, and that's when it gets dissolved to its MonoIncidents.

`onGetContext` runs when the MonoIncident you coded gains context. This is a great place to
configure or even completely craft your tween. Full access to `this.element`, `this.targetValue`,
`this.initialValue` and to all the other properties listed above is available here.

### getScratchValue

As mentioned MotorCortex provides the `initialValue` property on MonoIncidents, which always has the
calculated initial value of the attribute. The initial value of an attribute is calculated by
MotorCortex by the following, hierarchy ordered ways:

1. From the user’s `initialValues` (if provided)
2. From the final value of the previous MonoIncident on the same element and on the same attribute, and...
3. If this is the very first MonoIncident of the specific element-attribute pair, from the
   `getScratchValue` method of the MonoIncident.

Effects are multi-purpose and MotorCortex can’t and doesn't know this value. Only the MonoIncident
developer can define that by overriding the `getScratchValue` method and return the “scratch value”
for the specific element and for the specific attribute.

For example, for the implementation of the CSSEffect the `getScratchValue` method returns the value
of the css property (`attributeKey`) from `window.getComputedStyle`.

### onProgress

Action time! `onProgress(millisecond)` gets exactly **one** argument:

- `millisecond` — the milliseconds passed within the Incident, with the Incident's easing
  **already applied**. MonoIncident developers can, here, affect their MonoIncident’s element in any
  way they want.

If the developer needs to know the fraction (from 0 to 1) they can use the `this.getFraction`
method passing the millisecond — since the millisecond is already eased, `getFraction` returns the
eased fraction. Never re-apply easing yourself, and never declare a `(fraction, millisecond)`
signature: the single argument IS the millisecond (real plugins:
`motorcortex-threejs/ObjectAnimation`, `motorcortex-ol/GoTo`).

#### ⚠️ CRITICAL: timeline reversibility & pure functions

The `onProgress(millisecond)` method MUST be a pure, stateless function of time.

- **NEVER** increment external variables or keep local accumulators inside `onProgress`.
- **ALWAYS** compute element attributes directly from `this.getFraction(millisecond)`,
  `this.initialValue` and `this.targetValue`.
- **WHY:** When a user scrubs backward on the timeline, MotorCortex calls `onProgress` with smaller
  millisecond values. If your logic relies on stateful counters, scrubbing backward will break the
  visual layout.

## What you don't need to care about

We listed all props and methods you should care about when developing an Effect. Here is a list of
things you don’t care about at all, as are handled directly by MotorCortex:

- repeats
- delay
- hiatus
- easing
- duration

## A complete, working Effect

A minimal but complete Effect, distilled from the real `motorcortex-threejs` and `motorcortex-ol`
plugins. It animates the 2D `position` of a custom entity registered by a custom Clip (see the note
below for what `this.element` is in that case):

```js
import { Effect } from "@donkeyclip/motorcortex";

export default class PositionEffect extends Effect {
  /**
   * Called only for the very first MonoIncident of this element+attribute
   * pair: report the element's current ("scratch") value so MC can
   * interpolate from it. Read the live state — don't return constants
   * unless the state genuinely starts there.
   */
  getScratchValue() {
    const object = this.element.entity.object; // entity record → payload
    return { x: object.position.x, y: object.position.y };
  }

  onGetContext() {
    // Optional: the MonoIncident just gained context. this.element,
    // this.targetValue and this.initialValue are all available here —
    // a good place to precompute anything onProgress will reuse.
  }

  onProgress(millisecond) {
    // millisecond is already eased; getFraction returns the eased fraction
    const fraction = this.getFraction(millisecond);
    const object = this.element.entity.object;
    object.position.x =
      this.initialValue.x +
      (this.targetValue.x - this.initialValue.x) * fraction;
    object.position.y =
      this.initialValue.y +
      (this.targetValue.y - this.initialValue.y) * fraction;
  }
}
```

Pure function of time: given the same `millisecond` it always produces the same state, so the
timeline can seek in either direction. Since `position` is composite (`x`, `y`), the manifest should
declare `compositeAttributes: { position: ["x", "y"] }` — see
[plugin-manifest.md](plugin-manifest.md).

## Custom Effects for custom entities

Once you design your plugin, decide on its functionality, render and store its custom entities it's
time to create your custom Effects that will affect your custom entities.

Developing a custom Effect tailor made for your own custom entities is as simple as developing any
other Effect. Just extend the `MotorCortex.Effect` class and do exactly what you do with a simple
Effect. The only difference with the simple Effect is what `this.element` holds:

- **DOM context (HTMLClip):** `this.element` is the HTML element itself.
- **Custom entities (`!` selectors):** `this.element` is the stored registry **record**
  `{ id, entity, classes }` — the payload you passed to `setCustomEntity` is at
  `this.element.entity`. E.g. `motorcortex-threejs` registers `{ object }` wrappers and its Effects
  read `this.element.entity.object`.

The rest of the Effect operates in the exact same way it does on the simple case.

All of your Effects can be directly added to your custom Clip in the obvious way
(`clip.addIncident(effect, millisecond)`), can be used with combos, and in general do not differ at
all from common Effects except that they accept `!` selectors (for custom entities). See
[browser-clips.md](browser-clips.md).

Audio Effects follow the same logic — see [audio.md](audio.md).
