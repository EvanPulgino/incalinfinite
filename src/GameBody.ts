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
class GameBody extends GameBasics {
  cardController: CardController;
  enemyController: EnemyController;
  locationController: LocationController;
  metashipController: MetashipController;
  playerController: PlayerController;

  constructor() {
    super();

    this.cardController = new CardController(this);
    this.enemyController = new EnemyController(this);
    this.locationController = new LocationController(this);
    this.metashipController = new MetashipController(this);
    this.playerController = new PlayerController(this);

    dojo.connect(
      window,
      "onresize",
      this,
      dojo.hitch(this, "adaptViewportSize")
    );
  }

  /**
   * UI setup entry point
   *
   * @param {object} gamedata - current game data used to initialize UI
   */
  setup(gamedata: any) {
    super.setup(gamedata);
    this.playerController.setupPlayerPanels(gamedata.incalInfinitePlayers);
    this.locationController.setupLocations(gamedata.locations, gamedata.powers);
    this.metashipController.setupMetaship(gamedata.metashipLocation);
    this.enemyController.setupEnemy(gamedata.enemy);
    this.cardController.setupDeck(gamedata.deck);
    this.cardController.setupDiscard(gamedata.discard);
    this.cardController.setupPlayerHand(gamedata.currentPlayerHand);
    this.cardController.setupLocationCards(gamedata.locationCards);
    this.setupNotifications();
  }

  /**
   * Setups and subscribes to notifications
   */
  setupNotifications(): void {
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

    this.notifqueue.setIgnoreNotificationCheck(
      "cardDrawn",
      function (notif: any) {
        return notif.args.player_id == gameui.player_id;
      }
    );

    this.notifqueue.setIgnoreNotificationCheck(
      "gainDamageFromEnemy",
      function (notif: any) {
        return notif.args.player_id == gameui.player_id;
      }
    );
  }

  /**
   * Handle 'message' notification
   *
   * @param {object} notif - notification data
   */
  notif_message(notif: any): void {}

  notif_addDamageToDiscard(notif: any): void {
    this.cardController.addDamageToDiscard(
      notif.args.card,
      notif.args.player_id
    );
  }

  notif_cardDrawn(notif: any): void {
    this.cardController.drawCard(notif.args.card, notif.args.player_id);
    this.playerController.incrementHandCount(notif.args.player_id);
  }

  notif_cardDrawnPrivate(notif: any): void {
    this.cardController.drawCardActivePlayer(notif.args.card);
    this.playerController.incrementHandCount(notif.args.player_id);
  }

  notif_discardCard(notif: any): void {
    this.cardController.discardCard(notif.args.card, notif.args.player_id);
    this.playerController.decrementHandCount(notif.args.player_id);
  }

  notif_discardShuffled(notif: any): void {
    this.cardController.shuffleDiscardIntoDeck(notif.args.cards);
  }

  notif_gainDamageFromEnemy(notif: any): void {
    console.log("gainDamageFromEnemy", notif.args.card, notif.args.player_id);
    this.cardController.gainDamageFromEnemy(
      notif.args.card,
      notif.args.player_id
    );
    this.playerController.incrementHandCount(notif.args.player_id);
  }

  notif_gainDamageFromEnemyPrivate(notif: any): void {
    console.log("gainDamageFromEnemyPrivate", notif.args.card, notif.args.player_id);
    this.cardController.gainDamageFromEnemyActivePlayer(
      notif.args.card,
      notif.args.player_id
    );
    this.playerController.incrementHandCount(notif.args.player_id);
  }

  notif_moveEnemy(notif: any): void {
    this.enemyController.moveEnemy(notif.args.destinationPosition);
  }

  notif_moveMetaship(notif: any): void {
    this.metashipController.moveMetaship(
      notif.args.newLocationPosition,
      notif.args.lastStep
    );
  }
}
