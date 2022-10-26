export default function getFormData(form, fieldSelector) {
    const fields = $(form).find(fieldSelector || 'input, select, textarea').get();
    const data = {};

    if (fields.some(input => input.value === '' && input.required)) {
        throw new Error('Fill all the required fields.')
    }

    fields.forEach(field => {
        data[field.name] = field.value;
    });

    return data;
}