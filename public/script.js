var button = document.getElementById("doit");

button.addEventListener("click", function () {
    let inp = document.getElementById("callfunction");
    let val = inp.value;
    val = parseInt(val);
    console.log(val);
    if (!isFinite(val)) return;

    playFactorialRecursion(val);
})

async function playFactorialRecursion(n) {
    await playNodeAnimation("f(" + n + ")", 2);

    if (n <= 1) return 1;


    return n * playFactorialRecursion(n - 1);
}

// l.
async function changeFunction(def) {

}


async function myFunction(n) {
    if (n == 0) return 1;
    return n * myFunction(n - 1);
}

// Specify variables to log
const variablesToLog = ['n'];
function playRecursion(myFunction,variablesToLog) {

    // Convert the function to a string
    let myFunctionString = myFunction.toString();

    const functionName = myFunction.name;
    // Split the function string into lines
    let lines = myFunctionString.split('\n');

    // Add console.log statements after each line that modifies a specified variable

    let x = variablesToLog.map(variable => {
        return `
        try { 
            l["${variable}"]=${variable};
        }
        catch{ }`;
    })
    lines = lines.map(line => {
        return `${line}\n${x};`;
    });
    lines.splice (1,0,"await playNodeAnimation(JSON.stringify(l));\n");
    lines.splice(1, 0, x);
    lines.splice(1, 0, "let l = {};\n");
    // Reconstruct the modified function string
    lines.push(`\n ${functionName}(...arguments)`);
    myFunctionString = lines.join('\n');

    // Create a new function using Function constructor
    // console.log(myFunctionString);
    const AsyncFunction = async function () { }.constructor;
    const modifiedFunction = new AsyncFunction(myFunctionString);

    // Call the modified function
    modifiedFunction(6);
}

playRecursion(myFunction,variablesToLog);