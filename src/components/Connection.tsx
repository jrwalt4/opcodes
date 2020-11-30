import React from "react";
import { DragSourceMonitor, useDrag, XYCoord } from "react-dnd";

import EndPoint from "components/EndPoint";
import Path from "components/Path";
import { ItemTypes } from "./ItemTypes";

export interface ConnectionProps {
  start?: XYCoord;
  end?: XYCoord;
}

const dragProps = (init: XYCoord) => ({
  item: {
    type: ItemTypes.CIRCLE
  },
  collect: (monitor: DragSourceMonitor) => {
    const isDragging = monitor.isDragging();
    const { x: dx, y: dy } = monitor.getDifferenceFromInitialOffset() || {
      x: 0,
      y: 0
    };
    return {
      isDragging,
      coord: {
        x: init.x + (isDragging ? dx : 0),
        y: init.y + (isDragging ? dy : 0)
      }
    };
  }
});

export default function Connection(props: ConnectionProps) {
  const [startProps, startRef] = useDrag(dragProps({ x: 25, y: 25 }));
  const [endProps, endRef] = useDrag(dragProps({ x: 50, y: 50 }));
  return (
    <>
      <Path
        coords={[startProps.coord, endProps.coord]}
        isDragging={startProps.isDragging || endProps.isDragging}
      />
      <EndPoint dragRef={startRef} {...startProps} />
      <EndPoint dragRef={endRef} {...endProps} />;
    </>
  );
}
