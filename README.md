# Bug-mfa

> Bug mfa

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev
```

## Preparation before testing

1.Add your firebase configuration to services/firebase.js

2.Change your firebase project to plan Blaze and add email login in firebase console

3.Add MFA to your https://cloud.google.com/identity-platform/docs/web/mfa click on "Go to the Identity Providers page" button


## The problem

When you add 1st mfa phone number, then 2nd if you try to unenroll 2nd factor, factor will be removed but you will get this error in query:
https://www.googleapis.com/identitytoolkit/v3/relyingparty/getAccountInfo?key=***
```bash
{
  "error": {
    "code": 400,
    "message": "TOKEN_EXPIRED",
    "errors": [
      {
        "message": "TOKEN_EXPIRED",
        "domain": "global",
        "reason": "invalid"
      }
    ]
  }
}
```
Which will log out user, what is strange is if you delete it in another sequence: add 1st factor, 2nd factor and unenroll 1st, everything will work fine...

## Steps to reproduce
1. Start up project
2. Register or login 
3. Verify email
4. Write 1st mfa factor number
5. Click on get SMS
6. Enter code
7. Press "accept code"
8. Do step 4-7 again
9. Delete 2nd factor you added and you will get error in network tab and i console.

P.S I putted project very roughly, just to show problem, window.alerts should guide little bit as well.
