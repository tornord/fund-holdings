const axios = require("axios");
const fs = require("fs");

const dataPath = "./widgets/FundHoldings/data";
const url =
  "https://www.fi.se/sv/vara-register/fondinnehav-per-kvartal/download/?filnamn=Fondinnehav_2022Q4_2023-02-28%2009.36.zip";
// 'https://www.fi.se/sv/vara-register/fondinnehav-per-kvartal/download/?filnamn=Fondinnehav_2022Q3_2023-02-22%2014.30.zip';
// 'https://www.fi.se/sv/vara-register/fondinnehav-per-kvartal/download/?filnamn=Fondinnehav_2022Q2_2023-02-22%2014.30.zip';
// 'https://www.fi.se/sv/vara-register/fondinnehav-per-kvartal/download/?filnamn=Fondinnehav_2022Q1_2023-02-22%2014.30.zip';

// 'https://www.fi.se/sv/vara-register/fondinnehav-per-kvartal/download/?filnamn=Fondinnehav_2021Q4_2022-10-28%2015.04.zip';
// 'https://www.fi.se/sv/vara-register/fondinnehav-per-kvartal/download/?filnamn=Fondinnehav_2021Q3_2022-10-28%2015.04.zip';
// 'https://www.fi.se/sv/vara-register/fondinnehav-per-kvartal/download/?filnamn=Fondinnehav_2021Q2_2022-10-28%2015.04.zip';
// 'https://www.fi.se/sv/vara-register/fondinnehav-per-kvartal/download/?filnamn=Fondinnehav_2021Q1_2022-10-31%2017.36.zip';

// 'https://www.fi.se/sv/vara-register/fondinnehav-per-kvartal/download/?filnamn=Fondinnehav_2020Q4_2022-10-28%2014.34.zip';
// 'https://www.fi.se/sv/vara-register/fondinnehav-per-kvartal/download/?filnamn=Fondinnehav_2020Q3_2022-10-31%2015.06.zip';
// 'https://www.fi.se/sv/vara-register/fondinnehav-per-kvartal/download/?filnamn=Fondinnehav_2020Q2_2022-10-28%2014.34.zip';
// 'https://www.fi.se/sv/vara-register/fondinnehav-per-kvartal/download/?filnamn=Fondinnehav_2020Q1_2022-10-28%2014.34.zip';

// https://www.fi.se/sv/vara-register/fondinnehav-per-kvartal

async function main() {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
  }
  fs.writeFileSync(`${dataPath}/funds.zip`, res.data);
}

main();
