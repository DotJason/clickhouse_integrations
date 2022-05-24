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
  console.log("Updating with data:", data);

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

  if (start_date < start_date_element.min || start_date > start_date_element.max) {
    console.log("Data update aborted, start date out of bounds!");

    return;
  }

  if (end_date < end_date_element.min || end_date > end_date_element.max) {
    console.log("Data update aborted, end date out of bounds!");

    return;
  }

  var query_string = `
    SELECT
      county AS county,
      count() AS count,
      sum(price) AS price
    FROM uk_price_paid
    WHERE
      date >= '${start_date}'
      AND date <= '${end_date}'
    GROUP BY
      county
    ORDER BY
      county
  `

  const params = new URLSearchParams({
    add_http_cors_header: 1,
    default_format: 'JSON',
    query: query_string
  });

  fetch("http://localhost:8123/?" + params.toString())
    .then(response => response.json())
    .then(data => update_data(data.data));
}

window.addEventListener('load', () => { initial_draw(); on_filter_update(); }, false)

start_date_element.addEventListener('change', on_filter_update);
end_date_element.addEventListener('change', on_filter_update);
