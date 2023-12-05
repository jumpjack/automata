
// Requires GIZMO library (but modified by me):
// Github: https://github.com/camelCaseSensitive/p5-gizmo
// NPM: https://www.npmjs.com/package/p5-gizmo

let HYSTORY_LENGTH = 100;
let drawing = false;
let sheetLock = true; // debug

var index = 0;
const maxDataPoints = HYSTORY_LENGTH;
const mouseXData = Array.from({ length: maxDataPoints }, () => 0);
const mouseYData = Array.from({ length: maxDataPoints }, () => 0);

const ctxTheta1 = document.getElementById('divTheta1').getContext('2d');
const ctxTheta2 = document.getElementById('divTheta2').getContext('2d');
const ctxAzimuth = document.getElementById('divAzimuth').getContext('2d');

const chartTheta1 = new Chart(ctxTheta1, {
    type: 'line',
    data: {
        labels: Array.from({ length: maxDataPoints }, (_, i) => i + 1),
        datasets: [{
            label: 'Theta1 (shoulder joint 2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            data: [],
        }]
    },
    options: {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                max: maxDataPoints,
            },
            y: {
                type: 'linear',
                position: 'left',
                min : -100,
                max:100,
           }
        },
        animation: {
            duration: 0 // general animation time
        },
        hover: {
            animationDuration: 0 // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0 // animation duration after a resize
   }, 
});

const chartTheta2 = new Chart(ctxTheta2, {
    type: 'line',
    data: {
        labels: Array.from({ length: maxDataPoints }, (_, i) => i + 1),
        datasets: [{
            label: 'Theta2 (elbow joint)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            data: [],
        }]
    },
    options: {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                max: maxDataPoints,
            },
            y: {
                type: 'linear',
                position: 'left',
                min : -100,
                max: 100,
           }
        },
        animation: {
            duration: 0 // general animation time
        },
        hover: {
            animationDuration: 0 // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0 // animation duration after a resize
   },               
});

const chartAzimuth = new Chart(ctxAzimuth, {
    type: 'line',
    data: {
        labels: Array.from({ length: maxDataPoints }, (_, i) => i + 1),
        datasets: [{
            label: 'Azimuth (Shoulder joint 1)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            data: [],
        }]
    },
    options: {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                max: maxDataPoints,
            },
            y: {
                type: 'linear',
                position: 'left',
                min : -100,
                max: 100,
           }
        },
        animation: {
            duration: 0 // general animation time
        },
        hover: {
            animationDuration: 0 // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0 // animation duration after a resize
   }, 
});


let myDiv;
let myDiv2;
const SHOULDER_HEIGHT = 100;
const UPPER_ARM_LENGTH = 80;
const FOREARM_LENGTH = 70;
const INITIAL_X = 10;
const INITIAL_Y = 0;
const INITIAL_Z = 90;

const XMIN = -10;
const XMAX = 35;
const ZMIN = 50;
const ZMAX = 105;

let prevX = 10;
let prevZ = 90;

let prevXdrawing = 10;
let prevZdrawing = 90;


let azHistory = [];
let altHistory = [];
let theta1History = [];
let theta2History = [];
let xHistory = [];
let zHistory = [];
let samples = 0;
const PRECISION = 1;


function setup() {
  createCanvas(600, 400, WEBGL);
  cam = createCamera(100, 100, 100, 0, 0, 0, 1, 1, 1)
  cam.setPosition(23, 271, -150)
  //cam.setPosition(200, 100, 0)
  cam.upY = -1;
  cam.lookAt(0, 20, 100)
  //cam.lookAt(0, 100, 0)
  
  g = new gizmo(INITIAL_X,INITIAL_Y,INITIAL_Z, false, true, false,   true, false, true)  
  
  shoulder = {x: 0, y: SHOULDER_HEIGHT, z: 0}
  
  shoulderRoll = -PI/2;
    
  myDiv = createDiv("Right to move, left to draw");
  myDiv2 = createDiv("debug");
  clearButton = createButton("Clear");
  clearButton.mousePressed(clearDrawing);
}

