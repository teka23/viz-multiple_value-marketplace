import React from 'react'
import ReactDOM from 'react-dom'
import isEqual from 'lodash/isEqual'
import MultipleValue from './multiple_value'
import {formatType, displayData} from '../common'
import SSF from "ssf";

const baseOptions = {
  font_size_main: {
    label: "Font Size",
    type: 'string',
    section: 'Style',
    default: "",
    order: 0,
  }
}

let currentOptions = {}
let currentConfig = {}

looker.plugins.visualizations.add({
  // Id and Label are legacy properties that no longer have any function besides documenting
  // what the visualization used to have. The properties are now set via the manifest
  // form within the admin/visualizations page of Looker
  id: "multiple_value",
  label: "Multiple Value",
  options: baseOptions,
  // Set up the initial state of the visualization
  create: function(element, config) {
    // Render to the target element
    this.chart = ReactDOM.render(
      <MultipleValue
        config={{}}
        data={[]}
      />,
      element
    );

  },
  // Render in response to the data or settings changing
  updateAsync: function(data, element, config, queryResponse, details, done) {
    // Clear any errors from previous updates
    this.clearErrors();

    const measures = [].concat(
      queryResponse.fields.dimensions,
      queryResponse.fields.measures,
      queryResponse.fields.table_calculations
    )

    // Throw some errors and exit if the shape of the data isn't what this chart needs
    if (measures.length == 0) {
      this.addError({title: "No Measures", message: "This chart requires measures"});
      return;
    }

    if (queryResponse.fields.pivots.length) {
      this.addError({title: "Pivoting not allowed", message: "This visualization does not allow pivoting"});
      return;
    }
    
    if (measures.length > 10) {
      this.addError({title: "Maximum number of data points", message: "This visualization does not allow more than 10 data points to be selected"});
      return;
    }

    let firstRow = data[0];

    const dataPoints = measures.map(measure => {
      return ({
        name: measure.name,
        label: measure.label_short || measure.label,
        value: firstRow[measure.name].value,
        link: firstRow[measure.name].links,
        valueFormat: config[`value_format`],
        formattedValue: config[`value_format_${measure.name}`] === "" || config[`value_format_${measure.name}`] === undefined ? LookerCharts.Utils.textForCell(firstRow[measure.name]) : SSF.format(config[`value_format_${measure.name}`], firstRow[measure.name].value)
      })
    });

    const options = Object.assign({}, baseOptions)
    
    dataPoints.forEach((dataPoint, index) => {
      //Style -- apply to all
      if (config[`show_comparison_${dataPoint.name}`] !== true) {
        options[`style_${dataPoint.name}`] = {
          type: `string`,
          label: `${dataPoint.label} - Color`,
          display: `color`,
          default: '#3A4245',
          section: 'Style',
          order: 10 * index + 3,
        }
        options[`show_title_${dataPoint.name}`] = {
          type: 'boolean',
          label: `${dataPoint.label} - Show Title`,
          default: true,
          section: 'Style',
          order: 10 * index + 2,
        }
        options[`title_overrride_${dataPoint.name}`] = {
          type: 'string',
          label: `${dataPoint.label} - Title`,
          section: 'Style',
          placeholder: dataPoint.label,
          order: 10 * index + 4,
        }
        options[`title_placement_${dataPoint.name}`] = {
          type: 'string',
          label: `${dataPoint.label} - Title Placement`,
          section: 'Style',
          display: 'select',
          values: [
            {'Above number': 'above'},
            {'Below number': 'below'},
          ],
          default: 'above',
          order: 10 * index + 5,
        }
        options[`value_format_${dataPoint.name}`] = {
          type: 'string',
          label: `${dataPoint.label} - Value Format`,
          section: 'Style',
          default: "",
          order: 10 * index + 6
        }
      }
      // Comparison - all data points other than the first
      if (index >= 1) {
        options[`show_comparison_${dataPoint.name}`] = {
          type: 'boolean',
          label: `${dataPoint.label} - Show as comparison`,
          section: 'Comparison',
          default: false,
          order: 10 * index,
        }

        if (config[`show_comparison_${dataPoint.name}`] === true) {
          options[`comparison_style_${dataPoint.name}`] = {
            type: 'string',
            display: 'radio',
            label: `${dataPoint.label} - Style`,
            values: [
              {'Show as Value': 'value'},
              {'Show as Percentage Change': 'percentage_change'},
              {'Calculate Progress': 'calculate_progress'},
              {'Calculate Progress (with Percentage)': 'calculate_progress_perc'},
            ],
            section: 'Comparison',
            default: 'value',
            order: 10 * index + 1,
          }
          options[`comparison_show_label_${dataPoint.name}`] = {
            type: 'boolean',
            label: `${dataPoint.label} - Show Label`,
            section: 'Comparison',
            default: true,
            order: 10 * index + 2,
          }
          if (config[`comparison_show_label_${dataPoint.name}`]) {
            options[`comparison_label_${dataPoint.name}`] = {
              type: 'string',
              label: `${dataPoint.label} - Label`,
              placeholder: dataPoint.label,
              section: 'Comparison',
              order: 10 * index + 3,
            }
            options[`comparison_label_placement_${dataPoint.name}`] = {
              type: 'string',
              label: `${dataPoint.label} - Label Placement`,
              display: 'select',
              values: [
                {'Above': 'above'},
                {'Below': 'below'},
                {'Left': 'left'},
                {'Right': 'right'},
              ],
              default: 'below',
              section: 'Comparison',
              order: 10 * index + 4,
            }
          }
        }
      }
    })
  
    if (
      !isEqual(currentOptions, options) ||
      !isEqual(currentConfig, config)
    ) {
      this.trigger('registerOptions', options)
      currentOptions = Object.assign({}, options)
      currentConfig = Object.assign({}, config)
    }

    let valuesToComparisonsMap = {}
    let lastDataPointIndex = -1
    const fullValues = dataPoints.filter((dataPoint, index) => {
      if (config[`show_comparison_${dataPoint.name}`] !== true) {
        lastDataPointIndex++
        return true
      } else {
        valuesToComparisonsMap[lastDataPointIndex] = index
      }
      return false
    }).map((fullValue, index) => {
      const comparisonIndex = valuesToComparisonsMap[index]
      if (comparisonIndex) {
        fullValue.comparison = dataPoints[comparisonIndex]
      }
      return fullValue;
    })

    // Finally update the state with our new data
    this.chart = ReactDOM.render(
      <MultipleValue
        config={config}
        data={fullValues}
      />,
      element
    );
    // We are done rendering! Let Looker know.
    done()
  }
});
