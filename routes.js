const router = require('express').Router();
const fs = require('fs');

router.get('/', (req, res) => {
    res.json(responseMessage(['status', 'msg'], ['1', 'Funfou!']));
});

router.post('/cadastrarRegra', (req, res) => {

    try {
        let banco = JSON.parse(fs.readFileSync('banco.json').toString());
        let regra = req.body;
        let tipoRegra = regra.type;
        delete regra.type;

        let interval = {
            id: banco.currentId,
            start: regra.interval.start,
            end: regra.interval.end,
        }

        if(tipoRegra === 'data') {
            const searchResult = checkInDB(banco.regras[tipoRegra], regra.day);
            if(searchResult !== false) {
                banco.regras[tipoRegra][searchResult].intervals.push(interval);
            } else {
                let newDataRule = {
                    day: regra.day,
                    intervals: [interval],
                }
                banco.regras[tipoRegra].push(newDataRule);
            }
            banco.currentId++;
        } else if(tipoRegra === 'diario') {
            banco.regras[tipoRegra].push(interval);
            banco.currentId++;
        } else {
            let days = [regra.day];
            if(regra.day.indexOf('|') > -1) {
                days = regra.day.split('|');
            }
            days.forEach(day => {
                interval = {
                    id: banco.currentId,
                    start: regra.interval.start,
                    end: regra.interval.end,
                }
                let searchResult = checkInDB(banco.regras[tipoRegra], day);
                if(searchResult !== false) {
                    banco.regras[tipoRegra][searchResult].intervals.push(interval);
                } else {
                    let newSemanalRule = {
                        day: day,
                        intervals: [interval]
                    };
                    banco.regras[tipoRegra].push(newSemanalRule);
                }
                banco.currentId++
            });
        }

        fs.writeFileSync('banco.json', JSON.stringify(banco));
        res.json(responseMessage(['status', 'msg'], [1, 'Regra Cadastrada com Sucesso!']))
    } catch(err) {
        console.log(err);
        res.json(responseMessage(['status', 'msg'], [0, "Erro ao Cadastrar Regra :("]));
    }

});

router.delete('/deletarRegra/:id', (req, res) => {

    let banco = JSON.parse(fs.readFileSync('banco.json').toString());

    const id = parseInt(req.params.id);

    const deleteInfos = findHorarioById(id, banco);

    if(deleteInfos !== false) {
        if(deleteInfos.length === 3) {
            if(banco.regras[deleteInfos[0]][deleteInfos[1]].intervals.length === 1) {
                banco.regras[deleteInfos[0]].splice(deleteInfos[1],1);
            } else {
                banco.regras[deleteInfos[0]][deleteInfos[1]].intervals.splice(deleteInfos[2], 1);
            }
        } else {
            banco.regras[deleteInfos[0]].splice(deleteInfos[1],1);
        }
        fs.writeFileSync('banco.json', JSON.stringify(banco));
        res.json({status: 1, msg: 'regra deletada com sucesso!'});
    } else {
        res.json({status: 0, msg: 'Não foi possível encontrar esta regra :('});
    }
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

const findHorarioById = (id, banco) => {

    const regras = ['data', 'diario', 'semanal'];

    let retorno = false

    regras.forEach(regra => {
        if(regra !== 'diario'){
            let i = 0;
            let achou = false;
            while(!achou && i < banco.regras[regra].length){
                let index = 0;
                let value = banco.regras[regra][i];
                while(!achou && index < value.intervals.length) {
                    interval = value.intervals[index];
                    if(interval.id === id) {
                        retorno = [regra, i, index];
                        achou = true;
                    }
                    index++;
                }
                i++;
            }
        } else {
            let index = 0;
            let achou = false;
            while(!achou && index < banco.regras[regra].length) {
                diario = banco.regras[regra][index];
                if(diario.id === id) {
                    retorno = [regra, index];
                    achou = true;
                }
                index++;
            }
        }
    });

    return retorno;
}

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

const responseMessage = (keys, values) => {
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




module.exports = router;