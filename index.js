const express = require('express');
const WooCommerceAPI = require('woocommerce-api');
require('dotenv').config();
const admin = require('firebase-admin');
const key = require('./serviceKey.json');
const { firestore } = require('firebase-admin');
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

const data = WooCommerce.getAsync('customers')
    .then(result => {
        return JSON.parse(result.body);
    })
    .catch(err => {
        console.log(err);
    });


const customerOrders = WooCommerce.getAsync('orders')
    .then(result => {
        return JSON.parse(result.body);
    }
    )
    .catch(err => {
        console.log(err);
    });


const db = admin.firestore();

// only add data if there is no data in the database



const printData = async () => {
    const customers = await data;
    

    // db.collection('customers').get()
    //     .then(snapshot => {
    //         const newData = [];
    //         snapshot.forEach(doc => {
    //             newData.push(doc.data());
    //             const ids = newData.map(customerid => customerid.id);
    //             // console.log(ids);

    //             const wooId = customers.map(customer => customer.id);
    //             // console.log(wooId);

    //             const userF_set = new Set(wooId);
    //             const userF_set1 = new Set(ids);
    //             const difference = new Set([...userF_set1].filter(x => !userF_set.has(x)))

    //             console.log([difference].length);


                // const newUser = customers.filter(customer =>{
                //     console.log(customer.id);
                // });
                // console.log(newUser);
                // console.log(newUser);
                // if (newUser.length > 0) {
                //     newUser.forEach(user => {
                //         db.collection('customers').add(user);
                //         console.log('new user added');
                //     }
                //     )

                // }
                // else {
                //     console.log('no new data');
                // }
            // });

        // })

};

printData();


const printOrderData = async () => {
    const orders = await customerOrders;
    // console.log(orders[0].id);
    db.collection('orders').get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const newData = [];
                newData.push(doc.data());
                const ids = newData.map(orderid => orderid.id);
                // console.log(ids);
                // console.log(newData[0]?.id??'no data');
                const wooId = orders.map(order => order.id);
                // console.log(wooId);
                const userF_set = new Set(wooId);
                const userF_set1 = new Set(ids);
                const difference = new Set([...userF_set1].filter(x => !userF_set.has(x)))

                // console.log([...difference]);



                // console.log(difference);
                // const newUser = orders.filter(order => order.id !== orders.id);
                // console.log(newUser);
                // if (newUser.length > 0) {
                //     newUser.forEach(user => {
                //         db.collection('orders').add(newUser);
                //         console.log('new order added');
                //     }
                //     )
                // }
                // else {
                //     console.log('no new data');
                // }
            });

        })
}

printOrderData();

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

app.listen(port, () => console.log(`Listening on port ${port}`));

