# #!/bin/bash

# INPUT_FILE="$1"
# OUTPUT_FILE="$2"

# if [ -z "$INPUT_FILE" ] || [ -z "$OUTPUT_FILE" ]; then
#   echo "Usage: ./format-country-json.sh input.json output.json"
#   exit 1
# fi

# jq '
#   map({
#     name: .name.common,
#     cca3: .cca3,
#     flag: .flag,
#     currencies: .currencies,
#     languages: .languages
#   })
# ' "$INPUT_FILE" > "$OUTPUT_FILE"

# echo "Formatted JSON saved to $OUTPUT_FILE"

#!/bin/bash

INPUT_FILE="$1"
OUTPUT_FILE="$2"

if [ -z "$INPUT_FILE" ] || [ -z "$OUTPUT_FILE" ]; then
  echo "Usage: ./format-country-json.sh input.json output.json"
  exit 1
fi

jq '
  # Handle both array and object input
  (if type == "array" then . else [.] end) | 
  map({
    name: (
      if .name | type == "object" then
        .name.common
      else
        .name
      end
    ),
    cca3: .cca3,
    flag: .flag,
    currencies: (
      if .currencies and (.currencies | type == "object") and (.currencies | length > 0) then
        # Get the first currency
        (.currencies | to_entries | first).value | {
          symbol: .symbol
        }
      else
        null
      end
    ),
  })
' "$INPUT_FILE" > "$OUTPUT_FILE"

echo "Formatted JSON saved to $OUTPUT_FILE"