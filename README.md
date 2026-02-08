# Egress Frontend

基于 MasterGo 设计的 Egress 管理前端项目

## 技术栈

- Vue 3
- Element Plus
- Vue Router
- Vite

## 项目结构

```
src/
├── api/              # API 接口
├── assets/           # 静态资源
├── components/       # 公共组件
│   └── Breadcrumb/   # 面包屑组件
├── layout/           # 布局组件
│   ├── components/   # 布局子组件
│   │   ├── Sidebar.vue    # 侧边栏
│   │   ├── Navbar.vue     # 顶部导航栏
│   │   └── AppMain.vue    # 主内容区域
│   └── index.vue     # 布局主组件
├── router/           # 路由配置
├── views/             # 页面组件
│   ├── node/          # 节点信息页面
│   ├── egressnode/    # 出口网关页面
│   ├── egressclass/   # 出口网关映射页面
│   └── egresspolicy/  # 出口网关路由页面
├── App.vue            # 根组件
└── main.js            # 入口文件
```

## 安装依赖

```bash
npm install
```

## 开发运行

```bash
npm run dev
```

## 构建生产版本

```bash
npm run build
```

## 预览生产版本

```bash
npm run preview
```

## 功能说明

### 已实现功能

1. **布局系统**
   - 左侧边栏导航（200px 宽度）
   - 顶部导航栏（64px 高度）
   - 主内容区域

2. **节点信息页面**
   - 节点列表展示
   - 节点卡片显示（节点名称、IP、状态）
   - 异常状态高亮显示

3. **路由配置**
   - 节点信息：`/node`
   - 出口网关：`/egress`
   - 出口网关映射：`/egress-mapping`
   - 出口网关路由：`/egress-route`

### 待完善功能

- API 接口集成
- 其他页面的具体实现
- 状态管理（Vuex/Pinia）
- 权限控制


## API接口
### cluster:
1. GET clusters 获取集群信息
   {
        "name": "",
        "clusterIP": ""
   }
### node:
1. GET cluster/{clusterName}/nodes 获取节点信息
   {
        "name": "",
        "status": 1,//0:异常，1：正常
        "ip": ""，
        "egressNodeDeployed": true, // 该节点是否安装出口网关
   }
### egressNodes:
1. GET /clusters/{clusterName}/egressNodes 查询出口网关
   {
        "name": "",
        "egressIpType": 0, //网关ip类型 0: 节点IP 1: 自定义VIP
        "currentNode": "2.2.2.2", // egressIpType为节点IP 出口网关地址展示该字段
        "egressIP": "1.1.1.1", // egressIpType为自定义VIP 出口网关地址展示该字段
        "status": 1,//0:异常，1：正常
        "type": 0, //0: 实体 1：映射
        "nodeIps": ['1.1.1.1','2.2.2.2'],
        "createTime": "2025-04-03T07:18:40Z",
        "hasBeenUsedByPolicy": true // 网关是否被使用
   }

2. GET /clusters/{clusterName}/egressNodes/{egressNodeName}/externalClusters/{externalClusterName}/egressNodes  查询实体⽹关映射的映射⽹关列表
   [egressNodeName1,egressNodeName2]

3. GET /clusters/{clusterName}/egressNodes/{egressNodeName} 查询出口网关详情
   {
        "name": "",
        "clusterName": "",
        "type": 0, //0: 实体 1：映射
        "status": 1,//0:异常，1：正常
        "createTime": "2025-04-03T07:18:40Z", 
        "hasBeenUsedByPolicy": true // 网关是否被使用
   }

4. GET /clusters/{clusterName}/egressNodes/{egressNodeName}/configurations 查询出口网关配置
当网关类型为实体0时，返回结构体如下：
    {
        "name": "",
        "clusterName": "",
        "type": 0, //0: 实体 1：映射
        "egressIpType": 0, //0:节点IP 1:自定义VIP
        "currentNode": "2.2.2.2", // egressIpType为节点IP 出口网关地址展示该字段
        "egressIp": null, // 当是节点IP类型 不需要设置egressIp
        "nodeList": [
            {
            "name": "xxx",
            "ip": "1.1.1.1",
            "interfaceName": "xxx"
            },
            {
            "name": "xxx",
            "ip": "1.1.1.1",
            "interfaceName": "xxx"
            }
        ]
    }
当⽹关类型为映射1时，返回结构体如下：
    {
        "name": "",
        "clusterName": "",
        "type": 1, //0: 实体 1：映射
        "egressClass": "xxx", //出口网关映射名称
        "gatewayClusterName": "xxx", //网关集群名称
        "syncEgressNodeName": "xxx", // 网关集群被映射出口网关名称
        "syncEgressNodeStatus": 1,//0:异常，1：正常
        "egressIpType": 0, //0:节点IP 1:自定义VIP
        "currentNode": "2.2.2.2", // egressIpType为节点IP 出口网关地址展示该字段
        "egressIp": null, // 节点IP类型 不需要设置egressIp
        "nodeList": [
            {
                "name": "xxx",
                "ip": "1.1.1.1",
                "interfaceName": "xxx"
            },
            {
                "name": "xxx",
                "ip": "1.1.1.1",
                "interfaceName": "xxx"
            }
        ]
    }

