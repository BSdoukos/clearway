import getFormData from "../utils/getFormData.js";
import Item from "../models/Item.js";
import DashboardView from "../views/dashboard.view.js";
import displayErrorMessage from "../utils/displayErrorMessage.js";
import clearForm from "../utils/clearForm.js";

export default class ItemCreationModalController {
    constructor() { }

    async createItem(creationModal) {
        try {
            const form = $(creationModal).find('form');
            const data = getFormData(form, '.modal__input');
            const itemType = creationModal.data('item');
            const item = await new Item(creationModal.data('item'), data).requestCreation();

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (location.pathname === '/dashboard' && (itemType !== 'event' || !(new Date(item.date) > today))) {
                const dView = new DashboardView();
                dView.updateItemQuantityView(itemType, 1);

                if ([item?.context, 'all'].includes($('#taskContextSelector').val())) {
                    dView.displayItems(itemType, [item]);
                }
            }

            clearForm(form, '.input modal__input:not(select)');

        } catch (e) {
            displayErrorMessage(e);
        }
    }
}