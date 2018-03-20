    
	const figlet = require('figlet');
	const chalk = require('chalk');


    /**
	* Dar color a un string.
	*
	* @param msg El string al que hay que dar color.
	* @param color El color con el que pintar msg.
	* @returns {string} Devuelve el string msg con el color indicado.
	*/

	const colorize = (msg,color) => {

		if (typeof color !== "undefined") {
			msg = chalk[color].bold(msg);
		};

		return msg;
	};


	/**
	* Escribe un mensaje de log.
	*
	* @param msg El string al que hay que dar color.
	* @param color El color con el que pintar msg.
	*/

	const log = (socket , msg, color) => {

		socket.write(colorize(msg,color) + "\n");
	};

	/**
	* Escribe un mensaje de log en grande.
	*
	* @param msg El string al que hay que dar color.
	* @param color El color con el que pintar msg.
	*/

	const biglog = (socket,msg,color) => {

		log(socket,figlet.textSync(msg,{horizontalLayout: 'full'}),color);
	};

	/**
	* Escribe el mensaje de error emsg.
	*
	* @param emsg Texto del mensaje de error.
	*/

	const errorlog = (socket,emsg) => {

		socket.write(`${colorize("error","red")} : ${colorize(colorize(emsg,"red"),"bgYellowBright")}\n`);
	};
 
 	exports = module.exports = {
 		colorize ,
 		log ,
 		biglog ,
 		errorlog
 	};


