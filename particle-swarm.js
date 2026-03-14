// ===== PARTICLE SWARM MAGNETIC FIELD =====
// Adapted from codepen.io/ImagineProgramming/pen/LpOJzM
(function() {
  'use strict';

  // ---- Vector3D ----
  function Vector3D(x, y, z) { this.set(x || 0, y || 0, z || 0); }
  Vector3D.prototype = {
    set: function(x, y, z) { this.x = x; this.y = y; this.z = z; return this; },
    add: function(o) {
      if (typeof o === 'number') { this.x += o; this.y += o; this.z += o; }
      else { this.x += o.x; this.y += o.y; this.z += o.z; }
      return this;
    },
    sub: function(o) {
      if (typeof o === 'number') { this.x -= o; this.y -= o; this.z -= o; }
      else { this.x -= o.x; this.y -= o.y; this.z -= o.z; }
      return this;
    },
    mul: function(o) {
      if (typeof o === 'number') { this.x *= o; this.y *= o; this.z *= o; }
      else { this.x *= o.x; this.y *= o.y; this.z *= o.z; }
      return this;
    },
    dot3d: function(x, y, z) { return this.x*x + this.y*y + this.z*z; },
    move: function(d) { if (d instanceof Vector3D) { d.x = this.x; d.y = this.y; d.z = this.z; } return this; },
    wrap2d: function(b) {
      if (this.x > b.x) { this.x = 0; return true; }
      if (this.x < 0)   { this.x = b.x; return true; }
      if (this.y > b.y) { this.y = 0; return true; }
      if (this.y < 0)   { this.y = b.y; return true; }
    },
    distance: function(o) {
      var dx = this.x - o.x, dy = this.y - o.y;
      return Math.sqrt(dx*dx + dy*dy);
    },
    clone: function() { return new Vector3D(this.x, this.y, this.z); }
  };

  // ---- Simple PRNG ----
  function SmallPRNG(seed) {
    this.s = seed | 0;
    this.a = 0xf1ea5eed;
    this.b = this.c = this.d = this.s;
    for (var i = 0; i < 20; i++) this._next();
  }
  SmallPRNG.prototype._next = function() {
    var e = this.a - ((this.b << 27) | (this.b >>> 5));
    this.a = this.b ^ ((this.c << 17) | (this.c >>> 15));
    this.b = this.c + this.d;
    this.c = this.d + e;
    this.d = e + this.a;
    return this.d >>> 0;
  };
  SmallPRNG.prototype.random = function(min, max) {
    var r = this._next() / 4294967296;
    if (min === undefined) return r;
    return Math.floor(r * (max - min + 1)) + min;
  };

  // ---- Perlin Simplex Noise ----
  function Perlin() {
    this.grad3 = [
      new Vector3D(1,1,0), new Vector3D(-1,1,0), new Vector3D(1,-1,0), new Vector3D(-1,-1,0),
      new Vector3D(1,0,1), new Vector3D(-1,0,1), new Vector3D(1,0,-1), new Vector3D(-1,0,-1),
      new Vector3D(0,1,1), new Vector3D(0,-1,1), new Vector3D(0,1,-1), new Vector3D(0,-1,-1)
    ];
    this.p = [
      151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,
      140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,
      247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,
      57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,
      74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,
      60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,
      65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,
      200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,
      52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,
      207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,
      119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
      129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,
      218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,
      81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,
      184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,
      222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
    ];
    this.permutation = new Array(512);
    this.gradP = new Array(512);
    this.F3 = 1/3; this.G3 = 1/6;
  }
  Perlin.prototype.init = function(prng) {
    for (var i = 0; i < 256; i++) {
      var v = (this.p[i] ^ prng()) & 255;
      this.permutation[i] = this.permutation[i+256] = v;
      this.gradP[i] = this.gradP[i+256] = this.grad3[v % 12];
    }
  };
  Perlin.prototype.simplex3d = function(x, y, z) {
    var s = (x+y+z)*this.F3;
    var i = Math.floor(x+s), j = Math.floor(y+s), k = Math.floor(z+s);
    var t = (i+j+k)*this.G3;
    var x0=x-i+t, y0=y-j+t, z0=z-k+t;
    var i1,j1,k1,i2,j2,k2;
    if (x0>=y0) {
      if (y0>=z0)       { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0; }
      else if (x0>=z0)  { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1; }
      else              { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1; }
    } else {
      if (y0<z0)        { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1; }
      else if (x0<z0)   { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1; }
      else              { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0; }
    }
    var x1=x0-i1+this.G3, y1=y0-j1+this.G3, z1=z0-k1+this.G3;
    var x2=x0-i2+2*this.G3, y2=y0-j2+2*this.G3, z2=z0-k2+2*this.G3;
    var x3=x0-1+3*this.G3, y3=y0-1+3*this.G3, z3=z0-1+3*this.G3;
    i&=255; j&=255; k&=255;
    var gi0=this.gradP[i+this.permutation[j+this.permutation[k]]];
    var gi1=this.gradP[i+i1+this.permutation[j+j1+this.permutation[k+k1]]];
    var gi2=this.gradP[i+i2+this.permutation[j+j2+this.permutation[k+k2]]];
    var gi3=this.gradP[i+1+this.permutation[j+1+this.permutation[k+1]]];
    var t0=0.6-x0*x0-y0*y0-z0*z0;
    var t1=0.6-x1*x1-y1*y1-z1*z1;
    var t2=0.6-x2*x2-y2*y2-z2*z2;
    var t3=0.6-x3*x3-y3*y3-z3*z3;
    var n0=t0<0?0:(t0*=t0,t0*t0*gi0.dot3d(x0,y0,z0));
    var n1=t1<0?0:(t1*=t1,t1*t1*gi1.dot3d(x1,y1,z1));
    var n2=t2<0?0:(t2*=t2,t2*t2*gi2.dot3d(x2,y2,z2));
    var n3=t3<0?0:(t3*=t3,t3*t3*gi3.dot3d(x3,y3,z3));
    return 32*(n0+n1+n2+n3);
  };

  // ---- Particle ----
  function Particle(gen, bounds, rctx) {
    this.p = new Vector3D();
    this.t = new Vector3D();
    this.v = new Vector3D();
    this.g = gen; this.b = bounds; this.r = rctx;
    this.reset();
  }
  Particle.prototype.reset = function() {
    this.p.x = this.t.x = Math.floor(this.r.random() * this.b.x);
    this.p.y = this.t.y = Math.floor(this.r.random() * this.b.y);
    this.v.set(1, 1, 0);
    this.i = 0;
    this.l = this.r.random(800, 8000);
  };
  Particle.prototype.step = function() {
    if (this.i++ > this.l) this.reset();
    var xx = this.p.x / 200, yy = this.p.y / 200, zz = Date.now() / 5000;
    var a = this.r.random() * Math.PI * 2, rnd = this.r.random() / 4;
    this.v.x += rnd * Math.sin(a) + this.g.simplex3d(xx, yy, -zz);
    this.v.y += rnd * Math.cos(a) + this.g.simplex3d(xx, yy,  zz);
    this.p.move(this.t).add(this.v.mul(0.94));
    if (this.p.wrap2d(this.b)) this.p.move(this.t);
  };
  Particle.prototype.render = function(ctx) {
    ctx.moveTo(this.t.x, this.t.y);
    ctx.lineTo(this.p.x, this.p.y);
  };

  // ---- Main init ----
  window.addEventListener('load', function() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var rctx = new SmallPRNG(+new Date());
    var perlin = new Perlin();
    var bounds = new Vector3D(0, 0, 0);
    var particles = [];
    var hue = 0;
    var NUM_PARTICLES = 3500;
    var animId;

    perlin.init(function() { return rctx.random(0, 255); });

    function resize() {
      canvas.width  = bounds.x = window.innerWidth;
      canvas.height = bounds.y = window.innerHeight;
      ctx.fillStyle = '#000008';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < NUM_PARTICLES; i++) {
      particles.push(new Particle(perlin, bounds, rctx));
    }

    function render() {
      animId = requestAnimationFrame(render);
      ctx.beginPath();
      for (var i = 0; i < particles.length; i++) {
        particles[i].step();
        particles[i].render(ctx);
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 8, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'hsla(' + hue + ', 75%, 55%, 0.45)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.closePath();
      hue = (hue + 0.4) % 360;
    }

    render();
  });
})();
