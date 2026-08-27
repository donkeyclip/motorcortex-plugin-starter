# Motorcortex.js Plugin Engine Specification

You are an expert JavaScript graphics & animation engineer tasking with creating a native MotorCortex plugin.

## 🤖 AGENT STEP-BY-STEP WORKFLOW
When asked to build a new MotorCortex plugin:
1. **Extend standard base classes:** `Effect` for attribute animations, `BrowserClip` for custom canvas/map/3D viewports, or `HTMLClip` for pre-built DOM compositions.
2. **Implement lifecycle methods:**
   - For `Effect`: Implement `onGetContext`, `getScratchValue`, and `onProgress`[cite: 1].
   - For `BrowserClip`: Implement `onAfterRender`[cite: 1], `renderCustomEntity`[cite: 1], and `hideEntity`[cite: 1].
3. **Register custom entities:** Use `this.setCustomEntity(id, entity, classes)` inside `onAfterRender` so selector engines (e.g., `!#myId`) can target them[cite: 1].
4. **Export validation rules:** Always provide a `fastest-validator` schema in `index.js` under `attributesValidationRules`[cite: 1].
5. **Enforce JSON portability:** All parameters passed to `attrs` MUST be serializable to JSON[cite: 1].

## A few words about motorcortex library
MotorCortex is a dynamic video technology for the Web. 

MotorCortex allows developers to create a Clip by simply defining its context (e.g. HTML / CSS) and to position Effects, Animations or even other Clips anywhere on its timeline.

Anything that can be added on a Clip’s timeline we call it Incident and thus in MotorCortex everything is an Incident.

MotorCortex Clips are

- playable, as they can be played, paused and seeked
- dynamic as they are designed to change on run time
- parametric as they accept properties that affect their look and behavior
- isolated as they’re completely sealed from their environment
- portable as they can be saved and transferred as simple JSON files

The framework provides an easy and documented SDK for creating plugins. Writing a plugin for MotorCortex feels extremely similar to just simply using it.

## Base Classes of motorcortex itself
### Clip
The Clip in MotorCortex is en entity that has the following characteristics:
- It owns a context
- It has a timeline
- It can accept any Group or Incident on its timeline

Under the hood, it is responsible of checking and handling Incidents addition, edit and removal.

#### The Context
The key-word to notice on these characteristics is the context. The context is anything that contains elements that can be accessed via selectors.

The implemented and provided by MotorCortex, HTMLClip is just one of the possible implementations.

#### HTMLClip
HTMLClip defines and owns an isolated context (consisting of HTML and CSS), renders itself on any DOM element and of course it provides a timeline that can accept Incidents.

Incidents added to an HTMLClip's timeline most usually animate elements of the Clip's context or they are just other Clips that have their own context, timeline and duration, and so on.

HTMLClip renders itself by the use of shadow DOM. If shadow DOM is not supported by the browser it falls back to iframe. This way HTMLClip keeps itself isolated from any CSS or js of the parent document.

Example:
```js
import { HTMLClip } from "@donkeyclip/motorcortex";

// Clip definition
const myClip = new HTMLClip({
  host: document.getElementById("app"),
  html: `
    <div class="container">
      <div class="circle circle-a"></div>
      <div class="circle circle-b"></div>
      <div class="circle circle-c"></div>
      <div class="text-container">{{ initParams.text }}</div>
    </div>
  `,
  css: `
    .container{
      position: relative;
      width: 600px;
      height: 400px;
      font-family: 'Ubuntu', sans-serif;
      text-align: center;
      text-shadow: 2px 2px 2px #444;
      background: whitesmoke;
    }

    .circle{
      opacity: 0.7;
      position: absolute;
      border-radius: 100%;
    }

    .circle-a{
      top: 2%;
      left: 15%;
      width: 390px;
      height: 390px;
      background: #f72585;
    }

    .circle-b{
      top: 18%;
      left: 8%;
      width: 320px;
      height: 320px;
      background: #7209b7;
    }

    .circle-c{
      top: 11%;
      right: 15%;
      width: 210px;
      height: 210px;
      background: #3a0ca3;
    }

    .text-container{
      position: absolute;
      top: 55%;
      left: 15%;
      color: whitesmoke;
      font-size: 26px;
    }
  `,
  fonts: [
    {
      type: "google-font",
      src: "https://fonts.googleapis.com/css2?family=Ubuntu:wght@500;700&display=swap",
    },
  ],
  containerParams: {
    width: "600px",
    height: "400px",
  },
  initParams: {
    text: "Hello MotorCortex!",
  },
});
```

### Effect
Effects are Incidents that animate the attributes' values of selected elements of the context.

All Effects take exactly two arguments on initialisation:

- attributes
- properties

Both attributes and properties are of type object.

Example:
The best example of an Effect is the CSSEffect Incident provided by MotorCortex. This Effect can animate the css properties of any element of the Clip context. You can define what you want to animate, in how many milliseconds, select the elements you want to apply the effect and add this Incident anywhere on the Clip's timeline.

