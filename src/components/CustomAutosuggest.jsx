import React from "react";
import Autosuggest from "react-autosuggest";

const DEFAULT_MAX_LIST_COUNT = 50;

export default function CustomAutosuggest({
  className,
  toListItemText,
  toListItemClassName,
  toInputText,
  toSearchText,
  values,
  selected,
  onChange,
  maxListCount,
  disabled,
  placeholder,
  alwaysRenderValues,
}) {
  const startValue = selected ? (toListItemText ? toListItemText(selected) : selected) : "";
  const [inputState, setInputState] = React.useState({
    inputValue: startValue,
    selected,
  });
  const initialSuggestions = alwaysRenderValues ? values : [];
  const [suggestions, setSuggestions] = React.useState(initialSuggestions);

  if (inputState.selected !== selected) {
    setInputState({ inputValue: startValue, selected });
  }

  const texts = toSearchText ? values.map(toSearchText) : values;
  const filterSuggestions = (value) => {
    if (!value || alwaysRenderValues) {
      return initialSuggestions;
    }
    const escapeRegexCharacters = (str) => str.replace(/[.*+?^${}()|[\]\\@]/g, "\\$&");
    const escapedValue = escapeRegexCharacters(value.trim());
    if (escapedValue === "") {
      return initialSuggestions;
    }
    const regex = new RegExp(escapedValue, "i");
    let res = [];
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      const text = texts[i];
      if (text) {
        const sortOrder = text.search(regex);
        if (sortOrder >= 0) {
          res.push({ value, text, sortOrder });
        }
      }
    }
    res.sort((d1, d2) => {
      const c = d1.sortOrder - d2.sortOrder;
      return c !== 0 ? c : d1.text < d2.text ? -1 : d1.text > d2.text ? 1 : 0;
    });
    res = res.map((d) => d.value);
    const m = maxListCount || DEFAULT_MAX_LIST_COUNT;
    if (res.length > m) {
      res = res.slice(0, m);
    }
    return res;
  };
  return (
    <Autosuggest
      containerProps={{
        className: `react-autosuggest__container${className ? ` ${className}` : ""}`,
      }}
      suggestions={suggestions}
      onSuggestionsFetchRequested={({ value }) => setSuggestions(filterSuggestions(value))}
      onSuggestionsClearRequested={() => setSuggestions(initialSuggestions)}
      shouldRenderSuggestions={() => true}
      getSuggestionValue={(suggestion) => {
        if (onChange) {
          onChange(suggestion);
        }
        return toInputText ? toInputText(suggestion) : suggestion;
      }}
      renderSuggestion={(suggestion, x) => {
        const text = toListItemText ? toListItemText(suggestion) : suggestion;
        if (!text) {
          return <span></span>;
        }
        const index = text.toLocaleLowerCase().indexOf(x.query.toLocaleLowerCase());
        const n = x.query.length;
        const c = toListItemClassName ? toListItemClassName(suggestion) : null;
        return (
          <span className={c}>
            {index >= 0 ? (
              <>
                {text.substring(0, index)}
                <span className="highlight">{text.substring(index, index + n)}</span>
                {text.substring(index + n)}
              </>
            ) : (
              <span>{text}</span>
            )}
          </span>
        );
      }}
      inputProps={{
        value: inputState.inputValue,
        onChange: (event, { newValue /* , method */ }) => {
          if (onChange && (newValue === null || newValue === "")) {
            onChange(newValue);
          }
          setInputState({ inputValue: newValue, selected });
        },
        onFocus: (event) => event.target.select(),
        className: "form-control",
        disabled,
        placeholder,
      }}
    />
  );
}
