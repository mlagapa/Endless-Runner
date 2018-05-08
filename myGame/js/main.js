// main.js for Endless Runner
// Michael Lagapa
// State switching adapted from Nathan's example
// * Code denoted with one star was adapted from John Watson at https://gamemechanicexplorer.com/#lighting-2 *
// ** Code denoted with two stars was adapted from Lessmilk at http://www.lessmilk.com/tutorial/flappy-bird-phaser-1 **
// *** Parallax Scrolling was adapted from https://www.joshmorony.com/how-to-create-a-parallax-background-in-phaser/ ***
// **** Audio was adapted from the Phaser website http://examples.phaser.io/_site/view_full.html?d=audio&f=loop.js&t=loop
// and Nathan's code ****

var game = new Phaser.Game(1200, 600, Phaser.AUTO);

// sets up a state for the main menu
var MainMenu = function(game) {};

// preload, create, and update functions for the main menu state
MainMenu.prototype = {
	
    // load main menu assets
    preload: function() {
		this.game.load.image('mainMenu', 'assets/img/mainMenu.png');
	},
    
	create: function() {
		game.stage.backgroundColor = "#000000"; // sets background color to black
        this.mainMenu = this.game.add.tileSprite(0, this.game.height - this.game.cache.getImage('mainMenu').height, this.game.width, this.game.cache.getImage('mainMenu').height, 'mainMenu');
    
	},
    
	update: function() {
        
        // pressing the enter key switches the state to the Gameplay state
		if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
			game.state.start('GamePlay');
		}
	}
}

// sets up a state for gameplay
var GamePlay = function(game) {};
var player; // initalizes variable for player character
var score = 0;
var music;

GamePlay.prototype = {
    
    // gameplay assets 
	preload: function() {
		console.log('GamePlay: preload');
        this.game.load.atlas('bug', 'assets/img/firefly.png', 'assets/img/firefly.json'); // texture atlas for firefly, includes png and json files
        this.game.load.image('jar', 'assets/img/jar.png');
        this.game.load.image('sky', 'assets/img/sky.png');
        this.game.load.image('mountains', 'assets/img/mountains.png');
        this.game.load.audio('music', 'assets/audio/calmNight.mp3');
        
	},
    
	create: function() {
        
		game.stage.backgroundColor = "#0c3372"; // gives background a dark blue color
        this.sky = this.game.add.tileSprite(0, this.game.height - this.game.cache.getImage('sky').height, this.game.width, this.game.cache.getImage('sky').height, 'sky'); //initializes sky in background
        this.mountains = this.game.add.tileSprite(0, this.game.height - this.game.cache.getImage('mountains').height, this.game.width, this.game.cache.getImage('mountains').height, 'mountains'); // initializes mountains in background
        
        textGroup = game.add.group(); // creates a group for the score
        this.jars = game.add.group(); // creates a group for jars
        
        game.physics.startSystem(Phaser.Physics.ARCADE); // applies arcade physics to game
        player = game.add.sprite(120, 90, 'bug'); // loads images from texture atlas
        player.animations.add('fly'); // creates an animation called 'fly'
        player.animations.play('fly', 120, true); // sets flying animation to play on a loop, even when idle, frames are at 120 so the wings flap faster
        game.physics.arcade.enable(player); // applies arcade physics to player
        player.body.collideWorldBounds = true; // prevents player from leaving the screen
        
        scoreText = game.add.text(5, 5, 'Score: 0', {font: 'Verdana', fontSize: '32px', fill: '#fff' }); // places score text at the top left
        textGroup.add(scoreText); // adds the score to the score group


    // * variable for firefly's glow
    this.LIGHT_RADIUS = 250;

    // creates a shadow texture to cover the screen
    this.shadowTexture = this.game.add.bitmapData(this.game.width, this.game.height);

    // creates object for texture to be stored on
    var lightSprite = this.game.add.image(0, 0, this.shadowTexture);

    // blend mode to MULTIPLY. This will darken the colors of
    // everything below this sprite.
    lightSprite.blendMode = Phaser.blendModes.MULTIPLY;
        
        this.timer = game.time.events.loop(2500, this.addRowOfJars, this);

        // End *

        // **** adds game music
        this.music = game.add.audio('music');
        this.music.play('', 0, 1, true);
        // End ****
	},
    
	update: function() {
        
        // *** Parallax
        this.sky.tilePosition.x -= 0.05; // sets sky to pan left
        this.mountains.tilePosition.x -= 0.3; // sets mountains to pan left, faster than sky
        // End *** 

        
        // * Gives shadow texture a black fill that covers the screen
    this.shadowTexture.context.fillStyle = 'rgb(30, 30, 30)';
    this.shadowTexture.context.fillRect(0, 0, this.game.width, this.game.height);
        // End *
        
    // movement taken from first game, applied to vertical and horizontal movement
    cursors = game.input.keyboard.createCursorKeys();
    lightButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
    //  sets player movement to 0
//    player.x = 0;
//    player.y = 0;
    player.body.velocity.x = 0;
    player.body.velocity.y = 0;
    

    if (cursors.left.isDown)
    {
        //  moves the player left
        player.body.velocity.x = -300;
    }
     if (cursors.right.isDown)
    {
        //  moves the player right
        player.body.velocity.x = 300;
    }
     if (cursors.up.isDown)
    {
        //  moves the player up
        player.body.velocity.y = -300;
    }
     if (cursors.down.isDown)
    {
        //  moves the player down
        player.body.velocity.y = 300;
    }
        
        // Spacebar to toggle firefly light
     if (lightButton.isDown){
         this.lightOn();
    }
     else if (!lightButton.isDown){
            this.lightOff();
    }
    
        game.world.bringToTop(textGroup); // Puts score over shadow texture mask
        

        game.physics.arcade.overlap(player, this.jars, this.hitJar, null, this); // ** Calls function
        // hitJar to play when the player and jar sprites overlap 
        // End **
        
	},
    
    // * Creates "light" around firefly
    lightOn: function(){
        
    // creates a radial gradient on the shadow texture starting from the
    // firefly's (player's) body.
     var gradient = this.shadowTexture.context.createRadialGradient(player.body.x + 70, player.body.y + 55, this.LIGHT_RADIUS * 0.75, player.body.x + 70, player.body.y + 55, this.LIGHT_RADIUS);
        
    // adds a slightly green hue to the gradient
    gradient.addColorStop(0, 'rgba(175, 255, 175, 1.0)');
    gradient.addColorStop(1, 'rgba(175, 255, 175, 0.0)');
    
    // Uses beginPath and arc methods to create the radius of the light
    this.shadowTexture.context.beginPath(); 
    this.shadowTexture.context.fillStyle = gradient;
    this.shadowTexture.context.arc(player.body.x + 70, player.body.y + 55, this.LIGHT_RADIUS, 0, Math.PI*2);
    this.shadowTexture.context.fill();
    
    this.shadowTexture.dirty = true; // updates texture cache so that the shadow texture shows up
         
    },
    
    // Same as light on function, except with a "light" that matches the color of the shadow filter
    lightOff: function() {

    var gradient = this.shadowTexture.context.createRadialGradient(player.body.x + 70, player.body.y + 55, this.LIGHT_RADIUS * 0.75, player.body.x + 70, player.body.y + 55, this.LIGHT_RADIUS);
        
    gradient.addColorStop(0, 'rgba(30, 30, 30, 1.0)');
    gradient.addColorStop(1, 'rgba(30, 30, 30, 0.0)');

    this.shadowTexture.context.beginPath();
    this.shadowTexture.context.fillStyle = gradient;
    this.shadowTexture.context.arc(player.body.x + 70, player.body.y + 55, this.LIGHT_RADIUS, 0, Math.PI*2);
    this.shadowTexture.context.fill();

    this.shadowTexture.dirty = true;
        
    // End *
        
},
    
    // ** Function to create jars
    addJar: function(x, y) {
    // creates jar at postions x and y
    var jar = game.add.sprite(x, y, 'jar');

    // adds jar to jars group
    this.jars.add(jar);

    // adds arcade physics to jar 
    game.physics.arcade.enable(jar);
        

    // adds velocity to move jar left
    jar.body.velocity.x = -250; 

    // destroys the jar when the jar leaves thes screen
    jar.checkWorldBounds = true;
    jar.outOfBoundsKill = true;
},
    
    addRowOfJars: function() {
    // randomly picks a y position between 1 and 360 on the screen for jar to spawn, 360 to accomodate for jar sprite size
    var yPos = Math.floor(Math.random() * 360) + 1;
    this.addJar(1200, yPos); // calls addJar funciton to create jar
        score += 1; // increases score by 1
        scoreText.text = 'Score: ' + score; // updates score to reflect actual score
},
    hitJar: function() {
        game.state.start('GameOver'); // switches to GameOver state upon player sprite overlapping with jar sprite
        this.music.pause(); // pauses music for next playthrough
}, 
    // End **
    
    render: function(){
//        game.debug.body(player);
    }
    
}

