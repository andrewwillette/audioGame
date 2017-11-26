window.onload = function(){main()}

//TODO ::

//Get three decent beats on shelves
//	light up pads when I step on them

//	have shelf.area.length be determined by length of string in Audio/....
//  put a throttle on jump detection with pads so as not to bounce... 

var game;
var canvasWidth = 1100;
var canvasHeight = 600;

var resources = {};

var soundFiles = ["Audio/Love_Galore.wav", "Audio/Agony.mp3"];
var soundText = ["Love Galore", "Agony and Ecstacy"];

function main(){
    console.log("working");
	var body = $("body");
	
	var lightBlueColor = "#F0F8FF";
    var blackColor = "#000";
    var whiteColor = "#fff";
    
    body.html("<br /><br /><br /><p><canvas id='canvas' width='" + canvasWidth + "' height='" + canvasHeight + "'></canvas></p>");
    body.css("background", whiteColor);
    body.css('color', whiteColor);
    var qCanvas = $("#canvas");
    var canvas = qCanvas.get(0);
    qCanvas.css("background", lightBlueColor);
    qCanvas.css("display", "block");
    qCanvas.css("margin", "0 auto 0 auto");
    // qCanvas.css("border", "1px solid white");
    var ctx = canvas.getContext("2d", {alpha: false});
    ctx.imageSmoothingEnabled = false;
    
    var FPS = 30;

    /* load all resources */
	resources.playerImage = new Image();
	resources.playerImage.src = "ImagesNew/runRight0.png";
	resources.shelfImage = new Image();
	resources.shelfImage.src = "Images/Shelf.png";
	resources.dotImage = new Image();
	resources.dotImage.src = "Images/dot.jpg";
	

    
	
	SetUpScreen(MainScreen);

	var last = -1;

    var fpsList = [0];

    window.addEventListener('keyup', function(event) { if(Key.isDown(event.keyCode)) { Key.onKeyup(event); } event.preventDefault(); }, false);
    window.addEventListener('keydown', function(event) { if(!Key.isDown(event.keyCode)) { Key.onKeydown(event); } event.preventDefault(); }, false);

	function gameloop(ts) {
        var inc = 0;
        if(last === -1) {
            last = ts;
        } else {
            inc = ts - last;
            last = ts;
        }

        game.update(inc);
        game.draw(ctx, inc);

        window.requestAnimationFrame(gameloop);
    }
    window.requestAnimationFrame(gameloop);
}


function Vector2(x, y) {
    this.x = x;
    this.y = y;
}

function Vector4(x,y,width,height){
	this.x = x;
	this.y = y;
	this.width=width;
	this.height=height;
}



function SetUpScreen(screen) {
    
    game = new screen();
    game.init();

}




function MainScreen() {

    this.init = function() {
    	this.gameSpeed = 1;
        this.selected = 0;
        //initialize new player object
        this.player = new Player();
        this.shelves = new Shelves();
    };

    this.update = function(deltaTime) {
        //should call player update function : should do collision, moving the player, if you press left or right it should 
        this.player.update(deltaTime * this.gameSpeed,this.shelves.shelves);
        this.shelves.update();
    };

    this.draw = function(ctx, deltaTime) {
    	//Clear rectangle, prepare to draw on components
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = '#E0FFFF'; // sets the color to fill in the rectangle with
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    	ctx.strokeStyle="#000000";
		ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
        //Draw player
        this.player.draw(ctx);
        this.shelves.draw(ctx);
    };

}


