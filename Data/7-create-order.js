var cars = db.cars.find().toArray();
var users = db.users.find().toArray();

function getRandomItems(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function getRandomDate() {
    var date = new Date();
    var year = date.getFullYear() - Math.round(Math.random());
    var month = Math.floor(Math.random() * 12);
    date.setMonth(month);
    date.setYear(year);
    return date;
}

function getRandomQuantity() {
    return Math.random() < 0.5 ? 1 : 2;
}
var orders = [];
for (var i = 0; i < 1000; i++) { // create orders
    var order = {
        car: getRandomItems(cars)._id,
        user: getRandomItems(users)._id,
        createdAt: getRandomDate(),
        quantity: getRandomQuantity()
    };
    orders.push(order);
}

db.orders.insertMany(orders);