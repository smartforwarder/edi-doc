# SmartForwarder EDI API 文档

这份文档用于说明如何让 EDI 用户完成登录认证、创建运单、管理运单单据，以及推送应收应付数据到 SmartForwarder。

英文版：[README.md](./README.md)

## 快速开始

1. 先向 `admin@smartforwarder.co` 获取 `baseUrl`、`identifier`、`password` 和 `shop`。
2. 调用 `POST /auth/local`，保存返回的 JWT。
3. 使用 `Authorization: Bearer {{token}}` 调用 `GET /v1/health`，确认认证和连通性正常。
4. 先用下面的最小 `POST /v1/shipments` 请求打通链路，再逐步补充更多字段。

> EDI 运单创建最容易踩坑的规则
> - `shipment_number` 必须出现在请求体最外层。
> - `type` 也必须出现在请求体最外层。
> - `ombl` / `hbls` 上的 contact 字段，最佳实践仍然是传稳定的上游 `id`。
> - 如果没有 `id` 但有 `name`，服务端会基于规范化后的名称生成稳定的 fallback source id。
> - 如果 `id` 和 `name` 都没有，该 contact 字段会被保存为 `null`。

## 接口总览

| 模块 | 接口 | 说明 |
|------|------|------|
| 认证 | `POST /auth/local` | 获取后续接口使用的 JWT |
| 健康检查 | `GET /v1/health` | 快速确认 token 和网络都正常 |
| 联系人 | `GET /v1/contacts`、`GET /v1/contacts/:id` | 需要显式传 SmartForwarder 联系人 ID 时使用 |
| 运单 | `POST/GET/PUT/DELETE /v1/shipments`、`POST /v1/shipments/:id/memos` | EDI 运单主流程 |
| 单据 | `GET/POST /v1/shipments/:id/documents`、`PUT/DELETE /v1/documents/:id` | 运单附件管理 |
| 财务 | `POST /v1/araps`、`GET /v1/transactions` | 创建应收应付和查询交易 |

## 第一条可用的运单请求

建议先用这个最小请求体完成联调，确认成功后再逐步加入 `ombl`、`hbls`、单据等可选字段。

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
curl {{baseUrl}}/v1/health \
-H "Content-Type: application/json" \
-H "Authorization: Bearer {{token}}"
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

> 如果你希望在运单请求里显式传 SmartForwarder 的 contact ID，请先调用联系人接口。对于 EDI 运单创建，如果没有 `id` 但联系人 `name` 保持一致，系统仍然可以做稳定映射。

### 获取联系人列表

**URL** : `/v1/contacts`

**方法** : `GET`

**需要认证** : 是

**API 调用**

```
GET {{baseUrl}}/v1/contacts?name_contains=ABC
Authorization: Bearer {{token}}
Content-Type: application/json
```

**curl 示例**

```bash
curl "{{baseUrl}}/v1/contacts?name_contains=ABC" \
-H "Authorization: Bearer {{token}}" \
-H "Content-Type: application/json"
```

**查询参数**

| 参数 | 类型 | 必填 | 描述 |
|-----------|------|------|-------------|
| name_contains | string | **是** | 按名称包含文本过滤，至少传 3 个字符 |
| _start | integer | 否 | 分页起始索引（默认：0） |
| _limit | integer | 否 | 返回记录数量（默认：25） |
| _sort | string | 否 | 排序字段（例如："name:asc", "created_at:desc"） |
| types.value | string | 否 | 按联系人类型过滤（例如："location"） |
| tags | string | 否 | 按标签名称过滤（逗号分隔） |

> **注意：** 调用 `/v1/contacts` 时不传 `name_contains` 会返回 `400 Bad Request`。默认只返回已审批（approved）的联系人。

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
    "zip_code": "10001"
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

## 运单 API

### 运单与单据接口总览

除下面的详细示例外，目前还开放了以下需要认证的接口：

| 方法 | URL | 说明 |
|------|-----|------|
| `POST` | `/v1/shipments` | 创建运单 |
| `GET` | `/v1/shipments` | 查询运单 |
| `GET` | `/v1/shipments/:id` | 按 `ext_id` 获取单票运单 |
| `PUT` | `/v1/shipments/:id` | 更新运单 |
| `DELETE` | `/v1/shipments/:id` | 删除运单 |
| `POST` | `/v1/shipments/:id/memos` | 为运单添加备注 |
| `POST` | `/v1/araps` | 创建应收应付记录 |
| `GET` | `/v1/shipments/:id/documents` | 获取运单单据列表 |
| `POST` | `/v1/shipments/:id/documents` | 新增运单单据 |
| `PUT` | `/v1/documents/:id` | 更新单据 |
| `DELETE` | `/v1/documents/:id` | 删除单据 |
| `GET` | `/v1/transactions` | 获取交易列表 |

### 创建新运单

建议先用下面这个最小可用请求体打通流程，确认成功后再逐步增加主单、分单、联系人、箱信息和单据字段。

