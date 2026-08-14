// 像素画调色板

export type RGB = { r: number; g: number; b: number };

export type Palette = {
  id: string;
  name: string;
  colors: RGB[];
};

// Game Boy 经典 4 色绿调色板
export const GAME_BOY_PALETTE: Palette = {
  id: 'gameboy',
  name: 'Game Boy',
  colors: [
    { r: 15, g: 56, b: 15 },
    { r: 48, g: 98, b: 48 },
    { r: 139, g: 172, b: 15 },
    { r: 155, g: 188, b: 15 },
  ],
};

// PICO-8 16 色(8-bit 复古,NES 风格替代)
export const RETRO_PALETTE: Palette = {
  id: 'retro',
  name: '8-bit (PICO-8)',
  colors: [
    { r: 0, g: 0, b: 0 },
    { r: 29, g: 43, b: 83 },
    { r: 126, g: 37, b: 83 },
    { r: 0, g: 135, b: 81 },
    { r: 171, g: 82, b: 54 },
    { r: 95, g: 87, b: 79 },
    { r: 194, g: 195, b: 199 },
    { r: 255, g: 241, b: 232 },
    { r: 255, g: 0, b: 77 },
    { r: 255, g: 163, b: 0 },
    { r: 255, g: 236, b: 39 },
    { r: 0, g: 228, b: 54 },
    { r: 41, g: 173, b: 255 },
    { r: 131, g: 118, b: 156 },
    { r: 255, g: 119, b: 168 },
    { r: 255, g: 204, b: 170 },
  ],
};

// 不限制(保留原色,只降采样)
export const FULL_COLOR_PALETTE: Palette = {
  id: 'full',
  name: 'Full color',
  colors: [],
};

export const PALETTES: Palette[] = [
  FULL_COLOR_PALETTE,
  RETRO_PALETTE,
  GAME_BOY_PALETTE,
];

export function getPalette(id: string): Palette {
  const palette = PALETTES.find((p) => p.id === id);
  if (!palette) {
    // fail fast:静默回退会让"效果没了"的 bug 无日志可查。
    // 'minecraft' 由调用方特判(MINECRAFT_PALETTE),本函数只接受 PALETTES 内的 id。
    throw new Error(`Unknown palette id: ${id}`);
  }
  return palette;
}
