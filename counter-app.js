/**
 * Copyright 2026 Jake Butler
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";

/**
 * `counter-app`
 * A simple stateful counter web component demonstrating Lit reactivity.
 *
 * Requirements met:
 * - <counter-app></counter-app> works with sane defaults
 * - <counter-app counter="16" min="10" max="25"></counter-app> works via attributes
 * - Shadow DOM rendering with minimal HTML: number + two buttons
 * - + / - buttons clamp to max/min and disable at edges
 * - DDD CSS variables used for styling + hover/focus states
 * - Number color changes at 18, 21, and when at min/max
 * - Confetti “makeItRain” triggers when counter hits 21 via updated()
 *
 * @demo index.html
 * @element counter-app
 */
export class CounterApp extends DDDSuper(LitElement) {
  static get tag() {
    return "counter-app";
  }

  /**
   * Reactive properties:
   * - counter: current value (state)
   * - min: minimum allowed value
   * - max: maximum allowed value
   */
  static get properties() {
    return {
      ...super.properties,
      counter: { type: Number },
      min: { type: Number },
      max: { type: Number },
    };
  }

  /**
   * Constructor sets sane defaults so <counter-app></counter-app> "just works".
   */
  constructor() {
    super();
    this.min = 0;
    this.max = 25;
    this.counter = 0;
  }

  /**
   * Styles scoped to this component (Shadow DOM).
   * Uses DDD design tokens and sensible spacing (multiples of 4/8/16).
   */
  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: inline-block;
          font-family: var(--ddd-font-navigation, system-ui);
        }

        /* Container */
        .wrapper {
          padding: var(--ddd-spacing-4, 16px);
          border-radius: var(--ddd-radius-md, 8px);
          border: 1px solid var(--ddd-theme-default-limestoneGray, #d0d0d0);
          background: var(--ddd-theme-default-limestoneLight, #ffffff);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
          min-width: 220px;
        }

        /* The big number */
        .value {
          font-size: var(--ddd-font-size-xl, 2rem);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: var(--ddd-spacing-4, 16px);
          text-align: center;
          color: var(--ddd-theme-primary, #1a1a1a);
          transition: color 160ms ease-in-out;
        }

        /* State-based color changes */
        .value.eighteen {
          color: var(--ddd-theme-default-wonderPurple, #6a0dad);
        }
        .value.twentyone {
          color: var(--ddd-theme-default-skyBlue, #1e90ff);
        }
        .value.edge {
          color: var(--ddd-theme-default-alert, #b00020);
        }

        /* Buttons row */
        .controls {
          display: flex;
          gap: var(--ddd-spacing-2, 8px);
          justify-content: center;
        }

        button {
          appearance: none;
          border: 1px solid var(--ddd-theme-default-limestoneGray, #cfcfcf);
          background: var(--ddd-theme-default-limestoneLight, #fff);
          color: var(--ddd-theme-primary, #111);
          border-radius: var(--ddd-radius-sm, 6px);
          padding: var(--ddd-spacing-2, 8px) var(--ddd-spacing-4, 16px);
          font-size: var(--ddd-font-size-m, 1rem);
          font-weight: 700;
          cursor: pointer;
          transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
          min-width: 72px;
        }

        button:hover:not(:disabled) {
          border-color: var(--ddd-theme-default-wonderPurple, #6a0dad);
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        button:focus-visible {
          outline: 3px solid var(--ddd-theme-default-wonderPurple, #6a0dad);
          outline-offset: 2px;
        }

        button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      `,
    ];
  }

  /**
   * Clamp counter into [min, max] anytime min/max change.
   * This helps keep the component state valid if attributes change.
   */
  willUpdate(changedProperties) {
    if (changedProperties.has("min") || changedProperties.has("max")) {
      // Ensure min/max are numbers and make sense
      const min = Number(this.min);
      const max = Number(this.max);

      // If someone sets max < min, swap them (keeps component usable)
      if (Number.isFinite(min) && Number.isFinite(max) && max < min) {
        this.min = max;
        this.max = min;
      }

      // Clamp current counter into new range
      this.counter = this._clamp(this.counter, this.min, this.max);
    }
  }

  /**
   * Lifecycle method used to detect counter changes.
   * When counter hits 21, trigger confetti via makeItRain().
   */
  updated(changedProperties) {
    if (super.updated) super.updated(changedProperties);

    if (changedProperties.has("counter")) {
      const prev = changedProperties.get("counter");
      // Only trigger when we *arrive* at 21 (prevents repeated triggers on re-render)
      if (this.counter === 21 && prev !== 21) {
        this.makeItRain();
      }
    }
  }

  /**
   * Render minimal HTML: big number + two buttons underneath.
   * Wrapped in confetti-container so it can "explode" at 21.
   */
  render() {
    const atMin = this.counter <= this.min;
    const atMax = this.counter >= this.max;

    // Figure out which color class to apply to the number
    const valueClass = [
      "value",
      atMin || atMax ? "edge" : "",
      this.counter === 18 ? "eighteen" : "",
      this.counter === 21 ? "twentyone" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <confetti-container id="confetti">
        <div class="wrapper">
          <div class="${valueClass}">${this.counter}</div>

          <div class="controls">
            <button
              @click="${this._decrement}"
              ?disabled="${atMin}"
              aria-label="Decrement counter"
              title="Decrement"
            >
              -
            </button>

            <button
              @click="${this._increment}"
              ?disabled="${atMax}"
              aria-label="Increment counter"
              title="Increment"
            >
              +
            </button>
          </div>
        </div>
      </confetti-container>
    `;
  }

  /**
   * Increment button handler:
   * increases counter by 1, clamped to max.
   */
  _increment() {
    this.counter = this._clamp(this.counter + 1, this.min, this.max);
  }

  /**
   * Decrement button handler:
   * decreases counter by 1, clamped to min.
   */
  _decrement() {
    this.counter = this._clamp(this.counter - 1, this.min, this.max);
  }

  /**
   * Utility: clamp a number into [min, max].
   */
  _clamp(value, min, max) {
    const v = Number(value);
    const lo = Number(min);
    const hi = Number(max);

    // Safe defaults if something weird comes in
    if (!Number.isFinite(v)) return Number.isFinite(lo) ? lo : 0;
    if (!Number.isFinite(lo) || !Number.isFinite(hi)) return v;

    return Math.min(hi, Math.max(lo, v));
  }

  /**
   * Trigger confetti animation.
   * Uses dynamic import so confetti code loads only when needed.
   */
  makeItRain() {
    import("@haxtheweb/multiple-choice/lib/confetti-container.js").then(() => {
      // minor timing hack so the element is upgraded and ready
      setTimeout(() => {
        const confetti = this.shadowRoot?.querySelector("#confetti");
        if (confetti) confetti.setAttribute("popped", "");
      }, 0);
    });
  }
}

globalThis.customElements.define(CounterApp.tag, CounterApp);