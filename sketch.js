// =======================
// TRAJECTOIRES 
// =======================


// =======================
// VARIABLES GLOBALES
// =======================

let gameState = "READ_ME"; // état de l'app

let canvasSize; // taille du canvas carré
let cnv; // référence canvas

let characters = []; // liste des bonhommes
let points = []; // 4 points colorés

let waitStart; // timer attente
let startTime; // chrono début
let endTime; // chrono fin

let traceLayer; // calque traces permanentes
let screenshotImg; // image finale

let copyMessageTimer = 0;
let discordURL = "https://discord.gg/rsgSq2X5";

let galleryImages = [];
let galleryCaptions = [];


// =======================
// SETUP
// =======================

function setup() {

  canvasSize = windowHeight; // carré = hauteur écran
  cnv = createCanvas(canvasSize, canvasSize);

  traceLayer = createGraphics(canvasSize, canvasSize); // calque traces

  textFont("Lato"); // police lisible
  textStyle(NORMAL);

  loadGallery();
  initPoints(); // crée points
  centerCanvas(); // centre écran
  
  traceLayer.strokeCap(ROUND);

}


// =======================
// CENTRAGE CANVAS
// =======================

function centerCanvas() {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  cnv.position(x, y);
}


// =======================
// REDIMENSION
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

  if (gameState === "READ_ME") drawReadme();
  if (gameState === "MENU") drawMenu();
  if (gameState === "JEU_WAIT") drawGame(false);
  if (gameState === "JEU_RUN") drawGame(true);
  if (gameState === "JEU_FIN") drawGameEnd();
  if (gameState === "GALERIE") drawGalerie();
  if (gameState === "CREDITS") drawCredits();
}

// =======================
// README / INTRO
// =======================

function drawReadme() {

  background(220); // gris clair comme crédits

  fill(20);
  textAlign(CENTER, TOP);

  textSize(28);
  text("READ_ME", width/2, 40);

  textSize(16);

  let margin = 10;
  let boxWidth = width - margin*2;

  text(
    "Bienvenue dans Trajectoires.\n\n" +
    "Postulat : Peut-on s’empêcher de vouloir contrôler des personnages virtuels qui n’ont pourtant pas besoin de nous pour agir ?\n\n" +
    "Ce projet interroge notre besoin de contrôle sur les NPC et les intelligences artificielles. Des points se déplacent seuls vers une cible et créent une trace visuelle. Le joueur peut intervenir pour les déplacer, mais chaque action laisse une marque noire.\n\n" +
    "L’image finale révèle alors notre degré d’intervention : plus nous manipulons, plus nous perturbons leur trajectoire.\n" +
    "Face à un système qui fonctionne sans nous, choisissons-nous de le laisser agir… ou de le contrôler ?",

    width/2,
    120,
    boxWidth
  );

  // bouton OK en bas
  drawButton("OK", height-60);
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
  
 // ===== lien copiable =====
  textAlign(CENTER, CENTER);
  textSize(14);
  fill(0,120,255);

  let linkY = height-25;

  text("discord.gg/rsgSq2X5", width/2, linkY);

  // ===== notification copie =====
  if (millis() < copyMessageTimer) {
    fill(0);
    textSize(12);
    text("Lien copié !", width/2, height-45);
  }

}


// =======================
// BOUTON GENERIQUE
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
// LANCER PARTIE
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


// =======================
// JEU
// =======================

function drawGame(active) {

  image(traceLayer,0,0);

  // points colorés
  for (let p of points) {
    fill(p.color);
    ellipse(p.x,p.y,40);
  }

  // attente 1s
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

  // fin
  if (active && !alive) {
    endTime = millis();
    screenshotImg = get();
    gameState = "JEU_FIN";
  }
}


// =======================
// FIN
// =======================

function drawGameEnd() {

  // ======================
  // 1 — fond figé plein écran
  // ======================
  image(screenshotImg, 0, 0, width, height);


  // ======================
  // 2 — voile noir 50% opacité
  // ======================
  rectMode(CORNER);//defini que le coin du voile est au coin du canva
  fill(0, 130); // noir + alpha
  noStroke();
  rect(0, 0, windowWidth, windowHeight);//(coordoné x point de depart, coordone en y du debut du rectangle, largeur, hauteur)


  // ======================
  // 3 — screenshot plus petit (50%)
  // ======================
  let scale = 0.50; // taille 50%

  let w = width * scale;
  let h = height * scale;

  let x = (width - w) / 2; // centrage
  let y = (height - h) / 2;

  image(screenshotImg, x, y, w, h);


  // ======================
  // 4 — texte temps
  // ======================
  fill(255);
  textAlign(CENTER);

  textSize(28);

  let t = ((endTime - startTime) / 1000).toFixed(2);

  text("Temps : " + t + " s", width/2, y - 25); // au-dessus de l'image


  // ======================
  // 5 — boutons fixes
  // ======================
  drawButton("REJOUER", height*0.1);
  drawButton("TÉLÉCHARGER", height*0.8);
  drawButton("MENU", height*0.9);
}

