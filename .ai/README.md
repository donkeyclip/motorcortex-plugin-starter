# .ai — MotorCortex plugin development docs

Reference docs for building a native MotorCortex plugin in this repo. `CLAUDE.md` at the
repo root holds the high-level rules and workflow; each file here holds one topic in full.

Read the root `CLAUDE.md` first, then open **only** the files relevant to what you build.

| File                                               | Read it when…                                                                                                                                   |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [motorcortex-concepts.md](motorcortex-concepts.md) | You need the mental model: Clip, context, HTMLClip, Effect, Group, Combo, the types of plugins and Incidents. Start here if unsure.             |
| [plugin-manifest.md](plugin-manifest.md)           | You write or edit `src/index.js` / `package.json`: `npm_name`, `incidents`, `Clip`, `audio`, `compositeAttributes`.                             |
| [effects.md](effects.md)                           | You build an Effect (attribute tweening): MonoIncidents, `onGetContext`, `getScratchValue`, `onProgress`.                                       |
| [animations.md](animations.md)                     | You build an Animation (a pre-crafted HTMLClip): `html`, `css`, `fonts`, `audioSources` getters, `buildTree`.                                   |
| [browser-clips.md](browser-clips.md)               | You build a custom Clip type (canvas, SVG, WebGL, maps): `onAfterRender`, `setCustomEntity`, `renderCustomEntity`, `hideEntity`, `!` selectors. |
| [combos.md](combos.md)                             | You expose a composite Incident made of other Incidents.                                                                                        |
| [audio.md](audio.md)                               | Anything audio: the audio routing graph, `AudioClip`, audio Effects, `MediaPlayback`.                                                           |
| [blockings.md](blockings.md)                       | Your Incident or Clip needs to halt the timeline while a resource or the context loads.                                                         |
| [validation-rules.md](validation-rules.md)         | You write `attributesValidationRules` — includes the full list of supported validation types.                                                   |

Suggested reading order for a fresh plugin: `motorcortex-concepts.md` → the file for your
Incident type → `plugin-manifest.md` → `validation-rules.md`.