function draw() {
  background(220);
  lights()
 
  // Draw sheet of paper
  fill(255,255,0)
  stroke(0);  
  push();
    translate((XMAX-XMIN)/2 -10,0, (ZMAX-ZMIN)/2 + 50)
    box((XMAX-XMIN),1,(ZMAX-ZMIN))
  pop();
  
 // drawGrid(50, 8,"XZ");
  
  if (sheetLock) {
    if (g.pos.y!==0) { // lock on XZ, for drawing
      g.pos.y = 0;
    } 

    if (g.pos.x > XMAX) g.pos.x = prevX;
    if (g.pos.x < XMIN) g.pos.x = prevX;

    if (g.pos.z > ZMAX) g.pos.z = prevZ;
    if (g.pos.z < ZMIN) g.pos.z = prevZ;

    prevX = g.pos.x;
    prevZ = g.pos.z;
  }
  
  // Altitude angle from shoulder to hand
  let shoulderToHandAngleRad = -atan2(g.pos.y - shoulder.y, dist(shoulder.x, shoulder.z, g.pos.x, g.pos.z))
  
  let azimuth = -atan2(g.pos.z - shoulder.z, g.pos.x - shoulder.x) + PI/2
  
  if(!g.gizmoClicked) orbitControl() 
    
  let shoulderHandDistance = min(dist(shoulder.x, shoulder.y, shoulder.z, 
               g.pos.x, g.pos.y, g.pos.z), FOREARM_LENGTH + UPPER_ARM_LENGTH)
  
  // Calculate elbow point  through inverse kinematics:
  let IKresults =  ik(
    {x: 0, y: 0}, 
    {x: 0, y: shoulderHandDistance}, 
    FOREARM_LENGTH , 
    UPPER_ARM_LENGTH, 
    shoulderHandDistance
  )
  let elbowPoint = IKresults.elbow;
  
  let elbowAngleRad = -(shoulderToHandAngleRad + IKresults.relativeElbowAngleRad );
  let handAngleRad = IKresults.relativeElbowAngleRad + IKresults.relativeHandAngleRad - PI/2;

/*  myDiv.html(
     "<br>Elbow  w.r.t ground=" + elbowAngleRad   + 
     "<br>Hand w.r.t. upperarm=" + handAngleRad
             );
*/
   drawArm(shoulder,shoulderHandDistance,shoulderToHandAngleRad, 
           elbowPoint, azimuth,shoulderRoll, elbowAngleRad, handAngleRad);
  
  drawPerson();
  drawTable(); 

   if (drawing && 
       (
         diff(g.pos.x,  prevXdrawing, PRECISION) || diff(g.pos.z,  prevZdrawing, PRECISION)
       )
      ) {
    xHistory[samples] = g.pos.x;
    zHistory[samples] = g.pos.z;   
    azHistory[samples] = azimuth*180/PI;
    theta1History[samples] = elbowAngleRad*180/PI;
    theta2History[samples] = handAngleRad*180/PI;
    prevXdrawing = g.pos.x;
    prevZdrawing = g.pos.z;
    samples++;
     
    if (samples > maxDataPoints) {
        samples = 0;
    }
  }

  noFill();
  beginShape();
  for (let i = 0; i < xHistory.length; i++) {
    vertex(xHistory[i], 1, zHistory[i]);
  }
  endShape(); 
  

  // Update chart data
  chartTheta1.data.datasets[0].data = theta1History;
  chartTheta1.update();

  chartTheta2.data.datasets[0].data = theta2History;
  chartTheta2.update();
  
  chartAzimuth.data.datasets[0].data = azHistory;
  chartAzimuth.update();

  g.show()

}

function drawArm(shoulder, shoulderHandDistance, shoulderToHandAngleRad, elbowPoint, azimuth, shoulderRoll, elbowAngleRad, handAngleRad) {
    // Draw arm:
   push()
    // First shoulder joint, rotating around vertical axis by azimuth
    translate(shoulder.x, shoulder.y+10) // Draw it abow horizontal pivot of shoulder
    rotateY(azimuth)
    box(15,15,5); 
    translate(0,-10,0)
  
    // Setup reference sysyem for rotated upper arm
    rotateX(shoulderToHandAngleRad + PI/2)
    rotateY(shoulderRoll);
  
    // Debug visuals - view the plane of the arm
     //fill(255,255,255,10)
     //plane(100)
     //drawCoordinates(2.5, 100)
  
    noStroke()
    /*fill(200, 0, 0)
    rectLine(0, 0, elbowPoint.x, elbowPoint.y) // Upper arm
    fill(0, 200, 0)
    rectLine(elbowPoint.x, elbowPoint.y, 0, shoulderHandDistance) // Forearm*/
  pop() 

  // Draw joints
  fill(170)
  push();
    translate(shoulder.x, shoulder.y, shoulder.z)
    rotateY(azimuth);
      rotateX(- elbowAngleRad); // Second shoulder joint is oriented as upperarm, which is rotated by elbowAngle

    box(20,15,5) // shoulder joint  

    translate(0,0,UPPER_ARM_LENGTH/2)
    box(10,10,UPPER_ARM_LENGTH - UPPER_ARM_LENGTH/5) // upper arm  

  pop();

  push()
  fill(255,255,0)
    translate(shoulder.x, shoulder.y)
    rotateY(azimuth)
    rotateX(shoulderToHandAngleRad);
    translate(0,-elbowPoint.x,elbowPoint.y)
    rotateX(-shoulderToHandAngleRad);
    rotateX(-elbowAngleRad - handAngleRad) //ok, angolo polso rispetto a braccio

    box(20,15,5)  // elbow joint
  
    translate(0,0,FOREARM_LENGTH/2)
    box(10,10,FOREARM_LENGTH - FOREARM_LENGTH/5) // upper arm    
  pop()
  //pop();
 // push();
 //     translate(0, shoulderHandDistance)
      //sphere(5) // Hand ball
 // pop();

  
  
  // Draw pen
  fill(255,255,255);
  noStroke();
  push()
    translate(g.pos.x-2, g.pos.y+23, g.pos.z-2) 
    rotateX(-10*PI/180);
    rotateY(10*PI/180)
    cylinder(4,30)
    translate(0,-20,0);
    rotateZ(PI)
    fill(100,100,100)
    cone(4,10)
  pop() 
  stroke(0)    
    
}

