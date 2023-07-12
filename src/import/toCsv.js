const fs = require("fs");
const crypto = require("crypto");
const industrySectors = require("./industrySectors");
const countries = require("./countries");
// const clipboardy = require('clipboardy');
const AdmZip = require("adm-zip");
const keyBy = require("./keyBy");

const dataPath = "./widgets/FundHoldings/data";
const industrySectorsByCode = keyBy(industrySectors, (d) => d.code);
const countriesByCode = keyBy(countries, (d) => d.code);
const funds = JSON.parse(fs.readFileSync(`${dataPath}/funds.json`, "utf-8"));

function toTitleCase(str) {
  return str.replace(/\w*\S*/g, (txt) => txt.charAt(0).toLocaleUpperCase() + txt.substr(1).toLocaleLowerCase());
}

function toSha256(str) {
  const hash = crypto.createHash("sha256");
  const code = hash.update(str);
  return code.digest("hex");
}

function getIndustrySectorCodesByName(_industrySectors) {
  const res = {};
  for (let d of _industrySectors) {
    res[d.name] = d.code;
    for (let a of d.aliases) {
      res[a] = d.code;
    }
  }
  return res;
}

function updateInstrumentFieldByVotes(instrument, field, votesField) {
  const votes = Object.entries(instrument[votesField]);
  if (votes.length === 0) {
    return;
  }
  votes.sort((d1, d2) => d2[1] - d1[1]);
  instrument[field] = votes[0][0];
}

function isFalseEquity(name) {
  if (!name.match(/[0-9/]|float|frn|perp(?:etual)?/i)) {
    return false;
  }
  const isInterestRate = name.match(/[0-9]*[,.][0-9]+%?|[0-9]*[,.]?[0-9]+%|[0-9]+ [0-9]+\/[0-9]+/);
  const isNote = name.match(/\sfrn|frn\s|\sfloat|float\s|\sperp(?:etual)?|perp(?:etual)?/i);
  const isDate = name.match(
    /(?:2[01])?[0-9]{2}[0-2][0-9][0-3][0-9]|(?:2[01])?[0-9]{2}-[0-2][0-9]-[0-3][0-9]|[0-3][0-9][/.-][0-2][0-9][/.-](?:2[01])?[0-9]{2}/
  );
  if (!isInterestRate && !isDate && !isNote) {
    return false;
  }
  return true;
}

function newInstrument(name, isin) {
  return {
    isin: isin,
    name: name,
    industrySectorCode: null,
    issuerCountryCode: null,
    nameVotes: {},
    industrySectorVotes: {},
    issuerCountryVotes: {},
  };
}

function updateVotes(instrument, key, votesField) {
  const votes = instrument[votesField];
  if (key) {
    if (!votes[key]) {
      votes[key] = 1;
    } else {
      votes[key]++;
    }
  }
}

