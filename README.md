# EDI document

Document for the SmartForwarder EDI. All APIs are regular REST API calls.

## Common APIs

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
      "shipper": {
        "id": 456,
        "name": "example shipper"
      },
      "consignee": {
        "id": 4567,
        "name": "example consignee"
      },
      "notify": {
        "id": 4569,
        "name": "example notify"
      },
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

#### Shipment supported fields

| Field                               | Value                      |
| ----------------------------------- | -------------------------- |
| type | ocean_import |

#### OMBL supported fields

| Field                               | Value                      |
| ----------------------------------- | -------------------------- |
| mbl_no                              | OOLU2735700604             |
| agent                               | contact type               |
| carrier                             | contact type               |
| coloader                            | contact type               |
| mode                                | FCL                        |
| term                                | CY-DOOR                    |
| agent_ref_no                        | NULL                       |
| sub_bl_no                           | NULL                       |
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
| freight_payment                     | PREPAID                    |
| obl_type                            | seaway_bill                |
| original_bl_received_date           | NULL                       |
| telex_release_received_date         | NULL                       |
| release_date                        | 2024-05-01                 |
| place_of_receipt                    | NULL                       |
| place_of_receipt_original_location  | NULL                       |
| place_of_receipt_etd                | NULL                       |
| container_return_location           | NULL                       |
| it_no                               | NULL                       |
| it_date                             | NULL                       |
| it_place                            | NULL                       |
| freight_charge_weight               | NULL                       |
| entry_date                          | NULL                       |
| shipper                             | contact type               |
| consignee                           | contact type               |
| notify                              | contact type               |
| additional_notify                   | NULL                       |
| original_bl_released_date           | NULL                       |
| cargo_type                          | NULL                       |
| customer                            | contact type               |
| bill_to                             | contact type               |
| customer_ref_no                     | NULL                       |
| last_e_tracking_date                | NULL                       |
| original_code                       | NULL                       |
| post_at                             | NULL                       |
| hbl_no                              | NULL                       |
| trucker                             | contact type               |
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
| doc_cut_off_time                    | NULL                       |
| port_cut_off_time                   | NULL                       |
| vgm_cut_off_time                    | NULL                       |
| rail_cut_off_time                   | NULL                       |
| po_no                               | NULL                       |
| itn_no                              | NULL                       |
| cfs_contact                         | NULL                       |
| cfs_phone                           | NULL                       |
| mark                                | NULL                       |
| shipping_agency                     | NULL                       |
| carrier_booking_no                  | O2735700604                |
| doc_cut_off_date                    | NULL                       |
| port_cut_off_date                   | NULL                       |
| rail_cut_off_date                   | NULL                       |
| doc_cut_off_hour                    | NULL                       |
| port_cut_off_hour                   | NULL                       |
| rail_cut_off_hour                   | NULL                       |
| forwarding_agent                    | contact type               |
| arrival_notice_remark               | NULL                       |
| delivery_order_remark               | NULL                       |
| soc_address                         | NULL                       |
| final_eta_hour                      | NULL                       |
| on_board_date                       | NULL                       |
| delivery_location                   | NULL                       |
| pickup_location                     | NULL                       |
| broker                              | contact type               |
| last_free_date                      | NULL                       |
| arrival_notice_sent_date            | NULL                       |
| delivery_order_sent_date            | NULL                       |
| chargeable_weight                   | NULL                       |
| chargeable_weight_unit              | NULL                       |
| customer_booking_no                 | NULL                       |

#### HBL supported fields

| Field                               | Type             |
| ----------------------------------- | ---------------- |
| hbl_no                              | string           |
| customer                            | contact type     |
| bill_to                             | contact type     |
| shipper                             | contact type     |
| consignee                           | contact type     |
| notify                              | contact type     |
| additional_notify                   | contact type     |
| agent                               | contact type     |
| trucker                             | contact type     |
| broker                              | contact type     |
| po_no                               | string           |
| ams_no                              | string           |
| isf_no                              | string           |
| cycfs_location                      | contact type     |
| available_date                      | date             |
| place_of_delivery                   | string           |
| place_of_delivery_original_location | string           |
| place_of_delivery_eta               | date             |
| final_destination                   | NULL             |
| final_destination_original_location | NULL             |
| final_eta                           | NULL             |
| delivery_location                   | NULL             |
| mode                                | FCL              |
| freight_payment                     | NULL             |
| last_free_date                      | 2024-05-09       |
| rail                                | NULL             |
| rail_company                        | NULL             |
| it_no                               | NULL             |
| it_date                             | NULL             |
| it_place                            | NULL             |
| go_date                             | NULL             |
| expiry_date                         | NULL             |
| hbl_release                         | telex            |
| sales_type                          | NULL             |
| incoterms                           | NULL             |
| cargo_type                          | NOR              |
| term                                | NULL             |
| entry_no                            | NULL             |
| entry_doc_sent_date                 | NULL             |
| original_bl_received_date           | NULL             |
| telex_release_received_date         | date             |
| is_release_order_required           | NULL             |
| hold_notes                          | NULL             |
| hold_reason                         | NULL             |
| release_date                        | date             |
| door_delivery_date                  | NULL             |
| arrival_notice_sent_date            | date: 2024-05-02 |
| delivery_order_sent_date            | NULL             |
| commodity                           | NULL             |
| package                             | NULL             |
| pieces                              | NULL             |
| weight                              | NULL             |
| measure                             | NULL             |
| commodity_info                      | NULL             |
| pickup_number                       | NULL             |
| weightUnit                          | KG               |
| volumeUnit                          | CBM              |
| entry_date                          | NULL             |
| mark                                | string           |
| arrival_notice_remark               | NULL             |
| delivery_order_remark               | NULL             |
| additional_delivery_location        | NULL             |
| commercial_invoice_no               | NULL             |
| soc_address                         | NULL             |
| chargeable_weight                   | NULL             |
| rate_class                          | NULL             |
| chargeable_weight_unit              | NULL             |
| nature_quantity_of_goods            | NULL             |
| other_charges                       | NULL             |
| original_bl_released_date           | NULL             |
| original_code                       | NULL             |
| loading_location                    | NULL             |
| origin_terminal                     | NULL             |
| hbl_type                            | seaway_bill      |
| itn_no                              | NULL             |
| forwarding_agent                    | contact type     |
| sub_bl_no                           | NULL             |
| place_of_receipt                    | NULL             |
| place_of_receipt_original_location  | NULL             |
| place_of_receipt_etd                | NULL             |
| pickup_location                     | NULL             |
| carrier_booking_no                  | NULL             |
| equipment_origin                    | NULL             |
| on_board_date                       | NULL             |
| booking_requested_date              | NULL             |
| booking_confirmed_date              | NULL             |
| ci_pl_received_date                 | NULL             |
| isf_filed_date                      | NULL             |
| hbl_issued_date                     | NULL             |
| document_approved_date              | NULL             |
| ams_accepted_date                   | NULL             |
| delivery_trucker                    | NULL             |
| container_return_location           | NULL             |
| delivery_pickup_date                | NULL             |
| equipment_return_date               | NULL             |

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
| pickup_date        | NULL        |
| move_date          | NULL        |
| delivery_date      | NULL        |
| return_date        | NULL        |
| soc                | 0           |
| gatein_date        | NULL        |
| mark               | N/M         |
| weightUnit         | KG          |
| volumeUnit         | CBM         |
| last_free_date     | NULL        |
| discharged_date    | NULL        |
| it_number          | NULL        |
| rail_bl            | NULL        |
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