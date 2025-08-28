import { Effect } from "@donkeyclip/motorcortex";

/**
 * The purpose of Effects is to timely alter the state or value of attributes of
 * selected elements of the context, specified on the "selector"
 * property of theirs.
 *
 * The attributes of the elements that the Effect manipulates are
 * always defined on the attrs.animatedAttrs object, passed to it on its constructor.
 * Each key of this object corresponds to an attribute that the Effect will alter and the value
 * of each specifies the final value to go to.
 * On runtime, each Effect is analysed first by element and secondly
 * by animatedAttr.
 * For example an Effect that has the selector ".my-class",
 * that applies in two elements of the context, and has two animatedAttrs
 * will be analysed into four in total "MonoIncidents" (2 elements * 2 animatedAttrs).
 * Each of these produced MonoIncidents refer to a very specific element and
 * to a very specific animated attribute.
 * The Class that you are defining here extends Effect which represents exactly this MonoIncident.
 *
 * Thus, here you'll find:
 * the following properties:
 * - this.element: provides a reference to the specific element of the MonoIncident
 * - this.attributeKey: the key of the animatedAttr of the MonoIncident
 * - this.targetValue: the final value of the animatedAttr
 * - this.initialValue: the initial value of the animatedAttr
 * and the following methods:
 * - onGetContext
 * - getScratchValue
 * - onProgress
 * which are analysed more inline
 *
 **/
export default class MyEffect extends Effect {
  /**
   * the very first MonoIncident of the specific element and the
   * specific attribute that will ever enter a Clip will be asked
   * to provide the initial (the scratch) value of its animatedAttr
   * for its element.
   **/
  getScratchValue() {
    return 0;
  }

  /**
   * The moment the Effect gets applied as MonoIncident to the specific
   * element and for the specific animatedAttr.
   * You can use this method to initialise anything you need to initialise
   * in order to use it on the onProgress method
   **/
  onGetContext() {}

  /**
   * Takes one argument the millisecond which defines the absolute millisecond.
   * You can use this method to animate your attribute.
   * Remember that you don't need to worry about easings. Easings are already
   * applied before reaching the execution of this method. This method's
   * arguments have already been re-calculated based on the easing.
   **/
  // eslint-disable-next-line no-unused-vars
  onProgress(millisecond) {}
}
