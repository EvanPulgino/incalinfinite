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

class EnemyController {
  ui: GameBody;

  constructor(ui: GameBody) {
    this.ui = ui;
  }

  setupEnemy(enemy: Enemy): void {
    const enemyDiv =
      '<div id="enemy" class="silhouette ' + enemy.key + '"></div>';

    if (enemy.key === "presidentshunchbacks") {
      this.ui.createHtml(enemyDiv, "enemy-container-" + enemy.location);
    } else {
      this.ui.createHtml(enemyDiv, "incal-space-" + enemy.location);
    }

    this.ui.addTooltipHtml("enemy", enemy.tooltip);
  }

  moveEnemy(position: number): void {
    const enemy = document.getElementById("enemy");
    const enemyType = enemy.classList[1];
    var destinationId = "";

    if (enemyType === "presidentshunchbacks") {
      destinationId = "enemy-container-" + position;
    } else {
      destinationId = "incal-space-" + position;
    }

    const animation = this.ui.slideToObject(enemy, destinationId, 500);

    dojo.connect(animation, "onEnd", () => {
      dojo.removeAttr(enemy, "style");
      dojo.place(enemy, destinationId);
    });

    animation.play();
  }
}
