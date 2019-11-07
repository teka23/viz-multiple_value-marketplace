project_name: "viz-multiple_value-marketplace"

constant: VIS_LABEL {
  value: "Multiple Value"
  export: override_optional
}

constant: VIS_ID {
  value: "multiple_value-marketplace"
  export:  override_optional
}

visualization: {
  id: "@{VIS_ID}"
  url: "https://raw.githubusercontent.com/looker/viz-grouped_card-marketplace/master/grouped_card.js"
  label: "@{VIS_LABEL}"
}
