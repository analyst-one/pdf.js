/* Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class OverlayManager {
  __overlays = new WeakMap();

  __active = null;

  get active() {
    return this.__active;
  }

  /**
   * @param {HTMLDialogElement} dialog - The overlay's DOM element.
   * @param {boolean} [canForceClose] - Indicates if opening the overlay closes
   *                  an active overlay. The default is `false`.
   * @returns {Promise} A promise that is resolved when the overlay has been
   *                    registered.
   */
  async register(dialog, canForceClose = false) {
    if (typeof dialog !== "object") {
      throw new Error("Not enough parameters.");
    } else if (this.__overlays.has(dialog)) {
      throw new Error("The overlay is already registered.");
    }
    this.__overlays.set(dialog, { canForceClose });

    dialog.addEventListener("cancel", evt => {
      this.__active = null;
    });
  }

  // #2337 modified by ngx-extended-pdf-viewer
  unregister(dialog) {
    if (!this.__overlays.has(dialog)) {
      throw new Error("The overlay does not exist.");
    }
    this.__overlays.delete(dialog);
  }
  // #2337 end of modification by ngx-extended-pdf-viewer

  /**
   * @param {HTMLDialogElement} dialog - The overlay's DOM element.
   * @returns {Promise} A promise that is resolved when the overlay has been
   *                    opened.
   */
  async open(dialog) {
    if (!this.__overlays.has(dialog)) {
      throw new Error("The overlay does not exist.");
    } else if (this.__active) {
      if (this.__active === dialog) {
        throw new Error("The overlay is already active.");
      } else if (this.__overlays.get(dialog).canForceClose) {
        await this.close();
      } else {
        throw new Error("Another overlay is currently active.");
      }
    }
    this.__active = dialog;
    dialog.showModal();
    dialog.classList.remove("hidden"); // #1434 remove "hidden" class when opening the dialog for the second time
  }

  /**
   * @param {HTMLDialogElement} dialog - The overlay's DOM element.
   * @returns {Promise} A promise that is resolved when the overlay has been
   *                    closed.
   */
  async close(dialog = this.__active) {
    if (!this.__overlays.has(dialog)) {
      throw new Error("The overlay does not exist.");
    } else if (!this.__active) {
      throw new Error("The overlay is currently not active.");
    } else if (this.__active !== dialog) {
      throw new Error("Another overlay is currently active.");
    }
    dialog.close();
    this.__active = null;
  }
}

export { OverlayManager };
