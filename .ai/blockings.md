# Blockings

Read this when your Incident or Clip is not ready to play yet — a video, a sound, an image or a
context that still needs to load or render. Blocking halts the whole Clip until you unblock it.

## In MonoIncidents

There are cases where Incidents are not yet ready to play or they are still loading. An example might
be an Incident that plays a video or an audio file or a custom Clip that needs some time to render
before being able to play.

MotorCortex provides to its developers a convenient way to block and unblock the Clip’s execution via
the Incident’s code.

At any point on your Incident you can call the `this.setBlock()` method which takes just one optional
parameter, a string with the description of the block. For example if we were developing an Incident
that needs a resource (video, sound, image, whatever else) in order to get executed we would have:

```js
class MyIncident extends MonoIncident {
  onProgress(milliseconds) {
    if (video_is_not_ready_to_play) {
      this.setBlock("Video loading");
      return;
    } else {
      // ... Normal execution
    }
  }
}
```

This way, during Clip’s execution if the Incident enters the `onProgress` method before being ready
to get executed it will block the full Clip execution and the Clip will remain halted on the blocking
state until the same Incident **unblocks** it.

Unblocking the Clip is as simple as blocking it. On our example our Incident can unblock the Clip
whenever it’s ready for execution:

```js
class MyIncident extends MonoIncident {
  onProgress(milliseconds) {
    if (video_is_not_ready_to_play) {
      this.setBlock("Video loading");

      whenMyResourceIsLoaded(() => {
        this.unblock();
      });

      return;
    } else {
      // ... Normal execution
    }
  }
}
```

As you can see in the example, the only thing we need is to, once our Incident is ready for
execution, call the `this.unblock()` method which will unblock the Clip from the blocking waiting
we’ve set before.

## In Clips

In the case of Clips blocking or unblocking can only be related with the readiness of the Clip’s
context. A Clip has no execution logic itself, it just sets the context and accepts other Incidents
on its timeline so blocking or unblocking the Clip from a Clip can only relate with the Clip being
ready or not ready in terms of its context and rendering.

`ExtendableClip` and `DOMClip` are equipped with two special blocking / unblocking methods:

- `this.contextLoading()`
- `this.contextLoaded()`

By calling the `this.contextLoading()` method the Clip declares that it is in the process of loading
its context so if the Clip needs to be executed before this process ends the root Clip will block.

When the Clip is ready (the context has loaded and all rendering and other preparations have been
completed, so it’s ready for execution) the Clip can call the `this.contextLoaded()` method which
will unblock the root Clip.
