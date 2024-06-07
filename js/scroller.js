// NOT MY CODE //
/**
 * @description Sets up an event listener to monitor scrolling of a selection of
 * elements and positions those sections relative to the top of the first section,
 * calling the `position` function when scrolling occurs. It also dispatches events
 * 'active' and 'progress' with appropriate parameters based on the position of the
 * user.
 * 
 * @returns { any } an instance of a scrollable container that monitors scrolling and
 * updates the position of sections based on user input.
 */
function scroller() {
  var container = d3.select('body');
  // event dispatcher
  var dispatch = d3.dispatch('active', 'progress');

  // d3 selection of all the
  // text sections that will
  // be scrolled through
  var sections = null;

  // array that will hold the
  // y coordinate of each section
  // that is scrolled through
  var sectionPositions = [];
  var currentIndex = -1;
  // y coordinate of
  var containerStart = 0;

  /**
   * @description Creates event listeners on the window to detect both scroll and resize
   * events, calling the `position` and `resize` functions accordingly. It also sets
   * up a timer to automatically call `position` once on load and stops it after execution.
   * 
   * @param { array } els - elements that will be used to implement the scroller
   * functionality, and is used to initialize the scroll position and resize the scroller
   * accordingly.
   */
  function scroll(els) {
    sections = els;

    // when window is scrolled call
    // position. When it is resized
    // call resize.
    d3.select(window)
      .on('scroll.scroller', position)
      .on('resize.scroller', resize);

    // manually call resize
    // initially to setup
    // scroller.
    resize();

    // hack to get position
    // to be called once for
    // the scroll position on
    // load.
    // @v4 timer no longer stops if you
    // return true at the end of the callback
    // function - so here we stop it explicitly.
    /**
     * @description Positions the mouse cursor and stops a timer.
     */
    var timer = d3.timer(function () {
      position();
      timer.stop();
    });
  }

  /**
   * @description Calculates the position of each section relative to the top of the
   * first section, then stores these positions in an array. Finally, it sets a variable
   * `containerStart` to the top of the container node plus the window's page Y offset.
   */
  function resize() {
    // sectionPositions will be each sections
    // starting position relative to the top
    // of the first section.
    sectionPositions = [];
    var startPos;
    sections.each(function (d, i) {
      var top = this.getBoundingClientRect().top;
      if (i === 0) {
        startPos = top;
      }
      sectionPositions.push(top - startPos);
    });
    containerStart = container.node().getBoundingClientRect().top + window.pageYOffset;
  }

  /**
   * @description Calculates the index of the currently displayed section based on its
   * position and updates the active and progress event listeners.
   */
  function position() {
    var pos = window.pageYOffset - 10 - containerStart;
    var sectionIndex = d3.bisect(sectionPositions, pos);
    sectionIndex = Math.min(sections.size() - 1, sectionIndex);

    if (currentIndex !== sectionIndex) {
      // @v4 you now `.call` the dispatch callback
      dispatch.call('active', this, sectionIndex);
      currentIndex = sectionIndex;
    }

    var prevIndex = Math.max(sectionIndex - 1, 0);
    var prevTop = sectionPositions[prevIndex];
    var progress = (pos - prevTop) / (sectionPositions[sectionIndex] - prevTop);
    // @v4 you now `.call` the dispatch callback
    dispatch.call('progress', this, currentIndex, progress);
  }

  /**
   * container - get/set the parent element
   * of the sections. Useful for if the
   * scrolling doesn't start at the very top
   * of the page.
   *
   * @param value - the new container value
   */
  scroll.container = function (value) {
    if (arguments.length === 0) {
      return container;
    }
    container = value;
    return scroll;
  };

  // @v4 There is now no d3.rebind, so this implements
  // a .on method to pass in a callback to the dispatcher.
  scroll.on = function (action, callback) {
    dispatch.on(action, callback);
  };

  return scroll;
}
