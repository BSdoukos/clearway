import SettingsController from "./controllers/settings.controller.js";

const controller = new SettingsController();

$('#chooseProfilePhotoBtn').on('click', function() {
    $('#userNewPhotoInput').trigger('click');
});

$('#userNewPhotoInput').on('change', function() {
    controller.view.displayProfilePhotoPreview();
});

$('#submitProfileChangesBtn').on('click', function() {
    controller.submitProfileChanges();
});

$(document).on('click', '.delete-context-btn', function() {
    controller.deleteUserTaskContext(this);
});

$('#createContextBtn').on('click', function() {
    controller.createUserTaskContext(this);
});