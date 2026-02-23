import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export function setupErrorHandler(app: FastifyInstance) {
  const APP_ENV = process.env.ENVIRONMENT;
  
  if(!APP_ENV) {
    throw new Error('ENVIRONMENT variable is not defined.');
  }

  app.setErrorHandler(function (error: any, request: FastifyRequest, response: FastifyReply) {
    request.log.error(error);

    if (error.validation) {
      if (APP_ENV === 'development') {
        return response.status(422).send({
          message: 'Validation failed.',
          errors: error.validation,
        });
      } else {
        return response.status(422).send({
          message: 'Validation failed.',
        });
      }
    } else {
      const status = error.statusCode || 500;
      const message =
        APP_ENV === 'development'
          ? error.message || 'Internal Server Error'
          : 'Internal Server Error';
      return response.status(status).send({ message });
    }
  });
}
