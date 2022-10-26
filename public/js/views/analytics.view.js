export default class AnalyticsView {
    constructor() { }

    displayDataInChart(chartName, data) {
        const chart = charts[chartName];
        
        stats[chartName] = data;

        if (Object.values(data).every((n) => n === 0) && chart.config._config.type === 'doughnut') {
            $(chart.canvas).parent().addClass('hidden').after(`
                <div class="empty-state-container">
                    <img src="../images/nostats.png" alt="" class="empty-state-container__img">
                    <p>No statistics available.</p>
                </div>
            `);
        } else {
            $(chart.canvas).parent().removeClass('hidden').next('.empty-state-container').remove();
        }

        if (chartName === 'workHistory') {
            chart.data.labels = data.map((period) => period.periodStart);
            chart.data.datasets[0].data = data.map((period) => period.tasksCompleted);
        } else {
            chart.data.datasets[0].data = Object.values(data);
        }

        chart.update();
    }
}