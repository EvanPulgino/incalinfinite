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
    /**
     * Get the unique values from an array
     *
     * @param value
     * @param index
     * @param array
     * @returns
     */
    GameBasics.prototype.onlyUnique = function (value, index, array) {
        return array.indexOf(value) === index;
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
        this.cardController.sortCrystalForest(gamedata.crystalForestPosition, gamedata.crystalForestCurrentValue);
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
        this.notifqueue.setSynchronous("discardCardFromOtherPlayer", 1000);
        this.notifqueue.setSynchronous("discardShuffled", 1000);
        this.notifqueue.setSynchronous("exploreLocation", 1000);
        this.notifqueue.setSynchronous("exploreLocationPrivate", 1000);
        this.notifqueue.setSynchronous("gainDamageFromEnemy", 1000);
        this.notifqueue.setSynchronous("gainDamageFromEnemyPrivate", 1000);
        this.notifqueue.setSynchronous("moveEnemy", 1000);
        this.notifqueue.setSynchronous("moveMetaship", 1250);
        this.notifqueue.setIgnoreNotificationCheck("cardDrawn", function (notif) {
            return notif.args.player_id == gameui.player_id;
        });
        this.notifqueue.setIgnoreNotificationCheck("exploreLocation", function (notif) {
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
    GameBody.prototype.notif_discardCardFromOtherPlayer = function (notif) {
        this.cardController.discardCard(notif.args.card, notif.args.player_id2);
        this.playerController.decrementHandCount(notif.args.player_id2);
    };
    GameBody.prototype.notif_discardShuffled = function (notif) {
        this.cardController.shuffleDiscardIntoDeck(notif.args.cards);
    };
    GameBody.prototype.notif_exploreLocation = function (notif) {
        this.cardController.moveCardsToLocation(notif.args.player_id, notif.args.cards, notif.args.location);
        for (var i = 0; i < notif.args.cards.length; i++) {
            this.playerController.decrementHandCount(notif.args.player_id);
        }
    };
    GameBody.prototype.notif_exploreLocationPrivate = function (notif) {
        this.cardController.moveCardsToLocationActivePlayer(notif.args.cards, notif.args.location);
        for (var i = 0; i < notif.args.cards.length; i++) {
            this.playerController.decrementHandCount(notif.args.player_id);
        }
    };
    GameBody.prototype.notif_gainDamageFromEnemy = function (notif) {
        this.cardController.gainDamageFromEnemy(notif.args.card, notif.args.player_id);
        this.playerController.incrementHandCount(notif.args.player_id);
    };
    GameBody.prototype.notif_gainDamageFromEnemyPrivate = function (notif) {
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
        this.explore = new Explore(game);
        this.gameEnd = new GameEnd(game);
        this.gameSetup = new GameSetup(game);
        this.gorgoDiscard = new GorgoDiscard(game);
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
    CardController.prototype.sortCrystalForest = function (position, firstValue) {
        if (position) {
            var cards = dojo.query(".card", "card-container-" + position);
            var order = 1;
            var nextValue = firstValue;
            var nextCard = this.getCardWithValue(cards, firstValue);
            while (nextCard !== null) {
                nextCard.style.order = order.toString();
                order++;
                nextValue = nextValue == 5 ? 1 : nextValue + 1;
                nextCard = this.getCardWithValue(cards, nextValue);
            }
        }
    };
    CardController.prototype.getCardCssClass = function (card) {
        var cssClass = card.type;
        if (card.type !== "damage" && card.type !== "johndifool") {
            cssClass += "-" + card.value;
        }
        return cssClass;
    };
    CardController.prototype.getCardValue = function (cardElement) {
        var value = 0;
        cardElement.classList.forEach(function (className) {
            if (className !== "card" && className !== "johndifool") {
                value = parseInt(className.split("-")[1]);
            }
        });
        return value;
    };
    CardController.prototype.getCardWithValue = function (cards, value) {
        for (var _i = 0, cards_5 = cards; _i < cards_5.length; _i++) {
            var card = cards_5[_i];
            var cardValue = this.getCardValue(card);
            if (cardValue !== 0 && cardValue == value) {
                return card;
            }
        }
        return null;
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
    CardController.prototype.moveCardsToLocation = function (playerId, cards, location) {
        var cardContainer = "card-container-" + location.tilePosition;
        var _loop_1 = function (card) {
            var cardDivId = "card-" + card.id;
            var cardElement = dojo.byId(cardDivId);
            if (cardElement === null) {
                var cardDiv = '<div id="' +
                    cardDivId +
                    '" class="card ' +
                    this_1.getCardCssClass(card) +
                    '"></div>';
                this_1.ui.createHtml(cardDiv, "incal-player-panel-" + playerId);
            }
            else {
                dojo.place(cardDivId, "incal-player-panel-" + playerId);
            }
            var animation = this_1.ui.slideToObject(cardDivId, cardContainer, 250);
            dojo.connect(animation, "onEnd", function () {
                dojo.removeAttr(cardDivId, "style");
                dojo.place(cardDivId, cardContainer);
            });
            animation.play();
            var cardWrapper = dojo.byId("card-wrapper-" + card.id);
            dojo.destroy(cardWrapper);
        };
        var this_1 = this;
        for (var _i = 0, cards_6 = cards; _i < cards_6.length; _i++) {
            var card = cards_6[_i];
            _loop_1(card);
        }
    };
    CardController.prototype.moveCardsToLocationActivePlayer = function (cards, location) {
        var cardContainer = "card-container-" + location.tilePosition;
        var _loop_2 = function (card) {
            var cardDivId = "card-" + card.id;
            var cardElement = dojo.byId(cardDivId);
            dojo.place(cardElement, "player-hand");
            var animation = this_2.ui.slideToObject(cardDivId, cardContainer, 250);
            dojo.connect(animation, "onEnd", function () {
                dojo.removeAttr(cardElement, "style");
                dojo.place(cardDivId, cardContainer);
            });
            animation.play();
            var cardWrapper = dojo.byId("card-wrapper-" + card.id);
            dojo.destroy(cardWrapper);
        };
        var this_2 = this;
        for (var _i = 0, cards_7 = cards; _i < cards_7.length; _i++) {
            var card = cards_7[_i];
            _loop_2(card);
        }
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
 * Explore.ts
 *
 * Incal Infinite explore state
 *
 */
var Explore = /** @class */ (function () {
    function Explore(game) {
        this.id = 12;
        this.name = "explore";
        this.game = game;
        this.connections = {};
        this.characterPool = [
            "animah",
            "deepo",
            "kill",
            "metabaron",
            "solune",
            "tanatah",
        ];
        this.locationStatus = null;
        this.playerHand = [];
        this.selectedCharacter = "";
        this.playableCardCounts = [];
        this.crystalForestCurrentValue = 0;
    }
    Explore.prototype.onEnteringState = function (stateArgs) {
        if (stateArgs.isCurrentPlayerActive) {
            this.playerHand = stateArgs.args["playerHand"];
            this.locationStatus = stateArgs.args["locationStatus"];
            this.crystalForestInitialValue = parseInt(stateArgs.args["crystalForestCurrentValue"]);
            this.crystalForestCurrentValue = parseInt(stateArgs.args["crystalForestCurrentValue"]);
            for (var _i = 0, _a = this.playerHand; _i < _a.length; _i++) {
                var card = _a[_i];
                if (card.type === "damage") {
                    this.disableCard(card);
                }
            }
            this.enablePlayableCards(this.locationStatus, this.playerHand);
        }
    };
    Explore.prototype.onLeavingState = function () {
        this.resetUX();
    };
    Explore.prototype.onUpdateActionButtons = function (stateArgs) {
        var _this = this;
        if (stateArgs.isCurrentPlayerActive) {
            // Create action button for Confirm play cards action
            gameui.addActionButton("confirm-play-cards-button", _("Confirm"), function () {
                _this.confirmPlayCards();
            });
            var button = dojo.byId("confirm-play-cards-button");
            dojo.addClass(button, "incal-button");
            dojo.addClass(button, "incal-button-disabled");
        }
    };
    Explore.prototype.confirmPlayCards = function () {
        var selectedCards = dojo.query(".incal-card-selected");
        var cardIds = [];
        for (var _i = 0, selectedCards_1 = selectedCards; _i < selectedCards_1.length; _i++) {
            var card = selectedCards_1[_i];
            cardIds.push(card.id.split("-")[1]);
        }
        this.game.ajaxcallwrapper("exploreLocation", {
            cardIds: cardIds.join(","),
            tilePosition: this.locationStatus.location.tilePosition,
        });
        this.resetUX();
    };
    Explore.prototype.resetUX = function () {
        dojo.query(".incal-card-selected").forEach(function (card) {
            dojo.removeClass(card, "incal-card-selected");
        });
        dojo.query(".incal-clickable").forEach(function (card) {
            dojo.removeClass(card, "incal-clickable");
        });
        dojo.query(".incal-button").forEach(function (button) {
            dojo.addClass(button, "incal-button-disabled");
        });
        for (var connection in this.connections) {
            dojo.disconnect(this.connections[connection]);
        }
        this.connections = {};
        this.selectedCharacter = "";
        this.playableCardCounts = [];
    };
    /**
     * Create an action and highlight a card that can be played
     *
     * @param card
     */
    Explore.prototype.createCardAction = function (card) {
        var _this = this;
        var cardId = card.id;
        var cardDivId = "card-" + cardId;
        // If the card is already clickable, don't do anything
        if (dojo.hasClass(cardDivId, "incal-clickable")) {
            return;
        }
        dojo.addClass(cardDivId, "incal-clickable");
        if (this.connections[cardId] === undefined) {
            this.connections[cardId] = dojo.connect(dojo.byId(cardDivId), "onclick", function () {
                _this.selectCard(card);
            });
        }
    };
    /**
     * Disable a card so it cannot be played
     *
     * @param {Card} card
     */
    Explore.prototype.disableCard = function (card) {
        var cardId = card.id;
        dojo.removeClass(card, "incal-clickable");
        dojo.disconnect(this.connections[cardId]);
        delete this.connections[cardId];
    };
    /**
     * Handle selecting a card to play.
     *
     * If the card is already selected, deselect it.
     * If the card is not selected, select it.
     * If there are no selected cards, disable the confirm button
     * If there are selected cards, enable the confirm button
     *
     * @param {Card} card - The id of the card that was clicked
     */
    Explore.prototype.selectCard = function (card) {
        var _this = this;
        if (this.locationStatus.location.key === "crystalforest") {
            this.selectAtCrystalForest(card);
            return;
        }
        var cardDivId = "card-" + card.id;
        var cardDiv = dojo.byId(cardDivId);
        if (dojo.hasClass(cardDiv, "incal-card-selected")) {
            dojo.query(".incal-clickable").forEach(function (card) {
                dojo.removeClass(card, "incal-card-selected");
                _this.disableCard(card);
            });
            this.playableCardCounts = [];
            this.enablePlayableCards(this.locationStatus, this.playerHand);
            dojo.addClass("confirm-play-cards-button", "incal-button-disabled");
        }
        else {
            dojo.addClass(cardDiv, "incal-card-selected");
            if (card.type !== "johndifool") {
                // If the card is not John Difool, set the selected character to the card type and remove one from the playable count
                this.selectedCharacter = card.type;
                this.playableCardCounts[card.type] -= 1;
            }
            else {
                // If John Difool is selected, don't set the selected character and remove one from the playable count of each character
                for (var characterKey in this.characterPool) {
                    this.playableCardCounts[this.characterPool[characterKey]] -= 1;
                }
            }
            this.disableCharacters();
        }
        console.log(this.playableCardCounts.length);
        // if (this.playableCardCounts.length > 0) {
        var selectedCards = dojo.query(".incal-card-selected");
        console.log(selectedCards);
        if (selectedCards.length > 0) {
            dojo.removeClass("confirm-play-cards-button", "incal-button-disabled");
        }
        else {
            if (card.type === "johndifool") {
                for (var characterKey in this.characterPool) {
                    this.playableCardCounts[this.characterPool[characterKey]] += 1;
                }
            }
            else {
                this.playableCardCounts[card.type] += 1;
                this.selectedCharacter = "";
            }
            dojo.addClass("confirm-play-cards-button", "incal-button-disabled");
        }
        // }
    };
    Explore.prototype.selectAtCrystalForest = function (card) {
        var _this = this;
        var cardDivId = "card-" + card.id;
        var cardDiv = dojo.byId(cardDivId);
        if (dojo.hasClass(cardDiv, "incal-card-selected")) {
            dojo.query(".incal-clickable").forEach(function (card) {
                dojo.removeClass(card, "incal-card-selected");
                _this.disableCard(card);
            });
            this.crystalForestCurrentValue = this.crystalForestInitialValue;
            this.enablePlayableCards(this.locationStatus, this.playerHand);
            dojo.addClass("confirm-play-cards-button", "incal-button-disabled");
        }
        else {
            dojo.addClass(cardDiv, "incal-card-selected");
            // Bump the current value of the Crystal Forest
            if (this.crystalForestCurrentValue === 5) {
                this.crystalForestCurrentValue = 1;
            }
            else {
                this.crystalForestCurrentValue += 1;
            }
            if (card.type !== "johndifool") {
                // If the card is not John Difool, set the selected character to the card type
                this.selectedCharacter = card.type;
            }
            // Rerun enablePlaybleCards to check for cards next in the sequence
            this.enablePlayableCards(this.locationStatus, this.playerHand);
        }
        var selectedCards = dojo.query(".incal-card-selected");
        if (selectedCards.length > 0) {
            dojo.removeClass("confirm-play-cards-button", "incal-button-disabled");
        }
    };
    /**
     * Disable clickable cards that aren't playable anymore
     */
    Explore.prototype.disableCharacters = function () {
        var clickableCards = dojo.query(".incal-clickable");
        var selectedCards = dojo.query(".incal-card-selected");
        var selectedCardClasses = [];
        for (var _i = 0, selectedCards_2 = selectedCards; _i < selectedCards_2.length; _i++) {
            var card = selectedCards_2[_i];
            var cardClasses = card.className.split(" ");
            for (var _a = 0, cardClasses_1 = cardClasses; _a < cardClasses_1.length; _a++) {
                var cardClass = cardClasses_1[_a];
                if (cardClass !== "incal-card-selected" ||
                    cardClass !== "card" ||
                    cardClass !== "incal-clickable" ||
                    cardClass !== "incal-card-disabled") {
                    selectedCardClasses.push(cardClass);
                }
            }
        }
        var validCardClasses = [];
        validCardClasses.push("johndifool");
        // If no selected character, John Difool was clicked, a card is valid if there is room for it to be played
        if (this.selectedCharacter === "") {
            for (var characterKey in this.characterPool) {
                var character = this.characterPool[characterKey];
                for (var i = 1; i < 6; i++) {
                    var cardClass = character + "-" + i;
                    if (this.playableCardCounts[character] > 0) {
                        validCardClasses.push(cardClass);
                    }
                }
            }
        }
        else {
            for (var i = 1; i < 6; i++) {
                var cardClass = this.selectedCharacter + "-" + i;
                if (selectedCardClasses.includes(cardClass)) {
                    validCardClasses.push(cardClass);
                }
                else if (this.playableCardCounts[this.selectedCharacter] > 0) {
                    validCardClasses.push(cardClass);
                }
            }
        }
        for (var _b = 0, clickableCards_1 = clickableCards; _b < clickableCards_1.length; _b++) {
            var card = clickableCards_1[_b];
            var cardClasses = card.className.split(" ");
            var intersection = cardClasses.filter(function (value) {
                return validCardClasses.includes(value);
            });
            if (intersection.length === 0) {
                var cardId = card.id.split("-")[1];
                dojo.removeClass(card, "incal-clickable");
                dojo.disconnect(this.connections[cardId]);
                delete this.connections[cardId];
            }
        }
    };
    /**
     * Get all the cards which are playable at a loction and enable them
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     */
    Explore.prototype.enablePlayableCards = function (locationStatus, playerHand) {
        var locationKey = locationStatus.location.key;
        var hand = this.removeDamageFromHand(playerHand);
        switch (locationKey) {
            case "acidlake":
                this.enablePlayableCardsForAcidLake(locationStatus, hand);
                break;
            case "aquaend":
                this.getPlayableCardsForAquaend(locationStatus, hand);
                break;
            case "centralcalculator":
                this.getPlayableCardsForCentralCalculator(locationStatus, hand);
                break;
            case "crystalforest":
                this.getPlayableCardsForCrystalForest(locationStatus, hand);
                break;
            case "ourgargan":
                this.getPlayableCardsForOurgargan(locationStatus, hand);
                break;
            case "psychoratsdump":
                this.getPlayableCardsForPsychoratsDump(locationStatus, hand);
                break;
            case "suicidealley":
                this.getPlayableCardsForSuicideAlley(locationStatus, hand);
                break;
            case "technocity":
                this.getPlayableCardsForTechnoCity(locationStatus, hand);
                break;
            case "undergroundriver":
                this.getPlayableCardsForUndergroundRiver(locationStatus, hand);
                break;
        }
    };
    /**
     * Get all the cards which are playable at Acid Lake and enable them
     *
     * Acid Lake can contain 2 sets of different characters, each set can contain 3 characters
     * A player cannot explore Acid Lake if:
     *  - Both character types are set and the player does not have a character that is not present on Acid Lake
     *  - One character set is at max count and the player does not have a different character in their hand
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     */
    Explore.prototype.enablePlayableCardsForAcidLake = function (locationStatus, hand) {
        if (this.playableCardCounts.length === 0) {
            // Get the characters on Acid Lake
            var characterCards = [];
            for (var key in locationStatus.cards) {
                characterCards.push(locationStatus.cards[key].type);
            }
            var characters = characterCards.filter(this.game.onlyUnique);
            var playableCharacterCounts = [];
            // For each character already on Acid Lake, get the number of cards that can still be played
            for (var characterKey in characters) {
                var character = characters[characterKey];
                var count = characterCards.filter(function (card) { return card === character; }).length;
                playableCharacterCounts[character] = 3 - count;
            }
            // Both character types are not set, so add max of all other characters
            if (playableCharacterCounts.length < 2) {
                for (var characterKey in this.characterPool) {
                    var characterFromPool = this.characterPool[characterKey];
                    if (characters.indexOf(characterFromPool) === -1) {
                        playableCharacterCounts[characterFromPool] = 3;
                    }
                }
            }
            // John Difool is always playable
            playableCharacterCounts["johndifool"] = 1;
            // Set the playable card counts so we handle unenabling/reenabling them later
            this.playableCardCounts = playableCharacterCounts;
        }
        // Enable the cards that can be played
        for (var handKey in hand) {
            var cardInHand = hand[handKey];
            if (this.playableCardCounts[cardInHand.type] > 0) {
                this.createCardAction(cardInHand);
            }
        }
    };
    /**
     * Get all the cards which are playable at Aquaend.
     *
     * Aquaend can contain 2 sets of different characters, each set can contain 2 characters
     * A player cannot explore Aquaend if:
     *  - Both character types are set and the player does not have a character that is not present on Aquaend
     *  - One character set is at max count and the player does not have a different character in their hand
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     */
    Explore.prototype.getPlayableCardsForAquaend = function (locationStatus, hand) {
        if (this.playableCardCounts.length === 0) {
            // Get the characters on Aquaend
            var characterCards = [];
            for (var key in locationStatus.cards) {
                characterCards.push(locationStatus.cards[key].type);
            }
            var characters = characterCards.filter(this.game.onlyUnique);
            var playableCharacterCounts = [];
            // For each character already on Aquaend, get the number of cards that can still be played
            for (var characterKey in characters) {
                var character = characters[characterKey];
                var count = characterCards.filter(function (card) { return card === character; }).length;
                playableCharacterCounts[character] = 2 - count;
            }
            // Both character types are not set, so add max of all other characters
            if (playableCharacterCounts.length < 2) {
                for (var characterKey in this.characterPool) {
                    var characterFromPool = this.characterPool[characterKey];
                    if (characters.indexOf(characterFromPool) === -1) {
                        playableCharacterCounts[characterFromPool] = 2;
                    }
                }
            }
            // John Difool is always playable
            playableCharacterCounts["johndifool"] = 1;
            // Set the playable card counts so we handle unenabling/reenabling them later
            this.playableCardCounts = playableCharacterCounts;
        }
        // Enable the cards that can be played
        for (var handKey in hand) {
            var cardInHand = hand[handKey];
            if (this.playableCardCounts[cardInHand.type] > 0) {
                this.createCardAction(cardInHand);
            }
        }
    };
    /**
     * Get all the cards which are playable at The Central Computer.
     *
     * The Central Computer can contain 1 set of characters with a max of 4 cards
     * A player cannot explore The Central Computer if:
     *  - They do not have a character that is not present on The Central Computer
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     */
    Explore.prototype.getPlayableCardsForCentralCalculator = function (locationStatus, hand) {
        if (this.playableCardCounts.length === 0) {
            // Get the characters on The Central Computer
            var characterCards = [];
            for (var key in locationStatus.cards) {
                characterCards.push(locationStatus.cards[key].type);
            }
            var characters = characterCards.filter(this.game.onlyUnique);
            var playableCharacterCounts = [];
            // For each character already on The Central Computer, get the number of cards that can still be played
            for (var characterKey in characters) {
                var character = characters[characterKey];
                var count = characterCards.filter(function (card) { return card === character; }).length;
                playableCharacterCounts[character] = 4 - count;
            }
            // If no characters are set, add max of all characters
            // This shouldn't happen, but just in case
            if (characters.length === 0) {
                for (var characterKey in this.characterPool) {
                    var characterFromPool = this.characterPool[characterKey];
                    playableCharacterCounts[characterFromPool] = 4;
                }
            }
            // John Difool is always playable
            playableCharacterCounts["johndifool"] = 1;
            // Set the playable card counts so we handle unenabling/reenabling them later
            this.playableCardCounts = playableCharacterCounts;
        }
        // Enable the cards that can be played
        for (var handKey in hand) {
            var cardInHand = hand[handKey];
            if (this.playableCardCounts[cardInHand.type] > 0) {
                this.createCardAction(cardInHand);
            }
        }
    };
    /**
     * Get the cards which are playable at Crystal Forest.
     *
     * Crystal Forest contains an ascending sequence of cards from 1 to 5. 5 wraps back to 1.
     * A player cannot explore Crystal Forest if:
     *  - They do not have a character with a value that is next in the sequence from the current value
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     */
    Explore.prototype.getPlayableCardsForCrystalForest = function (locationStatus, hand) {
        var nextValue = this.crystalForestCurrentValue === 5
            ? 1
            : this.crystalForestCurrentValue + 1;
        var playableCharacterCounts = [];
        // Add one of all characters for the time being
        for (var characterKey in this.characterPool) {
            var characterFromPool = this.characterPool[characterKey];
            playableCharacterCounts[characterFromPool] = 1;
        }
        // John Difool is always playable
        playableCharacterCounts["johndifool"] = 1;
        // Set the playable card counts so we handle unenabling/reenabling them later
        this.playableCardCounts = playableCharacterCounts;
        // Enable the cards that can be played
        for (var handKey in hand) {
            var cardInHand = hand[handKey];
            if (this.selectedCharacter !== "") {
                if (this.selectedCharacter === cardInHand.type &&
                    cardInHand.value === nextValue) {
                    this.createCardAction(cardInHand);
                }
            }
            else {
                if (playableCharacterCounts[cardInHand.type] > 0 &&
                    (cardInHand.value === nextValue || cardInHand.type === "johndifool")) {
                    this.createCardAction(cardInHand);
                }
            }
        }
    };
    /**
     * Get all the cards which are playable at Orgargan
     *
     * Cards at Orgargan is always playable as long as total valie is less than 11
     * A player cannot explore Psychorats Dump if:
     *  - The total value of cards on Orgargan is 11 or more (if we get to this point, we know the total value is less than 11)
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     */
    Explore.prototype.getPlayableCardsForOurgargan = function (locationStatus, hand) {
        if (this.playableCardCounts.length === 0) {
            var playableCharacterCounts = [];
            // Add max of all characters (using handsize as max value)
            for (var characterKey in this.characterPool) {
                var characterFromPool = this.characterPool[characterKey];
                playableCharacterCounts[characterFromPool] = 4;
            }
            // John Difool is always playable
            playableCharacterCounts["johndifool"] = 1;
            // Set the playable card counts so we handle unenabling/reenabling them later
            this.playableCardCounts = playableCharacterCounts;
        }
        // Enable the cards that can be played
        for (var handKey in hand) {
            var cardInHand = hand[handKey];
            if (this.playableCardCounts[cardInHand.type] > 0) {
                this.createCardAction(cardInHand);
            }
        }
    };
    /**
     * Get all the cards which are playable at Psychorats Dump.
     *
     * Psychorats can contain 1 max card of each character type
     * A player cannot explore Psychorats Dump if:
     *  - All cards in the player's hand are already on Psychorats Dump
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     */
    Explore.prototype.getPlayableCardsForPsychoratsDump = function (locationStatus, hand) {
        if (this.playableCardCounts.length === 0) {
            // Get the characters on Psychorats Dump
            var characterCards = [];
            for (var key in locationStatus.cards) {
                characterCards.push(locationStatus.cards[key].type);
            }
            var characters = characterCards.filter(this.game.onlyUnique);
            var playableCharacterCounts = [];
            // For each character not on Psychorats Dump, get the number of cards that can still be played
            for (var characterKey in this.characterPool) {
                if (characters.indexOf(this.characterPool[characterKey]) === -1) {
                    playableCharacterCounts[this.characterPool[characterKey]] = 1;
                }
            }
            // John Difool is always playable
            playableCharacterCounts["johndifool"] = 1;
            // Set the playable card counts so we handle unenabling/reenabling them later
            this.playableCardCounts = playableCharacterCounts;
        }
        // Enable the cards that can be played
        for (var handKey in hand) {
            var cardInHand = hand[handKey];
            if (this.playableCardCounts[cardInHand.type] > 0) {
                this.createCardAction(cardInHand);
            }
        }
    };
    /**
     * Get all the cards which are playable at TechnoCity and enable them
     *
     * Suicide Alley can accept any characters and is always possible to playcards
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     */
    Explore.prototype.getPlayableCardsForSuicideAlley = function (locationStatus, hand) {
        var playableCharacterCounts = [];
        // Add max of all characters (using handsize as max value)
        for (var characterKey in this.characterPool) {
            var characterFromPool = this.characterPool[characterKey];
            playableCharacterCounts[characterFromPool] = 4;
        }
        // John Difool is always playable
        playableCharacterCounts["johndifool"] = 1;
        // Set the playable card counts so we handle unenabling/reenabling them later
        this.playableCardCounts = playableCharacterCounts;
        // Enable the cards that can be played
        for (var handKey in hand) {
            var cardInHand = hand[handKey];
            if (playableCharacterCounts[cardInHand.type] > 0) {
                this.createCardAction(cardInHand);
            }
        }
    };
    /**
     * Get all the cards which are playable at TechnoCity and enable them
     *
     * TechnoCity can contain 2 sets of different characters, one set can have 3 cards and the other 2 cards
     * A player cannot explore TechnoCity if:
     *  - Both character types are set and the player does not have a character that is not present on Acid Lake
     *  - One character set is at max count and the player does not have a different playable character in their hand
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     */
    Explore.prototype.getPlayableCardsForTechnoCity = function (locationStatus, hand) {
        if (this.playableCardCounts.length === 0) {
            // Get the characters on TechnoCity
            var characterCards = [];
            for (var key in locationStatus.cards) {
                characterCards.push(locationStatus.cards[key].type);
            }
            var characters = characterCards.filter(this.game.onlyUnique);
            var playableCharacterCounts = [];
            var setOfThreeExists = false;
            // Check if a set of 3 characters already exists
            for (var characterKey in characters) {
                var character = characters[characterKey];
                var count = characterCards.filter(function (card) { return card === character; }).length;
                if (count === 3) {
                    setOfThreeExists = true;
                }
            }
            // For each character already on TechnoCity, get the number of cards that can still be played
            for (var characterKey in characters) {
                var character = characters[characterKey];
                var count = characterCards.filter(function (card) { return card === character; }).length;
                if (setOfThreeExists) {
                    playableCharacterCounts[character] = 2 - count;
                }
                else {
                    playableCharacterCounts[character] = 3 - count;
                }
            }
            // Both character types are not set, so add max of all other characters
            if (playableCharacterCounts.length < 2) {
                for (var characterKey in this.characterPool) {
                    var characterFromPool = this.characterPool[characterKey];
                    if (characters.indexOf(characterFromPool) === -1) {
                        if (setOfThreeExists) {
                            playableCharacterCounts[characterFromPool] = 2;
                        }
                        else {
                            playableCharacterCounts[characterFromPool] = 3;
                        }
                    }
                }
            }
            // John Difool is always playable
            playableCharacterCounts["johndifool"] = 1;
            // Set the playable card counts so we handle unenabling/reenabling them later
            this.playableCardCounts = playableCharacterCounts;
        }
        // Enable the cards that can be played
        for (var handKey in hand) {
            var cardInHand = hand[handKey];
            if (this.playableCardCounts[cardInHand.type] > 0) {
                this.createCardAction(cardInHand);
            }
        }
    };
    /**
     * Get all the cards which are playable at Underground River and enable them
     *
     * Underground River can contain any cards whose total adds up 8, 9, or 10
     * A player cannot explore TechnoCity if:
     *  - The total value of cards on Underground River is 8, 9, or 10 (if we get to this point, we know the total value is less than 8)
     *
     * Players are only allowed to play one card at Underground River so all cards are enabled
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     */
    Explore.prototype.getPlayableCardsForUndergroundRiver = function (locationStatus, hand) {
        if (this.playableCardCounts.length === 0) {
            var playableCharacterCounts = [];
            // Allow 1 of all characters
            for (var characterKey in this.characterPool) {
                var characterFromPool = this.characterPool[characterKey];
                playableCharacterCounts[characterFromPool] = 1;
            }
            // John Difool is always playable
            playableCharacterCounts["johndifool"] = 1;
            // Set the playable card counts so we handle unenabling/reenabling them later
            this.playableCardCounts = playableCharacterCounts;
        }
        // Enable the cards that can be played
        for (var handKey in hand) {
            var cardInHand = hand[handKey];
            if (this.playableCardCounts[cardInHand.type] > 0) {
                this.createCardAction(cardInHand);
            }
        }
    };
    Explore.prototype.removeDamageFromHand = function (hand) {
        return hand.filter(function (card) { return card.type !== "damage"; });
    };
    return Explore;
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
        this.name = "gameEnd";
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
        this.name = "gameSetup";
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
 * GorgoDiscard.ts
 *
 * Incal Infinite gorgo discard state
 *
 */
var GorgoDiscard = /** @class */ (function () {
    function GorgoDiscard(game) {
        this.id = 11;
        this.name = "gorgoDiscard";
        this.game = game;
    }
    GorgoDiscard.prototype.onEnteringState = function (stateArgs) { };
    GorgoDiscard.prototype.onLeavingState = function () { };
    GorgoDiscard.prototype.onUpdateActionButtons = function (stateArgs) {
        var _this = this;
        if (stateArgs.isCurrentPlayerActive) {
            var otherPlayers = stateArgs.args["otherPlayers"];
            // Add action button for each player
            for (var key in otherPlayers) {
                var player = otherPlayers[key];
                gameui.addActionButton("discard-button-" + player.id, _(player.name), function (event) {
                    _this.discard(event);
                });
                dojo.addClass("discard-button-" + player.id, "incal-button");
                dojo.addClass("discard-button-" + player.id, "incal-button-" + player.color);
            }
        }
    };
    GorgoDiscard.prototype.discard = function (event) {
        var target = event.target;
        var playerId = target.id.split("-")[2];
        this.game.ajaxcallwrapper("selectPlayer", {
            playerId: playerId,
        });
    };
    return GorgoDiscard;
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
        this.id = 13;
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
            var charactersInHand = this.removeDamageFromHand(stateArgs.args["playerHand"]);
            for (var key in locationTiles) {
                var locationTile = locationTiles[key];
                var locationStatus = this.getMatchingLocationStatus(locationTile.id, stateArgs.args["locationsStatus"]);
                if (locationTile.id &&
                    !this.enemyOnLocation(locationTile.id) &&
                    !this.enemyWillMoveToShipLocation(locationTile.id) &&
                    this.playerCanExploreLocation(locationTile.id, locationStatus, charactersInHand)) {
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
    PlayerTurn.prototype.enemyWillMoveToShipLocation = function (locationId) {
        var metaShip = dojo.query("#metaship");
        var metaShipLocation = metaShip[0].parentNode.parentNode.id;
        if (metaShipLocation === locationId) {
            var metaShipPosition = parseInt(metaShip[0].parentNode.id.split("-")[2]);
            var enemyPosition = parseInt(dojo.query("#enemy")[0].parentNode.id.split("-")[2]);
            if (enemyPosition === 0 || metaShipPosition === 10) {
                return true;
            }
            if (enemyPosition - 2 === metaShipPosition) {
                return true;
            }
        }
        return false;
    };
    PlayerTurn.prototype.getMatchingLocationStatus = function (locationTileId, locationsStatus) {
        for (var key in locationsStatus) {
            if (locationsStatus[key].location.key === locationTileId) {
                return locationsStatus[key];
            }
        }
    };
    /**
     * Checks if a location is closed
     *
     * @param {string} locationTileId - The id of the location tile that was clicked
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param hand - The current player's hand with damage cards removed
     * @returns {boolean} - Whether the location is closed
     */
    PlayerTurn.prototype.isLocationClosed = function (locationTileId, locationStatus, hand) {
        // Check if location is closed
        if (locationTileId === "suicidealley") {
            // If player has John DiFool they can always explore Suicide Alley
            if (this.playerHasJohnDiFool(hand)) {
                return false;
            }
            return locationStatus.isClosed;
        }
    };
    PlayerTurn.prototype.pass = function () {
        this.resetUX();
        // Pass turn
        this.game.ajaxcallwrapper("pass", {});
    };
    /**
     * Checks if a player has at least one card that can be used to explore a location
     *
     * @param {string} locationTileId - The id of the location tile that was clicked
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     * @returns
     */
    PlayerTurn.prototype.playerCanExploreLocation = function (locationTileId, locationStatus, hand) {
        // Check if location is closed
        if (this.isLocationClosed(locationTileId, locationStatus, hand)) {
            return false;
        }
        // If location isn't closed, John Difool is always playable
        if (this.playerHasJohnDiFool(hand)) {
            return true;
        }
        // Check if player can explore location based on location tile id
        switch (locationTileId) {
            case "acidlake":
                return this.playerCanExploreAcidLake(locationStatus, hand);
            case "aquaend":
                return this.playerCanExploreAquaend(locationStatus, hand);
            case "centralcalculator":
                return this.playerCanExploreCentralCalculator(locationStatus, hand);
            case "crystalforest":
                return this.playerCanExploreCrystalForest(locationStatus, hand);
            case "psychoratsdump":
                return this.playerCanExplorePsychoratsDump(locationStatus, hand);
            case "technocity":
                return this.playerCanExploreTechnoCity(locationStatus, hand);
            default:
                return true;
        }
    };
    /**
     * Checks if a player has at least one card that can be used to explore Acid Lake
     * Acid Lake can contain 2 sets of different characters, each set can contain 3 characters
     * A player cannot explore Acid Lake if:
     *  - Both character types are set and the player does not have a character that is not present on Acid Lake
     *  - One character set is at max count and the player does not have a different character in their hand
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     * @returns {boolean} - Whether the player can explore Acid Lake
     */
    PlayerTurn.prototype.playerCanExploreAcidLake = function (locationStatus, hand) {
        // Get the characters on Acid Lake
        var characterCards = [];
        for (var key in locationStatus.cards) {
            characterCards.push(locationStatus.cards[key].type);
        }
        var characters = characterCards.filter(this.game.onlyUnique);
        // Both character types are not set yet, so player can start a new set
        if (characters.length < 2) {
            //If only one character is present...
            if (characters.length === 1) {
                // Get the count of the character
                var countOfCharacter = locationStatus.cards.filter(function (card) { return card.type === characters[0]; }).length;
                // If character is at max count...
                if (countOfCharacter === 3) {
                    // Check if a player has a different character in their hand
                    for (var key in hand) {
                        if (hand[key].type !== characters[0]) {
                            return true;
                        }
                    }
                    // If no different character is found, player cannot explore
                    return false;
                }
            }
            // Any character can be played
            return true;
        }
        // Get characters that are under the max of 3
        var charactersUnderMax = [];
        for (var characterKey in characters) {
            var character = characters[characterKey];
            var countOfCharacter = locationStatus.cards.filter(function (card) { return card.type === character; }).length;
            // If character is under max count it is playable
            if (countOfCharacter < 3) {
                charactersUnderMax.push(character);
            }
        }
        // Check if player has a card that can be used to explore Acid Lake
        for (var key in hand) {
            if (charactersUnderMax.includes(hand[key].type)) {
                return true;
            }
        }
        return false;
    };
    /**
     * Checks if a player has at least one card that can be used to explore Aquaend
     * Aquaend can contain 2 sets of different characters, each set can contain 2 characters
     * A player cannot explore Aquaend if:
     *  - Both character types are set and the player does not have a character that is not present on Aquaend
     *  - One character set is at max count and the player does not have a different character in their hand
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     * @returns {boolean} - Whether the player can explore Aquaend
     */
    PlayerTurn.prototype.playerCanExploreAquaend = function (locationStatus, hand) {
        // Get the characters on Aquaend
        var characterCards = [];
        for (var key in locationStatus.cards) {
            characterCards.push(locationStatus.cards[key].type);
        }
        var characters = characterCards.filter(this.game.onlyUnique);
        // Both character types are not set yet, so player can start a new set
        if (characters.length < 2) {
            //If only one character is present...
            if (characters.length === 1) {
                // Get the count of the character
                var countOfCharacter = locationStatus.cards.filter(function (card) { return card.type === characters[0]; }).length;
                // If character is at max count...
                if (countOfCharacter === 2) {
                    // Check if a player has a different character in their hand
                    for (var key in hand) {
                        if (hand[key].type !== characters[0]) {
                            return true;
                        }
                    }
                    // If no different character is found, player cannot explore
                    return false;
                }
            }
            // Any character can be played
            return true;
        }
        // Get characters that are under the max of 2
        var charactersUnderMax = [];
        for (var characterKey in characters) {
            var character = characters[characterKey];
            var countOfCharacter = locationStatus.cards.filter(function (card) { return card.type === character; }).length;
            // If character is under max count it is playable
            if (countOfCharacter < 2) {
                charactersUnderMax.push(character);
            }
        }
        // Check if player has a card that can be used to explore Acid Lake
        for (var key in hand) {
            if (charactersUnderMax.includes(hand[key].type)) {
                return true;
            }
        }
        return false;
    };
    /**
     * Checks if a player has at least one card that can be used to explore Central Calculator
     * Central Calculator can contain 1 character set with a max of 4 characters
     * A player cannot explore Central Calculator if:
     *  - The player does not have a character that is present on Central Calculator
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     * @returns {boolean} - Whether the player can explore Central Calculator
     */
    PlayerTurn.prototype.playerCanExploreCentralCalculator = function (locationStatus, hand) {
        // Get character on central calculator
        var character = locationStatus.cards[0].type;
        // If no character is set, player can start a new set
        if (!character) {
            return true;
        }
        // Check if player has a card that can be used to explore central calculator
        for (var key in hand) {
            if (hand[key].type === character) {
                return true;
            }
        }
        return false;
    };
    /**
     * Checks if a player has at least one card that can be used to explore Crystal Forest
     * In Crystal Forest cards must be player in ascending order of their value and 5 wraps around to 1
     * A player cannot explore Crystal Forest if:
     *  - The player does not have a character card of the next value in the sequence
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     * @returns {boolean} - Whether the player can explore Crystal Forest
     */
    PlayerTurn.prototype.playerCanExploreCrystalForest = function (locationStatus, hand) {
        // If no cards are set, player can start a new set
        if (locationStatus.cards.length === 0) {
            return true;
        }
        // Get the highest value on Crystal Forest
        var highestValue = 0;
        for (var key in locationStatus.cards) {
            if (locationStatus.cards[key].value > highestValue) {
                highestValue = locationStatus.cards[key].value;
            }
        }
        // Get the next value in the sequence
        var nextValue = 0;
        if (highestValue == 5) {
            nextValue = 1;
        }
        else {
            nextValue = highestValue + 1;
        }
        // Check if player has a card that can be used to explore Crystal Forest
        for (var key in hand) {
            if (hand[key].value === nextValue) {
                return true;
            }
        }
        return false;
    };
    /**
     * Checks if a player has at least one card that can be used to explore Psychorats Dump
     * Psychorats Dump can contain 5 unique characters
     * A player cannot explore Psychorats Dump if:
     *  - The player only has characters that are present on Psychorats Dump
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     * @returns {boolean} - Whether the player can explore Psychorats Dump
     */
    PlayerTurn.prototype.playerCanExplorePsychoratsDump = function (locationStatus, hand) {
        // Get the characters on Psychorats Dump
        var characterCards = [];
        for (var key in locationStatus.cards) {
            characterCards.push(locationStatus.cards[key].type);
        }
        var characters = characterCards.filter(this.game.onlyUnique);
        // Check if player has a character not present on Psychorats Dump
        for (var key in hand) {
            if (!characters.includes(hand[key].type)) {
                return true;
            }
        }
        return false;
    };
    /**
     * Checks if a player has at least one card that can be used to explore Techno City
     * Techno City can contain 2 sets of different characters, one set can contain 3 characters and the other can contain 2 characters
     * A player cannot explore Techno City if:
     *  - Both character types are set and the player does not have a character that is not present on Acid Lake
     *  - One character set at max count and the player does not have a different character in their hand
     *
     * @param {LocationStatus} locationStatus - The status of the location tile
     * @param {Card[]} hand - The current player's hand with damage cards removed
     * @returns {boolean} - Whether the player can explore Techno City
     */
    PlayerTurn.prototype.playerCanExploreTechnoCity = function (locationStatus, hand) {
        // Get the characters on Techno City
        var characterCards = [];
        for (var key in locationStatus.cards) {
            characterCards.push(locationStatus.cards[key].type);
        }
        var characters = characterCards.filter(this.game.onlyUnique);
        // Both character types are not set yet, so player can start a new set
        if (characters.length < 2) {
            //If only one character is present...
            if (characters.length === 1) {
                // Get the count of the character
                var countOfCharacter = locationStatus.cards.filter(function (card) { return card.type === characters[0]; }).length;
                // If character is at max count...
                if (countOfCharacter === 3) {
                    // Check if a player has a different character in their hand
                    for (var key in hand) {
                        if (hand[key].type !== characters[0]) {
                            return true;
                        }
                    }
                    // If no different character is found, player cannot explore
                    return false;
                }
            }
            // Any character can be played
            return true;
        }
        // Get characters that are under the max of 3
        var charactersUnderMax = [];
        for (var characterKey in characters) {
            var character = characters[characterKey];
            var countOfCharacter = locationStatus.cards.filter(function (card) { return card.type === character; }).length;
            // If character is under max count it is playable
            if (countOfCharacter < 3) {
                charactersUnderMax.push(character);
            }
        }
        // Check if player has a card that can be used to explore Acid Lake
        for (var key in hand) {
            if (charactersUnderMax.includes(hand[key].type)) {
                return true;
            }
        }
        return false;
    };
    PlayerTurn.prototype.playerHasJohnDiFool = function (hand) {
        for (var key in hand) {
            if (hand[key].type === "johndifool") {
                return true;
            }
        }
        return false;
    };
    PlayerTurn.prototype.removeDamageFromHand = function (hand) {
        return hand.filter(function (card) { return card.type !== "damage"; });
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
