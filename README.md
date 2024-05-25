# EDI document 

Document for the SmartForwarder OpenAPI

## Supported common parameters

### Limit 

Limit the size of the returned results.

The default limit is 100

***Examples***

```
GET /users?_limit=30
```

### Sort

Sort according to a specific field.

***Examples***

```
GET /users?_sort=email:ASC to sort by ascending order
GET /users?_sort=email:DESC to sort by descending order
```

### Start

Skip a specific number of entries (especially useful for pagination).

***Examples***
```
GET /users?_start=10&_limit=10
```

## Login and health check APIs

### Login API
Used to collect a Token for an OpenAPI User.

**URL** : `/auth/local`

**Method** : `POST`

**Auth required** : NO

**API call**
```
POST {{baseUrl}}/auth/local
Content-Type: application/json
```

**Data constraints**
```json
{
    "identifier": "[OpenAPI username]",
    "password": "[password in plain text]",
    "shop": "[customer name]"
}
```

**Data example**

```json
{
    "username": "iloveauth@example.com",
    "password": "abcd1234",
    "shop": "longtemp.smartforwarder.co"
}
```

**Success Response**

**Code** : `200 OK`

**Content example**

```json
{
  "status": "Authenticated",
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTc1LCJpYXQiOjE3MDE3NDY1MzIsImV4cCI6MTcwNDMzODUzMn0.taQXfAZEO8GTdzgMK6nlQWwza5kiYBMVa85NK1U3yQw"
}
```

**Error Response**

**Condition** : If 'username' and 'password' combination is wrong.

**Code** : `400 BAD REQUEST`

**Content** :

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": [
    {
      "messages": [
        {
          "id": "Auth.form.error.invalid",
          "message": "Invalid email or password."
        }
      ]
    }
  ],
  "data": [
    {
      "messages": [
        {
          "id": "Auth.form.error.invalid",
          "message": "Invalid email or password."
        }
      ]
    }
  ]
}
```

### Health API

Check the health status 

**URL** : `/v1/health`

**Method** : `GET`

**Auth required** : YES

**API call**
```
GET {{baseUrl}}/v1/health
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Success Response**

**Code** : `200 OK`

**Content example**

```json
{
  "success": true
}
```
