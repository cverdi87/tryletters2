import pkg from "../package.json";

// Single source of truth for the app version.
// Bump the "version" field in package.json on each release and the newspaper
// masthead updates automatically everywhere it appears.
export const APP_VERSION =
  pkg.version && pkg.version !== "0.0.0" ? pkg.version : "1.0.0";

const ROMAN = ["0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX"];
const toRoman = (n) => ROMAN[n] || String(n);

// Masthead numbering: Vol = major version (Roman numeral), No = minor version.
// e.g. version "2.4.1" -> "Vol. II — No. 4"
const [major = "1", minor = "0"] = APP_VERSION.split(".");
export const MASTHEAD_LABEL = `Vol. ${toRoman(parseInt(major, 10) || 0)} — No. ${parseInt(minor, 10) || 0}`;
