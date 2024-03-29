![Lambda Controller Logo](https://raw.githubusercontent.com/dotmh/lambda-controller/master/logo.svg)

# Serverless Lambda Controller

[![DotMH Future Gadget Lab](https://img.shields.io/badge/DotMH-.dev-red.svg?style=for-the-badge)](https://www.dotmh.io)
[![Buy us a tree](https://img.shields.io/badge/Treeware-%F0%9F%8C%B3-lightgreen?style=for-the-badge)](https://plant.treeware.earth/dotmh/lambda-controller)
![NPM](https://img.shields.io/npm/l/@dotmh/lambda-controller?style=for-the-badge)
![npm bundle size](https://img.shields.io/bundlephobia/min/@dotmh/lambda-controller?style=for-the-badge)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.0%20adopted-ff69b4.svg?style=for-the-badge)](code_of_conduct.md)

[![Build Status](https://semaphoreci.com/api/v1/projects/723304e2-be24-4db6-9ebb-5f1f250b9841/2579135/badge.svg?style=for-the-badge)](https://semaphoreci.com/dotmh/lambda-controller)

A class to help make lambda function behind AWS API Gateway.

It exposes some common methods to allow you to use Lambda behind API Gateway more as you would making a normal HTTP app.

## Installation

To install

```bash
npm i @dotmh/lamda-controller
```

## Usage

Create a new controller

```ts
import {LambdaController} from '@dotmh/lambda-controller';

class MyController extends LambdaController {}
```

You then need to declare a method or methods to handle your requests

```ts
import {LambdaController} from '@dotmh/lambda-controller';

class MyController extends LambdaController {
  handler() {
    // Your logic goes here
  }
}
```

This will contain your functions logic for that request

Lastly create a function to call the handler on your controller, and export the function as your serverless function

```ts
import {LambdaController} from '@dotmh/lambda-controller';

class MyController extends LambdaController {
  handler() {
    // Your logic goes here
  }
}

module.exports.handler = (event, ctx, callback) => {
  new MyController(event, ctx, callback).handler();
};
```

For API , see Documentation

### Extending

To keep the library as small as possible it doesn't include some functionality that
you may need. This includes request body handling and also functionality like cookies etc. However, the system is designed to be extended. The extention system is based on
mixin's these are just normal JS objects that are mixed in to the Lambda controller class.

A mixin that adds a function (method) and getter would look like this

```ts
const mixin = {
  hello: () => 'Hello',
  get bye() {
    return 'Goodbye';
  },
};
```

You can then add the mixin to Lamda controller using the `add` method.

```ts
// ...
new MyController(event, ctx, callback).add(mixin).handler();
// ...
```

Inside your Controller class (the class that extends Lambda Controller) you can use the mixin methods , getters and setters as if they were originally defined on the main Lambda controller class.

```ts
import {LambdaController} from '@dotmh/lambda-controller';

class MyController extends Controller {
  handler() {
    return this.bye;
  }
}
```

#### Initialising

You may want to do somethings on intialization of the extending mixin. Normally you would use the constructor for this but because of the way the addon system works, the constructor A) Can not be overridden or extended, and B) would have already have been invoked. For this purpose you can use an "init"
function.

To use an init function declare a function called `init` on your mixin.

```ts
const mixin = {
  init() {
    // ... do something
  },
  get foo() {
    return 'bar';
  },
};
```

Your init function wont appear on the Controller after it has been added, but will be called when
the mixin is added to the controller class. It is called in the context of the controller so
`this` will refer to the controller object.

## Plugins

[![Lambda Controller Plugin](https://img.shields.io/badge/Plugin-Lambda%20Controller-red.svg?style=for-the-badge&color=F15024)](https://github.com/dotmh/lambda-controller)

DotMH has created a number of plugins to add extra functionality to Lambda Controller

### Lamdda Controler Request Body

Adds Request body handling to Lambda Controller

<a href="https://github.com/dotmh/lambda-controller-request-body">
<img src="https://github.com/dotmh/lambda-controller-request-body/raw/master/logo.svg" width="200px" alt="Lambda Controller">
</a>

### Lambda Controller Cors

Adds Cross Origin Resource Sharing support Lambda Controller

<a href="https://github.com/dotmh/lambda-controller-cors">
<img src="https://raw.githubusercontent.com/dotmh/lambda-controller-cors/master/logo.svg" width="200px" alt="Lambda Controller">
</a>

## Documentation

For the API documentation see <https://dotmh.github.io/lambda-controller>

Or to read locally

    npm run readdocs

## Licence

This package is [Treeware](https://treeware.earth). If you use it in production, then we ask that you [**buy the world a tree**](https://plant.treeware.earth/dotmh/lambda-controller) to thank us for our work. By contributing to the Treeware forest you’ll be creating employment for local families and restoring wildlife habitats.

## Credits

Logo design by [@dotmh](https://www.dotmh.io)
