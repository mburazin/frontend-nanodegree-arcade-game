// greater or equal to min and lower than (but not equal to) max
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

var gameBoard = {
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

  collisionOccured: function() {
    var collision = false;
    var player = this.player;

    // position of player within the image/tile
    var playerPosImg = player.getObjectWithinImage();
    var playerX = player.x + playerPosImg.x;
    var playerY = player.y + playerPosImg.y;

    this.enemies.forEach(function(enemy) {
      // position of enemy within the image/tile
      var enemyPosImg = enemy.getObjectWithinImage();
      var enemyX = enemy.x + enemyPosImg.x;
      var enemyY = enemy.y + enemyPosImg.y;

      if(enemyX < playerX + playerPosImg.width &&
         enemyX + enemyPosImg.width > playerX &&
         enemyY < playerY + playerPosImg.height &&
         enemyY + enemyPosImg.height > playerY ) {
           // collision detected
           collision = true;
         }
    });

    return collision;
  },

  itemCollected: function() {
    var player = this.player;
    var collectedItem = null;

    // position of player within the image/tile
    var playerPosImg = player.getObjectWithinImage();
    var playerX = player.x + playerPosImg.x;
    var playerY = player.y + playerPosImg.y;

    this.collectibleItems.forEach(function(item) {
      // position of collectible item within the image/tile
      var itemPosImg = item.getObjectWithinImage();
      var itemX = item.x + itemPosImg.x;
      var itemY = item.y + itemPosImg.y;

      if(itemX < playerX + playerPosImg.width &&
         itemX + itemPosImg.width > playerX &&
         itemY < playerY + playerPosImg.height &&
         itemY + itemPosImg.height > playerY ) {
           // item collected
           collectedItem = item;
         }
    });

    return collectedItem;
  },

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
  this.sprite = sprite;

  // position of the whole image on the board
  this.x = locX;
  this.y = locY;
}

DrawableObject.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

var Collectible = function() {

  /* Actual object position and dimensions within the image sprite */
  var _objectWithinImage = {
    "x": 0,
    "y": 55,
    "width": 101,
    "height": 105
  };

  // constructor
  var Collectible  = function(sprite, points) {
    // appears random on the street
    var x = getRandomInt(0, gameBoard.cols) * gameBoard.tileWidth,
        y = getRandomInt(1, gameBoard.rows-2) * gameBoard.tileHeight - 30;
    this.points = points;

    DrawableObject.call(this, sprite, x, y);
  };

  Collectible.prototype = Object.create(DrawableObject.prototype);
  Collectible.prototype.constructor = Collectible;
  Collectible.prototype.getObjectWithinImage = function() {
    return _objectWithinImage;
  };

  return Collectible;
}();


var BlueGem = function() {
  Collectible.call(this, 'images/Gem Blue.png', 1);
};

BlueGem.prototype = Object.create(Collectible.prototype);
BlueGem.prototype.constructor = BlueGem;

var GreenGem = function() {
  Collectible.call(this, 'images/Gem Green.png', 2);
};

GreenGem.prototype = Object.create(Collectible.prototype);
GreenGem.prototype.constructor = GreenGem;

var OrangeGem = function() {
  Collectible.call(this, 'images/Gem Orange.png', 3);
};

OrangeGem.prototype = Object.create(Collectible.prototype);
OrangeGem.prototype.constructor = OrangeGem;

var Enemy = function() {
  /* Private members */
  /* Enemy position and dimensions within the image sprite */
  var _enemyWithinImage = {
    "x": 0,
    "y": 80,
    "width": 101,
    "height": 66
  };

  var _ENEMY_TILE_Y_OFFSET = -25;

  // Constructor
  var Enemy = function(gameBoard) {
      this.speed = getRandomInt(150, 600); // px/s
      this.gameBoard = gameBoard;

      var locX = -500;
      var locY = getRandomInt(1, 3+1) * gameBoard.tileHeight + _ENEMY_TILE_Y_OFFSET;

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
      this.x = this.x > (this.gameBoard.rows * this.gameBoard.tileWidth + 500) ? -500 : this.x;
  };
  Enemy.prototype.getObjectWithinImage = function() {
    return _enemyWithinImage;
  };

  return Enemy;
}();

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
  /* Private members */
  // "that" is for accessing "this" in private methods
  var that;
  var _gameBoard;
  var _stepInPixels;
  var _nextStep = 'same';
  var _PLAYER_TILE_Y_OFFSET = -30; // position player in the center of surface
  var _initialPosition;
  var _onWinCallbacks = [];

  /* Player position and dimensions within the image sprite */
  var _playerWithinImage = {
    "x": 15,
    "y": 61 - _PLAYER_TILE_Y_OFFSET,
    "width": 101 - 15*2,
    "height": 80 + _PLAYER_TILE_Y_OFFSET
  };

  /* Private methods */
  // reset moves the player back to the initial location
  var reset = function() {
    that.x = _initialPosition.x;
    that.y = _initialPosition.y;
    _nextStep = 'same';
  };

  // Constructor
  var Player = function(gameBoard) {
    that = this;
    _gameBoard = gameBoard;
    _stepInPixels = {
      "left": {"x": -gameBoard.tileWidth, "y": 0},
      "up": {"x": 0, "y": -gameBoard.tileHeight},
      "right": {"x": gameBoard.tileWidth, "y": 0},
      "down": {"x": 0, "y": gameBoard.tileHeight},
      "same": {"x": 0, "y": 0}
    };
    _initialPosition = {
      "x": 2 * gameBoard.tileWidth, // 3rd column
      "y": 5 * gameBoard.tileHeight +  _PLAYER_TILE_Y_OFFSET // 6th row
    };
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
    if (_gameBoard.insideBoard(newX, newY - _PLAYER_TILE_Y_OFFSET)) {
      this.x = newX;
      this.y = newY;
    }
    _nextStep = 'same';

    // player wins (reaches water)
    if (this.y <= 0) {
      _onWinCallbacks.forEach(function(cb) { cb() });
      reset();
    }
  };
  Player.prototype.handleInput = function(keyPressed) {
    _nextStep = keyPressed;
  };

  // called by the engine if collision with Enemy occurs
  // player loses
  Player.prototype.kill = function() {
    reset();
  };

  Player.prototype.getObjectWithinImage = function() {
    return _playerWithinImage;
  };

  // Add a callback to the stack which will be called when player wins
  Player.prototype.onWin = function(callback) {
    _onWinCallbacks.push(callback);
  }

  // return Player constructor
  return Player;
}();

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
var i;
for (i=0; i<5; i++) {
  allEnemies[i] = new Enemy(gameBoard);
}
var player = new Player(gameBoard);
var collectibleItems = [];


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
