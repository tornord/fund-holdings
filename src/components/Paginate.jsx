import React from "react";

const h = 7.55;

function Page({ className, onClick }) {
  const w = 5;
  const m = 0.25;
  return (
    <svg
      className={`page${className ? ` ${className}` : ""}`}
      viewBox={`0 0 ${w} ${h}`}
      onClick={() => (onClick ? onClick() : null)}
    >
      <circle cx={w / 2} cy={h / 2} r={Math.min(w, h) / 2 - m} />
    </svg>
  );
}

// function Page2({ onClick }) {
//   const w = 5.24;
//   const h = 7.55;
//   const s = 1.25;
//   const vm = (h - w) / 2;
//   return (
//     <svg className='page' viewBox={`0 0 ${w} ${h}`} onClick={() => (onClick ? onClick() : null)}>
//       <path
//         d={`M0 ${vm}h${w}v${h - 2 * vm}h${-w}zM${s} ${s + vm}v${h - 2 * (s + vm)}h${w - 2 * s}v${-(
//           h -
//           2 * (s + vm)
//         )}z`}
//       ></path>
//     </svg>
//   );
// }

const { SQRT2 } = Math;
const ChevronPath = (outerLength, thickness) => (
  <path d={`M0 0 v${-(outerLength - thickness)} h${thickness} v${outerLength} h${-outerLength} v${-thickness} z`} />
);

function Chevron({ className, onClick }) {
  const t = 1.38;

  const s = SQRT2 * (h / 2);
  const w = (s + t) / SQRT2;
  return (
    <svg
      className={`chevron${className ? ` ${className}` : ""}`}
      viewBox={`0 0 ${w} ${h}`}
      onClick={() => (onClick ? onClick() : null)}
    >
      <g transform={`translate(${(s - t) / SQRT2}, ${h / 2}) rotate(-45)`}>{ChevronPath(s, t)}</g>
    </svg>
  );
}

function DoubleChevron({ className, onClick }) {
  const t = 1.38;
  const w = h / 2 + (4.25 * t) / SQRT2;

  const s = SQRT2 * (h / 2);
  return (
    <svg
      className={`double-chevron${className ? ` ${className}` : ""}`}
      viewBox={`0 0 ${w} ${h}`}
      onClick={() => (onClick ? onClick() : null)}
    >
      <g transform={`translate(${(s - t) / SQRT2}, ${h / 2}) rotate(-45)`}>{ChevronPath(s, t)}</g>
      <g transform={`translate(${w - SQRT2 * t}, ${h / 2}) rotate(-45)`}>{ChevronPath(s, t)}</g>
    </svg>
  );
}

export function Paginate({ page, pageCount, onChange }) {
  const maxPageCount = 10;
  let activePageDotIndex = page;
  if (pageCount > maxPageCount) {
    activePageDotIndex = Math.round(((maxPageCount - 1) * page) / (pageCount - 1));
  }
  return (
    <div className="paginate">
      {pageCount > 1 ? (
        <>
          {pageCount > 2 ? (
            <DoubleChevron
              className="left"
              onClick={() => {
                const p = 0;
                if (onChange) {
                  onChange(p);
                }
              }}
            />
          ) : null}
          <Chevron
            className="left"
            onClick={() => {
              const p = Math.max(page - 1, 0);
              if (onChange) {
                onChange(p);
              }
            }}
          />
          {[...Array(Math.min(pageCount, maxPageCount))].map((d, i) => (
            <Page
              key={i}
              className={i === activePageDotIndex ? "active" : ""}
              onClick={() => {
                const p = pageCount > maxPageCount ? Math.round(((pageCount - 1) * i) / (maxPageCount - 1)) : i;
                if (onChange) {
                  onChange(p);
                }
              }}
            />
          ))}
          <Chevron
            className="right"
            onClick={() => {
              const p = Math.min(page + 1, pageCount - 1);
              console.log(p);
              if (onChange) {
                onChange(p);
              }
            }}
          />
          {pageCount > 2 ? (
            <DoubleChevron
              className="right"
              onClick={() => {
                const p = pageCount - 1;
                if (onChange) {
                  onChange(p);
                }
              }}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
