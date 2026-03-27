# SmartForwarder EDI API

Use this guide to authenticate an EDI user, create shipments, manage shipment documents, and push AR/AP data into SmartForwarder.

Chinese version: [README_ZH.md](./README_ZH.md)

## Quick Start

1. Collect `baseUrl`, `identifier`, `password`, and `shop` from `admin@smartforwarder.co`.
2. Call `POST /auth/local` and store the returned JWT.
3. Call `GET /v1/health` with `Authorization: Bearer {{token}}`.
4. Start shipment testing with the minimum `POST /v1/shipments` body shown below.

> Critical for EDI shipment creation
> - `shipment_number` must be present at the top level of the request body.
> - `type` must also be present at the top level.
> - For contact fields on `ombl` / `hbls`, passing a stable upstream `id` is preferred.
> - If `id` is missing but `name` is present, the server generates a deterministic fallback source id from the normalized name.
> - If both `id` and `name` are missing, the contact field is stored as `null`.

## Endpoint Map

| Area | Endpoints | Notes |
|------|-----------|-------|
| Auth | `POST /auth/local` | Get the JWT used by all authenticated calls |
| Health | `GET /v1/health` | Fast token and connectivity check |
| Contacts | `GET /v1/contacts`, `GET /v1/contacts/:id` | Use when you want explicit SmartForwarder contact IDs |
| Shipments | `POST/GET/PUT/DELETE /v1/shipments`, `POST /v1/shipments/:id/memos` | Core EDI shipment workflow |
| Documents | `GET/POST /v1/shipments/:id/documents`, `PUT/DELETE /v1/documents/:id` | Shipment document management |
| Finance | `POST /v1/araps`, `GET /v1/transactions` | AR/AP creation and transaction lookup |

## First Working Shipment Request

Use this minimum payload first. Once it succeeds, add optional `ombl`, `hbls`, and document fields incrementally.

