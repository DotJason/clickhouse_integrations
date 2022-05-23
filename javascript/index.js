'use strict';


function draw(data) {
  console.log(data);

  const priceChart = new dc.RowChart('#price-chart');
  const countChart = new dc.RowChart('#count-chart');

  const ndx = crossfilter(data);
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
  dc.redrawAll();

  console.log("FINISHED DRAWING");
}


// Make a fetch request to the server to get the data json and then draw with it

fetch("/json")
.then((res) => res.json())
.then((data) => {
  draw(data);
})
