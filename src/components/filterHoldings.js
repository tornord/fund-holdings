function matchFund(fund, filterCriterias) {
  if (filterCriterias.length === 0) {
    return true;
  }
  for (let i = 0; i < filterCriterias.length; i++) {
    const filterCriteria = filterCriterias[i];
    if (filterCriteria.type === "C" && fund.fundCompanyNumber === filterCriteria.id) {
      return true;
    }
    if (filterCriteria.type === "F" && fund.isin === filterCriteria.id) {
      return true;
    }
  }
  return false;
}

function matchHolding(holding, filterCriterias, requireIndustrySectorCode) {
  if (filterCriterias.length === 0) {
    return true;
  }
  const { instrument } = holding;
  if (requireIndustrySectorCode && !instrument.industrySector) {
    return false;
  }
  for (let i = 0; i < filterCriterias.length; i++) {
    const filterCriteria = filterCriterias[i];
    if (filterCriteria.type === "I" && instrument.id === filterCriteria.id) {
      return true;
    }
    if (
      filterCriteria.type === "B" &&
      instrument.industrySector &&
      instrument.industrySector.code === filterCriteria.id
    ) {
      return true;
    }
    if (
      instrument.issuerCountryCode &&
      filterCriteria.type === "L" &&
      instrument.issuerCountryCode === filterCriteria.id
    ) {
      return true;
    }
  }
  return false;
}

export default function filterHoldings(funds, filterCriterias, requireIndustrySectorCode) {
  const holdings = [];
  for (let i = 0; i < funds.length; i++) {
    const fund = funds[i];
    const isFundMatch =
      matchFund(
        fund,
        filterCriterias.filter((d) => d.type === "C")
      ) &&
      matchFund(
        fund,
        filterCriterias.filter((d) => d.type === "F")
      );
    if (!isFundMatch) {
      continue;
    }
    for (let j = 0; j < fund.holdings.length; j++) {
      const holding = fund.holdings[j];
      const isHoldingMatch =
        matchHolding(
          holding,
          filterCriterias.filter((d) => d.type === "I"),
          requireIndustrySectorCode
        ) &&
        matchHolding(
          holding,
          filterCriterias.filter((d) => d.type === "B"),
          requireIndustrySectorCode
        ) &&
        matchHolding(
          holding,
          filterCriterias.filter((d) => d.type === "L"),
          requireIndustrySectorCode
        );
      if (isHoldingMatch) {
        holdings.push(holding);
      }
    }
  }
  return holdings;
}
