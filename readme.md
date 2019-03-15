Serverless Lambda Controller
============================
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)

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

API
---

### Properties

#### query
An Object containing data in the html query string as `key: value`

#### path
The Path that the request was made to on API Gateway

#### Params
The Path parameters 

#### method
The HTTP method in uppercase i.e. `POST` or `GET`

#### header
An Object containing the http headers as a key value pair `header: value`

### Methods

All setting methods are chainable.

#### addHeader

__Params__

- header: string - the header name to add to the response 
- value: string|number - the value of the header

__Returns__

- the instance of the controller

Adds the header to the response 

#### status

__Params__

- code: number - the http code i.e. 200, 404

__Returns__

- the instance of the controller

Sets the http status code

#### body 

__Params__

- string: string - the contents of the body

__Returns__

- the instance of the controller

Adds the response body

#### type

__Params__

- string: type - the mime type

__Returns__

- the instance of the controller

Sets the mime type of the response i.e. the `Content-Type` header

### json

__Params__

- object: object - the object to serialize into JSON

Sets the body to a JSON serialised string, as well sets the content-type correctly

#### send 

Sends the reponse creatd using the setter methods

#### sendJson

A short cut to send a JSON Serialised response. 

#### notFound

Sends back a HTTP 404 error 

#### serverError

Sends back a HTTP 500 errror

#### badRequest

Sends back a HTTP 400 error

#### error

__Params__

- code: number - the http status code 
- message: string - the error message to send. 

Sends back a HTTP Error