import React from 'react';
import styled from 'styled-components';

const StartupLoader = () => {
  return (
    <StyledWrapper>
      <svg id="svg-global" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 94 136" height={136} width={94}>
        <path stroke="#B30020" d="M87.3629 108.433L49.1073 85.3765C47.846 84.6163 45.8009 84.6163 44.5395 85.3765L6.28392 108.433C5.02255 109.194 5.02255 110.426 6.28392 111.187L44.5395 134.243C45.8009 135.004 47.846 135.004 49.1073 134.243L87.3629 111.187C88.6243 110.426 88.6243 109.194 87.3629 108.433Z" id="line-v1" />
        <path stroke="#D10026" d="M91.0928 95.699L49.2899 70.5042C47.9116 69.6734 45.6769 69.6734 44.2986 70.5042L2.49568 95.699C1.11735 96.5298 1.11735 97.8767 2.49568 98.7074L44.2986 123.902C45.6769 124.733 47.9116 124.733 49.2899 123.902L91.0928 98.7074C92.4712 97.8767 92.4712 96.5298 91.0928 95.699Z" id="line-v2" />
        <g id="node-server">
          <path fill="url(#paint0_linear_204_217)" d="M2.48637 72.0059L43.8699 96.9428C45.742 98.0709 48.281 97.8084 50.9284 96.2133L91.4607 71.7833C92.1444 71.2621 92.4197 70.9139 92.5421 70.1257V86.1368C92.5421 86.9686 92.0025 87.9681 91.3123 88.3825C84.502 92.4724 51.6503 112.204 50.0363 113.215C48.2352 114.343 45.3534 114.343 43.5523 113.215C41.9261 112.197 8.55699 91.8662 2.08967 87.926C1.39197 87.5011 1.00946 86.5986 1.00946 85.4058V70.1257C1.11219 70.9289 1.49685 71.3298 2.48637 72.0059Z" />
          <path stroke="url(#paint2_linear_204_217)" fill="url(#paint1_linear_204_217)" d="M91.0928 68.7324L49.2899 43.5375C47.9116 42.7068 45.6769 42.7068 44.2986 43.5375L2.49568 68.7324C1.11735 69.5631 1.11735 70.91 2.49568 71.7407L44.2986 96.9356C45.6769 97.7663 47.9116 97.7663 49.2899 96.9356L91.0928 71.7407C92.4712 70.91 92.4712 69.5631 91.0928 68.7324Z" />
          <mask height={41} width={67} y={50} x={13} maskUnits="userSpaceOnUse" style={{ maskType: 'luminance' }} id="mask0_204_217">
            <path fill="white" d="M78.3486 68.7324L49.0242 51.0584C47.6459 50.2276 45.4111 50.2276 44.0328 51.0584L14.7084 68.7324C13.3301 69.5631 13.3301 70.91 14.7084 71.7407L44.0328 89.4148C45.4111 90.2455 47.6459 90.2455 49.0242 89.4148L78.3486 71.7407C79.7269 70.91 79.727 69.5631 78.3486 68.7324Z" />
          </mask>
          <g mask="url(#mask0_204_217)">
            <path fill="#7A0C1A" d="M78.3486 68.7324L49.0242 51.0584C47.6459 50.2276 45.4111 50.2276 44.0328 51.0584L14.7084 68.7324C13.3301 69.5631 13.3301 70.91 14.7084 71.7407L44.0328 89.4148C45.4111 90.2455 47.6459 90.2455 49.0242 89.4148L78.3486 71.7407C79.7269 70.91 79.727 69.5631 78.3486 68.7324Z" />
          </g>
        </g>
        <g id="particles">
          <path fill="url(#paint3_linear_204_217)" d="M43.5482 32.558C44.5429 32.558 45.3493 31.7162 45.3493 30.6778C45.3493 29.6394 44.5429 28.7976 43.5482 28.7976C42.5535 28.7976 41.7471 29.6394 41.7471 30.6778C41.7471 31.7162 42.5535 32.558 43.5482 32.558Z" className="particle p1" />
          <path fill="url(#paint4_linear_204_217)" d="M50.0323 48.3519C51.027 48.3519 51.8334 47.5101 51.8334 46.4717C51.8334 45.4333 51.027 44.5915 50.0323 44.5915C49.0375 44.5915 48.2311 45.4333 48.2311 46.4717C48.2311 47.5101 49.0375 48.3519 50.0323 48.3519Z" className="particle p2" />
          <path fill="url(#paint5_linear_204_217)" d="M40.3062 62.6416C41.102 62.6416 41.7471 61.9681 41.7471 61.1374C41.7471 60.3067 41.102 59.6332 40.3062 59.6332C39.5104 59.6332 38.8653 60.3067 38.8653 61.1374C38.8653 61.9681 39.5104 62.6416 40.3062 62.6416Z" className="particle p3" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" y2="92.0933" x2="92.5421" y1="92.0933" x1="1.00946" id="paint0_linear_204_217">
            <stop stopColor="#A4001D" />
            <stop stopColor="#D10026" offset={1} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" y2="91.1638" x2="6.72169" y1={70} x1="92.5" id="paint1_linear_204_217">
            <stop stopColor="#B30020" />
            <stop stopColor="#7A0C1A" offset="0.29" />
            <stop stopColor="#E0002A" offset={1} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" y2="85.0762" x2="3.55544" y1={70} x1="92.5" id="paint2_linear_204_217">
            <stop stopColor="#E0002A" />
            <stop stopColor="#B30020" offset={1} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" y2="32.558" x2="43.5482" y1="28.7976" x1="43.5482" id="paint3_linear_204_217">
            <stop stopColor="#B30020" />
            <stop stopColor="#E0002A" offset={1} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" y2="48.3519" x2="50.0323" y1="44.5915" x1="50.0323" id="paint4_linear_204_217">
            <stop stopColor="#B30020" />
            <stop stopColor="#E0002A" offset={1} />
          </linearGradient>
          <linearGradient gradientUnits="userSpaceOnUse" y2="62.6416" x2="40.3062" y1="59.6332" x1="40.3062" id="paint5_linear_204_217">
            <stop stopColor="#B30020" />
            <stop stopColor="#E0002A" offset={1} />
          </linearGradient>
        </defs>
      </svg>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  display: grid;
  place-items: center;
  background: #000;

  #svg-global {
    zoom: 1.2;
    overflow: visible;
  }

  @keyframes fade-particles {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes floatUp {
    0% {
      transform: translateY(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    100% {
      transform: translateY(-40px);
      opacity: 0;
    }
  }

  #particles {
    animation: fade-particles 5s infinite alternate;
  }

  .particle {
    animation: floatUp linear infinite;
  }

  .p1 {
    animation-duration: 2.2s;
    animation-delay: 0s;
  }
  .p2 {
    animation-duration: 2.5s;
    animation-delay: 0.3s;
  }
  .p3 {
    animation-duration: 2s;
    animation-delay: 0.6s;
  }

  @keyframes bounce-lines {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-3px);
    }
  }

  #line-v1,
  #line-v2,
  #node-server,
  #particles {
    animation: bounce-lines 3s ease-in-out infinite alternate;
  }

  #line-v2 {
    animation-delay: 0.2s;
  }

  #node-server,
  #particles {
    animation-delay: 0.4s;
  }
`;

export default StartupLoader;
