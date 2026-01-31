/**
 * SYSTÈME AUDIO
 * Gestion de la musique de fond et des effets sonores
 */

import { $ } from './utils.js';

class AudioManager {
  constructor() {
    this.bgMusic = null;
    this.musicToggle = null;
    this.musicIcon = null;
    this.isPlaying = false;
    this.isMuted = false;
    this.hasInteracted = false;
    this.volume = 0.3;
  }
  
  /**
   * Initialiser le système audio
   */
  init() {
    this.bgMusic = $('#bg-music');
    this.musicToggle = $('#music-toggle');
    this.musicIcon = $('#music-icon');
    
    if (!this.bgMusic || !this.musicToggle) {
      console.warn('Éléments audio non trouvés');
      return;
    }
    
    // Configurer le volume
    this.bgMusic.volume = this.volume;
    
    // Charger la préférence de l'utilisateur
    this.loadPreference();
    
    // Configurer le bouton de toggle
    this.setupToggle();
    
    // Configurer le démarrage automatique sur première interaction
    this.setupAutoplay();
    
    // Écouter les événements de l'audio
    this.setupAudioEvents();
  }
  
  /**
   * Configurer le bouton de toggle
   */
  setupToggle() {
    if (!this.musicToggle) return;
    
    this.musicToggle.addEventListener('click', () => {
      this.toggle();
    });
    
    // Mettre à jour l'état visuel initial
    this.updateVisualState();
  }
  
  /**
   * Configurer l'autoplay sur première interaction
   * (Nécessaire à cause des politiques de navigateur)
   */
  setupAutoplay() {
    const startOnInteraction = () => {
      if (this.hasInteracted) return;
      this.hasInteracted = true;
      
      // Ne démarrer que si l'utilisateur n'a pas explicitement coupé le son
      if (!this.isMuted) {
        this.play();
      }
      
      // Retirer les écouteurs après première interaction
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('touchstart', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
    };
    
    document.addEventListener('click', startOnInteraction);
    document.addEventListener('touchstart', startOnInteraction);
    document.addEventListener('keydown', startOnInteraction);
  }
  
  /**
   * Configurer les événements audio
   */
  setupAudioEvents() {
    if (!this.bgMusic) return;
    
    this.bgMusic.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateVisualState();
    });
    
    this.bgMusic.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateVisualState();
    });
    
    this.bgMusic.addEventListener('ended', () => {
      this.isPlaying = false;
      this.updateVisualState();
    });
    
    // Gérer les erreurs de chargement gracieusement
    this.bgMusic.addEventListener('error', (e) => {
      console.warn('Impossible de charger la musique:', e);
      // Cacher le bouton si la musique ne peut pas être chargée
      if (this.musicToggle) {
        this.musicToggle.style.display = 'none';
      }
    });
  }
  
  /**
   * Jouer la musique
   */
  async play() {
    if (!this.bgMusic) return;
    
    try {
      await this.bgMusic.play();
      this.isPlaying = true;
      this.isMuted = false;
      this.savePreference();
      this.updateVisualState();
    } catch (e) {
      console.warn('Impossible de jouer la musique:', e);
    }
  }
  
  /**
   * Mettre en pause la musique
   */
  pause() {
    if (!this.bgMusic) return;
    
    this.bgMusic.pause();
    this.isPlaying = false;
    this.updateVisualState();
  }
  
  /**
   * Toggle la musique
   */
  toggle() {
    if (this.isPlaying) {
      this.pause();
      this.isMuted = true;
    } else {
      this.play();
      this.isMuted = false;
    }
    this.savePreference();
  }
  
  /**
   * Mettre à jour l'état visuel du bouton
   */
  updateVisualState() {
    if (!this.musicToggle || !this.musicIcon) return;
    
    if (this.isPlaying) {
      this.musicToggle.classList.add('playing');
      this.musicToggle.classList.remove('muted');
      this.musicIcon.textContent = '🎵';
      this.musicToggle.setAttribute('aria-label', 'Couper la musique');
    } else {
      this.musicToggle.classList.remove('playing');
      this.musicToggle.classList.add('muted');
      this.musicIcon.textContent = '🔇';
      this.musicToggle.setAttribute('aria-label', 'Activer la musique');
    }
  }
  
  /**
   * Sauvegarder la préférence utilisateur
   */
  savePreference() {
    try {
      localStorage.setItem('valentine_music_muted', this.isMuted ? 'true' : 'false');
    } catch (e) {
      // localStorage peut ne pas être disponible
    }
  }
  
  /**
   * Charger la préférence utilisateur
   */
  loadPreference() {
    try {
      const saved = localStorage.getItem('valentine_music_muted');
      if (saved === 'true') {
        this.isMuted = true;
      }
    } catch (e) {
      // localStorage peut ne pas être disponible
    }
  }
  
  /**
   * Définir le volume
   */
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.bgMusic) {
      this.bgMusic.volume = this.volume;
    }
  }
  
  /**
   * Arrêter complètement la musique
   */
  stop() {
    if (!this.bgMusic) return;
    
    this.bgMusic.pause();
    this.bgMusic.currentTime = 0;
    this.isPlaying = false;
    this.updateVisualState();
  }
}

// Exporter l'instance singleton
export const audioManager = new AudioManager();
