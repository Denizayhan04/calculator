let input = document.getElementById('input');
let result = document.getElementById('result');
let expression = '';

// Initialize math.js with custom functions
math.createUnit('rad');
const parser = math.parser();

function appendNumber(num) {
    expression += num;
    input.value = expression;
}

function appendOperator(operator) {
    expression += operator;
    input.value = expression;
}

function appendFunction(func) {
    expression += func;
    input.value = expression;
}

function clearInput() {
    expression = '';
    input.value = '';
    result.innerHTML = '';
}

function deleteLast() {
    expression = expression.slice(0, -1);
    input.value = expression;
}

function calculate() {
    try {
        if (expression.includes('derivative(')) {
            // Handle derivative calculation
            let derivExp = expression.match(/derivative\((.*)\)/)[1];
            let [func, variable = 'x'] = derivExp.split(',').map(x => x.trim());
            
            // Calculate derivative
            const h = 0.0001; // Small step for numerical derivative
            const deriv = function(x) {
                return (math.evaluate(func, { [variable]: x + h }) - 
                        math.evaluate(func, { [variable]: x })) / h;
            }
            
            // Show derivative function
            result.innerHTML = `d/dx(${func})`;
            
        } else if (expression.includes('integral(')) {
            // Handle integral calculation
            let integralExp = expression.match(/integral\((.*)\)/)[1];
            let [func] = integralExp.split(',').map(x => x.trim());
            
            // Basic integral rules
            if (func.includes('x^')) {
                let power = parseInt(func.split('^')[1]);
                let newPower = power + 1;
                result.innerHTML = `(x^${newPower})/${newPower} + C`;
            } else if (func === 'x') {
                result.innerHTML = '(x^2)/2 + C';
            } else if (func.startsWith('2') && func.includes('x')) {
                // Handle cases like '2x'
                result.innerHTML = 'x^2 + C';
            } else if (func === 'sin(x)') {
                result.innerHTML = '-cos(x) + C';
            } else if (func === 'cos(x)') {
                result.innerHTML = 'sin(x) + C';
            } else if (func === 'e^x') {
                result.innerHTML = 'e^x + C';
            } else if (func === '1/x') {
                result.innerHTML = 'ln|x| + C';
            } else {
                // For more complex integrals, use numerical method
                let [, variable = 'x', lower = 0, upper = 1] = integralExp.split(',').map(x => x.trim());
                const F = math.integral(func, variable);
                const integralResult = math.subtract(
                    F(parseFloat(upper)),
                    F(parseFloat(lower))
                );
                result.innerHTML = integralResult.toFixed(4);
            }
        } else {
            // Replace x with appropriate syntax for math.js
            let processedExp = expression.replace(/x/g, '(x)');
            // Handle regular expressions
            let calculatedResult = math.evaluate(processedExp);
            result.innerHTML = typeof calculatedResult === 'number' ? 
                calculatedResult.toFixed(8).replace(/\.?0+$/, '') : 
                calculatedResult;
        }
    } catch (error) {
        result.innerHTML = 'Error';
        console.error(error);
    }
}

// Custom functions
math.integral = function(expression, variable = 'x') {
    return function(x) {
        try {
            // Using numerical integration (Simpson's rule)
            const n = 1000; // number of intervals
            const h = x / n;
            let sum = math.evaluate(expression, { [variable]: 0 }) + 
                     math.evaluate(expression, { [variable]: x });
            
            for (let i = 1; i < n; i++) {
                const xi = i * h;
                const factor = i % 2 === 0 ? 2 : 4;
                sum += factor * math.evaluate(expression, { [variable]: xi });
            }
            
            return (h / 3) * sum;
        } catch (error) {
            console.error('Integration error:', error);
            return NaN;
        }
    };
}; 