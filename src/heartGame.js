/**
 * Jeu bonus : Remplir le coeur avec des gouttes colorées
 * Inspiré de archive/anniversaire-flora/public/index.html
 */

class HeartFillGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.raindrops = [];
    this.id = 0;
    this.running = false;
    
    // Configuration
    this.bg = '1a0a1a';
    this.minSize = 2;
    this.maxSize = 5;
    this.minSpeed = 4;
    this.maxSpeed = 15;
    this.minHue = 300; // Rose/violet
    this.maxHue = 360;
    this.maxAmount = 60;
  }
  
  init(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    
    // Écouter le redimensionnement
    this.resizeHandler = () => this.resize();
    window.addEventListener('resize', this.resizeHandler);
    
    // Écouter les mouvements de souris pour l'effet de traînée
    this.mouseHandler = (e) => this.mouseTrail(e);
    this.canvas.addEventListener('mousemove', this.mouseHandler);
    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      this.mouseTrail({ clientX: touch.clientX, clientY: touch.clientY });
    }, { passive: true });
  }
  
  resize() {
    if (!this.canvas) return;
    
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth || 400;
    this.canvas.height = container.clientHeight || 400;
    
    this.canvasW = this.canvas.width;
    this.canvasH = this.canvas.height;
    this.canvasWHalf = this.canvasW / 2;
    this.canvasHHalf = this.canvasH / 2;
    
    // Ajuster la position du coeur
    const scale = Math.min(this.canvasW, this.canvasH) / 500;
    this.xoff = this.canvasWHalf - (306 * scale);
    this.yoff = 30 * scale;
    this.scale = scale;
  }
  
  random(min, max) {
    if (arguments.length < 2) {
      max = min;
      min = 0;
    }
    return Math.floor(Math.random() * (max - min) + min);
  }
  
  hexToRGB(hex, opacity) {
    let rgb = '';
    hex.match(/.{2}/g).forEach((n) => {
      rgb += (parseInt(n, 16)) + ',';
    });
    return 'rgba(' + rgb + opacity + ')';
  }
  
  createRaindrop() {
    this.id++;
    const drop = {
      id: this.id,
      y: this.random(-this.canvasH),
      x: this.random(this.canvasW),
      size: this.random(this.minSize, this.maxSize),
      speed: this.random(this.minSpeed, this.maxSpeed),
      color: 'hsl(' + this.random(this.minHue, this.maxHue) + ',100%,65%)',
    };
    this.raindrops.push(drop);
    return drop;
  }
  
  draw() {
    const ctx = this.ctx;
    const s = this.scale;
    
    // Dessiner le fond semi-transparent pour créer l'effet de traînée
    ctx.fillStyle = this.hexToRGB(this.bg, '0.08');
    ctx.beginPath();
    
    // Moitié gauche du coeur
    ctx.moveTo(0, 0);
    ctx.lineTo(this.canvasWHalf, 0);
    ctx.lineTo((304 * s) + this.xoff, (97 * s) + this.yoff);
    ctx.bezierCurveTo(
      (282 * s) + this.xoff, (-5 * s) + this.yoff,
      (80 * s) + this.xoff, (-6 * s) + this.yoff,
      (76 * s) + this.xoff, (165 * s) + this.yoff
    );
    ctx.bezierCurveTo(
      (74 * s) + this.xoff, (251 * s) + this.yoff,
      (184 * s) + this.xoff, (300 * s) + this.yoff,
      (304 * s) + this.xoff, (447 * s) + this.yoff
    );
    ctx.lineTo(this.canvasWHalf, this.canvasH);
    ctx.lineTo(0, this.canvasH);
    
    // Moitié droite du coeur
    ctx.moveTo(this.canvasW, 0);
    ctx.lineTo(this.canvasWHalf, 0);
    ctx.lineTo((304 * s) + this.xoff, (97 * s) + this.yoff);
    ctx.bezierCurveTo(
      (326 * s) + this.xoff, (5 * s) + this.yoff,
      (528 * s) + this.xoff, (6 * s) + this.yoff,
      (532 * s) + this.xoff, (165 * s) + this.yoff
    );
    ctx.bezierCurveTo(
      (534 * s) + this.xoff, (251 * s) + this.yoff,
      (424 * s) + this.xoff, (300 * s) + this.yoff,
      (304 * s) + this.xoff, (447 * s) + this.yoff
    );
    ctx.lineTo(this.canvasWHalf, this.canvasH);
    ctx.lineTo(this.canvasW, this.canvasH);
    
    ctx.closePath();
    ctx.fill();
    
    // Dessiner les gouttes
    this.raindrops.forEach((drop) => {
      drop.y += drop.speed;
      
      // Réinitialiser si sort de l'écran
      if (drop.y >= this.canvasH) {
        drop.y = this.random(-this.canvasH / 2);
        drop.x = this.random(this.canvasW);
      }
      
      ctx.save();
      ctx.beginPath();
      
      const gradient = ctx.createRadialGradient(
        drop.x, drop.y, 0,
        drop.x, drop.y, drop.size
      );
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(0.5, drop.color);
      gradient.addColorStop(1, this.hexToRGB(this.bg, 0));
      
      ctx.rect(drop.x, drop.y, drop.size, this.maxSpeed);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.closePath();
      ctx.restore();
    });
  }
  
  mouseTrail(e) {
    if (!this.ctx || !this.running) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'overlay';
    this.ctx.fillStyle = 'rgba(255,255,255,0.15)';
    this.ctx.beginPath();
    this.ctx.arc(x, y, 40, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
  
  start() {
    if (this.running) return;
    this.running = true;
    
    // Initialiser le fond
    this.ctx.fillStyle = '#' + this.bg;
    this.ctx.fillRect(0, 0, this.canvasW, this.canvasH);
    
    // Créer les gouttes initiales
    this.raindrops = [];
    this.id = 0;
    for (let i = 0; i < this.maxAmount; i++) {
      this.createRaindrop();
    }
    
    // Lancer l'animation
    const animate = () => {
      if (!this.running) return;
      this.draw();
      this.animationId = window.requestAnimationFrame(animate);
    };
    
    this.animationId = window.requestAnimationFrame(animate);
  }
  
  stop() {
    this.running = false;
    if (this.animationId) {
      window.cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Nettoyer les écouteurs
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (this.canvas && this.mouseHandler) {
      this.canvas.removeEventListener('mousemove', this.mouseHandler);
    }
  }
  
  destroy() {
    this.stop();
    this.raindrops = [];
    this.canvas = null;
    this.ctx = null;
  }
}

export const heartFillGame = new HeartFillGame();
