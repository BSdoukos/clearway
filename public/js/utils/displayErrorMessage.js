export default function displayErrorMessage(e) {
    console.error(e);
    $('.error-alert').text(e.message).fadeIn().delay(4000).fadeOut();
}