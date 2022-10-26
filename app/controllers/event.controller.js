const Event = require('../models/Event.js')
const generateDate = require('../helpers/generateDate.js');
const getNextItemOccurence = require('../helpers/getNextItemOccurence.js');
const Email = require('../helpers/Email.js')
const { ObjectId } = require('mongodb');

class EventController {
    constructor() { }

    async createEvent(req, res) {
        try {
            const convergentEvent = await Event.findOne({ date: generateDate(req.body.date), time: req.body.time, owner: req.user._id });
            if (convergentEvent) {
                throw new Error('There already is an event scheduled for that date and time.')
            }

            req.body.owner = ObjectId(req.user._id);
            req.body.date = generateDate(req.body.date);
    
            switch (req.body.recurrence) {
                case 'weekly':
                    req.body.runEvery = req.body.date.getDay() + 1;
                    break;

                case 'monthly':
                    req.body.runEvery = req.body.date.getDate();
                    break;

                case 'yearly':
                    req.body.runEvery = req.body.date.getDate() + '-' + (req.body.date.getMonth + 1);
                    break;

                default:
                    break;
            }

            const event = new Event(req.body);
            await event.save();

            if (req.user.notifyBeforeEvents) {
                const email = new Email(
                    {
                        email: req.user.email,
                        name: req.user.name.split(' ')[0]
                    },
                    `Don't forget your event on ${event.date.toDateString().slice(4, 10)}!`,
                    `We're remembering you of your event "${event.name}", scheduled for ${event.date.toDateString()} at ${event.time}. The event's going to happen at ${event.address}, as you pointed.`
                );

                const emailSendingDate = new Date(event.date);
                emailSendingDate.setHours(parseInt(event.time.slice(0, 2)) - 16);
                emailSendingDate.setMinutes(parseInt(event.time.slice(-2)))

                email.schedule(emailSendingDate);
            }

            res.status(201).send(event);

        } catch (e) {
            res.status(400).send({ error: e.message });
        }
    }

    async getEvents(req, res) {
        try {
            const date = req.query.date ? generateDate(req.query.date) : new Date();
            date.setHours(0, 0, 0, 0);

            if (req.query.upcoming) {
                return await this.getUpcomingEvents(req, date);
            }

            delete req.query.date;

            const match = req.query.activeOnly === 'false' ? {} : {
                completed: { $nin: date.toDateString() },
                deleted: { $nin: date.toDateString() },
                $or: [
                    {
                        date,
                    },
                    {
                        date: { $lt: date },
                        recurrence: 'daily'
                    },
                    {
                        date: { $lt: date },
                        runEvery: date.getDay() + 1,
                        recurrence: 'weekly'
                    },
                    {
                        date: { $lt: date },
                        runEvery: date.getDate(),
                        recurrence: 'monthly'
                    },
                    {
                        date: { $lt: date },
                        runEvery: date.getDate() + '-' + (date.getMonth() + 1),
                        recurrence: 'yearly'
                    },
                ]
            }

            if (req.query.search) {
                match.name = { $regex: req.query.search.replace(/[$&+,:;=?@#|'<>.^*()%!-]/g, '\\$&'), $options: 'i' }
            } else {
                Object.entries(req.query).forEach(entry => match[entry[0]] = entry[1]);
            }

            await req.user.populate({
                path: 'events',
                match
            });

            req.user.events.sort((a, b) => {
                return parseInt(a.time.replace(':')) - parseInt(b.time.replace(':'));
            });

            return req.user.events;

        } catch (e) {
            return { error: e.message };
        }
    }

    async updateEvent(req, res) {
        try {
            const item = req.body._id;

            if (req.body.complete) {
                res.status(200).send(await Event.updateOne({ _id: item }, { $push: { completed: req.body.complete } }));
            } else if (req.body.deleteOccurrence) {
                res.status(200).send(await Event.updateOne({ _id: item }, { $push: { deleted: req.body.deleteOccurrence } }));
            } else {
                delete req.body._id;
                res.status(200).send(await Event.findOneAndUpdate({ _id: item }, req.body, { new: true }));
            }

        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    async deleteEvent(req, res) {
        try {
            await Event.deleteOne({ _id: req.body._id });
            res.sendStatus(200);

        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    async getUpcomingEvents(req, date) {
        const limit = new Date();
        limit.setTime(date.getTime() + parseInt(req.query.timeRange));

        const match = {
            date: {
                $gte: date,
                $lt: limit
            },
            $or: [
                {
                    completed: [],
                },
                {
                    recurrence: { $ne: 'one time' }
                }
            ]

        }

        await req.user.populate({
            path: 'events',
            match
        });

        const allEvents = [];

        req.user.events.forEach((event) => {
            if (!event.completed.concat(event.deleted).includes(event.date.toDateString())) {
                allEvents.push({
                    formattedDate: event.date.toUTCString().slice(0, 16),
                    event
                });     
            }

            if (event.recurrence !== 'one time') {
                while (event.date < limit) {
                    const nextEventRecurrence = getNextItemOccurence(event.date, event.recurrence);

                    event.date = nextEventRecurrence;

                    if (!event.completed.concat(event.deleted).includes(event.date.toDateString())) {
                        allEvents.push({
                            formattedDate: event.date.toDateString(),
                            event
                        });     
                    }
                }
            }
        });

        return allEvents.sort((a, b) => new Date(a.formattedDate) - new Date(b.formattedDate));
    }
}

module.exports = EventController;