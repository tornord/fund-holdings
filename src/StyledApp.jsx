import styled from "@emotion/styled";

export const StyledApp = styled.div(() => {
  return `
    .standard-title {
      font-family: Benton;
      font-size: 18px;
      line-height: 1.25;
      letter-spacing: 0.2px;
      font-weight: 700;
      color: #222;
      margin: 0px 0 5px;

      @media screen and (min-width: 600px) {
        font-size: 20px;
      }
    }

    .standard-ingress {
      font-family: Benton, Georgia, 'Times New Roman', Times, serif;
      line-height: 1.25;
      color: #222;
      padding-top: 4px;
      padding-bottom: 8px;
    }

    .worldmap {
      path {
        fill: #eee;
        stroke: #888;
        stroke-width: 0.3;
      }

      text {
        font-weight: 700;
        fill: #ffffff00;
        text-anchor: middle;
        pointer-events: none;
      }

      text.selected {
        fill: #000;
        text-anchor: middle;
        pointer-events: none;
      }

      path.selected {
        fill: #aaa;
      }

      path:hover {
        fill: #a7100cd0;
      }

      circle.data {
        fill: #a7100c80;
        stroke: #a7100c;
        stroke-width: 1;
        pointer-events: none;
      }

      rect.selection-bounds {
        fill: none;
      }
    }

    .button {
      background-color: #dcc5c1;
      // background-color: hsl(0deg 25% 50%);
      margin-left: 6px;
      border: none;
      padding: 2px 4px;
      border-radius: 4px;
      color: white;
      font-weight: 700;
      text-transform: uppercase;

      &.selected {
        background-color: #a7100c;
        // background-color: hsl(0deg 25% 66%);
      }
    }

    .form {
      margin-bottom: 7px;
    }

    .form-input {
      display: flex;
      justify-content: space-between;
    }

    select.industry-sector-select {
      font-family: Benton;
      font-size: 16px;
      border: 0;
      border-bottom: 1px solid #dcbdb8;
      width: 30rem;
      padding: 4px 6px;
    }

    select {
      font-family: Benton;
      font-size: 16px;
      border: 0;
      border-bottom: 1px solid #dcbdb8;
      padding: 0 2px;
      width: 24%;

      &:invalid {
        color: #757575;
      }
    }

    .react-autosuggest__container {
      position: relative;
      width: 24%;

      input {
        font-family: Benton;
        font-size: 16px;
        border: 0;
        border-bottom: 1px solid #dcbdb8;
        padding: 4px 6px;
        width: 100%;

        &:focus {
          border-bottom: 2px solid #dcbdb8;
          outline-width: 0;
        }
      }

      .react-autosuggest__suggestions-container {
        width: 30rem;
        margin-top: 4px;
        position: absolute;
        z-index: 1000;
        background-color: #fff;
        max-height: 500px;
        overflow: hidden;
        ul {
          display: inline;
          padding-inline-start: 0;
          padding-bottom: 4px;
          li {
            font-size: 15px;
            font-weight: 500;
            display: block;
            padding-left: 4px;
            cursor: pointer;
            span.highlight {
              background-color: #00000050;
            }

            li.react-autosuggest__suggestion--highlighted {
              background-color: hsl(206, 59%, 61%);
            }
            li.selected {
              background-color: hsl(206, 59%, 61%);
            }
          }
        }
      }
    }
    li {
      span.filter-type::before {
        color: #fff;
        font-weight: 700;
        border-radius: 3px;
        margin-right: 4px;
        padding-left: 3px;
        padding-right: 3px;
        font-size: 90%;
      }
      span.fund::before {
        content: 'FOND';
        background-color: rgb(148, 160, 95);
      }
      span.company::before {
        content: 'FONDBOLAG';
        background-color: #9f5fa0;
      }
      span.instrument::before {
        content: 'INNEHAV';
        background-color: #5fa075;
      }
      span.industry-sector::before {
        content: 'BRANSCH';
        background-color: #a0865f;
      }
      span.country::before {
        content: 'LAND';
        background-color: #5f63a0;
      }
    }

    .react-autosuggest__container.align-right {
      .react-autosuggest__suggestions-container {
        right: 0;
      }
    }

    .selected-filter-criterias {
      margin-bottom: 3px;
      font-size: 15px;
      span.label {
        margin-right: 6px;
        font-size: 16px;
      }
      ul {
        display: inline;
        li {
          border-radius: 4px;
          padding: 0.2em 0.4em;
          background-color: #fff;
          display: inline-block;
          margin-right: 4px;
          margin-bottom: 4px;

          button {
            margin-left: 3px;
            vertical-align: -2px;
            border: none;
            background-color: transparent;
            .cross {
              width: 15px;
              height: 15px;
            }

            .cross:hover {
              background-color: #ccc;
            }
          }
        }
      }
    }

    .selected-filter-criterias.dark-blue {
      background-color: #08002f;
      padding: 0.4em 0.4em 0.1em 0.4em;
      color: #fff;
      font-weight: 700;

      ul {
        li {
          color: #000;

          span.fund::before {
            background-color: hsl(71deg 25% 40%);
          }
          span.company::before {
            background-color: hsl(299deg 25% 40%);
          }
          span.instrument::before {
            background-color: hsl(140deg 25% 40%);
          }
          span.industry-sector::before {
            background-color: hsl(36deg 25% 40%);
          }
          span.country::before {
            background-color: hsl(236deg 25% 40%);
          }

          .filter-type {
            font-weight: 500;
          }
        }
      }
    }

    .worldmap {
      margin-bottom: 8px;
    }

    .body {
      margin-bottom: 8px;
    }

    table {
      font-size: 12px;
      width: 100%;
      background-color: #fff;
      padding-left: 1px;
      padding-right: 1px;
      border-collapse: collapse;
      margin-bottom: 6px;
      td,
      th {
        border-bottom: 1px solid #ccc;
        padding: 0.4rem;
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
        height: 2.7rem;
      }
      .left {
        text-align: left;
      }
      .center {
        text-align: center;
      }
      .right {
        text-align: right;
      }
    }

    .table-footer {
      font-size: 15px;
      display: grid;
      justify-content: center;
      margin-bottom: 0.5rem;
      position: relative;
      min-height: 2.4rem;
      
      .no-link {
        color: #757575;
      }

      .page-text {
        position: absolute;
        max-width: calc((100vw - 208px)/2);
        overflow: hidden;
        white-space: nowrap;
      }
    }

    .byline {
      float: right;
      text-transform: uppercase;
    }

    .footer {
      font-size: 13px;
      color: #757575;
    }

    .disabled {
      color: #757575;
    }

    .paginate {
      margin-left: 0.5em;
      font-size: 14px;
      display: inline;
      margin-top: 0.15rem;
      text-align: center;

      svg {
        height: 1em;
        margin-right: 0.25em;
        cursor: pointer;

        path {
          fill: #3b3b3b;
        }
      }

      svg.chevron.right {
        margin-left: 0.25em;
      }

      svg.page {
        margin-left: 0.2em;
        margin-right: 0.2em;

        circle {
          fill: #dcc5c1;
        }
      }

      svg.page.active {
        circle {
          fill: #a7100c;
        }
      }

      .left {
        transform: rotate(180deg);
      }
    }

    rect.continent {
      fill: none;
      stroke: #ccc;
    }

    .groupings {
      margin: 4px 0 6px 0;
      display: flex;
      justify-content: center;
    }
`;
});
