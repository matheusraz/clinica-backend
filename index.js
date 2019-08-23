const express = require('express');
const server = express();
const routes = require('./routes');
const cors = require('cors');
const bodyParser = require('body-parser');
let port = 3000;

server.use(cors());
server.use(routes);
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

server.listen(3000, (err) => {
    if(err) {
	    console.log("Não foi possivel levantar servidor!");
    } else {
        console.log(`Servidor rodando na porta ${port}!`);
    }
      
})