Let's add some action on our Clip's timeline by adding a CSSEffect
```js
import { HTMLClip, CSSEffect } from "@donkeyclip/motorcortex";

// Clip definition
const myClip = new HTMLClip({
	host: document.getElementById("app"),
	html: `
    <div class="container">
      <div class="circle circle-a"></div>
      <div class="circle circle-b"></div>
      <div class="circle circle-c"></div>
      <div class="text-container">{{ initParams.text }}</div>
    </div>
  `,
	css: `
    .container{
      position: relative;
      width: 600px;
      height: 400px;
      font-family: 'Ubuntu', sans-serif;
      text-align: center;
      text-shadow: 2px 2px 2px #444;
      background: whitesmoke;
    }

    .circle{
      transform: scale(0);
      opacity: 0.7;
      position: absolute;
      border-radius: 100%;
    }

    .circle-a{
      top: 2%;
      left: 15%;
      width: 390px;
      height: 390px;
      background: #f72585;
    }

    .circle-b{
      top: 18%;
      left: 8%;
      width: 320px;
      height: 320px;
      background: #7209b7;
    }

    .circle-c{
      top: 11%;
      right: 15%;
      width: 210px;
      height: 210px;
      background: #3a0ca3;
    }

    .text-container{
      transform: scale(0);
      position: absolute;
      top: 55%;
      left: 15%;
      color: whitesmoke;
      font-size: 26px;
    }
  `,
	fonts: [
		{
			type: "google-font",
			src:
				"https://fonts.googleapis.com/css2?family=Ubuntu:wght@500;700&display=swap"
		}
	],
	containerParams: {
		width: "600px",
		height: "400px"
	},
	initParams: {
		text: "Hello MotorCortex!"
	}
});

// Effect Definition
const myEffect = new CSSEffect(
	{
		animatedAttrs: {
			transform: {
				scaleX: 1,
				scaleY: 1
			}
		}
	},
	{
		selector: ".container>div",
		duration: "@stagger(400, 800, 0, easeOutCubic)",
		delay: "@stagger(0, 600)",
		easing: "easeOutBounce"
	}
);

// Add Effect to Clip
myClip.addIncident(myEffect, 0);

// Play the Clip
myClip.play();
```

### ⚠️ CRITICAL AGENT RULE: Timeline Reversibility & Pure Functions
The `onProgress(milliseconds)` method MUST be a pure, stateless function of time.
- **NEVER** increment external variables or keep local accumulators inside `onProgress`.
- **ALWAYS** compute element attributes directly from `this.getFraction(milliseconds)` or `this.interpolatedValues`.
- **WHY:** When a user scrubs backward on the timeline, MotorCortex calls `onProgress` with smaller millisecond values. If your logic relies on stateful counters, scrubbing backward will break the visual layout.

### Groups
Groups provide a convenient way to group Incidents together and manage them altogether. Just like the Clip, the Group also provides a timeline where Incidents can be positioned. Unlike Clips, Groups do not own context, they are just used to group Incidents together.

Example
```js
// that's how we create a new Group
const myGroup = new MotorCortex.Group();

// we can add as many Incidents as we want anywhere on our Group's timeline
myGroup.addIncident(incident1, 0);
myGroup.addIncident(incident2, 1000);

// On the same manner we can add our Group on any other Group's or Clip's timeline
myClip.addIncident(myGroup, 1000);
```

### Combos
Combo provides a convenient way to define composite Incidents, consisting of many (and of different types) Incidents, positioned on specific milliseconds within the Combo.

Example:
```js
import { HTMLClip, Combo, CSSEffect } from "@donkeyclip/motorcortex";

// Clip definition
const myClip = new HTMLClip({
 host: document.getElementById("app"),
 html: `
  <div>
    <div class="super-container first">
      <div class="container">
        <div class="circle circle-a"></div>
        <div class="circle circle-b"></div>
        <div class="circle circle-c"></div>
        <div class="text-container">{{ initParams.text }}</div>
      </div>
    </div>
    <div class="super-container second">
      <div class="container">
        <div class="circle circle-a"></div>
        <div class="circle circle-b"></div>
        <div class="circle circle-c"></div>
        <div class="text-container">{{ initParams.secondText }}</div>
      </div>
    </div>
    </div>
  `,
 css: `
    .container{
      position: relative;
      width: 600px;
      height: 400px;
      font-family: 'Ubuntu', sans-serif;
      text-align: center;
      text-shadow: 2px 2px 2px #444;
      background: whitesmoke;
    }

    .circle{
      transform: scale(0);
      opacity: 0.7;
      position: absolute;
      border-radius: 100%;
    }

    .circle-a{
      top: 2%;
      left: 15%;
      width: 390px;
      height: 390px;
      background: #f72585;
    }

    .super-container.second .circle-a{
      background: #D4C1EC;
    }

    .circle-b{
      top: 18%;
      left: 10%;
      width: 320px;
      height: 320px;
      background: #7209b7;
    }

    .super-container.second .circle-b{
      background: #9F9FED;
      left: 36%;
    }

    .circle-c{
      top: 11%;
      right: 15%;
      width: 210px;
      height: 210px;
      background: #3a0ca3;
    }

    .super-container.second .circle-c{
      background: #736CED;
      right: 50%;
    }

    .text-container{
      transform: scale(10);
      opacity: 0;
      position: absolute;
      top: 55%;
      left: 15%;
      color: whitesmoke;
      font-size: 26px;
    }

    .second .text-container{
      left: 55%;
    }
  `,
 fonts: [
  {
   type: "google-font",
   src:
           "https://fonts.googleapis.com/css2?family=Ubuntu:wght@500;700&display=swap"
  }
 ],
 containerParams: {
  width: "600px",
  height: "800px"
 },
 initParams: {
  text: "Hello MotorCortex!",
  secondText: "Have fun!!"
 }
});

// Combo Definition
const myCombo = new Combo(
        {
         incidents: [
          {
           incidentClass: CSSEffect,
           attrs: {
            animatedAttrs: {
             transform: {
              scaleX: 1,
              scaleY: 1
             },
             opacity: 1
            }
           },
           props: {
            selector: ".text-container",
            duration: 1200,
            easing: "easeInBack"
           },
           position: 0
          },
          {
           incidentClass: CSSEffect,
           attrs: {
            animatedAttrs: {
             transform: {
              scaleX: 1,
              scaleY: 1
             }
            }
           },
           props: {
            selector: ".circle",
            duration: 1200,
            delay: "@stagger(0, 600, 0, easeInCirc)",
            easing: "easeOutBounce"
           },
           position: 900
          }
         ]
        },
        {
         selector: ".super-container",
         delay: "@stagger(0, 800)"
        }
);

// Add Combo to Clip
myClip.addIncident(myCombo, 0);

// Play the Clip
myClip.play();
```

## Types of plugins and incidents
There are various types of plugins that expose various types of incidents:

