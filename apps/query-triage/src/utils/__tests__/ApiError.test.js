import ApiError from '../ApiError.js';

describe('ApiError', () => {
  describe('constructor', () => {
    test('should create error with status code and message', () => {
      const error = new ApiError(400, 'Bad request');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
      expect(error.errors).toEqual([]);
      expect(error.isOperational).toBe(true);
    });

    test('should include errors array', () => {
      const errors = ['Field1 is required', 'Field2 is invalid'];
      const error = new ApiError(422, 'Validation failed', errors);
      expect(error.errors).toEqual(errors);
    });
  });

  describe('static methods', () => {
    test('badRequest creates 400 error', () => {
      const error = ApiError.badRequest('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    test('unauthorized creates 401 error', () => {
      const error = ApiError.unauthorized();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    test('forbidden creates 403 error', () => {
      const error = ApiError.forbidden('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access denied');
    });

    test('notFound creates 404 error', () => {
      const error = ApiError.notFound('Resource not found');
      expect(error.statusCode).toBe(404);
    });

    test('conflict creates 409 error', () => {
      const error = ApiError.conflict('Duplicate entry');
      expect(error.statusCode).toBe(409);
    });

    test('validationError creates 422 error', () => {
      const error = ApiError.validationError(['Error 1', 'Error 2']);
      expect(error.statusCode).toBe(422);
      expect(error.errors).toEqual(['Error 1', 'Error 2']);
    });

    test('tooManyRequests creates 429 error', () => {
      const error = ApiError.tooManyRequests();
      expect(error.statusCode).toBe(429);
    });

    test('internal creates 500 error with isOperational false', () => {
      const error = ApiError.internal('Server error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('stack trace', () => {
    test('should capture stack trace', () => {
      const error = new ApiError(400, 'Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ApiError');
    });
  });
});