```bash
curl -X POST {{baseUrl}}/v1/shipments \
-H "Authorization: Bearer {{token}}" \
-H "Content-Type: application/json" \
-d '{
  "shipment_number": "SB202601309678",
  "type": "ocean_import",
  "ombl": {
    "mbl_no": "CMDUCHN30458001"
  },
  "hbls": []
}'
```

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
curl {{baseUrl}}/v1/health \
-H "Content-Type: application/json" \
-H "Authorization: Bearer {{token}}"
```

**Success Response**

**Code** : `200 OK`

**Content example**

```json
{
  "success": true
}
```

## Contact APIs

> Use the contact endpoints when you want to pass explicit SmartForwarder contact IDs in shipment payloads. If you omit `id` but keep a consistent contact `name`, the EDI shipment flow can still derive a stable fallback mapping.

### Get contacts list

**URL** : `/v1/contacts`

**Method** : `GET`

**Auth required** : YES

**API call**

```
GET {{baseUrl}}/v1/contacts?name_contains=ABC
Authorization: Bearer {{token}}
Content-Type: application/json
```

**curl example**

```bash
curl "{{baseUrl}}/v1/contacts?name_contains=ABC" \
-H "Authorization: Bearer {{token}}" \
-H "Content-Type: application/json"
```

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name_contains | string | **YES** | Filter by name containing text. At least 3 characters required. |
| _start | integer | no | Start index for pagination (default: 0) |
| _limit | integer | no | Number of records to return (default: 25) |
| _sort | string | no | Sort field (e.g., "name:asc", "created_at:desc") |
| types.value | string | no | Filter by contact type (e.g., "location") |
| tags | string | no | Filter by tag names (comma separated) |

> **Note:** Calling `/v1/contacts` without `name_contains` returns `400 Bad Request`. Only approved contacts are returned.

**Success Response**

**Code** : `200 OK`

**Content example**

```json
{
  "success": true,
  "total": 100,
  "data": [
    {
      "id": 123,
      "ext_id": "CONTACT_001",
      "name": "ABC Company",
      "short_name": "ABC",
      "country": "US",
      "city": "New York"
    },
    {
      "id": 124,
      "ext_id": "CONTACT_002",
      "name": "XYZ Corporation",
      "short_name": "XYZ",
      "country": "CN",
      "city": "Shanghai"
    }
  ]
}
```

### Get single contact

**URL** : `/v1/contacts/:id`

**Method** : `GET`

**Auth required** : YES

**API call**

```
GET {{baseUrl}}/v1/contacts/:id
Authorization: Bearer {{token}}
Content-Type: application/json
```

**curl example**

```bash
curl {{baseUrl}}/v1/contacts/CONTACT_001 \
-H "Authorization: Bearer {{token}}" \
-H "Content-Type: application/json"
```

**URL Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Contact external ID (ext_id) |

**Success Response**

**Code** : `200 OK`

**Content example**

```json
{
  "success": true,
  "data": {
    "id": 123,
    "ext_id": "CONTACT_001",
    "name": "ABC Company",
    "short_name": "ABC",
    "local_name": "ABC公司",
    "native_name": "ABC Company Ltd",
    "country": "US",
    "city": "New York",
    "state_code": "NY",
    "zip_code": "10001"
  }
}
```

**Error Response**

**Condition** : If contact not found.

**Code** : `200 OK`

**Content** :

```json
{
  "success": true,
  "data": null
}
```

#### Contact supported fields

**Note**: For security reasons, only public contact information is available through the OpenAPI. Sensitive business information such as addresses, phone numbers, emails, and financial data are not exposed.

**List API fields** (minimal information):
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Internal contact ID |
| ext_id | string | External contact ID (unique) |
| name | string | Contact name |
| short_name | string | Short name |
| country | string | Country code |
| city | string | City |

**Detail API fields** (extended public information):
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Internal contact ID |
| ext_id | string | External contact ID (unique) |
| name | string | Contact name |
| short_name | string | Short name |
| local_name | string | Local language name |
| native_name | string | Native language name |
| country | string | Country code |
| city | string | City |
| state_code | string | State/province code |
| zip_code | string | ZIP/postal code |

## Shipment APIs

### Shipment and document endpoint summary

The following authenticated endpoints are currently available in addition to the detailed examples below:

| Method | URL | Description |
|--------|-----|-------------|
| `POST` | `/v1/shipments` | Create a shipment |
| `GET` | `/v1/shipments` | Search shipments |
| `GET` | `/v1/shipments/:id` | Get a shipment by `ext_id` |
| `PUT` | `/v1/shipments/:id` | Update a shipment |
| `DELETE` | `/v1/shipments/:id` | Delete a shipment |
| `POST` | `/v1/shipments/:id/memos` | Add a shipment memo |
| `POST` | `/v1/araps` | Create AR/AP records |
| `GET` | `/v1/shipments/:id/documents` | List shipment documents |
| `POST` | `/v1/shipments/:id/documents` | Add shipment documents |
| `PUT` | `/v1/documents/:id` | Update a document |
| `DELETE` | `/v1/documents/:id` | Delete a document |
| `GET` | `/v1/transactions` | List transactions |

### Create a new shipment

Start with the minimum working body below. After this request succeeds, add master bill fields, house bills, contacts, containers, and documents step by step.

**URL** : `/v1/shipments`

**Method** : `POST`

**Auth required** : YES

**API call**

```
POST {{baseUrl}}/v1/shipments
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "shipment_number": "SB202601309678",
  "type": "ocean_import",
  "ombl": {
    "mbl_no": "CMDUCHN30458001"
  },
  "hbls": []
}
```

**curl example**

```bash
curl -X POST {{baseUrl}}/v1/shipments \
-H "Authorization: Bearer {{token}}" \
-H "Content-Type: application/json" \
-d '{
  "shipment_number": "SB202601309678",
  "type": "ocean_import",
  "ombl": {
    "mbl_no": "CMDUCHN30458001"
  },
  "hbls": []
}'
```

**Rules that are easy to miss**

| Rule | Why it matters |
|------|----------------|
| `shipment_number` must be top-level | EDI shipment identity and `original_code` generation use the top-level field |
| Do not place `shipment_number` only inside `ombl` or `hbls` | Nested values are not used as the source shipment number |
| `type` must be top-level | The create flow expects it at the request root |
| Contact `id` is preferred | Existing IDs keep contact mapping explicit and stable |
| Missing contact `id` falls back to `name` | The server derives a deterministic source id from the normalized contact name |
| Missing contact `id` and `name` becomes `null` | The contact will not be mapped or retained |

**Success Response**

**Code** : `200 OK`

**Content example**

```json
{
  "success": true,
  "data": {
    "ext_id": "0f7f9c4e-6e76-4f0c-a5d4-2a7f77ab1234"
  }
}
```

### Search shipments

Search shipments with pagination and optional filters. You can query by MBL number, HBL number, or container number.

**URL** : `/v1/shipments`

**Method** : `GET`

**Auth required** : YES

**API call**

```
GET {{baseUrl}}/v1/shipments
Authorization: Bearer {{token}}
Content-Type: application/json
```

**curl example**

```bash
# Search by MBL number
curl "${baseUrl}/v1/shipments?mbl_no_contains=ZIM&_limit=10" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json"

# Search by HBL number
curl "${baseUrl}/v1/shipments?hbls.hbl_no_contains=SSH&_limit=10" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json"