- Effects
- Animations
- Combos
- Plugins that implement the CSS Layer
- Plugins implementing media play Incidents
- Plugins that implement new Clip types
- Players

`Animations` are just HTML clips with pre-rendered context (html and css) and action (incidents). 

### new Clip types
The HTMLClip is just one of the many Clip types MotorCortex can support. In some cases HTML alone is not enough, such as canvas, webGL etc. Many plugins implement different types of Clips by the use of third party libraries, such as three.js and more. These plugins expose the Clip Incident, something that means that they make available a new Clip type.

Even in new Clip types, the logic of MotorCortex remains the same. Clips have context and Effects can be applied to its elements by the use of selectors. Many Clip types, one logic.

The most characteristic example of a Clip type is the three.js plugin.

## The file structure
This repository is a starter boilerplate for creating a plugin for motorcortex library. 

### index.js
On the `src` folder there's the index.js file which lists and exposes all available incidents by the plugin. Notice that for each incident there's an `attributesValidationRules` object which is a `fastest-validator` compatible object that defines the schema of acceptable attributes by each exposed incident.

A special key `Clip` exposes custom clips (if any) by the plugin.

#### Modern ESM Export Template
```js
// Modern ESM index.js standard
import { Plugin } from "@donkeyclip/motorcortex";
import MyIncident from "./src/MyIncident";
import MyCustomClip from "./src/MyCustomClip";

export default new Plugin({
  npm_name: "my-plugin-name",
  incidents: [
    {
      exportable: MyIncident,
      name: "MyIncident",
      attributesValidationRules: {
        animatedAttrs: {
          type: "object",
          props: {
            opacity: { type: "number", min: 0, max: 1 }
          }
        }
      }
    }
  ],
  Clip: {
    exportable: MyCustomClip
  }
});
```

### package.json
On package.json always make sure the name of the plugin and its version are always up to date. Also there's the right place to declare any dependencies.

### Incidents folder
Is where all of the exportable incidents should live. The boilerplate repo comes with 4 preset, empty boilerplate incidents to get you started. 

### Effects
Effects are Incidents that tween the attributes' values of selected elements of the context. Before writing your first Effect let’s have a look at some internals that will help you nail it.

As you most probably already know as a MotorCortex user, all Effects take a “selector” on their props which defines the elements of the context that it should be applied to. Also, on all Effects’ attrs there is a special key with the name “animatedAttrs”, which is an object holding all attributes that should be tweened and their final values.

The most characteristic example of Effect is the built-in CSSEffect of MotorCortex. Let's examine the way this Effect works under the hood as it's identical with the way any other (plugin) Effect works.

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
  }
);
```

This Effect will change the value of “width” and “top” of each element of the class “.class-a” until it reaches the final values (600px and 30px respectively). That’s the concept. Let’s see how it’s done.

The moment the Incident enters the Clip it automatically (and internally) gets dissolved into smaller pieces up until it reaches the point where the initial Incident has been analysed to Incidents of a single element and a single attribute (we call them Mono-Incidents). The final number of Mono-Incidents that will be produced is the product: numberOfAnimatedAttrs * numberOfElements. For example, continuing with our example, if we have three elements of the class “.class-a” then we will have 6 in total MonoIncidents created internally on MotorCortex:

1. First element / width
2. First element / top
3. Second element / width
4. Second element / top
5. Third element / width
6. Third element / top

** When extending MotorCortex.Effect you are actually coding the mono-Incident that will be internally produced by MotorCortex. **

MotorCortex.Effect offers the following properties (which you can use on your code), out of the box:

- `element`: the element that the Incident will be applied to
- `attributeKey`: the attribute name that will be animated (this will either be “top” or “width” in our example, depending on which of the six MonoIncidents runs at the time)
- `targetValue`: the value of the animated attribute to be animated (e.g. “600px” or “30px”). Even if the final user uses dynamic values of its attributes (e.g. “@stagger” or “@expression”), the targetValue here will always be a specific, already calculated by MC value
- `selector`: a selector string that only returns this.element
- `initialValue`: the initial value of the animated attribute (you don’t care where this comes from. As a Plugin Developer you only know that MotorCortex has this calculated for you at all times)

Effect has also the following methods:
- `onGetContext`
- `getScratchValue`
- `onProgress` which you should overwrite in order to define your own Effect.

#### onGetContext
On instantiation of an Effect, the Effect doesn’t yet belong to a Clip and thus has no context. Once the Incident enters a Clip it gains context, and that's when it gets dissolved to its MonoIncidents.

onGetContext runs when the MonoIncident you coded gains context. This is a great place to configure or even completely craft your tween. Full access to this.element, this.targetValue, this.initialValue and to all the other properties listed beyond is available here.

#### getScratchValue
As mentioned MotorCortex provides the “initialValue” property on MonoIncidents, which always has the calculated initial value of the attribute. The initial value of an attribute is calculated by MotorCortex by the following, hierarchy ordered ways:

1. From the user’s “initialValues” (if provided)
2. From the final value of the previous MonoIncident on the same element and on the same attribute, and...
3. If this is the very first MonoIncident of the specific element-attribute pair, from the getScratchValue method of the MonoIncident.

Effects are multi-purpose and MotorCortex can’t and doesn't know this value. Only the MonoIncident developer can define that by overriding the “getScratchValue” method and return the “scratch value” for the specific element and for the specific attribute.

For example, for the implementation of the CSSEffect the getScratchValue method returns the value of the css property (attributeKey) from window.getComputedStyle.

#### onProgress
Action time! onProgress gets the milliseconds argument:

- `milliseconds` (the milliseconds passed within the Incident) MonoIncident Developers can, here, affect their MonoIncident’s element in any way they want

If the developer needs to know the fraction (from 0 to 1) they can use the this.getFraction method passing the millisecond.

#### What you don't need to care about
We listed all props and methods you should care about when developing an Effect. Here is a list of things you don’t care about at all, as are handled directly by MotorCortex:

- repeats
- delay
- hiatus
- easing
- duration

### Animations 
Animations are actually Clips (they can be either considered as Clip templates), they can be used either standalone or as Incidents inside other Clips, they take custom attributes and they dynamically render themselves accordingly.

Under the hood Animations are just pre-crafted, “smart” DOM Clips that can be easily developed, extending the “HMTLClip” Class.

When developing your custom HTMLClip (your “Animation”) you need:

- to define:
-- The Clip’s HTML
-- The Clip’s CSS
-- any fonts you need to load (optionally)
-- and any audio (optionally)
- put Incidents inside your Clip
- Done!
Let’s see how you can do these two steps.

#### get html
You can overwrite the html getter to define your html. You can use MotorCortex Template Engine here and of course this.attrs object which holds all attributes passed to your Animation.

#### get css
Does the exact same thing with the html getter only it returns the css of the HTMLClip. Here you can use just EJS, JSS or any other technology you want.

#### get fonts
Overwrite it only if you want to load fonts to your Clip. If so, then just return an object with fonts compatible with the fonts object that a Clip can accept.

#### get audioSources
Overwrite it only if you want to load audio sources to your Clip. If so, then just return an object with audio sources compatible with the audioSources object that a Clip can accept.

#### buildTree
Once you load and define all of your context it’s time to move to the second step, put the action in. You can load any plugin you want to use and inside the “buildTree” method you can put any Incident you want into your Clip.

#### What you don’t need to care about
Here is a list of things you don’t care about at all when developing an Animation:

- duration. Your final user will set their duration when using your Animation and MotorCortex will automatically time-scale it to be that long, without not even the slightest compromise in performance and quality of execution. If the user doen’t provide duration, your Animation will be in its original duration which is automatically calculated based on the Incidents of your Clip / Animation
- repeats
- delay
- hiatus
- easing

### Custom (Browser) Clips
These go to the Clip key of the index.js file while Animations go to the normal incidents listing.

There might be cases that the "native" HTMLClip exposed by MC is not good enough to serve your Plugin's special needs. For example Clips that use webGL or canvas or anything else that can not be represented as just HTML and CSS or Clips that do very specific things and accept tailored made Effects (e.g. a map clip that will accept pan and zoom effects).

In such cases the developer needs to extend the BrowserClip and create new types of Clips that on initialisation they render whatever needs to be rendered and define custom entities kept in their context so they can be later accessed via selectors from (also) custom Effects.

For example, let's suppose that we want to create a Clip that takes on its attributes an object that defines a number of circles and rectangles to be rendered, renders them on a canvas and exposes them via selectors so they can be targeted by Effects which will be able to change their looks and position.

```js
import {BrowserClip} from "@donkeyclip/motorcortex";