function Player() {  
    this.pos = new Vector2(50, 50);
    this.vel = new Vector2(0, 0);
    this.speed = 0.2;
    //for every draw, loop through the six frames
    this.imageFrames = 6;
    this.imageCounter = 0;
    this.radius=73;
    this.onGround = false;
    this.jumpHeight = -3;

	this.areaWidth = 60;
	this.areaHeight = 84;

	
	
	this.area = new Vector4(this.pos.x,this.pos.y,this.areaWidth,this.areaHeight);
	
	
    
	 
    this.update = function (deltaTime,shelves) {
    	//Allows for equal speed in any 2d direction
        //const invNorm = 1/Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
        
        //check if left is pressed, velocity.x = -1, if right is pressed, velocity.x = 1
        
        this.vel.x = ((Key.isDown(Key.LEFT) || Key.isDown(Key.A)) ? -1 : 0) + ((Key.isDown(Key.RIGHT) || Key.isDown(Key.D)) ? 1 : 0);

       	//instantiate gravity
        if(!this.onGround){
        	this.vel.y += .1;
        	
        }
        if(this.onGround){
        	this.vel.y = 0;

        	//allowed to jump if on ground
        	if(Key.isDown(Key.SPACE)){

        		this.vel.y = this.jumpHeight;
        	}

        	this.onGround=false;
        }

        
        //set 
        this.pos.x += this.vel.x * deltaTime * this.speed;
        this.pos.y += this.vel.y * deltaTime * this.speed;



        //Keep track of action in x direction for cycling through running frames
        if(this.vel.x < 0){
        	this.imageCounter = (this.imageCounter + 1) % this.imageFrames;
        	resources.playerImage.src = "ImagesNew/runLeft" + this.imageCounter +".png";
        }
        if(this.vel.x > 0){
        	this.imageCounter = (this.imageCounter + 1) % this.imageFrames;
        	resources.playerImage.src = "ImagesNew/runRight" + this.imageCounter +".png"; 	
	    }
	    if(this.vel.x == 0){
	    	resources.playerImage.src = "ImagesNew/noRun.png";
	    }

	    // collide with bottom of screen
        if((this.pos.y + this.area.height) > canvasHeight) {
            this.pos.y = canvasHeight-this.area.height; 
            this.onGround=true;
            //mute audio when you land on ground
            
                 
        }
        //collide with the ceiling
        if(this.pos.y< 0){
        	this.pos.y = 0;
        }
        //collide with right wall
        if(this.pos.x + this.area.width > canvasWidth) {
            this.pos.x = canvasWidth-this.radius;
            
        }
        //collide with left wall
        if(this.pos.x< 0){
        	this.pos.x = 0;
        }

        //update player area
        this.area = new Vector4(this.pos.x,this.pos.y,60,84);

        for (shelf in shelves){
    
	        //if landing on top of shelf
	        if (this.area.y + this.area.height > shelves[shelf].area.y && this.area.y + this.area.height < shelves[shelf].area.y + shelves[shelf].area.height && 
	        this.area.x >= shelves[shelf].area.x && this.area.x + this.area.width <= shelves[shelf].area.x + shelves[shelf].area.width){
	        	//if falling down, land on shelf
	        	if(this.vel.y > 0){
	        		//if audio has not started, start it
	        
	        		// if (shelves[shelf].audio.currentTime == 0){
	        			
	        		// 	shelves[shelf].audio.play();
	        		// }
	        		//else unpause it
	        		shelves[shelf].audio.play();

	        		this.onGround = true;
	        		this.pos.y = shelves[shelf].area.y - this.area.height;
	        	}
	        	
	        	//if landing on the ground, turn off audio of shelf
        	
	        	
	        	
	        }
	        else{
	        	

	        	shelves[shelf].audio.pause();
	        }
    	}	
    };
    this.draw = function (ctx) {
        const mX = this.pos.x;
        const mY = this.pos.y;
        
        ctx.drawImage(resources.playerImage, mX, mY);    
     	
        
        
    };
}

//instanstiate a shelf for each audio file
function Shelves(){
	//this.shelves = new Shelf(soundFiles[0]);
	this.shelves=[];
	mX = canvasWidth*(1/5);
	mY = canvasHeight-130;
	for( x in soundFiles){
		

		
		this.shelves[x] = new Shelf(soundFiles[x],soundText[x],mX,mY);
		
		mX = mX + 300;
	}
	//make a shelf for each sound file
	// for(i in soundFiles){
	// 	this.shelves += Shelf(soundFiles[i]);
	// }

	this.update = function(){
		//check if player is on shelf, play audio if so, otherwise cut
		for(x in this.shelves){
			this.shelves[x].update();
		}
		
	}
	this.draw = function(ctx){
		for(x in this.shelves){
			
			this.shelves[x].draw(ctx);
		}
		
		
	}
}

function Shelf(audio, text, x , y){
	this.audio = new Audio(audio);
	this.pos = new Vector2(x,y);
	this.text = text;
	areaWidth = 250;
	areaHeight = 20;
	
	this.area = new Vector4(this.pos.x,this.pos.y,areaWidth,areaHeight);
	this.onShelf = false;
	
	
	this.update = function(){
		
		
	}
	this.draw = function(ctx){
		
		
		mX = this.pos.x;
		mY = this.pos.y;


		ctx.fillStyle="#FFF";
		ctx.fillRect(mX,mY,areaWidth,areaHeight);
		
		ctx.font = ctx.font = "15px Arial";
		ctx.fillStyle = "#000000";
		textWidth = ctx.measureText(this.text).width;
		textY = mY + 15;
		textX = (mX + this.area.width - textWidth + mX) / 2;
		console.log(this.area.x);
		console.log(textX);
		
		// textX - mX = (mX+areaWidth - (textX + ctx.measureText(this.text).width))
		ctx.fillText(this.text,textX,textY);
	}
}

//returns true or false if objects are colliding
function checkCollision(rect1,rect2){
	//if(objectOne.area overlaps objectTwo.area)
	if (rect1.x < rect2.x + rect2.width &&
	rect1.x + rect1.width > rect2.x &&
	rect1.y < rect2.y + rect2.height &&
	rect1.height + rect1.y > rect2.y) {
    	return true;
	}
	return false;
}

var Key = {
    _pressed: {},
    _lastPressed: {},

    ENTER: 13,
    ESC: 27,
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    A: 65,
    D: 68,
    S: 83,
    W: 87,

    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },

    pressed: function (keyCode) {
      return this._pressed[keyCode] && undefined === this._lastPressed[keyCode];
    },

    released: function (keyCode) {
        return (undefined === this._pressed[keyCode]) && this._lastPressed[keyCode];
    },

    onKeydown: function(event) {
        this._pressed[event.keyCode] = true;
    },

    onKeyup: function(event) {
        delete this._pressed[event.keyCode];
    },

    flush: function() {
        this._lastPressed = jQuery.extend({}, this._pressed);
    }
};