function drawPerson() {
  fill(255);
  noStroke()
  // Draw body
  push();
    translate(-40,30,-10);
    ellipsoid(40, 90, 40);
  pop();
  
  // Draw head
  push();
    translate(-40,130,-10 );
    sphere(30);
  pop();
    
  // Draw shoulder
  push();
    translate(-20,100,-10);
    rotateZ(PI/2)
    rotateX(-PI/6)
    cylinder(5,30);
  pop();
  stroke(0);  
}

function drawTable() {
  push()
  TABLE_WIDTH = 500;
  TABLE_THICKNESS = 20;
  TABLE_CENTER_X = -40;
  TABLE_CENTER_Z = 160;
  LEG_WIDTH = 10;
  LEG_HEIGHT = 140;
  // Plate:
  translate(TABLE_CENTER_X,-10,TABLE_CENTER_Z);
  box(TABLE_WIDTH/2,TABLE_THICKNESS,TABLE_WIDTH/2)
  
  // Leg 1
  translate(-(TABLE_WIDTH/4 - LEG_WIDTH/2),-LEG_HEIGHT/2- TABLE_THICKNESS/2 ,-(TABLE_WIDTH/4 - LEG_WIDTH/2));
  box(10,LEG_HEIGHT,10);
  
  translate(2*(TABLE_WIDTH/4 - LEG_WIDTH/2),0,0);
  box(10,LEG_HEIGHT,10);
  
  translate(0,0,2*(TABLE_WIDTH/4 - LEG_WIDTH/2));
  box(10,LEG_HEIGHT,10);
  
  translate(-2*(TABLE_WIDTH/4 - LEG_WIDTH/2),0,0);
  box(10,LEG_HEIGHT,10);

  pop()
}

function mousePressed() {
  if (mouseButton === LEFT) {
    drawing = true;
  }
  if(g.hover){
    g.update()
  }
}

function mouseReleased() {
  drawing = false;
  g.released()
}

function ik(shoulderPoint, handPoint, upperarm_length , forearm_length, shoudler_hand_length){
  let theta1;
  let theta2;
  thA = acos( (forearm_length**2 + shoudler_hand_length**2 - upperarm_length**2) / (2* forearm_length * shoudler_hand_length)  )
  thABtoHorizontal = atan2(-handPoint.y + shoulderPoint.y, handPoint.x - shoulderPoint.x)
  
  let elbowPoint = {
      x: shoulderPoint.x + forearm_length *cos(thA + thABtoHorizontal),
      y: shoulderPoint.y - forearm_length *sin(thA + thABtoHorizontal)
    };
  theta2 = atan2(handPoint.y - elbowPoint.y, handPoint.x - elbowPoint.x)
  
  // Returns elbow point:
  return({
    elbow: elbowPoint,
    relativeElbowAngleRad : thA,
    relativeHandAngleRad : theta2
  })
}

function rectLine(x1, y1, x2, y2){
  let w = 5
  let th = atan2(y2 - y1, x2 - x1)
  let d = dist(x1, y1, x2, y2)
  push()
      translate(x1, y1)
      rotate(th)
      translate(d/2, 0)
    rotate(PI/2)
      // fill("#B2C0D9")
      // stroke("#7580AF")
      // strokeWeight(1)
      // rect(0, 0, d, w)
      // box(d, w, 5)
      cylinder(w, d)
  pop()
}

function drawGrid(spacing, number, plane) {
  stroke(0);
  let w = spacing * number;
  push()
  switch(plane) {
    case "XY":
      // do nothing
     break;
    case "XZ":
       rotateX(3.14/2)
     break;
    case "YZ":
      rotateY(3.14/2)
      break;
  }
    translate(-w/2, -w/2, 0)
    for(let i = 0; i <= number; i++){
      line(i * spacing, 0, i*spacing, w)
      line(0, i * spacing, w, i * spacing)
    }
  pop()
}

function rd(r)  {
  // radians to degrees
  return parseInt((r*180/PI).toFixed(0));
}


function diff(value, reference, threshold) {
  if ((value < reference - threshold) || (value > reference + threshold)) {
      return true
  } else {
    return false;
  }
}

function clearDrawing() {
  noFill();
  beginShape();
  for (let i = 0; i < xHistory.length; i++) {
    vertex(0, 1, 0);
  }
  endShape(); 
    
  azHistory = [];
  altHistory = [];
  theta1History = [];
  theta2History = [];
  xHistory = [];
  zHistory = [];
  samples = 0;  
  
  chartTheta1.data.datasets[0].data = theta1History;
  chartTheta1.update();

  chartTheta2.data.datasets[0].data = theta2History;
  chartTheta2.update();

  chartAzimuth.data.datasets[0].data = azHistory;
  chartAzimuth.update();
}
