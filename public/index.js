const canvas = document.getElementById('canvas');
ctx = canvas.getContext("2d");
const spriteSheet = new Image();
spriteSheet.src = "./goat.png";

//ctx.drawImage(spriteSheet, 0, 0, 32, 32, 0, 0, 32, 32);

var goat = {
    lX : 0,
    rX : 32,
    y: 0,
    count: 0,
    direction: "right"
}

function animateGoat(){
    if (goat.direction==="right"){
        if (goat.count>=19){
            goat.direction="left";
        }
        else {
            goat.count+=1;
            drawGoat();
        }
    } else {
        if (goat.count<=0){
            goat.direction="right";
        } else {
            goat.count-=1;
            drawGoat();
        }
    }
}

function drawGoat(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let drawX;
    if (goat.direction==="right"){
        drawX=goat.rX;
    } else {
        drawX=goat.lX;
    }
    ctx.drawImage(
        spriteSheet,
        drawX, goat.y,
        32, 32,
        goat.count*32, 0,
        32, 32
    );
}

setInterval(animateGoat, 150);