import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

export interface ScriptFontScales {
  arabic: number;
  urdu: number;
  english: number;
}

let scriptScales: ScriptFontScales = { arabic: 1, urdu: 1, english: 1 };
let hasAnyScale = false;

let arabicFamilies = new Set<string>();
let urduFamilies = new Set<string>();

let fontFamilyMap: Record<string, string> = {};
let hasFamilyRemap = false;

/**
 * Set the per-script text-size multipliers. Arabic and Urdu text are scaled by
 * their own multiplier (identified via {@link setScriptFamilies}); everything
 * else (English/Latin UI, icons) uses the `english` multiplier.
 */
export function setScriptFontScales(scales: ScriptFontScales): void {
  scriptScales = scales;
  hasAnyScale =
    scales.arabic !== 1 || scales.urdu !== 1 || scales.english !== 1;
}

/**
 * Register the base font families that mark text as Arabic or Urdu, so the
 * render patch can pick the matching per-script size multiplier.
 */
export function setScriptFamilies(arabic: string[], urdu: string[]): void {
  arabicFamilies = new Set(arabic);
  urduFamilies = new Set(urdu);
}

/**
 * Remap the base Arabic/Urdu font families to the user-selected faces at
 * render time, so every existing `fontFamily: typography.fontFamily.arabic`
 * style switches live without touching each screen. Identity entries (a base
 * family mapped to itself) are ignored so the fast path stays free.
 */
export function setGlobalFontFamilyMap(map: Record<string, string>): void {
  const next: Record<string, string> = {};
  for (const [from, to] of Object.entries(map)) {
    if (from !== to) {
      next[from] = to;
    }
  }
  fontFamilyMap = next;
  hasFamilyRemap = Object.keys(next).length > 0;
}

function scaleForFamily(family?: string): number {
  if (family) {
    if (arabicFamilies.has(family)) return scriptScales.arabic;
    if (urduFamilies.has(family)) return scriptScales.urdu;
  }
  return scriptScales.english;
}

interface TextStyle {
  fontSize?: number;
  lineHeight?: number;
  fontFamily?: string;
}

export function applyGlobalFontScalePatch(): void {
  const TextAny = RNText as unknown as {
    render?: (...args: unknown[]) => React.ReactElement;
    __fontScalePatched?: boolean;
  };

  const originalRender = TextAny.render;
  if (typeof originalRender !== 'function' || TextAny.__fontScalePatched) {
    return;
  }
  TextAny.__fontScalePatched = true;

  TextAny.render = function patchedRender(...args: unknown[]): React.ReactElement {
    if (!hasAnyScale && !hasFamilyRemap) {
      return originalRender.apply(this, args);
    }

    const props = args[0] as { style?: unknown } | undefined;
    const flat = (StyleSheet.flatten(props?.style) || {}) as TextStyle;

    const override: TextStyle = {};

    const scale = scaleForFamily(flat.fontFamily);
    if (scale !== 1 && typeof flat.fontSize === 'number') {
      override.fontSize = flat.fontSize * scale;
      if (typeof flat.lineHeight === 'number') {
        override.lineHeight = flat.lineHeight * scale;
      }
    }

    if (typeof flat.fontFamily === 'string' && fontFamilyMap[flat.fontFamily]) {
      override.fontFamily = fontFamilyMap[flat.fontFamily];
    }

    if (
      override.fontSize === undefined &&
      override.fontFamily === undefined
    ) {
      return originalRender.apply(this, args);
    }

    const scaledProps = { ...props, style: [props?.style, override] };
    return originalRender.apply(this, [scaledProps, ...args.slice(1)]);
  };
}
