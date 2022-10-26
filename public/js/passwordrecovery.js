import displayErrorMessage from './utils/displayErrorMessage.js';

$('#sendRecoveryMessageBtn').on('click', async function() {
    try {
        const response = await fetch('passwordrecovery', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },              
            body: JSON.stringify({ email: $('#recoveryEmailInput').val() })
        });
    
        if (response.status !== 200) {
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
        } else {
            $('.main-content').html('<p class="text">The e-mail was sent! If the message is not in your inbox, please check your spambox or junk folder. You can now leave this page.</p>')
        }

    } catch (e) {
        displayErrorMessage(e);
    }
});