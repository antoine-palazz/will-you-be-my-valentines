/**
 * RENDUS DES ÉTAPES
 * Chaque étape est une fonction qui retourne le HTML pour cette étape
 */

import { CONFIG } from './config.js';
import { appState, prefersReducedMotion } from './state.js';
import { $, createElement, sleep, toasts, copyToClipboard, randomPick, random } from './utils.js';
import { confetti } from './confetti.js';
import { heartGame } from './game.js';
import { heartFillGame } from './heartGame.js';

// État du bouton NON
let noButtonDodgeCount = 0;
let dodgeCooldown = false;

// Flag pour annuler les animations en cours
let animationCancelled = false;

// ID unique pour les sessions d'animation
let currentAnimationId = 0;

/**
 * Réinitialiser les variables du module
 */
export function resetModuleState() {
  noButtonDodgeCount = 0;
  dodgeCooldown = false;
  // Incrémenter l'ID pour invalider les animations en cours
  currentAnimationId++;
  // Arrêter le jeu bonus du coeur si actif
  heartFillGame.stop();
}

/**
 * Rendre l'étape actuelle
 */
export function renderCurrentStep() {
  const state = appState.get();
  const container = $('#main-content');
  
  // Si on est dans le chemin "pas maintenant", afficher ça à la place
  if (state.notNowPath) {
    renderNotNowPath(container);
    return;
  }
  
  // Rendre l'étape appropriée
  const stepRenderers = [
    renderStep0Countdown,
    renderStep1Question,
    renderStep2Quiz,
    renderStep3Terms,
    renderStep4Game,
    renderStep5AI,
    renderStep6Final
  ];
  
  const renderer = stepRenderers[state.currentStep];
  if (renderer) {
    renderer(container);
  }
  
  updateProgress();
}

/**
 * Mettre à jour la barre de progression et l'indicateur
 */
function updateProgress() {
  const state = appState.get();
  const progressFill = $('#progress-fill');
  const stepIndicator = $('#step-indicator');
  
  if (progressFill) {
    const progress = ((state.currentStep) / (state.totalSteps - 1)) * 100;
    progressFill.style.width = `${progress}%`;
  }
  
  if (stepIndicator) {
    stepIndicator.textContent = `Étape ${state.currentStep} sur ${state.totalSteps - 1}`;
  }
  
  // Mettre à jour ARIA
  const header = $('.progress-header');
  if (header) {
    header.setAttribute('aria-valuenow', state.currentStep);
  }
}

/**
 * ÉTAPE 0 : Intro cinématique style "film"
 */
async function renderStep0Countdown(container) {
  const state = appState.get();
  
  if (state.countdownComplete) {
    // Afficher le bouton de révélation après l'intro
    container.innerHTML = `
      <div class="card card--animate-in">
        <span class="card__emoji cinematic-emoji visible">💌</span>
        <h1 class="card__title">Quelque chose d'important t'attend...</h1>
        <p class="card__subtitle">Tu es prêt.e ?</p>
        <div class="btn-group">
          <button class="btn btn--primary btn--large" data-action="reveal-question">
            Révéler la Question
          </button>
        </div>
      </div>
    `;
    return;
  }
  
  // Créer l'intro cinématique avec bouton skip
  container.innerHTML = `
    <div class="card cinematic-intro" id="cinematic-container">
      <div id="cinematic-content"></div>
      <button class="skip-btn" data-action="skip-intro" aria-label="Passer l'introduction">
        Passer <span class="skip-arrow">>></span>
      </button>
    </div>
  `;
  
  // Démarrer la séquence cinématique
  await runCinematicIntro();
}

/**
 * Séquence d'intro cinématique inspirée de site-st-valentin-3
 */
