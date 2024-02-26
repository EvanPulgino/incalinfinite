/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * GameBasics.ts
 *
 * Class that extends default bga core game class with more functionality
 *
 */

// @ts-ignore
// @ts-nocheck
GameGui = /** @class */ (function () {
  function GameGui() {}
  return GameGui;
})();

class GameBasics extends GameGui {
  isDebug: boolean;
  debug: any;
  curstate: string | undefined;
  pendingUpdate: boolean;
  currentPlayerWasActive: boolean;
  gameState: GameState;
  constructor() {
    super();
    this.isDebug = window.location.host == "studio.boardgamearena.com";
    this.debug = this.isDebug ? console.info.bind(window.console) : () => {};
    this.debug("GameBasics constructor", this);
    this.curstate = null;
    this.pendingUpdate = false;
    this.currentPlayerWasActive = false;
    this.gameState = new GameState(this);
  }

  /**
   * Change the viewport size based on current window size
   * Called when window is resized
   *
   * @returns {void}
   */
  adaptViewportSize(): void {
    var t = dojo.marginBox("incal-screen");
    var r = t.w;
    var s = 2400;
    var height = dojo.marginBox("incal-table").h;
    var viewportWidth = dojo.window.getBox().w;
    var gameAreaWidth =
      viewportWidth < 980 ? viewportWidth : viewportWidth - 245;

    if (r >= s) {
      var i = (r - s) / 2;
      dojo.style("incal-game", "transform", "");
      dojo.style("incal-game", "left", i + "px");
      dojo.style("incal-game", "height", height + "px");
      dojo.style("incal-game", "width", gameAreaWidth + "px");
    } else {
      var o = r / s;
      i = (t.w - r) / 2;
      var width = viewportWidth <= 245 ? gameAreaWidth : gameAreaWidth / o;
      dojo.style("incal-game", "transform", "scale(" + o + ")");
      dojo.style("incal-game", "left", i + "px");
      dojo.style("incal-game", "height", height * o + "px");
      dojo.style("incal-game", "width", width + "px");
    }
  }

  /**
   * UI setup entry point
   *
   * @param {object} gamedata - game data
   * @returns {void}
   */
  setup(gamedata: object): void {
    this.debug("Game data", gamedata);
    this.setCurrentPlayerColorVariables(gamedata.currentPlayer.color);
  }

  /**
   * Gives javascript access to PHP defined constants
   *
   * @param {object} constants - constants defined in PHP
   * @returns {void}
   */
  defineGlobalConstants(constants: object): void {
    for (var constant in constants) {
      if (!globalThis[constant]) {
        globalThis[constant] = constants[constant];
      }
    }
  }

  /**
   * Called when game enters a new state
   *
   * @param {string} stateName - name of the state
   * @param {object} args - args passed to the state
   * @returns {void}
   */
  onEnteringState(stateName: string, args: { args: any }): void {
    this.debug("onEnteringState: " + stateName, args, this.debugStateInfo());
    this.curstate = stateName;
    args["isCurrentPlayerActive"] = gameui.isCurrentPlayerActive();
    this.gameState[stateName].onEnteringState(args);

    if (this.pendingUpdate) {
      this.onUpdateActionButtons(stateName, args);
      this.pendingUpdate = false;
    }
  }

  /**
   * Called when game leaves a state
   *
   * @param {string} stateName - name of the state
   * @returns {void}
   */
  onLeavingState(stateName: string): void {
    this.debug("onLeavingState: " + stateName, this.debugStateInfo());
    this.currentPlayerWasActive = false;
    this.gameState[stateName].onLeavingState();
  }

  /**
   * Builds action buttons on state change
   *
   * @param {string} stateName - name of the state
   * @param {object} args - args passed to the state
   * @returns {void}
   */

  onUpdateActionButtons(stateName: string, args: any): void {
    if (this.curstate != stateName) {
      // delay firing this until onEnteringState is called so they always called in same order
      this.pendingUpdate = true;
      return;
    }
    this.pendingUpdate = false;
    if (
      gameui.isCurrentPlayerActive() &&
      this.currentPlayerWasActive == false
    ) {
      this.debug(
        "onUpdateActionButtons: " + stateName,
        args,
        this.debugStateInfo()
      );
      this.currentPlayerWasActive = true;
      // Call appropriate method
      this.gameState[stateName].onUpdateActionButtons(args);
    } else {
      this.currentPlayerWasActive = false;
    }
  }

  /**
   * Get info about current state
   *
   * @returns {object} state info
   */
  debugStateInfo(): object {
    var iscurac = gameui.isCurrentPlayerActive();
    var replayMode = false;
    if (typeof g_replayFrom != "undefined") {
      replayMode = true;
    }
    var instantaneousMode = gameui.instantaneousMode ? true : false;
    var res = {
      isCurrentPlayerActive: iscurac,
      instantaneousMode: instantaneousMode,
      replayMode: replayMode,
    };
    return res;
  }

