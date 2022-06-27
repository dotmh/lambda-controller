/* eslint-disable @typescript-eslint/no-explicit-any */
/***
 *    Copyright 2020 DotMH Martin Haynes <oss@dotmh.io>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {APIGatewayProxyEvent, Callback, Context} from 'aws-lambda';

export interface Mixin {
  [key: string]: any;
}

export interface NormalizedHeaders {
  [header: string]: any;
}

const MIXIN_INIT = 'init';

/**
 * Create a new instance of the controller
 * @param {object} event An Object supplied by AWS Lambda containing the event data from API Gateway
 * @param {object} ctx The Context object supplied by AWS Lambda
 * @param {function} callback The callback to trigger and send the response back to API Gateway
 *
 * @class
 * @classdesc The base class for Lambda Controllers intended to be extended
 * @author Martin Haynes <oss@dotmh.io>
 */
export class LambdaController {
  public response: any;
  public normalizedHeaders: NormalizedHeaders | null;

  private mixinInitializers: any[];

  [key: string]: any;

  constructor(
    public event: APIGatewayProxyEvent,
    public ctx: Context,
    public callback: Callback
  ) {
    this.response = {
      statusCode: 200,
      headers: {},
      body: '',
    };

    this.normalizedHeaders = null;
  }

  /**
   * Gets the Query String as an Object
   * @type {object}
   * 	@property {string} key the key of Query string
   *  @property {string} value the value in the query string
   * @author Martin Haynes <oss@dotmh.io>
   */
  get query() {
    return this.event.queryStringParameters;
  }

  /**
   * Gets the current path
   * @type {string}
   * @author Martin Haynes <oss@dotmh.io>
   */
  get path() {
    return this.event.path;
  }

  /**
   * Get the Path paramteres as a key value pair object
   * @type {object}
   * 	@property {string} key the name of the path parameter
   *  @property {string} value the value of the path parameter
   * @example
   * // route /foo/:id, with url /foo/bar
   * this.params // => {id: "bar"}
   * @author Martin Haynes <oss@dotmh.io>
   */
  get params() {
    return this.event.pathParameters;
  }

  /**
   * Returns the HTTP Method (aka Verb) i.e. POST, GET, PATCH, DELETE, PUT
   * @type {string}
   * @author Martin Haynes <oss@dotmh.io>
   */
  get method() {
    return this.event.httpMethod;
  }

  /**
   * Gets the Request headers, these will always be in lowercase i.e content-type
   * @type {object}
   * 	@property {string} header the header name i.e. content-type
   *	@property {*} value the value of the header
   * @author Martin Haynes <oss@dotmh.io>
   */
  get headers() {
    if (this.normalizedHeaders === null) {
      this._normalizeHeaders();
    }

    return this.normalizedHeaders;
  }

  /**
   * Adds a Mixin in to the base class
   * @param {object} mixin The object to be mixed in
   * @returns {LambdaController} An instance of the class
   * @example
   * this.add({
   *	get a() {
   * 		return "a";
   * 	},
   *	b() {
   *		return "b";
   * 	}
   * });
   * @author Martin Haynes <oss@dotmh.io>
   */
  add(mixin: Mixin): LambdaController & Mixin {
    this.mixinInitializers = this.mixinInitializers ?? [];

    const currentKeys = Object.getOwnPropertyNames(this);
    const mixinKeys = Object.getOwnPropertyNames(mixin);

    mixinKeys
      .filter((mixinKey) => currentKeys.lastIndexOf(mixinKey) === -1)
      .forEach((mixinKey) => {
        if (mixinKey === MIXIN_INIT) {
          this.mixinInitializers.push(mixin[mixinKey]);
        } else {
          Object.defineProperty(
            this,
            mixinKey,
            Object.getOwnPropertyDescriptor(mixin, mixinKey)
          );
        }
      });

    if (this.mixinInitializers.length > 0) {
      this.mixinInitializers.forEach((intializer) => intializer.call(this));
    }

    return this;
  }

