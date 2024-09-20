var dx, dy;       /* displacement at every dt */
var x, y;         /* ball location */
var score = 0;    /* # of walls you have cleaned */
var tries = 0;    /* # of tries to clean the wall */
var started = false;  /* false means ready to kick the ball */
var ball, court, paddle, brick, msg;
var court_height, court_width, paddle_left;
var dv = 10;

var bricks = new Array(4);  // rows of bricks
var colors = ["red","blue","yellow","green"];

/* get an element by id */
function id ( s ) { return document.getElementById(s); }

/* convert a string with px to an integer, eg "30px" -> 30 */
function pixels ( pix ) {
    pix = pix.replace("px", "");
    num = Number(pix);
    return num;
}

/* place the ball on top of the paddle */
function readyToKick () {
    x = pixels(paddle.style.left)+paddle.width/2.0-ball.width/2.0;
    y = pixels(paddle.style.top)-2*ball.height;
    ball.style.left = x+"px";
    ball.style.top = y+"px";
}

/* paddle follows the mouse movement left-right */
function movePaddle (e) {
    var ox = e.pageX-court.getBoundingClientRect().left;
    paddle.style.left = (ox < 0) ? "0px"
                            : ((ox > court_width-paddle.width)
                               ? court_width-paddle.width+"px"
                               : ox+"px");
    if (!started)
        readyToKick();
}

function initialize () {
    court = id("court");
    ball = id("ball");
    paddle = id("paddle");
    wall = id("wall");
    msg = id("messages");
    brick = id("red");
    court_height = pixels(court.style.height);
    court_width = pixels(court.style.width);
    for (i=0; i<4; i++) {
        // each row has 20 bricks
        bricks[i] = new Array(20);
        var b = id(colors[i]);
        for (j=0; j<20; j++) {
            var x = b.cloneNode(true);
            bricks[i][j] = x;
            bricks[i][j].style.visibility = "visible";
            wall.appendChild(x);
        }
        b.style.visibility = "hidden";
    }
    started = false;
 }

/* true if the ball at (x,y) hits the brick[i][j] */
function hits_a_brick ( x, y, i, j ) {
    var top = i*brick.height - 450;
    var left = j*brick.width;
    return (x >= left && x <= left+brick.width
            && y >= top && y <= top+brick.height);
}


function startGame() {
    if (!started) {
        started = true;
        var angle = Math.random() * Math.PI/2 + Math.PI/4; // Random angle between π/4 and 3π/4
        var level = parseInt(id("level").value, 10);
        var initalSpeed = 10;
        var speed = initalSpeed + (level - 1) * 10;

        dx = speed * Math.cos(angle);
        dy = -speed * Math.sin(angle);
        moveBall();
    }
}

function resetGame() {
    started = false;
    tries = 0;
    score = 0;
    updateTries();
    msg.innerText = "";
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 20; j++) {
            bricks[i][j].style.visibility = "visible";
        }
    }
    readyToKick();
}

function moveBall() {
    if (!started) return;


    x += dx ;
    y += dy;

    if (x <= 0) {
        dx = -dx;
        x = 0;
    }
    if (x + ball.width >= court_width) {
        dx = -dx;
        x = court_width - ball.width;
    }
    if (  -y >= court_height - ball.width) dy = -dy;

    // collisions with paddle
    if (y + ball.height >= pixels(paddle.style.top) ) {
        if (x + ball.width >= pixels(paddle.style.left) && x <= pixels(paddle.style.left) + paddle.width) {
            dy = -dy;
            y = pixels(paddle.style.top)-ball.height;
        } else {
            // missed the paddle
            tries++;
            started = false;
            updateTries();
            readyToKick();
        }
    }
    // Check for collisions with bricks
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 20; j++) {
            if (hits_a_brick(x, y, i, j) && bricks[i][j].style.visibility === "visible") {
                bricks[i][j].style.visibility = "hidden";
                dy = -dy;
                if(checkIfClear()){
                    score=score+1;
                    updateScore();
                    msg.innerText = "All Bricks Cleared! Score++";
                }
                break;
            }
        }
    }

    ball.style.left = x + "px";
    ball.style.top = y + "px";
    setTimeout(moveBall, 50);
}

function checkIfClear(){
    for ( var i = 0 ; i < 4; i++) {
        for (var j=0 ; j < 20 ; j++) {
            if (bricks[i][j].style.visibility !== "hidden"){
                return false;
            }
        }
    }
    resetGame();
    return true;
}

function updateTries() {
    var element = document.getElementById("tries");
    element.innerText = tries;
}
function updateScore() {
    var element  = document.getElementById("score");
    element.innerText = score;
}