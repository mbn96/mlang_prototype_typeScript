import { Lexter } from "./lexer.js";
import readLine from 'node:readline'
import { stdin, stdout } from 'process'
import { Parser } from "./parser.js";
import { Interpreter } from "./Interpreter.js";


const rl = readLine.createInterface(stdin, stdout);
const interpreter: Interpreter = new Interpreter(null);

function print(...params) {
    console.log(...params);
}

interpreter.addBuiltInFunctions([{ name: 'print', func: print }])


rl.on('line', (line) => {
    if (line === 'exit') {
        rl.close()
        return;
    }
    const lexer: Lexter = new Lexter(line);
    const tokens = lexer.tokenize();
    // console.log(tokens);
    const parser: Parser = new Parser(tokens);
    const parsRes = parser.parse();
    // console.log(JSON.stringify(parsRes, undefined, 4));
    interpreter.ast = parsRes;
    // console.log(interpreter.Solve());
    interpreter.Solve();
})



