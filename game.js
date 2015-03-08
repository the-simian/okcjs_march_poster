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

var okcjsIcon;

var tileScale = 16;

var starFieldFilterFragment = [

        "precision mediump float;",
        "uniform float     time;",
        "uniform vec2      resolution;",
        "uniform vec2      mouse;",

        "// Posted by Trisomie21",
        "// modified by @hintz",

        "// from http://glsl.heroku.com/e#5248.0",
        "#define BLADES 6.0",
        "#define BIAS 0.1",
        "#define SHARPNESS 3.0",

        "vec3 star(vec2 position, float t)",
        "{",
            "float d2D = 4.0 / length(position) + t * 5.0;",
            "float a2D = atan(position.y, position.x);",
            "float qq = d2D * 0.1 + sin(d2D) * 0.2 * cos(a2D * 3.0) + sin(d2D * 0.2) * 0.3 * cos(a2D * 8.0)",
            "+ max(0.0, sin(d2D * 0.1 + 10.0) - 0.5) * cos(a2D * 20.0 + sin(d2D * 0.2) * 5.0)",
            "+ max(0.0, sin(d2D * 0.03 + 18.0) - 0.5) * cos(a2D * 5.0 + sin(d2D * 0.2) * 5.0);",
            "vec3 color = vec3(sin(qq * 2.0), sin(qq * 3.0), sin(qq * 5.0));",

            "color = color * 0.2;",

            "float blade = clamp(pow(sin(atan(position.y,position.x )*BLADES)+BIAS, SHARPNESS), 0.0, 1.0);",

            "color += mix(vec3(-0.34, -0.5, -1.0), vec3(0.0, -0.5, -1.0), (position.y + 1.0) * 0.25);",
            "color += (vec3(0.95, 0.65, 0.30) * 1.0 / distance(vec2(0.0), position) * 0.075);",
            "color += vec3(0.95, 0.45, 0.30) * min(1.0, blade *0.7) * (1.0 / distance(vec2(0.0, 0.0), position)*0.075);",

            "return color;",
        "}",


        "// Tweaked from http://glsl.heroku.com/e#4982.0",
        "float hash(float n) { return fract(sin(n)*43758.5453); }",

        "float noise(in vec2 x)",
        "{",
            "vec2 p = floor(x);",
            "vec2 f = fract(x);",
            "f = f*f*(3.0-2.0*f);",
            "float n = p.x + p.y*57.0;",
            "float res = mix(mix(hash(n+0.0), hash(n+1.0),f.x), mix(hash(n+57.0), hash(n+58.0),f.x),f.y);",

            "return res;",
        "}",

        "vec3 cloud(vec2 p)",
        "{",
            "float f = 0.0;",
            "f += 0.50000*noise(p*1.0*10.0);",
            "f += 0.25000*noise(p*2.0*10.0);",
            "f += 0.12500*noise(p*4.0*10.0);",
            "f += 0.06250*noise(p*8.0*10.0);",
            "f *= f;",

            "return vec3(f*.65, f*.45, f)*.6;",
        "}",

        "const float LAYERS = 7.0;",
        "const float SPEED  = 0.005;",
        "const float SCALE  = 8.0;",
        "const float DENSITY    = 0.5;",
        "const float BRIGHTNESS = 2.0;",
        "vec2 ORIGIN    = resolution.xy*.5;",

        "float rand(vec2 co){ return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); }",

        "void main(void)",
        "{",
            "vec2   pos = gl_FragCoord.xy - ORIGIN;",
            "float dist = length(pos) / resolution.y;",
            "vec2 coord = vec2(pow(dist, 0.1), atan(pos.x, pos.y) / (3.1415926*2.0));",

            "// Nebulous cloud",
            "vec3 color = cloud(pos/resolution);",

            "// Background stars",
            "float a = pow((1.0-dist), 20.0);",
            "float t = time*-0.05;",
            "float r = coord.x - (t*SPEED);",
            "float c = fract(a+coord.y + 0.0*0.543);",
            "vec2  p = vec2(r, c*0.5)*4000.0;",
            "vec2 uv = fract(p)*2.0-1.0;",
            "float m = clamp((rand(floor(p))-0.9)*BRIGHTNESS, 0.0, 1.0);",
            "color +=  clamp((1.0-length(uv*2.0))*m*dist, 0.0, 1.0);",

            "// Flying stars into black hole",
            "for (float i = 1.0; i < (LAYERS+1.0); ++i)",
            "{",
                "float a = pow((1.0-dist),20.0);",
                "float t = i*10.0 + time*i*i;",
                "float r = coord.x - (t*SPEED);",
                "float c = fract(a+coord.y + i*.543);",
                "vec2  p = vec2(r, c*.5)*SCALE*(LAYERS/(i*i));",
                "vec2 uv = fract(p)*2.0-1.0;",
                "float m = clamp((rand(floor(p))-DENSITY/i)*BRIGHTNESS, 0.0, 1.0);",
                "color +=  clamp(star(uv*0.5, time+i*10.0)*m*dist, 0.0, 1.0);",
            "}",


            "gl_FragColor = vec4(color, 1.0);",
        "}"
    ];

function getSplash() {
  game.load.image('splash', 'splash_screen.jpg');
}

function preload() {

  game.add.image(0, 0, 'splash');

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
  game.load.image('okcjs-icon', 'okcjs_icon.png');

  game.load.audio('vroom', [
      'music/vroom.mp3',
      'music/vroom.ogg',
    ]);

  game.load.audio('twinkle', [
      'music/twinkle.mp3',
      'music/twinkle.ogg',
    ]);

}

