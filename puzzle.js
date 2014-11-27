/**
 * Jigsaw Puzzle
 * 
 * Puzzle is a flat space-filling and solution-arranging game. 
 * Players will require put all zero-piece pattern together, then the whole plane will show.
 *
 * @author Nemo
 * @version 2.8
 * 
 * @param  COLNUM  The column number of puzzle
 * 
 */
var PuzzleGame = (function(){

	var cols = 3;
	var raws = cols;
	var width = 400;
	var height = width;
	var imageName = "background0.jpg"

	function PuzzleGame(){
		this.setScreen();
		this.game = new Game();
	}
	PuzzleGame.prototype.setScreen = function(){
		var canvas = document.getElementById("puzzle_area");
		if(canvas.scrollWidth < 400){
			canvas.width = document.getElementById('puzzle_wall').clientWidth;
			canvas.height = canvas.width;
			width = height = canvas.width;
		}else{
			canvas.width = width;
			canvas.height = height;
		}
	}

	function ImgLoader(src){
		var path = "resource/"
		this.image = new Image();
		this.image.src = path + imageName;
	}
	//each piece of the whole puzzle map
	function Block(sx, sy, sw, dx, dy, dw){
		this.imgLoader = new ImgLoader();
		this.image = this.imgLoader.image;
		this.left = sx;
		this.top = sy;
		this.origin_block = sw;
		this.x = dx;
		this.y = dy;
		this.width = dw;
		this.height = dw;
	}
	Block.prototype.draw = function(context){
		context.drawImage(this.image, this.left, this.top, this.origin_block, this.origin_block, this.x, this.y, this.width, this.height);
	}

	//The puzzle map
	function Board(n, w, h){
		this.cols = n || cols;
		this.total_num = this.cols * this.cols;
		this.width = w || width; 
		this.height = h || height;
		this.blockSize = this.width / this.cols;
		this.canvas = document.getElementById("puzzle_area");
		this.ctx = this.canvas.getContext('2d');

		this.block = new Block();
		this.puzzle = new Array();
		this.emptyPosition = [0,0];

		this.step = 0;
		this.show_step = document.getElementById("step");
	}
	Board.prototype = {
		init:function(){
			this.ctx.clearRect(0,0,this.width,this.height);
			this.initGrid();
			this.drawGrid();
		//	this.shuffle();
		//	this.addHandlerToBlock();
		},
		initGrid:function(){
			var old_blockSize = 400 / this.cols;
			for(var i = 0; i < this.total_num; i++){
				var sx = (i % this.cols) * old_blockSize;
				var sy = parseInt(i / this.cols) * old_blockSize;
				var x = (i % this.cols) * this.blockSize;
				var y = parseInt(i / this.cols) * this.blockSize;
				//don't draw the last part of puzzle
				if(i != this.total_num - 1){
					this.puzzle[i] = new Block(sx, sy, old_blockSize, x, y, this.blockSize);
					this.puzzle[i].draw(this.ctx);
				}
				else{//record the empty position
					this.emptyPosition = [x, y];
				}
			}
		},
		drawGrid:function(){
			this.ctx.strokeStyle = "rgba(40,40,40,.6)";
			this.ctx.lineWidth = 1;
			for(var i = 1; i < this.cols; i++){
				this.ctx.beginPath();
				this.ctx.moveTo(0, i * this.blockSize);
				this.ctx.lineTo(this.canvas.width, i * this.blockSize);
				this.ctx.stroke();

				this.ctx.beginPath();
				this.ctx.moveTo(i * this.blockSize, 0);
				this.ctx.lineTo(i * this.blockSize, this.canvas.height);
				this.ctx.stroke();
			}
		},
		drawBlocks:function(p){
			for(var i = 0; i < this.total_num - 1; i++){
				//each puzzle[i] is a Block object
				this.puzzle[i].draw(this.ctx);
				if(p && this.ctx.isPointInPath(p.x, p.y)){
					alert(p)
				}
			}
		},
		canMove:function(obj){
			var distance = Math.sqrt(Math.pow(parseInt(obj.x) - parseInt(this.emptyPosition[0]),2)+Math.pow(parseInt(obj.y) - parseInt(this.emptyPosition[1]),2));
			//alert(this.blockSize)
			if (distance > this.blockSize + 1){
				return false;
			}
			return true;
		},
		refresh:function(p){
			//clear the board
			this.ctx.clearRect(0, 0, this.width, this.height);
			this.drawBlocks(p);
			this.drawGrid();
		},
		moveBlock:function(id){
			var x = this.puzzle[id].x;
			var y = this.puzzle[id].y;
		//	this.puzzle[id].x = this.emptyPosition[0];
		//	this.puzzle[id].y = this.emptyPosition[1];
		//	this.emptyPosition = [x, y];
			var timer = null;
			clearInterval(timer);
			var that = this;
			timer = setInterval(function(){
				var num = 20;
				if(that.puzzle[id].y == that.emptyPosition[1]){
				//	alert(1)
					var speed = that.puzzle[id].x < parseInt(that.emptyPosition[0])?num:-num;
					if( Math.abs(that.puzzle[id].x - parseInt(that.emptyPosition[0])) < num ) {
						clearInterval(timer);
						that.puzzle[id].x = that.emptyPosition[0];
						that.emptyPosition = [x, y];
					} else {
						// 到达目标之前
						that.puzzle[id].x = that.puzzle[id].x + speed;
					}
				}else{
				//	alert(2)
					var speed = that.puzzle[id].y < parseInt(that.emptyPosition[1])?num:-num;
					if( Math.abs(that.puzzle[id].y - parseInt(that.emptyPosition[1])) < num ) {
						clearInterval(timer);
						that.puzzle[id].y = that.emptyPosition[1];
						that.emptyPosition = [x, y];
					}else {
						// 到达目标之前
						that.puzzle[id].y = that.puzzle[id].y + speed;
					}
				}
				that.refresh();
				if(that.checkWin()){
					that.showWin();
				}
			},10);
			//record the step
			this.step++;
			this.show_step.innerHTML = this.step;
		},
		shuffle:function(){
			var nums = 100;
			for(var i = 0; i < nums * this.cols; i++ ){
				var blocksCanMove = new Array();
				var canMove_num = 0;
				for(var j = 0; j < this.puzzle.length; j++ ){
					if(this.canMove(this.puzzle[j])){
						blocksCanMove[canMove_num] = j;
						canMove_num++;
						//alert(j)
					}
				}
				var n = Math.floor(Math.random() * canMove_num);
				var block_id = blocksCanMove[n];
				//this.moveBlock(block_id);
				var x = this.puzzle[block_id].x;
				var y = this.puzzle[block_id].y;
				this.puzzle[block_id].x = this.emptyPosition[0];
				this.puzzle[block_id].y = this.emptyPosition[1];
				this.emptyPosition = [x, y];
			}
			while(this.checkWin()){
				this.shuffle();
			}
			this.refresh();

			//reset step
			this.step = 0;
			this.show_step.innerHTML = this.step;
		},
		checkWin:function(){
			for(var i = 0; i < this.puzzle.length; i++){
				//optimization method
				if((this.puzzle[i].x - (i % this.cols)*this.blockSize ) > 1 || (this.puzzle[i].y - parseInt(i / this.cols)*this.blockSize) > 1 ){
					return false;
				}
			}
			return true;
		},
		showWin:function(){
			alert("Win! Your step is "+this.step);
		},
		addHandlerToBlock:function(){
			var that = this;
			this.canvas.onclick = function(e){
				var e = window.event || e;
				var rect = this.getBoundingClientRect();
				var mouseX = e.clientX - rect.left;
				var mouseY = e.clientY - rect.top;
				var clickBlockId = that.searchBlock(mouseX, mouseY);
				if(clickBlockId >= 0){
					if(that.canMove(that.puzzle[clickBlockId])){
						that.moveBlock(clickBlockId);
					}
				}
			},
			this.canvas.onmousemove = function(e){
				var e = window.event || e;
				var rect = this.getBoundingClientRect();
				var mouseX = e.clientX - rect.left;
				var mouseY = e.clientY - rect.top;
				var onMouseMoveBlockId = that.searchBlock(mouseX, mouseY);
				if(typeof onMouseMoveBlockId == 'number'){
				}
			}
		},
		stopHandlerToBlock:function(){
			this.canvas.onclick = function(e){
				return false;
			}
		},
		searchBlock:function(x, y){
			for(var i = 0; i < this.puzzle.length; i++){
				if( x - this.puzzle[i].x > 0 && y - this.puzzle[i].y > 0 && x - this.puzzle[i].x < this.puzzle[i].width && y - this.puzzle[i].y < this.puzzle[i].height){
					return i;
				}
				
			}
		},
	}

	//Class Game
	function Game(){
		this.board = new Board();
		this.time = 0;
		this.timer = null;
		this.show_time = document.getElementById("time");
		this.show_step = document.getElementById("step");
		this.ctx = document.getElementById("puzzle_area").getContext("2d");

		this.init();
	}
	Game.prototype = {
		init:function(){
			this.stopGame();
			this.board = new Board();
			this.addEventHandler();

			var self = this;
			var new_img = this.board.block.imgLoader.image;
			new_img.onload = function(){
				self.board.init();
			}
		},
		newGame:function(){
			var that = this;
			this.timer = setInterval(function(){
				that.show_time.innerHTML = that.time++;
			}, 1000);
		},
		stopGame:function(){
			this.time = 0;
			this.show_time.innerHTML = '0';
			this.show_step.innerHTML = '0'
			clearInterval(this.timer);
			this.board.stopHandlerToBlock();
			document.getElementById("start").innerHTML = "Play";
		},
		addEventHandler:function(){
			var that = this;

			var start_btn = document.getElementById("start");
			start_btn.onclick = function(){
				that.stopGame();
				start_btn.innerHTML = "Replay";
				that.board.shuffle();
				that.board.addHandlerToBlock();
				that.newGame();
			}
			var select_bg = document.getElementById("bg");
			select_bg.onchange = function(event){
				var url = "background" + event.target.selectedIndex + ".jpg";
				imageName = url;
				that.init();
			}
			//choose the difficulty of the game, higher number, the more difficult the game
			var select_level = document.getElementById("choose_level");
			select_level.onchange = function(event){
				cols = parseInt(select_level.options[event.target.selectedIndex].text);
				document.getElementById("level").innerHTML = cols;
				that.init();
			}
			//have a look at the whole picture
			var cheat = document.getElementById("cheat");
			cheat.onmousedown = function(){
				that.ctx.drawImage(that.board.block.imgLoader.image, 0, 0, width, height);
			}
			cheat.onmouseup = function(){
				that.ctx.clearRect(0, 0, width, height);
				that.board.refresh();
			}
		}
	}
	return new PuzzleGame();
})();