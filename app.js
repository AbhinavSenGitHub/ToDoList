//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB", {useNewUrlParser: true});    // npm i mongoose@5.13.8

// item schema
const itemSchema = new mongoose.Schema({
  name: String
});

// model
const Item = mongoose.model("Item", itemSchema)

// Documents
const item_1 = new Item({
  name: "Welcome to your todolist!"
});
const item_2 = new Item({
  name: "Hit the + button to aff a new item."
});
const item_3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item_1, item_2, item_3];

// custom list      /*
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const List = mongoose.model("List", listSchema);

app.get("/:paramName", function(req, res){
  const customListName = req.params.paramName;

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // Creating a list
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName)
      }else{
        // Show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
})
// custom list      */

// render
app.get("/", function(req, res) {

  Item.find({} , function(err, foundItem){

    if(foundItem.length === 0){

      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Succesfully stored the items!.");
        }
      });

      res.redirect("/");

    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItem});
    }

  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  // Document using itemName
  const currentItem = new Item({
    name: itemName
  })

  if(listName === "Today"){
    currentItem.save();
    res.redirect("/")
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(currentItem);
      foundList.save();
      res.redirect("/" + listName)
    })
  }


});

app.post("/delete", function(req, res){
  const checkedItemId = _.capitalize(req.body.checkbox);
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      res.redirect("/")
      if(err){
        console.log(err);
      }else{
        console.log("Succesfully removed item from the list!.");
      }
    })
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }

})




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
