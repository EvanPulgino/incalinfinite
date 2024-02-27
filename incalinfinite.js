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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
// @ts-ignore
// @ts-nocheck
GameGui = /** @class */ (function () {
    function GameGui() { }
    return GameGui;
})();
var GameBasics = /** @class */ (function (_super) {
    __extends(GameBasics, _super);
    function GameBasics() {
        var _this = _super.call(this) || this;
        _this.isDebug = window.location.host == "studio.boardgamearena.com";
        _this.debug = _this.isDebug ? console.info.bind(window.console) : function () { };
        _this.debug("GameBasics constructor", _this);
        _this.curstate = null;
        _this.pendingUpdate = false;
        _this.currentPlayerWasActive = false;
        _this.gameState = new GameState(_this);
        return _this;
    }
    /**
     * Change the viewport size based on current window size
     * Called when window is resized
     *
     * @returns {void}
     */
    GameBasics.prototype.adaptViewportSize = function () {
        var t = dojo.marginBox("incal-screen");
        var r = t.w;
        var s = 2400;
        var height = dojo.marginBox("incal-table").h;
        var viewportWidth = dojo.window.getBox().w;
        var gameAreaWidth = viewportWidth < 980 ? viewportWidth : viewportWidth - 245;
        if (r >= s) {
            var i = (r - s) / 2;
            dojo.style("incal-game", "transform", "");
            dojo.style("incal-game", "left", i + "px");
            dojo.style("incal-game", "height", height + "px");
            dojo.style("incal-game", "width", gameAreaWidth + "px");
        }
        else {
            var o = r / s;
            i = (t.w - r) / 2;
            var width = viewportWidth <= 245 ? gameAreaWidth : gameAreaWidth / o;
            dojo.style("incal-game", "transform", "scale(" + o + ")");
            dojo.style("incal-game", "left", i + "px");
            dojo.style("incal-game", "height", height * o + "px");
            dojo.style("incal-game", "width", width + "px");
        }
    };
    /**
     * UI setup entry point
     *
     * @param {object} gamedata - game data
     * @returns {void}
     */
    GameBasics.prototype.setup = function (gamedata) {
        this.debug("Game data", gamedata);
        this.setCurrentPlayerColorVariables(gamedata.currentPlayer.color);
    };
    /**
     * Gives javascript access to PHP defined constants
     *
     * @param {object} constants - constants defined in PHP
     * @returns {void}
     */
    GameBasics.prototype.defineGlobalConstants = function (constants) {
        for (var constant in constants) {
            if (!globalThis[constant]) {
                globalThis[constant] = constants[constant];
            }
        }
    };
    /**
     * Called when game enters a new state
     *
     * @param {string} stateName - name of the state
     * @param {object} args - args passed to the state
     * @returns {void}
     */
    GameBasics.prototype.onEnteringState = function (stateName, args) {
        this.debug("onEnteringState: " + stateName, args, this.debugStateInfo());
        this.curstate = stateName;
        args["isCurrentPlayerActive"] = gameui.isCurrentPlayerActive();
        this.gameState[stateName].onEnteringState(args);
        if (this.pendingUpdate) {
            this.onUpdateActionButtons(stateName, args);
            this.pendingUpdate = false;
        }
    };
    /**
     * Called when game leaves a state
     *
     * @param {string} stateName - name of the state
     * @returns {void}
     */
    GameBasics.prototype.onLeavingState = function (stateName) {
        this.debug("onLeavingState: " + stateName, this.debugStateInfo());
        this.currentPlayerWasActive = false;
        this.gameState[stateName].onLeavingState();
    };
    /**
     * Builds action buttons on state change
     *
     * @param {string} stateName - name of the state
     * @param {object} args - args passed to the state
     * @returns {void}
     */
    GameBasics.prototype.onUpdateActionButtons = function (stateName, args) {
        if (this.curstate != stateName) {
            // delay firing this until onEnteringState is called so they always called in same order
            this.pendingUpdate = true;
            return;
        }
        this.pendingUpdate = false;
        if (gameui.isCurrentPlayerActive() &&
            this.currentPlayerWasActive == false) {
            this.debug("onUpdateActionButtons: " + stateName, args, this.debugStateInfo());
            this.currentPlayerWasActive = true;
            // Call appropriate method
            this.gameState[stateName].onUpdateActionButtons(args);
        }
        else {
            this.currentPlayerWasActive = false;
        }
    };
    /**
     * Get info about current state
     *
     * @returns {object} state info
     */
    GameBasics.prototype.debugStateInfo = function () {
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
    };
    /**
     * A wrapper to make AJAX calls to the game server
     *
     * @param {string} action - name of the action
     * @param {object=} args - args passed to the action
     * @param {requestCallback=} handler - callback function
     * @returns {void}
     */
    GameBasics.prototype.ajaxcallwrapper = function (action, args, handler) {
        if (!args) {
            args = {};
        }
        args.lock = true;
        if (gameui.checkAction(action)) {
            gameui.ajaxcall("/" +
                gameui.game_name +
                "/" +
                gameui.game_name +
                "/" +
                action +
                ".html", args, //
            gameui, function (result) { }, handler);
        }
    };
    /**
     * Convert a hex color into rbga
     *
     * @param hex - hex color
     * @param opacity - opacity to use
     * @returns {string} rgba color
     */
    GameBasics.prototype.convertHexToRGBA = function (hex, opacity) {
        var hexString = hex.replace("#", "");
        var red = parseInt(hexString.substring(0, 2), 16);
        var green = parseInt(hexString.substring(2, 4), 16);
        var blue = parseInt(hexString.substring(4, 6), 16);
        return "rgba(".concat(red, ",").concat(green, ",").concat(blue, ",").concat(opacity, ")");
    };
    /**
     * Creates and inserts HTML into the DOM
     *
     * @param {string} divstr - div to create
     * @param {string=} location - parent node to insert div into
     * @returns {any} div element
     */
    GameBasics.prototype.createHtml = function (divstr, location) {
        var tempHolder = document.createElement("div");
        tempHolder.innerHTML = divstr;
        var div = tempHolder.firstElementChild;
        var parentNode = document.getElementById(location);
        if (parentNode)
            parentNode.appendChild(div);
        return div;
    };
    /**
     * Creates a div and inserts it into the DOM
     *
     * @param {string=} id - id of div
     * @param {string=} classes - classes to add to div
     * @param {string=} location - parent node to insert div into
     * @returns {any}
     */
    GameBasics.prototype.createDiv = function (id, classes, location) {
        var _a;
        var div = document.createElement("div");
        if (id)
            div.id = id;
        if (classes)
            (_a = div.classList).add.apply(_a, classes.split(" "));
        var parentNode = document.getElementById(location);
        if (parentNode)
            parentNode.appendChild(div);
        return div;
    };
    /**
     * Calls a function if it exists
     *
     * @param {string} methodName - name of the function
     * @param {object} args - args passed to the function
     * @returns
     */
    GameBasics.prototype.callfn = function (methodName, args) {
        if (this[methodName] !== undefined) {
            this.debug("Calling " + methodName, args);
            return this[methodName](args);
        }
        return undefined;
    };
    /** @Override onScriptError from gameui */
    GameBasics.prototype.onScriptError = function (msg, url, linenumber) {
        if (gameui.page_is_unloading) {
            // Don't report errors during page unloading
            return;
        }
        // In anycase, report these errors in the console
        console.error(msg);
        // cannot call super - dojo still have to used here
        //super.onScriptError(msg, url, linenumber);
        return this.inherited(arguments);
    };
    /**
     * Set the css color variables for the current player
     *
     * @param color - hex color from player db
     */
    GameBasics.prototype.setCurrentPlayerColorVariables = function (color) {
        var root = document.documentElement;
        var hexColor = "#" + color;
        var rgbaColor = this.convertHexToRGBA(hexColor, 0.75);
        root.style.setProperty("--player-color-hex", hexColor);
        root.style.setProperty("--player-color-rgba", rgbaColor);
    };
    GameBasics.prototype.project = function (from, postfix) {
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
        if (old)
            old.parentNode.removeChild(old);
        var clone = elem.cloneNode(true);
        clone.id = newId;
        // this caclculates transitive maxtrix for transformations of the parent
        // so we can apply it oversurface to match exact scale and rotate
        var fullmatrix = "";
        while (par != over.parentNode && par != null && par != document) {
            var style = window.getComputedStyle(par);
            var matrix = style.transform; //|| "matrix(1,0,0,1,0,0)";
            if (matrix && matrix != "none")
                fullmatrix += " " + matrix;
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
    };
    GameBasics.prototype.phantomMove = function (mobileId, newparentId, duration) {
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
        setTimeout(function () {
            box.style.removeProperty("opacity");
            if (clone.parentNode)
                clone.parentNode.removeChild(clone);
        }, duration);
    };
    return GameBasics;
}(GameGui));
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * GameBody.ts
 *
 * Main game logic
 *
 */
// @ts-ignore
var GameBody = /** @class */ (function (_super) {
    __extends(GameBody, _super);
    function GameBody() {
        var _this = _super.call(this) || this;
        _this.cardController = new CardController(_this);
        _this.enemyController = new EnemyController(_this);
        _this.locationController = new LocationController(_this);
        _this.metashipController = new MetashipController(_this);
        _this.playerController = new PlayerController(_this);
        dojo.connect(window, "onresize", _this, dojo.hitch(_this, "adaptViewportSize"));
        return _this;
    }
    /**
     * UI setup entry point
     *
     * @param {object} gamedata - current game data used to initialize UI
     */
    GameBody.prototype.setup = function (gamedata) {
        _super.prototype.setup.call(this, gamedata);
        this.playerController.setupPlayerPanels(gamedata.incalInfinitePlayers);
        this.locationController.setupLocations(gamedata.locations, gamedata.powers);
        this.metashipController.setupMetaship(gamedata.metashipLocation);
        this.enemyController.setupEnemy(gamedata.enemy);
        this.cardController.setupDeck(gamedata.deck);
        this.cardController.setupDiscard(gamedata.discard);
        this.cardController.setupPlayerHand(gamedata.currentPlayerHand);
        this.cardController.setupLocationCards(gamedata.locationCards);
        this.setupNotifications();
    };
    /**
     * Setups and subscribes to notifications
     */
    GameBody.prototype.setupNotifications = function () {
        for (var m in this) {
            if (typeof this[m] == "function" && m.startsWith("notif_")) {
                dojo.subscribe(m.substring(6), this, m);
            }
        }
        this.notifqueue.setSynchronous("addDamageToDiscard", 1000);
        this.notifqueue.setSynchronous("cardDrawn", 1000);
        this.notifqueue.setSynchronous("cardDrawnPrivate", 1000);
        this.notifqueue.setSynchronous("discardCard", 1000);
        this.notifqueue.setSynchronous("discardShuffled", 1000);
        this.notifqueue.setSynchronous("gainDamageFromEnemy", 1000);
        this.notifqueue.setSynchronous("gainDamageFromEnemyPrivate", 1000);
        this.notifqueue.setSynchronous("moveEnemy", 1000);
        this.notifqueue.setSynchronous("moveMetaship", 1250);
        this.notifqueue.setIgnoreNotificationCheck("cardDrawn", function (notif) {
            return notif.args.player_id == gameui.player_id;
        });
        this.notifqueue.setIgnoreNotificationCheck("gainDamageFromEnemy", function (notif) {
            return notif.args.player_id == gameui.player_id;
        });
    };
    /**
     * Handle 'message' notification
     *
     * @param {object} notif - notification data
     */
    GameBody.prototype.notif_message = function (notif) { };
    GameBody.prototype.notif_addDamageToDiscard = function (notif) {
        this.cardController.addDamageToDiscard(notif.args.card, notif.args.player_id);
    };
    GameBody.prototype.notif_cardDrawn = function (notif) {
        this.cardController.drawCard(notif.args.card, notif.args.player_id);
        this.playerController.incrementHandCount(notif.args.player_id);
    };
    GameBody.prototype.notif_cardDrawnPrivate = function (notif) {
        this.cardController.drawCardActivePlayer(notif.args.card);
        this.playerController.incrementHandCount(notif.args.player_id);
    };
    GameBody.prototype.notif_discardCard = function (notif) {
        this.cardController.discardCard(notif.args.card, notif.args.player_id);
        this.playerController.decrementHandCount(notif.args.player_id);
    };
    GameBody.prototype.notif_discardShuffled = function (notif) {
        this.cardController.shuffleDiscardIntoDeck(notif.args.cards);
    };
    GameBody.prototype.notif_gainDamageFromEnemy = function (notif) {
        console.log("gainDamageFromEnemy", notif.args.card, notif.args.player_id);
        this.cardController.gainDamageFromEnemy(notif.args.card, notif.args.player_id);
        this.playerController.incrementHandCount(notif.args.player_id);
    };
    GameBody.prototype.notif_gainDamageFromEnemyPrivate = function (notif) {
        console.log("gainDamageFromEnemyPrivate", notif.args.card, notif.args.player_id);
        this.cardController.gainDamageFromEnemyActivePlayer(notif.args.card, notif.args.player_id);
        this.playerController.incrementHandCount(notif.args.player_id);
    };
    GameBody.prototype.notif_moveEnemy = function (notif) {
        this.enemyController.moveEnemy(notif.args.destinationPosition);
    };
    GameBody.prototype.notif_moveMetaship = function (notif) {
        this.metashipController.moveMetaship(notif.args.newLocationPosition, notif.args.lastStep);
    };
    return GameBody;
}(GameBasics));
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * GameState.ts
 *
 * Class that holds all game states
 *
 */
var GameState = /** @class */ (function () {
    function GameState(game) {
        this.gameEnd = new GameEnd(game);
        this.gameSetup = new GameSetup(game);
        this.nextPlayer = new NextPlayer(game);
        this.passTurn = new PassTurn(game);
        this.playerTurn = new PlayerTurn(game);
    }
    return GameState;
}());
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * define.ts
 *
 */
// @ts-nocheck
define([
    "dojo",
    "dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
    "ebg/stock",
], function (dojo, declare) {
    return declare("bgagame.incalinfinite", ebg.core.gamegui, new GameBody());
});
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * CardController.ts
 *
 * Handles all front end interactions with cards
 *
 */
var CardController = /** @class */ (function () {
    function CardController(ui) {
        this.ui = ui;
        this.counters = [];
    }
    CardController.prototype.setupDeck = function (cards) {
        cards.sort(this.byPileOrder);
        for (var _i = 0, cards_1 = cards; _i < cards_1.length; _i++) {
            var card = cards_1[_i];
            var cardDiv = '<div id="card-' + card.id + '" class="card"></div>';
            this.createCardElement(card, cardDiv, "incal-deck");
        }
        this.createDeckCounter(cards.length);
    };
    CardController.prototype.setupDiscard = function (cards) {
        cards.sort(this.byPileOrderDesc);
        for (var _i = 0, cards_2 = cards; _i < cards_2.length; _i++) {
            var card = cards_2[_i];
            var cardDiv = '<div id="card-' +
                card.id +
                '" class="card ' +
                this.getCardCssClass(card) +
                '"></div>';
            this.createCardElement(card, cardDiv, "incal-discard");
        }
        this.createDiscardCounter(cards.length);
    };
    CardController.prototype.setupLocationCards = function (cards) {
        for (var _i = 0, cards_3 = cards; _i < cards_3.length; _i++) {
            var card = cards_3[_i];
            var cardDiv = '<div id="card-' +
                card.id +
                '" class="card ' +
                this.getCardCssClass(card) +
                '"></div>';
            this.createCardElement(card, cardDiv, "card-container-" + card.locationArg);
        }
    };
    CardController.prototype.setupPlayerHand = function (cards) {
        cards.sort(this.byValue);
        cards.sort(this.byType);
        for (var _i = 0, cards_4 = cards; _i < cards_4.length; _i++) {
            var card = cards_4[_i];
            var cardDiv = '<div id="card-wrapper-' +
                card.id +
                '">' +
                '<div id="card-' +
                card.id +
                '" class="card ' +
                this.getCardCssClass(card) +
                '"></div></div>';
            this.createCardElement(card, cardDiv, "player-hand");
        }
    };
    CardController.prototype.getCardCssClass = function (card) {
        var cssClass = card.type;
        if (card.type !== "damage" && card.type !== "johndifool") {
            cssClass += "-" + card.value;
        }
        return cssClass;
    };
    CardController.prototype.createCardElement = function (card, cardDiv, parentDiv) {
        this.ui.createHtml(cardDiv, parentDiv);
        if (card.location !== "deck" && card.location !== "discard") {
            this.ui.addTooltipHtml("card-" + card.id, card.tooltip);
        }
    };
    CardController.prototype.byPileOrder = function (a, b) {
        return a.locationArg - b.locationArg;
    };
    CardController.prototype.byPileOrderDesc = function (a, b) {
        return b.locationArg - a.locationArg;
    };
    CardController.prototype.byType = function (a, b) {
        return a.type.localeCompare(b.type);
    };
    CardController.prototype.byValue = function (a, b) {
        return a.value - b.value;
    };
    CardController.prototype.addDamageToDiscard = function (card, playerId) {
        var _this = this;
        var cardDiv = '<div id="card-' + card.id + '" class="card damage"></div>';
        this.ui.createHtml(cardDiv, "incal-player-panel-" + playerId);
        var animation = this.ui.slideToObject("card-" + card.id, "incal-discard", 1000);
        dojo.connect(animation, "onEnd", function () {
            dojo.removeAttr("card-" + card.id, "style");
            dojo.place("card-" + card.id, "incal-discard");
            _this.incrementDiscardCounter();
        });
        animation.play();
    };
    CardController.prototype.createDeckCounter = function (deckSize) {
        this.counters["deck"] = new ebg.counter();
        this.counters["deck"].create("incal-deck-count");
        this.counters["deck"].setValue(deckSize);
        if (deckSize === 0) {
            dojo.style("incal-deck-count", "display", "none");
        }
    };
    CardController.prototype.createDiscardCounter = function (discardSize) {
        this.counters["discard"] = new ebg.counter();
        this.counters["discard"].create("incal-discard-count");
        this.counters["discard"].setValue(discardSize);
        if (discardSize === 0) {
            dojo.style("incal-discard-count", "display", "none");
        }
    };
    CardController.prototype.discardCard = function (card, playerId) {
        var _this = this;
        var cardDivId = "card-" + card.id;
        var cardElement = dojo.byId(cardDivId);
        if (cardElement === null) {
            var cardDiv = '<div id="' +
                cardDivId +
                '" class="card ' +
                this.getCardCssClass(card) +
                '"></div>';
            this.ui.createHtml(cardDiv, "incal-player-panel-" + playerId);
        }
        else {
            dojo.place(cardDivId, "incal-player-panel-" + playerId);
        }
        var animation = this.ui.slideToObject(cardDivId, "incal-discard", 1000);
        dojo.connect(animation, "onEnd", function () {
            dojo.removeAttr(cardDivId, "style");
            dojo.place(cardDivId, "incal-discard");
            _this.incrementDiscardCounter();
        });
        animation.play();
        var cardWrapper = dojo.byId("card-wrapper-" + card.id);
        dojo.destroy(cardWrapper);
    };
    CardController.prototype.discardExistingCard = function (cardId, playerId) {
        var _this = this;
        var card = dojo.byId("card-" + cardId);
        dojo.place(card, "incal-player-panel-" + playerId);
        var animation = this.ui.slideToObject(card, "incal-discard", 1000);
        dojo.connect(animation, "onEnd", function () {
            dojo.removeAttr(card, "style");
            dojo.place(card, "incal-discard");
            _this.incrementDiscardCounter();
        });
        animation.play();
        var cardWrapper = dojo.byId("card-wrapper-" + cardId);
        dojo.destroy(cardWrapper);
    };
    CardController.prototype.drawCard = function (card, playerId) {
        var cardElement = dojo.byId("card-" + card.id);
        this.ui.slideToObjectAndDestroy(cardElement, "incal-player-panel-" + playerId, 1000);
        this.decrementDeckCounter();
    };
    CardController.prototype.drawCardActivePlayer = function (card) {
        var _this = this;
        var cardElement = dojo.byId("card-" + card.id);
        dojo.addClass(cardElement, this.getCardCssClass(card));
        this.ui.addTooltipHtml("card-" + card.id, card.tooltip);
        var wrapperDiv = "<div id='card-wrapper-" + card.id + "'></div>";
        this.ui.createHtml(wrapperDiv, "player-hand");
        var animation = this.ui.slideToObject(cardElement, "card-wrapper-" + card.id, 1000);
        dojo.connect(animation, "onEnd", function () {
            dojo.removeAttr(cardElement, "style");
            dojo.place(cardElement, "card-wrapper-" + card.id);
            _this.decrementDeckCounter();
        });
        animation.play();
    };
    CardController.prototype.decrementDeckCounter = function () {
        this.counters["deck"].incValue(-1);
        if (this.counters["deck"].getValue() === 0) {
            dojo.style("incal-deck-count", "display", "none");
        }
    };
    CardController.prototype.gainDamageFromEnemy = function (card, playerId) {
        var cardDiv = '<div id="card-' + card.id + '" class="card damage"></div>';
        this.ui.createHtml(cardDiv, "oversurface");
        var cardElement = dojo.byId("card-" + card.id);
        this.ui.slideToObjectAndDestroy(cardElement, "incal-player-panel-" + playerId, 1000);
    };
    CardController.prototype.gainDamageFromEnemyActivePlayer = function (card, playerId) {
        var _this = this;
        var cardDiv = '<div id="card-' + card.id + '" class="card damage"></div>';
        this.ui.createHtml(cardDiv, "oversurface");
        var cardElement = dojo.byId("card-" + card.id);
        dojo.addClass(cardElement, this.getCardCssClass(card));
        this.ui.addTooltipHtml("card-" + card.id, card.tooltip);
        var wrapperDiv = "<div id='card-wrapper-" + card.id + "'></div>";
        this.ui.createHtml(wrapperDiv, "player-hand");
        var animation = this.ui.slideToObject(cardElement, "card-wrapper-" + card.id, 1000);
        dojo.connect(animation, "onEnd", function () {
            dojo.removeAttr(cardElement, "style");
            dojo.place(cardElement, "card-wrapper-" + card.id);
            _this.decrementDeckCounter();
        });
        animation.play();
    };
    CardController.prototype.incrementDiscardCounter = function () {
        if (this.counters["discard"].getValue() === 0) {
            dojo.removeAttr("incal-discard-count", "style");
        }
        this.counters["discard"].incValue(1);
    };
    CardController.prototype.shuffleDiscardIntoDeck = function (cards) {
        var discards = dojo.query(".card", "incal-discard");
        for (var _i = 0, discards_1 = discards; _i < discards_1.length; _i++) {
            var card = discards_1[_i];
            dojo.destroy(card);
        }
        this.counters["discard"].setValue(0);
        dojo.style("incal-discard-count", "display", "none");
        this.setupDeck(cards);
    };
    return CardController;
}());
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * EnemyController.ts
 *
 * Handles all front end interactions with the selected enemy silhouette
 *
 */
var EnemyController = /** @class */ (function () {
    function EnemyController(ui) {
        this.ui = ui;
    }
    EnemyController.prototype.setupEnemy = function (enemy) {
        var enemyDiv = '<div id="enemy" class="silhouette ' + enemy.key + '"></div>';
        if (enemy.key === "presidentshunchbacks") {
            this.ui.createHtml(enemyDiv, "enemy-container-" + enemy.location);
        }
        else {
            this.ui.createHtml(enemyDiv, "incal-space-" + enemy.location);
        }
        this.ui.addTooltipHtml("enemy", enemy.tooltip);
    };
    EnemyController.prototype.moveEnemy = function (position) {
        var enemy = document.getElementById("enemy");
        var enemyType = enemy.classList[1];
        var destinationId = "";
        if (enemyType === "presidentshunchbacks") {
            destinationId = "enemy-container-" + position;
        }
        else {
            destinationId = "incal-space-" + position;
        }
        var animation = this.ui.slideToObject(enemy, destinationId, 500);
        dojo.connect(animation, "onEnd", function () {
            dojo.removeAttr(enemy, "style");
            dojo.place(enemy, destinationId);
        });
        animation.play();
    };
    return EnemyController;
}());
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * LocationController.ts
 *
 * Handles all front end interactions with the location tiles
 *
 */
var LocationController = /** @class */ (function () {
    function LocationController(ui) {
        this.ui = ui;
    }
    /**
     * Creates the location tiles
     *
     * @param locations
     * @param powers
     */
    LocationController.prototype.setupLocations = function (locations, powers) {
        for (var _i = 0, locations_1 = locations; _i < locations_1.length; _i++) {
            var location_1 = locations_1[_i];
            this.createLocation(location_1, powers);
            this.ui.addTooltipHtml(location_1.key, location_1.tooltip);
        }
    };
    /**
     * Creates a location tile
     *
     * @param location
     */
    LocationController.prototype.createLocation = function (location, powers) {
        // Create container
        this.createLocationContainer(location);
        // Create the location tile div
        this.createLocationDiv(location);
        // Create location chits
        this.createLocationChits(location, powers);
        // Create metaship container div
        this.createMetashipContainer(location);
        // Create enemy container div
        this.createEnemyContainer(location);
        // Create card container div
        this.createCardContainer(location);
    };
    /**
     * Creates the card container for a location
     *
     * @param location - The location to create the container on
     */
    LocationController.prototype.createCardContainer = function (location) {
        if (location.key !== "suicidealley") {
            var cardContainerDiv = '<div id="card-container-' +
                location.tilePosition +
                '" class="location-card-container"></div>';
            this.ui.createHtml(cardContainerDiv, "incal-location-container-" + location.key);
        }
    };
    /**
     * Creates the enemy container
     *
     * @param location - The location to create the container on
     */
    LocationController.prototype.createEnemyContainer = function (location) {
        var enemyContainerDiv = '<div id="enemy-container-' +
            location.tilePosition +
            '" class="silhouette-container"></div>';
        this.ui.createHtml(enemyContainerDiv, location.key);
    };
    /**
     * Creates the incal chit on the location
     *
     * @param location - The location to create the chit on
     */
    LocationController.prototype.createIncalChit = function (location) {
        // Create the incal chit div
        var chitDiv = '<div id="incal-chit-' + location.key + '" class="incalchit"></div>';
        this.ui.createHtml(chitDiv, "incal-location-container-" + location.key);
    };
    /**
     * Creates the metaship container
     *
     * @param location - The location to create the container on
     */
    LocationController.prototype.createMetashipContainer = function (location) {
        var mirror = location.tilePosition > 3 && location.tilePosition < 9;
        var cssClass = "silhouette-container" + (mirror ? " mirror" : "");
        var metashipContainerDiv = '<div id="metaship-container-' +
            location.tilePosition +
            '" class="' +
            cssClass +
            '"></div>';
        this.ui.createHtml(metashipContainerDiv, location.key);
    };
    /**
     * Creates the location chits
     *
     * @param location - The location to create the chits on
     * @param powers - The power chits to create on Suicide Alley
     */
    LocationController.prototype.createLocationChits = function (location, powers) {
        if (location.key === "suicidealley") {
            this.createSuicideAlleyPowers(powers);
        }
        else {
            this.createIncalChit(location);
        }
    };
    /**
     * Create location container
     *
     * @param location - The location to create a container for
     */
    LocationController.prototype.createLocationContainer = function (location) {
        var spaceDivId = "incal-space-" + location.tilePosition;
        var locationContainer = '<div id="incal-location-container-' +
            location.key +
            '" class="incal-location-container"></div>';
        this.ui.createHtml(locationContainer, spaceDivId);
    };
    /**
     * Creates a location tile div
     *
     * @param location - The location to create
     */
    LocationController.prototype.createLocationDiv = function (location) {
        var locationDiv = '<div id="' +
            location.key +
            '" class="locationtile ' +
            location.key +
            '"></div>';
        this.ui.createHtml(locationDiv, "incal-location-container-" + location.key);
    };
    /**
     * Create the power chits on Suicide Alley
     *
     * @param powers - Power chits to create
     */
    LocationController.prototype.createSuicideAlleyPowers = function (powers) {
        var powerChitContainerDiv = "<div id='power-chit-container'></div>";
        this.ui.createHtml(powerChitContainerDiv, "incal-location-container-suicidealley");
        for (var _i = 0, powers_1 = powers; _i < powers_1.length; _i++) {
            var power = powers_1[_i];
            var powerChitDiv = '<div id="power-chit-' +
                power.key +
                '" class="power ' +
                power.cssClass +
                '"></div>';
            this.ui.createHtml(powerChitDiv, "power-chit-container");
            this.ui.addTooltipHtml("power-chit-" + power.key, power.tooltip);
        }
    };
    return LocationController;
}());
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * MetashipController.ts
 *
 * Handles all front end interactions with the Meta-ship silhouette
 *
 */
var MetashipController = /** @class */ (function () {
    function MetashipController(ui) {
        this.ui = ui;
    }
    MetashipController.prototype.setupMetaship = function (metashipLocation) {
        var metashipDiv = '<div id="metaship" class="silhouette metaship"></div>';
        this.ui.createHtml(metashipDiv, "metaship-container-" + metashipLocation);
    };
    /**
     * Moves the metaship to the a location
     *
     * @param {number} location - new location to move the metaship to
     * @param {boolean} lastStep - whether this is the last step of the animation
     */
    MetashipController.prototype.moveMetaship = function (location, lastStep) {
        this.ui.phantomMove("metaship", "metaship-container-" + location, 1000);
    };
    return MetashipController;
}());
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * PlayerController.ts
 *
 * Handles all front end interactions with players
 *
 */
var PlayerController = /** @class */ (function () {
    function PlayerController(ui) {
        this.ui = ui;
        this.counters = [];
        this.counters["handCount"] = [];
    }
    PlayerController.prototype.setupPlayerPanels = function (players) {
        for (var _i = 0, players_1 = players; _i < players_1.length; _i++) {
            var player = players_1[_i];
            this.createPlayerPanelContainer(player.id);
            this.createHandCountDiv(player.id);
            this.createHandCountCounterDiv(player);
            this.createHandCountCounter(player);
        }
    };
    PlayerController.prototype.createPlayerPanelContainer = function (playerId) {
        var playerPanelContainer = '<div id="incal-player-panel-' +
            playerId +
            '" class="player-panel-container"></div>';
        this.ui.createHtml(playerPanelContainer, "player_board_" + playerId);
    };
    PlayerController.prototype.createHandCountDiv = function (playerId) {
        var handCountDiv = '<div id="incal-player-hand-count-' +
            playerId +
            '" class="player-hand-count"></div>';
        this.ui.createHtml(handCountDiv, "incal-player-panel-" + playerId);
    };
    PlayerController.prototype.createHandCountCounterDiv = function (player) {
        var handCountCounter = '<div id="incal-player-hand-count-counter-' +
            player.id +
            '" class="card-icon"><span id="player-hand-count-' +
            player.id +
            '"></span></div>';
        this.ui.createHtml(handCountCounter, "incal-player-hand-count-" + player.id);
        var textShadowStyle = "3px 3px 2px #".concat(player.color, ", -3px 3px 2px #").concat(player.color, ", -3px -3px 0 #").concat(player.color, ", 3px -3px 0 #").concat(player.color);
        dojo.style("incal-player-hand-count-counter-" + player.id, "textShadow", textShadowStyle);
    };
    PlayerController.prototype.createHandCountCounter = function (player) {
        this.counters["handCount"][player.id] = new ebg.counter();
        this.counters["handCount"][player.id].create("player-hand-count-" + player.id);
        this.counters["handCount"][player.id].setValue(player.handCount);
    };
    PlayerController.prototype.decrementHandCount = function (playerId) {
        this.counters["handCount"][playerId].incValue(-1);
    };
    PlayerController.prototype.incrementHandCount = function (playerId) {
        this.counters["handCount"][playerId].incValue(1);
    };
    return PlayerController;
}());
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * GameEnd.ts
 *
 * Incal Infinite game end state
 *
 */
var GameEnd = /** @class */ (function () {
    function GameEnd(game) {
        this.id = 99;
        this.name = "GameEnd";
        this.game = game;
    }
    GameEnd.prototype.onEnteringState = function (stateArgs) { };
    GameEnd.prototype.onLeavingState = function () { };
    GameEnd.prototype.onUpdateActionButtons = function (stateArgs) { };
    return GameEnd;
}());
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * GameSetup.ts
 *
 * Incal Infinite game setup state
 *
 */
var GameSetup = /** @class */ (function () {
    function GameSetup(game) {
        this.id = 1;
        this.name = "GameSetup";
        this.game = game;
    }
    GameSetup.prototype.onEnteringState = function (stateArgs) { };
    GameSetup.prototype.onLeavingState = function () { };
    GameSetup.prototype.onUpdateActionButtons = function (stateArgs) { };
    return GameSetup;
}());
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * NextPlayer.ts
 *
 * Incal Infinite next player state
 *
 */
var NextPlayer = /** @class */ (function () {
    function NextPlayer(game) {
        this.id = 20;
        this.name = "nextPlayer";
        this.game = game;
    }
    NextPlayer.prototype.onEnteringState = function (stateArgs) { };
    NextPlayer.prototype.onLeavingState = function () { };
    NextPlayer.prototype.onUpdateActionButtons = function (stateArgs) { };
    return NextPlayer;
}());
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * PassTurn.ts
 *
 * Incal Infinite pass turn state
 *
 */
var PassTurn = /** @class */ (function () {
    function PassTurn(game) {
        this.id = 12;
        this.name = "passTurn";
        this.game = game;
        this.connections = {};
    }
    PassTurn.prototype.onEnteringState = function (stateArgs) {
        if (stateArgs.isCurrentPlayerActive) {
            var hand = stateArgs.args["hand"];
            for (var _i = 0, hand_1 = hand; _i < hand_1.length; _i++) {
                var card = hand_1[_i];
                if (card.type === "damage") {
                    this.disableDamageCard(card);
                }
                else {
                    this.createCardAction(card);
                }
            }
        }
    };
    PassTurn.prototype.onLeavingState = function () {
        this.resetUX();
    };
    PassTurn.prototype.onUpdateActionButtons = function (stateArgs) {
        var _this = this;
        if (stateArgs.isCurrentPlayerActive) {
            // Create action button for Confirm discard action
            gameui.addActionButton("confirm-discard-button", _("Confirm"), function () {
                _this.confirmDiscard();
            });
            var button = dojo.byId("confirm-discard-button");
            dojo.addClass(button, "incal-button");
            dojo.addClass(button, "incal-button-disabled");
        }
    };
    PassTurn.prototype.confirmDiscard = function () {
        var selectedCard = dojo.query(".incal-card-selected");
        if (selectedCard.length === 0) {
            return;
        }
        var cardId = selectedCard[0].id.split("-")[1];
        this.resetUX();
        this.game.ajaxcallwrapper("discardCard", {
            cardId: cardId,
        });
    };
    PassTurn.prototype.createCardAction = function (card) {
        var _this = this;
        var cardId = card.id;
        var cardDivId = "card-" + cardId;
        dojo.addClass(cardDivId, "incal-clickable");
        this.connections[cardId] = dojo.connect(dojo.byId(cardDivId), "onclick", function () {
            _this.selectCard(cardId);
        });
    };
    PassTurn.prototype.disableDamageCard = function (card) {
        var cardId = card.id;
        dojo.addClass("card-wrapper-" + cardId, "incal-card-disabled");
    };
    PassTurn.prototype.selectCard = function (cardId) {
        var cardDivId = "card-" + cardId;
        var cardDiv = dojo.byId(cardDivId);
        if (dojo.hasClass(cardDiv, "incal-card-selected")) {
            return;
        }
        var previouslySelectedCard = dojo.query(".incal-card-selected");
        if (previouslySelectedCard.length > 0) {
            dojo.removeClass(previouslySelectedCard[0], "incal-card-selected");
        }
        dojo.addClass(cardDiv, "incal-card-selected");
        dojo.removeClass("confirm-discard-button", "incal-button-disabled");
    };
    PassTurn.prototype.resetUX = function () {
        for (var cardId in this.connections) {
            dojo.disconnect(this.connections[cardId]);
        }
        this.connections = {};
        var selectedCard = dojo.query(".incal-card-selected");
        if (selectedCard.length > 0) {
            dojo.removeClass(selectedCard[0], "incal-card-selected");
        }
        var confirmButton = dojo.byId("confirm-discard-button");
        if (confirmButton !== null) {
            dojo.addClass("confirm-discard-button", "incal-button-disabled");
        }
        var disableDamageCards = dojo.query(".incal-card-disabled");
        for (var _i = 0, disableDamageCards_1 = disableDamageCards; _i < disableDamageCards_1.length; _i++) {
            var card = disableDamageCards_1[_i];
            dojo.removeClass(card, "incal-card-disabled");
        }
        dojo.query(".incal-clickable").forEach(function (node) {
            dojo.removeClass(node, "incal-clickable");
        });
    };
    return PassTurn;
}());
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * PlayerTurn.ts
 *
 * Incal Infinite player turn state
 *
 */
var PlayerTurn = /** @class */ (function () {
    function PlayerTurn(game) {
        this.id = 10;
        this.name = "playerTurn";
        this.game = game;
        this.connections = {};
    }
    PlayerTurn.prototype.onEnteringState = function (stateArgs) {
        if (stateArgs.isCurrentPlayerActive) {
            // Get all location tiles
            var locationTiles = dojo.query(".locationtile");
            for (var key in locationTiles) {
                var locationTile = locationTiles[key];
                if (locationTile.id && !this.enemyOnLocation(locationTile.id)) {
                    // Make tile clickable
                    dojo.addClass(locationTile, "incal-clickable");
                    // Add event listener for tile click
                    this.connections[locationTile.id] = dojo.connect(locationTile, "onclick", dojo.hitch(this, "selectLocation", locationTile.id));
                }
            }
        }
    };
    PlayerTurn.prototype.onLeavingState = function () {
        this.resetUX();
    };
    PlayerTurn.prototype.onUpdateActionButtons = function (stateArgs) {
        var _this = this;
        if (stateArgs.isCurrentPlayerActive) {
            // Create action button for Pass action
            gameui.addActionButton("pass-button", _("Pass"), function () {
                _this.pass();
            });
            dojo.addClass("pass-button", "incal-button");
            // Create action button for Transfiguration Ritual action
            gameui.addActionButton("transfiguration-ritual-button", _("Attempt Transfiguration Ritual"), function () {
                _this.transfigurationRitual();
            });
            dojo.addClass("transfiguration-ritual-button", "incal-button");
        }
    };
    PlayerTurn.prototype.enemyOnLocation = function (locationId) {
        // Check if enemy silhouette is on location
        var enemyDiv = dojo.query("#".concat(locationId, " #enemy"));
        return enemyDiv.length > 0;
    };
    PlayerTurn.prototype.pass = function () {
        this.resetUX();
        // Pass turn
        this.game.ajaxcallwrapper("pass", {});
    };
    PlayerTurn.prototype.resetUX = function () {
        // Remove clickable style from tiles
        dojo.query(".locationtile").removeClass("incal-clickable");
        // Remove event listeners
        for (var key in this.connections) {
            dojo.disconnect(this.connections[key]);
        }
        // Clear connections object
        this.connections = {};
    };
    /**
     * When a player selects a location tile trigger the action to move the ship to that location
     * @param locationId - The id of the location tile that was clicked
     */
    PlayerTurn.prototype.selectLocation = function (locationId) {
        this.resetUX();
        // Select location
        this.game.ajaxcallwrapper("moveMetaship", {
            location: locationId,
        });
    };
    PlayerTurn.prototype.transfigurationRitual = function () {
        this.resetUX();
        // Perform transfiguration ritual
        console.log("Performing transfiguration ritual");
    };
    return PlayerTurn;
}());
