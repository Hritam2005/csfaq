import ApiResponse from '../ApiResponse.js';

describe('ApiResponse', () => {
  describe('success', () => {
    test('should create success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const response = ApiResponse.success(data);
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('Success');
      expect(response.data).toEqual(data);
    });

    test('should accept custom message and status code', () => {
      const response = ApiResponse.success({}, 'Created', 201);
      
      expect(response.statusCode).toBe(201);
      expect(response.message).toBe('Created');
    });
  });

  describe('error', () => {
    test('should create error response', () => {
      const response = ApiResponse.error('Not found', 404);
      
      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(404);
      expect(response.message).toBe('Not found');
    });

    test('should include errors array when provided', () => {
      const errors = ['Validation error 1', 'Validation error 2'];
      const response = ApiResponse.error('Validation failed', 422, errors);
      
      expect(response.errors).toEqual(errors);
    });

    test('should not include empty errors array', () => {
      const response = ApiResponse.error('Error', 500, []);
      expect(response.errors).toBeUndefined();
    });
  });

  describe('accepted', () => {
    test('should create 202 accepted response', () => {
      const response = ApiResponse.accepted({ taskId: '123' });
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(202);
      expect(response.data).toEqual({ taskId: '123' });
    });
  });
});
