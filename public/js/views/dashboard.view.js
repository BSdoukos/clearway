import Card from './components/Card.js';
import getFormData from '../utils/getFormData.js';

export default class DashboardView {
    constructor() {
        this.getFormData = getFormData;
    }

    setUpEmptyContainer(cardType, cont) {
        const container = cont || $('.card-container[data-item="' + type + '"]');

        switch (cardType) {
            case 'task':
                container.html('<img src="../images/notasks.png" alt="" class="main-section__empty-state-image"><p>You have no tasks in this context.</p>');
                break;

            case 'event':
                container.html('<img src="../images/noevents.png" alt="" class="main-section__empty-state-image"><p>You have no events today.</p>');
                break;

            case 'project':
                container.html('<img src="../images/noprojects.png" alt="" class="main-section__empty-state-image"><p>You have no unfinished projects.</p>');
                break;

            case 'upcomingEvent':
                container.html('<div style="text-align: center; margin-bottom: 1.25rem;"><img src="../images/noevents.png" alt="" class="main-section__empty-state-image"></div>');
                break;
        }
    }

    displayItems(type, items, areSearchResults, clearContainer, containerSelector, cardsEditability = 'editable') {
        const container = $(containerSelector || '.card-container[data-item="' + type + '"]');

        if (clearContainer || !container.find('.card').length) {
            container.html('');
        }

        if (items.length) {
            const cards = container.find(type === 'event' ? '.card-wrapper' : '.card').get();

            items.forEach(item => {
                const card = new Card(type, item, cardsEditability);
                card.build();
                cards.push(card.node);
            });

            if (type === 'event') {
                cards.sort((a, b) => {
                    const timePatt = /<p class="card__text">(\d{2}:\d{2})<\/p>/;

                    return parseInt(timePatt.exec(a.innerHTML)[1].replace(':')) - parseInt(timePatt.exec(b.innerHTML)[1].replace(':'));
                });
            }

            cards.forEach((card) => container.append(card));

        } else if (areSearchResults) {
            container.html('<img src="../images/no' + type + 's.png" alt="" class="main-section__empty-state-image"><p>There aren\'t items corresponding to your search.</p>');
        } else {
            this.setUpEmptyContainer(type, container);
        }
    }

    prepareEditionModal(card) {
        const itemType = $(card).closest('.card-container').data('item') || 'event';
        const modal = $(`#${itemType}EditionModal`);

        modal.attr('data-item-id', $(card).attr('data-item-id')).parent('.modal-overlay');

        return { modal: modal.get(0), type: itemType, id: modal.attr('data-item-id') }
    }

    fillEditionFields(modal, data) {
        $(modal).find('.modal__input').get().forEach(input => input.value = data[input.name]);
    }

    updateCard(itemType, data) {
        const card = new Card(itemType, data);
        card.build();

        const outdatedCard = $(`.card-container [data-item-id="${data._id}"]`);

        if (itemType === 'event') {
            outdatedCard.parent().replaceWith(card.node);
        } else {
            outdatedCard.replaceWith(card.node);
        }
    }

    updateItemQuantityView(itemType, difference) {
        $(`#${itemType}sSection`).find('.main-section__title').text((i, currentText) => {
            return `${itemType.replace(/^./, (str) => str.toUpperCase())}s (${parseInt(/\d+/.exec(currentText)[0]) + (difference)})`;
        });

        $('#startSection .main-section__title').text((i, currentText) => {
            currentText = currentText.replace('no', '0');
            const number = parseInt(/\d+/.exec(currentText)?.[0]) + difference || 'no';

            if (number !== 1) {
                return `You've got ${number} tasks/events today`;
            }
            return `You've got ${number} task/event today`;
        });
    }

    deleteCard(card) {
        const closestModalContainer = card.closest('.modal__main-container');
        const container = closestModalContainer.length ? closestModalContainer : card.closest('.card-container');
        const parentWrapper = card.closest('.event-container') || card.closest('.card-wrapper');
        const cardID = card.data('item-id');

        card = parentWrapper.length ? parentWrapper : card;

        if (card.closest('#calendarModal').length) {
            const activeEventCard = $('.card-container[data-item="event"]').find(`[data-item-id="${cardID}"]`);
            if (activeEventCard.length) {
                this.deleteCard(activeEventCard);
                this.updateItemQuantityView(container.data('item') || 'upcomingEvent', -1);
            }
        } else {
            this.updateItemQuantityView(container.data('item') || 'upcomingEvent', -1);
        }

        card.remove();

        if (!container.find('.card').length) {
            this.setUpEmptyContainer(container.data('item') || 'upcomingEvent', container);
        }
    }

    limitTimeNumberInput(input) {
        input.value = Math.round(input.value + '.0');

        if (input.name === 'minutes' && parseInt(input.value) > 59) {
            input.value = '59';
        }
    }

    blockPastDatesInput() {
        const today = new Date().toISOString().split('T')[0];

        $('input[type="date"]')
            .attr('min', today)
            .attr('value', today);
    }

    displayUpcomingEventCards(events) {
        const mainContainer = $('#calendarModal .modal__main-container');

        mainContainer.html('');

        events.forEach((event) => {
            if (mainContainer.html().indexOf(event.formattedDate) < 0) {
                mainContainer.append(`
                    <div class="event-container">
                        <h3 class="modal__subtitle subtitle">${event.formattedDate}</h3>
                        <div class="card-container"></div>
                    </div>
                `);
            }

            const card = new Card('event', event.event);
            card.build();

            $(card.node).find('.edit-item-button').data('toggles-modal', `#${card.item}EditionModal`);

            mainContainer.find(`.modal__subtitle:contains(${event.formattedDate})`).next().append(card.node);
        });
    }

    setUpWorkAssistantView() {
        openModal('#workAssistantFlowModal');
        $('#workAssistantFlowModal').find('button[style="display: none;"]').css('display', 'initial');
        $('#waStopButton').removeClass('modal__btn--active');
        this.displayItems('task', [waTasks.map((task) => task.data)[0]], false, true, '#workAssistantFlowModal .card-container', 'not editable');
    }

    switchWACard() {
        const modal = $('#workAssistantFlowModal');
        const container = modal.find('.card-container');

        modal.find('.card').remove();

        if (!waTasks[0]) {
            modal.find('.modal__text').text('You haven\'t got any more tasks for now. Congratulations!');
            modal.find('#waCompleteTaskButton, #waSkipTaskButton').css('display', 'none');
            modal.find('#waStopButton').addClass('modal__btn--active');
        }

        const nextTaskCard = new Card('task', waTasks[0].data, 'uneditable');
        nextTaskCard.build();
        container.append(nextTaskCard.node);
    }
}