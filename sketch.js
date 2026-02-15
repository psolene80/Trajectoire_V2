// =======================
// TRAJECTOIRES
// =======================


// =======================
// VARIABLES GLOBALES
// =======================

let gameState = "MENU";

let canvasSize;
let cnv;

let characters = [];
let points = [];

let waitStart;
let startTime;
let endTime;

let traceLayer;
let screenshotImg;


// ===== GALERIE =====
let galleryImages = [];
let selectedImage = null;



// =======================
// PRELOAD (IMPORTANT WEB)
// =======================

function preload() {

  // charge 9 images du dossier assets/
  for (let i = 1; i <= 9; i++) {
    galleryImages.push({
      img: loadImage("assets/" + i + ".jpg"),
      title: "Image " + i
    });
  }
}



// =======================
// SETUP
// =======================

function setup() {

  canvasSize = windowHeight;
  cnv = createCanvas(canvasSize, canvasSize);

  traceLayer = createGraphics(canvasSize, canvasSize);

  textFont("Lato");
  textStyle(NORMAL);

  initPoints();
  centerCanvas();

  traceLayer.strokeCap(ROUND);
}



// =======================
// CENTRAGE
// =======================

function centerCanvas() {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  cnv.position(x, y);
}



// =======================
// RESIZE
// =======================

function windowResized() {

  let s = windowHeight;

  resizeCanvas(s, s);

  traceLayer = createGraphics(s, s);

  initPoints();
  centerCanvas();
}



// =======================
// DRAW LOOP
// =======================

function draw() {

  background(240);

  if (gameState === "MENU") drawMenu();
  if (gameState === "JEU_WAIT") drawGame(false);
  if (gameState === "JEU_RUN") drawGame(true);
  if (gameState === "JEU_FIN") drawGameEnd();
  if (gameState === "GALERIE") drawGalerie();
  if (gameState === "CREDITS") drawCredits();
}



// =======================
// MENU
// =======================

function drawMenu() {

  background(255);

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(42);

  text("TRAJECTOIRES", width/2, height*0.2);

  drawButton("JEU", height*0.4);
  drawButton("GALERIE", height*0.55);
  drawButton("CRÉDITS & EXPLICATION", height*0.7);
}



// =======================
// BOUTON
// =======================

function drawButton(label, y) {

  let w = 360;
  let h = 60;
  let x = width/2;

  let hover =
    mouseX > x-w/2 &&
    mouseX < x+w/2 &&
    mouseY > y-h/2 &&
    mouseY < y+h/2;

  fill(hover ? 180 : 255);
  stroke(0);

  rectMode(CENTER);
  rect(x, y, w, h, 12);

  noStroke();
  fill(0);
  textSize(22);
  text(label, x, y);
}


function overButton(y) {
  return mouseX > width/2-180 &&
         mouseX < width/2+180 &&
         mouseY > y-30 &&
         mouseY < y+30;
}



// =======================
// JEU
// =======================

function startGame() {

  characters = [];
  traceLayer.clear();

  for (let i=0; i<100; i++) {
    characters.push(new Character());
  }

  waitStart = millis();
  gameState = "JEU_WAIT";
}



function drawGame(active) {

  image(traceLayer,0,0);

  for (let p of points) {
    fill(p.color);
    ellipse(p.x,p.y,40);
  }

  if (!active && millis()-waitStart > 1000) {
    startTime = millis();
    gameState = "JEU_RUN";
  }

  let alive = false;

  for (let c of characters) {
    c.update(active);
    c.display();
    if (c.visible) alive = true;
  }

  if (active && !alive) {
    endTime = millis();
    screenshotImg = get();
    gameState = "JEU_FIN";
  }
}



// =======================
// FIN JEU
// =======================

function drawGameEnd() {

  image(screenshotImg, 0, 0, width, height);

  fill(0,130);
  rect(0,0,width,height);

  let scale = 0.5;

  let w = width*scale;
  let h = height*scale;

  image(screenshotImg, width/2-w/2, height/2-h/2, w, h);

  fill(255);
  textAlign(CENTER);
  textSize(28);

  let t = ((endTime - startTime) / 1000).toFixed(2);

  text("Temps : " + t + " s", width/2, height*0.25);

  drawButton("REJOUER", height*0.1);
  drawButton("MENU", height*0.9);
}



