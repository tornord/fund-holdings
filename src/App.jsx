import { useState, useEffect } from "react";
import WorldMap from "./components/WorldMap";
import { companies, industrySectors, instruments, funds, reportDate } from "./db.json";
import keyBy from "./components/keyBy";
import { SearchInput, typeToClassName } from "./components/SearchInput";
import countries from "./components/countries";
import continents from "./components/continents";
import Cross from "./Cross";
import Table from "./components/Table";
import filterHoldings from "./components/filterHoldings";
import { Paginate } from "./components/Paginate";
import { StyledApp } from "./StyledApp";

const PAGE_SIZE = 18;

function formatNumber(n) {
  if (n === null) {
    return "";
  }
  let ss = n.toFixed(1).split(".");
  let s = ss[0];
  let rgx = /(\d+)(\d{3})/;
  while (rgx.test(s)) {
    s = s.replace(rgx, "$1 $2");
  }
  return `${s},${ss[1]}`;
}

const countriesByCode = keyBy([...countries, ...continents], (d) => d.code);
const industrySectorsByCode = keyBy(industrySectors, (d) => d.code);

const equityCount = instruments.filter((d) => d.industrySectorCode && d.industrySectorCode !== "0").length;
const instrumentsById = keyBy(instruments, (d) => d.id);
funds.forEach((fund) => {
  if (fund.positions && !fund.holdings) {
    fund.holdings = fund.positions;
    delete fund.positions;
  }
  for (let i in fund.holdings) {
    const holding = fund.holdings[i];
    holding.value /= 1e6;
    holding.instrument = instrumentsById[holding.instrumentId];
    holding.fund = fund;
    if (!holding.instrument) {
      console.log("Missing instrument", holding.instrumentId);
      continue;
    }
    delete holding.instrumentId;
  }
});
instruments.forEach((instrument) => {
  let industrySector = null;
  if (instrument.industrySectorCode !== null && instrument.industrySectorCode !== "0") {
    industrySector = industrySectorsByCode[instrument.industrySectorCode];
  }
  instrument.industrySector = industrySector;
  delete instrument.industrySectorCode;
});
// const holdingsCount = funds.reduce((p, d) => (p += d.holdings.length), 0);
const holdingsByCountries = keyBy(filterHoldings(funds, [], false), (d) => d.instrument.issuerCountryCode);

const companyCreterias = companies.map((d) => ({ type: "C", id: d.number, entity: d }));
const fundCreterias = funds.filter((d) => d.holdings.length > 0).map((d) => ({ type: "F", id: d.isin, entity: d }));
const instrumentCreterias = instruments
  .filter((d) => d.industrySector)
  .map((d) => ({ type: "I", id: d.id, entity: d }));
const countryCreterias = Object.keys(holdingsByCountries).map((d) => ({
  type: "L",
  id: d,
  entity: countriesByCode[d],
}));
const industrySectorCreterias = industrySectors
  .filter((d) => d.code !== "0")
  .map((d) => ({ type: "B", id: d.code, entity: d }));

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}

