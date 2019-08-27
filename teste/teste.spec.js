
const assert = require('assert');
const fs = require('fs');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = "http://localhost:3000"

describe('/GET ListarRegras', () => {
    it('Deve listar regras presentes no banco', (done) => {
        chai.request(server)
            .get('/listarRegras')
            .end((err, res) => {
                res.status.should.be.equal(200);
                res.body.should.have.property('status').equal(1);
                res.body.should.have.property('msg');
                done();
            });
    }).timeout(5000);
});

describe('/GET ListarHorarios', () => {
    it('Deve listar os horários disponíveis estabelecidos em um range de datas', (done) => {
        chai.request(server)
            .get('/listarHorarios')
            .set('horarios', '25-06-2018|29-06-2018')
            .end((err, res) => {
                res.status.should.be.equal(200);
                res.body.should.have.property('status').equal(1);
                res.body.should.have.property('msg');
                done();
            });
    }).timeout(5000);
});

describe('/POST CadastroDeRegraPorData', () => {
    it('Deve inserir uma regra de horario que valha para uma data específica', (done) => {
        let body = {
            "type": "data",
            "day": "25-06-2018",
            "interval": {
                "start": "9:00",
                "end" : "9:30"
            }
        };
        chai.request(server)
            .post('/cadastrarRegra')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json, text/plain, */*')
            .send(JSON.stringify(body))
            .end((err, res) => {
                res.status.should.be.equal(200);
                res.body.should.have.property('status').equal(1);
                res.body.should.have.property('msg');
                done();
            });
    }).timeout(5000);
});

describe('/POST CadastroDeRegraDiaria', () => {
    it('Deve inserir uma regra de horario que valha pra qualquer dia da semana', (done) => {
        let body = {
            "type": "diario",
            "interval": {
                "start": "13:30",
                "end": "14:00"
            }
        };
        chai.request(server)
            .post('/cadastrarRegra')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json, text/plain, */*')
            .send(JSON.stringify(body))
            .end((err, res) => {
                res.status.should.be.equal(200);
                res.body.should.have.property('status').equal(1);
                res.body.should.have.property('msg');
                done();
            });
    }).timeout(5000);
});

describe('/POST CadastroDeRegraSemanal', () => {
    it('Deve inserir uma regra de horario em algum dia ou dias da semana', (done) => {
        let body = {
            "type": "semanal",
            "day": "segunda|quarta",
            "interval": {
                "start": "10:30",
                "end": "11:00"
            }
        };
        chai.request(server)
            .post('/cadastrarRegra')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json, text/plain, */*')
            .send(JSON.stringify(body))
            .end((err, res) => {
                res.status.should.be.equal(200);
                res.body.should.have.property('status').equal(1);
                res.body.should.have.property('msg');
                done();
            });
    }).timeout(5000);
});

describe('/DELETE CadastroDeRegraSemanal', () => {
    it('Deve inserir uma regra de horario em algum dia ou dias da semana', (done) => {
        let body = {
            "id": 1
        };
        chai.request(server)
            .delete('/deletarRegra')
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json, text/plain, */*')
            .send(JSON.stringify(body))
            .end((err, res) => {
                res.status.should.be.equal(200);
                res.body.should.have.property('status').equal(1);
                res.body.should.have.property('msg');
                done();
            });
    }).timeout(5000);
});

describe('Zera Banco', () => {
    it('Deve zerar todos os dados do arquivo banco.json', () => {
        let bancoZerado = {
            "currentId": 1,
            "regras": {
                "data": [],
                "diario": [],
                "semanal": []
            }
        }
        fs.writeFileSync('banco.json', JSON.stringify(bancoZerado));
        let banco = JSON.parse(fs.readFileSync('banco.json').toString());
     
        assert.equal(banco.currentId, bancoZerado.currentId);
      });
});




