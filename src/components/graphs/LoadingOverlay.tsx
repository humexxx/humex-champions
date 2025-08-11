import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';

const ratios = [0.2, 0.8, 0.6, 0.5, 0.7, 0.3, 0.9, 0.4];

const LoadingRect = styled('rect')({
  opacity: 0.2,
  fill: 'lightgray',
  animation: 'loadingPulse 2s ease-in-out infinite',
  '@keyframes loadingPulse': {
    '0%': {
      opacity: 0.1,
    },
    '50%': {
      opacity: 0.3,
    },
    '100%': {
      opacity: 0.1,
    },
  },
});

const LoadingText = styled('text')(({ theme }) => ({
  stroke: 'none',
  fill: theme.palette.text.secondary,
  textAnchor: 'middle',
  dominantBaseline: 'middle',
  fontSize: '14px',
  fontWeight: 500,
}));

function LoadingOverlay({ message }: { message: string }) {
  const { left, width, height, top } = useDrawingArea();
  const centerX = left + width / 2;
  const centerY = top + height / 2;

  // Create animated bars for loading state
  const numBars = 8;
  const barWidth = (width / numBars) * 0.6;
  const spacing = width / numBars;

  return (
    <g>
      {/* Animated background bars */}
      {Array.from({ length: numBars }, (_, index) => {
        const ratio = ratios[index % ratios.length];
        const barHeight = ratio * height * 0.6;
        const xPos = left + index * spacing + (spacing - barWidth) / 2;
        const yPos = top + height - barHeight - 20;

        return (
          <LoadingRect
            key={index}
            x={xPos}
            width={barWidth}
            y={yPos}
            height={barHeight}
            style={{
              animationDelay: `${index * 0.2}s`,
            }}
          />
        );
      })}

      {/* Loading text */}
      <LoadingText x={centerX} y={centerY}>
        {message}
      </LoadingText>
    </g>
  );
}

export default LoadingOverlay;
