import { css, html, LitElement } from 'lit';
import { fclasses } from '../utils';
import { box as ccBox } from '@warp-ds/css/component-classes';

class WarpBox extends LitElement {
  static properties = {
    bleed: { type: Boolean },
    bordered: { type: Boolean },
    info: { type: Boolean },
    neutral: { type: Boolean },
  };

  // Slotted elements remain in lightDOM which allows for control of their style outside of shadowDOM.
  // ::slotted([Simple Selector]) confirms to Specificity rules, but (being simple) does not add weight to lightDOM skin selectors,
  // so never gets higher Specificity. Thus in order to overwrite style linked within shadowDOM, we need to use !important.
  // https://stackoverflow.com/a/61631668
  static styles = 
    css`
      @unocss-placeholder
      :host {
          display: block;
        }
        ::slotted(:last-child) {
          margin-bottom: 0 !important;
        }
      `;

  get _class() {
    return fclasses({
      [ccBox.box]: true,
      [ccBox.bleed]: this.bleed,
      [ccBox.info]: this.info,
      [ccBox.neutral]: this.neutral,
      [ccBox.bordered]: this.bordered,
    });
  }

  render() {
    return html`
      <div class="${this._class}">
        <slot></slot>
      </div>
    `;
  }
}

if (!customElements.get('w-box')) {
  customElements.define('w-box', WarpBox);
}

export { WarpBox };
