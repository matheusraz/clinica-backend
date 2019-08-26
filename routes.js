const router = require('express').Router();
const fs = require('fs');

responseMessage = (keys, values) => {
    try {
        let response = {};
        for(let i = 0; i < keys.length; ++i) {
            let key = keys[i];
            response[key] = values[i];
        }
        return response;
    } catch (err) {
        console.log(err.stack);
    }
}

router.get('/', (req, res) => {
    res.json(responseMessage(['status', 'msg'], ['1', 'Funfou!']));
});

router.post('/cadastrarRegra', (req, res) => {

    try {
        let arq = JSON.parse(fs.readFileSync('banco.json').toString());
        let regra = req.body;
        let tipoRegra = regra.type;
        delete regra.type;
        arq.regras[tipoRegra].push(regra);
        fs.writeFileSync('banco.json', JSON.stringify(arq));
        res.json(responseMessage(['status', 'msg'], [1, 'Regra Cadastrada com Sucesso!']))
    } catch(err) {
        console.log(err);
        res.json(responseMessage(['status', 'msg'], [0, "Erro ao Cadastrar Regra :("]));
    }

});

router.delete('/deletarRegra', (req, res) => {


});

router.get('/listarRegras', (req, res) => {

    let arq = JSON.parse(fs.readFileSync('banco.json').toString());
    res.json(responseMessage(['status', 'msg'], [1, arq.regras]));

});

router.get('/listarHorarios', (req, res) => {

    const horarios = req.headers.horarios.split('|');
    const horarioInicio = new Date(inverteData(horarios[0]));
    const horarioFim = new Date(inverteData(horarios[1]));

    let datesRange = getDates(horarioInicio, horarioFim);
    datesRange = datesRange.map(returnDateInFormat);
    const daysOfDates = datesRange.map(diaDaSemana);
    datesRange = datesRange.map(inverteData);
    
    let banco = JSON.parse(fs.readFileSync('banco.json').toString());

    const results = [];

    datesRange.forEach(date => {
        banco.regras.dia.forEach(time => {
            if(time.day === date) results.push({interval: time.interval});
        });
    });

    daysOfDates.forEach(day => {
        banco.regras.semanal.forEach(diaSemana => {
            if(diaSemana.days.split('|').includes(day)) results.push({interval: diaSemana.interval});
        });
    });

    banco.regras.diario.forEach(dia => {
        results.push(dia);
    });

    res.json(responseMessage(['status', 'msg'], [1, results]));

});

const returnDateInFormat = (date) => {
    return date.toISOString().replace(/T/, ' ').replace(/\..+/, '').split(' ')[0];
}

const inverteData = (data) => {

    let formatted = '';
    const dateSplitted = data.split('-');
    let index = 2;
    while(index >= 0) {
        if(index != 0) formatted += dateSplitted[index] + '-';
        else formatted += dateSplitted[index];
        index--;
    }
    return formatted;
};

const diaDaSemana = (data) => {
    const dias = ['domingo','segunda','terça','quarta','quinta','sexta','sabado'];
    let dia = dias[new Date(data).getDay()];
    return dia;
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

const getDates = (startDate, stopDate) => {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(new Date (currentDate));
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}


module.exports = router;