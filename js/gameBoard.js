/**
 * @file gameBoard.js - Contains global object describing playable gaming area
 * @author Marko Burazin <marko.burazin1@gmail.com>
 */

var GameBoard = {
  /* game board is consisted of tiles (squares)
     which is a surface for objects to move on */

  // single tile dimensions in pixels
  "tileWidth": 101,
  "tileHeight": 83,

  // no of rows and cols
  "rows": 6,
  "cols": 5,

  // containers for enemies and players
  "enemies": [],
  "player": {},
  "collectibleItems": [],

  /**
   * Checks if collision occured between player and enemy
   * @function collisionOccured
   * @returns {boolean} true if collision occured, false otherwise
   */
  collisionOccured: function() {
    var collision = false;
    if (this.playerCollidedObject(this.enemies) != null)
      collision = true;

    return collision;
  },

  /**
   * Checks if player has collected the collectible item and return it if so
   * @function itemCollected
   * @returns {Collectible} Collectible object that player has collected
   * @description Returns the object player collected, null otherwise
   */
  itemCollected: function() {
    return this.playerCollidedObject(this.collectibleItems)
  },

  /* Returns the object player collided with, null otherwise */
  /**
   * Checks and returns the object player collided with
   * @function playerCollidedObject
   * @param {Object[]} otherObjects - array of object to check against
   * @returns {Object} Object that the player collided with, null if no
   * collision occured
   */
  playerCollidedObject: function(otherObjects) {
    var player = this.player;
    var collisionObject = null;

    // position of player within the image/tile
    var playerPosImg = player.getObjectWithinImage();
    var playerX = player.x + playerPosImg.x;
    var playerY = player.y + playerPosImg.y;

    otherObjects.forEach(function(item) {
      // position of collectible item within the image/tile
      var itemPosImg = item.getObjectWithinImage();
      var itemX = item.x + itemPosImg.x;
      var itemY = item.y + itemPosImg.y;

      if(itemX < playerX + playerPosImg.width &&
         itemX + itemPosImg.width > playerX &&
         itemY < playerY + playerPosImg.height &&
         itemY + itemPosImg.height > playerY ) {
           // item collected
           collisionObject = item;
         }
    });

    return collisionObject;
  },

  /**
   * Verifies if the specified position is inside the board
   * @function insideBoard
   * @param {number} x - x coordinate of the board in pixels
   * @param {number} y - y coordinate of the board in pixels
   * @returns {boolean} Given position is located inside the game board
   * @description This can be used, i.e. to check if player would drop out of
   * bounds of the playable gaming area by wanting to move to certain position
   */
  insideBoard: function(x, y) {
    if (x >= this.cols * this.tileWidth || x < 0)
      return false;
    if (y >= this.rows * this.tileHeight || y < 0)
      return false;
    return true;
  }
};
