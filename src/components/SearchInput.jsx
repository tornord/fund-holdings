import React from "react";
import CustomAutosuggest from "./CustomAutosuggest";

export function typeToName(type) {
  if (type === "C") return "Fondbolag";
  if (type === "F") return "Fond";
  if (type === "I") return "Aktie";
  if (type === "B") return "Bransch";
  if (type === "L") return "Land";
  return null;
}

export function typeToClassName(type) {
  if (type === "C") return "filter-type company";
  if (type === "F") return "filter-type fund";
  if (type === "I") return "filter-type instrument";
  if (type === "B") return "filter-type industry-sector";
  if (type === "L") return "filter-type country";
  return null;
}

export function SearchInput({ selectedId, className, values, onChange, placeholder, alwaysRenderValues }) {
  return (
    <CustomAutosuggest
      className={className}
      selected={selectedId ? values.find((d) => d.id === selectedId) : null}
      values={values}
      toListItemClassName={(d) => typeToClassName(d.type)}
      toListItemText={(d) => d.entity.name}
      toInputText={() => ""}
      toSearchText={(d) => `${typeToName(d.type)} ${d.entity.name}`}
      onChange={(val) => {
        if (onChange) {
          onChange(val);
        }
      }}
      placeholder={placeholder}
      alwaysRenderValues={alwaysRenderValues}
    />
  );
}
