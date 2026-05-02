# Requirements Document

## Introduction

This document specifies the requirements for adding email verification with One-Time Password (OTP) functionality to the GreenConnect application. The feature enhances security during user authentication by requiring users to verify their email addresses during signup and optionally during login as a two-factor authentication (2FA) mechanism. The system will generate time-limited, single-use OTP codes, send them via email, and verify them before completing authentication operations.

## Glossary

- **OTP_Generator**: The component responsible for generating secure random 6-digit OTP codes
- **OTP_Store**: The database storage mechanism for OTP codes with associated metadata (user, expiration, usage status)
- **Email_Service**: The service responsible for sending emails containing OTP codes to users
- **Auth_Controller**: The authentication controller that handles signup and login requests
- **OTP_Verifier**: The component that validates OTP codes against stored values
- **Rate_Limiter**: The component that prevents abuse by limiting OTP generation and verification attempts
- **Frontend_UI**: The user interface components for OTP input and display
- **User**: A person attempting to signup or login to the GreenConnect application
- **Valid_OTP**: An OTP code that is unexpired, unused, and matches the stored value for the user
- **OTP_Expiration_Time**: The time duration (in minutes) after which an OTP becomes invalid
- **OTP_Code**: A 6-digit numeric code used for email verification

## Requirements

### Requirement 1: OTP Generation

**User Story:** As a system, I want to generate secure random OTP codes, so that users can verify their email addresses securely.

#### Acceptance Criteria

1. WHEN an OTP is requested, THE OTP_Generator SHALL generate a 6-digit numeric code using a cryptographically secure random number generator
2. THE OTP_Generator SHALL ensure each generated OTP_Code is unique within the current active OTP set
3. WHEN an OTP is generated, THE OTP_Store SHALL store the OTP_Code with the associated user email, creation timestamp, expiration timestamp, and unused status
4. THE OTP_Store SHALL set the OTP_Expiration_Time to 10 minutes from the creation timestamp
5. FOR ALL generated OTP codes, the OTP_Code SHALL contain exactly 6 digits (range: 000000 to 999999)

### Requirement 2: Email Delivery

**User Story:** As a user, I want to receive OTP codes via email, so that I can verify my email address.

#### Acceptance Criteria

1. WHEN an OTP is generated, THE Email_Service SHALL send an email to the user's email address containing the OTP_Code
2. THE Email_Service SHALL include the OTP_Expiration_Time in the email message
3. THE Email_Service SHALL format the email with a clear subject line indicating it is an OTP verification email
4. IF the email fails to send, THEN THE Auth_Controller SHALL return an error response to the user
5. THE Email_Service SHALL include the application name (GreenConnect) and purpose of the OTP in the email body
6. THE Email_Service SHALL send emails within 5 seconds of OTP generation

### Requirement 3: OTP Verification During Signup

**User Story:** As a new user, I want to verify my email address with an OTP during signup, so that I can confirm my email is valid before creating my account.

#### Acceptance Criteria

1. WHEN a user submits signup credentials, THE Auth_Controller SHALL generate and send an OTP before creating the user account
2. WHEN a user submits an OTP for signup verification, THE OTP_Verifier SHALL validate the OTP_Code against the stored OTP for that email
3. IF the OTP is valid, THEN THE Auth_Controller SHALL create the user account and return a JWT token
4. IF the OTP is invalid or expired, THEN THE Auth_Controller SHALL return an error response and not create the account
5. WHEN an OTP is successfully verified, THE OTP_Store SHALL mark the OTP as used to prevent reuse
6. THE Auth_Controller SHALL not create duplicate accounts for the same email address even if multiple OTPs are generated

### Requirement 4: Optional OTP Verification During Login

**User Story:** As an existing user, I want the option to enable OTP verification during login, so that I can add an extra layer of security to my account.

#### Acceptance Criteria

1. WHERE two-factor authentication is enabled for a user, WHEN the user submits valid login credentials, THE Auth_Controller SHALL generate and send an OTP before issuing a JWT token
2. WHERE two-factor authentication is enabled, WHEN a user submits an OTP for login verification, THE OTP_Verifier SHALL validate the OTP_Code
3. WHERE two-factor authentication is enabled, IF the OTP is valid, THEN THE Auth_Controller SHALL issue a JWT token
4. WHERE two-factor authentication is enabled, IF the OTP is invalid or expired, THEN THE Auth_Controller SHALL return an error response and not issue a token
5. WHERE two-factor authentication is disabled, THE Auth_Controller SHALL complete login without requiring OTP verification

