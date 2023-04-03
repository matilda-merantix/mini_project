import { map } from './map.js'

const { x, y, width, height } = d3
  .selectAll('#graphic')
  .node()
  .getBoundingClientRect()

let data
let geoData
let circlesClassVariable
let circlesHistogramClassVariable

const scrollVis = onClick => {
  var margin = { top: 10, left: 10, bottom: 10, right: 10 }
  var lastIndex = -1
  var activeIndex = 0
  var svg = null
  var g = null

  var activateFunctions = []
  var updateFunctions = []

  var chart = function (selection) {
    selection.each(function (rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll('svg').data([data])
      var svgE = svg.enter().append('svg')
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE)
      svg
        .attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom)
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

      setupVis()
      setupSections()
    })
  }

  const setupVis = () => {
    circlesClassVariable = new summaryCircles(svg, {
      data,
      margin: { top: 40, bottom: 10, left: 40, right: 10 },
      onClick: onClick
    })
    circlesHistogramClassVariable = new histogramCircles(svg, {
      data: data.filter(d => d.year >= 2007),
      margin: { top: 40, bottom: 200, left:200, right:20 },
      xAxisLabel: 'UK Festival',
      yAxisLabel: 'Number of Headlining Acts' ,
      onClick: onClick
    })
  }

  var setupSections = function () {
    activateFunctions[3] = splitCircles
    activateFunctions[2] = showSummary
    activateFunctions[1] = showHistogram
    activateFunctions[0] = showTitle
    for (var i = 0; i < 5; i++) {
      updateFunctions[i] = function () {}
    }
  }

  function showTitle () {
    svg.selectAll('.histogram').transition().duration(1000).attr('opacity', 0)
  }

  function showSummary () {
    svg.selectAll('circle').transition().attr('opacity', 1)
    svg.selectAll('.histogram').transition().duration(1000).attr('opacity', 0)
    circlesClassVariable.props.data = data
    circlesClassVariable.showCircles()
  }

  function splitCircles () {
    circlesClassVariable.props.data = data.filter(d => d.gender == 'f' | d.gender == 'mixed')
    circlesClassVariable.showCircles()
  }

  const showHistogram = () => {
    svg.selectAll('circle').transition().attr('opacity', 0)
    circlesHistogramClassVariable.showCircles();
    }

  function showMap () {
    svg.call(map, {
      countries: geoData,
      locations: data,
      margin: { top: 10, bottom: 10, left: 10, right: 10 }
    })
    svg.selectAll('#map').transition(1000).duration(600).attr('opacity', 1)
    svg.selectAll('#histogram').transition(1000).duration(600).attr('opacity', 0)
  }

  chart.activate = function (index) {
    activeIndex = index
    var sign = activeIndex - lastIndex < 0 ? -1 : 1
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign)
    scrolledSections.forEach(function (i) {
      activateFunctions[i]()
    })
    lastIndex = activeIndex
  }

  chart.update = function (index, progress) {
    updateFunctions[index](progress)
  }

  return chart
}

export const display = (dataArgument, geoDataArgument, onClick) => {
  data = dataArgument
  geoData = geoDataArgument

  var plot = scrollVis(onClick)
  d3.select('#vis').datum(data).call(plot, { data: data })

  var scroll = scroller().container(d3.select('#graphic'))

  scroll(d3.selectAll('.step'))

  scroll.on('active', function (index) {
    plot.activate(index)
    d3.selectAll('.step')
    .transition().duration(1000)
    .style('opacity', function (d, i) { return i === index ? 1 : 0.1; });
  })

  scroll.on('progress', function (index, progress) {
    plot.update(index, progress)
  })
}
