import React from 'react';
import styled from 'styled-components';

export default function HomePatternBackground() {
  return (
    <StyledWrapper aria-hidden="true">
      <div className="circuit-wrapper">
        <div className="circuit-background" />
        <div className="red-glow red-glow-primary" />
        <div className="red-glow red-glow-secondary" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;

  .circuit-wrapper {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, rgba(255,255,255,0.94), rgba(255,248,249,0.98));
  }

  .circuit-background {
    position: absolute;
    inset: 0;
    opacity: 0.95;
    background-image:
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 19px,
        rgba(75, 85, 99, 0.08) 19px,
        rgba(75, 85, 99, 0.08) 20px,
        transparent 20px,
        transparent 39px,
        rgba(75, 85, 99, 0.08) 39px,
        rgba(75, 85, 99, 0.08) 40px
      ),
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 19px,
        rgba(75, 85, 99, 0.08) 19px,
        rgba(75, 85, 99, 0.08) 20px,
        transparent 20px,
        transparent 39px,
        rgba(75, 85, 99, 0.08) 39px,
        rgba(75, 85, 99, 0.08) 40px
      ),
      radial-gradient(circle at 20px 20px, rgba(55, 65, 81, 0.14) 2px, transparent 2px),
      radial-gradient(circle at 40px 40px, rgba(55, 65, 81, 0.14) 2px, transparent 2px);
    background-size: 40px 40px, 40px 40px, 40px 40px, 40px 40px;
  }

  .red-glow {
    position: absolute;
    border-radius: 999px;
    filter: blur(72px);
    opacity: 0.34;
    animation: driftGlow 10s ease-in-out infinite alternate;
    background: radial-gradient(circle, rgba(224, 0, 42, 0.34) 0%, rgba(255, 107, 53, 0.16) 34%, rgba(255, 255, 255, 0) 72%);
  }

  .red-glow-primary {
    width: 280px;
    height: 280px;
    top: -40px;
    right: -60px;
  }

  .red-glow-secondary {
    width: 220px;
    height: 220px;
    left: -40px;
    bottom: -30px;
    animation-duration: 13s;
  }

  @keyframes driftGlow {
    0% {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 0.22;
    }
    100% {
      transform: translate3d(12px, -10px, 0) scale(1.12);
      opacity: 0.42;
    }
  }
`;