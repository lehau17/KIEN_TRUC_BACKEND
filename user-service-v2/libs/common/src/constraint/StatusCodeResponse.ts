export enum MessageResponse {
    // user Code : 2000 -> 2999
    USER_CREATED = 'User created',
    USER_LOGIN_SUCCESS = 'User login success',
    USER_INVALID_USERNAME = 'Username is invalid',
    USER_INVALID_PASSWORD = 'Password is invalid',
    USER_NOT_FOUND = 'User not found',
    USER_DEACTIVATED = 'User deactivated',
    USER_EXISTED = 'User existed',
    REFRESH_TOKEN_SUCESS = 'Refresh token',
    USER_INFO = 'User info',
    USER_FIND_MANY = 'User find many',
    USER_UPDATE = 'User update',
    USER_REMOVE = 'user remove account',
    CHANGE_PASSWORD_SUCCESS = 'change password success',
    PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCH = 'Password and confirm password not match',
    NOT_INPUT_OLD_PASSWORD = 'new password is not match old password',
    OLD_PASSWORD_NOT_VALID = 'old password is not valid ',
    ACCOUNT_NOT_AUTHORIZE = "Account chua xac thuc",
    REQUEST_VERIFY_CHANGEP_PASSWORD_SUCCESS = "Request change password success",
    // 6000
    ROLE_GET_LIST = 'Get list roles',
    GET_ROLE = 'Get role',
    UPDATE_ROLE = 'Update role',
    // 7000
    TOO_MANY_REQUESTS = 'Too many requests',

    // 3000
    UNAUTHORIZE = 'Unauthorized',

    // 4000
    ROLE_CREATE = 'Role create',



    // 500000
    ERROR_OCCUR_WHEN_VERIFY_ACCOUNT = "Error Occurr when verify account",

    // 15000
    RESOURCE_EXIST = 'Resource exists',
    RESOURCE_NOT_EXIST = 'Resource not found',

    // 16000
    PERMISSION_EXIST = 'permission exists',
    PERMISSION_NOT_EXIST = 'permission not found',

    ROLE_IS_EXIST = 'Role is already exists',
    ROLE_NOT_EXIST = 'Role not exists',

    REFRESH_TOKEN_INVALID = 'Refresh token invalid',

    // 5000 forbidden
    FORBIDDEN = 'Forbidden: Chỉ có admin role mới có quyền truy cập',
    FORBIDDEN_DEACTIVE = 'Tài khoản đã bị deactive',
    // code common
    SUCCESS = 'Success',

    // server error
    SERVER_ERROR = 'Server error',
}

export const StatusCodeResponse: Record<string, number> = {
    // user
    [MessageResponse.USER_CREATED]: 2000,
    [MessageResponse.USER_LOGIN_SUCCESS]: 2001,
    [MessageResponse.USER_INFO]: 2002,
    [MessageResponse.USER_FIND_MANY]: 2003,
    [MessageResponse.USER_UPDATE]: 2004,
    [MessageResponse.USER_REMOVE]: 2005,
    [MessageResponse.CHANGE_PASSWORD_SUCCESS]: 2006,
    [MessageResponse.ACCOUNT_NOT_AUTHORIZE]: 2007,
    [MessageResponse.REQUEST_VERIFY_CHANGEP_PASSWORD_SUCCESS]: 2008,
    // error begin 10000
    [MessageResponse.USER_INVALID_USERNAME]: 10002,
    [MessageResponse.USER_INVALID_PASSWORD]: 10003,
    [MessageResponse.USER_NOT_FOUND]: 10004,
    [MessageResponse.USER_DEACTIVATED]: 10005,
    [MessageResponse.USER_EXISTED]: 10006,
    [MessageResponse.PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCH]: 10007,
    [MessageResponse.OLD_PASSWORD_NOT_VALID]: 10008,
    // server error begin 50000
    [MessageResponse.SERVER_ERROR]: 50000,

    // 60000
    [MessageResponse.ERROR_OCCUR_WHEN_VERIFY_ACCOUNT]: 60000,

    // resource
    [MessageResponse.RESOURCE_EXIST]: 15000,
    [MessageResponse.RESOURCE_NOT_EXIST]: 15001,
    // permission
    [MessageResponse.PERMISSION_EXIST]: 16000,
    [MessageResponse.PERMISSION_NOT_EXIST]: 16001,

    // role
    [MessageResponse.ROLE_GET_LIST]: 6000,
    [MessageResponse.GET_ROLE]: 6001,
    [MessageResponse.UPDATE_ROLE]: 6002,

    // 7000
    [MessageResponse.TOO_MANY_REQUESTS]: 7000,

    // unauthorize
    [MessageResponse.UNAUTHORIZE]: 3000,
    [MessageResponse.REFRESH_TOKEN_INVALID]: 3001,

    // role 4000
    [MessageResponse.ROLE_CREATE]: 4000,
    [MessageResponse.ROLE_IS_EXIST]: 4900,
    [MessageResponse.ROLE_NOT_EXIST]: 4901,

    // forbidden
    [MessageResponse.FORBIDDEN]: 5000,
    [MessageResponse.FORBIDDEN_DEACTIVE]: 5001,

    // common
    [MessageResponse.SUCCESS]: 9000,
};
