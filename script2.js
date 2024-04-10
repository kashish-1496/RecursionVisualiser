const code = `
function exampleFunction(a, b) {
    let c = a + b;
    let d = c * 2;
    console.log('Result:', d);
    return d;
}
`;

// Parse the code
const parsedCode = esprima.parseScript(code);

// Function to log variables after every statement
const logVariables = (node) => {
    if (node.type === 'VariableDeclaration') {
        node.declarations.forEach(declaration => {
            console.log(`Variable ${declaration.id.name} is ${declaration.init.value}`);
        });
    }
};

// Modify the function definition to call a function at the beginning and before return
estraverse.traverse(parsedCode, {
    enter: (node) => {
        if (node.type === 'FunctionDeclaration') {
            // Call a function at the beginning
            node.body.body.unshift({
                type: 'ExpressionStatement',
                expression: {
                    type: 'CallExpression',
                    callee: {
                        type: 'Identifier',
                        name: 'beginFunction'
                    },
                    arguments: []
                }
            });
        }
        if (node.type === 'ReturnStatement') {
            // Call a function before return
            node.argument = {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'beforeReturnFunction'
                },
                arguments: [node.argument]
            };
        }
    }
});

// Log variables after every statement
estraverse.traverse(parsedCode, {
    leave: (node) => {
        logVariables(node);
    }
});

// Generate modified code
const modifiedCode = escodegen.generate(parsedCode);

console.log(modifiedCode);