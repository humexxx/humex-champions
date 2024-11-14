import { styled } from '@mui/material/styles';
import { useDrawingArea, useXScale, useYScale } from '@mui/x-charts';

const ratios = [0.2, 0.8, 0.6, 0.5];

const LoadingReact = styled('rect')({
  opacity: 0.2,
  fill: 'lightgray',
});

const LoadingText = styled('text')(({ theme }) => ({
  stroke: 'none',
  fill: theme.palette.text.primary,
  shapeRendering: 'crispEdges',
  textAnchor: 'middle',
  dominantBaseline: 'middle',
}));

export default function LoadingOverlay() {
  const xScale = useXScale();
  const yScale = useYScale();
  const { left, width, height } = useDrawingArea();

  const bandWidth = xScale.bandwidth();

  const [bottom, top] = yScale.range();

  return (
    <g>
      {xScale.domain().map((item: any, index: number) => {
        const ratio = ratios[index % ratios.length];
        const barHeight = ratio * (bottom - top);

        return (
          <LoadingReact
            key={index}
            x={xScale(item)}
            width={bandWidth}
            y={bottom - barHeight}
            height={height}
          />
        );
      })}
      <LoadingText x={left + width / 2} y={top + height / 2}>
        Loading data ...
      </LoadingText>
    </g>
  );
}
