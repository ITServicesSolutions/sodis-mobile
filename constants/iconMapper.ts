export const iconMap: Record<string, string> = {
  "uil-shopping-bag": "shopping-bag",
  "uil-watch-alt": "clock",       // Pas d'équivalent "watch", on met "clock"
  "uil-mobile-android": "mobile", // Icône mobile
  "uil-monitor": "desktop",       // Icône écran
  "uil-estate": "home",           // Maison
  "uil-lamp": "lightbulb",        // Lampe
  "uil-gift": "gift",             // Cadeau
  "uil-wrench": "wrench",         // Outils
  "uil-plane-departure": "plane", // Avion
  "uil-palette": "palette",       // Palette
};


export const normalizeIcon = (iconValue: string) => {
  if (!iconValue) return '';
  const parts = iconValue.split(' ');
  return parts.find((p) => p.startsWith('uil-')) || '';
};
