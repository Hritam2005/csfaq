import { jest } from '@jest/globals';
import Query from '../src/modules/queries/Query.model.js';
import { submitQuery } from '../src/modules/queries/Query.controller.js';

describe('Query Priority Classification', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let createSpy;

  beforeEach(() => {
    mockReq = {
      user: {
        _id: '507f1f77bcf86cd799439011'
      },
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    createSpy = jest.spyOn(Query, 'create').mockImplementation((data) => Promise.resolve(data));
  });

  afterEach(() => {
    createSpy.mockRestore();
  });

  it('should classify HIGH priority query correctly', async () => {
    mockReq.body.question = 'This is urgent, please help asap!';
    await submitQuery(mockReq, mockRes, mockNext);
    
    expect(createSpy).toHaveBeenCalled();
    const createdData = createSpy.mock.calls[0][0];
    expect(createdData.priority).toBe('High');
  });

  it('should classify MEDIUM priority query correctly', async () => {
    mockReq.body.question = 'I have a bug with incorrect details.';
    await submitQuery(mockReq, mockRes, mockNext);

    expect(createSpy).toHaveBeenCalled();
    const createdData = createSpy.mock.calls[0][0];
    expect(createdData.priority).toBe('Medium');
  });

  it('should default to LOW priority', async () => {
    mockReq.body.question = 'Just checking on some information.';
    await submitQuery(mockReq, mockRes, mockNext);

    expect(createSpy).toHaveBeenCalled();
    const createdData = createSpy.mock.calls[0][0];
    expect(createdData.priority).toBe('Low');
  });
});
