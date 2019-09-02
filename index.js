const MIXIN_INIT = "init";

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
class LambdaController {
	constructor(event, ctx, callback) {
		this.event = event;
		this.ctx = ctx;
		this.callback = callback;

		this.response = {
			statusCode: 200,
			headers: {},
			body: ""
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

	get method() {
		return this.event.httpMethod;
	}

	get headers() {
		if(this.normalizedHeaders === null) {
			this._normalizeHeaders();
		}
		return this.normalizedHeaders;
	}

	add(mixin) {
		if (typeof mixin !== "object") {
			throw new TypeError("You can only add objects");
		}

		this._mixinInitializers = [];

		const currentKeys = Object.getOwnPropertyNames(this);
		const mixinKeys = Object.getOwnPropertyNames(mixin);

		mixinKeys.filter((mixinKey) => currentKeys.lastIndexOf(mixinKey) === -1)
			.forEach((mixinKey) => {
				
				if (mixinKey === MIXIN_INIT) {
					this._mixinInitializers.push(mixin[mixinKey]);
				} else {
					Object.defineProperty(this, mixinKey, Object.getOwnPropertyDescriptor(mixin, mixinKey));
				}
			});

		if (this._mixinInitializers.length > 0) {
			this._mixinInitializers.forEach((intializer) => intializer.call(this));
		}

		return this;
	}

	addHeader(header, value) {
		this.response.headers[header] = value;
		return this;
	}

	status(code) {
		this.response.statusCode = code;
		return this;
	}

	body(string) {
		this.response.body = string;
		return this;
	}

	type(type) {
		this.addHeader("Content-Type", type);
		return this;
	}

	json(object) {
		this.type("application/json");
		this.body(JSON.stringify(object));
		return this;
	}

	sendJson(object) {
		this.json(object).send();
	}

	send() {
		this.callback(null, this.response);
	}

	error(code, message) {
		this.status(code).type("text/plain").body(message).send();
	}

	notFound() {
		this.error(404, "Resource was not found");
	}

	serverError() {
		this.error(500, "Resource unavailable");
	}

	badRequest() {
		this.error(400, "Bad request to resource");
	}

	_normalizeHeaders() {
		this.normalizedHeaders = {};
		Object.entries(this.event.headers).forEach(([key, value]) => {
			this.normalizedHeaders[key.toLowerCase()] = value;
		});
	}
};

module.exports = LambdaController;