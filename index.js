const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express=require("express");
const { v4:uuidv4 }=require("uuid");
const app=express();
const path=require("path");
const methodOverride=require("method-override");
const { get } = require('http');

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended: true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password: 'orewa',
});

let getRandomUser=()=>{
    return[
        faker.string.uuid(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};

// //addingUsersInBulk
// let q = "insert into user (id, username, email, password) values ?";
// let users = [];
// for (let i = 0; i < 100; i++) {
//     users.push(getRandomUser());
// }
// connection.query(q, [users], (err, result) => {
//     if (err) throw err;
//     console.log(result);
// });

//home route
app.get("/",(req,res)=>{
    let q=`select count(*) from user`;
    try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        let count=result[0]["count(*)"];
        res.render("home.ejs",{count});
    });
}catch(err){
    console.log(err);
    res.send("some error in db");
}
});

//userroute
app.get("/user",(req,res)=>{
    let q=`select * from user`;
    try{
    connection.query(q,(err,users)=>{
        if(err) throw err;
        res.render("users.ejs",{users});
    });
}catch(err){
    console.log(err);
    res.send("some error in db");
}
});


//editroute
app.get("/user/:id/edit",(req,res)=>{
    let {id}=req.params;
    let q=`select * from user where id='${id}'`;
    try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        let user=result[0];
        res.render("edit.ejs",{user});
    });
}catch(err){
    console.log(err);
    res.send("some error in db");
}
});

//update route
app.patch("/user/:id",(req,res)=>{
    let {id}=req.params;
    let {password: formPass,username:newUsername}=req.body;
    let q=`select * from user where id='${id}'`;
    try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        let user=result[0];
        if(formPass!=user.password){
            res.send("WRONG password");
        }else{
            let q2=`update user set username='${newUsername}' where id='${id}'`;
            connection.query(q2,(err,result)=>{
                if (err) throw err;
                res.redirect("/user");
            });
        }
    });
}catch(err){
    console.log(err);
    res.send("some error in db");
}
});

//deleteroute
app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;

    let q = `select * from user where id='${id}'`;
    connection.query(q, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("DB error");
        }
        res.render("delete.ejs", { user: result[0] });
    });
});

app.delete("/user/:id",(req,res)=>{
    let {id}=req.params;
    let {email,password}=req.body;
    let q=`select * from user where id='${id}'`;
    try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        let user=result[0];
        if(password!=user.password){
            res.send("WRONG password");
        }else{
            let q2=`delete from user where id='${id}'`;
            connection.query(q2,(err,result)=>{
                if (err) throw err;
                res.redirect("/user");
            });
        }
    });
}catch(err){
    console.log(err);
    res.send("some error in db");
}
});

//addroute
app.get("/user/new",(req,res)=>{
    res.render("new.ejs");
});

app.post("/",(req,res)=>{
    let {username,email,password}=req.body;
    let id=uuidv4();
    let q=`insert into user values ('${id}','${username}','${email}','${password}')`;
    try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        res.redirect("/");
    });
}catch(err){
    console.log(err);
    res.send("some error in db");
}
});

app.listen(8080,()=>{
    console.log("server is listening");
});