import ProjectingView from "../views/projecting.view.js";
import Item from "../models/Item.js";
import displayErrorMessage from "../utils/displayErrorMessage.js";
import getFormData from "../utils/getFormData.js";

export default class ProjectingController {
    constructor() {
        this.view = new ProjectingView();
    }

    prepareProjectEdition(trigger) {
        try {
            // "projects" is a global variable created with Handlebars
            const projectData = projects.find((p) => p._id === $(trigger).closest('.card').data('item-id'));
            this.view.displayProjectInfo(projectData);

        } catch (e) {
            displayErrorMessage(e);
        }
    }

    async updateProject(trigger) {
        const id = $(trigger).closest('.modal').data('item-id');
        const updatedProject = await Item.requestUpdate('project', id, getFormData($('#projectEditionForm').get(0)));

        projects.forEach((p, i, arr) => {
            if (p._id === id) {
                arr[i] = updatedProject;
            }
        });

        this.view.updateCard(updatedProject);
    }

    async deleteProject(trigger) {
        try {
            const id = $(trigger).closest('.modal').data('item-id');
            await Item.requestDeletion('project', id);
            this.view.removeCard(id);

        } catch (e) {
            displayErrorMessage(e);
        }
    }
}