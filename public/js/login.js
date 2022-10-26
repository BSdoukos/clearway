import displayErrorMessage from './utils/displayErrorMessage.js';

$('.toggle-form-button').on('click', function() {
    const currentFormContainer = $(this).closest('.form-container').fadeOut();
    currentFormContainer.siblings('.form-container').fadeIn();
});

$('#signUpContainer .form-container__form').on('submit', function(e) {
    e.preventDefault();

    const inputs = $(this).find('input').get();
    const emailPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;

    try {
        if (inputs.some(input => !input.value)) {
            throw new Error('All fields must be filled.');
        }

        if (!emailPattern.test($(this).find('[name="email"]').val().toLowerCase())) {
            throw new Error('The provided e-mail address is invalid.');
        }

        if ($(this).find('[name="password"]').val().length < 6) {
            throw new Error('Your password must have at least 6 characters.');
        }

        if ($(this).find('#signUpPasswordConfirmationInput').val() !== $(this).find('#signUpPasswordInput').val()) {
            throw new Error('The passwords do not equal.');
        }

        fetch('signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: $(this).find('[name="name"]').val(),
                email: $(this).find('[name="email"]').val(),
                password: $(this).find('[name="password"]').val()
            })
        })
        .then((response) => {
            if (response.status !== 200) {
                return response.json();
            } else {
                location.href = 'dashboard';
            }
        })
        .then((data) => {
            throw new Error(data.error);
        })
        .catch((e) => displayErrorMessage(e));

    } catch (e) {
        displayErrorMessage(e);
    }
});

$('#loginContainer .form-container__form').on('submit', function(e) { 
    e.preventDefault();

    try {
        fetch('login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: $(this).find('[name="email"]').val(),
                password: $(this).find('[name="password"]').val()
            })
        })
        .then((response) => {
            if (response.status !== 200) {
                return response.json();
            } else {
                location.href = 'dashboard';
            }
        })
        .then((data) => {
            throw new Error(data.error);
        })
        .catch((e) => displayErrorMessage(e));

    } catch (e) {
        displayErrorMessage(e);
    }
});