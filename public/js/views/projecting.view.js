import Card from "./components/Card.js";

export default class ProjectingView {
    constructor() { }

    displayProjectInfo(data) {
        const modal = $('#projectManagementModal');

        modal.attr('data-item-id', data._id);
        modal.find('[name="name"]').val(data.name);
        modal.find('[name="description"]').val(data.description);
        
        $('#projectTaskNumber').text(data.tasks.length);
        
        ['task', 'event'].forEach((itemType) => {
            if (data[itemType + 's']?.length) {
                const container = modal.find(`.project-${itemType + 's'}-container`);
                container.html('');
                data[itemType + 's'].forEach((item) => {
                    const card = new Card(itemType, item, 'uneditable');
                    card.build();
                    container.append(card.node);
                });
            }
        });
    }

    updateCard(data) {
        const card = new Card('project', data);
        card.build();

        const cardNode = $(card.node);

        cardNode.find('.back-side').remove();
        cardNode.find('.card__btn--corner').addClass('modal-toggler edit-project-btn').attr('data-toggles-modal', '#projectManagementModal');

        $(`.card-container [data-item-id="${data._id}"]`).replaceWith(cardNode);
    }

    removeCard(id) {
        const card = $('.card-container .card[data-item-id="' + id + '"]');
        const container = card.closest('.card-container');

        card.remove();

        if (container.find('.card').length === 0) {
            container.html(`
                <div class="empty-state-container">
                    <img src="../images/noprojects.png" alt="" class="main-section__empty-state-image">
                    <p>You have no projects in progress.</p>
                </div>
            `);
        }
    }
}