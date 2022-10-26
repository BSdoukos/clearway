export default class Item {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }

    static async get(type, query) {
        let URL = '/' + type + 's';

        Object.entries(query).forEach((parameter, i) => {
            if (typeof parameter[1] !== undefined) {
                URL += `${i ? '&' : '?'}${parameter[0]}=${parameter[1].toString().toLowerCase()}`;
            }
        });

        const response = await fetch(URL);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data[type + 's'];
    }

    static async requestDeletion(type, id, settings = { quantity: 'all' }) {
        let response;
        if (settings.quantity === 'all') {
            response = await fetch(`/${type}s`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id: id })
            });

        } else if (settings.quantity === 'one') {
            response = await fetch(`/${type}s`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    _id: id,
                    deleteOccurrence: settings.date
                })
            });
        }

        if (response.status !== 200) {
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }
        }
    }

    static async requestUpdate(type, id, data) {
        data._id = id;
        const response = await fetch(`/${type}s`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();

        if (responseData.error) {
            throw new Error(data.error);
        }

        return data;
    }

    async requestCreation() {
        const response = await fetch(`/${this.type}s`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.data)
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data;
    }
}