### Requirement 5: OTP Expiration

**User Story:** As a system administrator, I want OTP codes to expire after a set time period, so that the system remains secure against delayed attacks.

#### Acceptance Criteria

1. WHEN an OTP is created, THE OTP_Store SHALL record an expiration timestamp of 10 minutes from creation
2. WHEN an OTP verification is attempted, THE OTP_Verifier SHALL check if the current time exceeds the expiration timestamp
3. IF the current time exceeds the expiration timestamp, THEN THE OTP_Verifier SHALL reject the OTP as expired
4. THE OTP_Store SHALL automatically remove expired OTPs that are older than 24 hours
5. WHEN an OTP expires, THE OTP_Verifier SHALL return a specific error message indicating expiration

### Requirement 6: OTP Resend Functionality

**User Story:** As a user, I want to request a new OTP if I didn't receive the first one, so that I can complete the verification process.

#### Acceptance Criteria

1. WHEN a user requests to resend an OTP, THE Auth_Controller SHALL invalidate any existing unused OTP for that email
2. WHEN a user requests to resend an OTP, THE OTP_Generator SHALL generate a new OTP_Code
3. WHEN a new OTP is generated via resend, THE Email_Service SHALL send the new OTP to the user's email address
4. THE Auth_Controller SHALL allow OTP resend requests for both signup and login flows
5. WHEN an OTP is resent, THE OTP_Store SHALL store the new OTP with a fresh expiration timestamp

### Requirement 7: Rate Limiting for OTP Operations

**User Story:** As a system administrator, I want to limit the rate of OTP generation and verification attempts, so that the system is protected against abuse and brute force attacks.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL limit OTP generation requests to 3 attempts per email address per 15-minute window
2. THE Rate_Limiter SHALL limit OTP verification attempts to 5 attempts per email address per 15-minute window
3. IF the OTP generation rate limit is exceeded, THEN THE Auth_Controller SHALL return an error response indicating rate limit exceeded
4. IF the OTP verification rate limit is exceeded, THEN THE Auth_Controller SHALL return an error response and temporarily block further attempts
5. WHEN the rate limit window expires, THE Rate_Limiter SHALL reset the attempt counter for that email address
6. THE Rate_Limiter SHALL track attempts separately for OTP generation and OTP verification

### Requirement 8: Single-Use OTP Enforcement

**User Story:** As a system administrator, I want each OTP to be usable only once, so that replay attacks are prevented.

#### Acceptance Criteria

1. WHEN an OTP is successfully verified, THE OTP_Store SHALL mark the OTP as used
2. WHEN an OTP verification is attempted, THE OTP_Verifier SHALL check if the OTP has already been used
3. IF an OTP has already been used, THEN THE OTP_Verifier SHALL reject the verification attempt
4. THE OTP_Verifier SHALL return a specific error message when a used OTP is submitted
5. THE OTP_Store SHALL maintain the used status for OTPs until they are removed from storage

### Requirement 9: Frontend OTP Input Interface

**User Story:** As a user, I want a clear and intuitive interface to enter my OTP code, so that I can easily complete the verification process.

#### Acceptance Criteria

1. WHEN an OTP is sent to a user, THE Frontend_UI SHALL display an OTP input form with 6 individual digit input fields
2. THE Frontend_UI SHALL automatically focus on the next input field when a digit is entered
3. THE Frontend_UI SHALL display the remaining time until OTP expiration
4. THE Frontend_UI SHALL provide a "Resend OTP" button that becomes enabled after 30 seconds
5. WHEN a user clicks "Resend OTP", THE Frontend_UI SHALL request a new OTP from the backend
6. THE Frontend_UI SHALL display clear error messages when OTP verification fails
7. THE Frontend_UI SHALL disable the submit button while OTP verification is in progress

### Requirement 10: API Endpoints for OTP Operations

**User Story:** As a frontend developer, I want well-defined API endpoints for OTP operations, so that I can integrate the OTP functionality into the user interface.

#### Acceptance Criteria

