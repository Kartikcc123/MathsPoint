/**
 * Lightweight device fingerprinting utility.
 * Generates a consistent device ID using browser properties.
 * No external dependencies — uses Web Crypto API.
 */

const getCanvasFingerprint = () => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('MathsPoint-FP', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('MathsPoint-FP', 4, 17);
    return canvas.toDataURL();
  } catch {
    return 'canvas-not-supported';
  }
};

const getRawFingerprint = () => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.platform || 'unknown',
    getCanvasFingerprint(),
  ];
  return components.join('|||');
};

/**
 * Generate a SHA-256 hash of the device fingerprint.
 * @returns {Promise<string>} hex-encoded device ID
 */
export const generateDeviceId = async () => {
  // Check localStorage first for consistency
  const cached = localStorage.getItem('mp_device_id');
  if (cached) return cached;

  const raw = getRawFingerprint();
  const encoder = new TextEncoder();
  const data = encoder.encode(raw);

  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    localStorage.setItem('mp_device_id', hashHex);
    return hashHex;
  } catch {
    // Fallback for environments without Web Crypto
    const fallback = btoa(raw).substring(0, 64);
    localStorage.setItem('mp_device_id', fallback);
    return fallback;
  }
};

/**
 * Get a human-readable device info string.
 * @returns {string} e.g. "Chrome 120 / Windows 11"
 */
export const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} / ${os}`;
};
