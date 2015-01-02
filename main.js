var soundAvailable = true;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var analyser = null;
var levelChecker = null;
var audioContext = new AudioContext();

var prevAverage = 0;
var average = 0;
var prevDifference = 0;
var difference = 0;

var sens = 10;

function hasGetUserMedia() {
  	return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

function error() {
	soundAvailable = false;
	$("#error_div").fadeIn(1000);
}

function gotStream(stream) {
	var mediaStreamSource = audioContext.createMediaStreamSource(stream);
	analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    mediaStreamSource.connect(analyser);
    analyse(mediaStreamSource);
}

var counter = 0;

function analyse(liveSource) {
	levelChecker = audioContext.createScriptProcessor(2048,1,1);
	liveSource.connect(levelChecker);
	levelChecker.connect(audioContext.destination);

	var array = new Uint8Array(analyser.frequencyBinCount);

	levelChecker.onaudioprocess = function(e) {
        analyser.getByteFrequencyData(array);
        var values = 0;

        var length = array.length;
        for (var i = 0; i < length; i++) {
            values += array[i];
        }

        prevAverage = average;
        average = values / length;
        prevDifference = difference;
        difference = average-prevAverage;
        if(average-prevAverage > sens && difference-prevDifference > sens) {
        	if(game.state.current == 'pre') pre_state.startClick();
        	if(game.state.current == 'play') {
        		if(!play_state.started) play_state.startGame();
				if(play_state.bird.alive) play_state.jump();
				else if(play_state.finished) play_state.restart();
			}
        }
    }
}

if(hasGetUserMedia()) {
	try {
        navigator.getUserMedia = 
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;
        navigator.getUserMedia({audio:true},gotStream,error);
    } catch (e) { }
} else
{
	error();
}

function sensitivity(s) {
	sens = s;
}

var game = new Phaser.Game(288, 512, Phaser.AUTO, 'game_div');

var pre_state = {

	preload: function() {
		this.load.image('background','assets/background.png');
		this.load.image('floor','assets/floor.png');
		this.load.image('title','assets/title.png');
		this.load.image('start','assets/start.png');
		this.load.spritesheet('bird','assets/bird.png',34,24,3);
	},

	create: function() {
		this.background = this.game.add.sprite(0,0,'background');

		this.floor = this.game.add.tileSprite(0,400,336,112,'floor');
		this.floor.autoScroll(-130,0);

		this.title = this.game.add.sprite(55,112,'title');

		this.bird = this.game.add.sprite(127,176,'bird');
		this.bird.animations.add('flap');
		this.bird.animations.play('flap',8,true);

		this.game.add.tween(this.bird).to({y:182},350,Phaser.Easing.Linear.NONE,true,0,1000,true);

		this.startButton = this.game.add.button(92,300,'start',this.startClick,this);
	},

	update: function() {
		
	},

	startClick: function() {
		game.state.start('play');
	}

}

var play_state = {

	preload: function() {
		this.load.image('background','assets/background.png');
		this.load.image('floor','assets/floor.png');
		this.load.image('getready','assets/getready.png');
		this.load.image('0','assets/0.png');
		this.load.image('1','assets/1.png');
		this.load.image('2','assets/2.png');
		this.load.image('3','assets/3.png');
		this.load.image('4','assets/4.png');
		this.load.image('5','assets/5.png');
		this.load.image('6','assets/6.png');
		this.load.image('7','assets/7.png');
		this.load.image('8','assets/8.png');
		this.load.image('9','assets/9.png');
		this.load.image('0small','assets/0small.png');
		this.load.image('1small','assets/1small.png');
		this.load.image('2small','assets/2small.png');
		this.load.image('3small','assets/3small.png');
		this.load.image('4small','assets/4small.png');
		this.load.image('5small','assets/5small.png');
		this.load.image('6small','assets/6small.png');
		this.load.image('7small','assets/7small.png');
		this.load.image('8small','assets/8small.png');
		this.load.image('9small','assets/9small.png');
		this.load.image('scoreboard', 'assets/scoreboard.png');
    	this.load.image('gameover', 'assets/gameover.png');
    	this.load.image('start','assets/start.png');
    	this.load.image('new','assets/new.png');
    	this.load.spritesheet('medals', 'assets/medals.png',44,44,4);
		this.load.spritesheet('bird','assets/bird.png',34,24,3);
		this.load.spritesheet('pipe','assets/pipes.png',54,320,2);
		this.load.audio('score',['assets/point.mp3','assets/point.ogg']);
		this.load.audio('flap',['assets/wing.mp3','assets/wing.ogg']);
		this.load.audio('hit',['assets/hit.mp3','assets/hit.ogg']);
		this.load.audio('die',['assets/die.mp3','assets/die.ogg']);
		this.load.audio('swoosh',['assets/swooshing.mp3','assets/swooshing.ogg']);
	},

	create: function() {
		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.physics.arcade.gravity.y = 1200;

		this.background = this.game.add.sprite(0,0,'background');

		this.pipes = game.add.group();
		this.pipes.createMultiple(6,'pipe');

		this.floor = this.game.add.tileSprite(0,400,336,112,'floor');
		this.floor.autoScroll(-130,0);
		this.game.physics.arcade.enableBody(this.floor);
		this.floor.body.allowGravity = false;
		this.floor.body.immovable = true;

		this.bird = this.game.add.sprite(67,250,'bird');
		this.bird.anchor.setTo(0.5,0.5);
		this.bird.animations.add('flap');
		this.bird.animations.play('flap',8,true);
		this.game.physics.arcade.enableBody(this.bird);
		this.bird.body.allowGravity = false;
		this.bird.body.collideWorldBounds = true;
		this.bird.alive = true;

		this.getReady = this.game.add.sprite(52,125,'getready');

		this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
		if(!soundAvailable) {
			this.game.input.onDown.addOnce(this.startGame,this);
    		this.game.input.onDown.add(this.jump,this);
			this.space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
			this.space_key.onDown.addOnce(this.startGame,this);
    		this.space_key.onDown.add(this.jump,this);
    	}

    	this.score = 0;
    	this.scoreGroup = this.game.add.group();

    	this.scoreSound = this.game.add.audio('score');
    	this.flapSound = this.game.add.audio('flap');
    	this.hitSound = this.game.add.audio('hit');
    	this.dieSound = this.game.add.audio('die');
    	this.swooshSound = this.game.add.audio('swoosh');

    	this.updateScore();

    	this.scoreBoardVisible = false;
    	this.scoreBoard = this.game.add.group();
    	this.gameOver = this.game.add.sprite(48,100,'gameover');
    	this.gameOver.alpha = 0;
    	this.scoreBoard.scoreBoard = this.scoreBoard.create(31,200,'scoreboard');
    	this.scoreBoard.startButton = this.game.add.button(92,330,'start',this.restart,this);
    	this.scoreBoard.add(this.scoreBoard.startButton);
    	this.scoreBoard.scoreText = this.game.add.group();
    	this.scoreBoard.add(this.scoreBoard.scoreText);
    	this.scoreBoard.bestText = this.game.add.group();
    	this.scoreBoard.add(this.scoreBoard.bestText);
    	this.scoreBoard.y = 512;
    	this.scoreBoard.x = 0;

    	this.started = false;
    	this.finished = false;

	},

	update: function() {
		this.game.physics.arcade.collide(this.bird,this.floor,this.death,null,this);
		this.pipes.forEach(function(pipe) {
			if(pipe.frame == 0 && pipe.exists && !pipe.hasScored && pipe.world.x < this.bird.world.x) {
				pipe.hasScored = true;
				this.score ++;
				this.scoreSound.play();
				this.updateScore();
			}
			if(this.bird.alive) this.game.physics.arcade.collide(this.bird,pipe,this.hitPipe,null,this);
		},this);

		if(this.bird.angle < 90 && this.bird.body.velocity.y > 200) this.bird.angle += 5;
	},

	jump: function() {
		if(!this.bird.alive) return;
		this.flapSound.play();
		this.game.add.tween(this.bird).to({angle:-20},100).start();
		if(soundAvailable) this.bird.body.velocity.y = -330;
		else this.bird.body.velocity.y = -370;
	},

	generatePipes: function() {
		var pipeY = this.game.rnd.integerInRange(100,300);
		var topPipe = this.pipes.getFirstDead();
		topPipe.reset(288,pipeY-375);
		topPipe.frame = 0;
		this.game.physics.arcade.enableBody(topPipe);
		topPipe.body.allowGravity = false;
		topPipe.body.immovable = true;
		topPipe.body.velocity.x = -130;
		topPipe.checkWorldBounds = true;
		topPipe.outOfBoundsKill = true;
		topPipe.hasScored = false;
		var bottomPipe = this.pipes.getFirstDead();
		bottomPipe.reset(288,pipeY+55);
		bottomPipe.frame = 1;
		this.game.physics.arcade.enableBody(bottomPipe);
		bottomPipe.body.allowGravity = false;
		bottomPipe.body.immovable = true;
		bottomPipe.body.velocity.x = -130;
		bottomPipe.checkWorldBounds = true;
		bottomPipe.outOfBoundsKill = true;
	},

	startGame: function() {

		if(!this.bird.alive) return;

		this.started = true;

		this.bird.body.allowGravity = true;

		this.pipeGenerator = this.game.time.events.loop(1200,this.generatePipes,this);
		this.pipeGenerator.timer.start();

		this.getReady.destroy();
	},

	updateScore: function() {
		this.scoreGroup.destroy(true);
		this.scoreGroup = this.game.add.group();
		this.scoreString = this.score.toString();
		var width = 0;
		var fullWidth = 0;
		var character = '';
		for(var i = 0; i < this.scoreString.length; i ++) {
			character = this.scoreString.charAt(i);
			if(character == 1) fullWidth += 12;
			else fullWidth += 20;
		}
		var startX = (288-fullWidth)/2;
		for(var i = 0; i < this.scoreString.length; i ++) {
			character = this.scoreString.charAt(i);
			this.scoreGroup.add(this.game.add.sprite(startX+width,45,character));
			if(character == 1) width += 12;
			else width += 20;
		}
	},

	hitPipe: function() {
		if(!this.bird.alive) return;
		this.hitSound.play();
		setTimeout(function() { play_state.dieSound.play(); },300);
		this.stopGame();
		if(!this.scoreBoardVisible) setTimeout(function() { play_state.showGameOver(); },500);
		if(!this.scoreBoardVisible) setTimeout(function() { play_state.showScoreBoard(); },1000);
	},

	death: function() {
		this.game.add.tween(this.bird).to({angle:90},100).start();
		if(!this.bird.alive) return;
		this.hitSound.play();
		this.stopGame();
		if(!this.scoreBoardVisible) setTimeout(function() { play_state.showGameOver(); },500);
		if(!this.scoreBoardVisible) setTimeout(function() { play_state.showScoreBoard(); },1000);
	},

	stopGame: function() {
		this.bird.alive = false;
		this.bird.body.velocity.x = 0;
		this.bird.animations.stop();
		this.pipes.forEach(function(pipe) {
			if(pipe.exists) pipe.body.velocity.x = 0;
		},this);
		this.pipeGenerator.timer.stop();
		this.floor.stopScroll();
	},

	updateScoreboardScore: function(score) {
		this.scoreBoard.scoreText.destroy(true);
		this.scoreBoard.scoreText = this.game.add.group();
		this.scoreBoard.add(this.scoreBoard.scoreText);
		this.scoreString = score.toString();
		var width = 0;
		var fullWidth = 0;
		var character = '';
		for(var i = 0; i < this.scoreString.length; i ++) {
			character = this.scoreString.charAt(i);
			if(character == 1) fullWidth += 8;
			else fullWidth += 12;
		}
		var startX = 232-fullWidth;
		for(var i = 0; i < this.scoreString.length; i ++) {
			character = this.scoreString.charAt(i);
			this.scoreBoard.scoreText.add(this.scoreBoard.create(startX+width,234,character+'small'));
			if(character == 1) width += 8;
			else width += 12;
		}
	},

	updateScoreboardBestScore: function(score) {
		this.scoreBoard.bestText.destroy(true);
		this.scoreBoard.bestText = this.game.add.group();
		this.scoreBoard.add(this.scoreBoard.bestText);
		this.scoreString = score.toString();
		var width = 0;
		var fullWidth = 0;
		var character = '';
		for(var i = 0; i < this.scoreString.length; i ++) {
			character = this.scoreString.charAt(i);
			if(character == 1) fullWidth += 8;
			else fullWidth += 12;
		}
		var startX = 232-fullWidth;
		for(var i = 0; i < this.scoreString.length; i ++) {
			character = this.scoreString.charAt(i);
			this.scoreBoard.bestText.add(this.scoreBoard.create(startX+width,276,character+'small'));
			if(character == 1) width += 8;
			else width += 12;
		}
	},

	showGameOver: function() {
		this.scoreGroup.destroy();
		this.game.add.tween(this.gameOver).to({y:120,alpha:1}, 200, Phaser.Easing.Linear.None, true);
	},

	showScoreBoard: function() {
		this.scoreBoardVisible = true;
		this.swooshSound.play();
		this.game.add.tween(this.scoreBoard).to({y: 0}, 300, Phaser.Easing.Linear.None, true);
		this.game.input.keyboard.removeKey(Phaser.Keyboard.SPACEBAR);
		this.incrementScore(0);
		this.bestScore = this.score;
		if(!!localStorage) {
			this.bestScore = localStorage.getItem('bestScore');
			if(!this.bestScore || this.bestScore < this.score) {
				this.bestScore = this.score;
				localStorage.setItem('bestScore',this.bestScore);
				this.scoreBoard.add(this.game.add.sprite(167,258,'new'));
			}
		}
		this.updateScoreboardBestScore(this.bestScore);
		this.medal = -1;
		if(this.score > 10) this.medal = 0;
		if(this.score > 20) this.medal = 1;
		if(this.score > 30) this.medal = 2;
		if(this.score > 40) this.medal = 3;
		if(this.medal > -1) {
			medal = this.game.add.sprite(57,242,'medals',this.medal);
    		this.scoreBoard.add(medal);
		}
		setTimeout(function() { play_state.finished = true; },1000);
	},

	incrementScore: function(score) {
		this.updateScoreboardScore(score);
		if(score < this.score) setTimeout(function() { play_state.incrementScore(score+1); },50);
	},

	restart: function() {
		game.state.start('play');
	}

}

game.state.add('pre',pre_state);
game.state.add('play',play_state)
game.state.start('pre');