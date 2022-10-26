export default function menu() {
    $('#menuButton').on('click', () => $('.sidebar').toggleClass('sidebar--open'));
    $(document).on('click', (e) => {
        if (!$(e.target).parents('.sidebar, #menuButton, .modal').get().length && !$(e.target).is('.sidebar, #menuButton')) {
            $('.sidebar').removeClass('sidebar--open');
        }
    });
}