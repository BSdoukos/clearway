export default function clearForm(form, fieldSelector) {
    $(form).find(fieldSelector).val('');
}