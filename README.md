# EDI document 

Document for the SmartForwarder EDI

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
Used to collect a Token for an EDI User. Please contact the admin@smartforwarder.co to get the following informaiton

1. EDI app id
1. EDI app secret
1. Base API url

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
    "identifier": "[EDI APP ID]",
    "password": "[EDI APP SECRET]",
    "shop": "[customer name]"
}
```

**Data example**

```json
{
    "identifier": "edi-app-id",
    "password": "edi-app-secret",
    "shop": "example.smartforwarder.co"
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

**Condition** : If 'identifier' and 'password' combination is wrong.

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

## Shipment APIs

### Create a new shipment

**URL** : `/v1/shipments`

**Method** : `POST`

**Auth required** : YES

**API call**
```
POST {{baseUrl}}/v1/shipments
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

**API POST body**


1. containers ext id
1. mbl_type (see below)
1. term
    1. CY-CY
    1. CFS-CFS
    1. and more
1. obl_type
1. mode
    1. FCL
    1. LCL
    1. CONS
    1. BULK
    1. AIR
1. carrier
1. weightUnit
    1. KG
    1. LB
1. volumeUnit
    1. CBM
    1. CFT
1. type
    1. ocean_import
    1. ocean_export
    1. air_import
    1. air_export
1. do we need to have some fields in both shipment and ombl ?


| Field Name   | Options   | Explaination  |
|------------|:----------:|-----------:|
| mbl_type | CL | CO-LOAD |
| | CS | |
| | DR | |
| | DR | |
| | FW | |
| | NR | Normal |
| | TP | |
| | TR | |
| | OT | |

```JSON
{
  "mbl_no":"MBL-number",
  "office":"20",
  "mbl_type":"NR",
  "carrier_booking_no":"CARRIER_BOOKING_NUMBER",
  "carrier":{
    "id": 123,
    "name": "example carrier"
  },
  "vessel":"VESSEL",
  "voyage":"VOYAGE",
  "port_of_loading":" (CNNBO)NINGBO, ZJ, CHINA",
  "etd":"2024-05-25",
  "port_of_discharge":" (USNYC)NEW YORK, NY, US",
  "eta":"2024-05-31",
  "mode":"FCL",
  "term":"CY-CY",
  "obl_type":"original",
  "containers":[
    {
      "ext_id":"new_167097",
      "name":"CNT1234567",
      "seal_number":"SEAL-NUMBER",
      "size":"40",
      "type":"RF",
      "pieces":1,
      "weight":200,
      "measure":300,
      "mark":"N/M"
    }
  ],
  "pieces":1,
  "weight":200,
  "weightUnit":"KG",
  "measure":300,
  "volumeUnit":"CBM",
  "hbls":[
    {
      "hbl_no":"HBL-NUMBER",
      "ams_no":"AMS-NUMBER",
      "isf_no":"ISF-NUMBER",
      "shipper":{
        "id": 456,
        "name": "example shipper"
      },
      "consignee":154973,
      "consignee_print_as":"",
      "notify":134604,
      "notify_print_as":"",
      "operator":"202",
      "mode":"FCL",
      "last_free_date":null,
      "hbl_release":"original",
      "cargo_type":"NOR",
      "containers":[
        {
          "name":"CNT1234567",
          "seal_number":"SEAL-123456",
          "size":"40",
          "type":"ODO",
          "pieces":1,
          "weight":20,
          "measure":30,
          "mark":"N/M"
        }
      ],
      "pieces":1,
      "weight":20,
      "weightUnit":"KG",
      "measure":30,
      "volumeUnit":"CBM"
    }
  ],
  "type":"ocean_import"
}
```