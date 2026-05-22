export function buildSrcSet(url, widths = [480, 768, 1024, 1600, 2070]) {
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return '';

  const addWidth = (u, w) => {
    try {
      // replace existing w= param if present
      if (/([?&])w=\d+/.test(u)) {
        return u.replace(/([?&])w=\d+/, `$1w=${w}`);
      }

      // if url already has query params, append
      if (u.includes('?')) return `${u}&w=${w}`;
      return `${u}?w=${w}`;
    } catch (e) {
      return u;
    }
  };

  return widths.map((w) => `${addWidth(url, w)} ${w}w`).join(', ');
}

export default buildSrcSet;
