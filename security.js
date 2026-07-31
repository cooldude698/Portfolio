// ==========================================================================
// AMAN JAIN PORTFOLIO - ENTERPRISE SECURITY ENGINE
// ==========================================================================

(function() {
  const LOCKOUT_KEY = 'aman_admin_lockout_until_v1';
  const ATTEMPTS_KEY = 'aman_admin_failed_attempts_v1';
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 Minutes Lockout

  // SHA-256 Cryptographic Hashing Function
  window.hashSHA256 = async function(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Default Password SHA-256 Hashes
  // "aman@123" -> d866a2e4e1a0df91b5c4df12a7a58a74e50eb1fef7c6e612803b9b4a45053706
  window.DEFAULT_PASS_HASH = "d866a2e4e1a0df91b5c4df12a7a58a74e50eb1fef7c6e612803b9b4a45053706";

  // Strict Input Sanitization (Strips # < > $ { } ; -- \ script tags)
  window.sanitizeInput = function(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/[#<>${};\\]/g, '')     // Strip forbidden symbols including #
      .replace(/--/g, '')             // Strip SQL comment operators
      .replace(/javascript:/gi, '')   // Strip JS URI schemes
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
      .trim();
  };

  // Lockout Management System (Cross-Tab & Cross-Refresh via localStorage)
  window.getLockoutStatus = function() {
    const lockoutUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || '0', 10);
    const now = Date.now();

    if (now < lockoutUntil) {
      const remainingSec = Math.ceil((lockoutUntil - now) / 1000);
      return { isLocked: true, remainingSeconds: remainingSec, attemptsLeft: 0 };
    } else {
      // If lockout expired, clear lockout key
      if (lockoutUntil > 0) {
        localStorage.removeItem(LOCKOUT_KEY);
        localStorage.setItem(ATTEMPTS_KEY, '0');
      }
      const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10);
      const attemptsLeft = Math.max(0, MAX_ATTEMPTS - attempts);
      return { isLocked: false, remainingSeconds: 0, attemptsLeft: attemptsLeft, currentAttempts: attempts };
    }
  };

  window.recordFailedAttempt = function() {
    let attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1;
    localStorage.setItem(ATTEMPTS_KEY, attempts.toString());

    if (attempts >= MAX_ATTEMPTS) {
      const lockoutTime = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(LOCKOUT_KEY, lockoutTime.toString());
      console.warn(`🚨 Security Alert: 5 failed login attempts detected. Locking out access for 15 minutes across all browser tabs.`);
      return { isLocked: true, attemptsLeft: 0, lockoutTime: lockoutTime };
    }

    return { isLocked: false, attemptsLeft: MAX_ATTEMPTS - attempts };
  };

  window.resetFailedAttempts = function() {
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
  };

  // Auto Sanitize Form Inputs Realtime
  document.addEventListener('input', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
      if (e.target.type !== 'password') {
        const cleaned = window.sanitizeInput(e.target.value);
        if (cleaned !== e.target.value) {
          e.target.value = cleaned;
        }
      } else {
        // For password, disallow forbidden symbols like # < > if typed
        e.target.value = e.target.value.replace(/[#<>${};\\]/g, '');
      }
    }
  });

  console.log("🛡️ Enterprise Security Engine initialized (SHA-256 Encryption & Brute-Force Lockout active)");
})();
