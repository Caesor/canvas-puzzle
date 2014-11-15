/**
 * Jigsaw Puzzle
 * 
 * Puzzle is a flat space-filling and solution-arranging game. 
 * Players will require put all zero-piece pattern together, then the whole plane will show.
 *
 * @author Nemo
 * @version 2.0
 * 
 * @param  COLNUM  The column number of puzzle
 * 
 */
(function(){
	function Block(image, l, t, x, y, w, h){
		this.image = image;
		this.left = l;
		this.top = t;
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
	}
	Block.prototype.draw = function(context){
		context.drawImage(this.image, this.left, this.top, this.width, this.height, this.x, this.y, this.width, this.height);
	}
	window.Block = Block;
	//the map
	function Board(bg, n, w, h){
		var grid;
		this.background = bg;
		this.cols = n;
		this.total_num = n * n;
		this.width = w;
		this.height = h;
		this.blockSize = w / n;
		this.canvas = document.getElementById("puzzle_area");
		this.ctx = this.canvas.getContext('2d');

		this.puzzle = new Array();
		this.emptyPosition = [0,0];
	}
	Board.prototype = {
		init:function(){
			this.initGrid();
			this.drawGrid();
		//	this.shuffle();
			this.addHandlerToBlock();
		},
		initGrid:function(){
			for(var i = 0; i < this.total_num; i++){
				var x = (i % this.cols) * this.blockSize;
				var y = parseInt(i / this.cols) * this.blockSize;
				//don't draw the last part of puzzle
				if(i != this.total_num - 1){
					this.puzzle[i] = new Block(this.background, x, y, x, y,this.blockSize, this.blockSize);
					this.puzzle[i].draw(this.ctx);
				}
				else{//record the empty position
					this.emptyPosition = [x, y];
				}
			}
		},
		drawGrid:function(){
			this.ctx.strokeStyle = "rgba(40,40,40,.8)";
			this.ctx.lineWidth = 1;
			for(var i = 0; i < this.cols; i++){
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
				this.puzzle[i].draw(this.ctx);
				if(p && this.ctx.isPointInPath(p.x, p.y)){
					alert(p)
				}
			}
		},
		canMove:function(obj){
			var distance = Math.sqrt(Math.pow(parseInt(obj.x) - parseInt(this.emptyPosition[0]),2)+Math.pow(parseInt(obj.y) - parseInt(this.emptyPosition[1]),2));
			//alert(distance)
			if (distance > 400 / this.cols){
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
				var num = 13;
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
		},
		shuffle:function(){
			var step = 100;
			for(var i = 0; i < step * this.cols; i++ ){
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
			alert("Win!");
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
		searchBlock:function(x, y){
			for(var i = 0; i < this.puzzle.length; i++){
				if( x - this.puzzle[i].x > 0 && y - this.puzzle[i].y > 0 && x - this.puzzle[i].x < this.puzzle[i].width && y - this.puzzle[i].y < this.puzzle[i].height){
					return i;
				}
				
			}
		}
	}
	window.Board = Board;
	function Game(){
		this.time = 0;
		this.step = 0;
		this.timer = null;
	}
	Game.prototype = {
		newGame:function(){
			clearInterval(this.timer);
			
			var show_time = document.getElementById("time");
			show_time.innerHTML = '0';
			//clear the step
			document.getElementById("step").innerHTML = '0';
			this.timer = setInterval(function(){
				time.innerHTML = this.time++;
			}, 1000);
		},
		abandonGame:function(){
			this.time = 0;
			this.step = 0;
			clearInterval(this.timer);
		}
	}
	window.Game = Game;
})();
var el = document.getElementById("puzzle_area");
var ctx = el.getContext("2d");

var image = new Image();
image.src = "resource/background2.jpg";
image.onload = init;
var width = 400;
var height = width;
var COLNUM = 3;
function init(){
	board = new Board(image, COLNUM, width, height);
	board.init();
}
var start_btn = document.getElementById("start");

var start_time = null;
start_btn.onclick = function(){
	start_btn.innerHTML = "Replay";
	game = new Game();
	board.shuffle();
	game.newGame();
}
var select_bg = document.getElementById("bg");
select_bg.onchange = function(event){
	image.src = "resource/background" + event.target.selectedIndex + ".jpg";
	init();
}
//choose the difficulty of the game, higher number, the more difficult the game
var select_level = document.getElementById("choose_level");
select_level.onchange = function(event){
	//stop();
	COLNUM = parseInt(select_level.options[event.target.selectedIndex].text);
	document.getElementById("level").innerHTML = COLNUM;
	init();
}
//have a look at the whole picture
var cheat = document.getElementById("cheat");
cheat.onmousedown = function(){
	ctx.drawImage(image, 0, 0, width, height);
}
cheat.onmouseup = function(){
	ctx.clearRect(0, 0, width, height);
	board.refresh();
}