Serverless Lambda Controller
============================
[![DotMH Future Gadget Lab](https://img.shields.io/badge/DotMH-.dev-red.svg?style=flat-square)](https://www.dotmh.io)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d50a385134dd448cb574a137d53dc022)](https://www.codacy.com?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=dotmh/lambda-controller&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/d50a385134dd448cb574a137d53dc022)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=dotmh/lambda-controller&utm_campaign=Badge_Coverage)
[![Build Status](https://semaphoreci.com/api/v1/projects/723304e2-be24-4db6-9ebb-5f1f250b9841/2579135/badge.svg)](https://semaphoreci.com/dotmh/lambda-controller) [![Greenkeeper badge](https://badges.greenkeeper.io/dotmh/lambda-controller.svg?token=f4798213d338dd28ddb302eb1f782bcaa9c28e4570dbefa10131dc9280e7ce83&ts=1568120866930)](https://greenkeeper.io/)

A class to help make lambda function behind AWS API Gateway. 

It exposes some common methods to allow you to use Lambda behind API Gateway more as you would making a normal HTTP app. 

to use create a new controller 

```js
    const controller = require('@dotmh/lambda-controller');

    class MyController extends controller {}
```

you then need to declare a method or methods to handle your requests

```js
    const controller = require('@dotmh/lambda-controller');

    class MyController extends controller {

        handler() {
            // Your logic goes here
        }

    }
```

This will contain your functions logic for that request 

Lastly create a function to call your handler on your controller , and export the function as your serverless function 

```js
    const controller = require('@dotmh/lambda-controller');

    class MyController extends controller {

        handler() {
            // Your logic goes here
        }

    }

    module.exports.handler = (event, ctx, callback) => {
        (new MyController(event, ctx, callback)).handler();
    }    
```

Extending
---------
To keep the library as small as possible it doesn't include some functionality that
you may need. This includes POST body handling and also functionality like cookies etc. The system is designed to be extend however. The extention system is based on
mixin's this are just normal JS objects that are mixed in to the Lambda controller class. 

A mixin that adds a function (method) and getter would look like this 

```js
    const mixin = {
        hello: () => "Hello",
        get bye() {
            return "Goodbye"
        }
    }
```

You can then add the mixin to Lamda controller using the `add` method.

```js
    // ...
    (new MyController(event, ctx, callback)).add(mixin).handler();
    // ...
```

Inside your Controller class (the class that extends Lambda Controller) you can use the mixin methods , getters and setters as if they were originally defined on the main Lambda controller class. 

```js
    const Controller = require('@dotmh/lambda-controller');

    class MyController extends Controller {

        handler() {
            return this.bye;
        }

    }
```

### Initialising

You may want to do somethings on intialization of the extending mixin. Normally you would use the 
constructor for this but because of the way the addon system work, the constructor A) Can not be overridden or extends , and B) would have already fired. For this purpose you can use an "init" 
function. 

To use an init function declare a function called `init` on your mixin. 

```js 
    const mixin = {
        init() {
            // ... do something   
        },
        get foo() {
            return "bar"
        }
    }
```

your init function wont appear on the Controller after it has been added, but will be called when 
the mixin is added to the controller class. It is called in the content of the controller so 
`this` will refer to the controller object. 


API
---
<https://dotmh.github.io/lambda-controller>