async function runCinematicIntro() {
  const contentEl = $('#cinematic-content');
  if (!contentEl) return;
  
  // Capturer l'ID de cette session d'animation
  const myAnimationId = currentAnimationId;
  
  // Fonction pour vérifier si cette animation est encore valide
  const isValid = () => myAnimationId === currentAnimationId;
  
  const reducedMotion = prefersReducedMotion();
  const delayMultiplier = reducedMotion ? 0.3 : 1;
  
  // Séquence narrative
  const narrativeSequence = [
    { type: 'text', content: `Salut ${CONFIG.recipientName}...`, delay: 2000 },
    { type: 'text', content: 'J\'ai quelque chose à vous dire...', delay: 2000 },
    { type: 'text', content: 'Quelque chose d\'<strong>important</strong>.', delay: 2500 },
    { type: 'emoji', content: '💭', delay: 1500 },
    { type: 'text', content: 'J\'aurais pu envoyer un simple message dans le groupe...', delay: 2000 },
    { type: 'text', content: 'Mais je voulais faire quelque chose de <strong>spécial</strong>.', delay: 2500 },
    { type: 'emoji', content: '✨', delay: 1500 },
    { type: 'text', content: 'Parce que vous êtes spéciaux.', delay: 2000 },
    { type: 'emoji', content: '🎉', delay: 1000 },
    { type: 'text', content: 'Alors...', delay: 1500 },
  ];
  
  // Afficher chaque élément de la séquence
  for (const item of narrativeSequence) {
    // Vérifier si cette animation est encore valide
    if (!isValid()) return;
    
    // Effacer le contenu précédent avec fade out
    const currentContent = contentEl.querySelector('.cinematic-text, .cinematic-emoji');
    if (currentContent) {
      currentContent.classList.add('fade-out');
      await sleep(400 * delayMultiplier);
    }
    
    // Vérifier encore
    if (!isValid()) return;
    
    // Effacer complètement
    contentEl.innerHTML = '';
    
    // Créer le nouvel élément
    if (item.type === 'text') {
      const textEl = createElement('div', {
        className: 'cinematic-text',
        innerHTML: item.content
      });
      contentEl.appendChild(textEl);
      
      // Déclencher l'animation
      await sleep(50);
      textEl.classList.add('visible');
    } else if (item.type === 'emoji') {
      const emojiEl = createElement('div', {
        className: 'cinematic-emoji'
      }, [item.content]);
      contentEl.appendChild(emojiEl);
      
      // Déclencher l'animation
      await sleep(50);
      emojiEl.classList.add('visible');
    }
    
    // Attendre avant le prochain élément
    await sleep(item.delay * delayMultiplier);
  }
  
  // Vérifier une dernière fois avant le countdown
  if (!isValid()) return;
  
  // Phase de compte à rebours
  await runCountdownPhase(contentEl, delayMultiplier, myAnimationId);
}

/**
 * Phase de compte à rebours avec logs système
 */
async function runCountdownPhase(contentEl, delayMultiplier, animationId) {
  // Fonction pour vérifier si cette animation est encore valide
  const isValid = () => animationId === currentAnimationId;
  
  if (!isValid()) return;
  
  const reducedMotion = prefersReducedMotion();
  
  // Transition vers le compte à rebours
  contentEl.innerHTML = `
    <div class="countdown-number" id="countdown-number">3</div>
    <div class="system-log" id="system-log" aria-live="polite"></div>
  `;
  
  const countdownEl = $('#countdown-number');
  const logEl = $('#system-log');
  
  if (!countdownEl || !logEl) {
    if (isValid()) {
      appState.set({ countdownComplete: true });
      renderCurrentStep();
    }
    return;
  }
  
  const logs = CONFIG.systemLogs;
  let logIndex = 0;
  
  // Ajouter les logs progressivement
  const addLog = () => {
    if (logIndex < logs.length && isValid()) {
      const line = createElement('div', { 
        className: 'system-log__line',
        style: `animation-delay: ${logIndex * 0.1}s`
      }, [`> ${logs[logIndex]}`]);
      logEl.appendChild(line);
      logIndex++;
    }
  };
  
  // Séquence du compte à rebours
  for (let i = 3; i >= 1; i--) {
    if (!isValid()) return;
    
    countdownEl.textContent = i;
    
    if (!reducedMotion) {
      countdownEl.style.animation = 'none';
      countdownEl.offsetHeight; // Déclencher le reflow
      countdownEl.style.animation = 'pulse 1s ease-in-out';
    }
    
    // Ajouter 2 logs par seconde
    addLog();
    await sleep(500 * delayMultiplier);
    
    if (!isValid()) return;
    
    addLog();
    await sleep(500 * delayMultiplier);
  }
  
  if (!isValid()) return;
  
  // Animation finale
  countdownEl.textContent = '🎊';
  await sleep(500 * delayMultiplier);
  
  if (!isValid()) return;
  
  appState.set({ countdownComplete: true });
  renderCurrentStep();
}

