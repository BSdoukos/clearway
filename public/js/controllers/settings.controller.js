import SettingsView from '../views/settings.view.js';
import displayErrorMessage from '../utils/displayErrorMessage.js';

export default class SettingsController {
    constructor() {
        this.view = new SettingsView();
    }

    async requestProfilePhotoDeletion() {
        try {
            const response = await fetch(`profile/photo`, { method: 'DELETE' }).json;

            if (response.status !== 200) {
                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }
            }

        } catch (e) {
            displayErrorMessage(e);
        }
    }

    async submitProfilePhoto() {
        try {
            const photoFormData = this.view.getNewProfilePhotoFormData();

            const response = await fetch(`profile/photo`, {
                method: 'POST',
                body: photoFormData
            });

            if (response.status !== 200) {
                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }
            }

        } catch (e) {
            displayErrorMessage(e);
        }
    }

    async submitProfileChanges() {
        try {
            const form = $('#profileSettingsModal .modal__form');
            const fields = form.find('input:not([disabled])');

            this.view.validateProfileChanges();

            if ($('#userNewPhotoInput').get(0).files.length) {
                this.submitProfilePhoto();
            }

            const data = {};

            fields.each((i, field) => {
                if (field.value) {
                    data[field.name] = field.value;
                }
            });

            const response = await fetch(`profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.status !== 200) {
                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }
            }

            form.get(0).reset();
            $('#cancelProfileChangesBtn').trigger('click');
            this.view.updateProfileModal(data);

        } catch (e) {
            displayErrorMessage(e);
        }
    }

    async deleteUserTaskContext(trigger) {
        try {
            const contexts = $('.context-card')
                .get()
                .map((card) => card.innerText);

            if (contexts.length > 1) {
                const response = await fetch(`profile`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ taskContexts: contexts })
                });

                if (response.status !== 200) {
                    const data = await response.json();

                    if (data.error) {
                        throw new Error(data.error);
                    }
                }

            } else {
                throw new Error('You need to have at least one context for your tasks.')
            }

            this.view.deleteCard(trigger);

        } catch (e) {
            displayErrorMessage(e);
        }
    }

    async createUserTaskContext(trigger) {
        try {
            const insertionCard = this.view.appendContextInsertionCard();
            $(trigger).prop('disabled', true);

            $('html').on('click', async (e) => {
                if (insertionCard.html().indexOf(e.target.innerHTML) === -1) {
                    const newContext = insertionCard.find('input').val();
                    if (newContext) {
                        $('html').off('click');

                        const contexts = $('.context-card')
                            .get()
                            .map((card) => card.innerText)

                        contexts.push(newContext)

                        const response = await fetch(`profile`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ taskContexts: contexts })
                        });
            
                        if (response.status !== 200) {
                            const data = await response.json();
            
                            if (data.error) {
                                throw new Error(data.error);
                            }
                        }

                        this.view.insertContextCard(insertionCard, newContext);
                        $(trigger).prop('disabled', false);
                    }
                }
            });

        } catch (e) {
            displayErrorMessage(e);
        }
    }
}