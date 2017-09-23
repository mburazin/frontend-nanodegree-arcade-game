/**
 * @file Contains all the objects that can appear on the game board
 * @author Marko Burazin <marko.burazin1@gmail.com>
 */


/**
* Describes all the objects that can be drawed on the game board
* @class
* @param {string} sprite - image file of the collectible
* @param {number} locX - x coordinate in px where to draw the object
* @param {number} locY - y coordinate in px where to draw the object
*/
let DrawableObject = function(sprite, locX, locY) {
  this.sprite = sprite;

  // position of the whole image on the board
  this.x = locX;
  this.y = locY;
}

/**
 * Draws the object on the game board
 * @function render
 */
DrawableObject.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Sets/changes the object position/coordinates
 * @function setPosition
 * @param {number} x - new x coordinate in pixels
 * @param {number} y - new y coordinate in pixels
 */
DrawableObject.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
};


/**
 * Class describing a Collectible object (collectible by the player)
 * @class
 * @extends DrawableObject
 */
let Collectible = function() {

  // Actual object position and dimensions within the image sprite
  const _objectWithinImage = {
    "x": 0,
    "y": 60,
    "width": 101,
    "height": 105
  };

  /**
   * Creates a new Collectible object
   * @constructor
   * @param {string} sprite - image file of the collectible
   * @param {number} points - How many points the player earns by picking up
   *                          this collectible
   */
  let Collectible  = function(sprite, points) {
    // appears random on the street
    let x = getRandomInt(0, GameBoard.cols) * GameBoard.tileWidth,
        y = getRandomInt(1, GameBoard.rows-2) * GameBoard.tileHeight - 30;

    // score associated with collecting the object
    this.points = points;

    DrawableObject.call(this, sprite, x, y);
  };
  Collectible.prototype = Object.create(DrawableObject.prototype);
  Collectible.prototype.constructor = Collectible;

  /**
   * Get details on object positioning within the image file, like
   * x/y position, width/height
   * @function getOobjectWithinImage
   * @returns {Object} Collectible position within the image, including
   *                   including width and height
   */
  Collectible.prototype.getObjectWithinImage = function() {
    return _objectWithinImage;
  };

  return Collectible;
}();


/**
 * Creates a new Blue Gem collectible object
 * @class
 * @extends Collectible
 */
let BlueGem = function() {
  Collectible.call(this, 'images/Gem Blue.png', 1);
};
BlueGem.prototype = Object.create(Collectible.prototype);
BlueGem.prototype.constructor = BlueGem;

/**
 * Creates a new Green Gem collectible object
 * @class
 * @extends Collectible
 */
let GreenGem = function() {
  Collectible.call(this, 'images/Gem Green.png', 2);
};
GreenGem.prototype = Object.create(Collectible.prototype);
GreenGem.prototype.constructor = GreenGem;

/**
 * Creates a new Orange Gem collectible object
 * @class
 */
let OrangeGem = function() {
  Collectible.call(this, 'images/Gem Orange.png', 3);
};
OrangeGem.prototype = Object.create(Collectible.prototype);
OrangeGem.prototype.constructor = OrangeGem;

/**
 * Class describing the Enemy object
 * @class
 * @extends DrawableObject
 */
let Enemy = function() {
  /* Private members */
  // Enemy position and dimensions within the image sprite
  const _enemyWithinImage = {
    "x": 0,
    "y": 80,
    "width": 101,
    "height": 66
  };

  // offset needed to position enemy correctly within the tile
  const _ENEMY_TILE_Y_OFFSET = -25;

  /**
   * Creates a new Enemy.
   * @constructor
   * @param {GameBoard} GameBoard - This enemy will be placed on a game board
   */
  let Enemy = function(GameBoard) {
      this.speed = getRandomInt(150, 600); // px/s
      this.gameBoard = GameBoard;

      // position enemies outside of board initially
      let locX = -500;
      let locY = getRandomInt(1, 3+1) * GameBoard.tileHeight + _ENEMY_TILE_Y_OFFSET;

      // call superclass constructor
      DrawableObject.call(this, 'images/enemy-bug.png', locX, locY);
  };
  Enemy.prototype = Object.create(DrawableObject.prototype);
  Enemy.prototype.constructor = Enemy;

  /**
   * Update the enemy's position, required method for game
   * @function update
   * @param {Number} dt - a time delta between ticks
   */
  Enemy.prototype.update = function(dt) {
      // You should multiply any movement by the dt parameter
      // which will ensure the game runs at the same speed for
      // all computers.
      // Makes sure the enemies loop around the game board and change street
      this.x += this.speed * dt;
      if (this.x > (this.gameBoard.cols * this.gameBoard.tileWidth + 500)) {
        this.x = -500;
        this.y = getRandomInt(1, 3+1) * GameBoard.tileHeight + _ENEMY_TILE_Y_OFFSET;
      }
  };

  /**
   * Get details on object positioning within the image file, like
   * x/y position, width/height
   * @function getOobjectWithinImage
   * @returns {Object} Enemy position within the image, including
   *                   including width and height
   */
  Enemy.prototype.getObjectWithinImage = function() {
    return _enemyWithinImage;
  };

  return Enemy;
}();