/**
 * ÉTAPE 1 : La Grande Question
 */
function renderStep1Question(container) {
  const state = appState.get();
  noButtonDodgeCount = state.noAttempts;
  
  const noLabel = CONFIG.noButtonLabels[
    Math.min(noButtonDodgeCount, CONFIG.noButtonLabels.length - 1)
  ];
  
  container.innerHTML = `
    <div class="card card--animate-in" id="question-card">
      <span class="card__emoji">🎉</span>
      <h1 class="card__title">Voulez-vous être mes Valentin.e.s ?</h1>
      <p class="card__subtitle">${CONFIG.recipientName}, j'ai une question très importante...</p>
      <div class="btn-group" id="button-container">
        <button class="btn btn--primary btn--large" data-action="yes-click">
          Oui ! 🤝
        </button>
        <button class="btn btn--secondary btn--no" id="no-button">
          ${noLabel}
        </button>
      </div>
      ${state.escapeHatchVisible ? `
        <div class="escape-hatch">
          <a data-action="not-now">Ok ok, tu peux dire "pas maintenant"</a>
        </div>
      ` : ''}
    </div>
  `;
  
  // Configurer le comportement d'esquive du bouton NON
  setupNoButtonDodge();
}

/**
 * Configurer le comportement d'esquive du bouton NON
 */
function setupNoButtonDodge() {
  const noButton = $('#no-button');
  const buttonContainer = $('#button-container');
  
  if (!noButton || !buttonContainer) return;
  
  const reducedMotion = prefersReducedMotion();
  let currentOffsetX = 0;
  let currentOffsetY = 0;
  
  // Si deja assez de tentatives, rendre cliquable
  if (noButtonDodgeCount >= 6) {
    noButton.classList.add('clickable');
  }
  
  // Fonction pour faire bouger le bouton vers une nouvelle position
  const moveButton = () => {
    if (reducedMotion) return;
    
    // Définir les positions possibles (gauche, droite, haut-gauche, haut-droite, etc.)
    const positions = [
      { x: -120, y: 0 },
      { x: 120, y: 0 },
      { x: -80, y: -30 },
      { x: 80, y: -30 },
      { x: -100, y: 20 },
      { x: 100, y: 20 },
      { x: 0, y: -40 },
      { x: -60, y: 30 },
      { x: 60, y: 30 },
    ];
    
    // Choisir une position différente de la position actuelle
    let newPos;
    do {
      newPos = positions[Math.floor(Math.random() * positions.length)];
    } while (newPos.x === currentOffsetX && newPos.y === currentOffsetY);
    
    currentOffsetX = newPos.x;
    currentOffsetY = newPos.y;
    
    // Calculer le scale (rétrécit progressivement)
    const scale = Math.max(0.7, 1 - (noButtonDodgeCount * 0.05));
    
    noButton.style.transform = `translate(${currentOffsetX}px, ${currentOffsetY}px) scale(${scale})`;
  };
  
  // Fonction appelée quand on essaie d'interagir avec le bouton
  const handleAttempt = () => {
    // Si le bouton est cliquable, ne rien faire
    if (noButton.classList.contains('clickable')) return false;
    
    // Cooldown pour éviter le spam
    if (dodgeCooldown) return false;
    dodgeCooldown = true;
    setTimeout(() => dodgeCooldown = false, 500);
    
    noButtonDodgeCount++;
    appState.set({ noAttempts: noButtonDodgeCount });
    
    // Afficher le message toast drôle
    const message = randomPick(CONFIG.noButtonMessages);
    toasts.show(message);
    
    // Mettre à jour le label du bouton
    const newLabel = CONFIG.noButtonLabels[
      Math.min(noButtonDodgeCount, CONFIG.noButtonLabels.length - 1)
    ];
    noButton.textContent = newLabel;
    
    // Faire bouger le bouton
    moveButton();
    
    // Après 6 tentatives, rendre cliquable
    if (noButtonDodgeCount >= 6) {
      noButton.classList.add('clickable');
      noButton.style.transform = 'translate(0, 0) scale(1)'; // Recentrer
      
      if (!appState.get().escapeHatchVisible) {
        appState.set({ escapeHatchVisible: true });
        const card = $('#question-card');
        if (card && !card.querySelector('.escape-hatch')) {
          const escapeDiv = document.createElement('div');
          escapeDiv.className = 'escape-hatch';
          escapeDiv.innerHTML = '<a data-action="not-now">Ok ok, tu peux dire "pas maintenant"</a>';
          card.appendChild(escapeDiv);
        }
      }
      toasts.show('Bon ok, tu peux cliquer maintenant... 😏');
    }
    
    return true; // Indique qu'une esquive a eu lieu
  };
  
  // Écouteur pour le survol (desktop)
  noButton.addEventListener('mouseenter', (e) => {
    if (!noButton.classList.contains('clickable')) {
      handleAttempt();
    }
  });
  
  // Écouteur pour le touch (mobile)
  noButton.addEventListener('touchstart', (e) => {
    if (!noButton.classList.contains('clickable')) {
      e.preventDefault();
      handleAttempt();
    }
  }, { passive: false });
  
  // Écouteur de clic
  noButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (noButton.classList.contains('clickable')) {
      // Le bouton est maintenant cliquable - aller au chemin "pas maintenant"
      appState.enterNotNowPath();
      renderCurrentStep();
    }
    // Si pas cliquable, le mouseenter a déjà géré l'esquive
  });
}

