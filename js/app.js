/**
 * @file Contains preparations for running the game
 * @author Marko Burazin <marko.burazin1@gmail.com>
 */

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
let allEnemies = [];
let i;
for (i=0; i<6; i++) {
  allEnemies[i] = new Enemy(GameBoard);
}
let player = new Player(GameBoard);
let collectibles = [
  BlueGem,
  GreenGem,
  OrangeGem
];


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    let allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
