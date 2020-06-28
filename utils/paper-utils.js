const PaperUtils = {
  drawShape: (path) => {
    beginShape()
    if (!path.children) {
      drawPath(path)
    } else {
      drawPath(path.children[0])

      // Support only nonzero fillRule for now, sorry folks
      for (let subpath of path.children.slice(1)) {
        beginContour()
        drawPath(subpath)
        endContour()
      }
    }

    endShape()
  }

  // Draw a paper.js path using bezier curves.
  drawPath: (path) => {
    let starting = true
    let prevSegment = path.segments[0]

    vertex(prevSegment.point.x, prevSegment.point.y)

    for (let segment of path.segments.slice(1)) {
      addCurve(prevSegment, segment)
      prevSegment = segment
    }

    // Loop back around to the first point and
    // add the closing curve.
    addCurve(
      path.segments[path.segments.length - 1],
      path.segments[0]
    )
  }

  // Adds a curve from one segment anchor point to the next
  // using the in/out handles.
  addCurve: (segmentFrom, segmentTo) => {
    bezierVertex(
      segmentFrom.point.x + segmentFrom.handleOut.x,
      segmentFrom.point.y + segmentFrom.handleOut.y,
      segmentTo.point.x + segmentTo.handleIn.x,
      segmentTo.point.y + segmentTo.handleIn.y,
      segmentTo.point.x,
      segmentTo.point.y
    )
  }
}