/**
 * ÉTAPE 2 : Quiz de Compatibilité
 */
function renderStep2Quiz(container) {
  const state = appState.get();
  const questions = CONFIG.quizQuestions;
  
  if (state.quizComplete) {
    // Afficher les résultats
    renderQuizResults(container);
    return;
  }
  
  const currentQ = questions[state.quizCurrentQuestion];
  const progress = ((state.quizCurrentQuestion) / questions.length) * 100;
  
  container.innerHTML = `
    <div class="card card--animate-in">
      <span class="card__emoji">🔬</span>
      <h1 class="card__title">Quiz de Compatibilité Très Scientifique</h1>
      <p class="card__subtitle">Question ${state.quizCurrentQuestion + 1} sur ${questions.length}</p>
      
      <div class="quiz-progress">
        <div class="quiz-progress__fill" style="width: ${progress}%"></div>
      </div>
      
      <h2 style="margin-bottom: var(--space-md);">${currentQ.question}</h2>
      
      <div class="quiz-options" role="radiogroup" aria-label="Options du quiz">
        ${currentQ.options.map((opt, i) => `
          <button class="quiz-option" data-action="quiz-answer" data-answer="${i}" role="radio" aria-checked="false">
            <span class="quiz-option__emoji">${opt.emoji}</span>
            <span class="quiz-option__text">${opt.text}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Gérer la réponse au quiz
 */
export function handleQuizAnswer(answerIndex) {
  const state = appState.get();
  const questions = CONFIG.quizQuestions;
  
  const newAnswers = [...state.quizAnswers, answerIndex];
  
  if (state.quizCurrentQuestion + 1 >= questions.length) {
    // Quiz terminé
    appState.set({
      quizAnswers: newAnswers,
      quizComplete: true
    });
  } else {
    // Question suivante
    appState.set({
      quizAnswers: newAnswers,
      quizCurrentQuestion: state.quizCurrentQuestion + 1
    });
  }
  
  renderCurrentStep();
}

/**
 * Afficher les résultats du quiz (truqués pour être géniaux)
 */
function renderQuizResults(container) {
  const results = CONFIG.quizResultCategories;
  
  container.innerHTML = `
    <div class="card card--animate-in">
      <span class="card__emoji">📊</span>
      <h1 class="card__title">Les résultats sont Là !</h1>
      <p class="card__subtitle">Score de Compatibilité : <strong style="color: var(--color-primary);">99,97%</strong></p>
      <p style="font-size: var(--font-size-sm); color: var(--color-text-muted);">(Source : vibes & science)</p>
      
      <div class="results-chart">
        ${results.map((r, i) => `
          <div class="results-bar" style="animation-delay: ${i * 0.1}s">
            <span class="results-bar__label">${r.label}</span>
            <div class="results-bar__track">
              <div class="results-bar__fill" style="width: 0%" data-value="${r.value}"></div>
            </div>
            <span class="results-bar__value">${r.value}%</span>
          </div>
        `).join('')}
      </div>
      
      <div class="btn-group">
        <button class="btn btn--primary" data-action="next-step">
          Passer aux Formalités Légales 📜
        </button>
      </div>
    </div>
  `;
  
  // Animer les barres
  setTimeout(() => {
    const bars = container.querySelectorAll('.results-bar__fill');
    bars.forEach(bar => {
      bar.style.width = `${bar.dataset.value}%`;
    });
  }, 100);
}

/**
 * ÉTAPE 3 : Termes et Conditions
 */
function renderStep3Terms(container) {
  const state = appState.get();
  const terms = CONFIG.termsAndConditions;
  
  container.innerHTML = `
    <div class="card card--animate-in" id="terms-card">
      <span class="card__emoji">📋</span>
      <h1 class="card__title">Contrat d'Amitié</h1>
      <p class="card__subtitle">Veuillez examiner attentivement les termes suivants</p>
      
      <div class="terms-box" id="terms-box" tabindex="0" role="document" aria-label="Termes et conditions">
        ${terms.map(section => `
          <h3>${section.title}</h3>
          ${section.clauses.map(clause => `<p>${clause}</p>`).join('')}
        `).join('')}
        <p style="text-align: center; margin-top: var(--space-lg);">
          <strong>✨ Fin du Contrat ✨</strong>
        </p>
      </div>
      
      <p class="terms-scroll-hint" id="scroll-hint">
        ${state.termsScrolled ? '✓ Tu as lu les termes !' : '↓ Fais défiler jusqu\'en bas pour continuer'}
      </p>
      
      <div class="btn-group">
        <button class="btn btn--primary" data-action="accept-terms" ${state.termsScrolled ? '' : 'disabled'}>
          J'accepte 🤝
        </button>
        <button class="btn btn--secondary" data-action="decline-terms">
          Refuser
        </button>
      </div>
    </div>
  `;
  
  // Configurer la détection du scroll
  setupTermsScroll();
}

/**
 * Configurer la détection du scroll des termes
 */
function setupTermsScroll() {
  const termsBox = $('#terms-box');
  if (!termsBox) return;
  
  const checkScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = termsBox;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;
    
    if (isAtBottom && !appState.get().termsScrolled) {
      appState.set({ termsScrolled: true });
      
      // Activer le bouton
      const acceptBtn = $('[data-action="accept-terms"]');
      if (acceptBtn) acceptBtn.disabled = false;
      
      // Mettre à jour l'indication
      const hint = $('#scroll-hint');
      if (hint) hint.textContent = '✓ Tu as lu les termes !';
    }
  };
  
  termsBox.addEventListener('scroll', checkScroll);
}

