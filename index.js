module.exports = class LambdaController {
	constructor(event, ctx, callback) {
		this.event = event;
		this.ctx = ctx;
		this.callback = callback;

		this.response = {
			status: 200,
			headers: {},
			body: ""
		};
	}

	get query() {
		return this.event.queryStringParameters;
	}

	get path() {
		return this.event.path;
	}

	get params() {
		return this.event.pathParameters;
	}

	get method() {
		return this.event.httpMethod;
	}

	get headers() {
		return this.event.headers;
	}

	addHeader(header, value) {
		this.response[header] = value;
		return this;
	}

	status(code) {
		this.response.status = code;
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
};
