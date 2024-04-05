

// const data = [];
// const url  = 'https://api/v1/input=[]'

// //time should be printed with console.log

// function console(x) {
//     console.log(x)
// }

// console.log = (data) => {
//     console(data, Date.now())
// }



// console.log("Hello Ishan")

// const output = {
//     [input.a.b.c] : Input.a.b.c,
//     [] : 

// }

let input = {
    "a": {
        "b": {
          "c": 1,
        }
    },  
    "d": [
        45,
        78
    ],
    "z": true
}


const arr = []
const output = (input)=> {
    for(let key in input) {
        if(typeof input[key] === 'object'){
            const temp = key;
            console.log(temp + ".")
            arr.push(temp+".")
            output(input[key]);
        }
        else{
            console.log(key, input[key]);
            arr.push(key);
        }
    }
}

output(input);




