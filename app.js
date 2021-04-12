//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js")
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');
const mongoose = require("mongoose");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
//const connectionString="mongodb+srv://shreyek:shreyek-1234@cluster0.1fw1w.mongodb.net/todolistDB"
mongoose.connect("mongodb+srv://shreyek:shreyek-1234@cluster0.1fw1w.mongodb.net/todolistDB", {
  useNewUrlParser: true
  //useUnifiedTopology: true
}, function(err) {
  if (err)
    console.log(err);
  else
    console.log("Successfully Connected to mongodb")
});
//let day = date.getDate();
const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome To Your To-Do-List!!!"
});
const item2 = new Item({
  name: "Hit the + to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    // console.log(foundItems);

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else
          console.log("Successfully Inserted");
      });
      res.redirect("/");
    } else {

      res.render("list", {
        ListTitle: "Today",
        newListItems: foundItems
      });
    }

  });
});
app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) { //Create A New list

        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an Existing List
        res.render("list", {
          ListTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });


});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  // item.save();
  // res.redirect("/");

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("Successfully Deleted");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
        name: listName
      }, {
        $pull: {
          items: {
            _id: checkedItemId
          }
        }
      },
      function(err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      });
  }
});
// if(req.body.List==="Work"){
//   workItems.push(item);
//   res.redirect("/work");
// }
// else
// {
//   items.push(item);
//   res.redirect("/");
// }
app.get("/work", function(req, res) {
  res.render("List", {
    ListTitle: "Work List",
    newListItems: workItems
  });
});
app.post("/work", function(req, res) {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});
app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "")
  port = 3000
app.listen(port, function() {
  console.log("Server started on port Successfully");
});
