import Item from '../models/Item.js';
import displayErrorMessage from '../utils/displayErrorMessage.js';
import LogsView from '../views/logs.view.js';

export default class LogsController {
    constructor() {
        this.view = new LogsView();
    }

    async markItemAsUncompleted(card) {
        try {
            const id = card.data('item-id');
            const type = card.closest('.card-container').data('item-type');
            const data = await Item.get(type, { id, activeOnly: false });

            await Item.requestUpdate(type, id, { completed: data[0].completed.filter((date) => date !== card.find('.completion-date').text()) });

            this.view.removeCard(card);

            } catch (e) {
                displayErrorMessage(e);
            }
        }
}