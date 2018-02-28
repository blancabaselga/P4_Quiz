const readline = require('readline');
 const model = require ('./model');
 const {log, biglog ,errorlog, colorize} = require("./out"); 
/**
* Muestra la ayuda
*/

exports.helpCmd = rl => {
	log('Commandos:');
	log('h|help - Muestra esta ayuda.');
	log('list - Listar los quizzes existentes.');
	log('show <id> - Muestra la pregunta y la respuesta del quiz indicado.');
	log('add - añadir un nuevo quiz interactivamente.');
	log('delete <id> - Borrar el quiz indicado.');
	log('edit <id> - Editar el quiz indicado.');
	log('test <id> - Probar el quiz indicado.');
	log('p|play - Jugar a preguntar aleatoriamente todos los quizzes.');
	log('credits - Créditos.');
	log('q|quit - Salir del programa.');
	rl.prompt();
};


/**
* Lista todos los quizzes existentes en el modelo 
*/

exports.listCmd = rl => {
	model.getAll().forEach((quiz,id) => {
		log(`[${colorize(id,'magenta')}] : ${quiz.question}`);
	});
	rl.prompt();
};


/**
* Muestra el quiz indicado en el parámetro: la pregunta y la respuesta
*
* @param id Clave del quiz a mostrar.
*/

exports.showCmd = (rl,id) => {
	if ( typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
	} else{
		try{
			const quiz = model.getByIndex(id);
			log(`[${colorize(id,'magenta')}] : ${quiz.question} ${colorize('=>','magenta')} ${quiz.answer}`);
		} catch(error){
			errorlog(error.message);
		}
	}
	rl.prompt();
};


/**
* Añade un nuevo quiz al modelo.
* Pregunta interactivamente por la pregunta y la respuesta.
*/

exports.addCmd = rl => {
	rl.question(colorize('Introduzca una pregunta: ','red'), question => {
		rl.question(colorize('Introduzca la respuesta: ','red'), answer =>{
			model.add(question,answer);
			log(`[${colorize('Se ha añadido','magenta')}] : ${question} ${colorize('=>','magenta')} ${answer}`);
			rl.prompt();
		});
	});
	
};


/**
* Borra un quiz del modelo.
*
* @param id Clave del quiz a borrar en el modelo.
*/

exports.deleteCmd = (rl,id) => {
	if ( typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
	} else{
		try{
			model.deleteByIndex(id);

		} catch(error){
			errorlog(error.message);
		}
	}
	rl.prompt();
};


/**
* Edita un quiz del modelo.
*
* @param id Clave del quiz a editar en el modelo
*/

exports.editCmd = (rl,id) => {
	if (typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	}else{
		try{
			const quiz = model.getByIndex(id);
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
				rl.question(colorize('Introduzca una pregunta: ','red'), question => {
					process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);
						rl.question(colorize('Introduzca la respuesta: ','red'), answer => {
							model.update(id, question, answer);
							log(`Se ha cambiado el quiz ${colorize(id,'magenta')} por : ${question} ${colorize('=>','magenta')} ${answer}`);
							rl.prompt();
				});
				
			});
		}catch(error){
			errorlog(error.mensaje);
			rl.prompt();
		}
	}
};


/**
* Prueba un quiz, es decir, hace una pregunta del modelo a la que debemos contestar.
*
* @param id Clave del quiz a probar.
* Implementado por el alumno.
*/



exports.testCmd = (rl,id) => {
	if (typeof id === "undefined"){
		errorlog(`Falta el parámetro id.`);
		rl.prompt();
	}else{
		try{
			const quiz = model.getByIndex(id);

			//log(`[${colorize(id,'magenta')}] : ${quiz.question}`);

			rl.question(colorize(`${quiz.question}? `,'red'), answer => {
							
					if(quiz.answer.toLowerCase() === answer.trim().toLowerCase()){

						log(`Su respuesta es correcta.`);
						// biglog('Correcta','green');
						rl.prompt();

					} else{
						log(`Su respuesta es incorrecta. `);
						// biglog('Incorrecta','red');
						rl.prompt();

					};	
				});

		}catch(error){
			errorlog(error.mensaje);
			rl.prompt();
		}
	}
};



/**
* Pregunta todos los quizzes existentes en el modelo en orden aleatorio.
* Se gana si se contesta a todos satisfactoriamente.
*/

exports.playCmd = rl => {

	let score = 0;

	let toBeResolved = []; // Array con todos los ids de las preguntas que existen array de tamaño model.count

	for (i = 0; i < model.count(); i++) {
    toBeResolved[i] = i;
	};

	const playOne = () => {
	if(toBeResolved.length == 0){
		log('No hay nada más que preguntar.');
		log('Fin del examen. Aciertos:');
		biglog(`${score}`);
		rl.prompt();
	}else{

		let tamaño = toBeResolved.length - 1;

		let id = toBeResolved[Math.trunc(Math.random() * tamaño)];

		let quiz = model.getByIndex(id);

		for (i=0; i<toBeResolved.length; i++){
				if(toBeResolved[i] == id){
					//delete toBeResolved[i];
					toBeResolved.splice(i, 1);
				}
			}	

		rl.question(colorize(`${quiz.question}? `,'red'), answer => {
							
		if(quiz.answer.toLowerCase() === answer.trim().toLowerCase()){

			score = score+1;
			log(`Correcto - Lleva ${score} aciertos. `);
			
			playOne();

		} else{
			log('Incorrecto');
			log('Fin del examen. Aciertos:');
			biglog(`Aciertos : ${score}`,'magenta');
			rl.prompt();
			// Salgo de este método 
			};	
		});


		}
	}
 playOne();

};



/**
* Muestra el nombre del autor de la práctica.
*/

exports.creditsCmd = rl => {
	log('Autora de la práctica: ');
	log('Blanca Baselga Penalva');
	rl.prompt();
};

/**
* Terminar el programa.
*/

exports.quitCmd = rl => {
	rl.close();
	rl.prompt();
};