class MyCustomClip extends BrowserClip {
    // overwrite afterRender method
    afterRender(){
        // create a canvas
        const ctx = this.context.document.createElement('canvas');

        // draw all rects and circles in it. Here you have full access to the attributes passed to your Clip on initialization via the "this.attrs" property
        ...

        // store each of the rects and circles as custom entities via the "setCustomEntity" method provided. The setCurstomEntity method accepts exactly three arguments: the id of the custom element, the custom element itself, optionally an array of the classes the element belongs to
        this.setCustomEntity('myRect_1', myRectObject, ['class1', 'class2']);

        // put the canvas on the Clip's DOM. this.context.rootElement always refers to the root HTML element of you Clip, which can host whatever an HTML element can host
        this.context.rootElement.appendChild(ctx);
    }
}
```

#### How to think / mind the portability
The type of elements that your Clip supports (rectangles and circles in our example, a map or a video in another example etc) is up to the plugin developer to decide. In general, the way to think is the following:

1. Decide on what your Custom Clip will render and what Effects it will support
2. Decide on the entities that your Clip will expose via selectors so they can be accessed via Effects
3. Develop your Clip so it accepts attributes that:
- Define the number, types and characteristics of the entities to be rendered along with any other information your Clip needs in order to render properly (e.g. map center, colors or any other relative information)
- Can be exported to JSON (no references to Classe instances nor anything else that can not be stored as JSON). Don't forget, here you are developing a custom MotorCortex Clip and in MotorCortex all Clips (even the custom ones) must always be: playable, dynamic, parametric, isolated and portable. By extending BrowserClip MC makes sure all these specs are met except the portability. This should be guaranteed by you by designing your Clip to accept attrs that can be stored (and transferred) in JSON format.
4. Extend the BrowserClip Class to create your own Custom Clip
5. Overwrite the afterRender method of it so you can: a. Render your Clip (e.g. create and append a canvas, a map or anything else on your rootElement b. Store all of your custom entities so they can be accessed via selectors by Effects (which you can develop later)

#### onAfterRender

The method to overwrite is onAfterRender. That's where you should put all of your rendering logic and create your custom
elements.

The name "onAfterRender" refers to the host of your Clip. At this point your host, rootElement (can be accessed by
this.context.rootElement) is a DIV that will host your entire Clip. At this point, this host is already rendered on the
DOM so you can work with it as you would work with any other DIV of a DOM.

#### Setting custom entities

On onAfterRender method you can define and store custom entities in your context so it can later be accessed by Effects'
selectors. The concept is straightforward:

- Each entity must have a unique id
- Each entity can belong to a number of different classes

_You can store as entities literally anything you want. A map object, an svg element, a rectangle on a canvas, a 3d light, anything._

As each custom entity has an id and can belong to a number of classes, Effects can access them via selectors that extremely
similar with plain CSS selectors (# and .). Only this time you need to add the "!" character in front of the selector to
indicate that you target a custom entity.

**Examples**

- !#idX: targets the custom entity with id === "idX"
- !.classX: targets all custom entities that belong to the class .classX
  But how exactly do you define your custom entities? Via the "setCustomEntity" method of BrowserClip.

setCustomEntity method takes exactly three arguments:

1. The id of the entity (must be unique among all custom entities)
2. The entity itself
3. Optionally an array of strings defining the classes it belongs to

#### Supporting addCustomEntity

While `setCustomEntity` registers entities created during `onAfterRender`, users may also want to add entities **dynamically at runtime** via `addCustomEntity` (see [Adding Entities](/editing/adding-entities)).

To support this, your BrowserClip subclass should override two methods: `renderCustomEntity` and `hideEntity`.

##### renderCustomEntity

`renderCustomEntity(definition, parentId)` is called when the user invokes `addCustomEntity`. It receives the user-provided `definition` object and must:

1. Create the actual element (DOM node, SVG element, canvas object, map feature, etc.)
2. Append it to the Clip's context (e.g. the rootElement, an SVG canvas, a map layer)
3. Return the entity object

If the definition is invalid, return `null`.

:::tip html_element convention
If your entity has a DOM node that should be animatable by CSSEffect, set an `html_element` property on the returned object pointing to that node. CSSEffect will automatically resolve it.
:::

###### Default implementation (BrowserClip)

BrowserClip provides a default `renderCustomEntity` that parses an HTML string and appends it to the root element. This is what HTMLClip uses:

```javascript
// Definition: { html: "<div>...</div>" }
// BrowserClip parses the HTML, appends to rootElement, returns the DOM node
```

###### SVG plugin example

An SVG plugin creates SVG elements and wraps them in groups for positioning and animation:

```javascript
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

