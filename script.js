const GameObject = function(position, size, selector) {
  this.$el = $(selector);
  this.position = position;
  this.size = size;
  this.$el.css("position", "absolute");
  this.updateCss();
}
GameObject.prototype.updateCss = function() {
  this.$el.css("left", this.position.x);
  this.$el.css("top", this.position.y);
  this.$el.css("width", this.size.width);
  this.$el.css("height", this.size.height);
}
GameObject.prototype.collide = function(otherObject) {
  const inRangeX = otherObject.position.x >= this.position.x && otherObject.position.x <= this.position.x + this.size.width ;
  const inRangeY = otherObject.position.y >= this.position.y && otherObject.position.y <= this.position.y + this.size.height;
  return inRangeX && inRangeY;
}

const Ball = function() {
  this.size = {width:15, height: 15};
  this.position = {x: 250 - 7.5, y:250 -7.5};
  this.velocity = {x: -3, y: 5};
  GameObject.call(this, this.position, this.size, ".ball")
  this.$el.hide();
}
Ball.prototype.__proto__ = GameObject.prototype;
Ball.prototype.constructor =  Ball.constructor;
Ball.prototype.update = function() {
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  this.updateCss();
  if(this.position.x <=0 || this.position.x + this.size.width >= 500){
    this.velocity.x = -this.velocity.x;
  }
  if(this.position.y <=0 || this.position.y + this.size.height >= 500){
    this.velocity.y = -this.velocity.y;
  }
}
Ball.prototype.init = function() {
  this.position = {x: 250 - 7.5, y:250 -7.5};
  const positive_or_negative = () => {
    return (Math.random()-0.5)<0 ? -1 : 1;
  }  
  let speed = 8,
      angle = Math.random() * (2.4 + Math.random()*2.4);
  this.velocity = {
    x: speed * Math.cos(angle) * positive_or_negative(),
    y: speed * Math.sin(angle) * positive_or_negative()};
  this.$el.show();
  this.update();
}

const ball = new Ball();

const Board = function(position, selector) {
  this.size = {
    width: 100,
    height: 15
  }
  GameObject.call(this, position, this.size, selector);
}
Board.prototype.__proto__ = GameObject.prototype;
Board.prototype.constructor = Board.constructor;
Board.prototype.update = function() {
  if(this.position.x <= 0) {
    this.position.x = 0;
  }
  if(this.position.x + this.size.width >= 500) {
    this.position.x = 500 - this.size.width;
  }
  this.updateCss();
}

const board1 = new Board({x: 0, y: 30}, '.b1');
const board2 = new Board({x: 0, y: 455}, '.b2');

const Game = function() {
  this.timer = null;
  this.count = 0;
  this.initControl();
  this.control={};
}
Game.prototype.initControl = function() {
  window.addEventListener('keydown', (e)=> {
    this.control[e.key] = true;
  })
  window.addEventListener('keyup', (e)=> {
    this.control[e.key] = false;
  })
}
Game.prototype.startGame = function() {
  let time = 3; 
  this.grade = 0;
  $("button.start").hide();
  let timer_count = setInterval(()=> {
    $(".infoText").text(time);
    time--;
    if(time < 0) {
      clearInterval(timer_count);
      ball.init();
      $(".info").hide();
      this.animate = requestAnimationFrame(this.startGameMain.bind(this));
    }
  },1000);
}
Game.prototype.startGameMain = function() {
  this.count++;
  if(this.count % 3 == 0) {
    if(board1.collide(ball)) {
      ball.velocity.y = -ball.velocity.y;
      ball.velocity.x *= 1.08;
      ball.velocity.y *= 1.08;
      ball.velocity.x += 0.5 - Math.random();
      ball.velocity.y += 0.5 - Math.random();
    }
    if(board2.collide(ball)) {
      ball.velocity.y = -ball.velocity.y;
      this.grade += 10;
    }
    if(this.control['ArrowLeft']) {
      board2.position.x += -8;
    }
    if(this.control['ArrowRight']) {
      board2.position.x += 8;
    }
    board1.position.x += ball.position.x >= (board1.position.x + board1.size.width/2) ? 12 : 0;
    board1.position.x += ball.position.x <= (board1.position.x + board1.size.width/2) ? -12 : 0;
    board1.update();
    board2.update();
    
    ball.update();
    $(".grade").text(this.grade);
  }
  this.animate = requestAnimationFrame(this.startGameMain.bind(this));
  
  if(ball.position.y<=0) this.endGame('Computer lose');
  if(ball.position.y + ball.size.height>=500) this.endGame('You lose');
}
Game.prototype.endGame = function(result) {
  cancelAnimationFrame(this.animate);
  $("button.start").show();
  $(".info").show();
  $(".infoText").html(`${result} <br>Score: ${this.grade}`);
}

const game = new Game();
$(".start").click(()=>{game.startGame()});