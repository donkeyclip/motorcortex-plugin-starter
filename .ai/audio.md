# Audio

Read this for anything audio-related: the audio routing graph, `AudioClip`, audio Effects, and
`MediaPlayback`. The manifest's `audio` key is documented in
[plugin-manifest.md](plugin-manifest.md).

## Intro

MotorCortex provides Audio capabilities out of the box. The way Audio has been implemented in
MotorCortex is based on the
[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API). All Clips and
AudioClips that belong to the same Incidents’ tree, all have Audio capabilities, have their own Audio
Nodes Set and all Audio Node Sets are interconnected, to form an audio routing graph targeting the
speakers of the user.

Each of these Audio Node Sets consists of a chain of AudioNodes:

- A gain Node
- A pan Node
- The master Node

The output of the one Set is connected to the input of the other to form a tree of Audio Nodes with
1:1 correspondence to the tree formed by their Incidents.

The master gain of this audio routing graph is controlled by the root Clip and you can control it via
the `setVolume(level)` method it provides.

Keep in mind that for each audioSource loaded on any of the Nodes of the graph an Audio Node Set will
also be created and it will only handle the pan, gain and master volume of the audioSource alone.

## Browser audio lifecycle

Mobile browsers can suspend an `AudioContext`, and iOS Safari can report the non-standard
`interrupted` state after an audio interruption. Audio playback only reports success while the shared
context is `running`. Use the MotorCortex Player `play()` boundary for user-started playback so the
context can be resumed inside the gesture before the Clip starts.

Do not create a second context for recovery. The shared context and its lifecycle are managed by
MotorCortex. A rejected resume is surfaced to browser diagnostics and can be handled by the
application without exposing provider or source details to users.

MotorCortex Player exposes `setAudioContextResumeErrorHandler(handler)` for applications that need to
observe a rejected resume:

```js
player.setAudioContextResumeErrorHandler((error) => {
  // Keep the raw error in browser diagnostics. Do not send it as analytics data.
  console.error("Audio could not be resumed", error);
});
```

`player.play()` starts the resume request and calls the Clip's `play()` method in the same
user-gesture task. It does not await the resume before starting the visual timeline. If the resume
rejects, the handler receives the raw error while Web Audio playback returns `false` until the
context is running again.

## AudioClip

As you should already know HTMLClip has audio capabilities as it has an Audio Node Set of its own.
Same stands even for the BrowserClip, so all custom Clips also support audio. AudioClip is a type of
Clip that has no visual context at all but it only has audio capabilities, owning an Audio Node Set.

If you want to create a plugin that:

- Exposes easy-to-use audio Incidents
- Exposes ready to use sounds
- Extends the audio capabilities (e.g. by adding more audio effects), working on the Audio Node Set
- Provides an easier interface on top of the native audio Incidents of MotorCortex
- Provides complex sound compilations based on user preferences

then extending AudioClip is a great way to start it.

### buildTree

The only method that you need to overwrite when extending AudioClip is the `buildTree` method,
exactly as when you’re extending an HTMLClip to develop an Animation, only this time on `buildTree`
you will place strictly Audio Incidents on your clip’s timeline as these are the only compatible with
it.

### audioSources getter

As on HTMLClip same with AudioClips, you can overwrite the `get audioSources` to define (and load in
your context) the full list of audio sources you want to use.

### this.audioNodeSet

`this.audioNodeSet` available anywhere in the AudioClip Class, represents exactly the Audio Node Set
of the Clip.

`this.audioNodeSet` is a Class providing the following properties and methods:

- `input`: represents the input Node of the Set. You can use it to connect other Audio Nodes to it
- `output`: represents the output of the Audio Set which by default gets connected to the parent
  Audio Node Set of the Clip
- `pannerNode`: the Audio Node handling the pan
- `gainNode`: the Audio Node handling the gain Effects applied
- `connect(AudioNode)`: a method that will connect the full Audio Node Set’s output to the specified
  AudioNode
- `disconnect()`: disconnects the output of the Audio Node Set from the AudioNode it’s connected with

## Audio Effects

First some facts. By extending AudioClip the class that will be produced will still support the Audio
Effects (pan, gain), targeting audioSources of it.

Developing new Audio Effects follows the exact same logic with the simple - non Audio Effects. A
selector will select the audioSources, the `animatedAttrs` will define which of the attributes to
affect and under the hood MotorCortex will create one MonoIncident per element and attribute. Keep in
mind that when working with Audio, extending Effect will have on the `this.element` property the
audioSource itself, which has the following properties:

- `soundLoaded`: boolean, indicates if the sound has been loaded or not
- `buffer`: the AudioBuffer of the sound
- `audioNodeSet`: the Audio Node Set of the specific sound
- `startValues`: an object holding the start values for gain and pan (if provided by the user)

See [effects.md](effects.md) for the Effect lifecycle itself.

## Custom audio engines — not supported

The public plugin API supports **only** `audio: "off" | "on" | "only"` (verified against
`@donkeyclip/motorcortex` 9.26.0: `AUDIO_OPTIONS = 'on' | 'only' | 'off'`, and the plugin loader
has no other branch). There is **no** `audio: "custom"` option, and `ExtendableClip`,
`ExtendableContextHandler` and the shared `audioContext` are internal — none of them is exported by
the package (only `installAudioContextUnlock` and `resumeAudioContext` are public).

So do not attempt to ship a plugin with its own audio engine (real-time synthesis, MIDI,
Tone.js-style libraries) wired into MC's audio graph — the required hooks aren't public. If your
plugin embeds media that carries its own sound (e.g. a video element), see Limitations below.

## Limitations

As the full Audio capability is handled directly by the Web Audio API and the audio routing graph
explained above, any audio source that can not be directly connected to it should not exist within
the context of a Clip.

For example if a Video plugin attaches a video on the Clip the audio output of this video must get
attached to the audio routing graph otherwise the gain of it will not be controlled by the master
volume control of the Clip.

## MediaPlayback

MediaPlayback allows us to control the execution of a media, such as a video. Under the hood
MediaPlayback just synchronises start, pause and stop commands of a Clip with the corresponding
commands of a media we want to control.

In order to create a custom MediaPlayback you need to extend the MediaPlayback Class of MotorCortex
and you can overwrite the following methods:

- `play(milliseconds)`
- `stop()`
- `onProgress(milliseconds)`

It might seem a bit oxymoron to provide both play/stop and onProgress method. The `onProgress` method
runs only when the user seeks the Clip and not on normal execution.

When a Clip moves backward, MotorCortex reconciles playback with the media active at the destination
and starts it at the corresponding offset. This reconciliation affects only the moved ClipCopy
context. Media in other ClipCopy contexts is not stopped.

For Web Audio playback, `play(milliseconds)` returns `false` when the source is still loading or when
the shared `AudioContext` is not `running`. The media channel uses that result to retry the start
instead of recording a source as playing while it is silent. It retries pending starts every 50
milliseconds for up to 5 seconds. User-facing MotorCortex Player controls route starts through the
player's `play()` method, which starts the context resume and Clip play in the same gesture task
without awaiting the resume.
