const generateSvgThumbnail = (title, options = {}) => {
  const { feeAmount = null } = options;

  const themes = [
    { bg1: '#4F46E5', bg2: '#7C3AED', accent: '#A78BFA', text: '#FFFFFF', badge: '#EEF2FF' },  // Indigo-Purple
    { bg1: '#0F766E', bg2: '#065F46', accent: '#34D399', text: '#FFFFFF', badge: '#ECFDF5' },  // Teal-Emerald
    { bg1: '#1D4ED8', bg2: '#1E40AF', accent: '#60A5FA', text: '#FFFFFF', badge: '#DBEAFE' },  // Blue
    { bg1: '#DC2626', bg2: '#991B1B', accent: '#FCA5A5', text: '#FFFFFF', badge: '#FEF2F2' },  // Red
    { bg1: '#D97706', bg2: '#B45309', accent: '#FCD34D', text: '#FFFFFF', badge: '#FFFBEB' },  // Amber
    { bg1: '#7C3AED', bg2: '#5B21B6', accent: '#C4B5FD', text: '#FFFFFF', badge: '#F5F3FF' },  // Violet
    { bg1: '#0284C7', bg2: '#0369A1', accent: '#38BDF8', text: '#FFFFFF', badge: '#E0F2FE' },  // Sky
    { bg1: '#059669', bg2: '#047857', accent: '#6EE7B7', text: '#FFFFFF', badge: '#D1FAE5' },  // Green
  ];

  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  const theme = themes[Math.abs(hash) % themes.length];

  // Word wrapping
  const words = title.toUpperCase().split(' ');
  let lines = [];
  if (words.length <= 2) {
    lines = [words.join(' ')];
  } else if (words.length <= 4) {
    const mid = Math.ceil(words.length / 2);
    lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  } else {
    const third = Math.ceil(words.length / 3);
    lines = [
      words.slice(0, third).join(' '),
      words.slice(third, third * 2).join(' '),
      words.slice(third * 2).join(' ')
    ];
  }

  const escapeXml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // Calculate text Y positions (centered)
  const lineHeight = 48;
  const totalTextHeight = lines.length * lineHeight;
  const startY = (360 - totalTextHeight) / 2 + 36;

  const textLines = lines.map((line, i) => {
    const y = startY + (i * lineHeight);
    return '<text x="40" y="' + y + '" font-family="\'Segoe UI\', system-ui, sans-serif" font-size="38" font-weight="800" fill="' + theme.text + '" letter-spacing="1">' + escapeXml(line) + '</text>';
  }).join('\n      ');

  const isFree = feeAmount === 0;

  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360">'
    + '<defs>'
    + '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" style="stop-color:' + theme.bg1 + ';stop-opacity:1" />'
    + '<stop offset="100%" style="stop-color:' + theme.bg2 + ';stop-opacity:1" />'
    + '</linearGradient>'
    + '<linearGradient id="shine" x1="0%" y1="0%" x2="100%" y2="100%">'
    + '<stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.15" />'
    + '<stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />'
    + '</linearGradient>'
    + '</defs>'

    // Background
    + '<rect width="600" height="360" rx="20" ry="20" fill="url(#bg)" />'

    // Decorative geometric patterns
    + '<circle cx="-20" cy="380" r="200" fill="' + theme.accent + '" opacity="0.12" />'
    + '<circle cx="620" cy="-30" r="180" fill="' + theme.accent + '" opacity="0.10" />'
    + '<circle cx="500" cy="300" r="120" fill="' + theme.accent + '" opacity="0.08" />'

    // Grid pattern dots
    + '<g opacity="0.08" fill="' + theme.text + '">'
    + '<circle cx="480" cy="40" r="3" /><circle cx="510" cy="40" r="3" /><circle cx="540" cy="40" r="3" /><circle cx="570" cy="40" r="3" />'
    + '<circle cx="480" cy="65" r="3" /><circle cx="510" cy="65" r="3" /><circle cx="540" cy="65" r="3" /><circle cx="570" cy="65" r="3" />'
    + '<circle cx="480" cy="90" r="3" /><circle cx="510" cy="90" r="3" /><circle cx="540" cy="90" r="3" /><circle cx="570" cy="90" r="3" />'
    + '<circle cx="480" cy="115" r="3" /><circle cx="510" cy="115" r="3" /><circle cx="540" cy="115" r="3" /><circle cx="570" cy="115" r="3" />'
    + '</g>'

    // Decorative lines
    + '<line x1="40" y1="310" x2="200" y2="310" stroke="' + theme.accent + '" stroke-width="3" opacity="0.4" stroke-linecap="round" />'
    + '<line x1="40" y1="322" x2="120" y2="322" stroke="' + theme.accent + '" stroke-width="2" opacity="0.25" stroke-linecap="round" />'

    // Math/Academic symbols as decoration
    + '<g opacity="0.07" fill="' + theme.text + '" font-family="serif" font-size="60">'
    + '<text x="420" y="340">∑</text>'
    + '<text x="500" y="200">π</text>'
    + '<text x="540" y="330">∞</text>'
    + '</g>'

    // Shine overlay
    + '<rect width="600" height="360" rx="20" ry="20" fill="url(#shine)" />'

    // Main title text
    + '<g>'
    + textLines
    + '</g>'

    // Badge
    + (isFree
      ? '<g transform="translate(40, 20)">'
        + '<rect width="110" height="28" rx="14" fill="' + theme.badge + '" />'
        + '<text x="55" y="19" font-family="\'Segoe UI\', system-ui, sans-serif" font-size="12" font-weight="700" fill="' + theme.bg1 + '" text-anchor="middle" letter-spacing="1">FREE BATCH</text>'
        + '</g>'
      : '')

    // Bottom-right brand mark
    + '<g transform="translate(500, 320)">'
    + '<rect width="70" height="24" rx="12" fill="' + theme.text + '" opacity="0.15" />'
    + '<text x="35" y="16" font-family="\'Segoe UI\', system-ui, sans-serif" font-size="10" font-weight="700" fill="' + theme.text + '" text-anchor="middle" opacity="0.7">MATHS PT</text>'
    + '</g>'

    + '</svg>';

  const base64 = Buffer.from(svg).toString('base64');
  return 'data:image/svg+xml;base64,' + base64;
};

module.exports = { generateSvgThumbnail };
