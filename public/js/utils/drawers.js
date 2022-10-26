export default function drawers() {
    $('.drawer__toggle').on('click', function() {
        $(this).closest('.drawer').toggleClass('open');
    });
}