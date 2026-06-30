/**
 * Wraps asynchronous Express route handlers to automatically catch unhandled promise rejections
 * and pass them to the Express next() function.
 * This completely eliminates the need for try/catch blocks in every controller.
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;
