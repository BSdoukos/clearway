const Task = require('../models/Task.js')
const { ObjectId } = require('mongodb');
const getDaysLeftUntilDate = require('../helpers/getDaysLeftUntilDate.js');
const WorkHistory = require('../helpers/WorkHistory.js')
const generateDate = require('../helpers/generateDate.js');

class TaskController {
    constructor() { }

    async createTask(req, res) {
        try {
            req.body.owner = ObjectId(req.user._id);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            req.body.creationDate = today;

            switch (req.body.recurrence) {
                case 'weekly':
                    req.body.runEvery = today.getDay() + 1;
                    break;

                case 'monthly':
                    req.body.runEvery = today.getDate();
                    break;

                case 'yearly':
                    req.body.runEvery = today.getDate() + '-' + (today.getMonth + 1);
                    break;

                default:
                    break;
            }

            const task = new Task(req.body);
            await task.save();

            res.status(201).send(task);

        } catch (e) {
            res.status(400).send({ error: e.message });
        }
    }

    async getTasks(req, res) {
        try {
            const date = req.query.date ? generateDate(req.query.date) : new Date();
            date.setHours(0, 0, 0, 0);

            console.log(req.query.activeOnly)

            const match = req.query.activeOnly === 'false' ? {} : {
                completed: { $nin: date.toDateString() },
                deleted: { $nin: date.toDateString() },
                $or: [
                    {
                        isInactive: false
                    },
                    {
                        creationDate: { $lt: date },
                        recurrence: 'daily'
                    },
                    {
                        runEvery: date.getDay() + 1,
                        recurrence: 'weekly'
                    },
                    {
                        runEvery: date.getDate(),
                        recurrence: 'monthly'
                    },
                    {
                        runEvery: date.getDate() + '-' + (date.getMonth() + 1),
                        recurrence: 'yearly'
                    },
                ],
            }

            if (!req.query.rank) {
                if (req.query.search) {
                    match.name = { $regex: req.query.search.replace(/[$&+,:;=?@#|'<>.^*()%!-]/g, '\\$&'), $options: 'i' }
                } else {
                    Object.entries(req.query).forEach(entry => match[entry[0]] = entry[1]);
                }
            }

            if (match.context === 'all') {
                delete match.context;
            }

            await req.user.populate({
                path: 'tasks',
                match
            });

            if (req.query.activeOnly !== 'false') {
                req.user.tasks.forEach(task => {
                    if (task.isInactive) {
                        task.isInactive = false;
                        task.save();
                    }
                });
            }

            if (req.query.rank) {
                req.user.tasks = this.rankTasks(req);
            }

            return req.user.tasks;

        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    async updateTask(req, res) {
        try {
            const _id = req.body._id;

            if (req.body.complete) {
                req.user.taskCompletionLogs.push(new Date());
                await req.user.save()
                res.status(200).send(await Task.updateOne({ _id }, { $push: { completed: req.body.complete }, isInactive: true }));
            } else if (req.body.deleteOccurrence) {
                res.status(200).send(await Task.updateOne({ _id }, { $push: { deleted: req.body.deleteOccurrence }, isInactive: true }));
            } else {
                delete req.body._id;
                res.status(200).send(await Task.findOneAndUpdate({ _id }, req.body, { new: true }));
            }

        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    async deleteTask(req, res) {
        try {
            await Task.deleteOne({ _id: req.body._id });
            res.sendStatus(200);

        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    rankTasks(req) {
        /* 
            Ranking criteria

            Each task will get a score and will be ranked on that. Points will be assigned to tasks according to the criteria they meet.

            Criteria                    | Value
            ------------------------------------------------------------------------------------
            Energy required =< informed | 0.5 point
            ------------------------------------------------------------------------------------
            Has deadline                | 1 point + 0.5 point * (10 - days left until deadline)
            ------------------------------------------------------------------------------------
            Is from informed context    | 2 points
            ------------------------------------------------------------------------------------
            Has main importance         | 2 points
            ------------------------------------------------------------------------------------
            Time required =< informed   | 5 points
            ------------------------------------------------------------------------------------
        */

        let { minutes, hours, context, energy } = req.query;
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        const symbolicAvailableTime = parseInt(hours + minutes);

        const rankedTasks = req.user.tasks.map((task) => {
            task = { data: task };
            task.score = 0;
            if (task.data.minutes < 10) {
                task.data.minutes = '0' + task.data.minutes;
            }

            if (parseInt(task.data.hours.toString() + task.data.minutes.toString()) <= symbolicAvailableTime) {
                task.score += 5;
            }
            if (task.data.context === context) {
                task.score += 2;
            }
            if (task.data.deadline) {
                const daysLeft = getDaysLeftUntilDate(task.data.deadline);
                task.score += 1 + 0.5 * (10 - daysLeft);
            }
            if (task.data.importance === 'main') {
                task.score += 2;
            }

            const crescentEnergyLevels = ['low', 'medium', 'high'];
            if (crescentEnergyLevels.indexOf(task.data.energy) <= crescentEnergyLevels.indexOf(energy)) {
                task.score += 0.5;
            }

            return task;
        });

        return rankedTasks.sort((a, b) => {
            return a.score - b.score;
        }).reverse();
    }

    getWorkHistory(logs, periodUnit, periodUnitQuantity) {
        const history = new WorkHistory(logs, periodUnit, periodUnitQuantity);
        history.fill();
        history.format();
        return history.data.reverse();
    }

    generateStats(tasks, type, filter) {
        if (!tasks.length) return;
        switch (type) {
            case 'taskCompletion':
                if (filter && filter !== 'all') {
                    tasks = tasks.filter((task) => task.context === filter);
                }
                return {
                    completed: tasks.filter((task) => task.isInactive).length,
                    uncompleted: tasks.filter((task) => !task.isInactive).length
                }

            case 'tasksByContext':
                if (filter && filter !== 'all') {
                    tasks = tasks.filter((task) => task.isInactive === (filter === 'completed' ? true : false));
                }
                const contexts = {};
                tasks.forEach(task => {
                    if (Object.keys(contexts).indexOf(task.context) === -1) {
                        contexts[task.context.replace(/^./, (match) => match.toUpperCase())] = tasks.filter((t) => t.context === task.context).length;
                    }
                });
                return contexts;
        }
    }
}

module.exports = TaskController;