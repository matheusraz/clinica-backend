const express = require('express');
const server = express();
const routes = require('./routes');
const cors = require('cors');
const bodyParser = require('body-parser');
let swaggerUi = require('swagger-ui-express');
let swaggerDocument = require('./swagger.json');
let port = 3000;

server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.use('/documentacao', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
server.use(routes);

server.listen(3000, (err) => {
    if(err) {
	    console.log("Não foi possivel levantar servidor!");
    } else {
        console.log(`Servidor rodando na porta ${port}!`);
    }
      
})