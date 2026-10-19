import { HttpError } from '../utils/HttpError.js';

export function validateRequest(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(
        new HttpError(
          400,
          'Please check the submitted fields.',
          result.error.issues.map(({ path, message }) => ({ field: path.join('.'), message })),
        ),
      );
    }
    req[source] = result.data;
    return next();
  };
}
