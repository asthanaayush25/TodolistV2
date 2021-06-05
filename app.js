// jshint esversion:6
const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const app=express();
const _=require("lodash");
const dotenv=require("dotenv");
dotenv.config();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
console.log()
mongoose.connect(process.env.DATABASE_ADDRESS,{ useNewUrlParser: true } );
mongoose.set('useFindAndModify', false);
const itemsSchema={
  name:String
};

const Item= mongoose.model('Item',itemsSchema);
const item1=new Item(
  {
    name:"Welcome to your Todolist"
  }
);
const item2=new Item(
  {
    name:"Hit the + button to add an element "
  }
);
const item3=new Item(
  {
    name:"<-- Hit this to  delete an item"
  }
);

const defaultitems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model('List',listSchema);




app.get('/',(req,res)=>{

 Item.find({},function(err,foundItems){
   if(foundItems.length===0)
   {
     Item.insertMany(defaultitems,(err)=>
     {
       if(err)
       console.log(err);
       else {
         console.log("Successfully  inserted the items.")
       }
     });
   }
   res.render("list",
   {
     listTitle :"Today",
     items: foundItems

   }
   );
 });
});

app.get('/:customList',(req,res)=>
{
  const customList=req.params.customList;

  List.findOne({name:customList},(err,foundList)=>{
    if(!err)
    {

      if(!foundList)
      {

        const list=new List({
          name:customList,
          items:defaultitems
        });
        list.save();
        res.render('list',
        {
          listTitle :customList,
          items:defaultitems

        });

      }
      else
      res.render('list',
      {
        listTitle :customList,
        items: foundList.items

      });
    }
    else {
      console.log(err);
    }
  });



});

app.post('/',(req,res)=>{
  const listName=req.body.button;
 console.log(listName);
  const item=new Item({
    name: req.body.newItem
  });
  if(listName==="Today")
  {
    item.save();
    res.redirect('/');
  }
  else {
    List.findOne({name:listName},(err,foundList)=>{
      if(!err)
      {

        foundList.items.push(item);
        foundList.save();
        res.redirect('/'+listName);
      }
    });

  }

});

app.post('/delete',(req,res)=>
{

  const checkedItem = req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Todya")
  {
    Item.findByIdAndRemove(checkedItem,function(err){
      if(!err)
      {
        console.log("Successfully removed");
       res.redirect('/');
     }

    });
  }
  else {

    List.findOneAndUpdate({name:listName},{$pull:{items: {_id:checkedItem}}},(err,foundList)=>{
      if(!err)
      {
        console.log("Successfully removed");
        res.redirect('/'+listName);
      }
    });
  }
});
app.listen(process.env.PORT||3000,()=>{
  console.log('server listening ');
});
