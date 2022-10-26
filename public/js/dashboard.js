import DashboardController from './controllers/dashboard.controller.js';
import Card from './views/components/Card.js';

const controller = new DashboardController();

controller.view.blockPastDatesInput();

$('#taskContextSelector').on('change', function () {
    controller.displayTasksByContext(this.value);
});

$(document).on('click', '.card__btn--corner', function () {
    Card.flip($(this).closest('.card'));
});

$(document).on('click', '.edit-item-button', function () {
    controller.prepareEdition($(this).closest('.card'));
});

$('.update-item-button').on('click', function () {
    controller.updateItem($(this).data('item'), $(this).closest('.modal'));
});

$(document).on('click', '.delete-item-button', function () {
    controller.deleteItem($(this).closest('.card'));
});

$(document).on('click', '.complete-item-button', function () {
    controller.markItemAsCompleted($(this).closest('.card'));
});

$(document).on('click', '.manage-project-button', function () {
    location.href = '/projecting?project=' + $(this).closest('.card').data('item-id');
});

$('input[name="minutes"], input[name="hours"]').on('input', function () {
    controller.view.limitTimeNumberInput(this);
});

$('.search-line__input').on('input', function () {
    controller.searchAndDisplay(this.value);
});

$('.search-form').on('submit', function (e) {
    e.preventDefault();
    controller.searchAndDisplay($(this).find('.search-line__input').val());
});

$('[data-toggles-modal="#calendarModal"]').on('click', function () {
    controller.displayUpcomingEvents();
});

$('#eventTimeRangeSelector').on('change', function () {
    controller.displayUpcomingEvents(this.value);
});

$('.card .edit-item-button').each(function (i, el) {
    $(el).data('toggles-modal', `#${$(this).closest('.card-container').data('item')}EditionModal`);
});

$('#deleteRecurringItemBtn').on('click', function () {
    controller.deleteRecurringItem(this);
});

$('#startWorkAssistantButton').on('click', function () {
    controller.startWorkAssistant(this);
});

$('#waCompleteTaskButton').on('click', function () {
    controller.switchWATask(true);
});

$('#waSkipTaskButton').on('click', function () {
    controller.switchWATask();
});

$('#changeViewDateBtn').on('click', function(e) {
    controller.changeViewDate(e);
});