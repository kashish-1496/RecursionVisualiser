const esprima = require('esprima');
const escodegen = require('escodegen');

// Sample recursive function (replace with your actual function)
const code = `
function fibbo(n) {
  if (n <= 1) {
    return n;
  }
  return fibbo(n - 1) + fibbo(n - 2);
}
`;

// Parse the code using Esprima
const ast = esprima.parseScript(code);

// Find the function declaration node
const functionNode = ast.body.find(node => node.type === 'FunctionDeclaration');
let fname = functionNode.id.name;
function traverse(node, fname) {
	if (!node) return node;
	if (node.type) {
		console.log(node.type);
		if (node.type === 'FunctionDeclaration'){
			fname = node.id.name;
			node.async = true;
			console.log(node);
		}
		
		for (var key in node) {
			node[key] = traverse(node[key], fname);
		}

		if (node.type === 'CallExpression' &&
			node.callee.name === fname) {
			node.callee.name = fname+"Wrapper"
			// Replace recursive call with awaited version
			node = {
				type: 'AwaitExpression',
				argument: node
			};
		}
	}
	else if (Array.isArray(node)) {
		for (let i = 0; i < node.length; i++) {
			node[i] = traverse(node[i], fname);
		}
		return node;
	}
	return node;
}

// Recursively rewrite the function declaration and its descendants
traverse(functionNode);

// let wrapperFunction = JSON.parse(JSON.stringify(functionNode));
// wrapperFunction.id.name = wrapperFunction.id.name + "Wrapper";
// wrapperFunction.body.body = [functionNode];
// ast.body = [wrapperFunction];

// console.log(ast);
// // Generate the modified code using Escodegen






const modifiedCode = escodegen.generate(ast);
const wrapperCode = `
    function sleep(t){
        return new Promise((resolve, reject) => {
            setTimeout(function(){
                resolve();
            }, t * 1000);
        })
    }
    function pushNodeAnimation(text, time = 2) {
        let nodeDiv = document.createElement("div");
        nodeDiv.innerHTML = text;
        nodeDiv.classList.add("element");
        nodeDiv.classList.add("pushAnimator");
        document.querySelector(".stack").appendChild(nodeDiv);
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                nodeDiv.classList.remove("pushAnimator");
                resolve(nodeDiv);
            }, time * 1000)
        })
    }
    function popNodeAnimation(nodeDiv, time = 2){
        nodeDiv.classList.add("popAnimator");
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                document.querySelector(".stack").removeChild(nodeDiv);
                resolve();
            }, time * 1000)
        })
    }
    (async function ${fname}Wrapper() {
        let node = await pushNodeAnimation(JSON.stringify([...arguments]), 2);
        console.log(node);
        ${modifiedCode}
        let result = await ${fname}(...arguments);
        await sleep(0.6);
        await popNodeAnimation(node);
    })(...arguments);
`;

const AsyncFunction = async function () {}.constructor;

const wrapperFunction = new AsyncFunction(wrapperCode);
wrapperFunction(3);