/**
 * APP STATE MANAGEMENT
 * Single source of truth for application state
 */

// State keys for sessionStorage
const STORAGE_KEY = 'valentine_app_state';

// Initial state
const initialState = {
  currentStep: 0,
  totalSteps: 7, // 0-6 inclusive
  
  // Step 0: Countdown
  countdownComplete: false,
  
  // Step 1: Yes/No
  noAttempts: 0,
  escapeHatchVisible: false,
  
  // Step 2: Quiz
  quizCurrentQuestion: 0,
  quizAnswers: [],
  quizComplete: false,
  
  // Step 3: Terms
  termsScrolled: false,
  termsDeclineAttempts: 0,
  
  // Step 4: Game
  gameComplete: false,
  gameScore: 0,
  
  // Step 5: AI
  aiComplete: false,
  
  // Step 6: Final
  finalChoice: null, // 'yes' | 'different-day'
  
  // Special paths
  notNowPath: false,
  
  // UI state
  isTransitioning: false
};

// Create reactive state with change callbacks
class AppState {
  constructor() {
    this.state = { ...initialState };
    this.listeners = new Set();
    this.loadFromStorage();
  }
  
  /**
   * Get current state
   */
  get() {
    return { ...this.state };
  }
  
  /**
   * Update state and notify listeners
   */
  set(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Persist to storage
    this.saveToStorage();
    
    // Notify listeners
    this.listeners.forEach(listener => {
      listener(this.state, prevState);
    });
  }
  
  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  /**
   * Reset to initial state
   */
  reset() {
    // Effacer le storage d'abord
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignorer
    }
    
    // Réinitialiser à l'état initial
    this.state = { ...initialState };
    
    // Notifier les listeners
    this.listeners.forEach(listener => {
      listener(this.state, initialState);
    });
  }
  
  /**
   * Save state to sessionStorage
   */
  saveToStorage() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      // Storage might not be available
      console.warn('Could not save state to storage:', e);
    }
  }
  
  /**
   * Load state from sessionStorage
   */
  loadFromStorage() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with initial state to handle new properties
        this.state = { ...initialState, ...parsed };
      }
    } catch (e) {
      console.warn('Could not load state from storage:', e);
    }
  }
  
  /**
   * Go to next step
   */
  nextStep() {
    if (this.state.currentStep < this.state.totalSteps - 1) {
      this.set({ 
        currentStep: this.state.currentStep + 1,
        isTransitioning: false 
      });
    }
  }
  
  /**
   * Go to specific step
   */
  goToStep(step) {
    if (step >= 0 && step < this.state.totalSteps) {
      this.set({ 
        currentStep: step,
        isTransitioning: false 
      });
    }
  }
  
  /**
   * Enter "not now" path
   */
  enterNotNowPath() {
    this.set({ notNowPath: true });
  }
  
  /**
   * Exit "not now" path and optionally continue
   */
  exitNotNowPath(continueFlow = false) {
    this.set({ 
      notNowPath: false,
      // If continuing, go back to quiz step to explore
      currentStep: continueFlow ? 2 : 0
    });
  }
}

// Export singleton instance
export const appState = new AppState();

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
