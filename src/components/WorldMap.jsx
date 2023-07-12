import React, { useRef, useState, useEffect } from "react";
import { INITIAL_VALUE, ReactSVGPanZoom, TOOL_AUTO } from "react-svg-pan-zoom";
import countries from "./countries.json";
import continents from "./continents.json";
import keyBy from "./keyBy";
import { mergeBoundingRects } from "./helpers";

const countriesByCode = keyBy([...countries, ...continents], (d) => d.code);

function expandBoundingRectToFitWidthHeightRatio(boundingRect, widthHeightRatio) {
  let w1 = widthHeightRatio * boundingRect.height;
  let h1 = boundingRect.width / widthHeightRatio;
  if (w1 > boundingRect.width) {
    h1 = boundingRect.height;
  } else {
    w1 = boundingRect.width;
  }
  const x1 = boundingRect.x + (boundingRect.width - w1) / 2;
  const y1 = boundingRect.y + (boundingRect.height - h1) / 2;
  return { x: x1, y: y1, width: w1, height: h1 };
}

// const prevClick = { x: 0, y: 0 };

export default function WorldMap({
  dataByCountry,
  dataByContinent,
  onClick,
  width,
  height,
  renderData,
  fitToSelection,
}) {
  const viewer = useRef(null);
  window.viewer = viewer;
  const [value, setValue] = useState(INITIAL_VALUE);

  function countryClick(e) {
    const code = e.target.id;
    if (onClick && code !== null) {
      onClick(countriesByCode[code]);
    }
  }
  let br = { x: 0, y: 0, width: 2000, height: 857 };
  const dataEntries = Object.entries(dataByCountry);
  if (fitToSelection === true && dataEntries.length > 0) {
    br = mergeBoundingRects(dataEntries.map((d) => countriesByCode[d[0]].boundingRect));
    const margin = 20;
    br.x -= margin;
    br.y -= margin;
    br.width += 2 * margin;
    br.height += 2 * margin;
  }
  br = expandBoundingRectToFitWidthHeightRatio(br, width / height);

  useEffect(() => {
    viewer.current.fitSelection(br.x, br.y, br.width, br.height);
  }, [br.x, br.y, br.width, br.height]);

  const reverseTransformPoint = (point, e) => {
    return {
      x: ((point.x - e.e) * e.d - (point.y - e.f) * e.c) / (e.a * e.d - e.b * e.c),
      y: ((point.y - e.f) * e.a - (point.x - e.e) * e.b) / (e.a * e.d - e.b * e.c),
    };
  };

  const isInside = (point, boundingRect) =>
    point.x >= boundingRect.x &&
    point.x <= boundingRect.x + boundingRect.width &&
    point.y >= boundingRect.y &&
    point.y <= boundingRect.y + boundingRect.height;

  let dataCountriesInsideCount = 0;
  if (value.a) {
    const p0 = reverseTransformPoint({ x: 0, y: 0 }, value);
    const p1 = reverseTransformPoint({ x: value.viewerWidth, y: value.viewerHeight }, value);
    const currentBoundingRect = { x: p0.x, y: p0.y, width: p1.x - p0.x, height: p1.y - p0.y };
    const dataCountriesInside = Object.entries(dataByCountry).filter((d) => {
      const c = countriesByCode[d[0]];
      return isInside({ x: c.midX, y: c.midY }, currentBoundingRect);
    });
    dataCountriesInsideCount = dataCountriesInside.length;
  }

  return (
    <div>
      <ReactSVGPanZoom
        ref={viewer}
        className="worldmap"
        width={width}
        height={height}
        tool={TOOL_AUTO}
        value={value}
        onChangeValue={setValue}
        // onZoom={(e) => {
        //   console.log('zoom', e);
        // }}
        // onPan={(e) => {
        //   console.log('pan', e);
        // }}
        // onChangeTool={(d) => console.log('onChangeTool', d)}
        // onClick={(e) => {
        //   console.log('click', e.x, e.y);
        //   console.log(
        //     `boundingRect: { x: ${Math.round(Math.min(e.x, prevClick.x))}, y: ${Math.round(
        //       Math.min(e.y, prevClick.y)
        //     )}` +
        //       `, width: ${Math.round(Math.abs(e.x - prevClick.x))}, height: ${Math.round(
        //         Math.abs(e.y - prevClick.y)
        //       )} }`
        //   );
        //   prevClick.x = e.x;
        //   prevClick.y = e.y;
        // }}
        scaleFactor={1.1}
        scaleFactorMin={0.16}
        scaleFactorMax={10}
        scaleFactorOnWheel={1.1}
        toolbarProps={{ position: "none" }}
        miniatureProps={{ position: "none" }}
        detectAutoPan={false}
        background={"#fff"}
      >
        <svg width={2000} height={857}>
          {Object.values(countriesByCode)
            .filter((d) => Boolean(d.path))
            .map((d, i) => (
              <path
                key={i}
                id={d.code}
                className={dataByCountry[d.code] ? "selected" : ""}
                d={d.path}
                onClick={(e) => countryClick(e)}
              />
            ))}{" "}
          {/* {continents.map((d, i) => (
            <rect
              key={i}
              className='continent'
              x={d.boundingRect.x}
              y={d.boundingRect.y}
              width={d.boundingRect.width}
              height={d.boundingRect.height}
            />
          ))} */}
          {value.a && renderData
            ? Object.entries(dataCountriesInsideCount > 20 ? dataByContinent : dataByCountry).map((d, i) =>
                renderData(countriesByCode[d[0]], d[1], i, value.a)
              )
            : null}
          {br ? <rect className="selection-bounds" {...br} /> : null}
        </svg>
      </ReactSVGPanZoom>
    </div>
  );
}

// {Object.entries(totalsPerCountry).map((d, i) => {
//   const { name, midX, midY } = countriesByCode[d[0]];

// function renderData() {
//   const { name, midX, midY } = countriesByCode[d[0]];
//   const fontSize = 11 / value.a;
//   return (
//     <text key={i} y={midY} className='selected country-text' fontSize={fontSize.toFixed(2)} alignmentBaseline='middle'>
//       <tspan className='row1' x={midX} dy={0}>
//         {name}
//       </tspan>
//       <tspan className='row2' x={midX} dy={(fontSize * 9) / 8}>
//         {d[1].value.toFixed(1)}
//       </tspan>
//     </text>
//   );
// }
