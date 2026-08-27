# MotorCortex concepts

Read this for the mental model behind the library: what a Clip, a context, an Effect, a Group
and a Combo are, and which kinds of plugins exist. Everything else in `.ai/` assumes this.

## A few words about the MotorCortex library

MotorCortex is a dynamic video technology for the Web.

MotorCortex allows developers to create a Clip by simply defining its context (e.g. HTML / CSS)
and to position Effects, Animations or even other Clips anywhere on its timeline.

Anything that can be added on a Clip’s timeline we call it Incident and thus in MotorCortex
everything is an Incident.

MotorCortex Clips are

- playable, as they can be played, paused and seeked
- dynamic as they are designed to change on run time
- parametric as they accept properties that affect their look and behavior
- isolated as they’re completely sealed from their environment
- portable as they can be saved and transferred as simple JSON files

The framework provides an easy and documented SDK for creating plugins. Writing a plugin for
MotorCortex feels extremely similar to just simply using it.

## Base classes of MotorCortex itself

### Clip

The Clip in MotorCortex is an entity that has the following characteristics:

- It owns a context
- It has a timeline
- It can accept any Group or Incident on its timeline

Under the hood, it is responsible of checking and handling Incidents addition, edit and removal.

#### The context

The key-word to notice on these characteristics is the context. The context is anything that
contains elements that can be accessed via selectors.

The implemented and provided by MotorCortex, HTMLClip is just one of the possible implementations.

#### HTMLClip

HTMLClip defines and owns an isolated context (consisting of HTML and CSS), renders itself on any
DOM element and of course it provides a timeline that can accept Incidents.

Incidents added to an HTMLClip's timeline most usually animate elements of the Clip's context or
they are just other Clips that have their own context, timeline and duration, and so on.

HTMLClip renders itself by the use of shadow DOM. If shadow DOM is not supported by the browser it
falls back to iframe. This way HTMLClip keeps itself isolated from any CSS or js of the parent
document.

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

The best example of an Effect is the CSSEffect Incident provided by MotorCortex. This Effect can
animate the css properties of any element of the Clip context. You can define what you want to
animate, in how many milliseconds, select the elements you want to apply the effect and add this
Incident anywhere on the Clip's timeline.

Let's add some action on our Clip's timeline by adding a CSSEffect:

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

// Effect Definition
const myEffect = new CSSEffect(
  {
    animatedAttrs: {
      transform: {
        scaleX: 1,
        scaleY: 1,
      },
    },
  },
  {
    selector: ".container>div",
    duration: "@stagger(400, 800, 0, easeOutCubic)",
    delay: "@stagger(0, 600)",
    easing: "easeOutBounce",
  },
);

// Add Effect to Clip
myClip.addIncident(myEffect, 0);

// Play the Clip
myClip.play();
```

See [effects.md](effects.md) for how to develop your own Effect.

### Groups

Groups provide a convenient way to group Incidents together and manage them altogether. Just like
the Clip, the Group also provides a timeline where Incidents can be positioned. Unlike Clips,
Groups do not own context, they are just used to group Incidents together.

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

Combo provides a convenient way to define composite Incidents, consisting of many (and of different
types) Incidents, positioned on specific milliseconds within the Combo.

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
      src: "https://fonts.googleapis.com/css2?family=Ubuntu:wght@500;700&display=swap",
    },
  ],
  containerParams: {
    width: "600px",
    height: "800px",
  },
  initParams: {
    text: "Hello MotorCortex!",
    secondText: "Have fun!!",
  },
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
              scaleY: 1,
            },
            opacity: 1,
          },
        },
        props: {
          selector: ".text-container",
          duration: 1200,
          easing: "easeInBack",
        },
        position: 0,
      },
      {
        incidentClass: CSSEffect,
        attrs: {
          animatedAttrs: {
            transform: {
              scaleX: 1,
              scaleY: 1,
            },
          },
        },
        props: {
          selector: ".circle",
          duration: 1200,
          delay: "@stagger(0, 600, 0, easeInCirc)",
          easing: "easeOutBounce",
        },
        position: 900,
      },
    ],
  },
  {
    selector: ".super-container",
    delay: "@stagger(0, 800)",
  },
);

// Add Combo to Clip
myClip.addIncident(myCombo, 0);

// Play the Clip
myClip.play();
```

See [combos.md](combos.md) for exposing a Combo as a plugin Incident.

## Types of plugins and Incidents

There are various types of plugins that expose various types of Incidents:

- Effects
- Animations
- Combos
- Plugins that implement the CSS Layer
- Plugins implementing media play Incidents
- Plugins that implement new Clip types
- Players

`Animations` are just HTML clips with pre-rendered context (html and css) and action (incidents).
See [animations.md](animations.md).

### New Clip types

The HTMLClip is just one of the many Clip types MotorCortex can support. In some cases HTML alone is
not enough, such as canvas, webGL etc. Many plugins implement different types of Clips by the use of
third party libraries, such as three.js and more. These plugins expose the Clip Incident, something
that means that they make available a new Clip type.

Even in new Clip types, the logic of MotorCortex remains the same. Clips have context and Effects
can be applied to its elements by the use of selectors. Many Clip types, one logic.

The most characteristic example of a Clip type is the three.js plugin. See
[browser-clips.md](browser-clips.md).
