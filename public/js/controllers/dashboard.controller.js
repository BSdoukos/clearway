import DashboardView from '../views/dashboard.view.js';
import displayErrorMessage from '../utils/displayErrorMessage.js';
import Item from '../models/Item.js';

export default class DashboardController {
    constructor() {
        this.view = new DashboardView();
    }

    async displayTasksByContext(context) {
        try {
            const tasks = await Item.get('task', { context });
            this.view.displayItems('task', tasks, false, true);

        } catch (e) {
            displayErrorMessage(e);
        }
    }

    async prepareEdition(card) {
        try {
            const itemInfo = this.view.prepareEditionModal(card);
            const items = await Item.get(itemInfo.type, { _id: itemInfo.id, activeOnly: false });

            if (itemInfo.type === 'task' && items[0].runEvery) {
                $(itemInfo.modal).find('[for="deadline"], [name="deadline"]').remove();
            }    

            if (items[0].deadline) {
                const deadline = new Date(items[0].deadline);
                items[0].deadline = `${deadline.toLocaleDateString('en-CA')}T${deadline.getHours()}:${deadline.getMinutes()}`;
            }

            this.view.fillEditionFields(itemInfo.modal, items[0]);

        } catch (e) {
            displayErrorMessage(e);
        }
    }

    async updateItem(itemType, editionModal) {
        try {
            debugger
            const newData = this.view.getFormData(editionModal.find('form'), '.modal__input')
            const itemID = $(editionModal).attr('data-item-id');
            const updatedItem = await Item.requestUpdate(itemType, itemID, newData);

            this.view.updateCard(itemType, updatedItem);

            if (newData?.context !== $('#taskContextSelector').val()) {
                this.view.deleteCard($(`.card[data-item-id="${itemID}"]`));
            }

        } catch (e) {
            displayErrorMessage(e);
        }
    }

    async deleteItem(card) {
        try {
            const $card = $(card);
            const itemId = $card.data('item-id');
            const itemType = $card.closest('.card-container').data('item') || 'event';

            if ($card.data('recurrence') === 'one time') {
                this.deleteAllItemOccurrences(itemId, itemType, card);
            } else {
                window.recurringCardToDelete = card;
                $('#specifyDeletionTypeModal').data('item', itemType).data('item-id', itemId);
                openModal('#specifyDeletionTypeModal');
            }

        } catch (e) {
            displayErrorMessage(e);
        }
    }

    deleteRecurringItem(trigger) {
        const modal = $(trigger).closest('.modal');
        const deletionType = modal.find('input[name="deletiontype"]:checked').val();
        const itemID = modal.data('item-id');
    
        if (deletionType === 'one') {
            this.deleteItemOccurrence(itemID, modal.data('item'), window.recurringCardToDelete);
        } else if (deletionType === 'all') {
            this.deleteAllItemOccurrences(itemID, modal.data('item'), window.recurringCardToDelete);
        }
    }

    async deleteAllItemOccurrences(id, type, card) {
        await Item.requestDeletion(type, id, {
            quantity: 'all',
        });

        const cards = $(`[data-item-id="${card.data('item-id')}"]`);

        cards.each((i, el) => this.view.deleteCard($(el)));
    }

    async deleteItemOccurrence(id, type, card) {
        await Item.requestDeletion(type, id, {
            quantity: 'one',
            date: card.closest('.card-container').prev('.modal__subtitle').text() || new Date().toDateString()
        });

        this.view.deleteCard(card);
    }

    async markItemAsCompleted(card) {
        try {
            const itemId = $(card).data('item-id');
            const itemType = $(card).closest('.card-container').data('item') || 'event';
            const upcomingEventDate = card.closest('.card-container').prev('.modal__subtitle').text()

            if (upcomingEventDate && upcomingEventDate !== new Date().toDateString()) {
                throw new Error(`You cannot mark an upcoming event as completed.`);
            }

            await Item.requestUpdate(itemType, itemId, { complete: new Date().toDateString() });

            this.view.deleteCard(card);

        } catch (e) {
            displayErrorMessage(e);
        }
    }

    async searchAndDisplay(str) {
        try {
            ['task', 'event', 'project'].forEach(async itemType => {
                const items = await Item.get(itemType, { search: str });
                const itemSectionTitle = $(`.card-container[data-item="${itemType}"]`).closest('.main-section').find('.main-section__title');
    
                this.view.displayItems(itemType, items, !!str.trim(), true); 

                itemSectionTitle.text(itemSectionTitle.text().replace(/\d+( found)?/, items.length + (str.trim() ? ' found' : '')));
            });

            const taskContextSelector = $('#taskContextSelector');

            taskContextSelector.css('visibility', str === '' ? 'initial' : 'hidden');
            if (str === '') {
                this.displayTasksByContext(taskContextSelector.val());
            }

        } catch (e) {
            displayErrorMessage(e);
        }
    }

    async displayUpcomingEvents(timeRange) {
        try {
            const events = await Item.get('event', { upcoming: true, date: new URLSearchParams(window.location.search).get('date'), timeRange: timeRange || 2592000000 });
            if (events.length) {
                this.view.displayUpcomingEventCards(events);
            }

        } catch (e) {
            displayErrorMessage(e);
        }
    }

    async startWorkAssistant(trigger) {
        try {
            const parameters = this.view.getFormData($(trigger).closest('.modal').find('form'));
            const rankedTasks = await Item.get('task', { rank: true, ...parameters });

            if (!rankedTasks.length) {
                throw new Error('You don\'t have tasks.')
            }

            window.waTasks = rankedTasks;
            this.view.setUpWorkAssistantView();

        } catch (e) {
            displayErrorMessage(e);
        }
    }

    async switchWATask(complete = false) {
        if (complete) {
            await Item.requestUpdate('task', $('#workAssistantFlowModal .card').data('item-id'), { complete: new Date().toDateString() });
        }
        waTasks.shift();
        this.view.switchWACard();
    }

    async changeViewDate(e) {
        e.preventDefault();
        location.href = 'dashboard?date=' + $(e.target).closest('form').find('[name="viewdate"]').val(); 
    }
}