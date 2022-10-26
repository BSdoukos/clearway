import displayErrorMessage from './utils/displayErrorMessage.js';

$('#resetPasswordBtn').on('click', async function (e) {
    try {
        e.preventDefault();

        const password = $('.pass-reset-form [name="password"]').val();
        const passwordConf = $('.pass-reset-form [name="passwordconfirmation"]').val();

        if (!password || !passwordConf) {
            throw new Error('All fields must be filled.')
        }
        if (password.length < 6) {
            throw new Error('Your password must have at least 6 characters.')
        }
        if (password !== passwordConf) {
            throw new Error('The passwords do not equal.')
        }

        const response = await fetch('passwordreset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: new URLSearchParams(location.search).get('token'),
                password
            })
        });

        if (response.status !== 200) {
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }
        } else {
            location.href = '/login';
        }

    } catch (e) {
        displayErrorMessage(e);
    }
});