  /**
   * A wrapper to make AJAX calls to the game server
   *
   * @param {string} action - name of the action
   * @param {object=} args - args passed to the action
   * @param {requestCallback=} handler - callback function
   * @returns {void}
   */
  ajaxcallwrapper(
    action: string,
    args?: any,
    handler?: (err: any) => void
  ): void {
    if (!args) {
      args = {};
    }
    args.lock = true;

    if (gameui.checkAction(action)) {
      gameui.ajaxcall(
        "/" +
          gameui.game_name +
          "/" +
          gameui.game_name +
          "/" +
          action +
          ".html",
        args, //
        gameui,
        (result) => {},
        handler
      );
    }
  }

  /**
   * Convert a hex color into rbga
   *
   * @param hex - hex color
   * @param opacity - opacity to use
   * @returns {string} rgba color
   */
  convertHexToRGBA(hex: string, opacity: number): string {
    const hexString = hex.replace("#", "");
    const red = parseInt(hexString.substring(0, 2), 16);
    const green = parseInt(hexString.substring(2, 4), 16);
    const blue = parseInt(hexString.substring(4, 6), 16);
    return `rgba(${red},${green},${blue},${opacity})`;
  }

  /**
   * Creates and inserts HTML into the DOM
   *
   * @param {string} divstr - div to create
   * @param {string=} location - parent node to insert div into
   * @returns {any} div element
   */
  createHtml(divstr: string, location?: string): any {
    const tempHolder = document.createElement("div");
    tempHolder.innerHTML = divstr;
    const div = tempHolder.firstElementChild;
    const parentNode = document.getElementById(location);
    if (parentNode) parentNode.appendChild(div);
    return div;
  }

  /**
   * Creates a div and inserts it into the DOM
   *
   * @param {string=} id - id of div
   * @param {string=} classes - classes to add to div
   * @param {string=} location - parent node to insert div into
   * @returns {any}
   */
  createDiv(id?: string | undefined, classes?: string, location?: string): any {
    const div = document.createElement("div");
    if (id) div.id = id;
    if (classes) div.classList.add(...classes.split(" "));
    const parentNode = document.getElementById(location);
    if (parentNode) parentNode.appendChild(div);
    return div;
  }

  /**
   * Calls a function if it exists
   *
   * @param {string} methodName - name of the function
   * @param {object} args - args passed to the function
   * @returns
   */
  callfn(methodName: string, args: any) {
    if (this[methodName] !== undefined) {
      this.debug("Calling " + methodName, args);
      return this[methodName](args);
    }
    return undefined;
  }

  /** @Override onScriptError from gameui */
  onScriptError(msg: any, url: any, linenumber: any) {
    if (gameui.page_is_unloading) {
      // Don't report errors during page unloading
      return;
    }
    // In anycase, report these errors in the console
    console.error(msg);
    // cannot call super - dojo still have to used here
    //super.onScriptError(msg, url, linenumber);
    return this.inherited(arguments);
  }

  /**
   * Set the css color variables for the current player
   *
   * @param color - hex color from player db
   */
  setCurrentPlayerColorVariables(color: string): void {
    const root = document.documentElement;
    const hexColor = "#" + color;
    const rgbaColor = this.convertHexToRGBA(hexColor, 0.75);
    root.style.setProperty("--player-color-hex", hexColor);
    root.style.setProperty("--player-color-rgba", rgbaColor);
  }

  project(from, postfix) {
    var elem = $(from);
    var over = $("oversurface");
    var par = elem.parentNode;
    var overRect = over.getBoundingClientRect();
    var elemRect = elem.getBoundingClientRect();

    var centerY = elemRect.y + elemRect.height / 2;
    var centerX = elemRect.x + elemRect.width / 2;

    var offsetY = 0;
    var offsetX = 0;

    var newId = elem.id + postfix;
    var old = $(newId);
    if (old) old.parentNode.removeChild(old);

    var clone = elem.cloneNode(true);
    clone.id = newId;

    // this caclculates transitive maxtrix for transformations of the parent
    // so we can apply it oversurface to match exact scale and rotate
    var fullmatrix = "";
    while (par != over.parentNode && par != null && par != document) {
      var style = window.getComputedStyle(par);
      var matrix = style.transform; //|| "matrix(1,0,0,1,0,0)";

      if (matrix && matrix != "none") fullmatrix += " " + matrix;
      par = par.parentNode;
    }

    // Doing this now means I can use getBoundingClientRect
    over.appendChild(clone);

    var cloneRect = clone.getBoundingClientRect();

    var offsetY = centerY - 120;
    var offsetX = centerX;

    // Finally apply the offects and transform - we should have exact copy of object but on different parent

    clone.style.left = offsetX + "px";
    clone.style.top = offsetY + "px";
    clone.style.transform = fullmatrix;

    return clone;
  }

  phantomMove(mobileId, newparentId, duration) {
    var box = $(mobileId);
    var newparent = $(newparentId);
    var clone = this.project(box.id, "_temp");
    box.style.opacity = 0;
    newparent.appendChild(box);

    var desti = this.project(box.id, "_temp2");

    clone.style.transitionDuration = duration + "ms";
    // clone.offsetTop;
    clone.style.left = desti.style.left;
    clone.style.top = desti.style.top;
    clone.style.transform = desti.style.transform;
    //console.log(desti.style.top, clone.style.top);
    desti.parentNode.removeChild(desti);
    setTimeout(() => {
      box.style.removeProperty("opacity");
      if (clone.parentNode) clone.parentNode.removeChild(clone);
    }, duration);
  }
}
