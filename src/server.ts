require('module-alias/register');
require('dotenv').config();
import App from "./app"
import IndexRoute from "./modules/index/index.route"
import CustomerAddressRoute from "./modules/customer_address/customer_address.route"
import 'reflect-metadata';
import CustomerRoute from "@modules/customers/customer.route";
import EventStorageRoute from "@modules/event_storage/route";
import CustomerGroupRoute from "./modules/customer_group/customer_group.route"

const routes = [
    new IndexRoute(),
    new CustomerRoute(),
    new CustomerAddressRoute(),
    new EventStorageRoute(),
    new CustomerGroupRoute(),
    new CustomerGroupRoute(),
];
const app = new App(routes);

app.listen();