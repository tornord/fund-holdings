const { parseString } = require("xml2js");
const fs = require("fs");
var AdmZip = require("adm-zip");

const dataPath = "./widgets/FundHoldings/data";

function parseStringAsPromise(xml) {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      resolve(result.VärdepappersfondInnehav);
    });
  });
}

async function main() {
  const funds = [];
  const body = fs.readFileSync(`${dataPath}/funds.zip`);

  const zip = new AdmZip(body);
  const zipEntries = zip.getEntries();
  console.log(zipEntries.length);

  for (let entry of zipEntries) {
    if (entry.isDirectory) continue;
    const f = await parseStringAsPromise(entry.getData().toString("utf8"));
    const bolag = f.Bolagsinformation[0];
    const fond = f.Fondinformation[0];
    const fund = {
      companyName: bolag.Fondbolag_namn[0].trim(),
      companyNumber: bolag.Fondbolag_institutnummer[0].trim(),
      fundNav: fond["Fondförmögenhet"] ? Number(fond["Fondförmögenhet"][0]) : 0,
      fundCash: fond["Likvida_medel"] ? Number(fond["Likvida_medel"][0].trim()) : 0,
      fundName: fond["Fond_namn"][0].trim(),
      fundIsin: fond["Fond_ISIN-kod"][0].trim(),
      fundStatus: fond.Fond_status ? fond.Fond_status[0].trim() : "Aktiv",
      holdings: [],
      reportDate: f.Rapportinformation[0].Kvartalsslut[0],
    };
    funds.push(fund);
    if (!fond.FinansiellaInstrument) continue;
    const instrs = fond.FinansiellaInstrument[0].FinansielltInstrument;
    for (let instr of instrs) {
      const bransch = instr.Bransch ? instr.Bransch[0] : null;
      const holding = {
        name: instr.Instrumentnamn[0].trim(),
        industrySectorName:
          bransch && bransch.Bransch_namn_instrument ? bransch.Bransch_namn_instrument[0].trim() : null,
        industrySectorCode: bransch && bransch.Branschkod_instrument ? bransch.Branschkod_instrument[0].trim() : null,
        isin: instr["ISIN-kod_instrument"][0].trim(),
        value: Number(instr["Marknadsvärde_instrument"][0].trim()),
        price: Number(instr["Kurs_som_använts_vid_värdering_av_instrumentet"][0].trim()),
        currency: instr.Valuta[0].trim(),
        fxRate: Number(instr["Valutakurs_instrument"][0].trim()),
        issuerCountryCode: instr["Landkod_Emittent"][0].trim(),
        lvf5AssetClass: instr["Tillgångsslag_enligt_LVF_5_kap"][0].trim(),
      };
      fund.holdings.push(holding);
    }
  }
  console.log(`${funds.length} funds imported`);
  fs.writeFileSync(`${dataPath}/funds.json`, JSON.stringify(funds, null, 2), "utf-8");
}

try {
  main();
} catch (e) {
  console.log(e);
}
