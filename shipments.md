# EDI document

The Login API is used to collect a Token for an EDI User. This token is required to authenticate subsequent API calls.


## Common APIs

### Login API

To use the Login API, please contact the administrator at admin@smartforwarder.co to obtain the following information

1.	EDI App ID: A unique identifier for your EDI application.
2.	EDI App Secret: A secret key associated with your EDI application.
3.	Base API URL: The root URL for the API endpoints.

**URL** : `/auth/local`

**Method** : `POST`

**Auth required** : NO

**API call**

```
POST {{baseUrl}}/auth/local
Content-Type: application/json
```

**curl example\***

```bash
curl -X POST {{baseUrl}}/auth/local \
-H "Content-Type: application/json" \
-d '{
   "identifier": "edi-app-id",
    "password": "edi-app-secret",
    "shop": "example.smartforwarder.co"
}'
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

**curl example**

```bash
curl {{baseUrl}}/auth/local \
-H "Content-Type: application/json" \
-H "Authorization: Bearer {{token}}" \
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

{
  "field": "value"
}
```

**curl example**

```bash
curl -X POST {{baseUrl}}/v1/shipments \
-H "Authorization: Bearer {{token}}" \
-H "Content-Type: application/json" \
-d '{
  "field": "value"
}'
```

**Success Response**

**Code** : `200 OK`

**Content example**

```json
{
  "success": true
}
```

### Add memo to shipment

**URL** : `/v1/shipments/:id/memos`

**Method** : `POST`

**Auth required** : YES

**API call**

```
POST {{baseUrl}}/v1/shipments/:id/memos
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "subject": "Shipment delay notice",
  "content": "Due to weather conditions, the shipment has been delayed by 2 days. New ETA is March 15th, 2024.",
  "type": "general"
}
```

**curl example**

```bash
curl --location '{{baseUrl}}/v1/shipments/fe9748bd-be64-4a06-92ae-609ba19f65d3/memos' \
--header 'Authorization: Bearer {{token}}' \
--header 'Content-Type: application/json' \
--data '{
  "subject": "Shipment delay notice",
  "content": "Due to weather conditions, the shipment has been delayed by 2 days. New ETA is March 15th, 2024.",
  "type": "general"
}'
```

**URL Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Shipment ID (UUID) |

**Request Body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subject | string | Yes | Memo subject/title |
| content | string | Yes | Memo content/body |
| type | string | Yes | Memo type (e.g., "general", "delay", "update") |

**Success Response**

**Code** : `200 OK`

**Content example**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "subject": "Shipment delay notice",
    "content": "Due to weather conditions, the shipment has been delayed by 2 days. New ETA is March 15th, 2024.",
    "type": "general",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**API POST body**

In the post body, we need the information like following.

1. MBL fields
1. HBLs
   1. HBL1 fields
      1. containers
   1. HBL2 fields
      1. containers

```JSON
{
  "mbl_field1": "value1",
  "mbl_field2": "value2",
  "hbls": [
    {
      "hbl1_field1": "value1",
      "hbl1_field2": "value2",
      "containers": [
        {"container1": "value" },
        {"container2": "value" }
      ]
    },
    {
      "hbl2_field1": "value1",
      "hbl2_field2": "value2",
      "containers": [
        {"container1": "value" },
        {"container2": "value" }
      ]
    }
  ]
}
```

1. mbl_type (see below)
1. term (see below)
  1. Example: CY-CY
1. obl_type (see below)
1. mode
   1. FCL
   1. LCL
   1. CONS
   1. BULK
   1. AIR
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




```JSON
{
  "ombl": {
    "carrier_booking_no": "CARRIER_BOOKING_NUMBER",
    "weightUnit": "KG",
    "volumeUnit": "CBM",
    "weight": 200,
    "measure": 300,
    "pieces": 2,
    "mode": "FCL",
    "term": "CY-CY",
    "obl_type": "original",
    "mbl_no": "ZFNG266030",
    "mbl_type": "NR",
    "vessel": "VESSEL",
    "voyage": "VOYAGE",
    "port_of_loading": " (CNNBO)NINGBO, ZJ, CHINA",
    "port_of_discharge": " (USNYC)NEW YORK, NY, US",
    "mark": "N/M",
    "commodity_info": "CARGO DESCRIPTION",
    "carrier": {
      "id": 123,
      "name": "example carrier"
    },
    "containers": [
      {
        "name": "CNT1234567",
        "seal_number": "SEAL-NUMBER",
        "size": "40",
        "type": "RF",
        "pieces": 1,
        "weight": 200,
        "measure": 300,
        "mark": "N/M"
      }
    ],
    "eta": "2024-08-30",
    "etd": "2024-07-31"
  },
  "hbls": [
    {
      "hbl_no": "HPTE260926",
      "ams_no": "AMS-NUMBER",
      "isf_no": "ISF-NUMBER",
      "mode": "FCL",
      "last_free_date": null,
      "hbl_release": "original",
      "cargo_type": "NOR",
      "containers": [
        {
          "name": "CNT1234567",
          "seal_number": "SEAL-123456",
          "size": "40",
          "type": "ODO",
          "pieces": 1,
          "weight": 20,
          "measure": 30,
          "mark": "N/M"
        }
      ],
      "mark": "N/M",
      "commodity_info": "CARGO DESCRIPTION",
      "pieces": 1,
      "weight": 20,
      "weightUnit": "KG",
      "measure": 30,
      "volumeUnit": "CBM"
    }
  ],
  "type": "ocean_import"
}
```

#### Shipment supported fields

| Field                               | Value                      |
| ----------------------------------- | -------------------------- |
| type | ocean_import |

#### OMBL supported fields

| Field                               | Value                      |
| ----------------------------------- | -------------------------- |
| mbl_no                              | OOLU2735700604             |
| mode                                | FCL                        |
| term                                | CY-DOOR                    |
| carrier_contract_no                 | NULL                       |
| eta                                 | 2024-05-02                 |
| etd                                 | 2024-05-02                       |
| atd                                 | 2024-05-02                       |
| ata                                 | 2024-05-02                       |
| etb                                 | 2024-05-02                       |
| final_eta                           | 2024-05-02                       |
| port_of_discharge                   | LONGBEACH                  |
| port_of_transit                     | NULL                       |
| port_of_loading                     | (CNSGH)SHANGHAI, SH, CHINA |
| vessel                              | OOCL EGYPT 059E            |
| voyage                              | 059E                       |
| place_of_delivery                   | NULL                       |
| place_of_delivery_original_location | NULL                       |
| place_of_delivery_eta               | NULL                       |
| final_destination                   | NULL                       |
| final_destination_original_location | NULL                       |
| mbl_type                            | NR                         |
| cy_location                         | NULL                       |
| cfs_location                        | NULL                       |
| obl_type                            | seaway_bill                |
| original_bl_received_date           | NULL                       |
| telex_release_received_date         | NULL                       |
| release_date                        | 2024-05-01                 |
| place_of_receipt                    | NULL                       |
| place_of_receipt_original_location  | NULL                       |
| place_of_receipt_etd                | NULL                       |
| container_return_location           | NULL                       |
| original_bl_released_date           | NULL                       |
| customer_ref_no                     | NULL                       |
| post_at                             | NULL                       |
| hbl_no                              | NULL                       |
| ship_type                           | NULL                       |
| commodity                           | NULL                       |
| package                             | NULL                       |
| pieces                              | 1                          |
| weight                              | NULL                       |
| measure                             | NULL                       |
| commodity_info                      | NULL                       |
| pickup_number                       | NULL                       |
| weightUnit                          | KG                         |
| volumeUnit                          | CBM                        |
| mark                                | NULL                       |
| carrier_booking_no                  | O2735700604                |
| chargeable_weight                   | NULL                       |
| chargeable_weight_unit              | NULL                       |
| customer_booking_no                 | NULL                       |
| customer                            | contact type     |
| bill_to                             | contact type     |
| shipper                             | contact type     |
| consignee                           | contact type     |
| notify                              | contact type     |
| additional_notify                   | contact type     |
| agent                               | contact type     |
| trucker                             | contact type     |
| broker                              | contact type     |

#### HBL supported fields

| Field                               | Type             |
| ----------------------------------- | ---------------- |
| hbl_no                              | string           |
| po_no                               | string           |
| ams_no                              | string           |
| isf_no                              | string           |
| available_date                      | date             |
| place_of_delivery                   | string           |
| place_of_delivery_original_location | string           |
| place_of_delivery_eta               | date             |
| final_destination                   | NULL             |
| final_destination_original_location | NULL             |
| final_eta                           | NULL             |
| mode                                | FCL              |
| freight_payment                     | NULL             |
| last_free_date                      | 2024-05-09       |
| commodity                           | NULL             |
| package                             | NULL             |
| pieces                              | NULL             |
| weight                              | NULL             |
| measure                             | NULL             |
| commodity_info                      | NULL             |
| pickup_number                       | NULL             |
| weightUnit                          | KG               |
| volumeUnit                          | CBM              |
| mark                                | string           |
| chargeable_weight                   | NULL             |
| rate_class                          | NULL             |
| chargeable_weight_unit              | NULL             |
| nature_quantity_of_goods            | NULL             |
| other_charges                       | NULL             |
| original_bl_released_date           | NULL             |
| original_code                       | NULL             |
| loading_location                    | NULL             |
| hbl_type                            | seaway_bill      |
| place_of_receipt_etd                | NULL             |
| pickup_location                     | NULL             |
| carrier_booking_no                  | NULL             |
| equipment_origin                    | NULL             |
| on_board_date                       | NULL             |
| customer                            | contact type     |
| bill_to                             | contact type     |
| shipper                             | contact type     |
| consignee                           | contact type     |
| notify                              | contact type     |
| additional_notify                   | contact type     |
| agent                               | contact type     |
| trucker                             | contact type     |
| broker                              | contact type     |

#### Container supported fields

| Field              | Value       |
| ------------------ | ----------- |
| name               | ABCD9298668 |
| type               | HC          |
| pieces             | 900         |
| pickup_number      | NULL        |
| seal_number        | EFGH123     |
| weight             | 12690.00    |
| size               | 40          |
| measure            | 68.000      |
| mark               | N/M         |
| weightUnit         | KG          |
| volumeUnit         | CBM         |
| discharged_date    | NULL        |
| iso_container_type | NULL        |
| country_origin     | NULL        |
| original_code      | NULL        |
| po_no              | NULL        |
| commodity_info     | NULL        |

### Enum types 

#### MBL Types:

| Options | Explaination |
| :-----: | -----------: |
|   CL    |      CO-LOAD |
|   CS    |  Consol|
|   DR    |  Direct             |
|   DP    |  Direct Triangle |
|   FW    |   Forwarding|
|   NR    |       Normal |
|   TP    |  Third Party |
|   TR    |  Triangle |
|   OT    |  Other |

#### Term Types:

| Options | Explaination |
| :-----: | -----------: |
|  BT| BT|
|  CFS| CFS|
|  CY| CY|
|  DOOR| DOOR|
|  FI| FI|
|  FO| FO|
|  FT| FOT|
|  RAMP| RAMP |
|  TK | TACKLE |

#### OBL Types:

| Options | Explaination |
| :-----: | -----------: |
|   ORIGINAL BILL OF LADING    |      original |
|   telex    |  TELEX|
|   seaway_bill    |  SEAWAY BILL           |
|   e_bill    |  E-BILL |

#### Freight Payment

| Options | Explaination |
| :-----: | -----------: |
|   prepaid    |      prepaid |
|   collect |  collect |

#### HBL Release

| Options | Explaination |
| :-----: | -----------: |
|   original | original |
|   telex |  telex |

#### Sales Type

| Options | Explaination |
| :-----: | -----------: |
|   C | CO-LOAD|
|   F |  FREE CARGO |
|   N |  NOMI |


#### Cargo Type

| Options | Explaination |
| :-----: | -----------: |
| AUT | AUTOMOBILE (NON-HAZ)|
| BAT | BATTERY|
| NOR | GENERAL CARGO|
| DGG | HAZARDOUS|
| REF | REFRIGERATED|
| SPC | SPECIAL|


#### Mode 

| Options | Explaination |
| :-----: | -----------: |
| FCL | FCL |
| LCL | LCL |
| CONS | CONS |
| BULK | BULK |
| AIR | AIR |


#### weightUnit

| Options | Explaination |
| :-----: | -----------: |
| KG | KG |
| LB | LB |

#### volumeUnit

| Options | Explaination |
| :-----: | -----------: |
| CBM | CBM |
| CFT | CFT |

#### Contact Type

For contact type, we support the following fields

| Field      | Value                                              |
| ---------- | -------------------------------------------------- |
| id         | 123: the id in the original system                 |
| name       | cosco shipping line                                |
| short_name | cosco                                              |
| address    | World Business Center, Xiaoshan District, Hangzhou |
| country    | CN                                                 |
| city       | Hangzhou                                           |



