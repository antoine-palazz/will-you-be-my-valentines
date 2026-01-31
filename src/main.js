/**
 * VALENTINE'S SPA - POINT D'ENTRÉE PRINCIPAL
 * Coordonne tous les modules et gère les événements globaux
 */

import { CONFIG } from './config.js';
import { appState } from './state.js';
import { $, toasts, preventDoubleClick, debounce } from './utils.js';
import { confetti } from './confetti.js';
import { heartGame } from './game.js';
import { audioManager } from './audio.js';
import { 
  renderCurrentStep, 
  handleQuizAnswer, 
  handleDeclineTerms,
  startGame,
  handleCopyResponse,
  resetModuleState
} from './steps.js';

/**
 * Initialiser l'application
 */
function init() {
  // Créer les cœurs flottants en arrière-plan
  createFloatingHearts();
  
  // Configurer le crédit de l'expéditeur dans le footer
  const senderCredit = $('#sender-credit');
  if (senderCredit) {
    senderCredit.textContent = CONFIG.senderName;
  }
  
  // Initialiser le système de toast
  const toastContainer = $('#toast-container');
  toasts.init(toastContainer);
  
  // Initialiser le canvas de confettis
  const confettiCanvas = $('#confetti-canvas');
  confetti.init(confettiCanvas);
  
  // Initialiser le système audio
  audioManager.init();
  
  // Configurer la délégation d'événements
  setupEventDelegation();
  
  // Configurer le bouton de reset
  setupResetButton();
  
  // S'abonner aux changements d'état
  appState.subscribe(() => {
    renderCurrentStep();
  });
  
  // Gérer le changement de visibilité (mettre le jeu en pause si caché)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      heartGame.stop();
    }
  });
  
  // Gérer le redimensionnement avec debounce
  window.addEventListener('resize', debounce(() => {
    // Re-rendre l'étape actuelle pour gérer les changements de layout
    renderCurrentStep();
  }, 250));
  
  // Rendu initial
  renderCurrentStep();
}

/**
 * Créer les cœurs flottants en arrière-plan
 */
function createFloatingHearts() {
  const hearts = ['💕', '💖', '💗', '💝', '💘', '❤️', '🩷', '🤍'];
  const container = document.createElement('div');
  container.className = 'floating-hearts';
  container.setAttribute('aria-hidden', 'true');
  
  for (let i = 0; i < 10; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    container.appendChild(heart);
  }
  
  document.body.insertBefore(container, document.body.firstChild);
}

/**
 * Configurer la délégation d'événements pour tous les éléments interactifs
 */
function setupEventDelegation() {
  // Variable pour éviter le double-tap sur mobile
  let lastActionTime = 0;
  
  // Fonction pour gérer les actions
  const handleAction = (action, target) => {
    // Anti-rebond de 300ms
    const now = Date.now();
    if (now - lastActionTime < 300) return;
    lastActionTime = now;
    
    switch (action) {
      // Étape 0 : Compte à rebours
      case 'reveal-question':
        appState.nextStep();
        break;
      
      case 'skip-intro':
        // Passer l'intro et aller directement au bouton de révélation
        resetModuleState(); // Annuler les animations en cours
        appState.set({ countdownComplete: true });
        renderCurrentStep();
        break;
      
      // Étape 1 : Oui/Non
      case 'yes-click':
        appState.nextStep();
        break;
      
      case 'not-now':
        appState.enterNotNowPath();
        break;
      
      // Étape 2 : Quiz
      case 'quiz-answer':
        handleQuizAnswer(parseInt(target.dataset.answer, 10));
        break;
      
      // Étape 3 : Termes
      case 'accept-terms':
        if (!target.disabled) {
          appState.nextStep();
        }
        break;
      
      case 'decline-terms':
        handleDeclineTerms();
        break;
      
      // Étape 4 : Jeu
      case 'start-game':
        startGame();
        break;
      
      case 'skip-game':
        appState.set({ gameComplete: true, gameScore: 0 });
        break;
      
      case 'retry-game':
        appState.set({ gameComplete: false });
        renderCurrentStep();
        break;
      
      // Étapes 5 & 6 : IA et Final
      case 'next-step':
        appState.nextStep();
        break;
      
      case 'final-yes':
        appState.set({ finalChoice: 'yes' });
        renderCurrentStep();
        break;
      
      case 'final-different-day':
        appState.set({ finalChoice: 'different-day' });
        renderCurrentStep();
        break;
      
      case 'select-alt-date':
        toasts.show('Parfait ! J\'ai trop hâte ! 💕');
        confetti.burst();
        break;
      
      case 'copy-response':
        handleCopyResponse();
        break;
      
      // Chemin "pas maintenant" et reset
      case 'restart':
      case 'reset':
        doReset();
        break;
      
      case 'continue-exploring':
        appState.exitNotNowPath(true);
        break;
    }
  };
  
  // Gestionnaire unique pour click (fonctionne aussi sur mobile)
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    
    const action = target.dataset.action;
    handleAction(action, target);
  });
}

/**
 * Effectuer le reset complet
 */
function doReset() {
  // Arrêter tout jeu en cours
  heartGame.stop();
  
  // Effacer les confettis
  confetti.clear();
  
  // Réinitialiser les variables du module steps
  resetModuleState();
  
  // Effacer le sessionStorage
  try {
    sessionStorage.removeItem('valentine_app_state');
  } catch (e) {
    // Ignorer les erreurs de storage
  }
  
  // Réinitialiser l'état (cela va déclencher renderCurrentStep via le subscriber)
  appState.reset();
  
  // Forcer le re-rendu explicitement
  renderCurrentStep();
  
  toasts.show('On recommence ! 🔄');
}

/**
 * Configurer le bouton de reset avec un listener direct
 */
function setupResetButton() {
  const resetBtn = document.getElementById('reset-btn');
  if (!resetBtn) return;
  
  let isResetting = false;
  
  const handleReset = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Éviter les doubles clics
    if (isResetting) return;
    isResetting = true;
    
    doReset();
    
    // Reset le flag après un délai
    setTimeout(() => {
      isResetting = false;
    }, 500);
  };
  
  // Click pour desktop et mobile
  resetBtn.addEventListener('click', handleReset);
}

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
