// includes
// npm install express mongoose method-override body-parser ejs --save
// QUINTA

var express  = require("express"),
    app      = express(),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser");
    
// initial settings
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

// database settings
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/pelada_db");

// DATABASE SCHEMAS
//--------------------------------------------
// Settings
var settingSchema = new mongoose.Schema({
    num_players: Number,
    num_players_team: Number
});
var Setting = mongoose.model("Setting", settingSchema);
//--------------------------------------------
// Players
var playerSchema = new mongoose.Schema({
    name: { type: String, index: true },
    skill: Number,
    goalkeeper:  {type: Boolean, default: false },
    email: String,
    password: String,
    phone: String
});
var Player = mongoose.model("Player", playerSchema);
//--------------------------------------------
// Events
var eventSchema = new mongoose.Schema({
    dt_event: {type: Date, default: Date.now},
    player : String,
    skill: Number,
    order: Number,
    team: Number,
    goalkeeper: Boolean,
    monthly: {type: Boolean, default: false},
    confirmed: {type: Number, default: 0} // 0 - nao se pronunciou, 1 - confirmado, 2 - falta
});
var Event = mongoose.model("Event", eventSchema);

// Dados iniciais
/*
Setting.create(
    {   num_players: 18,
        num_players_team: 6
    }, function(erro, setting){
        if(erro){
            console.log(erro);
        }
        else {
            console.log(setting);
        }
    }
);
*/

/* ------- global variables and functions ------ */

index = 0;
array = [1, 2, 3];

function getRandom(max) {
    return Math.floor(Math.random() * max + 1)
}

function Sorteia() {
    // se array for zerado, recria
    if(array.length == 0){
        array = [1, 2, 3];
    }
    
    index = getRandom(array.length) ; //sorteia um item    
    sorteio = array[index - 1]; //pega o valor    
    array.splice(index - 1, 1); //remove sorteado
    //retorna o valor
    return sorteio;
}

/* ------------------ ROUTES ------------------*/

// Root Route
app.get("/", function(req, res) {
    //Welcome message
    res.redirect("/mensalistas");
});

// Index Route
app.get("/mensalistas", function(req, res) {
    // get all mensalistas from DB
    Player.find({}, function(err, mensalistas){
        if(err){
            
        }
        else {
            res.render("mensalistas", {mensalistas:mensalistas});
        }
    }).sort({skill:-1});
});

app.post("/mensalistas", function(req, res) {
    //create a new record on database
    Player.create(req.body.player, function(err, adicionado){
        if(err){
            console.log("oops");
        }
        else {
            res.redirect("mensalistas");
        }
    });
});

app.post("/events", function(req, res) {
    // Get Data from form
    var player = req.body.event.player;
    var skill = req.body.event.skill;
    var goalkeeper = req.body.event.goalkeeper;
    var monthly = false;
    
    
    var start = new Date();
    start.setHours(0,0,0,0);
    var end = new Date();
    end.setHours(23,59,59,999);
    
            
    Event.find({monthly:false, dt_event: {$gte: start, $lt: end}}, function(err, events){
        if(err){
            console.log(err);
        } else {
            global.nextOrder = events.length + 1;
            var newEvent = {player: player, skill: skill, goalkeeper: goalkeeper, monthly: monthly, order:global.nextOrder };
            
            Event.create(newEvent, function(err, adicionado){
                if(err){
                    console.log("oops");
                }
                else {
                    res.redirect("events");
                }
            });
        }
    });
    
});

app.post("/diaristas", function(req, res) {
    // Get Data from form
    var player = req.body.event.player;
    var skill = req.body.event.skill;
    var goalkeeper = req.body.event.goalkeeper;
    var monthly = false;
    
    
    var start = new Date();
    start.setHours(0,0,0,0);
    var end = new Date();
    end.setHours(23,59,59,999);
    
            
    Event.find({monthly:false, dt_event: {$gte: start, $lt: end}}, function(err, events){
        if(err){
            console.log(err);
        } else {
            global.nextOrder = events.length + 1;
            var newEvent = {player: player, skill: skill, goalkeeper: goalkeeper, monthly: monthly, order:global.nextOrder };
            
            Event.create(newEvent, function(err, adicionado){
                if(err){
                    console.log("oops");
                }
                else {
                    res.redirect("lista");
                }
            });
        }
    });
    
});

app.get("/gerarlista", function(req, res) {
    Player.find({}, function(err, mensalistas){
        if(err){
            
        }
        else {
            /////////////////////////////////////////////////////////
            // Verify if exists Events for today
            var start = new Date();
            start.setHours(0,0,0,0);
            var end = new Date();
            end.setHours(23,59,59,999);
            
            Event.find({dt_event: {$gte: start, $lt: end}}, function(err, events){
                if(err){
                    console.log(err);
                }
                else {
                    if(events.length == 0){
                        // Só gera a lista se encontrar lista do dia
                        mensalistas.forEach(function(mensalista){
                            Event.create( {player: mensalista.name,
                                           skill: mensalista.skill,
                                           goalkeeper: mensalista.goalkeeper,
                                           monthly: true,
                                           confirmed: 0
                                          }, function(erro, evento){
                                    if (erro){
                                        console.log(erro);
                                    } else {
                                        //console.log(evento);
                                    }
                                }
                            );
                        }); 
                    }
                    res.redirect("/events");
                }
            });
        }
    });
});

app.get("/events", function(req, res) {
    // get all events from DB
    var start = new Date();
    start.setHours(0,0,0,0);
    var end = new Date();
    end.setHours(23,59,59,999);
    
    Event.find({dt_event: {$gte: start, $lt: end}}, function(err, events){
        if(err){
            console.log(err);
        }
        else {
            res.render("events", {events:events});
        }
    }).sort({team:1 , skill:-1 , monthly:-1, order:1});
});