1. THE Auth_Controller SHALL provide a POST endpoint at /api/auth/signup/request-otp that accepts email, password, and name
2. THE Auth_Controller SHALL provide a POST endpoint at /api/auth/signup/verify-otp that accepts email and OTP_Code
3. THE Auth_Controller SHALL provide a POST endpoint at /api/auth/login/request-otp that accepts email and password
4. THE Auth_Controller SHALL provide a POST endpoint at /api/auth/login/verify-otp that accepts email and OTP_Code
5. THE Auth_Controller SHALL provide a POST endpoint at /api/auth/resend-otp that accepts email and flow type (signup or login)
6. THE Auth_Controller SHALL return appropriate HTTP status codes (200 for success, 400 for validation errors, 401 for authentication failures, 429 for rate limiting)
7. THE Auth_Controller SHALL return JSON responses with consistent structure including success status, message, and data fields

### Requirement 11: Email Service Configuration

**User Story:** As a system administrator, I want to configure the email service with proper credentials and settings, so that OTP emails can be sent reliably.

#### Acceptance Criteria

1. THE Email_Service SHALL support configuration via environment variables for SMTP host, port, username, and password
2. THE Email_Service SHALL support multiple email service providers (SMTP, SendGrid, AWS SES)
3. THE Email_Service SHALL validate email service configuration on application startup
4. IF email service configuration is invalid or missing, THEN THE Email_Service SHALL log an error and prevent OTP operations
5. THE Email_Service SHALL use TLS/SSL for secure email transmission
6. THE Email_Service SHALL include a configurable "from" email address and display name

### Requirement 12: OTP Storage Schema

**User Story:** As a backend developer, I want a well-defined database schema for OTP storage, so that OTP data is stored consistently and efficiently.

#### Acceptance Criteria

1. THE OTP_Store SHALL store OTP records with fields: email, OTP_Code, createdAt, expiresAt, isUsed, and purpose (signup or login)
2. THE OTP_Store SHALL create a database index on the email field for efficient lookups
3. THE OTP_Store SHALL create a database index on the expiresAt field for efficient cleanup operations
4. THE OTP_Store SHALL use MongoDB as the database system consistent with the existing GreenConnect backend
5. THE OTP_Store SHALL ensure the OTP_Code is stored as a string type to preserve leading zeros

### Requirement 13: Security and Error Handling

**User Story:** As a security-conscious user, I want the system to handle errors securely without revealing sensitive information, so that my account remains protected.

#### Acceptance Criteria

1. WHEN an OTP verification fails, THE Auth_Controller SHALL return a generic error message that does not reveal whether the email exists
2. THE Auth_Controller SHALL log detailed error information server-side for debugging while returning generic messages to clients
3. THE OTP_Store SHALL not expose OTP codes in API responses or logs
4. THE Auth_Controller SHALL validate all input parameters (email format, OTP format) before processing
5. IF invalid input is provided, THEN THE Auth_Controller SHALL return a 400 error with a descriptive validation message
6. THE Auth_Controller SHALL implement CSRF protection for OTP-related endpoints
7. THE Auth_Controller SHALL sanitize email inputs to prevent injection attacks

### Requirement 14: User Account Email Verification Status

**User Story:** As a system administrator, I want to track which user accounts have verified their email addresses, so that I can enforce email verification policies.

#### Acceptance Criteria

1. THE User model SHALL include an isEmailVerified boolean field with a default value of false
2. WHEN a user successfully verifies their email during signup, THE Auth_Controller SHALL set isEmailVerified to true
3. THE Auth_Controller SHALL include the isEmailVerified status in user profile responses
4. WHERE email verification is required, THE Auth_Controller SHALL prevent unverified users from accessing protected resources
5. THE Auth_Controller SHALL provide an endpoint to check email verification status for a logged-in user

### Requirement 15: Two-Factor Authentication Toggle

**User Story:** As a user, I want to enable or disable two-factor authentication for my account, so that I can control my security preferences.

#### Acceptance Criteria

1. THE User model SHALL include a twoFactorEnabled boolean field with a default value of false
2. THE Auth_Controller SHALL provide a PUT endpoint at /api/user/settings/2fa that allows users to toggle twoFactorEnabled
3. WHEN a user enables two-factor authentication, THE Auth_Controller SHALL require the user to verify an OTP before saving the setting
4. WHEN a user disables two-factor authentication, THE Auth_Controller SHALL require password confirmation
5. THE Auth_Controller SHALL include the twoFactorEnabled status in user profile responses