/**
 * Class describing the Player object
 * @class
 * @extends DrawableObject
 */
let Player = function() {
  /* Private members */
  // "that" is for accessing "this" in private methods
  let that;
  let _gameBoard;
  let _stepInPixels;
  let _nextStep = 'same';
  const _PLAYER_TILE_Y_OFFSET = -30; // position player in the center of surface
  let _initialPosition;
  let _onWinCallbacks = [];
  let _onLoseCallbacks = [];

  /* Player position and dimensions within the image sprite */
  const _playerWithinImage = {
    "x": 15,
    "y": 61 - _PLAYER_TILE_Y_OFFSET,
    "width": 101 - 15*2,
    "height": 80 + _PLAYER_TILE_Y_OFFSET
  };

  /**
   * Reset the enemy position to the middle bottom tile on the game board
   * @function update
   * @private
   */
  let _reset = function() {
    that.x = _initialPosition.x;
    that.y = _initialPosition.y;
    _nextStep = 'same';
  };

  /**
   * Creates a new Player.
   * @constructor
   * @param {GameBoard} GameBoard - This player will be placed on a game board
   */
  let Player = function(GameBoard) {
    that = this;

    _lives = 5;
    _gameBoard = GameBoard;
    _stepInPixels = {
      "left": {"x": -GameBoard.tileWidth, "y": 0},
      "up": {"x": 0, "y": -GameBoard.tileHeight},
      "right": {"x": GameBoard.tileWidth, "y": 0},
      "down": {"x": 0, "y": GameBoard.tileHeight},
      "same": {"x": 0, "y": 0}
    };
    _initialPosition = {
      "x": 2 * GameBoard.tileWidth, // 3rd column
      "y": 5 * GameBoard.tileHeight +  _PLAYER_TILE_Y_OFFSET // 6th row
    };
    _nextStep = 'same';
    DrawableObject.call(this, 'images/char-boy.png', _initialPosition.x, _initialPosition.y);
  };
  Player.prototype = Object.create(DrawableObject.prototype);
  Player.prototype.constructor = Player;

  /**
   * Update the player position if it changed (called every frame)
   * @function update
   */
  Player.prototype.update = function() {
    let newX = this.x;
    let newY = this.y;

    if (_stepInPixels.hasOwnProperty(_nextStep)) {
      newX += _stepInPixels[_nextStep].x;
      newY += _stepInPixels[_nextStep].y;
    }

    // update current position only if next step is inside the board
    if (_gameBoard.insideBoard(newX, newY - _PLAYER_TILE_Y_OFFSET)) {
      this.x = newX;
      this.y = newY;
    }
    _nextStep = 'same';

    // player wins (reaches water)
    if (this.y <= 0) {
      _onWinCallbacks.forEach(function(cb) { cb() });
      _reset();
    }
  };

  /**
   * Handle the key press so that the player can move
   * @function handleInput
   * @param {Number} keyPressed - describing which direction player should move
   */
  Player.prototype.handleInput = function(keyPressed) {
    _nextStep = keyPressed;
  };

  /**
   * Should be called by the main game engine if collision with the enemy occurs
   * @function kill
   */
  Player.prototype.kill = function() {
    // _reset the player position and decrease number of lives
    _reset();
    _lives--;
    if (_lives <= 0) {
      _onLoseCallbacks.forEach(function(cb) { cb() });
    }
  };

  /**
   * Get details on object positioning within the image file, like
   * x/y position, width/height
   * @function getOobjectWithinImage
   * @returns {Object} Player position within the image, including
   *                   including width and height
   */
  Player.prototype.getObjectWithinImage = function() {
    return _playerWithinImage;
  };

  /**
   * Add a callback to the stack which will be called when player wins
   * @function addOnWinCallback
   * @param {Object} callback - callback function
   */
  Player.prototype.addOnWinCallback = function(callback) {
    _onWinCallbacks.push(callback);
  }

  /**
   * Add a callback to the stack which will be called when player loses
   * @function addOnWinCallback
   * @param {Object} callback - callback function
   */
  Player.prototype.addOnLoseCallback = function(callback) {
    _onLoseCallbacks.push(callback);
  }

  // return Player constructor
  return Player;
}();