###### Map plugin example

A map plugin creates OpenLayers features from geographic definitions. OpenLayers
10 uses ESM entrypoints with `.js` suffixes, so import the classes explicitly in
the plugin package rather than relying on the older OpenLayers 6 import style:

```javascript
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

The in-repo `@donkeyclip/motorcortex-ol` package follows this OpenLayers 10
shape. Experience map policy remains in the Go `mapkit` toolkit; the package
only renders the serialized map definitions and incidents in the browser.

###### Polygon entities with holes

The map payload supports the Go territory shape with a `polygons` array. Each
part has an `outer` ring and may have a `holes` array of rings:

```json
{
  "type": "polygon",
  "polygons": [
    {
      "outer": [[20, 40], [22, 40], [22, 38], [20, 38], [20, 40]],
      "holes": [[[20.5, 39.5], [21.5, 39.5], [21.5, 38.5], [20.5, 38.5], [20.5, 39.5]]]
    },
    { "outer": [[24, 40], [25, 40], [25, 39], [24, 39], [24, 40]] }
  ]
}
```

`polygons` is authoritative when present, even if the entity also contains
legacy `coords`. A malformed `polygons` value rejects the entity rather than
falling back to `coords`. When `polygons` is absent, a valid legacy `coords`
ring still renders. One part becomes an OpenLayers `Polygon`, including its
holes. Multiple parts become one `MultiPolygon`. The rings use raw
`[longitude, latitude]` pairs and are projected by the renderer.

Provider responses can be unavailable or malformed. Do not treat a provider
shape as valid merely because it has a polygon type. Validate it before
emitting the payload and handle rejected geometry explicitly.

###### Attribution overlays

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
on a small board. See `packages/motorcortex-ol/README.md` for the full contract this package
follows, including how a source id is deduplicated across the base map, initial config, and later
incidents.

##### hideEntity

`hideEntity(element)` is called when `addCustomEntity` is invoked with `hidden: true` (the default). It should make the element invisible in whatever way is appropriate for your rendering context:

```javascript
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

The user then reveals the entity at the desired time using CSSEffect or a plugin-specific Effect incident on the timeline.

#### Custom Effects

Once you design your plugin, decide on its functionality, render and store its custom entities it's time to create your
custom Effects that will affect your custom entities.
Developing a custom Effect tailor made for your own custom entities is as simple as developing any other Effect. Just
extend the MotorCortex.Effect class and do exactly what you you do with a simple Effect. The only difference with the
simple Effect is that this.element now refers to the custom entity and not to an HTML Element. The rest of the Effect
operates in the exact same way it does on the simple case.

All of your Effects can be directly added to your custom Clip in the obvious way (clip.addIncident(effect, millisecond)),
can be used with combos, and in general do not differ at all from common Effects except that they accept "!" selectors
(for custom entities).



## Intro

MotorCortex provides Audio capabilities out of the box. The way Audio has been implemented in MotorCortex is based on
the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API).
All Clips and AudioClips that belong to the same Incidents’ tree, all have Audio capabilities, have their own Audio Nodes
Set and all Audio Node Sets are interconnected, to form an audio routing graph targeting the speakers of the user.

Each of these Audio Node Sets consists of a chain of AudioNodes:

- A gain Node
- A pan Node
- The master Node

<img alt="AudioNodeSet" src={useBaseUrl("/img/AudioNodeSet.png")} />

The output of the one Set is connected to the input of the other to form a tree of Audio Nodes with 1:1 correspondence
to the tree formed by their Incidents.

<img alt="AudioNodeSet" src={useBaseUrl("/img/Audio.png")} />

The master gain of this audio routing graph is controlled by the root Clip and you can control it via the setVolume(level)
method it provides.

### Browser audio lifecycle

Mobile browsers can suspend an `AudioContext`, and iOS Safari can report the non-standard `interrupted` state after an audio interruption. Audio playback only reports success while the shared context is `running`. Use the MotorCortex Player `play()` boundary for user-started playback so the context can be resumed inside the gesture before the Clip starts.

Do not create a second context for recovery. The shared context and its lifecycle are managed by MotorCortex. A rejected resume is surfaced to browser diagnostics and can be handled by the application without exposing provider or source details to users.

MotorCortex Player exposes `setAudioContextResumeErrorHandler(handler)` for applications that need to observe a rejected resume:

```javascript
player.setAudioContextResumeErrorHandler((error) => {
  // Keep the raw error in browser diagnostics. Do not send it as analytics data.
  console.error("Audio could not be resumed", error);
});
```

