/**
 * CONFETTI SYSTEM
 * Lightweight canvas-based confetti for celebrations
 */

import { random, createAnimationLoop } from './utils.js';
import { prefersReducedMotion } from './state.js';

class ConfettiSystem {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationLoop = null;
    this.colors = [
      '#ff6b9d', // Primary pink
      '#9b59b6', // Purple
      '#f39c12', // Gold
      '#e74c3c', // Red
      '#ff85b3', // Light pink
      '#a855f7', // Violet
      '#fbbf24'  // Amber
    ];
  }
  
  /**
   * Initialize the confetti canvas
   */
  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    
    // Handle resize
    window.addEventListener('resize', () => this.resize());
    
    // Create animation loop
    this.animationLoop = createAnimationLoop(() => this.animate());
  }
  
  /**
   * Resize canvas to window size
   */
  resize() {
    if (!this.canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.ctx.scale(dpr, dpr);
  }
  
  /**
   * Create a single confetti particle
   */
  createParticle(x, y) {
    const angle = random(0, Math.PI * 2);
    const velocity = random(5, 12);
    
    return {
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - random(3, 8),
      color: this.colors[Math.floor(random(0, this.colors.length))],
      size: random(6, 12),
      rotation: random(0, Math.PI * 2),
      rotationSpeed: random(-0.1, 0.1),
      gravity: 0.15,
      friction: 0.99,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    };
  }
  
  /**
   * Fire confetti burst from position
   */
  fire(x = window.innerWidth / 2, y = window.innerHeight / 2, count = 50) {
    // Respect reduced motion preference
    if (prefersReducedMotion()) {
      return;
    }
    
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(x, y));
    }
    
    if (!this.animationLoop.isRunning()) {
      this.animationLoop.start();
    }
  }
  
  /**
   * Fire confetti from multiple points
   */
  burst() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Fire from multiple positions
    this.fire(width * 0.25, height * 0.6, 40);
    this.fire(width * 0.75, height * 0.6, 40);
    this.fire(width * 0.5, height * 0.4, 60);
    
    // Add delayed bursts for effect
    setTimeout(() => {
      this.fire(width * 0.3, height * 0.5, 30);
      this.fire(width * 0.7, height * 0.5, 30);
    }, 200);
    
    setTimeout(() => {
      this.fire(width * 0.5, height * 0.3, 40);
    }, 400);
  }
  
  /**
   * Animation loop
   */
  animate() {
    if (!this.ctx || !this.canvas) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Update physics
      p.vy += p.gravity;
      p.vx *= p.friction;
      p.vy *= p.friction;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      
      // Fade out when below screen
      if (p.y > window.innerHeight) {
        p.opacity -= 0.02;
      }
      
      // Remove dead particles
      if (p.opacity <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Draw particle
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      
      if (p.shape === 'rect') {
        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      this.ctx.restore();
    }
    
    // Stop animation when all particles are gone
    if (this.particles.length === 0) {
      this.animationLoop.stop();
    }
  }
  
  /**
   * Clear all particles
   */
  clear() {
    this.particles = [];
    this.animationLoop.stop();
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// Export singleton instance
export const confetti = new ConfettiSystem();
