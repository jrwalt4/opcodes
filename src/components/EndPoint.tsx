import React, { ClassAttributes } from "react";
import { XYCoord, DragElementWrapper, DragSourceOptions } from "react-dnd";
import { useTheme } from "@material-ui/core/styles";

export interface EndPointProps {
  coord: XYCoord;
  dragRef: DragElementWrapper<DragSourceOptions>;
  isDragging: boolean;
}

export default function EndPoint({
  coord,
  isDragging,
  dragRef
}: EndPointProps & ClassAttributes<SVGCircleElement>) {
  const { palette } = useTheme();
  return (
    <circle
      ref={dragRef}
      cx={coord.x}
      cy={coord.y}
      r={5}
      style={{
        cursor: "pointer",
        fill: isDragging ? palette.secondary.dark : palette.primary.dark
      }}
    />
  );
}
