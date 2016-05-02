window.onload = function () {
    
    "use strict";
    
    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload() 
    {
        game.load.spritesheet('heart', 'assets/heart.png', 40, 23);
        game.load.spritesheet('stick', 'assets/play.png', 32, 60);
        game.load.spritesheet('snaker', 'assets/snake.png', 60, 32);
        game.load.spritesheet('spider', 'assets/spider60x33.png', 60, 33);
        game.load.spritesheet('shadowl', 'assets/shadow.png', 60, 90);
        game.load.spritesheet('kaboom', 'assets/explosion.png', 70,70);
        game.load.spritesheet('life', 'assets/lifeGain.png', 70,70);
        game.load.image('fence', 'assets/ground.png');
        game.load.image('background', 'assets/bg1.png');
        game.load.image('background2', 'assets/bg2.png');
        game.load.image('instruct', 'assets/controls.png');
        game.load.image('score1', 'assets/score.png');
        game.load.image('survive', 'assets/survive.png');
        game.load.image('dead', 'assets/gameover.png');
        game.load.image('snow', 'assets/snow.png');
        game.load.audio('walkSound', 'assets/walking.mp3');
        game.load.audio('keyS', 'assets/nes-13-08_01.mp3');
        game.load.audio('caught', 'assets/nes-14-11_01.mp3');
        game.load.audio('escape', 'assets/escape.mp3');
        game.load.audio('jump', 'assets/lazer.wav');
        game.load.image('startScreen','assets/starfield.png');
        game.load.spritesheet('button','assets/startButton.png');
        game.load.spritesheet('howToPlay','assets/instructionsNew.png',459,200);
    }
    
    var player;
    var platform;
    var cursors;
    var direction = 1;
    var maxSpeed = 300;
    var acceleration = 2300;
    var drag = 1200;
    var snakeGroup;
    var spiderGroup;
    var shadowGroup;
    var heartGroup;
    var snowGroup;
    var maxEnemy = 3;
    var lastEnemy = 0;
    var lastSnow = 0;
    var enemySnake;
    var selection;
    var direction = 0;
    var poison;
    var dead = false;
    var background;
    var text;
    var instr;
    var instr2;
    var instr3;
    var score;
    var counter = 0;
    var explosions;
    var lives;
    var lifeEffect;
    var lifeCounter = 2;
    var steps = false;
    var jump;
    var invincible = false;
    var isShadow = false;
    var walk;
    var keySound;
    var caught;
    var escape;
    var jump;
    var stateText;
    var startScreen;
    var button;
    var howToPlay;
    
    function create() 
    {
       
        
        walk = game.add.audio('walkSound');
        keySound = game.add.audio('keyS');
        caught = game.add.audio('caught');
        escape = game.add.audio('escape');
        jump = game.add.audio('jump');
        walk.allowMultiple = false;
        caught.allowMultiple = false;
        escape.allowMultiple = false;
        
        game.add.sprite(0, 0, 'background');
        background = game.add.sprite(0, 0, 'background2');
       // text = game.add.sprite(0, 0, 'instruct');
        instr = game.add.sprite(0, 0, 'score1');
        
        //score of the game
        score = game.add.text(710, 35, ' ' + counter, { font: "36px Verdana", fill: "#ffffff", align: "left" });
        
        //number f lives
        lives = game.add.text(540, 35, ' ' + lifeCounter, { font: "36px Verdana", fill: "#ffffff", align: "left" });
        background.scale.x = 1.3;
        background.scale.y = 1.3;
        

        game.physics.startSystem(Phaser.Physics.ARCADE);

        platform = game.add.group();
        platform.enableBody = true;
        var groundBlock = game.add.sprite(-15, game.height - 50, 'fence');
        game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
        groundBlock.body.immovable = true;
        groundBlock.body.allowGravity = false;
        groundBlock.body.setSize(800,20,0,20);
        platform.add(groundBlock);
        player = game.add.sprite(120, game.world.height - 200, 'stick');
        game.physics.arcade.enable(player);
        player.anchor.setTo(0.5, 1);
        player.body.gravity.y = 4000;
        player.body.collideWorldBounds = true;
        player.body.maxVelocity.setTo(maxSpeed, 2000);
        player.body.drag.setTo(drag, drag);
        player.animations.add('goRight', [6, 7, 8, 9], 12, true);
        player.animations.add('goLeft', [10, 11, 12, 13], 12, true);
        player.animations.add('faceRight', [9, 5], 8, true);
        player.animations.add('faceLeft', [13, 4], 8, true);        
        player.animations.add('dead', [14], 2, true);
        player.animations.add('crouchLeft', [0, 1], 12, true);
        player.animations.add('crouchRight', [2, 3], 12, true);
        player.invincible = false;
        
        heartGroup = game.add.group();
        for(var i = 0; i < 5; i++) 
        {
            var heart = game.add.sprite(0, 0, 'heart');
            heart.animations.add('spawn', [0], 4, true);
            heart.animations.add('grow', [1, 2, 3], 4, true);
            heart.animations.add('move', [3, 4, 5], 5, true);
            heartGroup.add(heart);
            game.physics.enable(heart, Phaser.Physics.ARCADE);
            heart.body.gravity.y = 400;
            heart.body.drag.setTo(drag, 0);
            player.body.maxVelocity.setTo(maxSpeed, 2000);
            heart.anchor.setTo(.5, 1);
            heart.kill();
        }
        
        //falling particles doesn't do anything
        snowGroup = game.add.group();
        for(var i = 0; i < 20; i++) 
        {
            var snow = game.add.sprite(0, 0, 'snow');
            snow.animations.add('spawn', [0], 4, true);
            snow.animations.add('grow', [1, 2, 3], 4, true);
            snow.animations.add('move', [3], 2, true);
            snowGroup.add(snow);
            game.physics.enable(snow, Phaser.Physics.ARCADE);
            snow.body.gravity.y = 400;
            snow.body.drag.setTo(drag, 0);
            player.body.maxVelocity.setTo(maxSpeed, 2000);
            snow.anchor.setTo(.5, 1);
            snow.kill();
        }

        spiderGroup = game.add.group();
        for(var i = 0; i < 5; i++) 
        {
            var spider = game.add.sprite(0, 0, 'spider');
            spider.animations.add('spawn', [0], 4, true);
            spider.animations.add('grow', [1, 2, 3, 4], 4, true);
            spider.animations.add('move', [5, 6, 7, 8], 18, true);
            spiderGroup.add(spider);
            game.physics.enable(spider, Phaser.Physics.ARCADE);
            spider.isShadow = false;
            spider.body.gravity.y = 400;
            spider.body.drag.setTo(drag, 0);
            spider.body.maxVelocity.setTo(100, 2000);
            spider.anchor.setTo(.5, 1);
            spider.kill();
        }
        
        shadowGroup = game.add.group();
        for(var i = 0; i < 5; i++) 
        {
            var shadow = game.add.sprite(0, 0, 'shadowl');
            shadow.animations.add('spawn', [0], 4, true);
            shadow.animations.add('grow', [1, 2, 3, 4], 4, true);
            shadow.animations.add('move', [5, 6, 7, 8], 18, true);
            shadowGroup.add(shadow);
            game.physics.enable(shadow, Phaser.Physics.ARCADE);
            shadow.isShadow = true;
            shadow.body.gravity.y = 400;
            shadow.body.maxVelocity.setTo(240, 2000);
            shadow.body.drag.setTo(drag, 0);
            shadow.anchor.setTo(.5, 1);
            shadow.kill();
        }
        
        snakeGroup = game.add.group();
        for(var i = 0; i < 5; i++) 
        {
            var snake = game.add.sprite(0, 0, 'snaker');
            snake.animations.add('spawn', [0], 4, true);
            snake.animations.add('grow', [1, 2, 3, 4], 4, true);
            snake.animations.add('move', [5, 6, 7, 8], 18, true);
            snakeGroup.add(snake);
            game.physics.enable(snake, Phaser.Physics.ARCADE);
            snake.isShadow = false;
            snake.body.gravity.y = 400;
            snake.body.maxVelocity.setTo(150, 2000);
            snake.body.drag.setTo(drag, 0);
            snake.anchor.setTo(.5, 1);
            snake.kill();
        }
        
        explosions = game.add.group();
        for (var i = 0; i < 10; i++)
        {
            var explosionAnimation = explosions.create(0, 0, 'kaboom', [0], false);
            explosionAnimation.anchor.setTo(0.5, 0.5);
            explosionAnimation.animations.add('kaboom');
        }
        
        lifeEffect = game.add.group();
        for (var i = 0; i < 10; i++)
        {
            var lifeAnimation = lifeEffect.create(0, 0, 'life', [0], false);
            lifeAnimation.anchor.setTo(0.5, 0.5);
            lifeAnimation.animations.add('life');
        }
        

       /* game.time.events.add((Phaser.Timer.SECOND * 9), spawnEnemy, this);
        game.time.events.add((Phaser.Timer.SECOND * 9), spawnSnow, this);
        game.time.events.add((Phaser.Timer.SECOND * 7), start, this);
        this.game.time.events.loop(500, function() {  //this.game.add.tween(text).to({x: game.rnd.between(-10, 10), y: game.rnd.between(-10, 10)}, 1750, Phaser.Easing.Quadratic.InOut, true);}, this);
        //this.game.time.events.loop(2000, function() {  
            
        this.game.add.tween(background).to({x: game.rnd.between(-10, 10), y: game.rnd.between(-10, 10)}, 1750, Phaser.Easing.Quadratic.InOut, true);}, this);
        this.game.time.events.loop(500, function() { this.game.add.tween(platform).to({x: game.rnd.between(-10, 10), y: game.rnd.between(-20, 20)}, 1750, Phaser.Easing.Quadratic.InOut, true);}, this);*/

        game.world.bringToTop(platform);
       // game.world.bringToTop(text);
        
        game.physics.arcade.TILE_BIAS = 80;
        
        cursors = game.input.keyboard;
       
        game.world.bringToTop(instr);
        
        //lives
        lives = game.add.text(540, 35, ' ' + lifeCounter, { font: "36px Verdana", fill: "#ffffff", align: "left" });
        
         //Start Menu:
        startScreen = game.add.tileSprite(0,0,800,600,'startScreen');
        howToPlay = game.add.tileSprite(150, 200, 459, 200,'howToPlay');
        howToPlay.animations.add('anim', [0, 1], 4, true);
        howToPlay.animations.play('anim');
        button = game.add.button(150,400,'button',actionOnClick,this,2,1,0);
        button.onInputOver.add(over,this);
        button.onInputOut.add(out,this);
        button.onInputUp.add(up,this);
       

    }
    
    function update() 
    {
        game.physics.arcade.collide(player, platform);
        game.physics.arcade.collide(snakeGroup, platform);
        game.physics.arcade.collide(shadowGroup, platform);
        game.physics.arcade.collide(spiderGroup, platform);
        game.physics.arcade.collide(heartGroup, platform);
        game.physics.arcade.collide(snowGroup, platform);
        game.physics.arcade.collide(player, snakeGroup, checkCollision, null, this);
        game.physics.arcade.collide(player, spiderGroup, checkCollision, null, this);
        game.physics.arcade.collide(player, shadowGroup, checkCollision, null, this);
        game.physics.arcade.collide(player, heartGroup, gainLife, null, this);
        game.physics.arcade.collide(player, snowGroup, checkCollision, null, this);
        
    if (!dead)
    {
        if (cursors.isDown(Phaser.Keyboard.A) && !dead)
        {
            //  Move to the left
            player.body.setSize(32, 60);
            player.body.acceleration.x = -acceleration;
            direction = 0;
            if (player.body.touching.down)
            {
                player.animations.play('goLeft');
            }
            else
            {
                player.animations.play('jumpLeft');
            }
        }
        else if (cursors.isDown(Phaser.Keyboard.D) && !dead)
        {
            //  Move to the right
            player.body.setSize(32, 60);
            player.body.acceleration.x = acceleration;
            direction = 1;
            if (player.body.touching.down)
            {
                player.animations.play('goRight');
            }
            else
            {
                player.animations.play('jumpRight');
            }
        }
        else if (cursors.isDown(Phaser.Keyboard.S) && player.body.touching.down)
        {
            player.body.acceleration.x = 0;
            player.body.setSize(32, 30);
            if (direction == 0)
                player.animations.play('crouchLeft');
            else
                player.animations.play('crouchRight');            
        }
        else
        {
            player.body.acceleration.x = 0;
            player.body.setSize(32, 60);
            if (direction == 0)
                player.animations.play('faceLeft');
            else
                player.animations.play('faceRight');    
        }

        if (cursors.isDown(Phaser.Keyboard.W) && player.body.touching.down)
        {
            player.body.velocity.y = -1300;
            jump.play('', 0, 0.3);
        }
        
        if (player.body.velocity.x != 0 & player.body.touching.down & !walk.isPlaying)
            walk.play('',0,.3);
        }
       /* else
            player.frame = 14;*/
    }
    
    function spawnEnemy()
    {
        lastEnemy = 0;
        if (game.time.now - lastEnemy < 500) return;
        lastEnemy = game.time.now;
        selection = game.rnd.between(1, 79);
        if (selection <  25)
            spawnSpider();
        else if (selection < 50)
            spawnSnake();
        else if (selection < 75)
            spawnShadow();
        else
            spawnHeart();
        //when you die it stops calling this bc boolean 'dead' is false
        if (!dead) game.time.events.add((game.rnd.frac() * Phaser.Timer.SECOND * 3) + 1, spawnEnemy, this);
    }
    
    function spawnSnow()
    {
        lastSnow = 0;
        if (game.time.now - lastSnow < 200) return;
        lastSnow = game.time.now;
        function selfdestruct()
        {
            snow.kill();
        }
        var snow = snowGroup.getFirstDead();
        if (snow === null || snow === undefined || dead) return;
        snow.revive();
        snow.checkWorldBounds = true;
        snow.outOfBoundsKill = true;
        snow.reset(game.rnd.between(50,750), 100);
        snow.scale.x = 1;
        snow.poison = false;
        game.time.events.add((game.rnd.frac() * Phaser.Timer.SECOND * 7) + 2, selfdestruct, this);
        game.time.events.add((game.rnd.frac() * Phaser.Timer.SECOND), spawnSnow, this);
    }
        
    
    function spawnSpider()
    {
        function grow1()
        {
            spider.animations.play('grow');
            game.time.events.add((Phaser.Timer.SECOND), move1, this);
        }
        function move1()
        {
            spider.poison = true;
            spider.animations.play('move');
            var direction = game.rnd.between(1,2);
            if (direction == 1)
                spider.body.acceleration.x = -acceleration;
            else
            {
                spider.scale.x = -1;
                spider.body.acceleration.x = acceleration;
            }
        }
        var spider = spiderGroup.getFirstDead();
        if (spider === null || spider === undefined || dead) return;
        spider.revive();

        spider.checkWorldBounds = true;
        spider.outOfBoundsKill = true;
        spider.angle = 0;
        spider.scale.x = 1;
        spider.reset(game.rnd.between(50,750), 100);
        spider.poison = false;
        spider.animations.play('spawn');
        game.time.events.add((game.rnd.frac() * Phaser.Timer.SECOND * 7) + 1, grow1, this);
    }

    
    function spawnSnake()
    {
        function grow2()
        {
            snake.animations.play('grow');
            game.time.events.add((Phaser.Timer.SECOND), move2, this);
        }
        function move2()
        {
            snake.poison = true;
            snake.animations.play('move');
            var direction = game.rnd.between(1,2);
            if (direction == 1)
                snake.body.acceleration.x = -acceleration;
            else
            {
                snake.scale.x = -1;
                snake.body.acceleration.x = acceleration;
            }
        }
        var snake = snakeGroup.getFirstDead();
        if (snake === null || snake === undefined || dead) return;
        snake.revive();

        snake.checkWorldBounds = true;
        snake.outOfBoundsKill = true;
        snake.angle = 0;
        snake.reset(game.rnd.between(50,750), 100);
        snake.scale.x = 1;
        snake.poison = false;
        snake.animations.play('spawn');
        game.time.events.add((game.rnd.frac() * Phaser.Timer.SECOND * 7) + 1, grow2, this);
    }
    
    
    function spawnShadow()
    {
        function grow3()
        {
            shadow.poison = true;
            shadow.animations.play('grow');
            game.time.events.add((Phaser.Timer.SECOND), move3, this);
        }
        function move3()
        {
            shadow.animations.play('move');
            var direction = game.rnd.between(1,2);
            if (direction == 1)
                shadow.body.acceleration.x = -acceleration;
            else
            {
                shadow.scale.x = -1;
                shadow.body.acceleration.x = acceleration;
            }
        }
        var shadow = shadowGroup.getFirstDead();
        if (shadow === null || shadow === undefined || dead) return;
        shadow.revive();

        shadow.checkWorldBounds = true;
        shadow.outOfBoundsKill = true;
        shadow.angle = 0;
        shadow.reset(game.rnd.between(50,750), 100);
        shadow.scale.x = 1;
        shadow.animations.play('spawn');
        shadow.poison = false;
        game.time.events.add((game.rnd.frac() * Phaser.Timer.SECOND * 7) + 2, grow3, this);
    }
    
    function spawnHeart()
    {
        function grow3()
        {
            heart.animations.play('grow');
            game.time.events.add((Phaser.Timer.SECOND), move3, this);
        }
        function move3()
        {
            heart.poison = true;
            heart.animations.play('move');
            game.time.events.add((Phaser.Timer.SECOND * 3), selfdestruct, this);
        }
        function selfdestruct()
        {
            heart.kill();
        }
        var heart = heartGroup.getFirstDead();
        if (heart === null || heart === undefined || dead) return;
        heart.revive();
        heart.checkWorldBounds = true;
        heart.outOfBoundsKill = true;
        heart.reset(game.rnd.between(50,750), 100);
        heart.scale.x = 1;
        heart.animations.play('spawn');
        heart.poison = false;
        game.time.events.add((game.rnd.frac() * Phaser.Timer.SECOND * 7) + 2, grow3, this);
    }
    
    function checkCollision(player, enemy)
    {
        function killNow()
        {
            enemy.kill();
        }
        if (enemy.poison) //poison is when enemy can do damage to you
        {
            if (enemy.body.touching.up & !enemy.isShadow)
            {
                enemy.poison = false;
                enemy.position.y = enemy.position.y - 50;
                enemy.body.velocity.y = -50;
                player.body.velocity.y = -1000;
                enemy.angle = 180;
                game.time.events.add((Phaser.Timer.SECOND * .4), killNow, this);
                counter += 1;


                //game.world.remove(instr);
                //instr = game.add.text(710, 35, ' ' + counter, { font: "36px Verdana", fill: "#ffffff", align: "left" });
                game.world.remove(score);
                score = game.add.text(710, 35, ' ' + counter, { font: "36px Verdana", fill: "#ffffff", align: "left" });
                var explosionAnimation = explosions.getFirstExists(false);
                explosionAnimation.reset(player.x, player.y);
                explosionAnimation.play('kaboom', 10, false, true);
                keySound.play('', 0, 0.5);
            }
            else
            {
                if (lifeCounter == 0)
                    killPlayer(player, enemy); 
                if (!player.invincible)
                {
                    player.body.velocity.y = -1000;
                    lifeCounter--;
                    caught.play();
                    game.world.remove(lives);
                    //game.world.bringToTop(lives);
                    lives = game.add.text(540, 35, ' ' + lifeCounter, { font: "36px Verdana", fill: "#ffffff", align: "left" });
                    toggleInvincible();
                    game.time.events.add(2000, toggleInvincible, this);
                }
            }
        }
        else
        {
            if (enemy.body.touching.down)
            {
                if (player.body.touching.down)
                    player.body.velocity.y = -50;
                enemy.body.velocity.y = -100;  
            }
        }
        
    }
    
    function killPlayer(player, enemy)
    {
        dead = true;
        player.frame = 14;
        player.angle = 90;
        instr3 = game.add.sprite(0,0, 'dead');
        game.paused = true;
        game.input.onTap.addOnce(restart,this); 
    }
    
    function gainLife(player, heart)
    {
        if (heart.poison)
        {
            lifeCounter++;
            game.world.remove(lives);
            lives = game.add.text(540, 35, ' ' + lifeCounter, { font: "36px Verdana", fill: "#ffffff", align: "left" });
            var lifeAnimation = lifeEffect.getFirstExists(false);
            lifeAnimation.reset(player.x, player.y);
            lifeAnimation.play('life', 10, false, true);
            escape.play();
            heart.kill();
        }
    }
    
    function toggleInvincible()
    {
        player.invincible = !player.invincible;
        if (player.invincible)
            player.tint = 0x6e0e10;
        else
            player.tint = 0xffffff;
    }
    
    function start()
    {
        //text.kill();
        game.world.bringToTop(background);
        game.world.bringToTop(platform);
        game.world.bringToTop(counter);
        game.world.bringToTop(score);
        game.world.bringToTop(instr);
        game.world.bringToTop(lives);
       // game.time.events.add((Phaser.Timer.SECOND * 2), remove, this);
        
    }
    function remove()
    {
        instr2.kill();
    }
     
    
     function restart () {    
     
      dead=false; //revive the player
      game.world.bringToTop(instr);
      //reset the lifecount for the player
      game.world.remove(lives);
      lifeCounter=2;
      lives = game.add.text(540, 35, ' ' + lifeCounter, { font: "36px Verdana", fill: "#ffffff", align: "left" });
      //reset the score of the game
      game.world.remove(score);
      counter=0;
      score = game.add.text(710, 35, ' ' + counter, { font: "36px Verdana", fill: "#ffffff", align: "left" });
      player.angle=0; //bring the player upright
      game.paused = false; //unpause the game
      game.world.remove(instr3);      
      
  }

    function actionOnClick () {
        startScreen.visible =! startScreen.visible;
        game.world.remove(button);
        game.world.remove(howToPlay);
         game.time.events.add((Phaser.Timer.SECOND * 4), spawnEnemy, this);
        game.time.events.add((Phaser.Timer.SECOND * 3), spawnSnow, this);
        game.time.events.add((Phaser.Timer.SECOND * 1), start, this);
        this.game.time.events.loop(50, function() {  //this.game.add.tween(text).to({x: game.rnd.between(-10, 10), y: game.rnd.between(-10, 10)}, 1750, Phaser.Easing.Quadratic.InOut, true);}, this);
        //this.game.time.events.loop(2000, function() {  
            
        this.game.add.tween(background).to({x: game.rnd.between(-10, 10), y: game.rnd.between(-5, 0)}, 200, Phaser.Easing.Quadratic.InOut, true);}, this);
        this.game.time.events.loop(1500, function() { this.game.add.tween(platform).to({x: game.rnd.between(-10, 10), y: game.rnd.between(-5, 5)}, 1750, Phaser.Easing.Quadratic.InOut, true);}, this);
    } 
 
   

    function render() {
    // Sprite debug info
    //game.debug.spriteBounds(player);
    }
    
}
