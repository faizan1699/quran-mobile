import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

let currentFontScale = 1;

export function setGlobalFontScale(scale: number): void {
  currentFontScale = scale;
}

interface TextStyle {
  fontSize?: number;
  lineHeight?: number;
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
    if (currentFontScale === 1) {
      return originalRender.apply(this, args);
    }

    const props = args[0] as { style?: unknown } | undefined;
    const flat = (StyleSheet.flatten(props?.style) || {}) as TextStyle;
    if (typeof flat.fontSize !== 'number') {
      return originalRender.apply(this, args);
    }

    const scaled: TextStyle = { fontSize: flat.fontSize * currentFontScale };
    if (typeof flat.lineHeight === 'number') {
      scaled.lineHeight = flat.lineHeight * currentFontScale;
    }

    const scaledProps = { ...props, style: [props?.style, scaled] };
    return originalRender.apply(this, [scaledProps, ...args.slice(1)]);
  };
}
