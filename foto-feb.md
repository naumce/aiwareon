# Foto-Feb - To Be Investigated

## Workspace Invitation Bug (2026-02-20)

**Steps to reproduce:**
1. User X sends invitation to User Y
2. User Y accepts the invitation
3. User Y does not have an account, so signs up
4. User Y adds verification code, completes signup
5. User Y goes to login, logs in
6. Gets 403 Forbidden error when trying to accept the invitation

**Request:**
```
POST http://localhost:7001/api/v1/workspace-invitations/nLpJ8xt3hNhk9s1zpkYiln7eSwUCi66nkRReBF3pK5A/accept
Status: 403 Forbidden
```

**Response:**
```json
{
    "detail": "Invitation email does not match your account"
}
```

**Dialog shown:**
> Could not accept invitation
> Invitation email does not match your account
> [Decline] [Go to Workspace]

**Additional notes:**
- After refreshing, no workspace appears
- The email mismatch suggests the signup email may differ from the invitation email, OR the invitation token is not being matched correctly to the newly created account
- Possible causes:
  - Email case sensitivity issue (e.g. uppercase vs lowercase)
  - Invitation was sent to a different email than what was used to sign up
  - The accept endpoint checks the invitation email against the logged-in user's email and they don't match
  - Token/session issue after signup -> login flow
