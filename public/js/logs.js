import Card from './views/components/Card.js';
import LogsController from './controllers/logs.controller.js';

const controller = new LogsController();

$(document).on('click', '.card__btn--corner', function () {
    Card.flip($(this).closest('.card'));
});

$('.uncomplete-item-button').on('click', function () {
    controller.markItemAsUncompleted($(this).closest('.card'));
});