`player.play()` starts the resume request and calls the Clip's `play()` method in the same user-gesture task. It does not await the resume before starting the visual timeline. If the resume rejects, the handler receives the raw error while Web Audio playback returns `false` until the context is running again.

Keep in mind that for each audioSource loaded on any of the Nodes of the diagram an Audio Node Set will also be created
and it will only handle the pan, gain and master volume of the audioSource alone.

#### AudioClip

As you should already know HTMLClip has audio capabilities as it has an Audio Node Set of its own. Same stands even for
the BrowserClip, so all custom Clips also support audio. AudioClip is a type of Clip that has no visual context at all
but it only has audio capabilities, owning an Audio Node Set.

If you want to create a plugin that:

- Exposes easy-to-use audio Incidents
- Exposes ready to use sounds
- Extends the audio capabilities (e.g. by adding more audio effects), working on the Audio Node Set
- Provides an easier interface on top of the native audio Incidents of MotorCortex
- Provides complex sound compilations based on user preferences
  then extending AudioClip is a great way to start it.

##### buildTree

The only method that you need to overwrite when extending AudioClip is the buildTree method, exactly as when you’re
extending an HTMLClip to develop an Animation, only this time on buildTree you will place strictly Audio Incidents on
your clip’s timeline as these are the only compatible with it.

##### audioSources getter

As on HTMLClip same with AudioClips, you can overwrite the get audioSources to define (and load in your context) the
full list of audio sources you want to use.

##### this.audioNodeSet

this.audioNodeSet available anywhere in the AudioClip Class, represents exactly the Audio Node Set of the Clip.

this.audioNodeSet is a Class providing the following properties and methods:

- input: represents the input Node of the Set. You can you it to connect other Audio Nodes to it
- output: represents the output of the Audio Set which be default gets connected to the parent Audio Node Set of the Clip
- pannerNode: the Audio Node handling the pan
- gainNode: the Audio Node handling the gain Effects applied
- connect(AudioNode): a method that will connect the full Audio Node Set’s output to the specified AudioNode
- disconnect(): disconnects the output of the Audio Node Set from the AudioNode it’s connected with

#### Effects

First some facts. By extending AudioClip the class that will be produced will still support the
Audio Effects (pan, gain), targeting audioSources of it.
Developing new Audio Effects follows the exact same logic with the simple - non Audio Effects. A selector will select
the audioSources, the animatedAttrs will define which of the attributes to affect and under the hood MotorCortex will
create one MonoIncident per element and attribute. Keep in mind that when working with Audio, extending Effect will have
on the this.element property the audioSource itself, which has the following properties:

- soundLoaded: boolean, indicates if the sound has been loaded or not
- buffer: the AudioBuffer of the sound
- audioNodeSet: the Audio Node Set of the specific sound
- startValues: an object holding the start values for gain and pan (if provided by the user)

#### Custom Audio Plugins

The built-in audio system described above works with audio files (mp3, wav, etc.) played through the Web Audio API. But there are cases where a plugin needs its own audio engine, for example, real-time synthesis, MIDI playback, or integration with third-party audio libraries.

For these cases, MotorCortex provides the `audio: "custom"` plugin type. Instead of using the internal AudioClip, MC instantiates the plugin's own Clip class as the audio clip. The plugin takes full ownership of audio creation, routing, and playback.

##### How it works

A custom audio plugin:

1. Exports a Clip that extends `ExtendableClip` (not BrowserClip or AudioClip)
2. Creates its own `ExtendableContextHandler` subclass for managing audio sources and selector resolution
3. Sets `audio: "custom"` in the plugin manifest
4. Uses MC's shared `audioContext` for Web Audio node creation so all nodes live on the same audio graph

```javascript
import { ExtendableClip, ExtendableContextHandler, audioContext } from "@donkeyclip/motorcortex";

class MyAudioClip extends ExtendableClip {
  constructor(attrs, props) {
    super(attrs, props);
    const handler = new MyContextHandler(props.audioSources);
    handler.context.initParams = props.initParams;
    this.ownContext = handler.context;
  }
}

class MyContextHandler extends ExtendableContextHandler {
  constructor(sources) {
    super();
    // Create and register audio sources
    // Resolve selectors (~#id, ~.class)
    this.setContext({ contextLoaded: true, audio: true /* ... */ });
  }
}
```

The plugin manifest uses `audio: "custom"`:

```javascript
export default {
  npm_name: "@my-org/my-audio-plugin",
  version: "1.0.0",
  incidents: [
    { exportable: MyPlayback, name: "Playback" },
    { exportable: MyEffect, name: "MyEffect" },
  ],
  Clip: { exportable: MyAudioClip },
  audio: "custom",
};
```

##### audioContext

MC creates a single, shared `AudioContext` used by the internal audio system. Custom audio plugins **must** use this same context, creating a separate AudioContext will cause `InvalidAccessError` when nodes from different contexts try to connect.

Import it directly:

```javascript
import { audioContext } from "@donkeyclip/motorcortex";

// Use it for creating Web Audio nodes
const gainNode = audioContext.createGain();

// Or pass it to third-party libraries that accept an AudioContext
Tone.setContext(audioContext);
```

#### Limitations

As the full Audio capability is handled directly by the Web Audio API and the audio routing graph explained above any
audio source that can not be directly connected to it should not exist within the context of a Clip.

For example if a Video plugin attaches a video on the Clip the audio output of this video must get attached to the audio
routing graph otherwise the gain of it will not be controlled by the master volume control of the Clip.

#### MediaPlayback
MediaPlayback allows us to control the execution of a media, such as a video. Under the hood MediaPlayback just
synchronises start, pause and stop commands of a Clip with the corresponding commands of a media we want to control.

In order to create a custom MediaPlayback you need to extend the MediaPlayback Class of MotorCortex and you can overwrite
the following methods:

