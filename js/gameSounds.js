/**
 * @file Contains definition of global class containing game sound effects
 * @author Marko Burazin <marko.burazin1@gmail.com>
 */

(function() {

    let dieSound = new Audio('sounds/NFF-slam.wav');
    let winSound = new Audio('sounds/NFF-chromatic-rise.wav');
    let collectSound = new Audio('sounds/NFF-zing.wav');

    /**
     * Plays the sound of player collision with the enemy
     * @function die
     */
    function die() {
      dieSound.play();
    }

    /**
     * Plays the sound of player winning (reaching the water)
     * @function win
     */
    function win() {
      winSound.play();
    }

    /**
     * Plays the sound of player collecting the gem
     * @function collect
     */
    function collect() {
      collectSound.play();
    }

    window.GameSounds = {
      die: die,
      win: win,
      collect: collect
    };

})();
