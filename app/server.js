const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const hbs = require('hbs');
const mainRouter = require('./routers/main.router.js');
const userRouter = require('./routers/user.router.js');
const itemsRouter = require('./routers/items.router.js');

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, './views'));

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(mainRouter);
app.use(userRouter);
app.use(itemsRouter);

hbs.registerPartials(path.join(__dirname, './views/partials'));

hbs.registerHelper('json', (data) => JSON.stringify(data));
hbs.registerHelper('capitalize', (str) => str.replace(/^./, (match) => match.toUpperCase()));

app.listen(process.env.PORT || 3000);