- play(milliseconds)
- stop()
- onProgress(fraction, milliseconds)

It might seem a bit oxymoron to provide both play/stop and onProgress method. The onProgress method runs only when the
user seeks the Clip and not on normal execution.

When a Clip moves backward, MotorCortex reconciles playback with the media active at the destination and starts it at the
corresponding offset. This reconciliation affects only the moved ClipCopy context. Media in other ClipCopy contexts is not
stopped.

For Web Audio playback, `play(milliseconds)` returns `false` when the source is still loading or when the shared `AudioContext` is not `running`. The media channel uses that result to retry the start instead of recording a source as playing while it is silent. It retries pending starts every 50 milliseconds for up to 5 seconds. User-facing MotorCortex Player controls route starts through the player's `play()` method, which starts the context resume and Clip play in the same gesture task without awaiting the resume.


#### Combos
Combos as Plugin Incidents is a convenient way to define complex / composite Effects, by positioning simple Effects
(of any plugin) on specific points in the Compo’s timeline. In order to do so you only need to extend MotorCortex.Combo
and overwrite the incidents getter.

```javascript
class MyPluginCombo extends MotorCortex.Combo {
  get incidents() {
    return [
      {
        incidentClass: CSSEffect,
        attrs: {
          animatedAttrs: {
            alpha: "@expression(index*2)",
          },
        },
        props: {
          duration: this.attrs.duration,
          delay: "@expression(index*30)",
        },
        position: "@expression(index*100)",
      },
      {
        incidentClass: Anime.Anime,
        attrs: {
          animatedAttrs: {
            alpha: 3,
          },
        },
        props: {
          selector: ".stagger",
          duration: 1000,
          delay: "@expression(index*100)",
        },
        position: "@expression(index*500 + 1000)",
      },
    ];
  }
}
```

### Blockings
#### In MonoIncidents

There are cases where Incidents are not yet ready to play or they are still loading. An example might be an Incident that plays a video or an audio file or a custom Clip that needs some time to render before being able to play.

MotorCortex provides to its developers a convenient way to block and unblock the Clip’s execution via the Incident’s code.

At any point on your Incident you can call the `**this.setBlock()**` method which takes just one optional parameter, a string with the description of the block. For example if we were developing an Incident that needs a resource (video, sound, image, whatever else) in order to get executed we would have:

```javascript

class MyIncident extends MonoIncident{

	onProgress(fraction, milliseconds){
		if(video_is_not_ready_to_play){
			this.setBlock("Video loading");
			return ;
		} else {
			... Normal execution
		}
	}

}

```

This way, during Clip’s execution if the Incident enters the onProgress method before being ready to get executed it will block the full Clip execution and the Clip will remain halted on the blocking state until it the same Incident **unblocks** it.

Unblocking the Clip is as simple as blocking it. On our example our Incident can unblock the Clip whenever it’s ready for execution:

```javascript

class MyIncident extends MonoIncident{

	onProgress(fraction, milliseconds){

		if(video_is_not_ready_to_play){
			this.setBlock("Video loading");

			whenMyResourceIsLoaded(()=>{
				this.unblock();
			});

			return;
		} else {
			... Normal execution
		}
	}

}

```

As you can see in the example, the only thing we need is to, once our Incident is ready for execution, call the `**this.unblock()**` method which will unblock the Clip from the blocking waiting we’ve set before.

#### In Clips

In the case of Clips blocking or unblocking can only be related with the readiness of the Clip’s context. A Clip has no execution logic itself, it just sets the context and accepts other Incidents on its timeline so blocking or unblocking the Clip from a Clip can only relate with the Clip being ready or not ready in terms of its context and rendering.

ExtendableClip and DOMClip are equipped with two special blocking / unblocking methods:

- **this.contextLoading()**
- **this.contextLoaded()**

By calling the **this.contextLoading() **method the Clip declares that is in the process of loading its context so if the Clip needs to be executed before this process ends the root Clip will block.

When the Clip is ready (the context has loaded and all rendering and other preparations have been completed, so it’s ready for execution) the Clip can call the **this.contextLoaded() **method which will unblock the root Clip.

### index.js
Once you’ve developed all of your Incidents it is time to create your main.js file, the file that your package.json points to via it’s “main” field. The main.js file of your plugin defines all of the necessary information MotorCortex needs in order to properly load it and make your amazing Incidents available to the developers. Without it your plugin just can’t be loaded to MotorCortex.
The main.js file of each plugin just exports a javascript object with the following properties:

- npm_name: mandatory, specifies the unique name of your plugin and should be identical to your package.json “name” field
- incidents: an array of all of the Incidents exposed by your plugin
- compositeAttributes: (optional) if your Incidents support composite attributes this is the place to define them (more on this later)
- Clip: That’s where you can place your Cusom Browser Clip

```javascript
import MyIncident from "./src/MyIncident";

module.exports = {
  npm_name: "my-plugin-name",
  incidents: [
    {
      exportable: MyIncident,
      name: "MyIncident",
      attributesValidationRules: {
        animatedAttrs: {
          type: "object",
          props: {
            // validation rules as per [fastest-validator](https://www.npmjs.com/package/fastest-validator) library
          },
        },
      },
    },
  ],
};
```

#### incidents

incidents keyword holds an array of objects each of which defines the exposed Incident. The structure of this object is simple:

