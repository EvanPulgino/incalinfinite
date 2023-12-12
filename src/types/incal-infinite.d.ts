/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * IncalInfinite implementation : © Evan Pulgino <evan.pulgino@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * incal-infinite.d.ts
 *
 */

declare class Card {
  id: number;
  location: string;
  locationArg: number;
  name: string;
  type: string;
  value: number;
}

declare class Enemy {
  id: number;
  key: string;
  location: number;
  name: string;
}

declare class IncalInfinitePlayer {
  id: string;
  name: string;
  color: string;
  naturalOrder: string;
}

declare class LocationTile {
  id: number;
  incalChit: number;
  key: string;
  name: string;
  tileId: number;
  tilePosition: number;
}

declare class PowerChit {
  id: number;
  cssClass: string;
  key: string;
  name: string;
  available: number;
}
