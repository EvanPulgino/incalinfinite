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

  constructor() {
    super();

    this.cardController = new CardController(this);
    this.enemyController = new EnemyController(this);
    this.locationController = new LocationController(this);
    this.metashipController = new MetashipController(this);
  }

  /**
   * UI setup entry point
   *
   * @param {object} gamedata - current game data used to initialize UI
   */
  setup(gamedata: any) {
    super.setup(gamedata);
    this.locationController.setupLocations(gamedata.locations, gamedata.powers);
    this.metashipController.setupMetaship(gamedata.metashipLocation);
    this.enemyController.setupEnemy(gamedata.enemy);
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
  }

  /**
   * Handle 'message' notification
   *
   * @param {object} notif - notification data
   */
  notif_message(notif: any): void {}
}
