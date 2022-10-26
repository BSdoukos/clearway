const Project = require('../models/Project.js')
const Task = require('../models/Task.js')
const generateDate = require('../helpers/generateDate.js');
const { ObjectId } = require('mongodb');

class ProjectController {
    constructor() { }

    async createProject(req, res) {
        try {
            req.body.owner = ObjectId(req.user._id);
            req.body.deadline = generateDate(req.body.deadline);
            req.body.deadline.setHours(0, 0, 0, 0);

            const project = new Project(req.body);
            await project.save();

            res.status(201).send(project);

        } catch (e) {
            res.status(400).send({ error: e.message });
        }
    }

    async getProjects(req, res) {
        try {
            const match = req.query.activeOnly === 'false' ? {} : { completed: false };

            if (req.query.search) {
                match.name = { $regex: req.query.search.replace(/[$&+,:;=?@#|'<>.^*()%!-]/g, '\\$&'), $options: 'i' }
            } else {
                Object.entries(req.query).forEach(entry => match[entry[0]] = entry[1]);
            }

            await req.user.populate({
                path: 'projects',
                match
            });

            for (let i = 0; i < req.user.projects.length; i++) {
                req.user.projects[i].tasks = await Task.find({ projectRelated: req.user.projects[i].id });
            }

            return req.user.projects;

        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    generateStats(projects) {
        if (!projects.length) return;

        const projectsCompletionPercentage = projects.map((project) => project.completionPercentage).reduce((percentageSum, completionPercentage) => completionPercentage + percentageSum, 0) / projects.length;

        return {
            completedPercentage: projectsCompletionPercentage,
            uncompletedPercentage: 100 - projectsCompletionPercentage
        }
    }

    async updateProject(req, res) {
        try {
            res.status(200).send(await Project.findOneAndUpdate({ _id: req.body._id }, req.body, { new: true }));

        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }

    async deleteProject(req, res) {
        try {
            await Project.deleteOne({ _id: req.body._id });
            await Task.deleteMany({ projectRelated: req.body._id });
            
            res.sendStatus(200);

        } catch (e) {
            res.status(500).send({ error: e.message });
        }
    }
}

module.exports = ProjectController;