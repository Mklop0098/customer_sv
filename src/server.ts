require('module-alias/register');
require('dotenv').config();
import App from "./app"
import IndexRoute from "./modules/index/index.route"
import 'reflect-metadata';

const routes = [
    new IndexRoute(),

];
const app = new App(routes);

app.listen();