//======================
//fonction load gallery
//======================

function loadGallery(){

  // charge img1.jpg → img9.jpg
  for(let i=1;i<=9;i++){
    galleryImages.push(loadImage("assets/img"+i+".jpg"));
  }

  galleryCaptions = [
    "trace 01",
    "trace 02",
    "trace 03",
    "trace 04",
    "trace 05",
    "trace 06",
    "trace 07",
    "trace 08",
    "trace 09"
  ];
}



// =======================
// GALERIE (placeholder)
// =======================

function drawGalerie() {
  // ---- Fond de la galerie ----
  background(245); // gris clair pour le fond

  // ---- Titre ----
  fill(0);                 // couleur du texte = noir
  textAlign(CENTER, CENTER); // centré horizontalement et verticalement
  textSize(42);            // taille du texte
  let topArea = 80;        // espace réservé en haut pour le titre
  text("GALERIE", width / 2, topArea / 2); // titre centré dans la zone haute

  // ---- Espace réservé pour le bas (bouton MENU) ----
  let bottomArea = 120;    // hauteur en bas pour ne pas que le bouton recouvre images ou textes

  // ---- Paramètres de la grille ----
  let cols = 3;            // nombre de colonnes
  let rows = 3;            // nombre de lignes
  let gap = 25;            // espace entre images
  let imgSize = 85;        // taille max des images (carré)

  // ---- Calcul de l’espace disponible pour la grille ----
  let usableWidth = width;                  // largeur utilisable = largeur totale
  let usableHeight = height - topArea - bottomArea; // hauteur utilisable = tout sauf top + bottom

  // ---- Centrage de la grille dans l’espace utilisable ----
  let gridW = cols * imgSize + gap * (cols - 1); // largeur totale de la grille
  let gridH = rows * imgSize + gap * (rows - 1); // hauteur totale de la grille

  let startX = (usableWidth - gridW) / 2;           // centrage horizontal
  let startY = topArea + (usableHeight - gridH) / 2; // centrage vertical dans l’espace utilisable

  // ---- Préparer le texte des légendes ----
  textAlign(CENTER, TOP); // texte centré horizontalement, départ en haut
  textSize(15);           // taille des légendes

  // ---- Boucle pour chaque image ----
  for (let i = 0; i < galleryImages.length; i++) {
    let col = i % cols;          // colonne actuelle (0,1,2)
    let row = floor(i / cols);   // ligne actuelle (0,1,2)

    // ---- Calcul de la position de la "case virtuelle" ----
    let x = startX + col * (imgSize + gap); // coin supérieur gauche de la case
    let y = startY + row * (imgSize + gap); // coin supérieur gauche de la case

    // ---- Préparer l'image ----
    let img = galleryImages[i];                   // récupérer l'image
    let scaleFactor = min(imgSize / img.width, imgSize / img.height); // conserver ratio
    let imgW = img.width * scaleFactor;          // largeur finale
    let imgH = img.height * scaleFactor;         // hauteur finale

    // ---- Centrer l'image dans la "case virtuelle" ----
    let imgX = x + (imgSize - imgW) / 2; // centrer horizontalement
    let imgY = y + (imgSize - imgH) / 2; // centrer verticalement

    // ---- Dessiner l'image ----
    image(img, imgX, imgY, imgW, imgH);

    // ---- Dessiner la légende juste en dessous ----
    fill(0); // texte noir
    let textOffset = 4; // petit espace entre l'image et le texte
    text(
      galleryCaptions[i],
      x + imgSize / 2,          // centre horizontal
      y + imgSize + textOffset   // juste en dessous de la "case virtuelle"
    );
  }

  // ---- Bouton MENU ----
  drawButton("MENU", height - 60); // bouton toujours en bas, ne recouvre pas la grille
}



// =======================
// CREDITS
// =======================

