# Car catalog CSV contract

`data/cars.csv` contains the current catalog and is the editable source of truth for future catalog updates. The website currently loads the generated JavaScript array from `data/cars.js` so it continues to work from both `file://` and a web server.

## File format

- UTF-8 with BOM, comma-delimited, with a header row and CRLF line endings.
- Follow standard CSV quoting: fields containing commas, quotes, or line breaks are quoted, and an embedded quote is doubled.
- Use one data row per car. Preserve row order when regenerating the runtime data.
- Header names are the exact, case-sensitive JSON keys. Do not rename, omit, or add columns without updating this contract.
- All current columns are required. A blank text cell means an empty string; blank numeric or array cells are invalid in the canonical CSV. Use `[]` for an array with no entries. JSON `null` is not currently used.

## Columns and JSON types

| CSV column | JSON type | Conversion |
| --- | --- | --- |
| `id` | string | Copy text as-is |
| `name` | string | Copy text as-is |
| `manufacturer` | string | Copy text as-is |
| `model` | string | Copy text as-is |
| `category` | string | Copy text as-is |
| `categories` | array of strings | Parse the cell as a JSON array |
| `image` | string | Copy text as-is |
| `imageAlt` | string | Copy text as-is |
| `monthlyPayment` | integer | Parse a base-10 integer; do not include currency signs or thousands separators |
| `year` | integer | Parse a base-10 integer |
| `drivetrain` | string | Copy text as-is |
| `shortDescription` | string | Copy text as-is |
| `details` | array of strings | Parse the cell as a JSON array |

Array cells use compact JSON text. The CSV parser returns the logical cell text shown on the first line below from the CSV field shown on the second line. The CSV writer adds outer quotes and doubles the JSON quotes. Parse each whole cell as JSON; never split arrays on commas or another delimiter.

```text
["עירוני","משפחתי"]
"[""עירוני"",""משפחתי""]"
```

## CSV to website data

For each CSV record, create one object with the header names as keys. Copy string cells unchanged, parse `monthlyPayment` and `year` as integers, and JSON-parse `categories` and `details` as arrays of strings. Preserve Hebrew text, punctuation, URLs, array order, and row order. Do not infer values or silently drop empty cells.

Serialize the resulting objects as a JSON array and write it into `data/cars.js` in the current runtime form:

```js
window.CardooCars = [
  { "id": "...", "categories": ["..."], "monthlyPayment": 1234 }
];
```

Keep every column in each object, including fields not currently displayed by the catalog UI. When adding a JSON field, add a matching CSV column and document its type and conversion before updating the catalog.

## Existing source note

The latest supplied file had two rows with the same `id`, `JAECCO-5`. This catalog preserves both IDs and rows. Use unique IDs for future entries, and resolve the duplicate explicitly before treating `id` as a unique key; do not silently change it during CSV conversion. Whitespace in scalar values, including trailing spaces, is preserved.

The supplied file also had malformed `categories` array cells and blank `details` cells. During import, the missing separators between `"8/7 מקומות"` and `"מרווחת"` were repaired, and plain-text category cells such as `משפחתי חסכוני` were split into their whitespace-separated category labels. Blank `details` cells became `[]`; blank `shortDescription` and `imageAlt` cells remain empty strings. The canonical `data/cars.csv` stores every array as valid compact JSON text after these repairs.
