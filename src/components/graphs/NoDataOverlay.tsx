import { styled } from '@mui/material/styles';
import { useDrawingArea } from '@mui/x-charts/hooks';

const ratios = [0.2, 0.8, 0.6, 0.5, 0.7, 0.3, 0.9, 0.4];

const NoDataText = styled('text')(({ theme }) => ({
  stroke: 'none',
  fill: theme.palette.text.secondary,
  textAnchor: 'middle',
  dominantBaseline: 'middle',
  fontSize: '14px',
  fontWeight: 500,
}));

const NoDataSubtext = styled('text')(({ theme }) => ({
  stroke: 'none',
  fill: theme.palette.text.disabled,
  textAnchor: 'middle',
  dominantBaseline: 'middle',
  fontSize: '12px',
}));

const NoDataIcon = styled('path')(({ theme }) => ({
  stroke: theme.palette.text.disabled,
  fill: 'none',
  opacity: 0.5,
}));

const StaticRect = styled('rect')({
  opacity: 0.15,
  fill: 'lightgray',
});

function NoDataOverlay({
  message,
  description,
}: {
  message: string;
  description?: string;
}) {
  const { left, width, height, top } = useDrawingArea();
  const centerX = left + width / 2;
  const centerY = top + height / 2;

  // Create static bars for no data state
  const numBars = 8;
  const barWidth = (width / numBars) * 0.6;
  const spacing = width / numBars;

  return (
    <g>
      {/* Static background bars */}
      {Array.from({ length: numBars }, (_, index) => {
        const ratio = ratios[index % ratios.length];
        const barHeight = ratio * height * 0.6;
        const xPos = left + index * spacing + (spacing - barWidth) / 2;
        const yPos = top + height - barHeight - 20;

        return (
          <StaticRect
            key={index}
            x={xPos}
            width={barWidth}
            y={yPos}
            height={barHeight}
          />
        );
      })}

      {/* Simple chart icon using SVG path */}
      <g transform={`translate(${centerX - 12}, ${centerY - 35})`}>
        <NoDataIcon
          d="M2 12L6 8L10 12L18 4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="6" cy="8" r="1" fill="currentColor" opacity="0.5" />
        <circle cx="10" cy="12" r="1" fill="currentColor" opacity="0.5" />
        <circle cx="18" cy="4" r="1" fill="currentColor" opacity="0.5" />
      </g>

      <NoDataText x={centerX} y={centerY}>
        {message}
      </NoDataText>

      <NoDataSubtext x={centerX} y={centerY + 20}>
        {description}
      </NoDataSubtext>
    </g>
  );
}

export default NoDataOverlay;