function drawCredits() {

  background(255); // fond blanc

  fill(20); // couleur texte sombre

  textAlign(CENTER, TOP); // centrage horizontal
  textSize(28);

  // ----- Titre -----
  text("Crédits & Explications", width/2, 40);


  // ----- Texte principal -----
  textSize(16);

  let margin = 80; // marge gauche/droite
  let boxWidth = width - margin*2; // largeur du bloc texte

  text(
    "Trajectoires est une œuvre interactive générative où des entités colorées suivent une destination imposée tandis que le joueur peut perturber leurs parcours.\n\n" +
    "Chaque déplacement laisse une trace permanente, transformant l’espace en mémoire visuelle des interactions.\n\n" +
    "Chaque partie produit ainsi une composition unique, entre contrôle, hasard et empreinte du geste humain.\n\n" +
    "Outils : JavaScript, p5.js, Vercel, Github, ChatGPT\n" +
    "Auteur : Pernet solène et GPT\n" +
    "Année : 2026",

    width/2,   // centré
    120,       // hauteur départ
    boxWidth   // largeur max (wrap auto)
  );


  // ----- Bouton -----
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
// CLASSE PERSONNAGE
// =======================

class Character {

  constructor(){

    this.x=random(width);
    this.y=random(height);

    this.point=random(points); // destination

    const palette=[points[0].color,points[1].color,points[2].color,points[3].color];

    this.color=random(palette); // couleur indépendante

    this.visible=true;
    this.isDragged=false;

    this.speed=0.5;
  }

  update(active){

    if(!this.visible) return;

    // drag
    if(this.isDragged){
     traceLayer.stroke(0);
     traceLayer.strokeWeight(2); // épaisseur noire
     traceLayer.line(this.x,this.y,mouseX,mouseY);
      this.x=mouseX;
      this.y=mouseY;
      return;
    }

    if(!active) return;

    // trace colorée
    traceLayer.stroke(this.color);
    traceLayer.strokeWeight(2); // épaisseur couleur
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
// INTERACTIONS SOURIS
// =======================

function mousePressed(){

  if(gameState==="READ_ME"){
  if(overButton(height-60)){
    gameState="MENU";
  }
}
  
  if(gameState==="MENU"){
    if(overButton(height*0.4)) startGame();
    if(overButton(height*0.55)) gameState="GALERIE";
    if(overButton(height*0.7)) gameState="CREDITS";
  }
  
  // zone cliquable du lien
  let linkY = height-25;
  let linkW = 220;
  let linkH = 25;

  if(
    mouseX > width/2-linkW/2 &&
    mouseX < width/2+linkW/2 &&
    mouseY > linkY-linkH/2 &&
    mouseY < linkY+linkH/2
){
  navigator.clipboard.writeText(discordURL);
  copyMessageTimer = millis() + 5000; // 5 secondes

}


  if(gameState==="JEU_RUN"||gameState==="JEU_WAIT"){
    for(let c of characters){
      if(c.visible && dist(mouseX,mouseY,c.x,c.y)<16){
        c.isDragged=true;
      }
    }
  }

 if(gameState==="JEU_FIN"){
  if(overButton(height*0.1)) startGame();

  if(overButton(height*0.8)){
  let t = ((endTime - startTime) / 1000).toFixed(2);
  save(screenshotImg, t + "s.png");

  }

  if(overButton(height*0.9)) gameState="MENU";
}


  if(gameState==="CREDITS" && overButton(height-60)) gameState="MENU";
  if(gameState==="GALERIE" && overButton(height-60)) gameState="MENU";
}


function mouseReleased(){
  for(let c of characters) c.isDragged=false;
}

//==========
//tactile
//==========

//ATTENTION, une fois que le tactile à été utilisé, le clic de la souris ne marche plus, la réciproque est fausse. Cependant cela ne pose pas problème en générale à par sur les appareils doté du tactile et d'une souris.


function touchStarted(){
  if(gameState==="READ_ME"){
    if(overButton(height-60)){
    gameState="MENU";
  }
}
  
  if(gameState==="MENU"){
    if(overButton(height*0.4)) startGame();
    if(overButton(height*0.55)) gameState="GALERIE";
    if(overButton(height*0.7)) gameState="CREDITS";
  }
  
 let linkY = height-25;
let linkW = 220;
let linkH = 25;

if(
  mouseX > width/2-linkW/2 &&
  mouseX < width/2+linkW/2 &&
  mouseY > linkY-linkH/2 &&
  mouseY < linkY+linkH/2
){
  navigator.clipboard.writeText(discordURL);
  copyMessageTimer = millis() + 5000;
}


  if(gameState==="JEU_RUN"||gameState==="JEU_WAIT"){
    for(let c of characters){
      if(c.visible && dist(mouseX, mouseY, c.x, c.y)<16){ // <- ici mouseX/mouseY
        c.isDragged=true;
      }
    }
  }

 if(gameState==="JEU_FIN"){
  if(overButton(height*0.1)) startGame();

  if(overButton(height*0.8)){
  let t = ((endTime - startTime) / 1000).toFixed(2);
  save(screenshotImg, t + "s.png");

  }

  if(overButton(height*0.9)) gameState="MENU";
}


  if(gameState==="CREDITS" && overButton(height-60)) gameState="MENU";
  if(gameState==="GALERIE" && overButton(height-60)) gameState="MENU";

  return false; // bloque scroll
}

function touchEnded(){
  for(let c of characters) c.isDragged=false;
  return false;
}

