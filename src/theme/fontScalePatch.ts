import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

/**
 * App-wide text scaling.
 *
 * The app has no single typography provider — screens build StyleSheets from
 * the static `typography` tokens. To let the user scale ALL text from one
 * setting without rewriting every screen, we patch `Text.render` once so each
 * rendered `<Text>` multiplies its resolved `fontSize` / `lineHeight` by the
 * current scale.
 *
 * The scale lives in a module variable (read fresh on every Text render) and is
 * kept in sync by `AppContent` subscribing to the preferences store, so the
 * active screen re-renders and reflects the new size immediately.
 */
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
    const element = originalRender.apply(this, args);
    if (currentFontScale === 1 || !React.isValidElement(element)) {
      return element;
    }

    const props = element.props as { style?: unknown };
    const flat = (StyleSheet.flatten(props.style) || {}) as TextStyle;
    if (typeof flat.fontSize !== 'number') {
      return element;
    }

    const scaled: TextStyle = { fontSize: flat.fontSize * currentFontScale };
    if (typeof flat.lineHeight === 'number') {
      scaled.lineHeight = flat.lineHeight * currentFontScale;
    }

    return React.cloneElement(element, {
      style: [props.style, scaled],
    } as Partial<typeof props>);
  };
}
