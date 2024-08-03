import {
  useDrawingArea,
  useXScale,
  useChartId,
  AnimatedLine,
} from '@mui/x-charts';
import { DashedGraphProps } from './DashedGraph.types';

export default function DashedGraph(props: DashedGraphProps) {
  const { limit, sxBefore, sxAfter, ...other } = props;
  const { top, bottom, height, left, width } = useDrawingArea();
  const scale = useXScale();
  const chartId = useChartId();

  if (limit === undefined) {
    return <AnimatedLine {...other} />;
  }

  const limitPosition = scale(limit);

  if (limitPosition === undefined) {
    return <AnimatedLine {...other} />;
  }

  const clipIdleft = `${chartId}-${props.ownerState.id}-line-limit-${limit}-1`;
  const clipIdRight = `${chartId}-${props.ownerState.id}-line-limit-${limit}-2`;
  return (
    <>
      <clipPath id={clipIdleft}>
        <rect
          x={left}
          y={0}
          width={limitPosition - left}
          height={top + height + bottom}
        />
      </clipPath>
      <clipPath id={clipIdRight}>
        <rect
          x={limitPosition}
          y={0}
          width={left + width - limitPosition}
          height={top + height + bottom}
        />
      </clipPath>
      <g clipPath={`url(#${clipIdleft})`}>
        <AnimatedLine {...other} sx={sxBefore} />
      </g>
      <g clipPath={`url(#${clipIdRight})`}>
        <AnimatedLine {...other} sx={sxAfter} />
      </g>
    </>
  );
}
