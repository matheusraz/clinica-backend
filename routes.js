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
        let banco = JSON.parse(fs.readFileSync('banco.json').toString());
        let regra = req.body;
        let tipoRegra = regra.type;
        delete regra.type;

        if(tipoRegra === 'data') {
            const searchResult = checkInDB(banco.regras[tipoRegra], regra.day);
            if(searchResult !== false) {
                banco.regras[tipoRegra][searchResult].intervals.push(regra.interval);
            } else {
                let newDataRule = regra;
                newDataRule.intervals = [regra.interval];
                delete newDataRule.interval
                banco.regras[tipoRegra].push(newDataRule);
            }
        } else if(tipoRegra === 'diario') {
            banco.regras[tipoRegra].push(regra.interval);
        } else {
            let days = [regra.day];
            if(regra.day.indexOf('|') > -1) {
                days = regra.day.split('|');
            }
            days.forEach(day => {
                let searchResult = checkInDB(banco.regras[tipoRegra], day);
                if(searchResult !== false) {
                    banco.regras[tipoRegra][searchResult].intervals.push(regra.interval);
                } else {
                    let newSemanalRule = {
                        day: day,
                        intervals: [regra.interval]
                    };
                    banco.regras[tipoRegra].push(newSemanalRule);
                }
            });
        }

        fs.writeFileSync('banco.json', JSON.stringify(banco));
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
        let jsonDate = {
            day: date,
            intervals: []
        };
        banco.regras.data.forEach(time => {
            if(time.day === date) {
                jsonDate.intervals = jsonDate.intervals.concat(time.intervals);
            }
        });
        results.push(jsonDate);
    });

    daysOfDates.forEach((day, index) => {
        banco.regras.semanal.forEach(diaSemana => {
            if(diaSemana.day === day) {
                results[index].intervals = results[index].intervals.concat(diaSemana.intervals);
            }
        });
    });

    results.forEach(dateResult => {
        banco.regras.diario.forEach(dia => {
            dateResult.intervals.push(dia);
        });
    });

    res.json(responseMessage(['status', 'msg'], [1, results]));

});

const checkInDB = (lista, value) => {

    let index = 0;
    while(index < lista.length) {
        if(value === lista[index].day) return index;
        index++;
    }

    return false;

}

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