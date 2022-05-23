'use strict';


const ndx = crossfilter();

function initial_draw() {
  const priceChart = new dc.RowChart('#price-chart');
  const countChart = new dc.RowChart('#count-chart');

  const all = ndx.groupAll();

  const countyDimension = ndx.dimension(d => d.county);
  const countyGroup = countyDimension.group().reduce(
    (p, v) => {
      p.total_price += v.price;
      p.count += v.count;
      p.avg_price = Math.round(p.total_price / p.count);
      return p;
    },
    (p, v) => {
      p.total_price -= v.price;
      p.count -= v.count;
      p.avg_price = Math.round(p.total_price / p.count);
      return p;
    },
    () => ({
      total_price: 0,
      avg_price: 0,
      count: 0
    })
  );

  priceChart
    .height(4000)
    .margins({top: 20, left: 20, right: 20, bottom: 20})
    .dimension(countyDimension)
    .group(countyGroup)
    .valueAccessor(p => p.value.avg_price)
    .ordering((p) => { return -p.value.avg_price; })
    .label(p => p.key)
    .title(p => p.value.avg_price)
    .elasticX(true);

  countChart
    .height(4000)
    .margins({top: 20, left: 20, right: 20, bottom: 20})
    .dimension(countyDimension)
    .group(countyGroup)
    .valueAccessor(p => p.value.count)
    .ordering((p) => { return -p.value.count; })
    .label(p => p.key)
    .title(p => p.value.count)
    .elasticX(true);

  dc.renderAll();

  console.log("Initial drawing complete");
}

function update_data(data) {
  ndx.remove();
  ndx.add(data);
  dc.redrawAll();

  console.log("Data update complete");
}


var start_date_element = document.getElementById("start_date");
var end_date_element = document.getElementById("end_date");

function on_filter_update() {
  var start_date = start_date_element.value;
  var end_date = end_date_element.value;

  if (!start_date || !end_date) {
    console.log("Data update aborted, empty date value!");

    return;
  }

  const params = new URLSearchParams({
    start_date: start_date,
    end_date: end_date
  });

  d3.json("/json?" + params.toString()).then(data => { update_data(data) })
}

window.addEventListener('load', () => { initial_draw(); on_filter_update(); }, false)

start_date_element.addEventListener('change', on_filter_update);
end_date_element.addEventListener('change', on_filter_update);