app.get("/hab_dia", function(req, res) {
    // get all events from DB
    var start = new Date();
    start.setHours(0,0,0,0);
    var end = new Date();
    end.setHours(23,59,59,999);
    
    Event.find({dt_event: {$gte: start, $lt: end}, confirmed:1}, function(err, events){
        if(err){
            console.log(err);
        }
        else {
            res.render("hab_dia", {events:events});
        }
    }).sort({team:1, skill:-1,  monthly:-1, order:1});
});

app.get("/lista", function(req, res) {
    // get all events from DB
    var start = new Date();
    start.setHours(0,0,0,0);
    var end = new Date();
    end.setHours(23,59,59,999);
    
    Event.find({dt_event: {$gte: start, $lt: end}}, function(err, events){
        if(err){
            console.log(err);
        }
        else {
            res.render("lista", {events:events});
        }
    }).sort({team:1, monthly:-1, order:1, skill:-1});
});

app.get("/listazap", function(req, res) {
    // get all events from DB
    var start = new Date();
    start.setHours(0,0,0,0);
    var end = new Date();
    end.setHours(23,59,59,999);
    
    Event.find({dt_event: {$gte: start, $lt: end}, confirmed:1}, function(err, events){
        if(err){
            console.log(err);
        }
        else {
            res.render("listazap", {events:events});
        }
    }).sort({team:1, skill:-1, monthly:-1, order:1});
});

app.get("/mensalistas_habilidades", function(req, res) {
    // get all mensalistas from DB
    Player.find({}, function(err, mensalistas){
        if(err){
            
        }
        else {
            res.render("mensalistas_habilidades", {mensalistas:mensalistas});
        }
    }).sort({skill:-1});
});

//NEW PLAYER ROUTE
app.get("/mensalistas/new", function(req, res) {
    res.render("mensalistas_new");
});


// EDIT PLAYER ROUTE
app.get("/mensalistas/:id/edit", function(req, res){
   Player.findById(req.params.id, function(err, foundPlayer){
       if (err){
           res.redirect("/mensalistas");
       }
       else {
           res.render("mensalistas_edit", {player:foundPlayer});
       }
   });
});


// EDIT EVENT ROUTE
app.get("/events/:id/edit", function(req, res){
   Event.findById(req.params.id, function(err, foundEvent){
       if (err){
           res.redirect("/events");
       }
       else {
           res.render("events_edit", {event:foundEvent});
       }
   });
});

// UPDATE PLAYER ROUTE

app.put("/mensalistas/:id", function(req, res){
    // findByIdAndUpdate(id, newData, CallBack)
    Player.findByIdAndUpdate(req.params.id, req.body.player, function(err, updatedPlayer){
        if(err){
            res.redirect("/mensalistas");
        }
        else {
            res.redirect("/mensalistas");
        }
    });
    //res.send("UPDATE ROUTE");
});

// UPDATE EVENT ROUTE

app.put("/events/:id", function(req, res){
    // findByIdAndUpdate(id, newData, CallBack)
    Event.findByIdAndUpdate(req.params.id, req.body.event, function(err, updatedEvent){
        if(err){
            res.redirect("/events");
        }
        else {
            res.redirect("/events");
        }
    });
    //res.send("UPDATE ROUTE");
});

app.put("/listas/:id", function(req, res){
    // findByIdAndUpdate(id, newData, CallBack)
    Event.findByIdAndUpdate(req.params.id, req.body.event, function(err, updatedEvent){
        if(err){
            res.redirect("/lista");
        }
        else {
            res.redirect("/lista");
        }
    });
    //res.send("UPDATE ROUTE");
});

// DELETE ROUTE
app.delete("/mensalistas/:id", function(req, res){
    Player.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/mensalistas");
        } else {
            res.redirect("/mensalistas");
        }
    })
    //res.send("DELETE");
});

// DELETE ROUTE
app.delete("/events/:id", function(req, res){
    Event.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/events");
        } else {
            res.redirect("/events");
        }
    })
    //res.send("DELETE");
});



app.get("/sortear", function(req, res) {
    ////////////////////////////////////////////////////////
    // List events for today AQUI
    ////////////////////////////////////////////////////////
    var start = new Date();
    start.setHours(0,0,0,0);
    var end = new Date();
    end.setHours(23,59,59,999);
    
    Event.find({confirmed: 1, dt_event: {$gte: start, $lt: end}}, function(err, events){
        if(err){
            console.log(err);
        }
        else {
            console.log("Size: " + events.length);
            events.forEach(function(event){
                ///////////////////////////////////////////////
                //console.log("Player: " + event.player);
                var team = Sorteia();
                
                event.team = team;
                console.log("Sorteou time " + team.toString() + " [" + array.toString() + "] " + event.player.toString() + " Habilidade:" + event.skill.toString());
                
                Event.findByIdAndUpdate(event._id, event, function(err, updatedEvent){
                    if(err){
                        console.log(err)
                    }
                    else {
                        //console.log(updatedEvent);
                    }
                });
                
                
                
                ///////////////////////////////////////////////
            });
            res.redirect("/events");
        }
    }).sort({skill:-1});
});

// NEW EVENT ROUTE
app.get("/events/new", function(req, res) {
    res.render("events_new");
});

app.get("/diaristas/new", function(req, res) {
    res.render("diaristas_new");
});

app.get("*", function(req, res) {
    res.send("Oops, pagina nao encontrada!");
});

app.listen(3000, 'localhost', function(){
    console.log("Servidor do Baba foi iniciado!");
});