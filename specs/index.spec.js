
const {expect} = require('chai');
const {event, ctx, callback} = require('./mocks');

const LambdaController = require('../index');

const mockController = () => new LambdaController(event.valid, ctx.noop, callback.noop);

describe("LambdaController", function () {
    
    describe('Constractor', function () {
        it("should construct the class and load the event", function() {
            expect(mockController().event).to.deep.equal(event.valid);
        });
    });

    describe('Properties', function () {
        it("should return the query string as an object of param/value" , function () {
            const controller = mockController();
            expect(controller.query).to.be.an('object').and.deep.equal(event.valid.queryStringParameters);
        });

        it("should return the path", function () {
            const controller = mockController();
            expect(controller.path).to.be.a("string").and.equal(event.valid.path);
        });

        it("should return the http method", function () {
            const controller = mockController();
            expect(controller.method).to.be.a("string").and.equal(event.valid.httpMethod);
        });

        it("should return the http headers as an object of header/value", function () {
            const controller = mockController();
            expect(controller.headers).to.be.an('object').and.equal(event.valid.headers);
        });

        it("Should return the path params as an object of param/value", function () {
            const controller = mockController();
            expect(controller.params).to.be.an('object').and.equal(event.valid.pathParameters);
        });
    });

    describe('Methods', function () {
        it("#addHeader should add a response header", function () {
            const controller = mockController();
            const headerName = "foo";
            const headerValue = "bar";
            controller.addHeader(headerName, headerValue);
            expect(controller.response.headers).to.be.an("object")
                .and.deep.equal({
                    [headerName]: headerValue
                });
        });
        it("#statusCode should change the response status code", function () {
            const controller = mockController();
            const statusCode = 301;
            controller.status(statusCode);
            expect(controller.response.statusCode).to.be.a("number").and.equal(statusCode);
        });
        it("#body should change the response body", function () {
            const controller = mockController();
            const body = "hello world!";
            controller.body(body);
            expect(controller.response.body).to.be.a("string").and.equal(body);
        });
        it("#type should up the header Content-Type to the MIME Type", function () {
            const controller = mockController();
            const mime = "application/javascript";
            controller.type(mime);
            expect(controller.response.headers["Content-Type"]).to.be.a("string").and.equal(mime);
        });
        it("#json should set the body to stringify JSON, and set the MIME Type", function () {
            const controller = mockController();
            const obj = {foo: "bar"};
            const mime = "application/json";

            controller.json(obj);

            expect(controller.response.headers["Content-Type"]).to.be.a("string").and.equal(mime);
            expect(controller.response.body).to.be.a('string').and.equal(JSON.stringify(obj));
        });
    });

    describe("Send", function () {
        it("should send the response by calling the callback");
        it("should send an object as serialized json with the correct MIME type");
        it("should send an HTTP Error response with the correct status code");
        it("Shold send an HTTP error with a status code of 404 and a message");
        it("Shold send an HTTP error with a status code of 500 and a message");
        it("Shold send an HTTP error with a status code of 400 and a message");
    });

});