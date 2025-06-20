// shared/src/enums/merchant.enums.ts

/**
 * Merchant Error Codes
 */
export enum MerchantErrorCode {
  // Fetch operations
  FETCH_ERROR = 'FETCH_ERROR',

  // Registration operations
  ALREADY_REGISTERED = 'ALREADY_REGISTERED',
  REGISTRATION_ERROR = 'REGISTRATION_ERROR',

  // Update operations
  UPDATE_ERROR = 'UPDATE_ERROR',

  // Removal operations
  REMOVAL_ERROR = 'REMOVAL_ERROR',

  // General validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MERCHANT_NOT_FOUND = 'MERCHANT_NOT_FOUND',
  INVALID_MERCHANT_ID = 'INVALID_MERCHANT_ID',
}

/**
 * Group Error Codes
 */
export enum GroupErrorCode {
  // Fetch operations
  FETCH_ERROR = 'FETCH_ERROR',

  // General validation
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // CRUD operations
  CREATION_ERROR = 'CREATION_ERROR',
  UPDATE_ERROR = 'UPDATE_ERROR',
  DELETE_ERROR = 'DELETE_ERROR',

  // Member management
  MEMBER_ADD_ERROR = 'MEMBER_ADD_ERROR',
  MEMBER_REMOVE_ERROR = 'MEMBER_REMOVE_ERROR',

  // Template source management
  TEMPLATE_SOURCE_ERROR = 'TEMPLATE_SOURCE_ERROR',

  // Additional business rules
  GROUP_NAME_EXISTS = 'GROUP_NAME_EXISTS',
  INVALID_SOURCE_MERCHANT = 'INVALID_SOURCE_MERCHANT',
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND',
  MEMBER_ALREADY_EXISTS = 'MEMBER_ALREADY_EXISTS',
  CANNOT_REMOVE_SOURCE = 'CANNOT_REMOVE_SOURCE',
  GROUP_HAS_MEMBERS = 'GROUP_HAS_MEMBERS',
}
