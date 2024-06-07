
const { x, y, width, height } = d3
  .selectAll('#graphic')
  .node()
  .getBoundingClientRect()

let data
let colourScale
let circlesView
let histogramView

/**
 * @description Is a D3-based charting library that creates an interactive visualization
 * for festival data. It takes in a selection of SVG elements and modifies them based
 * on user scrolling behavior.
 * 
 * @param { function. } onClick - click event handler for when the user clicks on any
 * element in the chart, which is passed as an argument to the `onClick` function
 * within the chart function.
 * 
 * 		- `onClick`: a function that takes a `d3 selection` as its argument. This function
 * will be called whenever a user clicks on the visualization.
 * 		- `data`: an array of data points, where each point represents a festival year
 * and has properties such as `year`, `headliner`, `gender`, and `venue`.
 * 		- `formatID`: a function that formats the IDs of the headlining acts for display
 * in the visualization.
 * 		- `colourScale`: a function that maps the data values to colors for the circles.
 * 		- `onHoverOn`: a function that is called when a user hovers over a circle, showing
 * additional information about the headlining act.
 * 		- `onHoverOff`: a function that is called when a user hovers off a circle, hiding
 * the additional information.
 * 		- `svg`: a d3 selection of the SVG element containing the visualization.
 * 		- `margin`: an object with properties `top`, `bottom`, `left`, and `right` that
 * define the margins for the visualization.
 * 		- `width` and `height`: the width and height of the SVG element in pixels, respectively.
 * 
 * 	These properties are used throughout the `scrollVis` function to create and update
 * the visualization based on user interactions.
 * 
 * @param { event handler. } onHoverOn - function to be called when the user hovers
 * over an element on the graph, specifically the circles or histogram elements.
 * 
 * 		- `colourScale`: an object that scales the colours of the circles based on their
 * size
 * 		- `formatID`: a function for formatting the ID of the circles
 * 
 * 	The `onHoverOn` function is called whenever the user hovers over a circle, and
 * it takes two arguments: the current hovered circle and a reference to the original
 * data. The function can be used to perform any action desired on hover, such as
 * updating the colour or style of the circle, adding a tooltip, or altering the
 * layout of the view.
 * 
 * @param { unspecified function. } onHoverOff - 2nd part of an event that happens
 * when the user moves their mouse away from a circle or histogram, and it triggers
 * the execution of a predefined function.
 * 
 * 		- ` colourScale`: This is an object that specifies the color scale for the hover
 * states of the circles. It has `x` and `y` properties, where `x` represents the red
 * channel and `y` represents the green channel. The values of these properties
 * correspond to the RGB values of the colors used for the hover states.
 * 		- `onHoverOff`: This is a function that is called when the mouse hovers over an
 * element. It takes no arguments. Its purpose is to handle the case where the user
 * hovers over an element after hovering off another element.
 * 		- `formatID`: This is a function that formats the IDs of the elements. Its purpose
 * is to allow for customized formatting of the IDs when displaying the data.
 * 
 * @param { string } formatID - ID of the currently selected section, which is used
 * to apply the appropriate formatting and styling to each view when scrolled to.
 * 
 * @returns { object } acharting object that provides various visualizations of
 * festival data based on user scrolling actions.
 */
/**
 * @description Creates an SVG container, selects an existing selection or enters new
 * data using the `d3.select()` method and merges them into a single selection.
 * 
 * @param { array } selection - element or elements that contain the data to be
 * visualized, and it is passed through the `each()` method to iterate over the data
 * within each element.
 */
const scrollVis = (onClick, onHoverOn, onHoverOff, formatID) => {
  var margin = { top: 10, left: 10, bottom: 10, right: 10 }
  var lastIndex = -1
  var activeIndex = 0
  var svg = null

/**
 * @description Establishes functions for showing a title, histogram, summary, and
 * filtering circles within the scope of an active scenario.
 */
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

  /**
   * @description Initializes two graphical views, `circlesView` and `histogramView`,
   * using the provided data and configuration options. The `circlesView` displays
   * circle-based visualizations of the data, while the `histogramView` displays a
   * histogram of the data for a specific time range.
   */
  const setupVis = () => {

    // initialize the circles views
    circlesView = new circles(svg, {
      data,
      margin: { top: 40, bottom: 10, left: 40, right: 10 },
      onClick: onClick,
      colourScale: colourScale,
      onHoverOn: onHoverOn,
      onHoverOff: onHoverOff,
      formatID: formatID,
    })

    // initialize the histogram views
    histogramView = new histogram(svg, {
      data: data.filter(d => d.year >= 2007),
      margin: { top: 40, bottom: 30, left:200, right:20 },
      xAxisLabel: 'UK Festival',
      yAxisLabel: 'Number of Headlining Acts' ,
      onClick: onClick,
      colourScale: colourScale,
      onHoverOn: onHoverOn,
      onHoverOff: onHoverOff,
      formatID: formatID,
    })
  }

  // on scroll through each view the activate function will be called in order
  var setupSections = function () {
    activateFunctions[0] = showTitle
    activateFunctions[1] = showHistogram
    activateFunctions[2] = showSummary
    activateFunctions[3] = filterCircles
    for (var i = 0; i < 4; i++) {
      updateFunctions[i] = function () {}
    }
  }

  /**
   * @description Displays none when the histogram view is scrolled back up to the title
   * after a duration of 1000 milliseconds.
   */
  function showTitle () {
    // On scroll back up to title, hide the histogram view
    svg.selectAll('.histogram').transition().duration(1000).attr('display', 'none')
  }

  /**
   * @description 1) hides the histogram view and displays the circle elements, and 2)
   * updates the circle class with all the data for the summary screen.
   */
  function showSummary () {
    // 1. Show the circle elements, hide the histogram view
    svg.selectAll('circle').transition('add circles').attr('display', 'inline-block')
    svg.selectAll('.histogram').transition('hide histogram').duration(1000).attr('display', 'none')
    // 2. update the circle class with all the data for the summary screen
    circlesView.props.data = data
    circlesView.updateVis()
  }

  /**
   * @description Updates the `circlesView` props with data for only female and mixed
   * headliners by filtering through the `data` array using the `|` operator.
   */
  function filterCircles () {
    // update the circle class with just the data for female and mixed headliners
    circlesView.props.data = data.filter(d => d.gender == 'f' | d.gender == 'mixed')
    circlesView.updateVis()
  }

  /**
   * @description Hides circles and shows a histogram using `updateVis()`.
   */
  const showHistogram = () => {
    // hide the circles and then show the histogram
    svg.selectAll('circle').transition('hide_circles').attr('display', 'none')
    histogramView.updateVis();
    }

  // deals with active index for scrolling
  chart.activate = function (index) {
    activeIndex = index
    var sign = activeIndex - lastIndex < 0 ? -1 : 1
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign)
    scrolledSections.forEach(function (i) {
      activateFunctions[i]()
    })
    lastIndex = activeIndex
  }

  return chart
}

