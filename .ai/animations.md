# Developing Animations (custom HTMLClips)

Read this when your Incident is a pre-crafted, parametric DOM composition — HTML + CSS plus
Incidents already positioned on its own timeline. Extend `HTMLClip`. Animations go in the normal
`incidents` listing of the manifest (not under the `Clip` key).

Animations are actually Clips (they can be either considered as Clip templates), they can be used
either standalone or as Incidents inside other Clips, they take custom attributes and they
dynamically render themselves accordingly.

Under the hood Animations are just pre-crafted, “smart” DOM Clips that can be easily developed,
extending the `HTMLClip` Class.

When developing your custom HTMLClip (your “Animation”) you need:

- to define:
  - The Clip’s HTML
  - The Clip’s CSS
  - any fonts you need to load (optionally)
  - and any audio (optionally)
- put Incidents inside your Clip
- Done!

## get html

You can overwrite the `html` getter to define your html. You can use MotorCortex Template Engine
here and of course `this.attrs` object which holds all attributes passed to your Animation.

In this starter the `html` getter can also return **JSX** (the boilerplate `src/Incidents/HTMLClip.js`
does: `return <div>Test</div>;`). This works because `rollup.config.js` compiles JSX with
`pragma: "JSX"` and `@donkeyclip/motorcortex` exports that `JSX` factory — note the JSX transform
lives only in the rollup config, not in `.babelrc`, so JSX only compiles through `npm run build:lib`.

## get css

Does the exact same thing with the `html` getter only it returns the css of the HTMLClip. Here you
can use just EJS, JSS or any other technology you want.

## get fonts

Overwrite it only if you want to load fonts to your Clip. If so, then just return an object with
fonts compatible with the fonts object that a Clip can accept.

## get audioSources

Overwrite it only if you want to load audio sources to your Clip. If so, then just return an object
with audio sources compatible with the audioSources object that a Clip can accept. See
[audio.md](audio.md).

## buildTree

Once you load and define all of your context it’s time to move to the second step, put the action
in. You can load any plugin you want to use and inside the `buildTree` method you can put any
Incident you want into your Clip.

## What you don’t need to care about

Here is a list of things you don’t care about at all when developing an Animation:

- duration. Your final user will set their duration when using your Animation and MotorCortex will
  automatically time-scale it to be that long, without not even the slightest compromise in
  performance and quality of execution. If the user doesn’t provide duration, your Animation will be
  in its original duration which is automatically calculated based on the Incidents of your Clip /
  Animation
- repeats
- delay
- hiatus
- easing