- exportable: a direct reference to the Class of the Incident
- name: the name of your Incident in the outer world. For example if you name it “MyIncident”, then your Incident will be available on YouPlugin.MyIncident
- attributesValidationRules: this object defines the attributes that your Incident expects / supports. Under the hood validation is performed by the [fastest-validator](https://github.com/icebob/fastest-validator) library, so the object here follows all the rules of the specific library. There are more details on the attributesValidationsRules paragraph that follows.
  Even though the attributesValidationRules is optional it is bad practice not to define it.

#### Clip

In contrast with normal Incidents, each plugin can only define just one Cusom (Browser) Clip. When defining a Custom Clip then you should not put it on the incidents array but you should place it on the “Clip” keyword of your main.js file.
The schema though is identical to the schema of Incidents within the incidents array only this time you don’t need to define the name of it. The name will always be .Clip.

```javascript
Clip: {
	exportable: MyCustomClipClass,
	attributesValidationRules: {...}
}
```

#### audio

The `audio` key defines your plugin's audio capabilities. It accepts one of the following values:

| Value      | Description                                                                                                                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"off"`    | (default) No audio capabilities                                                                                                                                                                                   |
| `"on"`     | The plugin's Clip participates in MC's built-in audio system. audioSources can be loaded and audio Incidents can target them                                                                                      |
| `"only"`   | Audio-only Clip with no visual context. Uses MC's internal AudioClip. No DOM rendering                                                                                                                            |
| `"custom"` | The plugin provides its own audio Clip (extending ExtendableClip). MC uses the plugin's Clip class instead of the internal AudioClip. See [Custom Audio Plugins](/plugins-development/audio#custom-audio-plugins) |

```javascript
export default {
  npm_name: "my-audio-plugin",
  incidents: [
    /* ... */
  ],
  Clip: { exportable: MyCustomAudioClip },
  audio: "custom",
};
```

#### compositeAttributes

There are cases that an Effect of yours might handle / animate an attribute that is composite. By composite we mean that this attribute is defined by a set of attributes. For example the position of an element on a 2D space should be defined as a composite attribute consisting of x and y, transform on css should be the combination of translateX, translateY, etc.

By defining your composite attributes you help MotorCortex handle these cases properly in terms of conflicts checks. For example, if Incident A alters the value of position.x and Incident B alters the value of position.y of the same element, as soon as they alter the attributes of the same composite attribute can not overlap with eachother.

Defining your compositeAttributes is very easy. The only thing you need to do is to define an object, the keys of which specify the name of your composite attributes and the value of which define an array containing (as strings) the names of the attributes that form it. E.g.

```javascript
compositeAttributes: {
	position: [“x”, “y”]
}
```

or

```javascript
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

### attributesValidationRules
attributesValidationRules is a key that can be added on any incident listed on the “incidents” key of the main.js file of any plugin
as well as on the "Clip" key, if the plugin exposes a Custom Clip.attributesValidationRules

Even though attributesValidationRules is optional it's strongly recommended as by defining it:

- MotorCortex validates attributes on run time, preventing invalid data, something that can crash your Incidents making them look bad and buggy
- DonkeyClip app reads the attributesValidationRules and automatically creates the form for adding or editing Incidents of your plugins

Example of a main.js file:

```javascript
import MyIncident from "./src/MyIncident";

module.exports = {
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

attributesValidationRules is an object that its keys define the expected keys of the “attrs” that the Incident supports. For example an Incident that supports the “opacity” and “width” animatedAttrs and also the “type” attribute would expect something like this as its attrs on instantiation:

```javascript
const MyIncident = new Plugin.MySpecialIncident(
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
  }
);
```

A basic validation ruleset for this Incident can be defined in the following way:

```javascript
import MySpecialIncident from "./src/MySpecialIncident";

module.exports = {
  npm_name: "my-plugin-name",
  incidents: [
    {
      exportable: MySpecialIncident,
      name: "MySpecialIncident",
      attributesValidationRules: {
   type: {
    type: "enum",
  values: ["typeA", "typeB"]
   }
  animatedAttrs: {
   type: “object”,
   strict: true,
   props: {
    opacity: {
     type: "number",
     min: 0,
     max: 1
    },
    width: {
     type: "measurement",
     min: 0,
     units: `["cm", "mm", "in", "px", "pt", "pc", "em", "ex", "ch", "rem", "vw", "vh", "vmin", "vmax", "%"]`
    }

   }

    }
      }
    }
  ]
};
```

Notice the “units” key on the “width” attribute. “units” key enums the list of supported units of the attribute, separately from the rest of its definition. The way we’ve defined it here, width can be any number greater than 0 followed by any of the supported units (“800px”, “50%”, etc).

### List of supported validation rules

#### number

type: “number”

_Used for plain numbers (either integers or floats)_

**Supported properties:**

- min (defines the minimum accepted value)
- max (defines the maximum accepted value)
- integer: (boolean, default true, defines if the value must be an integer or not)

#### measurement

type: “measurement”

Used to define quantities measured in units (e.g. px, rad, %)

**Supported properties:**

- min (defines the minimum accepted value)
- max (defines the maximum accepted value)
- integer: (boolean, default true, defines if the value must be an integer or not)
- units (a list of supported units. Defaults to unitless, so no units are expected)

#### string

type: “string”

**Supported properties:**

- textarea: (boolean, default false, defines whether the UI should render it as text area)
- empty: (if true an empty string is accepted “ “. Defaults to true)
- min: (minimum string length)
- max (maximum string length)
- length: (fixed string length is only accepted)
- pattern: (regex pattern)

#### color

type: “color”

**No supported properties**

#### enum

type: “enum”

**Supported properties:**

- values: (an array containing all the accepted values)

#### boolean

type: “boolean”

**No supported properties**

#### object

type: “object”

**Supported properties:**

- props: (an object, the keys’ names of which define its supported properties and the value of each key defines the validation rule of it)
- strict: (boolean, defaults to true. If true only properties of its “props” key will be accepted. Otherwise any other property name will be accepted and treated as a small string)

#### array

type: “array”

**Supported properties:**

- empty: if true the validator accepts an empty array []
- min: Minimum count of elements
- max: Maximum count of elements
- length: Fix count of elements
- contains: The array must contain this element too
- unique: The array must be unique (array of objects is always unique)
- enum: Every element must be an element of the enum array
- items: Schema for array items

## Commands
- `npm run build`: builds the dist of your pluign along with the demo
- `npm run build:demo`: builds just the demo
- `npm start`: builds everything and starts the demo
- `npm start:demo`: just starts the demo

