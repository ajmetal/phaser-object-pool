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

    settings = {

      // Debug controls
      debugCollisionLayer: false,
      debugPlayerBody: false,
      debugPlayerBodyInfo: false,
      debugCameraInfo: false,
      debugFps: true,
      sfxOn: true,

      usePool: true,

      // Player properties
      rateOfFire: 200,
      bulletSpeed: 150

    };

    this.game.settings = settings;

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
    this.NUM_BULLETS = 100;
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
        this.game.add.existing(new Bullet(this.game, this.start.x, this.start.y - 64));
        this.game.add.existing(new Bullet(this.game, this.start.x, this.start.y - 32));
        this.game.add.existing(new Bullet(this.game, this.start.x, this.start.y + 64));
        this.game.add.existing(new Bullet(this.game, this.start.x, this.start.y + 32));

      } else {

        for (let i = 0; i < 5; ++i) {
          var bullet = this.bulletPool.getFirstDead();
          if (bullet === null || bullet === undefined) return;

          bullet.reset(this.start.x, 64 + (32 * i));

          bullet.body.velocity.x = 150;
          bullet.body.velocity.y = 0;
          bullet.checkWorldBounds = true;
          bullet.outOfBoundsKill = true;
        }

      }
      this.lastFired = this.game.time.now;
    }
  },

  render: function () {

    //early return if there's a problem with the gui
    //if (this.game.gui === undefined || this.game.gui === null) return;


    if (settings.debugFps) {
      this.game.debug.text('FPS: ' + game.time.fps, 16, 16, 'yellow');
    }

    this.game.debug.text('Pooling Objects ' + game.settings.usePool, 16, 32, 'yellow');
  }

};

game.state.add('Boot', Boot);
game.state.add('Preloader', Preloader);
game.state.add('Play', Play);
game.state.start('Boot');