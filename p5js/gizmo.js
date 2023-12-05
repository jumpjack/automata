// Custom version of https://github.com/camelCaseSensitive/p5-gizmo

function gizmo(x, y, z, limitX, limitY, limitZ, drawX, drawY, drawZ){
    if (limitX) {
      if (x<0) {
        x = 0;
        //return;
      }
    }
    if (limitY) {
      if (y<0) {
        y = 0;
        //return;
      }
    }
    if (limitZ) {
      if (z<0) {
        z = 0;
        //return;
      }
    }    
 
    this.pos = {x: x, y: y, z: z}
    this.firstClick = false;
    this.gizmoClicked = false;
    this.offset = 0;
    this.clickPos = 0;
    this.hover = false;
    this.cicked= false;
    this.tips = [0, 1, 2, 3, 4, 5, 6];
    this.n = false;
    this.show = function() {
      // Draw the gizmo
      noStroke()
      push()
        translate(this.pos.x, this.pos.y, this.pos.z)
        drawCoordinates(2.5, 100, drawX, drawY, drawZ)
      pop()
  
      if(!this.gizmoClicked) this.hover = false;
  
      // Tip is tip of the ray we are casting out from camera
      let tip = {x: cam.eyeX, y: cam.eyeY, z: cam.eyeZ};
      let d = dist(tip.x, tip.y, tip.z, this.pos.x, this.pos.y, this.pos.z);
  
      for(let i = 0; i < 1; i++) {
        tip = raycast(d, 0, 0)
        d += dist(tip.x, tip.y, tip.z, this.pos.x, this.pos.y, this.pos.z)
      }
  
      // Check for center of gizmo ('xyz') selection
      if(dist(tip.x, tip.y, tip.z, this.pos.x, this.pos.y, this.pos.z) < 10){
        fill(255, 0, 0,100)
        tip = raycast(d, 0, 0)
  
        if(!this.hover && !mouseIsPressed) this.hover = "xyz"
  
        if(!this.gizmoClicked && this.hover === "xyz"){
          push()
            translate(this.pos.x, this.pos.y, this.pos.z)
            fill(255, 255, 0,100)
            box(20)
          pop()
        }
        this.tips[6] = tip
      } 
  
      // Check for x-axis selection
      if (drawX) {
        tip = {x: cam.eyeX, y: cam.eyeY, z: cam.eyeZ};
        d = sdfX(tip, 100, 10, this.pos);

        for(let i = 0; i < 10; i++) {
          tip = raycast(d, 0, 0)
          d += sdfX(tip, 100, 2, this.pos)
        }

        if(sdfX(tip, 100, 2, this.pos) < 5){
          fill(255, 0, 0,100)
          tip = raycast(d, 0, 0)

          if(!this.hover && !mouseIsPressed) this.hover = "X"

          if(!this.gizmoClicked && this.hover === "X"){
            push()
              translate(this.pos.x, this.pos.y, this.pos.z)
              fill(255, 255, 0,100)
              rotateZ(-Math.PI/2)
              translate(0, 100/2, 0)
              cylinder(2.5, 100)
              translate(0, 100/2, 0)
              cone(5, 10)
            pop()
          }
          this.tips[0] = tip
        } 
    }
  
      // Check for y-axis selection
      if (drawY) {
        tip = {x: cam.eyeX, y: cam.eyeY, z: cam.eyeZ};
        d = sdfY(tip, 100, 10, this.pos);

        for(let i = 0; i < 10; i++) {
          tip = raycast(d, 0, 0)
          d += sdfY(tip, 100, 2, this.pos)
        }

        if(sdfY(tip, 100, 2, this.pos) < 5){
          fill(255, 0, 0,100)
          tip = raycast(d, 0, 0)

          if(!this.hover && !mouseIsPressed) this.hover = "Y"

          if(!this.gizmoClicked && this.hover === "Y"){
            push()
              translate(this.pos.x, this.pos.y, this.pos.z)
              fill(255, 255, 0,100)
              translate(0, 100/2, 0)
              cylinder(2.5, 100)
              translate(0, 100/2, 0)
              cone(5, 10)
            pop()
          }
          this.tips[1] = tip
        }
      }
  
      // Check for z-axis selection
     if (drawZ) {
      tip = {x: cam.eyeX, y: cam.eyeY, z: cam.eyeZ};
      d = sdfZ(tip, 100, 10, this.pos);
  
      for(let i = 0; i < 10; i++) {
        tip = raycast(d, 0, 0)
        d += sdfZ(tip, 100, 2, this.pos)
      }
  
      if(sdfZ(tip, 100, 2, this.pos) < 5){
        fill(255, 0, 0,100)
        tip = raycast(d, 0, 0)
  
        if(!this.hover && !mouseIsPressed) this.hover = "Z"
  
        if(!this.gizmoClicked && this.hover === "Z"){
          push()
            translate(this.pos.x, this.pos.y, this.pos.z)
            fill(255, 255, 0,100)
            rotateX(Math.PI/2)
            translate(0, 100/2, 0)
            cylinder(2.5, 100)
            translate(0, 100/2, 0)
            cone(5, 10)
          pop()
        }
        this.tips[2] = tip
      } 
     }
  
      // Check for xy-plane collision
      let side = 40;
      if(cam.eyeZ > this.pos.z){
        tip = {x: cam.eyeX, y: cam.eyeY, z: cam.eyeZ};
        push()
          translate(this.pos.x, this.pos.y, this.pos.z)
          translate(side/2, side/2, 0)
          fill(200, 200, 100,100)
          plane(side)
        pop()
        let a = {x: this.pos.x + side, y: this.pos.y, z: this.pos.z}
        let b = {x: this.pos.x + side, y: this.pos.y + side, z: this.pos.z}
        let c = {x: this.pos.x, y: this.pos.y + side, z: this.pos.z}
        d = Quad(tip, a, b, c, this.pos);
  
        for(let i = 0; i < 10; i++) {
          tip = raycast(d, 0, 0)
          d += Quad(tip, a, b, c, this.pos)
        }
  
        if(Quad(tip, a, b, c, this.pos) < 5){
          fill(255, 0, 0,100)
          tip = raycast(d, 0, 0)
  
          if(!this.hover && !mouseIsPressed) this.hover = "XY"
  
          if(!this.gizmoClicked && this.hover === "XY"){
            push()
              translate(this.pos.x, this.pos.y, this.pos.z)
              translate(side/2, side/2, 0)
              fill(255, 255, 0,100)
              plane(side)
            pop()
          }
          this.tips[3] = tip
        } 
      }
  
      // Check for xz-plane collision
      if(cam.eyeY > this.pos.y){
        tip = {x: cam.eyeX, y: cam.eyeY, z: cam.eyeZ};
        push()
          translate(this.pos.x, this.pos.y, this.pos.z)
          rotateX(-PI/2)
          translate(side/2, -side/2, 0)
          fill(200, 100, 200,100)
          plane(side)
        pop()
        let a = {x: this.pos.x + side, y: this.pos.y, z: this.pos.z}
        let b = {x: this.pos.x + side, y: this.pos.y, z: this.pos.z + side}
        let c = {x: this.pos.x, y: this.pos.y, z: this.pos.z + side}
        d = Quad(tip, a, b, c, this.pos);
  
        for(let i = 0; i < 10; i++) {
          tip = raycast(d, 0, 0)
          d += Quad(tip, a, b, c, this.pos)
        }
  
        if(Quad(tip, a, b, c, this.pos) < 5){
          fill(255, 0, 0,100)
          tip = raycast(d, 0, 0)
  
          if(!this.hover && !mouseIsPressed) this.hover = "XZ"
  
          if(!this.gizmoClicked && this.hover === "XZ"){
            push()
              translate(this.pos.x, this.pos.y, this.pos.z)
              rotateX(-PI/2)
              translate(side/2, -side/2, 0)
              fill(255, 255, 0,100)
              plane(side)
            pop()
          }
          this.tips[4] = tip
        } 
      }
  
      // Check for yz-plane collision
      if(cam.eyeX > this.pos.x){
        tip = {x: cam.eyeX, y: cam.eyeY, z: cam.eyeZ};
        push()
          translate(this.pos.x, this.pos.y, this.pos.z)
          rotateY(PI/2)
          translate(-side/2, side/2, 0)
          fill(100, 200, 200,100)
          plane(side)
        pop()
        let a = {x: this.pos.x, y: this.pos.y + side, z: this.pos.z}
        let b = {x: this.pos.x, y: this.pos.y + side, z: this.pos.z + side}
        let c = {x: this.pos.x, y: this.pos.y, z: this.pos.z + side}
        d = Quad(tip, a, b, c, this.pos);
  
        for(let i = 0; i < 10; i++) {
          tip = raycast(d, 0, 0)
          d += Quad(tip, a, b, c, this.pos)
        }
  
        if(Quad(tip, a, b, c, this.pos) < 5){
          fill(255, 0, 0,100)
          tip = raycast(d, 0, 0)
  
          if(!this.hover && !mouseIsPressed) this.hover = "YZ"
  
          if(!this.gizmoClicked && this.hover === "YZ"){
            push()
              translate(this.pos.x, this.pos.y, this.pos.z)
              rotateY(PI/2)
              translate(-side/2, side/2, 0)
              fill(255, 255, 0,100)
              plane(side)
            pop()
          }
          this.tips[5] = tip
        } 
      }
  
      // Moving the Gizmo!
      // Check if it's got x,y,z or xy, xz, yx, plane
      if(this.gizmoClicked){
        if(this.hover === "X"){
          push()
            translate(this.pos.x, this.pos.y, this.pos.z)
            fill(255, 255, 0,100)
            rotateZ(-Math.PI/2)
            translate(0, 100/2, 0)
            cylinder(2.5, 100)
            translate(0, 100/2, 0)
            cone(5, 10)
          pop()
  
        } else if(this.hover === "Y"){
          push()  
            translate(this.pos.x, this.pos.y, this.pos.z)
            fill(255, 255, 0,100)
            translate(0, 100/2, 0)
            cylinder(2.5, 100)
            translate(0, 100/2, 0)
            cone(5, 10)
          pop()
  
        } else if (this.hover === "Z"){
          push()
            translate(this.pos.x, this.pos.y, this.pos.z)
            fill(255, 255, 0,100)
            rotateX(Math.PI/2)
            translate(0, 100/2, 0)
            cylinder(2.5, 100)
            translate(0, 100/2, 0)
            cone(5, 10)
          pop()
        } else if (this.hover === "XY"){
          push()
            translate(this.pos.x, this.pos.y, this.pos.z)
            translate(side/2, side/2, 0)
            fill(255, 255, 0,100)
            plane(side)
          pop()
        } else if (this.hover === "XZ"){
          push()
            translate(this.pos.x, this.pos.y, this.pos.z)
            rotateX(-PI/2)
            translate(side/2, -side/2, 0)
            fill(255, 255, 0,100)
            plane(side)
          pop()
        } else if (this.hover === "YZ"){
          push()
            translate(this.pos.x, this.pos.y, this.pos.z)
            rotateY(PI/2)
            translate(-side/2, side/2, 0)
            fill(255, 255, 0,100)
            plane(side)
          pop()
        } else if (this.hover === "xyz"){
          push()
            translate(this.pos.x, this.pos.y, this.pos.z)
            fill(255, 255, 0,100)
            box(20)
          pop()
        }
      }
  
      // X-Axis movement (Clicked the x-axis arrow)
      if(this.n && this.gizmoClicked && this.hover === 'X'){
        let nrm = dist(0, 0, 0, this.n.x, this.n.y, this.n.z)
  
        this.n = {
          x: this.n.x/nrm,
          y: this.n.y/nrm,
          z: this.n.z/nrm
        }
  
        // Check for plane collision
        tip = {x: cam.eyeX, y: cam.eyeY, z: cam.eyeZ };
  
        let h = -dot({x: 0, y: this.pos.y, z: this.pos.z}, this.n) 
  
        d = sdPlane(tip, this.n, h, this.pos);
  
        for(let i = 0; i < 15; i++) {
          tip = raycast(d, 0, 0)
          d += sdPlane(tip, this.n, h, this.pos)
        }
  
        if(sdPlane(tip, this.n, h, this.pos) < 5){
          fill(255, 0, 0,100)
          tip = raycast(d, 0, 0)
        } 
  
        if(this.firstClick){
          this.firstClick = false;
          this.offset = tip.x - this.pos.x;
        }
  
        this.pos.x = tip.x - this.offset
      }
  
      // Y-Axis movement (Clicked the y-axis arrow)
      if(this.n && this.gizmoClicked && this.hover === 'Y'){
        let nrm = dist(0, 0, 0, this.n.x, this.n.y, this.n.z)
  
        this.n = {
          x: this.n.x/nrm,
          y: this.n.y/nrm,
          z: this.n.z/nrm
        }
  
        // Check for plane collision
        tip = {x: cam.eyeX, y: cam.eyeY, z: cam.eyeZ };
  
        let h = -dot({x: this.pos.x, y: 0, z: this.pos.z}, this.n) 
  
        d = sdPlane(tip, this.n, h, this.pos);
  
        for(let i = 0; i < 15; i++) {
          tip = raycast(d, 0, 0)
          d += sdPlane(tip, this.n, h, this.pos)
        }
  
        if(sdPlane(tip, this.n, h, this.pos) < 5){
          fill(255, 0, 0,100)
          tip = raycast(d, 0, 0)
        } 
  
        if(this.firstClick){
          this.firstClick = false;
          this.offset = tip.y - this.pos.y;
        }
  
        this.pos.y = tip.y - this.offset
      }
  
      // Z-Axis movement (Clicked the z-axis arrow)
      if(this.n && this.gizmoClicked && this.hover === 'Z'){
        let nrm = dist(0, 0, 0, this.n.x, this.n.y, this.n.z)
  
        this.n = {
          x: this.n.x/nrm,
          y: this.n.y/nrm,
          z: this.n.z/nrm
        }
  
        // Check for plane collision
        tip = {x: cam.eyeX, y: cam.eyeY, z: cam.eyeZ };
  
        let h = -dot({x: this.pos.x, y: this.pos.y, z: 0}, this.n) 
  
        d = sdPlane(tip, this.n, h, this.pos);
  
        for(let i = 0; i < 15; i++) {
          tip = raycast(d, 0, 0)
          d += sdPlane(tip, this.n, h, this.pos)
          // if(sdPlane(tip, n, 0, this.pos) < 5) i = 10
        }
  
        if(sdPlane(tip, this.n, h, this.pos) < 5){
          fill(255, 0, 0,100)
          tip = raycast(d, 0, 0)
        } 
  
        if(this.firstClick){
          this.firstClick = false;
          this.offset = tip.z - this.pos.z;
        }
  
        this.pos.z = tip.z - this.offset
      }
  
      // XY-Axis movement (Clicked the xy-quad)
      if(this.n && this.gizmoClicked && this.hover === 'XY'){
        // Check for plane collision
        tip = {x: cam.eyeX, y: cam.eyeY, z: cam.eyeZ };
  
        let h = -this.pos.z 
  
        d = sdPlane(tip, this.n, h, this.pos);
  
        for(let i = 0; i < 15; i++) {
          tip = raycast(d, 0, 0)
          d += sdPlane(tip, this.n, h, this.pos)
        }
  
        if(sdPlane(tip, this.n, h, this.pos) < 5){
          fill(255, 0, 0,100)
          tip = raycast(d, 0, 0)
        } 
  
        if(this.firstClick){
          this.firstClick = false;
          this.offset = {x: tip.x - this.pos.x, y: tip.y - this.pos.y}
        }
  
        this.pos.x = tip.x - this.offset.x;
        this.pos.y = tip.y - this.offset.y;
      }
  
      // XZ-Axis movement (Clicked the xz-quad)
      if(this.n && this.gizmoClicked && this.hover === 'XZ'){
        // Check for plane collision
        tip = {x: cam.eyeX, y: cam.eyeY, z: cam.eyeZ };
  
        let h = -this.pos.y 
  
        d = sdPlane(tip, this.n, h, this.pos);
  
        for(let i = 0; i < 15; i++) {
          tip = raycast(d, 0, 0)
          d += sdPlane(tip, this.n, h, this.pos)
        }
  
        if(sdPlane(tip, this.n, h, this.pos) < 5){
          fill(255, 0, 0,100)
          tip = raycast(d, 0, 0)
        } 
  
        if(this.firstClick){
          this.firstClick = false;
          this.offset = {x: tip.x - this.pos.x, z: tip.z - this.pos.z}
        }
  
        this.pos.x = tip.x - this.offset.x
        this.pos.z = tip.z - this.offset.z
      }
  
      // YZ-Axis movement (Clicked the yz-quad)
      if(this.n && this.gizmoClicked && this.hover === 'YZ'){
        // Check for plane collision
        tip = {x: cam.eyeX, y: cam.eyeY, z: cam.eyeZ };
        // tip = {x: cam.eyeX - this.pos.x, y: cam.eyeY - this.pos.y, z: cam.eyeZ - this.pos.z}
  
        let h = -this.pos.x 
  
        d = sdPlane(tip, this.n, h, this.pos);
  
        for(let i = 0; i < 15; i++) {
          tip = raycast(d, 0, 0)
          d += sdPlane(tip, this.n, h, this.pos)
        }
  
        if(sdPlane(tip, this.n, h, this.pos) < 5){
          fill(255, 0, 0,100)
          tip = raycast(d, 0, 0)
        } 
  
        if(this.firstClick){
          this.firstClick = false;
          this.offset = {y: tip.y - this.pos.y, z: tip.z - this.pos.z}
        }
  
        this.pos.y = tip.y - this.offset.y
        this.pos.z = tip.z - this.offset.z
      }
  
      // xyz movement (Clicked the gizmo center)
      if(this.n && this.gizmoClicked && this.hover === 'xyz'){
        if(this.firstClick){
          this.firstClick = false;
          tip = raycast(this.n, 0, 0);
          this.offset = {x: tip.x - this.pos.x, y: tip.y - this.pos.y, z: tip.z -this.pos.z}
        }
  
        // for this case n is storing the distance from cam to gizmo center when it was clicked
        tip = raycast(this.n, 0, 0);
  
        this.pos.x = tip.x - this.offset.x;
        this.pos.y = tip.y - this.offset.y;
        this.pos.z = tip.z - this.offset.z;
      }
    }
    this.update = function() {
      this.gizmoClicked = true;
      if(this.hover === 'X'){
        this.clickPos = this.tips[0]
        this.firstClick = true;
        this.n = cross({x: 100, y: 0, z: 0}, cross({x: cam.eyeX - this.pos.x, y: cam.eyeY-this.pos.y, z: cam.eyeZ-this.pos.z}, {x: 100, y: 0, z: 0}))
        
      }
      if(this.hover === 'Y'){
        this.clickPos = this.tips[1]
        this.firstClick = true;
        this.n = cross({x: 0, y: 100, z: 0}, cross({x: cam.eyeX - this.pos.x, y: cam.eyeY-this.pos.y, z: cam.eyeZ-this.pos.z}, {x: 0, y: 100, z: 0}))
      }
      if(this.hover === 'Z'){
        this.clickPos = this.tips[2]
        this.firstClick = true;
        this.n = cross({x: 0, y: 0, z: 100}, cross({x: cam.eyeX - this.pos.x, y: cam.eyeY-this.pos.y, z: cam.eyeZ-this.pos.z}, {x: 0, y: 0, z: 100}))
      }
      if(this.hover === 'XY'){
        this.clickPos = this.tips[3]
        this.firstClick = true;
        this.n = {x: 0, y: 0, z: 1}
      }
      if(this.hover === 'XZ'){
        this.clickPos = this.tips[4]
        this.firstClick = true;
        this.n = {x: 0, y: 1, z: 0}
      }
      if(this.hover === 'YZ'){
        this.clickPos = this.tips[5]
        this.firstClick = true;
        this.n = {x: 1, y: 0, z: 0}
      }
      if(this.hover === 'xyz'){
        this.clickPos = this.tips[6]
        this.firstClick = true;
        this.n = dist(cam.eyeX, cam.eyeY, cam.eyeZ, this.clickPos.x, this.clickPos.y, this.clickPos.z)
      }
    };
    this.released = function() {
      this.gizmoClicked = false;
      this.hover = false;
      this.firstClick = false;
    }
  }
  
  function cross(a, b){
    return{
      x: a.y*b.z - a.z*b.y,
      y: a.z*b.x-a.x*b.z,
      z: a.x*b.y-a.y*b.x
    }
  }
  
  function dot(a, b){
    return a.x*b.x + a.y*b.y + a.z*b.z
  }
  
  function sdfX(p, h, r, o)
  {
    p.x -= constrain( p.x - o.x, 0, h);
    
    return dist(o.x, o.y, o.z, p.x, p.y, p.z) - r;
  }
  
  function sdfY(p, h, r, o)
  {
    p.y -= constrain( p.y - o.y, 0.0, h );
    return dist(o.x, o.y, o.z, p.x, p.y, p.z) - r;
  }
  
  function sdfZ(p, h, r, o)
  {
    p.z -= constrain( p.z - o.z, 0.0, h );
    return dist(o.x, o.y, o.z, p.x, p.y, p.z) - r;
  }
  
  function sdPlane(p, n, h, o)
  {
    return dot(p,n) + h;
  }
  
  function sub(a, b) {
    return{ x: a.x - b.x,
            y: a.y - b.y,
            z: a.z - b.z}
  }
  
  function scalarMult(v,s){
    return{
      x: v.x * s,
      y: v.y * s,
      z: v.z * s
    }
  }
  
  function Quad(p, a, b, c, d)
  {
    let ba = sub(b,a); let pa = sub(p, a);
    let cb = sub(c, b); let pb = sub(p, b);
    let dc = sub(d, c); let pc = sub(p, c);
    let ad = sub(a, d); let pd = sub(p, d);
    let nor = cross( ba, ad );
  
    return sqrt(
      (Math.sign(dot(cross(ba,nor),pa)) +
       Math.sign(dot(cross(cb,nor),pb)) +
       Math.sign(dot(cross(dc,nor),pc)) +
       Math.sign(dot(cross(ad,nor),pd))<3.0)
       ?
       min( min( min(
       dot2(sub(scalarMult(ba,constrain(dot(ba,pa)/dot2(ba),0.0,1.0)),pa)),
       dot2(sub(scalarMult(cb,constrain(dot(cb,pb)/dot2(cb),0.0,1.0)),pb) )),
       dot2(sub(scalarMult(dc,constrain(dot(dc,pc)/dot2(dc),0.0,1.0)),pc) )),
       dot2(sub(scalarMult(ad,constrain(dot(ad,pd)/dot2(ad),0.0,1.0)),pd) ))
       :
       dot(nor,pa)*dot(nor,pa)/dot2(nor) );
  }
  
  function dot2(v) {
    return dot(v, v)
  }
  
  function drawCoordinates(thickness, len, drawX, drawY, drawZ) {
    // 3D Coordinates
    push()
      // X Axis
      if(drawX) {
        push()
          fill(255, 0, 0,100)
          rotateZ(-Math.PI/2)
          translate(0, len/2, 0)
          cylinder(thickness, len)
          translate(0, len/2, 0)
          cone(5, 10)
        pop()
      }
  
      // Y axis
      if (drawY) {
        push()
          fill(0, 255, 0,100,100)
          translate(0, len/2, 0)
          cylinder(thickness, len)
          translate(0, len/2, 0)
          cone(5, 10)
        pop()
      }

      // Z axis
      if (drawZ) {
        push()
          fill(0, 0, 255,10,1000)
          rotateX(Math.PI/2)
          translate(0, len/2, 0)
          cylinder(thickness, len)
          translate(0, len/2, 0)
          cone(5, 10)
        pop()
      }
    pop()
  }

  function raycast(d, pos, thresh){
    // ***************   Unprojection   ***************
    
    // Normalized screen space  (0 : 1)  Viewport Coordinates
    let normX = mouseX/width;
    let normY = mouseY/height;
    
    // NDC Space (-1 : 1)  Normalized Device Coordinates
    let ndcX = (mouseX - width/2) / width * 2;
    let ndcY = (mouseY - height/2) / height * 2;
    let ndcZ = 1.0;
    ndc = [ndcX, -ndcY, ndcZ, 1]  // NDC vector
    
    // Projection Matrix
    let p = _renderer.uPMatrix.mat4;
    let projectionMatrix = [
      [p[0], p[1], p[2], p[3]],
      [p[4], p[5], p[6], p[7]],
      [p[8], p[9], p[10], p[11]],
      [p[12], p[13], p[14], p[15]]
    ]
    
    // Eye/view/camera space vector
    let camV = math.multiply(ndc, math.inv(projectionMatrix));
    
    // Division factor for perspective compensation
    let w = camV[3];
    
    // Model View Matrix
    let m = _renderer.uMVMatrix.mat4;
    let modelViewMatrix = [
      [m[0], m[1], m[2], m[3]],
      [m[4], m[5], m[6], m[7]],
      [m[8], m[9], m[10], m[11]],
      [m[12], m[13], m[14], m[15]]
    ]
    
    // World space
    let world = math.multiply(camV, math.inv(modelViewMatrix));
    
    // World space (compensating for perspective)
    let world2 = [world[0]/w, world[1]/w, world[2]/w]
    // ***************************************************
    
    // Ray length - distance from camera to pickable object
    let dRay = d;
    
    // Position of the tip of the ray in world space
    let phi = atan2(world2[1] - cam.eyeY, dist(world2[0], world2[2], cam.eyeX, cam.eyeZ))
    let th = -atan2(world2[0] - cam.eyeX, world2[2] - cam.eyeZ) + PI/2
    let ray = [cam.eyeX + dRay * cos(phi) * cos(th), 
             cam.eyeY + dRay * sin(phi), 
             cam.eyeZ + dRay * cos(phi) * sin(th)]
    
    // Picking detection
    // if(dist(ray[0], ray[1], ray[2], pos[0], pos[1], pos[2]) < thresh) {
    //   return true
    // }
    // return false;
    return {
      x: ray[0],
      y: ray[1],
      z: ray[2]
    };
  }
