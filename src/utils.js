/**
 * UTILITY FUNCTIONS
 * Helpers for DOM, animations, and common tasks
 */

/**
 * DOM helper - select single element
 */
export const $ = (selector, context = document) => context.querySelector(selector);

/**
 * DOM helper - select all elements
 */
export const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

/**
 * Create element with attributes and children
 */
export const createElement = (tag, attrs = {}, children = []) => {
  const el = document.createElement(tag);
  
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        el.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'innerHTML') {
      el.innerHTML = value;
    } else {
      el.setAttribute(key, value);
    }
  });
  
  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  
  return el;
};

/**
 * Debounce function
 */
export const debounce = (fn, delay = 100) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle function
 */
export const throttle = (fn, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Sleep helper
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Random number in range
 */
export const random = (min, max) => Math.random() * (max - min) + min;

/**
 * Random integer in range (inclusive)
 */
export const randomInt = (min, max) => Math.floor(random(min, max + 1));

/**
 * Pick random item from array
 */
export const randomPick = (arr) => arr[randomInt(0, arr.length - 1)];

/**
 * Clamp value between min and max
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Toast notification system
 */
class ToastSystem {
  constructor() {
    this.container = null;
    this.queue = [];
    this.isShowing = false;
  }
  
  init(container) {
    this.container = container;
  }
  
  async show(message, duration = 2500) {
    if (!this.container) return;
    
    const toast = createElement('div', { className: 'toast' }, [message]);
    this.container.appendChild(toast);
    
    // Auto remove after duration
    await sleep(duration);
    
    toast.classList.add('removing');
    await sleep(300);
    
    if (toast.parentNode) {
      toast.remove();
    }
  }
}

export const toasts = new ToastSystem();

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch (e2) {
      return false;
    } finally {
      textarea.remove();
    }
  }
};

/**
 * Prevent double clicks
 */
export const preventDoubleClick = (handler, delay = 500) => {
  let lastClick = 0;
  return (e) => {
    const now = Date.now();
    if (now - lastClick < delay) return;
    lastClick = now;
    handler(e);
  };
};

/**
 * Check if element is in viewport
 */
export const isInViewport = (el) => {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * RequestAnimationFrame helper with cancellation
 */
export const createAnimationLoop = (callback) => {
  let rafId = null;
  let running = false;
  
  const loop = (timestamp) => {
    if (!running) return;
    callback(timestamp);
    rafId = requestAnimationFrame(loop);
  };
  
  return {
    start() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    },
    stop() {
      running = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    isRunning() {
      return running;
    }
  };
};

/**
 * Escape HTML to prevent XSS
 */
export const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};
