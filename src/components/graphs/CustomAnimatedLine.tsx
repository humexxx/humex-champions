import { Theme } from '@emotion/react';
import { SxProps } from '@mui/material';
import {
  useDrawingArea,
  useXScale,
  useChartId,
  AnimatedLine,
  AnimatedLineProps,
} from '@mui/x-charts';

interface Props extends AnimatedLineProps {
  limit?: number | Date;
}

export default function CustomAnimatedLine(props: Props) {
  const { limit, ...other } = props;
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

  const clipIdleft = `${chartId}-${props.ownerState.id}-line-limit-1`;
  const clipIdRight = `${chartId}-${props.ownerState.id}-line-limit-2`;

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
      <g clipPath={`url(#${clipIdleft})`} className="line-before">
        <AnimatedLine {...other} />
      </g>
      <g clipPath={`url(#${clipIdRight})`} className="line-after">
        <AnimatedLine {...other} />
      </g>
    </>
  );
}
