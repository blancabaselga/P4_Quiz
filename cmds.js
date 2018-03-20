const readline = require('readline');
 const {models}  = require ('./model');
 const {log, biglog ,errorlog, colorize} = require("./out"); 

 const Sequelize = require('sequelize');

 const net = require('net');
/**
* Muestra la ayuda
*/

exports.helpCmd = (socket,rl) => {
	log(socket, 'Commandos:');
	log(socket, 'h|help - Muestra esta ayuda.');
	log(socket, 'list - Listar los quizzes existentes.');
	log(socket, 'show <id> - Muestra la pregunta y la respuesta del quiz indicado.');
	log(socket, 'add - añadir un nuevo quiz interactivamente.');
	log(socket, 'delete <id> - Borrar el quiz indicado.');
	log(socket, 'edit <id> - Editar el quiz indicado.');
	log(socket, 'test <id> - Probar el quiz indicado.');
	log(socket, 'p|play - Jugar a preguntar aleatoriamente todos los quizzes.');
	log(socket, 'credits - Créditos.');
	log(socket, 'q|quit - Salir del programa.');
	rl.prompt();
};


/**
* Lista todos los quizzes existentes en el modelo 
*/

exports.listCmd = (socket,rl) => {
	models.quiz.findAll()
	.then(quizzes => {
		quizzes.forEach((quiz) => {
			log(socket,`[${colorize(quiz.id,'magenta')}]: ${quiz.question}`);
		})
	})
	.catch(() => {
		errorlog(socket, error.message);
	})
	.then(()=> {
		rl.prompt();
	});

};


/**
* Muestra el quiz indicado en el parámetro: la pregunta y la respuesta
*
* @param id Clave del quiz a mostrar.
*/

const validateId = id =>{
return new Sequelize.Promise((resolve,reject) => {
	if(typeof id === 'undefined'){
		reject(new Error(`Falta el parámetro <id>.`));
	}else{
		id=parseInt(id);
		if(Number.isNaN(id)){
			reject(new Error(`El valor del parámetro <id> no es un número.`));
		}else{
		resolve(id);
		}	
	}
});
};

exports.showCmd = (socket, rl,id) => {
	
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if(!quiz){
			throw new Error(`No existe un quiz asociado al id = ${id}.`)
		}
		log(socket,`[${colorize(quiz.id,'magenta')}] : ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
	})
	.catch(() => {
		errorlog(socket,error.message);
	})
	.then(()=> {
		rl.prompt();
	});


};


const makeQuestion = (rl, text) => {
return new Sequelize.Promise((resolve,reject) => {
	rl.question(colorize(text,'red'), answer => {
		resolve(answer.trim());
	});
});
};


/**
* Añade un nuevo quiz al modelo.
* Pregunta interactivamente por la pregunta y la respuesta.
*/


exports.addCmd = (socket,rl) => {
	makeQuestion(rl,'Introduzca una pregunta:')
	.then(q => {
		return makeQuestion(rl, 'Introduzca la respuesta: ')
		.then(a => {
			return {question: q, answer: a };
		});
	})
	.then(quiz =>{
		return models.quiz.create(quiz);
	})
	.then(quiz => {
		log(socket,`[${colorize('Se ha añadido','magenta')}] : ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket,'El quiz es erróneo.');
		error.errors.forEach(({message}) => errorlog(socket, message));
	})
	.catch((error) => {
		errorlog(socket,error.message);
	})
	.then(()=> {
		rl.prompt();
	});

};





/**
* Borra un quiz del modelo.
*
* @param id Clave del quiz a borrar en el modelo.
*/

exports.deleteCmd = (socket,rl,id) => {
	validateId(id)
	.then(id => models.quiz.destroy({where:{id}}))
	.catch(error => {
		errorlog(socket,error.message);
	})
	.then(()=> {
		rl.prompt();
	});
};


/**
* Edita un quiz del modelo.
*
* @param id Clave del quiz a editar en el modelo
*/



exports.editCmd = (socket,rl,id) => {
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if(!quiz){
			throw new Error (`No existe un quiz asociado al id = ${id}.`)
		}
		process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
		return makeQuestion(rl,'Introduzca la pregunta: ')
		.then(q => {
			process.stdout.isTTY && setTimeout(() =>{rl.write(quiz.answer)},0);
			return makeQuestion(rl,'Introduzca la respuesta')
			.then( a => {
				quiz.question = q;
				quiz.answer = a;
				return quiz;
			})
		})
	})
	.then(quiz => {
		return quiz.save();
	})
	.then(quiz => {
		log(socket,`Se ha cambiado el quiz ${colorize(quiz.id,'magenta')} por : ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
		rl.prompt();
	})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket,'El quiz es erróneo.');
		error.errors.forEach(({message}) => errorlog(socket,message));
	})
	.catch(error => {
		errorlog(socket,error.message);
	})
	.then(()=> {
		rl.prompt();
	});
}


/**
* Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
*
* @param id Clave del quiz a probar.
* Implementado por el alumno.
*/

exports.testCmd= (socket,rl,id) => {
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if(!quiz){
			throw new Error (`No existe un quiz asociado al id = ${id}.`)
		}
		return makeQuestion(rl,`${quiz.question} : `)
		.then(a => {
			if(quiz.answer.toLowerCase() === a.trim().toLowerCase()){

				log(socket,`Su respuesta es correcta.`);
					rl.prompt();
					} else{
						log(socket,`Su respuesta es incorrecta. `);
						rl.prompt();
					};	
			
		})
		})
	.catch(Sequelize.ValidationError, error => {
		errorlog(socket,'El quiz es erróneo.');
		error.errors.forEach(({message}) => errorlog(socket,message));
	})
	.catch(error => {
		errorlog(socket,error.message);
	})
	.then(()=> {
		rl.prompt();
	});
}

/**
* Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
* Se gana si se contesta a todos satisfactoriamente.
*/




exports.playCmd = (socket,rl) => {
	let score = 0;
	let toBeResolved = [];

	const playOne = () => {

		return Promise.resolve()
		.then (() => {
			if (toBeResolved.length <= 0) {
				log(socket,'fin');
				return;
			}

			let tamaño = toBeResolved.length - 1;
			let pos = Math.trunc(Math.random() * tamaño);
			let quiz = toBeResolved[pos];
			toBeResolved.splice(pos, 1);

			return makeQuestion(rl, `${quiz.question} : `)
			.then(a => {
				if(a.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
					score++;
					log(socket,'correcta');
					return playOne();
				} else {
					log(socket,'Incorrecta. fin de la partida. Su puntuación es:');
				}
			})
		})
	}
	models.quiz.findAll({raw: true})
	.then(quizzes => {
		toBeResolved = quizzes;
	})
	
	.then(() => {
		return playOne();
	})
	.catch(e => {
		log(socket,"error: " + e);
	})
	.then(() => {
		log(socket,score);
		rl.prompt();
	})
};
/**
* Muestra el nombre del autor de la práctica.
*/

exports.creditsCmd = (socket,rl) => {
	log(socket,'Autora de la práctica: ');
	log(socket,'Blanca Baselga Penalva');
	rl.prompt();
};

/**
* Terminar el programa.
*/

exports.quitCmd = (socket,rl) => {
	rl.close();
	rl.prompt();
	socket.end();
};
