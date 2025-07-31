# EDI 文档

登录 API 用于获取 EDI 用户的令牌。此令牌是后续 API 调用进行身份验证所必需的。

## 通用 API

### 登录 API

要使用登录 API，请联系管理员 admin@smartforwarder.co 获取以下信息：

1.	EDI 应用 ID：您的 EDI 应用程序的唯一标识符。
2.	EDI 应用密钥：与您的 EDI 应用程序关联的密钥。
3.	基础 API URL：API 端点的根 URL。

**URL** : `/auth/local`

**方法** : `POST`

**需要认证** : 否

**API 调用**

```
POST {{baseUrl}}/auth/local
Content-Type: application/json
```

**curl 示例**

```bash
curl -X POST {{baseUrl}}/auth/local \
-H "Content-Type: application/json" \
-d '{
   "identifier": "edi-app-id",
    "password": "edi-app-secret",
    "shop": "example.smartforwarder.co"
}'
```

**数据约束**

```json
{
  "identifier": "[EDI APP ID]",
  "password": "[EDI APP SECRET]",
  "shop": "[customer name]"
}
```

**数据示例**

```json
{
  "identifier": "edi-app-id",
  "password": "edi-app-secret",
  "shop": "example.smartforwarder.co"
}
```

**成功响应**

**代码** : `200 OK`

**内容示例**

```json
{
  "status": "Authenticated",
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTc1LCJpYXQiOjE3MDE3NDY1MzIsImV4cCI6MTcwNDMzODUzMn0.taQXfAZEO8GTdzgMK6nlQWwza5kiYBMVa85NK1U3yQw"
}
```

**错误响应**

**条件** : 如果 'identifier' 和 'password' 组合错误。

**代码** : `400 BAD REQUEST`

**内容** :

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

### 健康检查 API

检查健康状态

**URL** : `/v1/health`

**方法** : `GET`

**需要认证** : 是

**API 调用**

```
GET {{baseUrl}}/v1/health
Authorization: Bearer {{token}}
Content-Type: application/json
```

**curl 示例**

```bash
curl {{baseUrl}}/auth/local \
-H "Content-Type: application/json" \
-H "Authorization: Bearer {{token}}" \
```

**成功响应**

**代码** : `200 OK`

**内容示例**

```json
{
  "success": true
}
```

## 联系人 API

### 获取联系人列表

**URL** : `/v1/contacts`

**方法** : `GET`

**需要认证** : 是

**API 调用**

```
GET {{baseUrl}}/v1/contacts
Authorization: Bearer {{token}}
Content-Type: application/json
```

**curl 示例**

```bash
curl {{baseUrl}}/v1/contacts \
-H "Authorization: Bearer {{token}}" \
-H "Content-Type: application/json"
```

**查询参数**

| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| _start | integer | 分页起始索引（默认：0） |
| _limit | integer | 返回记录数量（默认：25） |
| _sort | string | 排序字段（例如："name:asc", "created_at:desc"） |
| name_contains | string | 按名称包含文本过滤 |
| approved | boolean | 按审批状态过滤 |
| disabled | boolean | 按禁用状态过滤 |
| types.value | string | 按联系人类型过滤（例如："location"） |
| tags | string | 按标签名称过滤（逗号分隔） |

**成功响应**

**代码** : `200 OK`

**内容示例**

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

### 获取单个联系人

**URL** : `/v1/contacts/:id`

**方法** : `GET`

**需要认证** : 是

**API 调用**

```
GET {{baseUrl}}/v1/contacts/:id
Authorization: Bearer {{token}}
Content-Type: application/json
```

**curl 示例**

```bash
curl {{baseUrl}}/v1/contacts/CONTACT_001 \
-H "Authorization: Bearer {{token}}" \
-H "Content-Type: application/json"
```

**URL 参数**

| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| id | string | 联系人外部 ID (ext_id) |

**成功响应**

**代码** : `200 OK`