const App = () => {
  const [filter, setFilter] = useState({
    criterias: [],
    page: 0,
    groupBy: "instrument",
  });
  const { width } = useWindowSize();

  const filteredHoldings = filterHoldings(funds, filter.criterias, false);
  const dataByCountry = filteredHoldings.reduce((p, c) => {
    const cc = c.instrument.issuerCountryCode;
    if (!cc) {
      return p;
    }
    let t = p[cc];
    if (!t) {
      t = { value: 0 };
      p[cc] = t;
    }
    t.value += c.value;
    return p;
  }, {});
  const dataByContinent = filteredHoldings.reduce((p, c) => {
    if (!c.instrument.issuerCountryCode) {
      return p;
    }
    const cc = c.instrument.issuerCountryCode;
    const cn = `C${countriesByCode[cc].continentCode}`;
    let t = p[cn];
    if (!t) {
      t = { value: 0 };
      p[cn] = t;
    }
    t.value += c.value;
    return p;
  }, {});

  let tableData = [];
  let columns = [];

  const allColumns = [
    { key: "fundName", header: "Fond", className: "left" },
    { key: "instrumentName", header: "Innehav", className: "left" },
    { key: "industrySectorName", header: "Bransch", className: "left" },
    { key: "issuerCountryCode", header: "Land", className: "center" },
    { key: "issuerCountryName", header: "Land", className: "left" },
    { key: "value", header: "Värde (Mkr)", className: "right" },
  ];

  const groupings = [
    { type: "instrument", name: "Innehav", pluralName: "innehav" },
    { type: "industrySector", name: "Bransch", pluralName: "branscher" },
    { type: "country", name: "Land", pluralName: "länder" },
    { type: "fund", name: "Fond", pluralName: "fonder" },
  ];

  if (filter.groupBy === "none") {
    tableData = filteredHoldings.map((d) => ({
      holdings: [d],
      fundName: d.fund.name,
      instrumentName: d.instrument.name,
      industrySectorName: d.instrument.industrySector ? d.instrument.industrySector.name : null,
      issuerCountryCode: d.instrument.issuerCountryCode,
      valueAsNumber: d.value,
    }));
    columns = [0, 1, 2, 3, 5].map((d) => allColumns[d]);
  } else if (filter.groupBy === "fund") {
    const dict = {};
    filteredHoldings.forEach((d) => {
      let id = d.fund.isin;
      let r = dict[id];
      if (!r) {
        r = { holdings: [], fundName: d.fund.name, valueAsNumber: 0 };
        dict[id] = r;
      }
      r.holdings.push(d);
      r.valueAsNumber += d.value;
    });
    tableData = Object.values(dict);
    columns = [allColumns[0], allColumns[5]];
  } else if (filter.groupBy === "instrument") {
    const dict = {};
    filteredHoldings.forEach((d) => {
      let id = d.instrument.id;
      let r = dict[id];
      if (!r) {
        r = {
          holdings: [],
          instrumentName: d.instrument.name,
          valueAsNumber: 0,
        };
        dict[id] = r;
      }
      r.holdings.push(d);
      r.valueAsNumber += d.value;
    });
    tableData = Object.values(dict);
    columns = [allColumns[1], allColumns[5]];
  } else if (filter.groupBy === "industrySector") {
    const dict = {};
    filteredHoldings.forEach((d) => {
      if (!d.instrument.industrySector) return;
      let id = d.instrument.industrySector.code;
      let r = dict[id];
      if (!r) {
        r = {
          holdings: [],
          industrySectorName: d.instrument.industrySector.name,
          valueAsNumber: 0,
        };
        dict[id] = r;
      }
      r.holdings.push(d);
      r.valueAsNumber += d.value;
    });
    tableData = Object.values(dict);
    columns = [allColumns[2], allColumns[5]];
  } else if (filter.groupBy === "country") {
    const dict = {};
    filteredHoldings.forEach((d) => {
      let id = d.instrument.issuerCountryCode;
      if (!id) return;
      let r = dict[id];
      if (!countriesByCode[d.instrument.issuerCountryCode]) {
        console.log(d.instrument);
      }
      if (!r) {
        r = {
          holdings: [],
          issuerCountryCode: d.instrument.issuerCountryCode,
          issuerCountryName: countriesByCode[d.instrument.issuerCountryCode].name,
          valueAsNumber: 0,
        };
        dict[id] = r;
      }
      r.holdings.push(d);
      r.valueAsNumber += d.value;
    });
    tableData = Object.values(dict);
    columns = [allColumns[4], allColumns[5]];
  }
  tableData.forEach((d) => {
    d.value = formatNumber(d.valueAsNumber);
  });
  tableData.sort((d1, d2) => d2.valueAsNumber - d1.valueAsNumber);
  const pagesCount = Math.ceil(tableData.length / PAGE_SIZE);

  const groupByButtonClick = (e) => {
    let { id } = e.target;
    setFilter((prev) => ({
      criterias: [...prev.criterias],
      page: 0,
      groupBy: id,
    }));
  };

  const Button = ({ type, name }) => {
    const classNames = ["button"];
    if (type === filter.groupBy) {
      classNames.push("selected");
    }
    return (
      <button id={type} className={classNames.join(" ")} onClick={groupByButtonClick}>
        {name}
      </button>
    );
  };

  const searchInputOnChange = (d) => {
    if (!d) {
      return;
    }
    if (filter.criterias.find((e) => e.type === d.type && e.id === d.id)) {
      return;
    }
    filter.criterias.push(d);
    setFilter({
      criterias: [...filter.criterias],
      page: 0,
      groupBy: d.type === "I" ? "fund" : "instrument",
    });
  };

  const slicedTableData = tableData.slice(PAGE_SIZE * filter.page, PAGE_SIZE * (filter.page + 1));
  while (slicedTableData.length < PAGE_SIZE) {
    slicedTableData.push(null);
  }

  return (
    <StyledApp>
      <h2 className="standard-title">Sök bland svenska fonders alla innehav</h2>

      {width === null ? null : (
        <WorldMap
          dataByCountry={dataByCountry}
          dataByContinent={dataByContinent}
          width={Math.max(340, Math.min(width, 620))}
          height={360}
          onClick={(country) => {
            if (!holdingsByCountries[country.code]) {
              return;
            }
            const index = filter.criterias.findIndex((d) => d.type === "L" && d.entity.code === country.code);
            if (index >= 0) {
              filter.criterias.splice(index, 1);
            } else {
              filter.criterias.push({
                type: "L",
                id: country.code,
                entity: country,
              });
            }
            setFilter({
              criterias: [...filter.criterias],
              page: 0,
              groupBy: filter.groupBy,
            });
          }}
          renderData={(country, data, i, scaleFactor) => {
            if (data.value <= 0) {
              return null;
            }
            const { midX, midY } = country;
            const radius = Math.max(Math.log10(data.value) * 8, 10);
            return (
              <circle
                key={i}
                id={country.code}
                className="data"
                cx={midX}
                cy={midY}
                r={radius / scaleFactor}
                style={{ strokeWidth: (1 / scaleFactor).toFixed(2) }}
                onMouseOver={() => {
                  console.log("onMouseOver", country);
                }}
              />
            );
          }}
          fitToSelection={true}
        />
      )}

      <div className="body">
        <div className="form">
          <div className="form-input">
            <SearchInput
              selected={null}
              values={instrumentCreterias}
              onChange={searchInputOnChange}
              placeholder="Sök aktie"
            />
            <SearchInput
              selected={null}
              values={industrySectorCreterias}
              onChange={searchInputOnChange}
              placeholder="Sök bransch"
              alwaysRenderValues={true}
            />
            <SearchInput
              selected={null}
              values={countryCreterias}
              onChange={searchInputOnChange}
              placeholder="Sök land"
            />
            <SearchInput
              className="align-right"
              selected={null}
              values={[...companyCreterias, ...fundCreterias]}
              onChange={searchInputOnChange}
              placeholder="Sök fond"
            />{" "}
          </div>
          {/* <select className='form-control industry-sector-select' placeholder='Välj fond ..' value=''>
        <option></option>
          {Object.values(industrySectorsByCode).map((d, i) => (
            <option key={i}>{d.name}</option>
          ))}
        </select> */}
        </div>
        {filter.criterias.length > 0 ? (
          <div className="selected-filter-criterias dark-blue">
            <span className="label">Ditt urval:</span>
            <ul>
              {filter.criterias.map((d, i) => (
                <li key={i}>
                  <span className={typeToClassName(d.type)}>
                    {d.entity.name}
                    <button
                      onClick={() => {
                        // console.log('meow', i, e);
                        filter.criterias.splice(i, 1);
                        setFilter({
                          criterias: [...filter.criterias],
                          page: 0,
                          groupBy: filter.groupBy,
                        });
                      }}
                    >
                      <Cross />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}{" "}
      </div>

      <div className="groupings">
        <p>
          Visa per:
          {groupings.map((d, i) => (
            <Button key={i} type={d.type} name={d.name} />
          ))}
        </p>
      </div>

      <Table
        data={slicedTableData}
        columns={columns}
        onClick={(e, d, key) => {
          // const appendCriteria = e.shiftKey || e.metaKey;
          const { holdings } = d;
          if (key === "fundName") {
            filter.criterias = filter.criterias.filter((d) => d.type !== "F");
            const { fund } = holdings[0];
            filter.criterias.push({ type: "F", id: fund.isin, entity: fund });
            setFilter({
              criterias: [...filter.criterias],
              page: 0,
              groupBy: "instrument",
            });
          } else if (key === "industrySectorName") {
            const { industrySector } = holdings[0].instrument;
            if (industrySector) {
              filter.criterias = filter.criterias.filter((d) => d.type !== "B");
              filter.criterias.push({
                type: "B",
                id: industrySector.code,
                entity: industrySector,
              });
              setFilter({
                criterias: [...filter.criterias],
                page: 0,
                groupBy: "instrument",
              });
            }
          } else if (key === "issuerCountryCode" || key === "issuerCountryName") {
            const { issuerCountryCode } = holdings[0].instrument;
            if (issuerCountryCode) {
              filter.criterias = filter.criterias.filter((d) => d.type !== "L");
              filter.criterias.push({
                type: "L",
                id: issuerCountryCode,
                entity: countriesByCode[issuerCountryCode],
              });
              setFilter({
                criterias: [...filter.criterias],
                page: 0,
                groupBy: "instrument",
              });
            }
          } else if (key === "instrumentName") {
            filter.criterias = filter.criterias.filter((d) => d.type !== "I");
            const { instrument } = holdings[0];
            filter.criterias.push({
              type: "I",
              id: instrument.id,
              entity: instrument,
            });
            setFilter({
              criterias: [...filter.criterias],
              page: 0,
              groupBy: "fund",
            });
          }
        }}
      />

      {tableData.length > 0 ? (
        <div className="table-footer">
          <span className="page-text">{`Sida: ${filter.page + 1} (av ${pagesCount})`}</span>
          <Paginate
            page={filter.page}
            pageCount={pagesCount}
            onChange={(page) => {
              if (filter.page !== page) {
                setFilter({
                  criterias: [...filter.criterias],
                  page,
                  groupBy: filter.groupBy,
                });
              }
            }}
          />
        </div>
      ) : null}
      <p>
        Urval: <span>{tableData.length > 0 ? tableData.length.toFixed(0) : "Inga"}</span>
        <span> {groupings.find((d) => d.type === filter.groupBy).pluralName}</span>
        {filter.criterias.length > 0 ? <span> matchar.</span> : <span>.</span>}
        {tableData.length > 0
          ? ` Totalt värde: ${formatNumber(tableData.reduce((p, c) => p + c.valueAsNumber, 0))} milj. kr`
          : null}
      </p>
      <div className="footer" style={{ marginTop: "1rem" }}>
        <p>{`Rapporterade fondinnehav till FI per ${reportDate}`}.</p>
        <p>
          Sök bland {companies.length} fondbolag, {funds.filter((d) => d.holdings.length > 0).length} fonder,{" "}
          {instruments.length} värdepapper, varav {equityCount} aktier.
        </p>
        <p style={{ marginTop: "0.5rem" }}>
          <span className="byline">Grafik: Tor Nordqvist</span>
          <span>
            Källa:{" "}
            <a
              style={{ textDecoration: "none", color: "#757575" }}
              href="https://www.fi.se/sv/vara-register/fondinnehav-per-kvartal"
            >
              FI:s Fondinnehav per kvartal
            </a>
          </span>
        </p>
      </div>
    </StyledApp>
  );
};

export default App;

// const renderData = (country, data, i, scaleFactor) => {
//   const { name, midX, midY } = country;
//   const fontSize = 11 / scaleFactor;
//   return (
//     <text key={i} y={midY} className='selected country-text' fontSize={fontSize.toFixed(2)} alignmentBaseline='middle'>
//       <tspan className='row1' x={midX} dy={0}>
//         {name}
//       </tspan>
//       <tspan className='row2' x={midX} dy={(fontSize * 9) / 8}>
//         {data.value.toFixed(1)}
//       </tspan>
//     </text>
//   );
// };

// {filter.page > 0 ? (
//   <a
//     href='#'
//     onClick={(e) => {
//       if (filter.page > 0) {
//         setFilter({
//           criterias: [...filter.criterias],
//           page: filter.page - 1,
//           groupBy: filter.groupBy,
//         });
//       }
//       e.preventDefault();
//     }}
//   >
//     Föregående
//   </a>
// ) : (
//   <span className='no-link'>Föregående</span>
// )}
// {' - '}
// {filter.page + 1 < pagesCount ? (
//   <a
//     href='#'
//     onClick={(e) => {
//       if (filter.page + 1 < pagesCount) {
//         setFilter({
//           criterias: [...filter.criterias],
//           page: filter.page + 1,
//           groupBy: filter.groupBy,
//         });
//       }
//       e.preventDefault();
//     }}
//   >
//     Nästa
//   </a>
// ) : (
//   <span className='no-link'>Nästa</span>
// )}