// external function to be called by index
/**
 * @description Creates a scrollable graphic view using D3.js and initiates a scroller
 * component on the graphic section. It defines what happens when a scroll event is
 * detected, such as activating the relevant step and fading in/out the steps based
 * on their index.
 * 
 * @param { object } scrollingViews - data visualization component that displays the
 * graphic section and is used to call the scroller function with the appropriate data.
 * 
 * @param { object } dataArgument - data to be visualized and plotted using the
 * `scrollVis()` function, which is passed as an argument to the `scrollingViews.datum()`
 * method to initiate the scroller functionality.
 * 
 * @param { unknown type, as it is not specified or revealed in the provided code
 * snippet. } _colourScale - 0 to 1 scale of color values that are applied to the
 * graphic elements when they come into view or go out of view, allowing for subtle
 * color variations as the user scrolls.
 * 
 * 		- `_colourScale`: A scale object that defines the colours for the plot. It has
 * the following properties:
 * 		+ `range`: The range of values that the scale can take. For example, if it is a
 * linear scale, this would be `[minValue, maxValue]`.
 * 		+ `colors`: An array of colors that the scale uses to represent its range. Each
 * color is represented by an object with the following properties:
 * 			- `value`: The value of the color in the scale's range.
 * 			- `alpha`: The transparency of the color (optional).
 * 		- `dataArgument`: The data argument passed to the function. It could be a simple
 * value or an array/object with multiple values.
 * 		- `onClick`, `onHoverOn`, and `onHoverOff`: Events that trigger actions on the
 * plot, such as highlighting or hover effects.
 * 		- `formatID`: A string that represents the format of the data in the plot. This
 * is used to customize the display of the data.
 * 
 * @param { Function. } onClick - function to be executed when the graphical
 * representation is clicked, passed as a reference to the original function.
 * 
 * 		- `onClick`: The function to be called when the graphic element is clicked. It
 * takes no arguments.
 * 		- `onHoverOn`: The function to be called when the graphic element is hovered
 * over. It takes no arguments.
 * 		- `onHoverOff`: The function to be called when the graphic element is hovered
 * off. It takes no arguments.
 * 		- `formatID`: A function that formats the ID of the data point being hovered
 * on/off. It takes a single argument, the ID, and returns a formatted string.
 * 
 * @param { functions. } onHoverOn - function to be called when an element on the
 * graph is hovered over.
 * 
 * 		- `onHoverOn`: An event listener for when the user hovers over a step on the
 * graphic section. The function to be called is `onHoverOn`.
 * 		- `formatID`: A format function for formatting the ID of the hovered element.
 * 
 * @param { anonymous function or undefined, given its declaration within the
 * `scrollingViews` variable. } onHoverOff - function to be called when the mouse
 * cursor is moved away from the graphic component after being hovered over it.
 * 
 * 		- `d3.selectAll('.step')`: This refers to the set of elements in the graphic
 * section that have the class `.step`.
 * 		- `.transition()`: This is a method used to create a transition animation when
 * the user hovers over or off an element. It takes several arguments, including the
 * duration of the animation (in milliseconds) and the timing function (a function
 * that determines how the animation progresses over time).
 * 		- `.style('opacity', ...)`: This sets the opacity of the elements in the set
 * `d3.selectAll('.step')` to a value specified as a function of the index of the
 * element and a fixed base value. When the user hovers over an element, the opacity
 * of that element is set to 1, while when they hover off it, the opacity is set to
 * 0.1.
 * 
 * @param { string } formatID - ID of the graphic component to be scrolled, and is
 * used to identify the corresponding data point in the data argument passed to the
 * `scrollVis()` function.
 */
export const display = (scrollingViews, dataArgument, _colourScale, onClick, onHoverOn, onHoverOff, formatID) => {
  data = dataArgument
  colourScale = _colourScale
  
  // initiate scroller function
  var plot = scrollVis(onClick, onHoverOn, onHoverOff, formatID)
  scrollingViews.datum(data).call(plot, { data: data })

  // initialize scroller component on graphic section
  var scroll = scroller().container(d3.select('#graphic'))
  scroll(d3.selectAll('.step'))

  // define what happens when a scroll event is detected
  scroll.on('active', function (index) {
    plot.activate(index)
    d3.selectAll('.step')
    .transition().duration(1000)
    .style('opacity', (d, i) => i === index ? 1 : 0.1 );
  })


}
