export default class SettingsView {
    constructor() { }

    getNewProfilePhotoFormData() {
        const file = $('#userNewPhotoInput').get(0).files[0];
    
        const formData = new FormData();
        formData.append('profile-photo', file);

        return formData;
    }

    displayProfilePhotoPreview() {
        const file = $('#userNewPhotoInput').get(0).files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            $('#profilePhotoPreview')
                .attr('src', e.target.result)
                .removeClass('hidden');
        }
        reader.readAsDataURL(file);
    }

    validateProfileChanges() {
        const form = $('#profileSettingsModal .modal__form');
        const emailPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
        const emailVal = form.find('[name="email"]').val();
        const passwordVal = form.find('[name="password"]').val();

        if (emailVal && !emailPattern.test(emailVal.toLowerCase())) {
            throw new Error('The provided e-mail address is invalid.');
        }
        if (passwordVal && passwordVal.length < 6) {
            throw new Error('Your password must have at least 6 characters.');
        }
    }

    updateProfileModal(data) {
        $('#profilePhoto').get(0).src += '#' + new Date().getTime();
        $('#profilePhotoPreview').addClass('hidden').get(0).src = '';

        const form = $('#profileSettingsModal .modal__form');
        
        form.find('[name="currentemail"]').val(data.email);
        form.find('[name="currentname"]').val(data.name);
    }

    deleteCard(trigger) {
        $(trigger).closest('.context-card').remove();
    }

    appendContextInsertionCard() {
        let insertionCard = `<div class="settings-card card shadow" id="contextInsertionCard"><input type="text" class="input"></div>`;
        const lastCard = $('.context-card:last');
        
        lastCard.after(insertionCard);

        return $('#contextInsertionCard');
    }

    insertContextCard(insertionCard, newContext) {
        insertionCard.replaceWith(`
            <div class="settings-card card shadow context-card">
                ${newContext}
                <button class="settings-card__button delete-context-btn btn--icononly">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        class="bi bi-x" viewBox="0 0 16 16">
                        <path
                            d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                            role="button" />
                    </svg>
                </button>
            </div>`
        );
    }
}