/**
 * Gérer le refus des termes
 */
export function handleDeclineTerms() {
  const state = appState.get();
  const termsBox = $('#terms-box');
  const termsCard = $('#terms-card');
  
  const attempts = state.termsDeclineAttempts + 1;
  appState.set({ termsDeclineAttempts: attempts });
  
  if (attempts >= 2) {
    // Autoriser la sortie après 2 tentatives
    appState.enterNotNowPath();
    renderCurrentStep();
    return;
  }
  
  // Première tentative : remonter en haut avec tremblement
  if (termsCard) {
    termsCard.classList.add('shake');
    setTimeout(() => termsCard.classList.remove('shake'), 500);
  }
  
  if (termsBox) {
    termsBox.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  toasts.show('Oups — le service juridique dit que tu dois relire l\'Article 2 😇');
}

/**
 * ÉTAPE 4 : Mini Jeu
 */
function renderStep4Game(container) {
  const state = appState.get();
  
  if (state.gameComplete) {
    renderGameComplete(container, state.gameScore >= 10);
    return;
  }
  
  container.innerHTML = `
    <div class="card card--animate-in">
      <span class="card__emoji">🎮</span>
      <h1 class="card__title">Petit Défi !</h1>
      <p class="game-instructions">
        Attrape <strong>10 étoiles</strong> en 20 secondes !<br>
        <small>Utilise les flèches, la souris ou ton doigt pour déplacer le panier.</small>
      </p>
      
      <div class="game-hud">
        <span class="game-score">⭐ 0/10</span>
        <span class="game-timer">⏱️ 20s</span>
      </div>
      
      <div class="game-container">
        <canvas class="game-canvas" id="game-canvas" aria-label="Jeu attrape les étoiles" role="img"></canvas>
      </div>
      
      <div class="btn-group">
        <button class="btn btn--primary" data-action="start-game">
          Lancer le Jeu
        </button>
        <button class="btn btn--ghost" data-action="skip-game">
          Passer le jeu
        </button>
      </div>
    </div>
  `;
}

/**
 * Démarrer le mini jeu
 */
export function startGame() {
  const canvas = $('#game-canvas');
  if (!canvas) return;
  
  // Cacher le bouton de démarrage
  const startBtn = $('[data-action="start-game"]');
  if (startBtn) startBtn.style.display = 'none';
  
  // Initialiser et démarrer le jeu
  heartGame.init(canvas, (won, score) => {
    appState.set({ 
      gameComplete: true,
      gameScore: score
    });
    renderCurrentStep();
  });
  
  heartGame.start();
}

/**
 * Afficher le jeu terminé
 */
function renderGameComplete(container, won) {
  container.innerHTML = `
    <div class="card card--animate-in">
      <span class="card__emoji">${won ? '🎉' : '😅'}</span>
      <h1 class="card__title">${won ? 'Incroyable !' : 'Bien essayé !'}</h1>
      <p class="card__subtitle">
        ${won 
          ? 'Tes talents d\'attrape-cœurs sont impressionnants !' 
          : 'Les cœurs étaient rapides aujourd\'hui, mais ton effort vaut 10/10 !'
        }
      </p>
      <div class="btn-group">
        <button class="btn btn--primary" data-action="next-step">
          Continuer
        </button>
        ${!won ? '<button class="btn btn--secondary" data-action="retry-game">Réessayer</button>' : ''}
      </div>
    </div>
  `;
}

/**
 * ÉTAPE 5 : Analyse IA
 */
async function renderStep5AI(container) {
  const state = appState.get();
  const results = CONFIG.aiAnalysisResults;
  const reducedMotion = prefersReducedMotion();
  
  container.innerHTML = `
    <div class="card card--animate-in">
      <span class="card__emoji">🤖</span>
      <h1 class="card__title">Moteur de Décision IA Amitié™</h1>
      <p class="card__subtitle">Analyse des données de compatibilité...</p>
      
      <div class="ai-container" id="ai-container">
        ${results.map((r, i) => `
          <div class="ai-line" data-index="${i}">
            <span class="ai-line__label">${r.label}</span>
            <span class="ai-line__value">${r.value}</span>
          </div>
        `).join('')}
        
        <div class="ai-conclusion" id="ai-conclusion">
          Recommandation : Dis OUI 🎉
        </div>
      </div>
      
      <div class="btn-group" id="ai-buttons" style="opacity: 0">
        <button class="btn btn--primary" data-action="next-step">
          Finaliser la Décision
        </button>
      </div>
    </div>
  `;
  
  // Animer les lignes de l'IA
  if (!state.aiComplete) {
    await animateAILines(reducedMotion);
    appState.set({ aiComplete: true });
  } else {
    // Afficher immédiatement si déjà complété
    const lines = container.querySelectorAll('.ai-line');
    lines.forEach(line => line.classList.add('visible'));
    $('#ai-conclusion')?.classList.add('visible');
    const buttons = $('#ai-buttons');
    if (buttons) buttons.style.opacity = '1';
  }
}

/**
 * Animer les lignes d'analyse IA
 */
async function animateAILines(reducedMotion) {
  // Capturer l'ID de cette session d'animation
  const myAnimationId = currentAnimationId;
  const isValid = () => myAnimationId === currentAnimationId;
  
  const lines = document.querySelectorAll('.ai-line');
  const conclusion = $('#ai-conclusion');
  const buttons = $('#ai-buttons');
  
  const delay = reducedMotion ? 100 : 400;
  
  for (const line of lines) {
    if (!isValid()) return;
    line.classList.add('visible');
    await sleep(delay);
  }
  
  if (!isValid()) return;
  await sleep(delay);
  
  if (conclusion && isValid()) conclusion.classList.add('visible');
  
  if (!isValid()) return;
  await sleep(delay);
  
  if (buttons && isValid()) buttons.style.opacity = '1';
}

/**
 * ÉTAPE 6 : Message Sincère Final
 */
function renderStep6Final(container) {
  const state = appState.get();
  
  if (state.finalChoice === 'yes') {
    renderCelebration(container);
    return;
  }
  
  if (state.finalChoice === 'different-day') {
    renderAlternativeDates(container);
    return;
  }
  
  // Message final initial avec enveloppe
  container.innerHTML = `
    <div class="card card--animate-in">
      <div class="envelope-container">
        <div class="envelope">
          <div class="envelope-flap"></div>
          <div class="envelope-letter">✨ Message spécial ✨</div>
          <div class="envelope-base"></div>
        </div>
      </div>
      
      <div style="white-space: pre-line; margin-bottom: var(--space-lg); line-height: 1.8;">
        ${CONFIG.sincereMessage}
      </div>
      
      <div class="btn-group" style="flex-direction: column;">
        <button class="btn btn--primary btn--large" data-action="final-yes">
          Oui, je suis de la partie ! 🎉
        </button>
        <button class="btn btn--secondary" data-action="final-different-day">
          Choisissons un autre jour
        </button>
      </div>
    </div>
  `;
}

/**
 * Afficher l'écran de célébration
 */
function renderCelebration(container) {
  const quotes = CONFIG.friendQuotes || [];
  
  container.innerHTML = `
    <div class="card card--animate-in celebration">
      <span class="card__emoji">🥳</span>
      <h1 class="card__title">C'est validé !</h1>
      
      <div class="ticket">
        <div class="ticket__header">Pass Soirée Saint-Valentin</div>
        <div class="ticket__title">✨ La Celery Rave Party ✨</div>
        <div class="ticket__details">
          <div class="ticket__detail">📅 ${CONFIG.dateSuggestion}</div>
          <div class="ticket__detail">📍 ${CONFIG.locationSuggestion}</div>
          <div class="ticket__detail">🎊 Dress code : Une rime en rave ?</div>
        </div>
      </div>
      
      <!-- Slider de citations -->
      ${quotes.length > 0 ? `
        <div class="quotes-container">
          <div class="quotes-slider" id="quotes-slider">
            ${quotes.map((q, i) => `
              <div class="quote-item ${i === 0 ? 'active' : ''}">
                <p class="quote-text">${q.text}</p>
                <p class="quote-author">— ${q.author}</p>
              </div>
            `).join('')}
          </div>
          <div class="quotes-dots">
            ${quotes.map((_, i) => `
              <span class="quote-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <!-- Jeu bonus : Remplir le coeur -->
      <h3 style="margin-top: var(--space-lg); color: var(--color-primary);">🎁 Bonus : Remplis le coeur !</h3>
      <p style="font-size: var(--font-size-sm); color: var(--color-text-muted); margin-bottom: var(--space-sm);">Passe ta souris/doigt pour illuminer</p>
      <div class="heart-game-container">
        <canvas class="heart-game-canvas" id="heart-fill-canvas"></canvas>
        <span class="heart-game-hint">✨ Déplace pour illuminer ✨</span>
      </div>
      
      <p class="card__subtitle">Ça va être une soirée de folie ! 🎉</p>
      
      <div class="btn-group">
        <button class="btn btn--primary" data-action="copy-response">
          Copier le Message de Réponse 📋
        </button>
      </div>
    </div>
    
    <!-- Avion avec bannière -->
    <div class="plane-animation" id="plane-animation">
      <div class="plane">
        <div class="plane-body">
          <div class="plane-wing"></div>
          <div class="plane-tail"></div>
        </div>
        <div class="banner-rope"></div>
        <div class="banner-text">Joyeuse Saint-Valentin ! 🎉</div>
      </div>
    </div>
    
    <!-- Fleurs simplifiées -->
    <div class="celebration-flowers" id="celebration-flowers">
      <div class="flower-stem"><div class="flower-head"></div></div>
      <div class="flower-stem"><div class="flower-head"></div></div>
      <div class="flower-stem"><div class="flower-head"></div></div>
      <div class="flower-stem"><div class="flower-head"></div></div>
      <div class="flower-stem"><div class="flower-head"></div></div>
      <div class="flower-stem"><div class="flower-head"></div></div>
    </div>
  `;
  
  // Lancer les confettis !
  setTimeout(() => confetti.burst(), 300);
  
  // Supprimer l'avion après l'animation
  setTimeout(() => {
    const planeEl = document.getElementById('plane-animation');
    if (planeEl) planeEl.remove();
  }, 9000);
  
  // Configurer le slider de citations
  setupQuotesSlider();
  
  // Initialiser le jeu bonus du coeur
  setTimeout(() => {
    const heartCanvas = document.getElementById('heart-fill-canvas');
    if (heartCanvas) {
      heartFillGame.init(heartCanvas);
      heartFillGame.start();
    }
  }, 500);
}

/**
 * Configurer le slider de citations
 */
function setupQuotesSlider() {
  const slider = document.getElementById('quotes-slider');
  const dots = document.querySelectorAll('.quote-dot');
  
  if (!slider || dots.length === 0) return;
  
  let currentIndex = 0;
  const totalQuotes = dots.length;
  
  // Auto-rotation
  const rotateInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % totalQuotes;
    updateSlider();
  }, 4000);
  
  // Click sur les points
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentIndex = index;
      updateSlider();
    });
  });
  
  function updateSlider() {
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }
}