var loadState = {
  preload: preload,
  create: function () {
    game.state.start('play');
  }
};

var bootState = {
  preload: getSplash,
  create: function () {

    game.state.start('load');
  }

};
var filter;
var winState = {
  preload: function () {


    game.load.image('steel', 'fonts/STEEL.png');

    game.load.audio('winmusic', [
      'music/okcjs_theme_loopable.mp3',
      'music/okcjs_theme_loopable.ogg',
    ]);
  },
  create: function () {


    var winMusic = game.add.audio('winmusic');
    winMusic.loop = true;
    winMusic.play();
    filter = new Phaser.Filter(game, null, starFieldFilterFragment);
    filter.setResolution(700, 786);

    var sprite = game.add.sprite();
    sprite.width = 700;
    sprite.height = 786;

    sprite.filters = [filter];


    var font = game.add.retroFont('steel', 32, 32, Phaser.RetroFont.TEXT_SET3, 10);
    font.setText('You are a \n Javascript \n Chamption', true, 0, 8, Phaser.RetroFont.ALIGN_CENTER);

    var winmessage = game.add.image(350, 350, font);

    winmessage.anchor.set(0.5, 0.5);

    var tween = game.add.tween(winmessage.scale);
    var big = {
      x: 2.3,
      y: 2.3
    };

    var small = {
      x: 1,
      y: 1
    }
    tween
      .to(big, 1000)
      .to(small, 500)
      .easing(Phaser.Easing.Sinusoidal.InOut)
      .loop()
      .start();



  },
  update: function () {
    filter.update(game.input.mousePointer);
  }
};


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

  player = game.add.sprite(32, 384, 'dude');


  map = game.add.tilemap('level');
  map.addTilesetImage('space_desert_tileset');
  map.setCollisionByExclusion([13, 14, 15, 16, 46, 47, 48, 49, 50, 51]);

  layer = map.createLayer('Tile Layer 1');
  layer.resizeWorld();

  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.gravity.y = 250;
  game.physics.enable(player, Phaser.Physics.ARCADE);

  player.body.bounce.y = 0.2;
  player.body.collideWorldBounds = true;

  //  player.checkWorldBounds = true;
  //  player.outOfBoundsKill = true;

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


  okcjsIcon = game.add.sprite(tileScale * 73, tileScale * 70, 'okcjs-icon');
  game.physics.arcade.enable(okcjsIcon);
  okcjsIcon.anchor.setTo(0.5, 0.5);
  okcjsIcon.body.collideWorldBounds = true;

}

function left() {
  player.body.velocity.x = -150;

  if (facing !== 'left') {
    player.animations.play('left');
    facing = 'left';
  }
}

function right() {
  player.body.velocity.x = 150;

  if (facing !== 'right') {
    player.animations.play('right');
    facing = 'right';
  }
}

function idle() {
  if (facing !== 'idle') {
    player.animations.stop();
    if (facing === 'left') {
      player.frame = 0;
    } else {
      player.frame = 5;
    }
    facing = 'idle';
  }
}

function jump() {
  player.body.velocity.y = -250;
  jumpTimer = game.time.now + 750;
}

function playerCanJump() {
  return jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer;
}

function movePlayer() {
  player.body.velocity.x = 0;

  if (cursors.left.isDown) {
    left();
  } else if (cursors.right.isDown) {
    right();
  } else {
    idle();
  }

  if (playerCanJump()) {
    jump();
  }
}

function scrollBackground() {
  bgStars.tilePosition.x += 0.07;
  bgPlanet.tilePosition.x -= 0.15;
}

function advanceLevel() {

  var screenCenterX = (game.camera.width / 2) + game.camera.view.x;
  var screenCenterY = (game.camera.height / 2) + game.camera.view.y;
  var vroom = game.add.audio('vroom');
  var twinkle = game.add.audio('twinkle');

  var logoEmitter = game.add.emitter(0, 0, 25);
  logoEmitter.makeParticles('okcjs-icon');
  logoEmitter.setYSpeed(-400, 400);
  logoEmitter.setXSpeed(-400, 400);
  logoEmitter.gravity = 0;

  var tweenLogo = game.add.tween(okcjsIcon);
  vroom.play();
  tweenLogo.to({
      x: screenCenterX,
      y: screenCenterY,
      angle: 360
    }, 1000)
    .to({
      angle: 2000
    }, 1000)
    .start()
    .onComplete.add(function () {
      twinkle.play();
      logoEmitter.x = screenCenterX;
      logoEmitter.y = screenCenterY;
      logoEmitter.start(true, 2500, null, 25);
      okcjsIcon.kill();
      game.time.events.add(2500, function () {
        game.state.start('win');
      })
    });

}

function update() {
  scrollBackground();
  game.physics.arcade.collide(player, layer);
  game.physics.arcade.collide(okcjsIcon, layer);


  game.physics.arcade.overlap(player, okcjsIcon, advanceLevel);


  movePlayer();

  if (!player.inWorld) {
    game.state.start('play');
  }

}

function render() {
  //  game.debug.text(game.time.physicsElapsed, 32, 32);
  //  game.debug.body(player);
  //  game.debug.bodyInfo(player, 16, 24);
  //  game.debug.cameraInfo(game.camera)
}

var mainState = {
  create: create,
  update: update,
  render: render
};

game = new Phaser.Game(700, 786, Phaser.AUTO, 'poster_game');
game.state.add('play', mainState);
game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('win', winState);

game.state.start('boot');