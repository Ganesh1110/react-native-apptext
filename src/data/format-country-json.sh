#!/bin/bash

INPUT_FILE="$1"
OUTPUT_FILE="$2"

if [ -z "$INPUT_FILE" ] || [ -z "$OUTPUT_FILE" ]; then
  echo "Usage: ./format-country-json.sh input.json output.json"
  exit 1
fi

jq '
  map({
    name: .name.common,
    cca3: .cca3,
    flag: .flag,
    currencies: .currencies,
    languages: .languages
  })
' "$INPUT_FILE" > "$OUTPUT_FILE"

echo "Formatted JSON saved to $OUTPUT_FILE"
