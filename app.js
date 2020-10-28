//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");
const mongoose=require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-tsachi:Tsachi68@cluster0.5hguw.mongodb.net/todolistDB", {useNewUrlParser:true, useUnifiedTopology: true});
//how to create a schema for a desired model
const itemSchema= {
    name: {
        type:String,
        required:[true,"Please check your data entry, no name specified!"]
    }
};
const Item= mongoose.model("Item",itemSchema);

const item1=new Item({
  name:"Welcome to your todolist!"
});
const item2=new Item({
  name:"Hit the + button to add a new item"
}); 
const item3=new Item({
  name:"<-- hit this to delete an item"
});  
const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemSchema]
};
const List=mongoose.model("List",listSchema);
// Item.insertMany(defaultItems,function (err) {
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log("Succesfully saved all the items to todolistDB!");
//     }
// });

app.get("/", function(req, res) {
  Item.find({},function (err,foundItems) {
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function (err) {
        if(err){
          console.log(err);
        }
        else{
          console.log("Succesfully saved all the items to todolistDB!");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle:"Today", newListItems: foundItems});
    }
  });
});
app.get("/:listSubject",function (req,res) {
  const customListName=_.capitalize(req.params.listSubject);
  List.findOne({name:customListName},function (err,foundList) {
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle:foundList.name, newListItems: foundList.items});
      }
    }
  });
  
});

app.post("/", function(req, res){
  const listName=req.body.list;
  const itemName = req.body.newItem;
  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function (err,foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
    // item.save();
    // res.redirect("/"+listName);
  }
  
});
app.post("/delete",function (req,res) {
  const checkedItemID=req.body.checkedbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemID,function (err) {
      if(!err){
        console.log("item removed succesfully!");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItemID}}},function (err,foundList) {
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