function toCsv() {
  let reportDate = null;
  const industrySectorCodesByName = getIndustrySectorCodesByName(industrySectors);
  const usedIndustrySectors = {};
  const companies = {};
  const holdings = [];
  for (let i in funds) {
    const fund = funds[i];
    if (!reportDate) {
      reportDate = fund.reportDate;
    }
    let company = companies[fund.companyNumber];
    if (!company) {
      company = { name: fund.companyName, number: fund.companyNumber, funds: [] };
      companies[company.number] = company;
    }
    company.funds.push({
      name: fund.fundName,
      isin: fund.fundIsin,
      nav: fund.fundNav,
      cash: fund.fundCash,
      status: fund.fundStatus,
      holdings: [],
    });
    for (let j in fund.holdings) {
      const holding = fund.holdings[j];
      let { industrySectorCode, industrySectorName, isin, issuerCountryCode, name } = holding;

      // Update used industry sectors
      if (industrySectorCode) {
        if (
          (industrySectorCode === null || industrySectorCode === "0") &&
          industrySectorName &&
          industrySectorCodesByName[industrySectorName]
        ) {
          industrySectorCode = industrySectorCodesByName[industrySectorName];
        }
        let c = usedIndustrySectors[industrySectorCode];
        if (!c) {
          c = {
            code: industrySectorCode,
            name: industrySectorsByCode[industrySectorCode].name,
            aliases: [],
          };
          usedIndustrySectors[industrySectorCode] = c;
        }
        if (
          holding.industrySectorName &&
          c.name !== holding.industrySectorName &&
          !c.aliases.find((d) => d === holding.industrySectorName)
        ) {
          c.aliases.push(holding.industrySectorName);
        }
      }
      if (name.length > 2 && !name.match(/[^A-ZÅÄÖ0-9%,.&/\-\s]/)) {
        name = toTitleCase(name);
      }
      holdings.push({ industrySectorCode, isin, issuerCountryCode, name });
    }
  }

  const instrumentsByIsin = {};
  const instrumentsByName = {};
  for (let holding of holdings) {
    let { industrySectorCode: indCode, isin, issuerCountryCode: cntryCode, name } = holding;

    let instrument;
    const id = isin ? isin : name;
    const dict = isin ? instrumentsByIsin : instrumentsByName;
    instrument = dict[id];
    if (!instrument) {
      instrument = newInstrument(name, isin);
      dict[id] = instrument;
    }

    // Update instrument name, industry sector country code votes
    updateVotes(instrument, name, "nameVotes");
    updateVotes(instrument, indCode, "industrySectorVotes");
    updateVotes(instrument, cntryCode, "issuerCountryVotes");
  }

  let instruments = [...Object.values(instrumentsByIsin), ...Object.values(instrumentsByName)];

  instruments.forEach((d, i) => {
    d.id = i.toFixed();
    updateInstrumentFieldByVotes(d, "name", "nameVotes");
    updateInstrumentFieldByVotes(d, "industrySectorCode", "industrySectorVotes");
    updateInstrumentFieldByVotes(d, "issuerCountryCode", "issuerCountryVotes");
  });

  const dbCompaniesDict = {};
  const dbFunds = [];
  const rows = [];
  rows.push([
    "CompanyName",
    "CompanyNumber",
    "FundName",
    "FundIsin",
    "FundStatus",
    "FundNav",
    "FundCash",
    "InstrumentName",
    "InstrumentIsin",
    "InstrumentIndustrySectorCode",
    "InstrumentIndustrySectorName",
    "InstrumentValue",
    "InstrumentCurrency",
    "InstrumentFxRate",
    "IssuerCountryCode",
    "IssuerCountryName",
    "Lvf5AssetClass",
  ]);
  const falseEquites = {};
  for (let fund of funds) {
    const holdingsDict = {};
    const dbFund = {
      fundCompanyNumber: fund.companyNumber,
      name: fund.fundName,
      isin: fund.fundIsin,
      nav: fund.fundNav,
      cash: fund.fundCash,
      status: fund.fundStatus,
      holdings: null,
    };
    const company = { name: fund.companyName, number: fund.companyNumber };
    if (company.name.match(/Teknik Innovation Norden/)) {
      company.name = "Teknik Innovation Norden, TIN Fonder AB";
    }
    dbCompaniesDict[fund.companyNumber] = company;
    for (let holding of fund.holdings) {
      const { isin } = holding;
      let instrument;
      let instrumentName;
      if (isin) {
        instrument = instrumentsByIsin[isin];
        instrumentName = instrument.name;
      } else {
        instrumentName = holding.name;
        if (instrumentName.length > 2 && !instrumentName.match(/[^A-ZÅÄÖ0-9%,.&/\-\s]/)) {
          instrumentName = toTitleCase(instrumentName);
        }
        instrument = instrumentsByName[instrumentName];
      }
      if (!instrument) {
        console.log(`Instrument is missing for ${fund.fundName}, name=${instrumentName}, isin=${isin}`);
      }
      let p = holdingsDict[instrument.id];
      if (!p) {
        p = { instrumentId: instrument.id, value: holding.value };
        holdingsDict[instrument.id] = p;
      } else {
        p.value += holding.value;
      }
      // const instrument = isin ? instrumentsByIsin[isin] : instrumentsByName[isin];
      // const instrumentName = (instrument ? instrument : holding).name;
      let { industrySectorCode } = instrument; // ? instrument : holding;
      if (industrySectorCode === "0" || (industrySectorCode !== null && isFalseEquity(instrumentName))) {
        if (industrySectorCode !== "0") {
          falseEquites[instrumentName] = [instrumentName, isin, industrySectorCode];
        }
        industrySectorCode = null;
        instrument.industrySectorCode = null;
      }
      const row = [
        fund.companyName,
        fund.companyNumber,
        fund.fundName,
        fund.fundIsin,
        fund.fundStatus,
        fund.fundNav.toString().replace(".", ","),
        fund.fundCash.toString().replace(".", ","),
        instrumentName,
        isin,
        industrySectorCode,
        industrySectorCode ? industrySectorsByCode[industrySectorCode].name : "",
        holding.value.toString().replace(".", ","),
        holding.currency,
        holding.fxRate.toString().replace(".", ","),
        instrument.issuerCountryCode,
        instrument.issuerCountryCode ? countriesByCode[instrument.issuerCountryCode].name : "",
        holding.lvf5AssetClass,
      ];
      rows.push(row);
    }
    dbFund.holdings = Object.values(holdingsDict);
    dbFunds.push(dbFund);
  }

  instruments = instruments.map((d) => ({
    id: d.id,
    isin: d.isin,
    name: d.name,
    industrySectorCode: d.industrySectorCode,
    issuerCountryCode: d.issuerCountryCode,
  }));

  // fs.writeFileSync("./data/test1.csv", rows.map((d) => toSha256(d.join("\t"))).join("\n"), "utf-8");
  // fs.writeFileSync("./data/instruments.json", JSON.stringify(Object.values(instruments), null, 2), "utf-8");
  fs.writeFileSync(
    `${dataPath}/falseEquity.csv`,
    Object.values(falseEquites)
      .map((d) => d.join("\t"))
      .join("\n"),
    "utf-8"
  );

  const csv = rows.map((d) => d.join("\t")).join("\n");
  console.log(toSha256(csv));
  // console.log(rows[3514].join("\t"));

  const db = {
    reportDate,
    companies: Object.values(dbCompaniesDict),
    industrySectors: industrySectors.map((d) => ({ code: d.code, name: d.name })),
    instruments,
    funds: dbFunds,
  };
  fs.writeFileSync(`${dataPath}/db.json`, JSON.stringify(db, null, 2), "utf-8");
  const zip = new AdmZip();
  const content = JSON.stringify(db);
  zip.addFile("db.json", Buffer.alloc(content.length, content), "");
  zip.toBuffer();
  zip.writeZip(`${dataPath}/db.zip`);
  fs.writeFileSync(
    `${dataPath}/instruments.json`,
    JSON.stringify(
      db.instruments.map((d) => ({ _id: d.id, name: d.name })),
      null,
      2
    ),
    "utf-8"
  );

  return csv;
}

// const x = isFalseEquity("Fastighets Balder VAR Perpetual")

const csv = toCsv();
fs.writeFileSync(`${dataPath}/funds.csv`, csv, "utf-8");

module.exports = {
  toSha256,
  keyBy,
  toCsv,
  toTitleCase,
  getIndustrySectorCodesByName,
  updateInstrumentFieldByVotes,
  isFalseEquity,
  updateVotes,
};
