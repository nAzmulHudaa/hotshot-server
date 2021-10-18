const express = require('express');
const WooCommerceAPI = require('woocommerce-api');
require('dotenv').config();
const admin = require('firebase-admin');
const key = require('./serviceKey.json');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;



admin.initializeApp({
    credential: admin.credential.cert(key)
});



const WooCommerce = new WooCommerceAPI({
    url: process.env.PROJECT_URL,
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    wpAPI: true,
    version: 'wc/v3'
});

const data = WooCommerce.getAsync('customers?per_page=20')
    .then(result => {
        // console.log(JSON.parse(result.body))
        // const customers = JSON.parse(result.body);
        // console.log(customers.length);
        return JSON.parse(result.body);
    })
    .catch(err => {
        console.log(err);
    });


const customerOrders = WooCommerce.getAsync('orders?per_page=30')
    .then(result => {
      
        return JSON.parse(result.body);
    }
    )
    .catch(err => {
        console.log(err);
    });


const db = admin.firestore();




app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.get('/api/customers', (req, res) => {
    db.collection('customers').get()
        .then(snapshot => {
            let customers = [];
            snapshot.forEach(doc => {
                customers.push(doc.data());
            });
            res.json(customers);
        })
        .catch(err => {
            console.log(err);
        });
})

app.get('/api/orders', (req, res) => {
    db.collection('orders').get()
        .then(snapshot => {
            let orders = [];
            snapshot.forEach(doc => {
                orders.push(doc.data());
            })
            res.json(orders);
        })
        .catch(err => {
            console.log(err);
        })
})




const printCustomers = async () => {
    const customers = await data;
    const customerIds = customers.map(customer => customer.id);
    // console.log(customerIds);
    const dbCustomers = db.collection('customers').get()
        .then(snapshot => {
            let dbItems = [];
            snapshot.forEach(doc => {
                dbItems.push(doc.data());
            });
            return dbItems;
        })
        .catch(err => {
            console.log(err);
        })

    const printDb = async () => {
        const dbCustomer = await dbCustomers;
        const dbIds = dbCustomer.map(customer => customer.id);
        // console.log(dbIds);
        let difference = customerIds.filter(x => !dbIds.includes(x));
        // console.log(difference.length);
        if (difference.length > 0) {
            difference.forEach(id => {
                const customer = customers.find(customer => customer.id === id);
                db.collection('customers').add(customer)
                    .then(() => {
                        console.log('added');
                    });
            })
        }
        else if (difference.length === 0) {
            console.log('No new customers');
        }

    }
    printDb();
}

printCustomers();


const printOrders = async () => {
    const orders = await customerOrders;
    const orderIds = orders.map(order => order.id);
    console.log(orderIds);
    const dbOrders = db.collection('orders').get()
        .then(snapshot => {
            let dbItems = [];
            snapshot.forEach(doc => {
                dbItems.push(doc.data());
            });
            return dbItems;
        })
        .catch(err => {
            console.log(err);
        })

    const printDb = async () => {
        const dbOrder = await dbOrders;
        const dbIds = dbOrder.map(order => order.id);
        // console.log(dbIds);
        let difference = orderIds.filter(x => !dbIds.includes(x));
        // console.log(difference);
        if (difference.length > 0) {
            difference.forEach(id => {
                const order = orders.find(order => order.id === id);
                // console.log(order);
                db.collection('orders').add(order)
                    .then(() => {
                        console.log('added');
                    });
            })
        }
        else if(difference.length === 0){
            console.log('No new orders')
        }
    }
    printDb();
}

printOrders();

app.listen(port, () => console.log(`Listening on port ${port}`));

