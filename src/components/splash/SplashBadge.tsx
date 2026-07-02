import React from 'react';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  G,
} from 'react-native-svg';
import { colors } from '@/tokens';

type SplashBadgeProps = {
  size?: number;
};

export default function SplashBadge({ size = 138 }: SplashBadgeProps): React.JSX.Element {
  const [goldLight, goldMid, goldDeep] = colors.splash.gold;
  const [gemLight, gemDark] = colors.splash.gem;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="badgeFrame" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={goldLight} />
          <Stop offset="0.5" stopColor={goldMid} />
          <Stop offset="1" stopColor={goldDeep} />
        </LinearGradient>
        <LinearGradient id="badgeDiamond" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.splash.goldSheen} />
          <Stop offset="0.55" stopColor={goldMid} />
          <Stop offset="1" stopColor={goldDeep} />
        </LinearGradient>
        <RadialGradient id="badgeGem" cx="50%" cy="42%" r="65%">
          <Stop offset="0" stopColor={gemLight} />
          <Stop offset="1" stopColor={gemDark} />
        </RadialGradient>
      </Defs>

      <Rect x="3" y="3" width="94" height="94" rx="27" fill="url(#badgeFrame)" />
      <Rect
        x="5.5"
        y="5.5"
        width="89"
        height="89"
        rx="24.5"
        fill="none"
        stroke={colors.splash.goldSheen}
        strokeWidth="1"
        strokeOpacity="0.55"
      />
      <Rect x="12" y="12" width="76" height="76" rx="19" fill="url(#badgeGem)" />
      <Rect
        x="12"
        y="12"
        width="76"
        height="76"
        rx="19"
        fill="none"
        stroke={colors.splash.goldLine}
        strokeWidth="1"
        strokeOpacity="0.6"
      />

      <G transform="rotate(45 50 50)">
        <Rect
          x="29"
          y="29"
          width="42"
          height="42"
          rx="9"
          fill={colors.splash.goldSheen}
          fillOpacity="0.08"
          stroke="url(#badgeDiamond)"
          strokeWidth="3"
        />
      </G>

      <Circle cx="50" cy="50" r="11.5" fill={gemDark} stroke={colors.splash.gemEdge} strokeWidth="2.4" />
      <Circle cx="50" cy="50" r="3.4" fill="url(#badgeFrame)" />

      <G fill={colors.splash.goldSheen}>
        <Circle cx="50" cy="17.5" r="1.9" />
        <Circle cx="50" cy="82.5" r="1.9" />
        <Circle cx="17.5" cy="50" r="1.9" />
        <Circle cx="82.5" cy="50" r="1.9" />
      </G>
    </Svg>
  );
}
