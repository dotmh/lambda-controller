
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

});