var gameBoard = {
  /* game board is consisted of tiles (squares)
     which is a surface for objects to move on */
  // single tile dimensions in pixels
  "tileWidth": 101,
  "tileHeight": 83,

  // no of rows and cols
  "rows": 6,
  "cols": 5,

  // verifies if the position is inside the board
  insideBoard: function(x, y) {
    if (x >= this.cols * this.tileWidth || x < 0)
      return false;
    if (y >= this.rows * this.tileHeight || y < 0)
      return false;
    return true;
  }
};

var DrawableObject = function(sprite, locX, locY) {
  // The image/sprite for our enemies, this uses
  // a helper we've provided to easily load images
  this.sprite = sprite;
  this.x = locX;
  this.y = locY;
}

DrawableObject.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Enemies our player must avoid
var Enemy = function(locX, locY, speed) {
    this.speed = speed; // px/s
    // call superclass constructor
    DrawableObject.call(this, 'images/enemy-bug.png', locX, locY);
};

Enemy.prototype = Object.create(DrawableObject.prototype);
Enemy.prototype.constructor = Enemy;
// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
  /* Private members */
  // "that" is for accessing "this" in private methods
  var that;
  var _stepInPixels = {
    "left": {"x": -gameBoard.tileWidth, "y": 0},
    "up": {"x": 0, "y": -gameBoard.tileHeight},
    "right": {"x": gameBoard.tileWidth, "y": 0},
    "down": {"x": 0, "y": gameBoard.tileHeight},
    "same": {"x": 0, "y": 0}
  };
  var _nextStep = 'same';
  var _PLAYER_TILE_OFFSET = 30;
  var _initialPosition = {
    "x": 2 * gameBoard.tileWidth, // 3rd column
    "y": 5 * gameBoard.tileHeight -  _PLAYER_TILE_OFFSET // 6th row
  };

  /* Private methods */
  // reset moves the player back to the initial location
  var reset = function() {
    that.x = _initialPosition.x;
    that.y = _initialPosition.y;
    _nextStep = 'same';
  };

  // Constructor
  var Player = function() {
    that = this;
    _nextStep = 'same';
    DrawableObject.call(this, 'images/char-boy.png', _initialPosition.x, _initialPosition.y);
  };

  /* Public methods */
  Player.prototype = Object.create(Enemy.prototype);
  Player.prototype.constructor = Player;
  Player.prototype.update = function() {
    var newX = this.x;
    var newY = this.y;

    if (_stepInPixels.hasOwnProperty(_nextStep)) {
      newX += _stepInPixels[_nextStep].x;
      newY += _stepInPixels[_nextStep].y;
    }

    // update current position only if next step is inside the board
    if (gameBoard.insideBoard(newX, newY + _PLAYER_TILE_OFFSET)) {
      this.x = newX;
      this.y = newY;
    }
    _nextStep = 'same';

    if (this.y <= 0) {
      reset();
    }
  };
  Player.prototype.handleInput = function(keyPressed) {
    _nextStep = keyPressed;
  };

  // return Player constructor
  return Player;
}();

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
allEnemies[0] = new Enemy(0*101, 1*60, 83);
var player = new Player();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
