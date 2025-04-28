// components/LottieAnimation.tsx

import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";

interface LottieAnimationProps {
  src: any;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  src,
  loop = true,
  autoplay = true,
  style,
  className,
}) => {
  return (
    <Player
      src={src}
      loop={loop}
      autoplay={autoplay}
      style={style}
      className={className}
    />
  );
};

export default LottieAnimation;
