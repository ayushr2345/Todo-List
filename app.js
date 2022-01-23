const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const port = 3000;

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// arrays can be const and we can push but cannot be assigned to new array
const items = ["Task 1", "Task 2", "Task 3"];
const workList = [];

app.get('/', (req, res) => {
    let day = date.getDate();
    res.render('list', {list: day, newListItems: items});
})

app.get('/work', (req, res) => {
    res.render('list', {list: "Work List", newListItems: workList});
})

app.post('/', (req, res) => {
    if (req.body.list === "Work List") {
        workList.push(req.body.newItem);
        res.redirect('/work');
    } else {
        items.push(req.body.newItem);
        res.redirect('/');
    }
})

app.listen(port, () => {
    console.log(`App running on port ${port}`);
})