5. POST /clusters/{clusterName}/egressNodes 创建出口网关
   入参；
   {
        "name": "egressnode",
        "egressIpType": 0, //0:节点IP 1:自定义VIP
        "egressIP": null, // 节点IP类型为0时 不需要设置egressIp
        "nodeList": [
            {
                "ip": "1.1.1.1",
                "interfaceName": "xxx"
            },
            {
                "ip": "1.1.1.1",
                "interfaceName": "xxx"
            }
        ]
    }
    出参：
    {
        "code": 0,
        "errorMsg": null,
        "errorDetail": null,
        "success": true,
        "data": null,
        "count": null,
        "errorStack": null
    }

6. PUT /clusters/{clusterName}/egressNodes/{egressNodeName}  修改实体网关 
   入参：
   {
        "name": "egressnode",
        "egressIpType": 1, //0:节点IP 1:自定义VIP
        "egressIp": "1.1.1.1", // 节点IP类型 不需要设置egressIp
        "nodeList": [
            {
            "ip": "1.1.1.1",
            "interfaceName": "xxx"
            },
            {
            "ip": "1.1.1.1",
            "interfaceName": "xxx"
            }
        ]
    }
7. DELETE /clusters/{clusterName}/egressNodes/{egressName} 删除出口网关
   若出口网关已被出口网关路由使用，则不可以被删除
   
### egressclass
1. get /clusters/{clusterName}/egressClasses  查询出口网关映射列表
   [
        {
            "name": "xxx",
            "clusterName": "xxx",  // 所在集群名称
            "gatewayClusterName": "xxx",  // 网关集群名称
            "syncEgressNodes":[
                "egressnode1","egressnode2"  // 从网关集群中选择映射的实体网关
            ]
            "createTime": "2025-04-03T07:18:40Z"
        },
        {
            "name": "xxx",
            "clusterName": "xxx",
            "gatewayClusterName": "xxx",
            "syncEgressNodes": ["xxx","xxx"],
            "createTime": "2025-04-03T07:18:40Z"
        }
    ]
2. post /clusters/{clusterName}/egressClasses 创建出口网关映射
入参：
    {
        "name": "xxx",
        "clusterName": "xxx",
        "gatewayClusterName": "xxx",
        "syncEgressNodes": ["xxx","xxx"]
    }
3. get /clusters/{clusterName}/egressClasses/{egressClassName} 查询出口网关映射详情
    {
        "name": "xxx",
        "clusterName": "xxx",  // 出口网关映射所在集群名称
        "createTime": "xxx",
    }
4. get /clusters/{clusterName}/egressClasses/{egressClassName}/configurations 查询出口网关映射配置
   {
    "clusterName": "",  // 出口网关映射所在集群名称
    "gatewayClusterName": "",  // 出口网关映射选择复制的网关集群名称
    "syncEgressNodes": [
        {
            "name": "egressnode",
            "egressIpType": 0, //网关ip类型 0: 节点IP 1: 自定义VIP
            "currentNode": "2.2.2.2", // egressIpType为节点IP 出口网关地址展示该字段
            "egressIP": "1.1.1.1", // egressIpType为自定义VIP 出口网关地址展示该字段
            "status": 1,//0:异常，1：正常
            "syncedName": "egressclass-egressnode",
        }
    ],
    "syncedEgressNodes": [
        {
            "name": "egressclass-egressnode",
            "egressIpType": 0, //网关ip类型 0: 节点IP 1: 自定义VIP
            "currentNode": "2.2.2.2", // egressIpType为节点IP 出口网关地址展示该字段
            "egressIP": "1.1.1.1", // egressIpType为自定义VIP 出口网关地址展示该字段
            "status": 1,//0:异常，1：正常
            "hasBeenUsedByPolicy": false // 是否被出口路由使用
        }
    ]
    }
5. put /clusters/{clusterName}/egressClasses/{egressClassName} 修改出口网关映射
   入参：
   {
        "name": "xxx",
        "clusterName": "xxx",
        "gatewayClusterName": "xxx",
        "syncEgressNodes": ["xxx","xxx"]
    }
6. delete /clusters/{clusterName}/egressClasses/{egressClassName} 删除出口网关映射
   需要判断映射过来的的egressnode是否已经被egresspolicy使⽤

### egressPolicy
1. get /clusters/{clusterName}/egressPolicies?namespace={namespace} 查询出口路由列表
    [
        {
            "name": "xxx",
            "clusterName": "xxx";
            "namespace": "xxx",
            "egressNode": {
                "name": "xxx",
                "type": 0 //0: 实体 1：映射
            },  
            "status": 1, //0 关闭 1 正常 2 异常
            "enable": true, //是否开启
            "createTime": "2025-04-03T07:18:40Z"
        }
    ]

