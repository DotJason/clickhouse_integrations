'use strict';


const ndx = crossfilter();

function initial_draw() {
  const priceChart = new dc.RowChart('#price-chart');
  const countChart = new dc.RowChart('#count-chart');

  const all = ndx.groupAll();

  const countyDimension = ndx.dimension(d => d.county);
  const countyGroup = countyDimension.group().reduce(
    (p, v) => {
      p.total_price += Number(v.price);
      p.count += Number(v.count);
      p.avg_price = Math.round(p.total_price / p.count);
      return p;
    },
    (p, v) => {
      p.total_price -= Number(v.price);
      p.count -= Number(v.count);
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
var type_element = document.getElementById("type");
var duration_element = document.getElementById("duration");

function on_filter_update() {
  var start_date = start_date_element.value;
  var end_date = end_date_element.value;
  var type = type_element.value;
  var duration = duration_element.value;

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
      date >= {start_date:Date}
      AND date <= {end_date:Date}
      ${type ? "AND type IN {type:String}" : ""}
      ${duration ? "AND duration IN {duration:String}" : ""}
    GROUP BY
      county
    ORDER BY
      county
  `

  const params = new URLSearchParams({
    add_http_cors_header: 1,
    user: 'play',
    default_format: 'JSON',
    param_start_date: start_date,
    param_end_date: end_date,
    param_type: type,
    param_duration: duration,
    query: query_string,
  });

  fetch("https://play.clickhouse.com/?" + params.toString())
    .then(response => response.json())
    .then(data => update_data(data.data));
}

window.addEventListener('load', () => { initial_draw(); on_filter_update(); }, false)

start_date_element.addEventListener('change', on_filter_update);
end_date_element.addEventListener('change', on_filter_update);
type_element.addEventListener('change', on_filter_update);
duration_element.addEventListener('change', on_filter_update);
