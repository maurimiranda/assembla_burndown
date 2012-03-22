function buildChart() {
  chart = new Highcharts.Chart({
    chart: {
      renderTo: 'chart',
      type: 'line'
    },
    title: {
      text: 'Burndown Chart'
    },
    xAxis: {
      type: "datetime",
      dateTimeLabelFormats: {
        day: '%b %e'   
      },
    },
    yAxis: {
      title: {
        text: $("#chart_unit").val()
      },
      min: 0,
      startOnTick: false
    }
  });
  buildData();
}

function buildData() {
  if($("#chart_unit").val() == "Tickets")
    total = $(data).find("ticket").length;
  else
    total = getEstimation($(data));
  
  current_date = start_date.clone().subtract('days', 1);
  ideal_step = total / end_date.diff(current_date, 'days');
  ideal_data = new Array([current_date.valueOf(), total]);
  real_data = new Array ([current_date.valueOf(), total]);
  estimated_data = new Array();
  real_value = total;
  ideal_value = total;
  
  while(current_date <= end_date) {
    if(current_date <= moment()) {
      if($("#chart_unit").val() == "Tickets")
        step = $(data).find("completed-date:contains(" + current_date.format("YYYY-MM-DD") + ")").parent().length;
      else
        step = getEstimation($(data).find("completed-date:contains(" + current_date.format("YYYY-MM-DD") + ")").parent());
      real_value -= step;
      real_data.push([current_date.valueOf(), real_value]);
      estimated_data.push([current_date.valueOf(), null]);
    } else {
      step = Math.round((total - real_value) / current_date.diff(start_date, 'days'));
      real_value -= step;
      real_data.push([current_date.valueOf(), null]);
      estimated_data.push([current_date.valueOf(), real_value]);
    }
    ideal_data.push([current_date.valueOf(), Math.round(ideal_value)]);
    ideal_value = ideal_value - ideal_step;
    current_date = current_date.add('days', 1);
  }
  
  chart.addSeries({
    data: ideal_data,
    name: "Ideal"
  });

  chart.addSeries({
    data: estimated_data,
    name: "Estimated",
    dashStyle: "Dot"
  });
  
  chart.addSeries({
    data: real_data,
    name: "Real"
  });
    
}

function getAPIData(url, callback) {
  $.ajax({
    url: url,
    dataType: "xml",
    beforeSend: function(req) {
      req.setRequestHeader("Accept", "application/xml");
    },
    success: callback
  });
}

function getEstimation(tickets) {
  var result = 0;
  $(tickets).find("estimate").each(function() {
    switch(this.textContent) {
      case "Small":
        result += 1;
        break;
      case "Medium":
        result += 3;
        break;
      case "Large":
        result += 9;
        break;
    }    
  });
  return result;
}