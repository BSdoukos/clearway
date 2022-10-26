import AnalyticsController from "./controllers/analytics.controller.js";

const controller = new AnalyticsController();

$('.chart-container__dropdown').on('change', function() {
    controller.updateChart(this.id.split('ChartSelector')[0], this.value);
});