  /**
   * Adds a response header
   * @param {string} header The header name
   * @param {*} value The header value
   * @returns {LambdaController} An instance of the class
   * @example
   * lambdaController.addHeader("content-type", "application/json")
   * @author Martin Haynes <oss@dotmh.io>
   */
  addHeader(header: string, value: any): LambdaController {
    this.response.headers[header] = value;
    return this;
  }

  /**
   * Changes the responses http Status code
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
   * @param {number} code The HTTP reponse codes
   * @returns {LambdaController} An instance of the class
   * @example
   * lambdaController.status(200);
   * @author Martin Haynes <oss@dotmh.io>
   */
  status(code: number): LambdaController {
    this.response.statusCode = code;
    return this;
  }

  /**
   * Sets the response body
   * @param {*} string The response body
   * @returns {LambdaController} An instance of the class
   * @example
   * lambdaController.body(`
   * <html>
   * 	<head>
   * 		<title>foobar</title>
   * 	</head>
   * 	<body>
   * 		hello
   * 	</body>
   * </html>
   * `);
   * @author Martin Haynes <oss@dotmh.io>
   */
  body(string: string): LambdaController {
    this.response.body = string;
    return this;
  }

  /**
   * Sets the content type on the response
   *
   * Sets the body to a JSON serialised string, as well sets the content-type correctly
   * @param {string} type A valid mime type to set the content type to
   * @returns {LambdaController} An instance of the class
   * @example
   * lambdaController.type("applicaiton/json");
   * @author Martin Haynes <oss@dotmh.io>
   */
  type(type: string): LambdaController {
    this.addHeader('Content-Type', type);
    return this;
  }

  /**
   * Sets up the response to respond in JSON
   * @param {object | array} object The Object or Array to serialize in to the response
   * @return {LambdaController} An instance of the class
   * @example
   * lambdaController.json({foo: "bar", a: 1});
   * @author Martin Haynes <oss@dotmh.io>
   */
  json(object: any): LambdaController {
    this.type('application/json');
    this.body(JSON.stringify(object));
    return this;
  }

  /**
   * Sets up and sends the response in JSON,
   * @param {object | array} object The Object or Array to serialize in to the response
   * @example
   * lambdaController.sendJson({foo: "bar", a: 1});
   * @author Martin Haynes <oss@dotmh.io>
   */
  sendJson(object: any): void {
    this.json(object).send();
  }

  /**
   * Sends the response
   * @example
   * lambdaController.send();
   * @author Martin Haynes <oss@dotmh.io>
   */
  send(): void {
    this.callback(null, this.response);
  }

  /**
   * Sends an HTTP error response
   * @param {number} code The http status code to use
   * @param {string} message The error message for the end user
   * @example
   * lambdaController.error(404, "Resource was not found")
   * @author Martin Haynes <oss@dotmh.io>
   */
  error(code: number, message: string): void {
    this.status(code).type('text/plain').body(message).send();
  }

  /**
   * Sends a prefab Not Found (404) error back to the end user
   * @example
   * lambdaController.notFound();
   * @author Martin Haynes <oss@dotmh.io>
   */
  notFound(): void {
    this.error(404, 'Resource was not found');
  }

  /**
   * Sends a prefab Internal Server Error (500) error back to the end user
   * @example
   * lambdaController.serverError();
   * @author Martin Haynes <oss@dotmh.io>
   */
  serverError(): void {
    this.error(500, 'Resource unavailable');
  }

  /**
   * Sends a prefab Bad Request(400) error back to the end user
   * @example
   * lambdaController.badRequest();
   * @author Martin Haynes <oss@dotmh.io>
   */
  badRequest(): void {
    this.error(400, 'Bad request to resource');
  }

  /**
   * Goes through and makes all the header names lowercase
   * @private
   * @author Martin Haynes <oss@dotmh.io>
   */
  private _normalizeHeaders(): void {
    this.normalizedHeaders = {};
    Object.entries(this.event.headers).forEach(([key, value]) => {
      this.normalizedHeaders[key.toLowerCase()] = value;
    });
  }
}
