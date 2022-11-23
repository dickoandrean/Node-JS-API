const express = require('express');
const bodyParser = require('body-parser');
const connect = require('./config/database');
const req = require('express/lib/request');
const { response } = require('express');
const app = express();
const port = process.env.port || 5000;

// set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/api/register', async (req, res) => {
    try {
        const data = { ...req.body };
        const query = 'INSERT INTO users set ?';

        //running query
        await connect.query(query, data);
        return res.status(204).send()
    } catch (err) {
        return res.status(500).json({ message: 'error in register user', error: err });
    }
});

app.post('/api/assign', async (req, res) => {
    try {
        const query = 'INSERT INTO tasks (user, task) VALUES (?,?)';
        const data = { ...req.body };
        //convert task to json
        const task = JSON.stringify(data.task);

        //running query
        await connect.query(query, [data.user, task]);
        return res.status(204).send()
    } catch (err) {
        return res.status(500).json({ message: 'error in assign task', error: err });
    }
});

app.post('/api/unassign', async (req, res) => {
    try {
        const query = 'UPDATE tasks SET task = IF( JSON_SEARCH(task, "one", ?) IS NOT NULL ,  JSON_REMOVE(task, JSON_UNQUOTE(JSON_SEARCH(task, "one", ?))) , task ) WHERE USER = ?'
        const data = { ...req.body };
        const task = data.task;

        //running query for remove task
        for (var i = 0; i < task.length; i++) {
            await connect.query(query, [task[i], task[i], data.user]);
            return res.status(204).send()
        }
    } catch (err) {
        return res.status(500).json({ message: 'error in assign task', error: err });
    }
});

app.get('/api/task/common', async (req, res) => {

    const query = 'SELECT task  FROM tasks where user in (?)';
    const data = {...req.body};
    const users = data.user;

    runQuery = () => {
        return new Promise((resolve, reject) => {
            connect.query(query , [users] , (err, results) => {
                if (err) { return reject(err); }
                return resolve(results);
            });
        });
    }

    try {
        const result = await runQuery();
        const resultJson = JSON.parse(JSON.stringify(result));
        const array = [];
        resultJson.map((e) => array.push(JSON.parse(JSON.stringify(e.task.toString())).toString()
        .replace( '[' , '' )
        .replace(']' , '')
        .split(',')  ));
        return res.status(200).send(JSON.parse(JSON.stringify(array)));
    } catch (error) {
        console.log(error);
    }

});


app.listen(port, () => console.log(`Server Running at port : ${port}`));