// sets up game over state
var GameOver = function(game) {};

GameOver.prototype = {

    // loads GameOver assets
    preload: function() {
		this.game.load.image('gameOver', 'assets/img/gameOver.png');
	},
	
    create: function() {
		game.stage.backgroundColor = "#bb11ee";
        this.sky = this.game.add.tileSprite(0, this.game.height - this.game.cache.getImage('gameOver').height, this.game.width, this.game.cache.getImage('gameOver').height, 'gameOver'); // initializes GameOver image
        
        // Game Over Texts
        var endText = "Game Over"; 
        var endText2 = "You scored: " + score;
        var endText3 = "Hit enter to restart."
        
        // Game Over Text Placement
        gameOverText = game.add.text(game.world.centerX, game.world.centerY - 220, endText, { font: 'Verdana', fontSize: '32px', fill: '#fff' });
        gameOverText2 = game.add.text(game.world.centerX, game.world.centerY - 180, endText2, { font: 'Verdana', fontSize: '32px', fill: '#fff'});
        gameOverText3 = game.add.text(game.world.centerX, game.world.centerY - 140, endText3, { font: 'Verdana', fontSize: '32px', fill: '#fff'});
        gameOverText.anchor.setTo(0.50); // sets anchor to the middle of the text, so it's correctly aligned to the center
        gameOverText2.anchor.setTo(0.50);
        gameOverText3.anchor.setTo(0.50);

	},
	
    update: function() {
		// hit enter to return to main menu state
		if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
            score = 0;
			game.state.start('MainMenu');
		}
	}
}

// allows StateManager to recognize states, runs MainMenu state when the game starts
game.state.add('MainMenu', MainMenu);
game.state.add('GamePlay', GamePlay);
game.state.add('GameOver', GameOver);
game.state.start('MainMenu');