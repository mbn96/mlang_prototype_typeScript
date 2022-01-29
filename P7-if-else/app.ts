import { Lexter } from "./lexer.js";
import readLine from 'node:readline'
import { stdin, stdout } from 'process'
import { Parser } from "./parser.js";
import { Interpreter } from "./Interpreter.js";
import { readSrc } from "./fs_utils.js";



async function start() {
    const interpreter: Interpreter = new Interpreter(null);

    function print(...params) {
        console.log(...params);
    }

    interpreter.addBuiltInFunctions([{ name: 'print', func: print },
    { name: 'sqrt', func: Math.sqrt },
    { name: 'pow', func: Math.pow }])

    console.log(process.argv);


    if (process.argv.length > 2) {
        const path = process.argv[2];
        const src = await readSrc(path);

        const lexer: Lexter = new Lexter(src);
        const tokens = lexer.tokenize();
        console.log(tokens);


        const parser: Parser = new Parser(tokens);
        const parsRes = parser.parse();
        console.log(JSON.stringify(parsRes, undefined, 4));
        interpreter.ast = parsRes;
        console.log(interpreter.Solve());
        // interpreter.Solve();

    } else {
        const rl = readLine.createInterface(stdin, stdout);
        rl.on('line', (line) => {
            if (line === 'exit') {
                rl.close()
                return;
            }
            const lexer: Lexter = new Lexter(line);
            const tokens = lexer.tokenize();
            console.log(tokens);


            const parser: Parser = new Parser(tokens);
            const parsRes = parser.parse();
            console.log(JSON.stringify(parsRes, undefined, 4));
            interpreter.ast = parsRes;
            console.log(interpreter.Solve());
            // // interpreter.Solve();
        })
    }
}


start();