// =======================
// ⭐ GALERIE 3x3 + LIGHTBOX
// =======================

function drawGalerie() {

  background(245);

  textAlign(CENTER, CENTER);
  fill(0);
  textSize(32);
  text("GALERIE", width/2, 50);


  // ===== LIGHTBOX =====
  if (selectedImage) {

    fill(0, 180);
    rect(0,0,width,height);

    let maxSize = width * 0.8;
    let ratio = selectedImage.width / selectedImage.height;

    let w = maxSize;
    let h = maxSize / ratio;

    imageMode(CENTER);
    image(selectedImage, width/2, height/2, w, h);

    drawButton("FERMER", height*0.9);
    return;
  }


  // ===== GRILLE =====

  let cols = 3;
  let margin = 80;
  let gap = 30;

  let cellW = (width - margin*2 - gap*(cols-1)) / cols;
  let cellH = cellW + 40;

  let startY = 120;

  imageMode(CORNER);

  for (let i = 0; i < galleryImages.length; i++) {

    let col = i % 3;
    let row = floor(i / 3);

    let x = margin + col*(cellW+gap);
    let y = startY + row*(cellH+gap);

    let g = galleryImages[i];

    fill(255);
    stroke(200);
    rect(x,y,cellW,cellW,12);

    image(g.img,x,y,cellW,cellW);

    noStroke();
    fill(0);
    textSize(14);
    text(g.title,x+cellW/2,y+cellW+20);
  }

  drawButton("MENU", height-60);
}



// =======================
// CREDITS
// =======================

function drawCredits() {

  background(255);

  fill(20);

  textAlign(CENTER, TOP);
  textSize(28);

  text("Crédits & Explications", width/2, 40);

  textSize(16);

  text(
    "Œuvre interactive générative\n\nOutils : p5.js / GitHub / Vercel",
    width/2,
    120,
    width-160
  );

  drawButton("MENU", height-60);
}



// =======================
// POINTS
// =======================

function initPoints() {

  points = [
    {x:width/2,y:40,color:color(255,0,0)},
    {x:width/2,y:height-40,color:color(0,0,255)},
    {x:40,y:height/2,color:color(0,255,0)},
    {x:width-40,y:height/2,color:color(255,255,0)}
  ];
}



// =======================
// CHARACTER
// =======================

class Character {

  constructor(){
    this.x=random(width);
    this.y=random(height);
    this.point=random(points);
    this.color=this.point.color;
    this.visible=true;
    this.isDragged=false;
    this.speed=0.5;
  }

  update(active){

    if(!this.visible) return;

    if(this.isDragged){
      traceLayer.stroke(0);
      traceLayer.line(this.x,this.y,mouseX,mouseY);
      this.x=mouseX;
      this.y=mouseY;
      return;
    }

    if(!active) return;

    traceLayer.stroke(this.color);
    traceLayer.point(this.x,this.y);

    let dx=this.point.x-this.x;
    let dy=this.point.y-this.y;

    let d=sqrt(dx*dx+dy*dy);

    if(d>this.speed){
      this.x+=dx/d*this.speed;
      this.y+=dy/d*this.speed;
    }else{
      this.visible=false;
    }
  }

  display(){
    if(!this.visible) return;
    noStroke();
    fill(this.color);
    ellipse(this.x,this.y,14);
  }
}



// =======================
// SOURIS
// =======================

function mousePressed(){

  if(gameState==="MENU"){
    if(overButton(height*0.4)) startGame();
    if(overButton(height*0.55)) gameState="GALERIE";
    if(overButton(height*0.7)) gameState="CREDITS";
  }

  if(gameState==="GALERIE"){

    if(selectedImage){
      if(overButton(height*0.9)) selectedImage=null;
      return;
    }

    let cols=3, margin=80, gap=30;
    let cellW=(width-margin*2-gap*(cols-1))/cols;
    let cellH=cellW+40;
    let startY=120;

    for(let i=0;i<galleryImages.length;i++){

      let col=i%3;
      let row=floor(i/3);

      let x=margin+col*(cellW+gap);
      let y=startY+row*(cellH+gap);

      if(mouseX>x && mouseX<x+cellW &&
         mouseY>y && mouseY<y+cellW){

        selectedImage=galleryImages[i].img;
        return;
      }
    }

    if(overButton(height-60)) gameState="MENU";
  }
}
