import React from "react";
import { XYCoord } from "react-dnd";

export interface PathProps {
  coords: XYCoord[];
  isDragging: boolean;
}

export default function Path({ coords, isDragging }: PathProps) {
  const path = `M ${coords.map(({ x, y }) => `${x} ${y}`).join(" L ")}`;
  return <path d={path} stroke={isDragging ? "red" : "black"} />;
}
