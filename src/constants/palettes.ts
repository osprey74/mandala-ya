export interface Palette {
  bg: string;
  border: string;
  accent: string;
  center: string;
}

export const PALETTES: Palette[] = [
  { bg: "#FFF3E0", border: "#EF6C00", accent: "#E65100", center: "#EF6C00" },
  { bg: "#E8F5E9", border: "#2E7D32", accent: "#1B5E20", center: "#2E7D32" },
  { bg: "#E3F2FD", border: "#1565C0", accent: "#0D47A1", center: "#1565C0" },
  { bg: "#FCE4EC", border: "#C2185B", accent: "#880E4F", center: "#C2185B" },
  { bg: "#EDE7F6", border: "#512DA8", accent: "#311B92", center: "#512DA8" },
  { bg: "#E0F2F1", border: "#00796B", accent: "#004D40", center: "#00796B" },
  { bg: "#FFF8E1", border: "#F9A825", accent: "#F57F17", center: "#F9A825" },
  { bg: "#F3E5F5", border: "#7B1FA2", accent: "#4A148C", center: "#7B1FA2" },
  { bg: "#EFEBE9", border: "#5D4037", accent: "#3E2723", center: "#5D4037" },
];

export const KEY_TO_POSITION: Record<string, number> = {
  Numpad7: 0, Numpad8: 1, Numpad9: 2,
  Numpad4: 3, Numpad5: 4, Numpad6: 5,
  Numpad1: 6, Numpad2: 7, Numpad3: 8,
  Digit7: 0,  Digit8: 1,  Digit9: 2,
  Digit4: 3,  Digit5: 4,  Digit6: 5,
  Digit1: 6,  Digit2: 7,  Digit3: 8,
};

export const CENTER = 4;
export const SURROUNDING = [0, 1, 2, 3, 5, 6, 7, 8];
