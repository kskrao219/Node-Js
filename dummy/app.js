const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser');
const Port = process.env.PORT || '3000';
const app = express();

const TWO_HOURS = 1000 * 60 * 60 * 2;
const users = [
    {id:1,name:'keshava',email:'kskra@gmail.comm',password:"12345"},
    {id:2,name:'keshav',email:'kskra@gmail.com',password:"1234"}
]
app.use(session({
    name: "Auth dsession",
    secret: "DRSMOM",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: TWO_HOURS,
        sameSite: true,
        secure: false
    }
}));
app.use(bodyParser.urlencoded({ 
    extended: true 
}))
const redirectLogin = (req,res,next) => {
    if(!req.session.userId){
        res.redirect('/login')
    }
    else {
        next();
    }
}
const redirectHome = (req,res,next) =>{
    if(req.session.userId){
        res.redirect('/home')
    }else{
        next();
    }
}
app.get('/', (req, res) => {
    const {userId} = req.session;
    console.log(userId);
    console.log(req.session);
    res.send(`<h1>Welcome!</h1>
        ${userId ?
            `<a href = "/home">home</a>
        <form action="/logout" method = 'post'>
            <button>logout</button>
        </form>`
            :
            `<a href='/login'>Login</a>
        <a href='/register'>register</a>`
        }
        `)
    res.end();
})
app.get('/home',redirectLogin, (req, res) => {
    res.send(`<h1>Home</h1>
    <a href = '/'> Main</a>
    <ul> 
    <li>Name : </li>
    <li>Email : </li>
    </ul> 
    `)
})
app.get('/login',redirectHome, (req, res) => {
    res.send(`<h1>Login</h1>
 <form method = "post"  action="/login">
     <input type="email" name="email" placeholder="enter email" required/>
     <input type="password" name="password" placeholder="enter password" required/>
     <input type="submit"/>
 </form>
 <a href='/register'>Register</a>
 `)
    res.end()
})
app.get('/register',redirectHome, (req, res) => {
    res.send(`<h1>Register</h1>
    <form method = "post"  action="/register">
    <input type="text" name="name" placeholder="enter name" required/>
        <input type="email" name="email" placeholder="enter email" required/>
        <input type="password" name="password" placeholder="enter password" required/>
        <input type="submit"/>
    </form>
    <a href='/login'>login</a>
    `)
    res.end()
})
app.post('/login',redirectHome, (req, res) => {
    const {email,password} = req.body;
    
    if(email && password ){
        const user = users.find((element )=>{
            return element.email === email && element.password === password;
        })
        console.log("user"+user)
        if(user){
            req.session.userId = user.id;
        console.log("user id "+user.id)
            return res.redirect('/home');
        }
    }
    return res.redirect('/login')
})

app.post('/register',redirectHome, (req, res) => {
    const {name,email,password} = req.body;

    if(name && email && password){
        const exists = users.some(
            (user) => user.email === email 
        )
        if(!exists){
            const user = {
                id : users.length + 1,
                name,
                email,
                password
            }
            users.push(user)
            req.session.userId = user.id;
            return res.redirect('/home');
        }
    }
    res.redirect('/register')
})

app.post('/logout',redirectLogin, (req, res) => {
    req.session.destroy(function(err){
        if(err){
            return res.redirect('/home');
        }
        return res.clearCookie(req.session.name)
        res.redirect('/login')
    })
  })
  app.listen(Port, () => {
      console.log(`listening at : http://localhost:${Port}`);
  });