2. get /clusters/{clusterName}/namespaces/{namespace}/egressPolicies/{egressPolicyName} 查询出口路由详情
    {
        "name": "xxx",
        "clusterName": "xxx",
        "namespace": "xxx",
        "enable": true,
        "status": 1, //0 关闭 1 正常 2 异常
        "createTime": "2025-04-03T07:18:40Z",
        "egressNode": {
            "name": "xxx",
            "type": 1
        },
        "destIPBlocks": [
            {
                "cidr": "1.1.1.1",
                "except": ["2.2.2.2"]
            },
            {
                "cidr": "1.1.1.1",
                "except": ["2.2.2.2"]
            }
        ],
        "targets": [  // 本集群访问对象
            {
                "namespaceMatchLabels": {
                    "xxx": "xxx"
                },
                "podMatchLabels": {
                    "xxx": "xxx"
                }
            },
            {
                "namespaceMatchLabels": {
                    "xxx": "xxx"
                },
                "podMatchLabels": {
                    "xxx": "xxx"
                }
            },
        ],
        "externalEgressPolicies": [  // 跨集群访问对象 取数组中的第一个对象值
            {
                "name": "xxx",
                "clusterName": "xxx",
                "namespace": "xxx",
                "enable": true,
                "status": 0,
                "createTime": "2025-04-03T07:18:40Z",
                "egressNode": {
                    "name": "xxx",
                    "type": 1
                },
                "realIPBlocks": [  // 生效访问目标地址
                    {
                        "cidr": "1.1.1.1",
                        "except": ["2.2.2.2"]
                    },
                    {
                        "cidr": "1.1.1.1",
                        "except": ["2.2.2.2"]
                    },
                ],
                "targets": [
                    {
                        "namespaceMatchLabels": {
                            "xxx": "xxx"
                        },
                        "podMatchLabels": {
                            "xxx": "xxx"
                        }
                    },
                ]
            }
        ]
    }
 
 3. put /clusters/{clusterName}/namespaces/{namespace}/egressPolicies/{egressPolicyName}/switch  开启关闭出口路由
   查询参数： enable: true/false 必填
 4. get /clusters/{clusterName}/egressNodes/{egressNodeName}/egressPolicies 查询跨集群出口网关路由
 5. post /clusters/{clusterName}/namespaces/{namespace}/egressPolicies 创建出口路由
   {
    "name": "xxx",
    "clusterName": "xxx",
    "namespace": "xxx",
    "enable": true,
    "egressNode": {
        "name": "xxx"
    },
    "destIPBlocks": [
        {
            "cidr": "1.1.1.1",
            "except": ["2.2.2.2"]
        },
    ],
    "externalEgressPolicies": [  // 如果不设置跨集群对外访问对象externalEgressPolicies设置为[]
        { 
            "name":"xxx",
            "clusterName": "xxx",
            "namespace": "xxx"
        },
    ],
    "targets": [    // 如果不设置本集群对外访问对象 targets设置为null
        {
            "namespaceMatchLabels": {
                "xxx": "xxx"
            },
            "podMatchLabels": {  // 如果选择全部pod podMatchLabels设置为null
                "xxx": "xxx"
            }
        }
    ]
}

6. delete /clusters/{clusterName}/namespaces/{namespace}/egressPolicies/{egressPolicyName} 删除出口路由
7. put /clusters/{clusterName}/namespaces/{namespace}/egressPolicies/{egressPolicyName} 编辑出口路由
   入参：
   {
    "name": "xxx",
    "clusterName": "xxx",
    "namespace": "xxx",
    "enable": true,
    "egressNode": {
        "name": "xxx"
    },
    "destIPBlocks": [
        {
            "cidr": "1.1.1.1",
            "except": ["2.2.2.2"]
        },
    ],
    "externalEgressPolicies": [  // 如果不设置跨集群对外访问对象externalEgressPolicies设置为[]
        { 
            "name":"xxx",
            "clusterName": "xxx",
            "namespace": "xxx"
        },
    ],
    "targets": [    // 如果不设置本集群对外访问对象 targets设置为null
        {
            "namespaceMatchLabels": {
                "xxx": "xxx"
            },
            "podMatchLabels": {  // 如果选择全部pod podMatchLabels设置为null
                "xxx": "xxx"
            }
        }
    ]
}

### Pod 
1. POST cluster/{clusterName}/pods 获取pod对象
   入参
    [
        {
            "namespaceMatchLabels": {
                "xxx": "xxx"
            },
            "podMatchLabels": { 
                "xxx": "xxx"
            }
        }
    ]
  出参
    [
        {
            "name": "xxx",
            "namespace": "xxx",
            "status": 0 // 0或1
        },
        {
            "name": "xxx",
            "namespace": "xxx",
            "status": 0 // 0或1
        }
    ]