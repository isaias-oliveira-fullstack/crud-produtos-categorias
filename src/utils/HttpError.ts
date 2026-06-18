export class HttpError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Requisição inválida.") {
    super(400, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Recurso não encontrado.") {
    super(404, message);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Não autenticado.") {
    super(401, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Acesso negado.") {
    super(403, message);
  }
}