**内容示例**

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
    "zip_code": "10001",
    "approved": true,
    "disabled": false
  }
}
```

**错误响应**

**条件** : 如果联系人未找到。

**代码** : `200 OK`

**内容** :

```json
{
  "success": true,
  "data": null
}
```

#### 联系人支持字段

**注意**：出于安全考虑，OpenAPI 仅提供公开的联系人信息。敏感的商业信息如地址、电话号码、电子邮件和财务数据不会暴露。

**列表 API 字段**（最小信息）：
| 字段 | 类型 | 描述 |
|-------|------|-------------|
| id | integer | 内部联系人 ID |
| ext_id | string | 外部联系人 ID（唯一） |
| name | string | 联系人名称 |
| short_name | string | 简称 |
| country | string | 国家代码 |
| city | string | 城市 |

**详情 API 字段**（扩展公开信息）：
| 字段 | 类型 | 描述 |
|-------|------|-------------|
| id | integer | 内部联系人 ID |
| ext_id | string | 外部联系人 ID（唯一） |
| name | string | 联系人名称 |
| short_name | string | 简称 |
| local_name | string | 本地语言名称 |
| native_name | string | 本地语言名称 |
| country | string | 国家代码 |
| city | string | 城市 |
| state_code | string | 州/省代码 |
| zip_code | string | 邮政编码 |
| approved | boolean | 审批状态 |
| disabled | boolean | 禁用状态 |

## 运单 API

### 创建新运单

**URL** : `/v1/shipments`

**方法** : `POST`

**需要认证** : 是

**API 调用**

```
POST {{baseUrl}}/v1/shipments
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "field": "value"
}
```

**curl 示例**

```bash
curl -X POST {{baseUrl}}/v1/shipments \
-H "Authorization: Bearer {{token}}" \
-H "Content-Type: application/json" \
-d '{
  "field": "value"
}'
```

**成功响应**

**代码** : `200 OK`

**内容示例**

```json
{
  "success": true
}
```

**API POST 请求体**

在 POST 请求体中，我们需要以下信息：

1. MBL 字段
1. HBLs
   1. HBL1 字段
      1. containers
   1. HBL2 字段
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

1. mbl_type（见下文）
1. term（见下文）
  1. 示例：CY-CY
1. obl_type（见下文）
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

#### 联系人类型

对于联系人类型，我们支持以下字段

| 字段      | 值                                              |
| ---------- | -------------------------------------------------- |
| id         | 123：原始系统中的 ID                 |
| name       | cosco shipping line                                |
| short_name | cosco                                              |
| address    | World Business Center, Xiaoshan District, Hangzhou |
| country    | CN                                                 |
| city       | Hangzhou                                           |

#### 运单支持字段

| 字段                               | 值                      |
| ----------------------------------- | -------------------------- |
| type | ocean_import |

#### OMBL 支持字段

| 字段                               | 值                      |
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

#### HBL 支持字段

| 字段                               | 类型             |
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

#### 集装箱支持字段

| 字段              | 值       |
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

### 枚举类型 

#### MBL 类型：

| 选项 | 说明 |
| :-----: | -----------: |
|   CL    |      拼箱 |
|   CS    |  拼箱 |
|   DR    |  直航             |
|   DP    |  直航三角 |
|   FW    |   货运代理 |
|   NR    |       普通 |
|   TP    |  第三方 |
|   TR    |  三角 |
|   OT    |  其他 |

#### 条款类型：

| 选项 | 说明 |
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

#### OBL 类型：

| 选项 | 说明 |
| :-----: | -----------: |
|   ORIGINAL BILL OF LADING    |      original |
|   telex    |  TELEX|
|   seaway_bill    |  海运单           |
|   e_bill    |  电子提单 |

#### 运费支付

| 选项 | 说明 |
| :-----: | -----------: |
|   prepaid    |      预付 |
|   collect |  到付 |

#### HBL 放货

| 选项 | 说明 |
| :-----: | -----------: |
|   original | 正本 |
|   telex |  telex |

#### 销售类型

| 选项 | 说明 |
| :-----: | -----------: |
|   C | 拼箱 |
|   F |  免费货物 |
|   N |  指定 |


#### 货物类型

| 选项 | 说明 |
| :-----: | -----------: |
| AUT | 汽车（非危险品） |
| BAT | 电池 |
| NOR | 普通货物 |
| DGG | 危险品 |
| REF | 冷藏 |
| SPC | 特殊 |


#### 运输模式 

| 选项 | 说明 |
| :-----: | -----------: |
| FCL | 整箱 |
| LCL | 拼箱 |
| CONS | 拼箱 |
| BULK | 散货 |
| AIR | 空运 |


#### 重量单位

| 选项 | 说明 |
| :-----: | -----------: |
| KG | 公斤 |
| LB | 磅 |

#### 体积单位

| 选项 | 说明 |
| :-----: | -----------: |
| CBM | 立方米 |
| CFT | 立方英尺 | 