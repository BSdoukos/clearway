import ItemCreationModalController from '../controllers/itemCreationModal.controller.js';

const controller = new ItemCreationModalController();

export default function modals() {
    window.window.modalStack = [];

    function openModal(eventOrSelector) {
        if (typeof eventOrSelector !== 'string') {
            eventOrSelector.stopPropagation();
            var modal = $(`.modal${$(this).data('toggles-modal')}`);
        } else {
            var modal = $(eventOrSelector);
        }

        $('body').addClass('no-scroll');

        if (window.modalStack.length) {
            window.modalStack.slice(-1)[0].fadeOut('fast');
        } else {
            $('html').on('click', (e) => {
                if (!$(e.target).closest('.modal').length) {
                    window.modalStack.pop().fadeOut('fast');
                    $('body').removeClass('no-scroll');

                    if (!window.modalStack.length) {
                        $('html').off('click');
                    } else {
                        window.modalStack.slice(-1)[0].fadeIn('fast');
                    }
                }
            });
        }
        window.modalStack.push(modal.parent('.modal-overlay').fadeIn('fast'));
    }

    window.openModal = openModal;

    $(document).on('click', '.modal-toggler', function (e) {
        if ($(this).data('toggles-modal')) {
            openModal.call(this, e);
        }
    });

    $(document).on('click', '.close-modal-button', function () {
        if (window.modalStack.length === 1) {
            $('html').off('click');
        } else {
            window.modalStack.slice(-2)[0].fadeIn('fast');
        }

        window.modalStack.pop().fadeOut('fast');
        $('body').removeClass('no-scroll');
    });

    $('.modal__btn, .modal .card__btn').on('click', (e) => e.preventDefault());

    // Item adding modals

    $('#newItemModal .card__btn').on('click', function () {
        $(this).parent().find('.card__btn--active').removeClass('card__btn--active');
        $(this).addClass('card__btn--active');
    });

    $('#newItemModal .continue-button').on('click', function (e) {
        $(this).data('toggles-modal', `[data-item="${$(this).parents('.modal').find('.card__btn--active').data('item')}"]`);
        openModal.call(this, e);
    });

    $('.modal .create-card-button').on('click', async function () {
        $('.modal-overlay').fadeOut('fast');
        await controller.createItem($(this).closest('.modal'));
    });


    $('.modal[data-item="task"] [name="recurrence"]').on('change', function () {
        const modal = $(this).closest('.modal');
        const deadlineInput = modal.find('[name="deadline"]');
        const deadlineInputLabel = modal.find('[for="deadline"]');

        if (this.value !== 'one time') {
            deadlineInput.val('');
            deadlineInput.hide();
            deadlineInputLabel.hide();
        } else {
            deadlineInput.show();
            deadlineInputLabel.show();
        }
    });
}