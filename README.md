# Argumentator

Easily create Nodejs CLI applications with *Argumentator*.  
This package lets you abstract from manually iterating through *process.args* array.  
Use *Argumentator* and it will to handle ```context``` object and ```--manual``` functionality for you.  
- Example usage in a [project](https://github.com/zhabinsky/figlify/blob/master/index.js)

# Install
```
npm i -save argumentator
```

# How to use

- ### Declare the arguments you expect to handle
```
const expectedArguments = [
  {
    flags: '--argument1',
    description: 'Disables console output',
    action: () => {
       return {
           a1: "aaaaaa"
       } 
    }
  },
  {
    flags: '--copy',
    description: 'Copies created figlets',
    value: {myValue: "hello"}
  }
];
```
- ### Ask *Argumentator* to build your context object
```
const expectedArguments = [ ... ];
const argumentator = require("argumentator");

const context = argumentator(expectedArguments);
```

# How does it work

- ### Run your app with arguments, like this
```
$ node myApp "text" "text2" --copy --name="John Doe"
```
- ### Argumentator will build the following context:
```
{
    // these are collected solely from arguments:
    
    texts: ["text", "text2"],
    copy: true,
    name: "John Doe",

    // these are assembled from expectedArgs
    // value and action parameters:
    
    a1:  "aaaaaa",
    myValue: "hello"
}
```

# *Argumentator* creates --manual
You don't have to worry about --manual for your CLI tool.  
*Argumentator* will automatically assemble ```--manual``` from expectedConfig.

- You will be able to use it like this on your app
```
$ node myApp --manual

Flags:    Description:                     
--------  ---------------------------------
--silent  Disables console output          
--copy    Copies created figlets           
--manual  Shows all available CLI arguments
```



This package is licensed under [MIT license](https://github.com/patorjk/figlet.js/blob/master/LICENSE.txt)