'use strict';


var map;
var layer;
var player;
var facing = 'left';
var jumpTimer = 0;
var cursors;
var jumpButton;


var game;
var headerText;
var headerDate;
var bgMountains;
var bgStars;
var phaserLogo;
var bgPlanet;
var speakerName;
var speakerTwitter;



function preload() {

  //  game.load.spritesheet('droid', 'assets/games/starstruck/droid.png', 32, 32);
  //  game.load.image('starSmall', 'assets/games/starstruck/star.png');
  //  game.load.image('starBig', 'assets/games/starstruck/star2.png');

  game.load.spritesheet('dude', 'dude.png', 32, 48);

  game.load.tilemap('level', 'poster_level.json', null, Phaser.Tilemap.TILED_JSON);

  game.load.image('space_desert_tileset', 'space_desert_tileset.png');

  game.load.image('background-mountains', 'mountain_range.png');
  game.load.image('background-stars', 'stars.jpg');
  game.load.image('background-planet', 'background_planet.png');

  headerText = 'The  Oklahoma City  Javascript  Usergroup';
  headerDate = '3 / 17 / 2015';
  speakerName = 'Jesse Harlin';
  speakerTwitter = '@5imian';

  game.load.image('phaser-logo', 'phaser_logo.png');

}



function create() {

  bgStars = game.add.tileSprite(0, 0, 700, 550, 'background-stars');
  bgStars.fixedToCamera = true;

  var planetScale = 1.2;
  bgPlanet = game.add.tileSprite(0, 0, 2000, 550, 'background-planet');
  bgPlanet.tilePosition.x = 0;
  bgPlanet.tilePosition.y = 0;
  bgPlanet.tileScale.x = planetScale;
  bgPlanet.tileScale.y = planetScale;
  bgPlanet.fixedToCamera = true;

  var phaserlogoSize = 380;
  phaserLogo = game.add.sprite(game.world.centerX, (phaserlogoSize * 0.5) + 115, 'phaser-logo');

  phaserLogo.width = phaserlogoSize;
  phaserLogo.height = phaserlogoSize;
  phaserLogo.anchor.set(0.5);

  phaserLogo.fixedToCamera = false;


  var headerTextStyle = {
    font: '26pt Helvetica',
    fill: '#e0e4f0',
    align: 'center'
  };

  var headerDateStyle = {
    font: '38pt Helvetica',
    fill: '#eeeeee',
    align: 'center'
  };



  var headText = game.add.text(game.world.centerX, 32, headerText, headerTextStyle);
  var headDate = game.add.text(game.world.centerX, 90, headerDate, headerDateStyle);


  headDate.anchor.set(0.5);
  headDate.fixedToCamera = true;

  headText.anchor.set(0.5);
  headText.fixedToCamera = true;

  bgMountains = game.add.tileSprite(0, (786 - 314), 700, 314, 'background-mountains');
  bgMountains.fixedToCamera = true;

  player = game.add.sprite(32, 32, 'dude');



  map = game.add.tilemap('level');

  map.addTilesetImage('space_desert_tileset');

  map.setCollisionByExclusion([13, 14, 15, 16, 46, 47, 48, 49, 50, 51]);

  layer = map.createLayer('Tile Layer 1');


  //layer.debug = true;

  layer.resizeWorld();

  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.gravity.y = 250;


  game.physics.enable(player, Phaser.Physics.ARCADE);

  player.body.bounce.y = 0.2;
  player.body.collideWorldBounds = true;
  player.body.setSize(20, 32, 5, 16);

  player.animations.add('left', [0, 1, 2, 3], 10, true);
  player.animations.add('turn', [4], 20, true);
  player.animations.add('right', [5, 6, 7, 8], 10, true);

  game.camera.follow(player);

  var speakerNameTextStyle = {
    font: '32pt Helvetica',
    fill: '#eeeeee',
    align: 'right'
  };

  var speakerTwitterTextStyle = {
    font: '20pt Helvetica',
    fill: '#e0e4f0',
    align: 'right'
  };

  var speakerTwitterText = game.add.text(685, 682, speakerTwitter, speakerTwitterTextStyle);
  var speakerNameText = game.add.text(685, 655, speakerName, speakerNameTextStyle);

  speakerTwitterText.anchor.set(1);
  speakerNameText.anchor.set(1);

  cursors = game.input.keyboard.createCursorKeys();
  jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);




}

function update() {

  bgStars.tilePosition.x += 0.07;
  bgPlanet.tilePosition.x -= 0.15;

  game.physics.arcade.collide(player, layer);

  player.body.velocity.x = 0;

  if (cursors.left.isDown) {
    player.body.velocity.x = -150;

    if (facing != 'left') {
      player.animations.play('left');
      facing = 'left';
    }
  } else if (cursors.right.isDown) {
    player.body.velocity.x = 150;

    if (facing != 'right') {
      player.animations.play('right');
      facing = 'right';
    }
  } else {
    if (facing != 'idle') {
      player.animations.stop();

      if (facing == 'left') {
        player.frame = 0;
      } else {
        player.frame = 5;
      }

      facing = 'idle';
    }
  }

  if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer) {
    player.body.velocity.y = -250;
    jumpTimer = game.time.now + 750;
  }


}

function render() {
  //  game.debug.text(game.time.physicsElapsed, 32, 32);
  //  game.debug.body(player);
  //  game.debug.bodyInfo(player, 16, 24);
}

var gameOptions = {
  preload: preload,
  create: create,
  update: update,
  render: render
};

game = new Phaser.Game(700, 786, Phaser.AUTO, 'poster_game', gameOptions);