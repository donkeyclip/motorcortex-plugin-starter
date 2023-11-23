// eslint-disable-next-line no-unused-vars
import { HTMLClip, JSX } from "@donkeyclip/motorcortex";

/**
 * The purpose of extending the HTMLClip is to full, parametric
 * HTMLClips with both context and Incidents.
 *
 * HTMLClip allows you to set your html, css, fonts and audioSources
 * upfront by the corresponding getter methods. You can use the this.attrs
 * reference on these methods so you can generate dynamic content.
 * Overwrite ONLY the ones you are interested in, ignore the rest.
 * The buildTree method allows developers to define Incidents (of any plugin)
 * dynamically and position them on the Clip.
 */
export default class MyHTMLClip extends HTMLClip {
  get html() {
    return <div>Test</div>;
  }

  get css() {
    // just return the CSS you want to apply. It's totally isolated by
    // its environment.
    return `

        `;
  }

  get fonts() {
    // you can load google fonts on your clip by adding objects on the
    // array it returns. Each object must have two keys:
    // type: "google-font" and
    // src: the src of the google font e.g.:
    // https://fonts.googleapis.com/css2?family=Ubuntu:wght@500;700&display=swap
    return [];
  }

  get audioSources() {
    // You can load sounds here to use on your Clip. Check documentation for details
    return [];
  }

  buildTree() {
    // create any kind of either MotorCortex or any other plugin's Incident
    // and place it in your Clip's timeline by the use of this.addIncident
    // method
  }
}
