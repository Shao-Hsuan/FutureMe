export class UserCancelError extends Error {
  constructor(message: string = '使用者取消操作') {
    super(message);
    this.name = 'UserCancelError';
  }
}

export function isUserCancelError(error: unknown): error is UserCancelError {
  return error instanceof UserCancelError;
}