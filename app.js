const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const port = 3000;

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// connect to db
mongoose.connect('mongodb://localhost:27017/todoListDB');

// create items schema
const itemSchema = new mongoose.Schema({
    name: String
});

// create model
const Item = mongoose.model('Item', itemSchema);

// creating 3 items
const item1 = new Item({
    name: "Welcome to To Do List"
});

const item2 = new Item({
    name: "Click the + button to add a new item"
});

const item3 = new Item({
    name: "<--Hit this to delete the item"
});

const defaultItems = [item1, item2, item3];



app.get('/', (req, res) => {
    Item.find({}, (err, foundItems) => {
        if (err) {
            console.log(err);
        } else {
            if (foundItems.length === 0) {
                // insert the default items in the DB
                Item.insertMany(defaultItems, (err) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Succeccfully inserted the default items");
                    }
                });
            }
        }

        let day = date.getDate();
        res.render('list', {list: day, newListItems: foundItems});
    });
});

// custom list

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model('List', listSchema);

app.get('/:customListName', (req, res) => {
    const customList = _.capitalize(req.params.customListName);
    List.findOne({name: customList}, (err, foundList) => {
        if (err) {
            console.log(err);
        } else {
            if (foundList) {
                // show the existing list
                res.render('list', {list: customList, newListItems: foundList.items});
            } else {
                // make a new list
                const newList = new List({
                    name: customList,
                    items: defaultItems
                });
                newList.save();
                res.redirect('/' + customList);
            }
        }
    })
})

app.post('/', (req, res) => {
    const newItem = req.body.newItem;
    const listName = req.body.list;
    let day = date.getDate();

    const item = new Item({
        name: newItem
    });
    if (listName == day) {
        item.save();
        res.redirect('/');   
    } else {
        List.findOne({name: listName}, (err, foundList) => {
            if (err) {
                console.log(err);
            } else {
                foundList.items.push(item);
                foundList.save();
                res.redirect('/' + listName);
            }
        });
    }
});

app.post('/delete', (req, res) => {
    const deletedId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === date.getDate()) {
        Item.findByIdAndDelete(deletedId, (err) => {
            if (err) {
                console.log(err);
            } 
        });
        res.redirect('/');
    } else {
        List.findOneAndUpdate(
            {name: listName},
            { $pull: {items: {_id: deletedId}}},
            (err) => {
                if(err) {
                    console.log(err);
                }
            }
        );
        res.redirect('/' + listName);
    }
});

app.listen(port, () => {
    console.log(`App running on port ${port}`);
});