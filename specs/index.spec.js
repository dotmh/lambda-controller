
const {expect} = require("chai");
const {event, ctx, callback} = require("./mocks");

const LambdaController = require("..");

const mockController = () => new LambdaController(event.valid, ctx.noop, callback.noop);

describe("LambdaController", () => {
	describe("Constractor", () => {
		it("should construct the class and load the event", () => {
			expect(mockController().event).to.deep.equal(event.valid);
		});
	});

	describe("Properties", () => {
		it("should return the query string as an object of param/value", () => {
			const controller = mockController();
			expect(controller.query).to.be.an("object").and.deep.equal(event.valid.queryStringParameters);
		});

		it("should return the path", () => {
			const controller = mockController();
			expect(controller.path).to.be.a("string").and.equal(event.valid.path);
		});

		it("should return the http method", () => {
			const controller = mockController();
			expect(controller.method).to.be.a("string").and.equal(event.valid.httpMethod);
		});

		it("should return the http headers as an object of header/value", () => {
			const controller = mockController();
			expect(controller.headers).to.be.an("object").and.equal(event.valid.headers);
		});

		it("Should return the path params as an object of param/value", () => {
			const controller = mockController();
			expect(controller.params).to.be.an("object").and.equal(event.valid.pathParameters);
		});
	});

	describe("Methods", () => {
		it("#addHeader should add a response header", () => {
			const controller = mockController();
			const headerName = "foo";
			const headerValue = "bar";
			controller.addHeader(headerName, headerValue);
			expect(controller.response.headers).to.be.an("object")
				.and.deep.equal({
					[headerName]: headerValue
				});
		});

		it("#statusCode should change the response status code", () => {
			const controller = mockController();
			const statusCode = 301;
			controller.status(statusCode);
			expect(controller.response.statusCode).to.be.a("number").and.equal(statusCode);
		});

		it("#body should change the response body", () => {
			const controller = mockController();
			const body = "hello world!";
			controller.body(body);
			expect(controller.response.body).to.be.a("string").and.equal(body);
		});

		it("#type should up the header Content-Type to the MIME Type", () => {
			const controller = mockController();
			const mime = "application/javascript";
			controller.type(mime);
			expect(controller.response.headers["Content-Type"]).to.be.a("string").and.equal(mime);
		});

		it("#json should set the body to stringify JSON, and set the MIME Type", () => {
			const controller = mockController();
			const obj = {foo: "bar"};
			const mime = "application/json";

			controller.json(obj);

			expect(controller.response.headers["Content-Type"]).to.be.a("string").and.equal(mime);
			expect(controller.response.body).to.be.a("string").and.equal(JSON.stringify(obj));
		});
	});

	describe("Add", () => {
		it("#add should add a mixin", () => {
			const string = "bar";
			const controller = mockController();
			const mixin = {
				foo: () => string
			};

			controller.add(mixin);

			expect(controller.foo()).to.equal(string);
		});

		it("#add should add a getter in a mixin", () => {
			const string = "bar";
			const controller = mockController();
			const mixin = {
				get foo() {
					return string;
				}
			};

			controller.add(mixin);

			expect(controller.foo).to.equal(string);
		});

		it("#add should not override an existing method", () => {
			const string = "bar";
			const controller = mockController();
			const baseMixin = {
				foo: () => "boo"
			};
			const mixin = {
				foo: () => string
			};

			controller.add(baseMixin);
			controller.add(mixin);

			expect(controller.foo()).to.not.equal(string);
		});

		it("#add should not allow to extending with non objects", () => {
			const controller = mockController();

			const fn = () => {
				controller.add("string");
			};

			expect(fn).to.throw("You can only add objects");
		});
	});

	describe("Send", () => {
		it("should send the response by calling the callback", (done) => {
			const body = "hello world!";
			const controller = new LambdaController(event.valid, ctx.noop, (err, res) => {
				if (err) {
					throw new Error("An Error occurred");
				}

				expect(res.body).to.be.a("string").and.equal(body);
				done();
			});

			controller.body(body);
			controller.send();
		});

		it("should send an object as serialized json with the correct MIME type", (done) => {
			const body = {foo: "bar"};
			const mime = "application/json";
			const controller = new LambdaController(event.valid, ctx.noop, (err, res) => {
				if (err) {
					throw new Error("An Error occurred");
				}

				expect(res.body).to.be.a("string").and.equal(JSON.stringify(body));
				expect(res.headers["Content-Type"]).to.be.a("string").and.equal(mime);
				done();
			});

			controller.sendJson(body);
		});

		it("should send an HTTP Error response with the correct status code and message", (done) => {
			const code = 403;
			const body = "You are not allowed to access this resource";
			const controller = new LambdaController(event.valid, ctx.noop, (err, res) => {
				if (err) {
					throw new Error("An Error occurred");
				}

				expect(res.body).to.be.a("string").and.equal(body);
				expect(res.statusCode).to.be.a("number").and.equal(code);
				done();
			});

			controller.error(code, body);
		});

		it("Should send an HTTP error with a status code of 404 and a message", (done) => {
			const code = 404;
			const body = "Resource was not found";
			const controller = new LambdaController(event.valid, ctx.noop, (err, res) => {
				if (err) {
					throw new Error("An Error occurred");
				}

				expect(res.body).to.be.a("string").and.equal(body);
				expect(res.statusCode).to.be.a("number").and.equal(code);
				done();
			});

			controller.notFound();
		});

		it("Should send an HTTP error with a status code of 500 and a message", (done) => {
			const code = 500;
			const body = "Resource unavailable";
			const controller = new LambdaController(event.valid, ctx.noop, (err, res) => {
				if (err) {
					throw new Error("An Error occurred");
				}

				expect(res.body).to.be.a("string").and.equal(body);
				expect(res.statusCode).to.be.a("number").and.equal(code);
				done();
			});

			controller.serverError();
		});

		it("Should send an HTTP error with a status code of 400 and a message", (done) => {
			const code = 400;
			const body = "Bad request to resource";
			const controller = new LambdaController(event.valid, ctx.noop, (err, res) => {
				if (err) {
					throw new Error("An Error occurred");
				}

				expect(res.body).to.be.a("string").and.equal(body);
				expect(res.statusCode).to.be.a("number").and.equal(code);
				done();
			});

			controller.badRequest();
		});
	});
});
