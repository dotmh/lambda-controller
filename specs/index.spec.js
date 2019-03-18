
const {expect} = require('chai');
const {event, ctx, callback} = require('./mocks');

const LambdaController = require('../index');

describe("LambdaController", function () {
    
    describe('Constractor', function () {
        it("should construct the class and load the event", function() {
            const mockClass = new LambdaController(event.valid, ctx.noop, callback.noop);
            expect(mockClass.event).to.deep.equal(event.valid);
        });
    });

    describe('Properties', function () {

    });

});