const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller.js');
const TaskController = require('../controllers/task.controller.js');
const EventController = require('../controllers/event.controller.js');
const ProjectController = require('../controllers/project.controller.js');
const getDaysLeftUntilDate = require('../helpers/getDaysLeftUntilDate.js');
const generateDate = require('../helpers/generateDate.js');

const taskController = new TaskController();
const userController = new UserController();
const eventController = new EventController();
const projectController = new ProjectController();

const auth = userController.auth;

router.get('/', auth, (req, res) => {
    res.redirect('/dashboard');
});

router.get('/login', auth, (req, res) => res.render('login'));

router.get('/dashboard', auth, async (req, res) => {
    const requestDate = req.query.date ? generateDate(req.query.date) : new Date();
    let displayDate = 'on ' + requestDate.toDateString().slice(4, 10);
    if (displayDate === 'on ' + new Date().toDateString().slice(4, 10)) {
        displayDate = 'today';
    }

    const tasks = await taskController.getTasks(req, res);
    const events = await eventController.getEvents(req, res);
    const projects = await projectController.getProjects(req, res);
    
    tasks.forEach(task => {
        if (task.deadline) {
            task.daysLeftUntilDeadline = getDaysLeftUntilDate(new Date(task.deadline))
        }
        if (task.projectRelated && task.projectRelated !== 'none') {
            const proj = projects.find(project => project.id === task.projectRelated);
            task.projectContext = `${proj.name} ${proj.tasks.findIndex(t => t.id === task.id) + 1}/${proj.tasks.length}`;
        }
    });

    res.render('dashboard', {
        active: {
            dashboard: true
        },
        userFirstName: req.user.name.split(' ')[0],
        tasks,
        events,
        projects,
        tasksAndEventsNumber: tasks.length + events.length,
        multipleTasksAndEvents: tasks.length + events.length > 1,
        taskContexts: req.user.taskContexts,
        displayDate
    });
});

router.get('/analytics', auth, async (req, res) => {
    req.query.activeOnly = 'false';

    const tasks = await taskController.getTasks(req, res);
    const projects = await projectController.getProjects(req, res);

    if (Object.keys(req.query).length === 1) {
        res.render('analytics', {
            active: {
                analytics: true
            },
            stats: {
                taskCompletion: taskController.generateStats(tasks, 'taskCompletion'),
                tasksByContext: taskController.generateStats(tasks, 'tasksByContext'),
                projectCompletion: projectController.generateStats(projects),
                workHistory: taskController.getWorkHistory(req.user.taskCompletionLogs, 'day', 7),
                contexts: req.user.contexts
            },
            taskContexts: req.user.taskContexts,
        });
    }

    const { taskCompletion, tasksByContext, projectCompletion, workHistory } = req.query;

    if (taskCompletion) {
        res.json(taskController.generateStats(tasks, 'taskCompletion', taskCompletion));
    }
    if (tasksByContext) {
        res.json(taskController.generateStats(tasks, 'tasksByContext', tasksByContext));
    }
    if (projectCompletion) {
        res.json(projectController.generateStats(projects));
    }
    if (workHistory) {
        switch (workHistory) {
            case 'week':
                res.json(taskController.getWorkHistory(req.user.taskCompletionLogs, 'day', 7));
                break;

            case 'month':
                res.json(taskController.getWorkHistory(req.user.taskCompletionLogs, 'week', 5));
                break;

            case 'semester':
                res.json(taskController.getWorkHistory(req.user.taskCompletionLogs, 'month', 6));
                break;

            default:
                break;
        }
    }
});

router.get('/projecting', auth, async (req, res) => {
    let projects = { all: await projectController.getProjects(req, res) };

    projects.completed = projects.all.filter((p) => p.completed);
    projects.uncompleted = projects.all.filter((p) => !p.completed);

    delete projects.all;

    projects.multipleUnfinished = projects.uncompleted.length > 1
    
    res.render('projecting', {
        active: {
            projects: true
        },
        projects
    });
});

router.get('/logs', auth, async (req, res) => {
    req.query.activeOnly = 'false';

    const tasks = {
        all: await taskController.getTasks(req, res)
    };
    const events = {
        all: await eventController.getEvents(req, res),
    };
    
    tasks.completed = tasks.all.filter((task) => task.completed.length);
    events.completed = events.all.filter((event) => event.completed.length);
    tasks.allCompletedInstances = [];
    events.allCompletedInstances = [];


    tasks.completed.forEach((task) => {
        task.completed.forEach((date) => {
            tasks.allCompletedInstances.push(task);
            tasks.allCompletedInstances[tasks.allCompletedInstances.length - 1].completed = date;
        });
    });
    events.completed.forEach((event) => {
        event.completed.forEach((date) => {
            events.allCompletedInstances.push(event);
            events.allCompletedInstances[events.allCompletedInstances.length - 1].completed = date;
        });
    });

    res.render('logs', {
        active: {
            logs: true
        },
        tasks: tasks.allCompletedInstances,
        events: events.allCompletedInstances
    });
});

router.get('/settings', auth, (req, res) => {
    res.render('settings', {
        active: {
            settings: true
        },
        user: req.user
    });
});

router.get('/passwordrecovery', (req, res) => {
    res.render('passwordrecovery');
});

module.exports = router;