# Combos as plugin Incidents

Read this when you want to expose a composite Incident — one built out of other (simple) Incidents,
of any plugin, positioned on specific points of the Combo’s own timeline.

Combos as Plugin Incidents is a convenient way to define complex / composite Effects, by positioning
simple Effects (of any plugin) on specific points in the Combo’s timeline. In order to do so you only
need to extend `MotorCortex.Combo` and overwrite the `incidents` getter.

```js
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

For how Combos look from a user's perspective, see the Combos section of
[motorcortex-concepts.md](motorcortex-concepts.md).
