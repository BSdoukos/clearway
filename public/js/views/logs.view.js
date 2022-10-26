export default class ProjectingView {
    constructor() { }

    removeCard(card) {
        const container = card.closest('.card-container');

        card.remove();

        if (container.find('.card').length === 0) {
            container.html(`
                <div class="empty-state-container">
                    <img src="../images/noprojects.png" alt="" class="main-section__empty-state-image">
                    <p>There are no logs to show.</p>
                </div>
            `);
        }
    }
}