**URL** : `/v1/shipments`

**方法** : `POST`

**需要认证** : 是

**API 调用**

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

**curl 示例**

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

**最容易忽略的规则**

| 规则 | 原因 |
|------|------|
| `shipment_number` 必须在最外层 | EDI 运单身份识别和 `original_code` 生成依赖最外层字段 |
| 不要只把 `shipment_number` 放在 `ombl` 或 `hbls` 里 | 嵌套字段不会被当成主运单号来源 |
| `type` 必须在最外层 | 创建流程按根级字段读取类型 |
| contact 最好显式传 `id` | 这样映射最明确，也最稳定 |
| 缺少 contact `id` 时会回退到 `name` | 服务端会基于规范化后的联系人名称生成稳定 source id |
| `id` 和 `name` 都没有时会变成 `null` | 该联系人不会被映射，也不会保留 |

**成功响应**

**代码** : `200 OK`

**内容示例**

```json
{
  "success": true,
  "data": {
    "ext_id": "0f7f9c4e-6e76-4f0c-a5d4-2a7f77ab1234"
  }
}
```

### 查询运单

支持分页和可选过滤条件的运单查询。可按 MBL 号、HBL 号或箱号进行检索。

**URL** : `/v1/shipments`

**方法** : `GET`

**需要认证** : 是

**API 调用**

```
GET {{baseUrl}}/v1/shipments
Authorization: Bearer {{token}}
Content-Type: application/json
```

**curl 示例**

```bash
# 按 MBL 号查询
curl "${baseUrl}/v1/shipments?mbl_no_contains=ZIM&_limit=10" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json"

# 按 HBL 号查询
curl "${baseUrl}/v1/shipments?hbls.hbl_no_contains=SSH&_limit=10" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json"

# 按箱号查询
curl "${baseUrl}/v1/shipments?shipment_containers.name_contains=MATU&_limit=10" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json"
```

**查询参数**

| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| _start | integer | 分页起始索引（默认：0） |
| _limit | integer | 返回记录数量（默认：25） |
| _sort | string | 排序字段（例如："created_at:desc"） |
| mbl_no_contains | string | 按 MBL 号过滤（模糊匹配） |
| hbls.hbl_no_contains | string | 按 HBL 号过滤（模糊匹配） |
| shipment_containers.name_contains | string | 按箱号过滤（模糊匹配） |

**成功响应**

**代码** : `200 OK`

**内容示例**

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

> 更多运单查询说明见 [shipments.md](./shipments.md)。

### 为运单添加备注

**URL** : `/v1/shipments/:id/memos`

**方法** : `POST`

**需要认证** : 是

**API 调用**

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

**curl 示例**

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

**URL 参数**

| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| id | string | 运单 ID (UUID) |

**请求体**

| 字段 | 类型 | 必填 | 描述 |
|-------|------|----------|-------------|
| subject | string | 是 | 备注主题/标题 |
| content | string | 是 | 备注内容/正文 |
| type | string | 是 | 备注类型（例如："general"、"delay"、"update"） |

**成功响应**

**代码** : `200 OK`

**内容示例**

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

**请求结构**

整个请求体可以按三层理解：

- 最外层：`shipment_number`、`type`、`ombl`、`hbls`
- `ombl`：主单字段和主单级联系人
- `hbls[]`：一个或多个分单，每个 HBL 都可以有自己的联系人和 `containers`

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

**上线前建议先核对的字段组**

- `mbl_type`：见下方枚举
- `term`：例如 `CY-CY`
- `obl_type`：见下方枚举
- `mode`：`FCL`、`LCL`、`CONS`、`BULK`、`AIR`
- `weightUnit`：`KG`、`LB`
- `volumeUnit`：`CBM`、`CFT`
- `type`：`ocean_import`、`ocean_export`、`air_import`、`air_export`

**EDI 用户联系人字段说明**

- `ombl` / `hbls` 上的 `shipper`、`consignee`、`notify`、`customer`、`bill_to`、`carrier` 等 contact 类型字段，最佳实践仍然是传你们上游系统里稳定的 `id`。
- 如果没有传 `id`，但传了 `name`，服务端会基于规范化后的联系人名称生成稳定的 fallback source id。
- 如果 `id` 和 `name` 都没有，该字段最终会被保存为 `null`。
- `agent` 属于特例，会使用当前 EDI 用户绑定的联系人。
- 对你们当前接入场景来说，只要联系人全称保持一致，就可以稳定映射；如果上游已经有稳定 `id`，仍然建议显式传入。

**完整运单示例**

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

#### 联系人类型

如果你传的是显式 contact 对象，可以使用以下字段。对于 EDI 用户，如果缺少 `id` 但有 `name`，系统会基于规范化后的名称生成稳定的 fallback source id。

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
| shipment_number | 仅支持最外层，例如 SB202601309678 |
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