# Search by container number
curl "${baseUrl}/v1/shipments?shipment_containers.name_contains=MATU&_limit=10" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json"
```

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| _start | integer | Start index for pagination (default: 0) |
| _limit | integer | Number of records to return (default: 25) |
| _sort | string | Sort field (e.g., "created_at:desc") |
| mbl_no_contains | string | Filter by MBL number (partial match) |
| hbls.hbl_no_contains | string | Filter by HBL number (partial match) |
| shipment_containers.name_contains | string | Filter by container number (partial match) |

**Success Response**

**Code** : `200 OK`

**Content example**

```json
{
  "success": true,
  "total": 6,
  "data": [
    {
      "ext_id": "80b382fe-9804-41e9-8522-96abb26c3bb8",
      "shipment_number": "25091211",
      "ombl": { "ext_id": "...", "mbl_no": "ZIMUSNH222" },
      "hbls": [{ "ext_id": "...", "hbl_no": "SSHSE250" }],
      "shipment_containers": [{ "name": "KSSU1056", "seal_number": "A425097" }]
    }
  ]
}
```

> For more shipment search details, see [shipments.md](./shipments.md).

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

**Request structure**

Build the payload in three layers:

- Top level: `shipment_number`, `type`, `ombl`, `hbls`
- `ombl`: master bill fields and master-level contacts
- `hbls[]`: one or more house bills; each HBL can carry its own contacts and `containers`

```json
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

**Field groups to validate before go-live**

- `mbl_type`: see enum values below
- `term`: for example `CY-CY`
- `obl_type`: see enum values below
- `mode`: `FCL`, `LCL`, `CONS`, `BULK`, `AIR`
- `weightUnit`: `KG`, `LB`
- `volumeUnit`: `CBM`, `CFT`
- `type`: `ocean_import`, `ocean_export`, `air_import`, `air_export`

**Important contact note for EDI users**

- Contact-type fields such as `shipper`, `consignee`, `notify`, `customer`, `bill_to`, `carrier`, and similar fields on `ombl` / `hbls` should preferably provide a stable upstream `id`.
- If `id` is omitted but `name` is present, the server generates a deterministic fallback source id from the normalized contact name.
- If both `id` and `name` are missing, the contact field is stored as `null`.
- `agent` is handled separately by the authenticated EDI user's linked contact.
- Passing an explicit upstream contact `id` is still recommended when available, but for your current integration a consistent full contact name is enough to keep the mapping stable.
- **Direct SmartForwarder contact ID**: If you already know the SmartForwarder internal contact ID (e.g. from `GET /v1/contacts`), you can pass `{ "id": 123, "sf_internal": true }` to skip the contact mapping entirely. The ID will be used as-is.

**Full shipment example**

```json
{
  "shipment_number": "SB202601309678",
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

For explicit contact objects, we support the following fields. For EDI users, if `id` is omitted but `name` is present, shipment creation derives a stable fallback source id from the normalized name.

| Field      | Value                                              |
| ---------- | -------------------------------------------------- |
| id         | 123: the id in the original system                 |
| name       | cosco shipping line                                |
| short_name | cosco                                              |
| address    | World Business Center, Xiaoshan District, Hangzhou |
| country    | CN                                                 |
| city       | Hangzhou                                           |
| sf_internal | true: set this flag to use `id` as a SmartForwarder internal contact ID directly, skipping contact mapping. Get the ID from `GET /v1/contacts`. |

#### Shipment supported fields

| Field                               | Value                      |
| ----------------------------------- | -------------------------- |
| shipment_number | top-level only, e.g. SB202601309678 |
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

| Options | Explanation |
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

| Options | Explanation |
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

| Options | Explanation |
| :-----: | -----------: |
|   ORIGINAL BILL OF LADING    |      original |
|   telex    |  TELEX|
|   seaway_bill    |  SEAWAY BILL           |
|   e_bill    |  E-BILL |

#### Freight Payment

| Options | Explanation |
| :-----: | -----------: |
|   prepaid    |      prepaid |
|   collect |  collect |

#### HBL Release

| Options | Explanation |
| :-----: | -----------: |
|   original | original |
|   telex |  telex |

#### Sales Type

| Options | Explanation |
| :-----: | -----------: |
|   C | CO-LOAD|
|   F |  FREE CARGO |
|   N |  NOMI |


#### Cargo Type

| Options | Explanation |
| :-----: | -----------: |
| AUT | AUTOMOBILE (NON-HAZ)|
| BAT | BATTERY|
| NOR | GENERAL CARGO|
| DGG | HAZARDOUS|
| REF | REFRIGERATED|
| SPC | SPECIAL|


#### Mode 

| Options | Explanation |
| :-----: | -----------: |
| FCL | FCL |
| LCL | LCL |
| CONS | CONS |
| BULK | BULK |
| AIR | AIR |


#### weightUnit

| Options | Explanation |
| :-----: | -----------: |
| KG | KG |
| LB | LB |

#### volumeUnit

| Options | Explanation |
| :-----: | -----------: |
| CBM | CBM |
| CFT | CFT |
