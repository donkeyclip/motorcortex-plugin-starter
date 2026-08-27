# MotorCortex.js plugin starter

You are an expert JavaScript graphics & animation engineer creating a native MotorCortex plugin in
this boilerplate repo.

MotorCortex is a dynamic video technology for the Web. A **Clip** owns a context (e.g. HTML/CSS) and
a timeline; anything you can put on that timeline is an **Incident** (Effects, Animations, Combos,
other Clips). Every Clip must stay playable, dynamic, parametric, isolated and **portable** (JSON
serializable).

## 🚧 This repo is a template — you are building a NEW plugin

Starting from this repo means creating a new, separate plugin project, NOT contributing to the
boilerplate itself:

- **Remote:** if `git remote get-url origin` still points to
  `donkeyclip/motorcortex-plugin-starter`, ask the user for the new plugin's repository URL before
  the first commit/push and set it with `git remote set-url origin <url>`. NEVER push plugin work
  to the starter's remote.
- **Identity:** update `package.json` (`name`, `description`, `repository`) to the new plugin's
  identity — the manifest's `npm_name` follows automatically via its `package.json` import.
- **Boilerplate incidents are examples only:** `src/Incidents/Effect.js`, `Combo.js`,
  `HTMLClip.js` and `Clip.js` are empty reference stubs, and `src/index.js` exports all four only
  to demonstrate the manifest shape. Keep and rename just the ones your plugin actually
  implements, DELETE the rest, and make `src/index.js` export only real incidents/clips. A
  finished plugin must never export empty do-nothing stubs. Update `demo/index.js` to match what
  the plugin really exports.

## 📚 Documentation map — read the relevant file before writing code

Detailed docs live in `.ai/`. Load only what the task needs; `.ai/README.md` is the index.

| Task                                                                                                          | Read                          |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Understand the model (Clip, context, Effect, Group, Combo, plugin types)                                      | `.ai/motorcortex-concepts.md` |
| Write/edit `src/index.js` or `package.json` (`npm_name`, `incidents`, `Clip`, `audio`, `compositeAttributes`) | `.ai/plugin-manifest.md`      |
| Build an Effect (tween attributes of selected elements)                                                       | `.ai/effects.md`              |
| Build an Animation (pre-crafted HTMLClip with its own html/css/incidents)                                     | `.ai/animations.md`           |
| Build a custom Clip type (canvas, SVG, WebGL, maps)                                                           | `.ai/browser-clips.md`        |
| Expose a composite Incident made of other Incidents                                                           | `.ai/combos.md`               |
| Anything audio (audio graph, AudioClip, audio Effects, MediaPlayback)                                         | `.ai/audio.md`                |
| Halt the timeline while a resource or context loads                                                           | `.ai/blockings.md`            |
| Write `attributesValidationRules` (incl. the supported types)                                                 | `.ai/validation-rules.md`     |

## 🤖 Agent step-by-step workflow

When asked to build a new MotorCortex plugin:

1. **Pick and extend the right base class:** `Effect` for attribute animations, `BrowserClip` for
   custom viewports (Canvas/SVG/3D/Maps), `HTMLClip` for pre-built DOM compositions (Animations),
   `Combo` for composite Incidents, `AudioClip` for audio.
2. **Implement the lifecycle methods** of that base class:
   - `Effect`: `onGetContext`, `getScratchValue`, `onProgress`.
   - `BrowserClip`: `onAfterRender`, plus `renderCustomEntity` and `hideEntity` to support
     runtime `addCustomEntity` (motorcortex ≥ 9.24.0).
   - `HTMLClip` (Animation): the `html`, `css`, `fonts`, `audioSources` getters and `buildTree`.
3. **Register custom entities:** use `this.setCustomEntity(id, entity, classes)` inside
   `onAfterRender` so selector engines (e.g. `!#myId`, `!.myClass`) can target them.
4. **Export validation rules:** always provide a `fastest-validator` schema in `src/index.js` under
   `attributesValidationRules`.
5. **Keep `attrs` JSON-portable:** all parameters passed to `attrs` MUST be serializable to JSON.

## ⚠️ Critical rules

### 1. Timeline reversibility & pure functions

`onProgress(millisecond)` receives ONE argument: the (already eased) millisecond within the
Incident. It MUST be a pure, stateless function of that time.

- Compute the 0–1 fraction with `this.getFraction(millisecond)`. Easing is already applied to the
  millisecond passed in — never re-apply it, and never expect a `fraction` argument.
- **NEVER** increment external variables or keep local accumulators inside `onProgress`.
- **WHY:** scrubbing backward calls `onProgress` with smaller millisecond values. Stateful counters
  break timeline seeking.

### 2. JSON portability

A Clip's `attrs` must never hold Class instances or anything else that can't be stored and
transferred as JSON. MotorCortex guarantees every other Clip spec for you; portability is on you.

### 3. The manifest is a plain object (ESM)

`Plugin` is only a TypeScript type — it is **not** a runtime export of `@donkeyclip/motorcortex`,
so `new Plugin({...})` throws. `src/index.js` default-exports a plain object; consumers load it
with `loadPlugin()` (see `demo/index.js`):

```js
import MyIncident from "./Incidents/MyIncident.js";
import MyCustomClip from "./Incidents/MyCustomClip.js";
import { name, version } from "../package.json";

export default {
  npm_name: name, // must equal the package.json "name"
  version,
  incidents: [
    {
      exportable: MyIncident,
      name: "MyIncident",
      attributesValidationRules: {
        animatedAttrs: {
          type: "object",
          props: { opacity: { type: "number", min: 0, max: 1 } },
        },
      },
    },
  ],
  Clip: { exportable: MyCustomClip },
};
```

## Repo layout

- `src/index.js` — the plugin manifest: everything the plugin exposes.
- `src/Incidents/` — one file per exportable Incident. Ships with empty example stubs
  (`Effect.js`, `Combo.js`, `Clip.js`, `HTMLClip.js`) — keep only what you implement, delete the
  rest (see the template section above).
- `demo/` — local demo app for trying the plugin out.
- `package.json` — keep `name` (= `npm_name`) and `version` up to date; declare dependencies here.

## Commands

- `npm run build` — builds the dist of your plugin along with the demo
- `npm run build:demo` — builds just the demo
- `npm start` — builds everything and starts the demo
- `npm run start:demo` — just starts the demo
- `npm run lint` / `npm run lint:fix` — eslint over `src`
