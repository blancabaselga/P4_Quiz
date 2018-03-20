
    const {log, biglog ,errorlog, colorize} = require("./out"); // importo las funciones y no el modulo entero

    const cmds = require("./cmds");

    const readline = require('readline');

    const net = require('net');

    net.createServer(socket => {


    	console.log('Se ha conectado un cliente desde' + socket.remoteAddress);

		biglog(socket,'CORE quiz','green');


		const rl = readline.createInterface({
		  input: socket,
		  output: socket,
		  prompt: colorize('quiz > ','blue'),   // Ojo la coma antes de copiar el "completer"
		  completer: (line) => { 
			  const completions = 'h help add delete edit list test p play credits q quit'.split(' ');
			  const hits = completions.filter((c) => c.startsWith(line));
			  // show all completions if none found
			  return [hits.length ? hits : completions, line];
		  }
		});

		socket
		.on('end', () => {rl.close();})
		.on('error', () => {rl.close();});
		

		rl.prompt();

		rl.on('line', (line) => {

		  let args = line.split(" ");
		  let cmd = args[0].toLowerCase().trim();  // Ojo cuando accedo a un array lo hago con paréntesis cuadrados.


		  switch (cmd) {

		  	case '': 
		  		rl.prompt();
		  	break;

		    case 'h':
		    case 'help':
				cmds.helpCmd(socket,rl);  // Llamo así a las funciones ya que he importado el modulo entero y no funcion a funcion
		    	break;

		    case 'q':
		    case 'quit':
				cmds.quitCmd(socket,rl);
				break;

		    case 'add':
		    	cmds.addCmd(socket,rl);
		    	break;

		    case 'list':
		    	cmds.listCmd(socket, rl);
		    	break;

		    case 'show':
		    	cmds.showCmd(socket, rl,args[1]);
		    	break;

		    case 'test':
		    	cmds.testCmd(socket, rl,args[1]);
		    	break;

		    case 'play':
		    case 'p':
		    	cmds.playCmd(socket,rl);
		    	break;

		    case 'delete':
		    	cmds.deleteCmd(socket, rl, args[1]);
		    	break;

		    case 'edit':
		    	cmds.editCmd(socket, rl, args[1]);
		    	break;

		    case 'credits':
		    	cmds.creditsCmd(socket, rl);
		    	break;

			default:
		      log(socket,`Comando desconocido: '${colorize(cmd,'red')}'`);
		      log(socket, `Use ${colorize('help','green')} para ver todos los comandos disponibles.`);
		      rl.prompt();
		      break;
		  }
		 
		})
		  .on('close', () => {
		  log(socket,'¡Adiós!');
		 
		});


    })
    .listen(3030);
	

	















