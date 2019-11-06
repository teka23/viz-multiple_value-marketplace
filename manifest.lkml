project_name: "viz-grouped_card-marketplace"

constant: VIS_LABEL {
  value: "Grouped Card"
  export: override_optional
}

constant: VIS_ID {
  value: "grouped_card-marketplace"
  export:  override_optional
}

visualization: {
  id: "@{VIS_ID}"
  url: "https://raw.githubusercontent.com/looker/viz-grouped_card-marketplace/master/grouped_card.js"
  label: "@{VIS_LABEL}"
}
