const asyncHandler = (requestHandlerFn) => {
    return (req, res, next) => {
        Promise
        .resolve(requestHandlerFn(req, res, next))
        .catch((err) => next(err));
        // try {
        //     await requestHandlerFn(req, res, next);
        // } catch (error) {
        //     next(error);
        // }
    }
}

export { asyncHandler }