/**
 * Gérer la copie de la réponse
 */
export async function handleCopyResponse() {
  const message = CONFIG.copyMessageTemplate(CONFIG);
  const success = await copyToClipboard(message);
  
  if (success) {
    toasts.show('Message copié ! Envoie-le dans le groupe ! 📱');
  } else {
    toasts.show('Impossible de copier. Le message est : ' + message);
  }
}

/**
 * Afficher les dates alternatives
 */
function renderAlternativeDates(container) {
  const alternatives = CONFIG.alternativeDates;
  
  container.innerHTML = `
    <div class="card card--animate-in celebration">
      <span class="card__emoji">📅</span>
      <h1 class="card__title">Pas de Problème !</h1>
      <p class="card__subtitle">Voici quelques alternatives :</p>
      
      <div class="quiz-options">
        ${alternatives.map((date, i) => `
          <button class="quiz-option" data-action="select-alt-date" data-date="${i}">
            <span class="quiz-option__emoji">📅</span>
            <span class="quiz-option__text">${date}</span>
          </button>
        `).join('')}
      </div>
      
      <p style="margin-top: var(--space-lg); color: var(--color-text-muted);">
        Chaque moment ensemble est précieux ! 🤝
      </p>
    </div>
  `;
  
  // Quand même célébrer !
  setTimeout(() => confetti.burst(), 300);
}

