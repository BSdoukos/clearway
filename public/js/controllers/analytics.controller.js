import AnalyticsView from '../views/analytics.view.js';
import displayErrorMessage from '../utils/displayErrorMessage.js';

export default class AnalyticsController {
    constructor() {
        this.view = new AnalyticsView();
    }

    async updateChart(chartName, filter) {
        try {
            const response = await fetch(`/analytics?${chartName}=${filter}`);
            const data = await response.json();
            this.view.displayDataInChart(chartName, data);

        } catch(e) {
            displayErrorMessage(e);
        }
    }
}