import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

let currentFontScale = 1;
let fontFamilyMap: Record<string, string> = {};
let hasFamilyRemap = false;

export function setGlobalFontScale(scale: number): void {
  currentFontScale = scale;
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
    if (currentFontScale === 1 && !hasFamilyRemap) {
      return originalRender.apply(this, args);
    }

    const props = args[0] as { style?: unknown } | undefined;
    const flat = (StyleSheet.flatten(props?.style) || {}) as TextStyle;

    const override: TextStyle = {};

    if (currentFontScale !== 1 && typeof flat.fontSize === 'number') {
      override.fontSize = flat.fontSize * currentFontScale;
      if (typeof flat.lineHeight === 'number') {
        override.lineHeight = flat.lineHeight * currentFontScale;
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
