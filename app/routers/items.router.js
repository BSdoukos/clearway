const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller.js');
const TaskController = require('../controllers/task.controller.js');
const EventController = require('../controllers/event.controller.js');
const ProjectController = require('../controllers/project.controller.js');

const taskController = new TaskController();
const userController = new UserController();
const eventController = new EventController();
const projectController = new ProjectController();

const auth = userController.auth;

router.post('/tasks', auth, (req, res) => taskController.createTask(req, res));
router.get('/tasks', auth, async (req, res) => res.send({ tasks: await taskController.getTasks(req, res) }));
router.patch('/tasks', auth, async (req, res) => await taskController.updateTask(req, res));
router.delete('/tasks', auth, async (req, res) => await taskController.deleteTask(req, res));

router.post('/events', auth, async (req, res) => await eventController.createEvent(req, res));
router.get('/events', auth, async (req, res) => res.send({ events: await eventController.getEvents(req, res) }));
router.patch('/events', auth, async (req, res) => await eventController.updateEvent(req, res));
router.delete('/events', auth, async (req, res) => await eventController.deleteEvent(req, res));

router.post('/projects', auth, async (req, res) => await projectController.createProject(req, res));
router.get('/projects', auth, async (req, res) => res.send({ projects: await projectController.getProjects(req, res) }));
router.patch('/projects', auth, async (req, res) => res.send({ projects: await projectController.updateProject(req, res) }));
router.delete('/projects', auth, async (req, res) => res.send({ projects: await projectController.deleteProject(req, res) }));

module.exports = router;