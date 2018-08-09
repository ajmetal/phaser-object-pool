Bullet = function(game, x, y) {
    this.game = game;
    Phaser.Sprite.call(this, game, x, y, 'bullet');

    this.game.physics.arcade.enable(this);
    this.body.velocity.x = 150;
    this.body.velocity.y = 0;
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.anchor.setTo(0.5);

    this.events.onRevived.add(function() {
        //add whatever you want here
    }, this);

    this.events.onKilled.add(function() {
        //do whatever you want when this dies,
        //like instantiate a particle effect for the impact
    }, this);

}

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;