/**
 * Afficher le chemin "pas maintenant"
 */
function renderNotNowPath(container) {
  container.innerHTML = `
    <div class="card card--animate-in not-now">
      <div class="not-now__emoji">💛</div>
      <h1 class="card__title">Pas de souci !</h1>
      <p class="card__subtitle">
        Merci d'avoir joué le jeu avec mon petit site. 
        J'apprécie que tu l'aies regardé !
      </p>
      
      <div class="btn-group" style="flex-direction: column;">
        <button class="btn btn--primary" data-action="restart">
          Rejouer 🔄
        </button>
        <button class="btn btn--secondary" data-action="continue-exploring">
          Continuer à Explorer les Trucs Amusants
        </button>
      </div>
      
      <p style="margin-top: var(--space-lg); font-size: var(--font-size-sm); color: var(--color-text-muted);">
        Pas de pression, pas de culpabilité. Tu es génial(e) quoi qu'il arrive ! ✨
      </p>
    </div>
  `;
  
  // Mettre à jour la progression pour afficher l'état spécial
  const progressFill = $('#progress-fill');
  if (progressFill) progressFill.style.width = '100%';
  
  const stepIndicator = $('#step-indicator');
  if (stepIndicator) stepIndicator.textContent = 'Pas de souci ! 💛';
}
