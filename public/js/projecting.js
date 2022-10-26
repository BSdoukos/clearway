import ProjectingController from './controllers/projecting.controller.js'

const controller = new ProjectingController();

$(document).on('click', '.edit-project-btn', function(e) {
    controller.prepareProjectEdition(this);
});

$('.save-project-button').on('click', function() {
    controller.updateProject(this);
});

$('.delete-project-btn').on('click', function() {
    controller.deleteProject(this);
});