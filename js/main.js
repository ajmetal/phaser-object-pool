/**
 * main.js
 * @author Johannes Spaulding
 * This game is intended to be an example how one can use dat.gui to change settings in a phaser game.
 */

var game = new Phaser.Game(512, 288, Phaser.CANVAS, 'game');
//global variable that gives us access to our dat.gui variables from anywhere
var settings;

/** 
 * Boot state
 */
var Boot = function (game) {
  this.game = game;
};

/**
 * 
 */
Boot.prototype = {

  create: function () {

    //---------------- Start dat.gui code ----------------

    //This object defines all the default values we can change with dat.gui
    //make sure it's either global (defined outside of all functions)
    //or it's added as a property of the game. (this.game.settings = settings;)
    settings = {

      // Debug controls
      debugCollisionLayer: false,
      debugPlayerBody: false,
      debugPlayerBodyInfo: false,
      debugCameraInfo: false,
      debugFps: false,
      sfxOn: true,

      usePool: false,

      // Player properties
      rateOfFire: 200,
      bulletSpeed: 150

    };

    this.game.settings = settings;

    //Give a reference to the gui to the game.
    this.game.gui = new dat.GUI({
      width: 350
    });

    //This allows us to save (and remember) our settings.
    this.game.gui.useLocalStorage = true;
    this.game.gui.remember(settings);

    //stepSize lets us choose the precision level of our gui
    var stepSize = 1;

    // Player
    this.game.gui.playerFolder = this.game.gui.addFolder('Projectiles');
    this.game.gui.playerFolder.add(settings, 'rateOfFire').min(0).max(1000).step(stepSize).name('Rate of Fire');
    this.game.gui.playerFolder.add(settings, 'bulletSpeed').min(0).max(2000).step(stepSize).name('Bullet Speed');

    //Debug
    this.game.gui.debugFolder = this.game.gui.addFolder('Debug');
    this.game.gui.debugFolder.add(settings, 'debugFps').name('FPS');
    this.game.gui.debugFolder.add(settings, 'debugCollisionLayer').name('Collision Layer');
    this.game.gui.debugFolder.add(settings, 'debugPlayerBody').name('Player Body');
    this.game.gui.debugFolder.add(settings, 'debugPlayerBodyInfo').name('Player Body Info');
    this.game.gui.debugFolder.add(settings, 'debugCameraInfo').name('Camera Info');
    this.game.gui.debugFolder.add(settings, 'usePool').name('use Pool');

    //---------------- end dat.gui code ----------------

    //make pixel art not look shitty!
    this.game.renderer.renderSession.roundPixels = true;
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
    //partially fix shaky sprites
    this.game.camera.roundPx = false;

    //MAGIC SCALING CODE 
    this.game.scale.pageAlignVertically = true;
    this.game.scale.pageAlignHorizontally = true;
    this.windowHeight = window.innerHeight;
    // The 9 and 16 here are your ratio, in this case 16 x 9.
    this.windowWidth = (this.windowHeight / 9) * 16;
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    window._this = this;
    this.scale.refresh();
    this.scale.setMinMax(40, 30, this.windowWidth, this.windowHeight);
    window.addEventListener('resize', function () {
      window._this.windowHeight = window.innerHeight;
      window._this.windowWidth = (_this.windowHeight / 9) * 16;
      window._this.scale.setMinMax(40, 30, _this.windowWidth, _this.windowHeight);
    }, true);

    this.game.state.start("Preloader");
  }
};

/**
 * preloader is responsible for adding assets to that game
 */
var Preloader = function (game) {
  this.game = game;
};

/**
 * 
 */
Preloader.prototype = {
  preload: function () {
    this.game.load.script('Bullet.js', 'js/Bullet.js');
    this.game.load.image('bullet', 'assets/img/bullet.png');
  },

  create: function () {
    this.game.state.start('Play');
  }
};

/**
 * 
 */
var Play = function (game) {
  this.game = game;
};

/**
 * 
 */
Play.prototype = {

  create: function () {
    console.log('Play: create');

    this.game.time.advancedTiming = true;
    this.game.debug.font = '9px courier';

    //start Physics engine
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.start = this.game.add.image(32, this.game.camera.view.height / 2, 'bullet');
    this.start.anchor.setTo(0.5);

    this.lastFired = this.game.time.now;

    //OBJECT POOL
    this.NUM_BULLETS = 20;
    this.bulletPool = this.game.add.group();
    for (var i = 0; i < this.NUM_BULLETS; ++i) {

      // Create each bullet and add it to the group.
      var bullet = this.game.add.existing(new Bullet(this.game, this.start.x, this.start.y));
      this.bulletPool.add(bullet);

      // Set its initial state to "dead".
      bullet.kill();

    }

  },

  update: function () {
    if ((this.game.time.now - this.lastFired) >= this.game.settings.rateOfFire) {
      if (!this.game.settings.usePool) {

        this.game.add.existing(new Bullet(this.game, this.start.x, this.start.y));

      } else {

        var bullet = this.bulletPool.getFirstDead();
        if(bullet === null || bullet === undefined) return;
        bullet.reset(this.start.x, this.start.y);
        bullet.revive();
        

      }
      this.lastFired = this.game.time.now;
    }
  },

  render: function () {

    //early return if there's a problem with the gui
    if (this.game.gui === undefined || this.game.gui === null) return;


    if (settings.debugFps) {
      this.game.debug.text('FPS: ' + game.time.fps, 16, 16, 'yellow');
    }
  }

};

game.state.add('Boot', Boot);
game.state.add('Preloader', Preloader);
game.state.add('Play', Play);
game.state.start('Boot');