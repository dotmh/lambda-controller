import {event, ctx, callback} from './mocks';

import {LambdaController, NormalizedHeaders} from '..';

const mockController = () =>
  new LambdaController(event.valid, ctx.noop, callback.noop);

describe('LambdaController', () => {
  describe('Constractor', () => {
    it('should construct the class and load the event', () => {
      expect(mockController().event).toEqual(event.valid);
    });
  });

  describe('Properties', () => {
    it('should return the query string as an object of param/value', () => {
      const controller = mockController();
      expect(controller.query).toEqual(event.valid.queryStringParameters);
    });

    it('should return the path', () => {
      const controller = mockController();
      expect(controller.path).toEqual(event.valid.path);
    });

    it('should return the http method', () => {
      const controller = mockController();
      expect(controller.method).toEqual(event.valid.httpMethod);
    });

    it('should return the http headers as an object of header/value', () => {
      const controller = mockController();
      const mockHeaders: NormalizedHeaders = {};

      if (!event.valid?.headers) {
        throw new Error('No valid Event Headers');
      }

      Object.entries(event.valid.headers).forEach(([key, value]) => {
        mockHeaders[key.toLowerCase()] = value;
      });

      expect(controller.headers).toEqual(mockHeaders);
    });

    it('Should return the path params as an object of param/value', () => {
      const controller = mockController();
      expect(controller.params).toEqual(event.valid.pathParameters);
    });
  });

  describe('Methods', () => {
    it('#addHeader should add a response header', () => {
      const controller = mockController();
      const headerName = 'foo';
      const headerValue = 'bar';
      controller.addHeader(headerName, headerValue);
      expect(controller.response.headers).toEqual({
        [headerName]: headerValue,
      });
    });

    it('#statusCode should change the response status code', () => {
      const controller = mockController();
      const statusCode = 301;
      controller.status(statusCode);
      expect(controller.response.statusCode).toBe(statusCode);
    });

    it('#body should change the response body', () => {
      const controller = mockController();
      const body = 'hello world!';
      controller.body(body);
      expect(controller.response.body).toEqual(body);
    });

    it('#type should up the header Content-Type to the MIME Type', () => {
      const controller = mockController();
      const mime = 'application/javascript';
      controller.type(mime);
      expect(controller.response.headers['Content-Type']).toEqual(mime);
    });

    it('#json should set the body to stringify JSON, and set the MIME Type', () => {
      const controller = mockController();
      const obj = {foo: 'bar'};
      const mime = 'application/json';

      controller.json(obj);

      expect(controller.response.headers['Content-Type']).toEqual(mime);
      expect(controller.response.body).toEqual(JSON.stringify(obj));
    });
  });

  describe('Add', () => {
    it('should add a mixin', () => {
      const string = 'bar';
      const controller = mockController();
      const mixin = {
        foo: () => string,
      };

      controller.add(mixin);

      expect(controller.foo()).toEqual(string);
    });

    it('should add a getter in a mixin', () => {
      const string = 'bar';
      const controller = mockController();
      const mixin = {
        get foo() {
          return string;
        },
      };

      controller.add(mixin);

      expect(controller.foo).toEqual(string);
    });

    it('should fire the init of all mixins after adding them', () => {
      const string = 'foobar';
      const controller = mockController();
      const mixin = {
        init() {
          this.bar = string;
        },
      };

      controller.add(mixin);

      expect(controller.bar).toEqual(string);
    });

    it('should not override an existing method', () => {
      const string = 'bar';
      const controller = mockController();
      const baseMixin = {
        foo: () => 'boo',
      };
      const mixin = {
        foo: () => string,
      };

      controller.add(baseMixin);
      controller.add(mixin);

      expect(controller.foo()).not.toEqual(string);
    });

    it('#add should not allow to extending with non objects', () => {
      const controller = mockController();

      const fn = () => {
        controller.add('string');
      };

      expect(fn).toThrow('You can only add objects');
    });

    it('should allow access to internal vars using a method', () => {
      const controller = mockController();
      const mixin = {
        foo() {
          return this.event;
        },
      };

      controller.add(mixin);

      expect(controller.foo()).toEqual(event.valid);
    });

    it('should allow access to internal vars using getter', () => {
      const controller = mockController();
      const mixin = {
        get foo() {
          return this.event;
        },
      };

      controller.add(mixin);

      expect(controller.foo).toEqual(event.valid);
    });
  });

  describe('Send', () => {
    it('should send the response by calling the callback', (done) => {
      const body = 'hello world!';
      const controller = new LambdaController(
        event.valid,
        ctx.noop,
        (err, res) => {
          if (err) {
            throw new Error('An Error occurred');
          }

          expect(res.body).toEqual(body);
          done();
        }
      );

      controller.body(body);
      controller.send();
    });

    it('should send an object as serialized json with the correct MIME type', (done) => {
      const body = {foo: 'bar'};
      const mime = 'application/json';
      const controller = new LambdaController(
        event.valid,
        ctx.noop,
        (err, res) => {
          if (err) {
            throw new Error('An Error occurred');
          }

          expect(res.body).toEqual(JSON.stringify(body));
          expect(res.headers['Content-Type']).toEqual(mime);
          done();
        }
      );

      controller.sendJson(body);
    });

    it('should send an HTTP Error response with the correct status code and message', (done) => {
      const code = 403;
      const body = 'You are not allowed to access this resource';
      const controller = new LambdaController(
        event.valid,
        ctx.noop,
        (err, res) => {
          if (err) {
            throw new Error('An Error occurred');
          }

          expect(res.body).toEqual(body);
          expect(res.statusCode).toEqual(code);
          done();
        }
      );

      controller.error(code, body);
    });

    it('Should send an HTTP error with a status code of 404 and a message', (done) => {
      const code = 404;
      const body = 'Resource was not found';
      const controller = new LambdaController(
        event.valid,
        ctx.noop,
        (err, res) => {
          if (err) {
            throw new Error('An Error occurred');
          }

          expect(res.body).toEqual(body);
          expect(res.statusCode).toEqual(code);
          done();
        }
      );

      controller.notFound();
    });

    it('Should send an HTTP error with a status code of 500 and a message', (done) => {
      const code = 500;
      const body = 'Resource unavailable';
      const controller = new LambdaController(
        event.valid,
        ctx.noop,
        (err, res) => {
          if (err) {
            throw new Error('An Error occurred');
          }

          expect(res.body).toEqual(body);
          expect(res.statusCode).toEqual(code);
          done();
        }
      );

      controller.serverError();
    });

    it('Should send an HTTP error with a status code of 400 and a message', (done) => {
      const code = 400;
      const body = 'Bad request to resource';
      const controller = new LambdaController(
        event.valid,
        ctx.noop,
        (err, res) => {
          if (err) {
            throw new Error('An Error occurred');
          }

          expect(res.body).toEqual(body);
          expect(res.statusCode).toEqual(code);
          done();
        }
      );

      controller.badRequest();
    });
  });
});
