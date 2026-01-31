/**
 * MINI GAME - Catch the Hearts
 * A simple, accessible canvas game
 */

import { random, randomInt, clamp, createAnimationLoop } from './utils.js';
import { prefersReducedMotion } from './state.js';

class HeartGame {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    
    // Game state
    this.running = false;
    this.score = 0;
    this.targetScore = 10;
    this.timeLeft = 20;
    this.gameOver = false;
    this.won = false;
    
    // Player
    this.player = {
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      speed: 8
    };
    
    // Collectibles
    this.hearts = [];
    this.brokenHearts = [];
    
    // Input
    this.keys = {};
    this.touch = { active: false, x: 0, y: 0 };
    
    // Animation loop
    this.animationLoop = null;
    this.lastTime = 0;
    this.spawnTimer = 0;
    this.timerInterval = null;
    
    // Callbacks
    this.onComplete = null;
  }
  
  /**
   * Initialize the game
   */
  init(canvas, onComplete) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onComplete = onComplete;
    
    this.resize();
    this.setupControls();
    
    this.animationLoop = createAnimationLoop((timestamp) => this.update(timestamp));
    
    // Handle resize
    window.addEventListener('resize', () => this.resize());
  }
  
  /**
   * Resize canvas
   */
  resize() {
    if (!this.canvas) return;
    
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    this.dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.width * 0.75; // 4:3 aspect ratio
    
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    
    this.ctx.scale(this.dpr, this.dpr);
    
    // Reposition player
    this.player.y = this.height - this.player.height - 10;
    if (this.player.x === 0) {
      this.player.x = this.width / 2 - this.player.width / 2;
    }
  }
  
  /**
   * Set up controls
   */
  setupControls() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
    
    // Touch controls
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.touch.active = true;
      this.touch.x = touch.clientX - rect.left;
      this.touch.y = touch.clientY - rect.top;
    }, { passive: false });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      this.touch.x = touch.clientX - rect.left;
      this.touch.y = touch.clientY - rect.top;
    }, { passive: false });
    
    this.canvas.addEventListener('touchend', () => {
      this.touch.active = false;
    });
    
    // Mouse controls (for desktop)
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.touch.x = e.clientX - rect.left;
      this.touch.active = true;
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      this.touch.active = false;
    });
  }
  
  /**
   * Start the game
   */
  start() {
    this.reset();
    this.running = true;
    this.lastTime = performance.now();
    this.animationLoop.start();
    
    // Start countdown timer
    this.timerInterval = setInterval(() => {
      if (this.running && !this.gameOver) {
        this.timeLeft--;
        this.updateHUD();
        
        if (this.timeLeft <= 0) {
          this.endGame(false);
        }
      }
    }, 1000);
  }
  
  /**
   * Reset game state
   */
  reset() {
    this.score = 0;
    this.timeLeft = 20;
    this.gameOver = false;
    this.won = false;
    this.hearts = [];
    this.brokenHearts = [];
    this.player.x = this.width / 2 - this.player.width / 2;
    this.spawnTimer = 0;
  }
  
  /**
   * Spawn a heart
   */
  spawnHeart() {
    const isBroken = Math.random() < 0.25; // 25% chance of broken heart
    const heart = {
      x: random(20, this.width - 40),
      y: -30,
      size: 30,
      speed: random(2, 4),
      rotation: random(-0.5, 0.5),
      isBroken
    };
    
    if (isBroken) {
      this.brokenHearts.push(heart);
    } else {
      this.hearts.push(heart);
    }
  }
  
  /**
   * Update game state
   */
  update(timestamp) {
    if (!this.running || this.gameOver) return;
    
    const deltaTime = (timestamp - this.lastTime) / 16.67; // Normalize to ~60fps
    this.lastTime = timestamp;
    
    // Handle input
    this.handleInput(deltaTime);
    
    // Spawn hearts
    this.spawnTimer += deltaTime;
    if (this.spawnTimer > 30) { // Every ~0.5 seconds
      this.spawnHeart();
      this.spawnTimer = 0;
    }
    
    // Update hearts
    this.updateHearts(deltaTime);
    
    // Check collisions
    this.checkCollisions();
    
    // Render
    this.render();
    
    // Check win condition
    if (this.score >= this.targetScore) {
      this.endGame(true);
    }
  }
  
  /**
   * Handle player input
   */
  handleInput(deltaTime) {
    const speed = this.player.speed * deltaTime;
    
    // Keyboard
    if (this.keys['ArrowLeft'] || this.keys['a']) {
      this.player.x -= speed;
    }
    if (this.keys['ArrowRight'] || this.keys['d']) {
      this.player.x += speed;
    }
    
    // Touch/Mouse - move towards touch position
    if (this.touch.active) {
      const targetX = this.touch.x - this.player.width / 2;
      const diff = targetX - this.player.x;
      this.player.x += diff * 0.15;
    }
    
    // Clamp to bounds
    this.player.x = clamp(this.player.x, 0, this.width - this.player.width);
  }
  
  /**
   * Update hearts positions
   */
  updateHearts(deltaTime) {
    const updateList = (list) => {
      for (let i = list.length - 1; i >= 0; i--) {
        const heart = list[i];
        heart.y += heart.speed * deltaTime;
        
        // Remove if off screen
        if (heart.y > this.height + 30) {
          list.splice(i, 1);
        }
      }
    };
    
    updateList(this.hearts);
    updateList(this.brokenHearts);
  }
  
  /**
   * Check collisions with player
   */
  checkCollisions() {
    const playerRect = {
      x: this.player.x,
      y: this.player.y,
      width: this.player.width,
      height: this.player.height
    };
    
    const checkCollision = (heart) => {
      return (
        heart.x < playerRect.x + playerRect.width &&
        heart.x + heart.size > playerRect.x &&
        heart.y < playerRect.y + playerRect.height &&
        heart.y + heart.size > playerRect.y
      );
    };
    
    // Check good hearts
    for (let i = this.hearts.length - 1; i >= 0; i--) {
      if (checkCollision(this.hearts[i])) {
        this.hearts.splice(i, 1);
        this.score++;
        this.updateHUD();
      }
    }
    
    // Check broken hearts (just remove them, no penalty)
    for (let i = this.brokenHearts.length - 1; i >= 0; i--) {
      if (checkCollision(this.brokenHearts[i])) {
        this.brokenHearts.splice(i, 1);
        // Small time penalty instead of score penalty
        // this.timeLeft = Math.max(0, this.timeLeft - 1);
      }
    }
  }
  
  /**
   * Update HUD elements
   */
  updateHUD() {
    const scoreEl = document.querySelector('.game-score');
    const timerEl = document.querySelector('.game-timer');
    
    if (scoreEl) scoreEl.textContent = `💕 ${this.score}/${this.targetScore}`;
    if (timerEl) timerEl.textContent = `⏱️ ${this.timeLeft}s`;
  }
  
  /**
   * Render game
   */
  render() {
    const ctx = this.ctx;
    
    // Clear
    ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#ffe8f0');
    gradient.addColorStop(1, '#fff5f8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw hearts
    this.hearts.forEach(heart => this.drawHeart(heart, '#ff6b9d'));
    this.brokenHearts.forEach(heart => this.drawBrokenHeart(heart));
    
    // Draw player (basket/catcher)
    this.drawPlayer();
  }
  
  /**
   * Draw a heart shape
   */
  drawHeart(heart, color) {
    const ctx = this.ctx;
    const { x, y, size } = heart;
    
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    
    // Heart shape using bezier curves
    const s = size * 0.5;
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(0, 0, -s, 0, -s, s * 0.3);
    ctx.bezierCurveTo(-s, s * 0.6, 0, s, 0, s * 1.2);
    ctx.bezierCurveTo(0, s, s, s * 0.6, s, s * 0.3);
    ctx.bezierCurveTo(s, 0, 0, 0, 0, s * 0.3);
    
    ctx.fill();
    ctx.restore();
  }
  
  /**
   * Draw a broken heart
   */
  drawBrokenHeart(heart) {
    const ctx = this.ctx;
    const { x, y, size } = heart;
    
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    
    // Draw with gray color and crack
    ctx.fillStyle = '#ccc';
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    
    const s = size * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.3);
    ctx.bezierCurveTo(0, 0, -s, 0, -s, s * 0.3);
    ctx.bezierCurveTo(-s, s * 0.6, 0, s, 0, s * 1.2);
    ctx.bezierCurveTo(0, s, s, s * 0.6, s, s * 0.3);
    ctx.bezierCurveTo(s, 0, 0, 0, 0, s * 0.3);
    ctx.fill();
    
    // Draw crack
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.2);
    ctx.lineTo(-s * 0.2, s * 0.3);
    ctx.lineTo(s * 0.1, s * 0.5);
    ctx.lineTo(-s * 0.1, s * 0.9);
    ctx.stroke();
    
    ctx.restore();
  }
  
  /**
   * Draw player (basket)
   */
  drawPlayer() {
    const ctx = this.ctx;
    const { x, y, width, height } = this.player;
    
    // Draw basket
    ctx.fillStyle = '#9b59b6';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width - 8, y + height);
    ctx.lineTo(x + 8, y + height);
    ctx.closePath();
    ctx.fill();
    
    // Basket rim
    ctx.fillStyle = '#8e44ad';
    ctx.fillRect(x - 3, y - 5, width + 6, 10);
    
    // Inner basket
    ctx.fillStyle = '#7d3c98';
    ctx.beginPath();
    ctx.moveTo(x + 5, y + 5);
    ctx.lineTo(x + width - 5, y + 5);
    ctx.lineTo(x + width - 12, y + height - 5);
    ctx.lineTo(x + 12, y + height - 5);
    ctx.closePath();
    ctx.fill();
  }
  
  /**
   * End the game
   */
  endGame(won) {
    this.gameOver = true;
    this.won = won;
    this.running = false;
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    
    if (this.animationLoop) {
      this.animationLoop.stop();
    }
    
    if (this.onComplete) {
      this.onComplete(won, this.score);
    }
  }
  
  /**
   * Stop the game
   */
  stop() {
    this.running = false;
    
    if (this.animationLoop) {
      this.animationLoop.stop();
    }
    
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  
  /**
   * Destroy the game
   */
  destroy() {
    this.stop();
    this.canvas = null;
    this.ctx = null;
  }
}

// Export singleton
export const heartGame = new HeartGame();
