document.addEventListener("DOMContentLoaded", () => {
    // 初始化变量
    const canvas = document.getElementById("workflow-canvas")
    const nodeItems = document.querySelectorAll(".node-item")
    const propertyPanel = document.querySelector(".property-panel")
    const propertyForm = document.getElementById("property-form")
    const noSelection = document.getElementById("no-selection")
    const nodeNameInput = document.getElementById("node-name")
    const codeEditor = document.getElementById("code-editor")
    const codeEditorContainer = document.querySelector(".code-editor-container")
    const tabButtons = document.querySelectorAll(".tab-btn")
    const tabContents = document.querySelectorAll(".tab-content")
    const exportBtn = document.getElementById("export-btn")
    const runBtn = document.getElementById("run-btn")
    const zoomInBtn = document.getElementById("zoom-in-btn")
    const zoomOutBtn = document.getElementById("zoom-out-btn")
    const resetZoomBtn = document.getElementById("reset-zoom-btn")
    const minimapContainer = document.getElementById("minimap-container")
    const minimapCanvas = document.getElementById("minimap-canvas")
    const minimapViewport = document.getElementById("minimap-viewport")
    const backgroundTypeSelect = document.getElementById("background-type")
    const backgroundColorPicker = document.getElementById("background-color")
    const gridSizeInput = document.getElementById("grid-size")
    const gridColorPicker = document.getElementById("grid-color")

    // 预览和保存相关元素
    const previewBtn = document.getElementById("preview-btn")
    // const saveBtn = document.getElementById("save-btn")
    const previewModal = document.getElementById("preview-modal")
    const saveModal = document.getElementById("save-modal")
    const closePreviewBtn = document.getElementById("close-preview")
    const closePreviewBtnFooter = document.getElementById("close-preview-btn")
    const closeSaveBtn = document.getElementById("close-save")
    const cancelSaveBtn = document.getElementById("cancel-save")
    const confirmSaveBtn = document.getElementById("confirm-save")
    const previewTabs = document.querySelectorAll(".preview-tab")
    const previewTabContents = document.querySelectorAll(".preview-tab-content")
    const previewCanvas = document.getElementById("preview-canvas")
    const jsonContent = document.getElementById("json-content")
    const nodeCountElement = document.getElementById("node-count")
    const connectionCountElement = document.getElementById("connection-count")
    const nodeListElement = document.getElementById("node-list")
    const workflowNameInput = document.getElementById("workflow-name")
    const workflowDescriptionInput = document.getElementById("workflow-description")
    const workflowVersionInput = document.getElementById("workflow-version")
    const workflowPermissionSelect = document.getElementById("workflow-permission")

    // 节点数据
    const nodes = []
    let selectedNode = null
    let selectedConnection = null
    let nodeCounter = 0
    let scale = 1 // 当前缩放比例

    // 背景设置
    const backgroundSettings = {
        type: "grid",
        color: "#ffffff",
        gridSize: 20,
        gridColor: "#e0e0e0",
    }

    // 初始化jsPlumb
    const jsPlumbInstance = jsPlumb.getInstance({
        Connector: ["Bezier", { curviness: 50 }],
        Endpoint: ["Dot", { radius: 5 }],
        HoverPaintStyle: { stroke: "#1e88e5", strokeWidth: 2 },
        ConnectionOverlays: [
            [
                "Arrow",
                {
                    location: 1,
                    width: 10,
                    length: 10,
                    id: "arrow",
                },
            ],
        ],
        Container: canvas,
    })

    // 设置连接线可选中
    jsPlumbInstance.bind("click", (conn, originalEvent) => {
        originalEvent.stopPropagation()
        selectConnection(conn)
    })

    // 节点类型图标映射
    const nodeTypeIcons = {
        start: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>`,
        input: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path></svg>`,
        transform: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>`,
        code: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>`,
        condition: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        loop: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 014-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 01-4 4H3"></path></svg>`,
        database: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>`,
        api: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>`,
        output: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`,
        timer: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
        notification: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 01-3.46 0"></path></svg>`,
        function: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
    }

    // 节点类型背景色映射
    const nodeTypeColors = {
        start: "#e8f0fe",
        input: "#e6f7ff",
        transform: "#e6ffed",
        code: "#fffbe6",
        condition: "#fff2e8",
        loop: "#f9f0ff",
        database: "#f0f5ff",
        api: "#e6fffb",
        output: "#f0f2f5",
        timer: "#fff0f6",
        notification: "#fcf4dc",
        function: "#f9f0ff",
    }

    // 节点类型文本颜色映射
    const nodeTypeTextColors = {
        start: "#4285f4",
        input: "#1890ff",
        transform: "#52c41a",
        code: "#faad14",
        condition: "#fa541c",
        loop: "#722ed1",
        database: "#2f54eb",
        api: "#13c2c2",
        output: "#595959",
        timer: "#eb2f96",
        notification: "#d48806",
        function: "#722ed1",
    }

    // 获取节点名称
    function getNodeName(type) {
        const nameMap = {
            start: "开始",
            input: "输入",
            transform: "文本处理",
            code: "代码",
            condition: "条件",
            loop: "循环",
            database: "数据库",
            api: "API",
            output: "输出",
            timer: "定时器",
            notification: "通知",
            function: "函数",
        }
        return nameMap[type] || "节点"
    }

    // 修改缩略图相关函数
    function updateMinimap() {
        const minimapCtx = minimapCanvas.getContext("2d")

        // 清除缩略图
        minimapCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height)

        // 设置缩略图背景
        minimapCtx.fillStyle = backgroundSettings.color
        minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height)

        // 如果是网格背景，绘制网格
        if (backgroundSettings.type === "grid") {
            minimapCtx.strokeStyle = "rgba(200, 200, 200, 0.3)"
            minimapCtx.lineWidth = 0.5

            const gridSize = 5 // 缩略图中的网格大小
            for (let x = 0; x <= minimapCanvas.width; x += gridSize) {
                minimapCtx.beginPath()
                minimapCtx.moveTo(x, 0)
                minimapCtx.lineTo(x, minimapCanvas.height)
                minimapCtx.stroke()
            }

            for (let y = 0; y <= minimapCanvas.height; y += gridSize) {
                minimapCtx.beginPath()
                minimapCtx.moveTo(0, y)
                minimapCtx.lineTo(minimapCanvas.width, y)
                minimapCtx.stroke()
            }
        }

        // 找到所有节点的位置以计算缩略图的适当比例
        let minX = Number.POSITIVE_INFINITY,
            minY = Number.POSITIVE_INFINITY,
            maxX = 0,
            maxY = 0

        nodes.forEach((node) => {
            minX = Math.min(minX, node.position.x)
            minY = Math.min(minY, node.position.y)

            const nodeElement = document.getElementById(node.id)
            if (nodeElement) {
                maxX = Math.max(maxX, node.position.x + nodeElement.offsetWidth)
                maxY = Math.max(maxY, node.position.y + nodeElement.offsetHeight)
            } else {
                maxX = Math.max(maxX, node.position.x + 120) // 默认节点宽度
                maxY = Math.max(maxY, node.position.y + 40) // 默认节点高度
            }
        })

        // 添加边距
        minX = Math.max(0, minX - 50)
        minY = Math.max(0, minY - 50)
        maxX += 50
        maxY += 50

        // 如果没有节点，使用默认视图区域
        if (nodes.length === 0 || minX === Number.POSITIVE_INFINITY) {
            minX = 0
            minY = 0
            maxX = 1000
            maxY = 1000
        }

        const contentWidth = maxX - minX
        const contentHeight = maxY - minY

        // 计算缩放比例以适应所有节点
        const scaleX = minimapCanvas.width / contentWidth
        const scaleY = minimapCanvas.height / contentHeight
        const minimapScale = Math.min(scaleX, scaleY, 1) // 不超过1:1比例

        // 计算绘制偏移，使内容居中
        const offsetX = (minimapCanvas.width - contentWidth * minimapScale) / 2
        const offsetY = (minimapCanvas.height - contentHeight * minimapScale) / 2

        // 绘制节点
        nodes.forEach((node) => {
            const nodeElement = document.getElementById(node.id)
            if (nodeElement) {
                const x = (node.position.x - minX) * minimapScale + offsetX
                const y = (node.position.y - minY) * minimapScale + offsetY
                const width = nodeElement.offsetWidth * minimapScale
                const height = nodeElement.offsetHeight * minimapScale

                // 根据节点类型设置颜色
                minimapCtx.fillStyle = nodeTypeColors[node.type] || "#e6f7ff"
                minimapCtx.fillRect(x, y, width, height)
                minimapCtx.strokeStyle = "#666"
                minimapCtx.strokeRect(x, y, width, height)
            }
        })

        // 绘制连接线
        minimapCtx.strokeStyle = "#5c6bc0"
        minimapCtx.lineWidth = 1

        jsPlumbInstance.getConnections().forEach((conn) => {
            const sourceNode = nodes.find((node) => node.id === conn.source.id)
            const targetNode = nodes.find((node) => node.id === conn.target.id)

            if (sourceNode && targetNode) {
                const sourceElement = document.getElementById(sourceNode.id)
                const targetElement = document.getElementById(targetNode.id)

                if (sourceElement && targetElement) {
                    const sourceX = (sourceNode.position.x + sourceElement.offsetWidth / 2 - minX) * minimapScale + offsetX
                    const sourceY = (sourceNode.position.y + sourceElement.offsetHeight / 2 - minY) * minimapScale + offsetY
                    const targetX = (targetNode.position.x + targetElement.offsetWidth / 2 - minX) * minimapScale + offsetX
                    const targetY = (targetNode.position.y + targetElement.offsetHeight / 2 - minY) * minimapScale + offsetY

                    minimapCtx.beginPath()
                    minimapCtx.moveTo(sourceX, sourceY)
                    minimapCtx.lineTo(targetX, targetY)
                    minimapCtx.stroke()
                }
            }
        })
    }

    // 添加节点样式数据
    const nodeStyles = {
        default: {
            name: "默认",
            className: "node-style-default",
        },
        modern: {
            name: "现代",
            className: "node-style-modern",
        },
        flat: {
            name: "扁平",
            className: "node-style-flat",
        },
        rounded: {
            name: "圆角",
            className: "node-style-rounded",
        },
    }

    // 创建节点函数增加样式支持
    function createNode(type, x, y) {
        const nodeId = `node-${++nodeCounter}`
        const nodeName = getNodeName(type)

        // 创建节点数据
        const nodeData = {
            id: nodeId,
            type: type,
            position: { x, y },
            data: {
                name: nodeName,
                code: type === "code" ? 'console.log("Hello World");' : "",
                description: "",
                timeout: 5000,
                retryCount: 0,
                retryDelay: 1000,
                enabled: true,
                priority: "medium",
                tags: [],
                style: "default", // 默认样式
            },
        }

        // 添加到节点数组
        nodes.push(nodeData)

        // 创建DOM元素
        const nodeElement = document.createElement("div")
        nodeElement.id = nodeId
        nodeElement.className = `workflow-node ${nodeStyles.default.className}`
        nodeElement.style.left = `${x}px`
        nodeElement.style.top = `${y}px`

        // 设置节点内容
        nodeElement.innerHTML = `
    <div class="workflow-node-header">
        <div class="workflow-node-icon" style="background-color: ${nodeTypeColors[type]}; color: ${nodeTypeTextColors[type]}">
            ${nodeTypeIcons[type] || ""}
        </div>
        <div class="workflow-node-title">${nodeName}</div>
    </div>
  `

        // 添加到画布
        canvas.appendChild(nodeElement)

        // 使节点可拖动
        jsPlumbInstance.draggable(nodeElement, {
            grid: [10, 10],
            stop: (event) => {
                // 更新节点位置
                const nodeIndex = nodes.findIndex((n) => n.id === nodeId)
                if (nodeIndex !== -1) {
                    nodes[nodeIndex].position.x = Number.parseInt(nodeElement.style.left)
                    nodes[nodeIndex].position.y = Number.parseInt(nodeElement.style.top)
                }
                // 更新缩略图
                updateMinimap()
            },
        })

        // 添加端点
        // 源端点（输出）
        jsPlumbInstance.addEndpoint(nodeElement, {
            anchor: "Right",
            isSource: true,
            maxConnections: -1,
            connectorStyle: { stroke: "#5c6bc0", strokeWidth: 2 },
        })

        // 目标端点（输入）
        jsPlumbInstance.addEndpoint(nodeElement, {
            anchor: "Left",
            isTarget: true,
            maxConnections: -1,
            connectorStyle: { stroke: "#5c6bc0", strokeWidth: 2 },
        })

        // 添加点击事件
        nodeElement.addEventListener("click", (e) => {
            e.stopPropagation()
            selectNode(nodeData)
        })

        // 更新缩略图
        updateMinimap()

        return nodeData
    }

    // 更新节点样式函数
    function updateNodeStyle(nodeId, styleName) {
        const nodeElement = document.getElementById(nodeId)
        if (nodeElement) {
            // 移除所有样式类
            Object.values(nodeStyles).forEach((style) => {
                nodeElement.classList.remove(style.className)
            })

            // 添加新样式类
            if (nodeStyles[styleName]) {
                nodeElement.classList.add(nodeStyles[styleName].className)
            }
        }
    }

    // 选择节点
    function selectNode(node) {
        // 清除之前的连接线选择
        if (selectedConnection) {
            selectedConnection.setPaintStyle({ stroke: "#5c6bc0", strokeWidth: 2 })
            selectedConnection = null
        }

        // 清除之前的节点选择
        if (selectedNode) {
            const prevElement = document.getElementById(selectedNode.id)
            if (prevElement) {
                prevElement.classList.remove("selected")
            }
        }

        // 设置新的选择
        selectedNode = node

        if (node) {
            // 高亮选中的节点
            const nodeElement = document.getElementById(node.id)
            if (nodeElement) {
                nodeElement.classList.add("selected")
            }

            // 更新属性面板
            updatePropertyPanel(node)
            
            // 触发AI节点推荐更新
            if (typeof window.updateNodeSuggestions === 'function') {
                window.updateNodeSuggestions(node)
            }
        } else {
            // 隐藏属性面板
            propertyForm.style.display = "none"
            noSelection.style.display = "flex"
        }
    }

    // 选择连接线
    function selectConnection(connection) {
        // 清除之前的节点选择
        if (selectedNode) {
            const prevElement = document.getElementById(selectedNode.id)
            if (prevElement) {
                prevElement.classList.remove("selected")
            }
        }
        selectedNode = null

        // 清除之前的连接线选择
        if (selectedConnection) {
            selectedConnection.setPaintStyle({ stroke: "#5c6bc0", strokeWidth: 2 })
        }

        // 设置新的选择
        selectedConnection = connection

        if (connection) {
            // 高亮选中的连接线
            connection.setPaintStyle({ stroke: "#1890ff", strokeWidth: 3 })

            // 更新属性面板
            updateConnectionPropertyPanel(connection)
        } else {
            // 隐藏属性面板
            propertyForm.style.display = "none"
            noSelection.style.display = "flex"
        }
    }

    // 更新属性面板
    function updatePropertyPanel(node) {
        // 显示属性表单，隐藏无选择提示
        propertyForm.style.display = "block"
        noSelection.style.display = "none"

        // 更新节点信息
        document.querySelector(".node-info-title").textContent = getNodeName(node.type)
        document.querySelector(".node-info-id").textContent = `ID: ${node.id}`
        document.querySelector(".node-info-icon").textContent = node.type.charAt(0).toUpperCase()
        document.querySelector(".node-info-icon").style.backgroundColor = nodeTypeColors[node.type]
        document.querySelector(".node-info-icon").style.color = nodeTypeTextColors[node.type]

        // 显示节点属性表单，隐藏连接线属性表单
        document.getElementById("node-properties").style.display = "block"
        document.getElementById("connection-properties").style.display = "none"

        // 更新表单字段
        nodeNameInput.value = node.data.name

        // 显示/隐藏代码编辑器
        if (node.type === "code" || node.type === "function") {
            codeEditorContainer.style.display = "block"
            codeEditor.value = node.data.code || 'console.log("Hello World");'
        } else {
            codeEditorContainer.style.display = "none"
        }

        // 更新样式选择器
        const styleSelect = document.getElementById("node-style")
        if (styleSelect) {
            styleSelect.value = node.data.style || "default"
        } else {
            // 如果样式选择器不存在，创建一个
            const styleFormGroup = document.createElement("div")
            styleFormGroup.className = "form-group"
            styleFormGroup.innerHTML = `
      <label>节点样式</label>
      <select id="node-style" class="form-control">
        ${Object.entries(nodeStyles)
                .map(
                    ([value, style]) => `
          <option value="${value}" ${node.data.style === value ? "selected" : ""}>${style.name}</option>
        `,
                )
                .join("")}
      </select>
      <div id="style-grid" class="style-grid">
        ${Object.entries(nodeStyles)
                .map(
                    ([value, style]) => `
          <div class="style-option ${node.data.style === value ? "selected" : ""}" 
               data-style="${value}" 
               style="background-color: white; border-radius: ${style.className.includes("rounded") ? "8px" : style.className.includes("modern") ? "4px" : "0"};
                      box-shadow: ${style.className.includes("modern") ? "0 4px 8px rgba(0,0,0,0.1)" : style.className.includes("flat") ? "none" : "0 1px 3px rgba(0,0,0,0.1)"};
                      border: ${style.className.includes("flat") ? "1px solid #e0e0e0" : style.className.includes("modern") ? "none" : "1px solid #e0e0e0"};">
          </div>
        `,
                )
                .join("")}
      </div>
    `

            // 在描述表单组之前插入样式选择器
            const descriptionFormGroup = document.querySelector("#node-properties .form-group:nth-child(2)")
            if (descriptionFormGroup) {
                descriptionFormGroup.parentNode.insertBefore(styleFormGroup, descriptionFormGroup)
            } else {
                document.getElementById("node-properties").appendChild(styleFormGroup)
            }

            // 添加事件监听
            document.querySelectorAll("#style-grid .style-option").forEach((option) => {
                option.addEventListener("click", function () {
                    const styleName = this.getAttribute("data-style")
                    document.getElementById("node-style").value = styleName

                    // 更新选中状态
                    document.querySelectorAll("#style-grid .style-option").forEach((opt) => opt.classList.remove("selected"))
                    this.classList.add("selected")

                    // 更新节点数据和样式
                    updateNodeData(node.id, { style: styleName })
                    updateNodeStyle(node.id, styleName)
                })
            })

            document.getElementById("node-style").addEventListener("change", function () {
                // 更新选中状态
                const styleName = this.value
                document.querySelectorAll("#style-grid .style-option").forEach((opt) => {
                    if (opt.getAttribute("data-style") === styleName) {
                        opt.classList.add("selected")
                    } else {
                        opt.classList.remove("selected")
                    }
                })

                // 更新节点数据和样式
                updateNodeData(node.id, { style: styleName })
                updateNodeStyle(node.id, styleName)
            })
        }

        // 更新高级选项
        document.getElementById("node-description").value = node.data.description || ""
        document.getElementById("node-timeout").value = node.data.timeout || 5000
        document.getElementById("node-retry-count").value = node.data.retryCount || 0
        document.getElementById("node-retry-delay").value = node.data.retryDelay || 1000
        document.getElementById("node-enabled").checked = node.data.enabled !== false

        // 更新优先级选择
        const prioritySelect = document.getElementById("node-priority")
        if (prioritySelect) {
            prioritySelect.value = node.data.priority || "medium"
        }

        // 更新标签
        const tagsInput = document.getElementById("node-tags")
        if (tagsInput) {
            tagsInput.value = (node.data.tags || []).join(", ")
        }
    }

    // 更新连接线属性面板
    function updateConnectionPropertyPanel(connection) {
        // 显示属性表单，隐藏无选择提示
        propertyForm.style.display = "block"
        noSelection.style.display = "none"

        // 更新连接线信息
        document.querySelector(".node-info-title").textContent = "连接线"
        document.querySelector(".node-info-id").textContent = `从 ${connection.source.id} 到 ${connection.target.id}`
        document.querySelector(".node-info-icon").textContent = "C"
        document.querySelector(".node-info-icon").style.backgroundColor = "#e6f7ff"
        document.querySelector(".node-info-icon").style.color = "#1890ff"

        // 显示连接线属性表单，隐藏节点属性表单
        document.getElementById("connection-properties").style.display = "block"
        document.getElementById("node-properties").style.display = "none"

        // 更新表单字段
        document.getElementById("connection-label").value = connection.getLabel() || ""
        document.getElementById("connection-color").value = connection.getPaintStyle().stroke || "#5c6bc0"
        document.getElementById("connection-width").value = connection.getPaintStyle().strokeWidth || 2
        document.getElementById("connection-style").value = connection.getConnector()[0] || "Bezier"
    }

    // 更新节点数据
    function updateNodeData(id, data) {
        const nodeIndex = nodes.findIndex((n) => n.id === id)
        if (nodeIndex !== -1) {
            nodes[nodeIndex].data = { ...nodes[nodeIndex].data, ...data }

            // 如果更新了名称，同时更新DOM
            if (data.name) {
                const nodeElement = document.getElementById(id)
                if (nodeElement) {
                    nodeElement.querySelector(".workflow-node-title").textContent = data.name
                }
            }

            // 如果更新了样式，应用样式
            if (data.style) {
                updateNodeStyle(id, data.style)
            }
        }
    }

    // 更新连接线数据
    function updateConnectionData(connection, data) {
        if (connection) {
            if (data.label !== undefined) {
                connection.setLabel(data.label)
            }
            if (data.color !== undefined) {
                const style = connection.getPaintStyle()
                style.stroke = data.color
                connection.setPaintStyle(style)
            }
            if (data.width !== undefined) {
                const style = connection.getPaintStyle()
                style.strokeWidth = data.width
                connection.setPaintStyle(style)
            }
            if (data.style !== undefined) {
                connection.setConnector([data.style, { curviness: 50 }])
            }
        }
        // 更新缩略图
        updateMinimap()
    }

    // 导出工作流
    function exportWorkflow() {
        const connections = jsPlumbInstance.getConnections().map((conn) => ({
            source: conn.source.id,
            target: conn.target.id,
            label: conn.getLabel() || "",
            style: {
                stroke: conn.getPaintStyle().stroke,
                strokeWidth: conn.getPaintStyle().strokeWidth,
                connector: conn.getConnector()[0],
            },
        }))

        const workflow = {
            nodes,
            connections,
            backgroundSettings,
        }

        const dataStr = JSON.stringify(workflow, null, 2)
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

        const exportFileDefaultName = "workflow.json"
        const linkElement = document.createElement("a")
        linkElement.setAttribute("href", dataUri)
        linkElement.setAttribute("download", exportFileDefaultName)
        linkElement.click()
    }

    // 运行工作流
    function runWorkflow() {
        alert("工作流运行功能将在实际应用中实现")
    }

    // 设置画布缩放
    function setZoom(newScale) {
        // 限制缩放范围
        newScale = Math.max(0.1, Math.min(2, newScale))

        // 更新缩放比例
        scale = newScale

        // 应用缩放
        canvas.style.transform = `scale(${scale})`
        canvas.style.transformOrigin = "0 0"

        // 更新jsPlumb
        jsPlumbInstance.setZoom(scale)

        // 更新缩放显示
        document.getElementById("zoom-level").textContent = `${Math.round(scale * 100)}%`

        // 更新缩略图
        updateMinimap()
    }

    // 放大
    function zoomIn() {
        setZoom(scale + 0.1)
    }

    // 缩小
    function zoomOut() {
        setZoom(scale - 0.1)
    }

    // 重置缩放
    function resetZoom() {
        setZoom(1)
    }

    // 更新缩略图
    // function updateMinimap() {
    //   const minimapCtx = minimapCanvas.getContext("2d")
    //   const canvasRect = canvas.getBoundingClientRect()
    //   const containerRect = canvas.parentElement.getBoundingClientRect()

    //   // 清除缩略图
    //   minimapCtx.clearRect(0, 0, minimapCanvas.width, minimapCanvas.height)

    //   // 设置缩略图背景
    //   minimapCtx.fillStyle = backgroundSettings.color
    //   minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height)

    //   // 如果是网格背景，绘制网格
    //   if (backgroundSettings.type === "grid") {
    //     minimapCtx.strokeStyle = "rgba(200, 200, 200, 0.3)"
    //     minimapCtx.lineWidth = 0.5

    //     const gridSize = 5 // 缩略图中的网格大小
    //     for (let x = 0; x <= minimapCanvas.width; x += gridSize) {
    //       minimapCtx.beginPath()
    //       minimapCtx.moveTo(x, 0)
    //       minimapCtx.lineTo(x, minimapCanvas.height)
    //       minimapCtx.stroke()
    //     }

    //     for (let y = 0; y <= minimapCanvas.height; y += gridSize) {
    //       minimapCtx.beginPath()
    //       minimapCtx.moveTo(0, y)
    //       minimapCtx.lineTo(minimapCanvas.width, y)
    //       minimapCtx.stroke()
    //     }
    //   }

    //   // 绘制节点
    //   const minimapScale = minimapCanvas.width / canvas.scrollWidth

    //   nodes.forEach((node) => {
    //     const nodeElement = document.getElementById(node.id)
    //     if (nodeElement) {
    //       const x = node.position.x * minimapScale
    //       const y = node.position.y * minimapScale
    //       const width = nodeElement.offsetWidth * minimapScale
    //       const height = nodeElement.offsetHeight * minimapScale

    //       minimapCtx.fillStyle = nodeTypeColors[node.type] || "#e6f7ff"
    //       minimapCtx.fillRect(x, y, width, height)
    //       minimapCtx.strokeStyle = "#666"
    //       minimapCtx.strokeRect(x, y, width, height)
    //     }
    //   })

    //   // 绘制连接线
    //   minimapCtx.strokeStyle = "#5c6bc0"
    //   minimapCtx.lineWidth = 1

    //   jsPlumbInstance.getConnections().forEach((conn) => {
    //     const sourceElement = document.getElementById(conn.source.id)
    //     const targetElement = document.getElementById(conn.target.id)

    //     if (sourceElement && targetElement) {
    //       const sourceX = (Number.parseInt(sourceElement.style.left) + sourceElement.offsetWidth) * minimapScale
    //       const sourceY = (Number.parseInt(sourceElement.style.top) + sourceElement.offsetHeight / 2) * minimapScale
    //       const targetX = Number.parseInt(targetElement.style.left) * minimapScale
    //       const targetY = (Number.parseInt(targetElement.style.top) + targetElement.offsetHeight / 2) * minimapScale

    //       minimapCtx.beginPath()
    //       minimapCtx.moveTo(sourceX, sourceY)
    //       minimapCtx.lineTo(targetX, targetY)
    //       minimapCtx.stroke()
    //     }
    //   })

    //   // 更新视口矩形
    //   const viewportWidth = containerRect.width * minimapScale
    //   const viewportHeight = containerRect.height * minimapScale
    //   const viewportX = (canvas.parentElement.scrollLeft / scale) * minimapScale
    //   const viewportY = (canvas.parentElement.scrollTop / scale) * minimapScale

    //   minimapViewport.style.width = `${viewportWidth}px`
    //   minimapViewport.style.height = `${viewportHeight}px`
    //   minimapViewport.style.left = `${viewportX}px`
    //   minimapViewport.style.top = `${viewportY}px`
    // }

    // 应用背景设置
    function applyBackgroundSettings() {
        // 应用背景类型
        if (backgroundSettings.type === "grid") {
            canvas.querySelector(".canvas-grid").style.display = "block"
            canvas.style.backgroundColor = backgroundSettings.color

            // 设置网格样式
            canvas.querySelector(".canvas-grid").style.backgroundSize =
                `${backgroundSettings.gridSize}px ${backgroundSettings.gridSize}px`
            canvas.querySelector(".canvas-grid").style.backgroundImage = `
                linear-gradient(to right, ${backgroundSettings.gridColor} 1px, transparent 1px),
                linear-gradient(to bottom, ${backgroundSettings.gridColor} 1px, transparent 1px)
            `
        } else {
            canvas.querySelector(".canvas-grid").style.display = "none"
            canvas.style.backgroundColor = backgroundSettings.color
        }

        // 更新UI控件
        backgroundTypeSelect.value = backgroundSettings.type
        backgroundColorPicker.value = backgroundSettings.color
        gridSizeInput.value = backgroundSettings.gridSize
        gridColorPicker.value = backgroundSettings.gridColor

        // 更新网格设置区域的显示/隐藏
        document.getElementById("grid-settings").style.display = backgroundSettings.type === "grid" ? "block" : "none"

        // 更新缩略图
        updateMinimap()
    }

    // 事件监听：从左侧面板拖拽节点到画布
    nodeItems.forEach((item) => {
        item.addEventListener("mousedown", function (e) {
            // 阻止默认行为（防止文本选择）
            e.preventDefault()
            
            const nodeType = this.getAttribute("data-type")

            // 创建拖拽预览元素
            const dragPreview = document.createElement("div")
            dragPreview.className = "workflow-node drag-preview"
            dragPreview.innerHTML = `
                <div class="workflow-node-header">
                    <div class="workflow-node-icon" style="background-color: ${nodeTypeColors[nodeType]}; color: ${nodeTypeTextColors[nodeType]}">
                        ${nodeTypeIcons[nodeType] || ""}
                    </div>
                    <div class="workflow-node-title">${getNodeName(nodeType)}</div>
                </div>
            `
            dragPreview.style.position = "absolute"
            dragPreview.style.opacity = "0.7"
            dragPreview.style.pointerEvents = "none"
            document.body.appendChild(dragPreview)

            // 记录鼠标在预览元素内的位置
            const offsetX = e.clientX - this.getBoundingClientRect().left
            const offsetY = e.clientY - this.getBoundingClientRect().top

            // 鼠标移动事件
            function onMouseMove(e) {
                // 阻止默认行为（防止文本选择）
                e.preventDefault()
                dragPreview.style.left = `${e.clientX - offsetX}px`
                dragPreview.style.top = `${e.clientY - offsetY}px`
            }

            // 鼠标松开事件
            function onMouseUp(e) {
                // 移除事件监听
                document.removeEventListener("mousemove", onMouseMove)
                document.removeEventListener("mouseup", onMouseUp)
                // 恢复文本选择
                document.body.style.userSelect = ""

                // 移除预览元素
                document.body.removeChild(dragPreview)

                // 获取画布相对于视口的位置
                const canvasRect = canvas.getBoundingClientRect()

                // 检查鼠标是否在画布上
                if (
                    e.clientX >= canvasRect.left &&
                    e.clientX <= canvasRect.right &&
                    e.clientY >= canvasRect.top &&
                    e.clientY <= canvasRect.bottom
                ) {
                    // 计算在画布中的位置，考虑缩放因素
                    const canvasX = (e.clientX - canvasRect.left) / scale + canvas.scrollLeft
                    const canvasY = (e.clientY - canvasRect.top) / scale + canvas.scrollTop

                    // 创建新节点
                    const newNode = createNode(nodeType, canvasX, canvasY)

                    // 选中新节点
                    selectNode(newNode)
                }
            }

            // 禁用文本选择
            document.body.style.userSelect = "none"
            
            // 添加事件监听
            document.addEventListener("mousemove", onMouseMove)
            document.addEventListener("mouseup", onMouseUp)
        })
    })

    // 事件监听：属性面板表单变化
    nodeNameInput.addEventListener("input", function () {
        if (selectedNode) {
            updateNodeData(selectedNode.id, { name: this.value })
        }
    })

    codeEditor.addEventListener("input", function () {
        if (selectedNode && (selectedNode.type === "code" || selectedNode.type === "function")) {
            updateNodeData(selectedNode.id, { code: this.value })
        }
    })

    // 监听高级选项变化
    document.getElementById("node-description").addEventListener("input", function () {
        if (selectedNode) {
            updateNodeData(selectedNode.id, { description: this.value })
        }
    })

    document.getElementById("node-timeout").addEventListener("input", function () {
        if (selectedNode) {
            updateNodeData(selectedNode.id, { timeout: Number.parseInt(this.value) || 5000 })
        }
    })

    document.getElementById("node-retry-count").addEventListener("input", function () {
        if (selectedNode) {
            updateNodeData(selectedNode.id, { retryCount: Number.parseInt(this.value) || 0 })
        }
    })

    document.getElementById("node-retry-delay").addEventListener("input", function () {
        if (selectedNode) {
            updateNodeData(selectedNode.id, { retryDelay: Number.parseInt(this.value) || 1000 })
        }
    })

    document.getElementById("node-enabled").addEventListener("change", function () {
        if (selectedNode) {
            updateNodeData(selectedNode.id, { enabled: this.checked })
        }
    })

    document.getElementById("node-priority").addEventListener("change", function () {
        if (selectedNode) {
            updateNodeData(selectedNode.id, { priority: this.value })
        }
    })

    document.getElementById("node-tags").addEventListener("input", function () {
        if (selectedNode) {
            const tags = this.value
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag)
            updateNodeData(selectedNode.id, { tags })
        }
    })

    // 连接线属性事件监听
    document.getElementById("connection-label").addEventListener("input", function () {
        if (selectedConnection) {
            updateConnectionData(selectedConnection, { label: this.value })
        }
    })

    document.getElementById("connection-color").addEventListener("input", function () {
        if (selectedConnection) {
            updateConnectionData(selectedConnection, { color: this.value })
        }
    })

    document.getElementById("connection-width").addEventListener("input", function () {
        if (selectedConnection) {
            updateConnectionData(selectedConnection, { width: Number.parseInt(this.value) || 2 })
        }
    })

    document.getElementById("connection-style").addEventListener("change", function () {
        if (selectedConnection) {
            updateConnectionData(selectedConnection, { style: this.value })
        }
    })

    // 背景设置事件监听
    backgroundTypeSelect.addEventListener("change", function () {
        backgroundSettings.type = this.value
        applyBackgroundSettings()
    })

    backgroundColorPicker.addEventListener("input", function () {
        backgroundSettings.color = this.value
        applyBackgroundSettings()
    })

    gridSizeInput.addEventListener("input", function () {
        backgroundSettings.gridSize = Number.parseInt(this.value) || 20
        applyBackgroundSettings()
    })

    gridColorPicker.addEventListener("input", function () {
        backgroundSettings.gridColor = this.value
        applyBackgroundSettings()
    })

    // 事件监听：切换标签页
    tabButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const tabId = this.getAttribute("data-tab")

            // 更新按钮状态
            tabButtons.forEach((btn) => btn.classList.remove("active"))
            this.classList.add("active")

            // 更新内容显示
            tabContents.forEach((content) => {
                content.style.display = content.id === `${tabId}-tab` ? "block" : "none"
            })
        })
    })

    // 事件监听：导出按钮
    exportBtn.addEventListener("click", exportWorkflow)

    // 事件监听：运行按钮
    runBtn.addEventListener("click", runWorkflow)

    // 事件监听：缩放按钮
    zoomInBtn.addEventListener("click", zoomIn)
    zoomOutBtn.addEventListener("click", zoomOut)
    resetZoomBtn.addEventListener("click", resetZoom)

    // 事件监听：画布点击，取消选择
    canvas.addEventListener("click", (e) => {
        if (e.target === canvas || e.target === canvas.querySelector(".canvas-grid")) {
            selectNode(null)
        }
    })

    // 事件监听：鼠标滚轮缩放
    canvas.addEventListener("wheel", (e) => {
        if (e.ctrlKey) {
            e.preventDefault()
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            setZoom(scale + delta)
        }
    })

    // 缩略图点击事件
    minimapCanvas.addEventListener("click", (e) => {
        const minimapRect = minimapCanvas.getBoundingClientRect()
        const minimapScale = minimapCanvas.width / canvas.scrollWidth

        const x = ((e.clientX - minimapRect.left) / minimapScale) * scale
        const y = ((e.clientY - minimapRect.top) / minimapScale) * scale

        // 将画布滚动到点击位置
        canvas.parentElement.scrollLeft = x - canvas.parentElement.clientWidth / 2
        canvas.parentElement.scrollTop = y - canvas.parentElement.clientHeight / 2

        // 更新缩略图
        updateMinimap()
    })

    // 缩略图拖拽事件
    minimapViewport.addEventListener("mousedown", (e) => {
        e.stopPropagation()

        const startX = e.clientX
        const startY = e.clientY
        const startScrollLeft = canvas.parentElement.scrollLeft
        const startScrollTop = canvas.parentElement.scrollTop
        const minimapScale = minimapCanvas.width / canvas.scrollWidth

        function onMouseMove(e) {
            const dx = ((e.clientX - startX) / minimapScale) * scale
            const dy = ((e.clientY - startY) / minimapScale) * scale

            canvas.parentElement.scrollLeft = startScrollLeft + dx
            canvas.parentElement.scrollTop = startScrollTop + dy

            updateMinimap()
        }

        function onMouseUp() {
            document.removeEventListener("mousemove", onMouseMove)
            document.removeEventListener("mouseup", onMouseUp)
        }

        document.addEventListener("mousemove", onMouseMove)
        document.addEventListener("mouseup", onMouseUp)
    })

    // 画布滚动事件
    canvas.parentElement.addEventListener("scroll", () => {
        updateMinimap()
    })

    // 监听窗口大小变化，更新缩略图
    window.addEventListener("resize", () => {
        updateMinimap()
    })

    // 在jsPlumb创建连接后更新缩略图
    jsPlumbInstance.bind("connection", () => {
        updateMinimap()
    })

    // 初始化jsPlumb
    jsPlumbInstance.setContainer(canvas)

    // 初始化缩略图
    updateMinimap()

    // 应用初始背景设置
    applyBackgroundSettings()

    // ==============================================
    // AI智能助手功能模块
    // ==============================================
    const aiAssistantBtn = document.getElementById("ai-assistant-btn")
    const aiAssistantPanel = document.getElementById("ai-assistant-panel")
    const closeAiPanel = document.getElementById("close-ai-panel")
    const aiTabs = document.querySelectorAll(".ai-tab")
    const aiTabContents = document.querySelectorAll(".ai-tab-content")
    const aiWorkflowPrompt = document.getElementById("ai-workflow-prompt")
    const aiGenerateBtn = document.getElementById("ai-generate-btn")
    const aiOptimizeBtn = document.getElementById("ai-optimize-btn")
    const aiChatInput = document.getElementById("ai-chat-input")
    const aiChatSend = document.getElementById("ai-chat-send")
    const aiChatMessages = document.getElementById("ai-chat-messages")

    // 打开/关闭AI助手面板
    aiAssistantBtn.addEventListener("click", () => {
        aiAssistantPanel.style.display = "flex"
    })

    closeAiPanel.addEventListener("click", () => {
        aiAssistantPanel.style.display = "none"
    })

    // AI标签页切换
    aiTabs.forEach((tab) => {
        tab.addEventListener("click", function () {
            const tabId = this.getAttribute("data-ai-tab")

            aiTabs.forEach((t) => t.classList.remove("active"))
            this.classList.add("active")

            aiTabContents.forEach((content) => {
                content.classList.remove("active")
                if (content.id === `ai-${tabId}-tab`) {
                    content.classList.add("active")
                }
            })
        })
    })

    // 快速示例按钮
    document.querySelectorAll(".ai-example-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            const prompt = this.getAttribute("data-prompt")
            aiWorkflowPrompt.value = prompt
        })
    })

    // AI工作流生成器
    aiGenerateBtn.addEventListener("click", async () => {
        const prompt = aiWorkflowPrompt.value.trim()
        if (!prompt) {
            alert("请输入工作流描述")
            return
        }

        // 显示加载状态
        aiGenerateBtn.disabled = true
        aiGenerateBtn.innerHTML = `
            <div class="ai-loading">
                <div class="ai-loading-dot"></div>
                <div class="ai-loading-dot"></div>
                <div class="ai-loading-dot"></div>
            </div>
            生成中...
        `

        try {
            // 调用AI生成函数
            const workflow = await generateWorkflowFromPrompt(prompt)
            
            // 清空当前画布
            clearCanvas()
            
            // 渲染生成的工作流
            renderGeneratedWorkflow(workflow)
            
            // 关闭AI面板
            aiAssistantPanel.style.display = "none"
        } catch (error) {
            console.error("AI生成错误:", error)
            alert("生成失败，请重试")
        } finally {
            // 恢复按钮状态
            aiGenerateBtn.disabled = false
            aiGenerateBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="8 12 12 16 16 12"></polyline>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                </svg>
                生成工作流
            `
        }
    })

    // AI智能优化
    aiOptimizeBtn.addEventListener("click", async () => {
        if (!window.workflowAPI) {
            alert("系统未初始化，请刷新页面")
            return
        }
        
        const nodes = window.workflowAPI.getNodes()
        if (nodes.length === 0) {
            alert("请先创建一些节点")
            return
        }

        aiOptimizeBtn.disabled = true
        aiOptimizeBtn.innerHTML = `
            <div class="ai-loading">
                <div class="ai-loading-dot"></div>
                <div class="ai-loading-dot"></div>
                <div class="ai-loading-dot"></div>
            </div>
            分析中...
        `

        try {
            const connections = window.workflowAPI.getConnections()
            const analysis = await analyzeAndOptimizeWorkflow(nodes, connections)
            displayOptimizationResults(analysis)
        } catch (error) {
            console.error("AI分析错误:", error)
            alert("分析失败，请重试")
        } finally {
            aiOptimizeBtn.disabled = false
            aiOptimizeBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
                </svg>
                分析并优化
            `
        }
    })

    // AI聊天发送
    aiChatSend.addEventListener("click", () => {
        sendAiMessage()
    })

    aiChatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendAiMessage()
        }
    })

    // 发送AI消息
    async function sendAiMessage() {
        const message = aiChatInput.value.trim()
        if (!message) return

        // 添加用户消息
        addChatMessage(message, "user")
        aiChatInput.value = ""

        // 显示AI思考
        const thinkingMsg = addChatMessage("", "assistant", true)

        try {
            const nodes = window.workflowAPI ? window.workflowAPI.getNodes() : []
            const connections = window.workflowAPI ? window.workflowAPI.getConnections() : []
            const response = await getAiChatResponse(message, nodes, connections)
            
            // 移除思考消息
            thinkingMsg.remove()
            
            // 添加AI回复
            addChatMessage(response, "assistant")
            
            // 执行命令(如果有)
            executeAiCommand(response)
        } catch (error) {
            thinkingMsg.remove()
            addChatMessage("抱歉，我遇到了一些问题。请稍后再试。", "assistant")
        }
    }

    // 添加聊天消息
    function addChatMessage(content, role, isThinking = false) {
        const messageDiv = document.createElement("div")
        messageDiv.className = `ai-message ai-message-${role}`
        
        const avatar = document.createElement("div")
        avatar.className = "ai-message-avatar"
        avatar.innerHTML = role === "assistant" 
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>`
        
        const contentDiv = document.createElement("div")
        contentDiv.className = "ai-message-content"
        
        if (isThinking) {
            contentDiv.innerHTML = `<div class="ai-loading">
                <div class="ai-loading-dot"></div>
                <div class="ai-loading-dot"></div>
                <div class="ai-loading-dot"></div>
            </div>`
        } else {
            contentDiv.textContent = content
        }
        
        messageDiv.appendChild(avatar)
        messageDiv.appendChild(contentDiv)
        aiChatMessages.appendChild(messageDiv)
        
        // 滚动到底部
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight
        
        return messageDiv
    }

    // 监听节点选中，更新节点推荐
    // 不再需要这段代码，因为selectNode已经直接调用updateNodeSuggestions

    // 暴露必要的函数和变量到全局作用域，供AI模块使用
    window.workflowAPI = {
        createNode,
        updateNodeData,
        clearCanvas: () => {
            // 删除所有连接
            jsPlumbInstance.deleteEveryConnection()
            
            // 删除所有节点
            nodes.forEach((node) => {
                const element = document.getElementById(node.id)
                if (element) {
                    element.remove()
                }
            })
            
            // 清空数组
            nodes.length = 0
            selectedNode = null
            
            // 更新缩略图
            updateMinimap()
        },
        getNodes: () => nodes,
        getConnections: () => jsPlumbInstance.getConnections(),
        jsPlumbInstance,
        updateMinimap,
        nodeTypeColors,
        nodeTypeTextColors,
        nodeTypeIcons,
    }

    // 预览功能
    function showPreview() {
        // Update node and connection counts
        nodeCountElement.textContent = nodes.length
        connectionCountElement.textContent = jsPlumbInstance.getConnections().length

        // Update node list
        nodeListElement.innerHTML = ""
        nodes.forEach((node) => {
            const nodeItem = document.createElement("div")
            nodeItem.className = "preview-list-item"
            nodeItem.innerHTML = `
      <div class="preview-node-icon" style="background-color: ${nodeTypeColors[node.type]}; color: ${
                nodeTypeTextColors[node.type]
            }">
        ${nodeTypeIcons[node.type] || ""}
      </div>
      <div>
        <div>${node.data.name}</div>
        <div class="text-xs text-gray-500">类型: ${getNodeName(node.type)}</div>
      </div>
    `
            nodeListElement.appendChild(nodeItem)
        })

        // Clear the previous preview canvas container
        const previewCanvasContainer = document.querySelector(".preview-canvas-container")
        previewCanvasContainer.innerHTML = ""

        // Create interactive preview canvas
        const previewCanvasElement = document.createElement("div")
        previewCanvasElement.id = "interactive-preview-canvas"
        previewCanvasElement.className = "interactive-preview-canvas"
        previewCanvasContainer.appendChild(previewCanvasElement)

        // Initialize the preview with the same settings as the main workflow
        initializePreviewCanvas(previewCanvasElement)

        // Update JSON preview
        const workflowData = {
            nodes,
            connections: jsPlumbInstance.getConnections().map((conn) => ({
                source: conn.source.id,
                target: conn.target.id,
                label: conn.getLabel() || "",
                style: {
                    stroke: conn.getPaintStyle().stroke,
                    strokeWidth: conn.getPaintStyle().strokeWidth,
                    connector: conn.getConnector()[0],
                },
            })),
            backgroundSettings,
        }
        jsonContent.textContent = JSON.stringify(workflowData, null, 2)

        // Show preview modal
        previewModal.style.display = "flex"
    }

    // Add this new function to initialize the preview canvas
    function initializePreviewCanvas(previewContainer) {
        // Apply background settings to preview canvas
        previewContainer.style.position = "relative"
        previewContainer.style.width = "100%"
        previewContainer.style.height = "100%"
        previewContainer.style.backgroundColor = backgroundSettings.color

        // Add grid if needed
        if (backgroundSettings.type === "grid") {
            const gridElement = document.createElement("div")
            gridElement.className = "preview-grid"
            gridElement.style.position = "absolute"
            gridElement.style.top = "0"
            gridElement.style.left = "0"
            gridElement.style.right = "0"
            gridElement.style.bottom = "0"
            gridElement.style.backgroundSize = `${backgroundSettings.gridSize}px ${backgroundSettings.gridSize}px`
            gridElement.style.backgroundImage = `
      linear-gradient(to right, ${backgroundSettings.gridColor} 1px, transparent 1px),
      linear-gradient(to bottom, ${backgroundSettings.gridColor} 1px, transparent 1px)
    `
            gridElement.style.zIndex = "0"
            previewContainer.appendChild(gridElement)
        }

        // Create a new jsPlumb instance for the preview
        const previewJsPlumb = jsPlumb.getInstance({
            Connector: ["Bezier", { curviness: 50 }],
            Endpoint: ["Dot", { radius: 5 }],
            HoverPaintStyle: { stroke: "#1e88e5", strokeWidth: 2 },
            ConnectionOverlays: [
                [
                    "Arrow",
                    {
                        location: 1,
                        width: 10,
                        length: 10,
                        id: "arrow",
                    },
                ],
            ],
            Container: previewContainer,
        })

        // Clone all nodes from the main workflow
        nodes.forEach((node) => {
            const originalNode = document.getElementById(node.id)
            if (originalNode) {
                // Create preview node element
                const previewNode = document.createElement("div")
                previewNode.id = `preview-${node.id}`
                previewNode.className = originalNode.className
                previewNode.innerHTML = originalNode.innerHTML
                previewNode.style.position = "absolute"
                previewNode.style.left = `${node.position.x}px`
                previewNode.style.top = `${node.position.y}px`

                // Add preview node to container
                previewContainer.appendChild(previewNode)

                // Make the node draggable in preview (but no other interactions)
                previewJsPlumb.draggable(previewNode, {
                    grid: [10, 10],
                    // No callbacks for position updates since we're just previewing
                })

                // Add endpoints similar to the original node
                previewJsPlumb.addEndpoint(previewNode, {
                    anchor: "Right",
                    isSource: false, // Disable creating new connections
                    isTarget: false, // Disable creating new connections
                    maxConnections: -1,
                    connectorStyle: { stroke: "#5c6bc0", strokeWidth: 2 },
                })

                previewJsPlumb.addEndpoint(previewNode, {
                    anchor: "Left",
                    isSource: false, // Disable creating new connections
                    isTarget: false, // Disable creating new connections
                    maxConnections: -1,
                    connectorStyle: { stroke: "#5c6bc0", strokeWidth: 2 },
                })
            }
        })

        // Recreate all connections
        jsPlumbInstance.getConnections().forEach((conn) => {
            const sourceId = `preview-${conn.source.id}`
            const targetId = `preview-${conn.target.id}`

            // Get connection style
            const style = conn.getPaintStyle()
            const connectorType = conn.getConnector()[0]

            // Create connection in preview
            const connection = previewJsPlumb.connect({
                source: sourceId,
                target: targetId,
                paintStyle: {
                    stroke: style.stroke,
                    strokeWidth: style.strokeWidth,
                },
                connector: [connectorType, { curviness: 50 }],
            })

            // Set label if exists
            const label = conn.getLabel()
            if (label) {
                connection.setLabel(label)
            }
        })
    }

    // 渲染预览画布
    function renderPreviewCanvas() {
        const ctx = previewCanvas.getContext("2d")
        const width = previewCanvas.width
        const height = previewCanvas.height

        // 清除画布
        ctx.clearRect(0, 0, width, height)

        // 设置背景
        ctx.fillStyle = backgroundSettings.color
        ctx.fillRect(0, 0, width, height)

        // 如果是网格背景，绘制网格
        if (backgroundSettings.type === "grid") {
            ctx.strokeStyle = backgroundSettings.gridColor
            ctx.lineWidth = 0.5

            const gridSize = 20
            for (let x = 0; x <= width; x += gridSize) {
                ctx.beginPath()
                ctx.moveTo(x, 0)
                ctx.lineTo(x, height)
                ctx.stroke()
            }

            for (let y = 0; y <= height; y += gridSize) {
                ctx.beginPath()
                ctx.moveTo(0, y)
                ctx.lineTo(width, y)
                ctx.stroke()
            }
        }

        // 找到所有节点的位置以计算适当的缩放比例
        if (nodes.length === 0) return

        let minX = Number.POSITIVE_INFINITY,
            minY = Number.POSITIVE_INFINITY,
            maxX = 0,
            maxY = 0

        nodes.forEach((node) => {
            minX = Math.min(minX, node.position.x)
            minY = Math.min(minY, node.position.y)

            const nodeElement = document.getElementById(node.id)
            if (nodeElement) {
                maxX = Math.max(maxX, node.position.x + nodeElement.offsetWidth)
                maxY = Math.max(maxY, node.position.y + nodeElement.offsetHeight)
            } else {
                maxX = Math.max(maxX, node.position.x + 120) // 默认节点宽度
                maxY = Math.max(maxY, node.position.y + 40) // 默认节点高度
            }
        })

        // 添加边距
        minX = Math.max(0, minX - 50)
        minY = Math.max(0, minY - 50)
        maxX += 50
        maxY += 50

        const contentWidth = maxX - minX
        const contentHeight = maxY - minY

        // 计算缩放比例以适应所有节点
        const scaleX = width / contentWidth
        const scaleY = height / contentHeight
        const previewScale = Math.min(scaleX, scaleY, 1) // 不超过1:1比例

        // 计算绘制偏移，使内容居中
        const offsetX = (width - contentWidth * previewScale) / 2
        const offsetY = (height - contentHeight * previewScale) / 2

        // 绘制连接线
        ctx.strokeStyle = "#5c6bc0"
        ctx.lineWidth = 2

        jsPlumbInstance.getConnections().forEach((conn) => {
            const sourceNode = nodes.find((node) => node.id === conn.source.id)
            const targetNode = nodes.find((node) => node.id === conn.target.id)

            if (sourceNode && targetNode) {
                const sourceElement = document.getElementById(sourceNode.id)
                const targetElement = document.getElementById(targetNode.id)

                if (sourceElement && targetElement) {
                    const sourceX = (sourceNode.position.x + sourceElement.offsetWidth / 2 - minX) * previewScale + offsetX
                    const sourceY = (sourceNode.position.y + sourceElement.offsetHeight / 2 - minY) * previewScale + offsetY
                    const targetX = (targetNode.position.x + targetElement.offsetWidth / 2 - minX) * previewScale + offsetX
                    const targetY = (targetNode.position.y + targetElement.offsetHeight / 2 - minY) * previewScale + offsetY

                    // 使用连接线的自定义样式
                    const connStyle = conn.getPaintStyle()
                    ctx.strokeStyle = connStyle.stroke || "#5c6bc0"
                    ctx.lineWidth = connStyle.strokeWidth || 2

                    // 绘制连接线
                    ctx.beginPath()
                    ctx.moveTo(sourceX, sourceY)
                    ctx.lineTo(targetX, targetY)
                    ctx.stroke()

                    // 绘制箭头
                    const angle = Math.atan2(targetY - sourceY, targetX - sourceX)
                    const arrowLength = 10
                    const arrowWidth = 6

                    ctx.beginPath()
                    ctx.moveTo(targetX, targetY)
                    ctx.lineTo(
                        targetX - arrowLength * Math.cos(angle) + arrowWidth * Math.sin(angle),
                        targetY - arrowLength * Math.sin(angle) - arrowWidth * Math.cos(angle),
                    )
                    ctx.lineTo(
                        targetX - arrowLength * Math.cos(angle) - arrowWidth * Math.sin(angle),
                        targetY - arrowLength * Math.sin(angle) + arrowWidth * Math.cos(angle),
                    )
                    ctx.closePath()
                    ctx.fillStyle = connStyle.stroke || "#5c6bc0"
                    ctx.fill()

                    // 绘制标签
                    const label = conn.getLabel()
                    if (label) {
                        const labelX = (sourceX + targetX) / 2
                        const labelY = (sourceY + targetY) / 2 - 10
                        ctx.font = "12px Arial"
                        ctx.fillStyle = "#333"
                        ctx.textAlign = "center"
                        ctx.fillText(label, labelX, labelY)
                    }
                }
            }
        })

        // 绘制节点
        nodes.forEach((node) => {
            const nodeElement = document.getElementById(node.id)
            if (nodeElement) {
                const x = (node.position.x - minX) * previewScale + offsetX
                const y = (node.position.y - minY) * previewScale + offsetY
                const width = nodeElement.offsetWidth * previewScale
                const height = nodeElement.offsetHeight * previewScale

                // 绘制节点背景
                ctx.fillStyle = "#fff"
                ctx.strokeStyle = "#e0e0e0"
                ctx.lineWidth = 1

                // 根据节点样式绘制不同的形状
                if (node.data.style === "rounded") {
                    ctx.beginPath()
                    ctx.roundRect(x, y, width, height, 16)
                    ctx.fill()
                    ctx.stroke()
                } else if (node.data.style === "modern") {
                    ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
                    ctx.shadowBlur = 10
                    ctx.shadowOffsetX = 0
                    ctx.shadowOffsetY = 4
                    ctx.beginPath()
                    ctx.roundRect(x, y, width, height, 8)
                    ctx.fill()
                    ctx.stroke()
                    ctx.shadowColor = "transparent"
                } else if (node.data.style === "flat") {
                    ctx.fillStyle = "#f5f5f5"
                    ctx.beginPath()
                    ctx.rect(x, y, width, height)
                    ctx.fill()
                    ctx.stroke()
                } else {
                    // 默认样式
                    ctx.beginPath()
                    ctx.rect(x, y, width, height)
                    ctx.fill()
                    ctx.stroke()
                }

                // 绘制节点图标
                const iconSize = 24 * previewScale
                const iconX = x + 10 * previewScale
                const iconY = y + (height - iconSize) / 2
                const iconBgColor = nodeTypeColors[node.type] || "#e6f7ff"

                ctx.fillStyle = iconBgColor
                ctx.beginPath()
                ctx.roundRect(iconX, iconY, iconSize, iconSize, 4 * previewScale)
                ctx.fill()

                // 绘制节点标题
                ctx.font = `${12 * previewScale}px Arial`
                ctx.fillStyle = "#333"
                ctx.textBaseline = "middle"
                ctx.fillText(node.data.name, x + (iconSize + 20) * previewScale, y + height / 2)
            }
        })
    }

    // 保存功能
    // function showSaveDialog() {
    //     // 显示保存对话框
    //     saveModal.style.display = "flex"
    // }

    function saveWorkflow() {
        // 获取表单数据
        const name = workflowNameInput.value || "我的工作流"
        const description = workflowDescriptionInput.value || ""
        const version = workflowVersionInput.value || "1.0.0"
        const permission = workflowPermissionSelect.value || "private"

        // 创建工作流数据
        const workflowData = {
            metadata: {
                name,
                description,
                version,
                permission,
                createdAt: new Date().toISOString(),
            },
            nodes,
            connections: jsPlumbInstance.getConnections().map((conn) => ({
                source: conn.source.id,
                target: conn.target.id,
                label: conn.getLabel() || "",
                style: {
                    stroke: conn.getPaintStyle().stroke,
                    strokeWidth: conn.getPaintStyle().strokeWidth,
                    connector: conn.getConnector()[0],
                },
            })),
            backgroundSettings,
        }

        // 转换为JSON并下载
        const dataStr = JSON.stringify(workflowData, null, 2)
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

        const fileName = name.replace(/\s+/g, "-").toLowerCase() + ".json"
        const linkElement = document.createElement("a")
        linkElement.setAttribute("href", dataUri)
        linkElement.setAttribute("download", fileName)
        linkElement.click()

        // 关闭对话框
        saveModal.style.display = "none"
    }

    // 事件监听：预览按钮
    previewBtn.addEventListener("click", () => {
        console.log("Preview button clicked")
        showPreview()
    })

    // 事件监听：保存按钮
    // saveBtn.addEventListener("click", showSaveDialog)

    // 事件监听：关闭预览
    closePreviewBtn.addEventListener("click", () => {
        previewModal.style.display = "none"
    })

    closePreviewBtnFooter.addEventListener("click", () => {
        previewModal.style.display = "none"
    })

    // 事件监听：关闭保存对话框
    closeSaveBtn.addEventListener("click", () => {
        saveModal.style.display = "none"
    })

    cancelSaveBtn.addEventListener("click", () => {
        saveModal.style.display = "none"
    })

    confirmSaveBtn.addEventListener("click", saveWorkflow)

    // 事件监听：预览标签页切换
    previewTabs.forEach((tab) => {
        tab.addEventListener("click", function () {
            const tabId = this.getAttribute("data-tab")

            // 更新标签页状态
            previewTabs.forEach((t) => t.classList.remove("active"))
            this.classList.add("active")

            // 更新内容显示
            previewTabContents.forEach((content) => {
                content.style.display = content.id === `${tabId}-preview` ? "flex" : "none"
            })
        })
    })
})

// ==============================================
// AI核心算法模块
// ==============================================

/**
 * 根据用户描述生成工作流
 */
async function generateWorkflowFromPrompt(prompt) {
    // 模拟AI延迟
    await sleep(1500)
    
    // AI智能分析提示词，生成工作流结构
    const workflow = analyzePromptAndGenerateWorkflow(prompt)
    
    return workflow
}

/**
 * 分析提示词并生成工作流(智能算法)
 */
function analyzePromptAndGenerateWorkflow(prompt) {
    const lowerPrompt = prompt.toLowerCase()
    const workflow = { nodes: [], connections: [] }
    
    // 关键词匹配规则
    const patterns = {
        login: /登录|认证|login|auth/i,
        register: /注册|sign.*up|register/i,
        data: /数据|处理|data|process/i,
        api: /api|http|请求|request/i,
        database: /数据库|database|db|存储|storage/i,
        email: /邮件|email|mail|通知|notification/i,
        timer: /定时|定期|timer|schedule|cron/i,
        validate: /验证|validate|check|检查/i,
        transform: /转换|transform|处理|process/i,
        condition: /条件|if|判断|condition/i,
    }
    
    // 分析需要哪些节点
    const neededNodes = []
    
    if (patterns.login.test(lowerPrompt) || patterns.register.test(lowerPrompt)) {
        // 登录/注册流程
        neededNodes.push(
            { type: "start", name: "开始" },
            { type: "input", name: "用户输入" },
            { type: "code", name: "输入验证", code: "// 验证用户名和密码\nif (!username || !password) {\n  throw new Error('用户名和密码不能为空');\n}" },
        )
        if (patterns.database.test(lowerPrompt)) {
            neededNodes.push({ type: "database", name: "查询用户" })
        }
        neededNodes.push(
            { type: "condition", name: "验证结果" },
            { type: "output", name: "登录成功" },
        )
        if (patterns.email.test(lowerPrompt)) {
            neededNodes.push({ type: "notification", name: "发送通知" })
        }
    } else if (patterns.data.test(lowerPrompt)) {
        // 数据处理流程
        neededNodes.push(
            { type: "start", name: "开始" },
            { type: "database", name: "获取数据" },
            { type: "transform", name: "数据转换" },
            { type: "code", name: "数据处理", code: "// 处理数据\nconst result = data.map(item => {\n  return {\n    ...item,\n    processed: true\n  };\n});" },
            { type: "output", name: "输出结果" },
        )
    } else if (patterns.timer.test(lowerPrompt)) {
        // 定时任务
        neededNodes.push(
            { type: "timer", name: "定时触发" },
            { type: "api", name: "调用API" },
            { type: "transform", name: "数据处理" },
            { type: "output", name: "生成报表" },
        )
    } else {
        // 默认简单流程
        neededNodes.push(
            { type: "start", name: "开始" },
            { type: "input", name: "输入" },
            { type: "transform", name: "处理" },
            { type: "output", name: "输出" },
        )
    }
    
    // 生成节点并布局
    const startX = 100
    const startY = 100
    const horizontalGap = 200
    const verticalGap = 80
    
    neededNodes.forEach((nodeConfig, index) => {
        workflow.nodes.push({
            type: nodeConfig.type,
            name: nodeConfig.name,
            x: startX + (index % 3) * horizontalGap,
            y: startY + Math.floor(index / 3) * verticalGap,
            code: nodeConfig.code || "",
        })
    })
    
    // 生成连接
    for (let i = 0; i < workflow.nodes.length - 1; i++) {
        workflow.connections.push({
            source: i,
            target: i + 1,
        })
    }
    
    return workflow
}

/**
 * 分析并优化工作流
 */
async function analyzeAndOptimizeWorkflow(nodes, connections) {
    await sleep(1200)
    
    const analysis = {
        score: 0,
        issues: [],
        suggestions: [],
        optimizations: [],
    }
    
    // 分析逻辑
    analysis.score = 85 + Math.floor(Math.random() * 10)
    
    // 检查常见问题
    if (nodes.length > 10) {
        analysis.issues.push("流程节点过多，建议拆分成子流程")
        analysis.score -= 5
    }
    
    const startNodes = nodes.filter((n) => n.type === "start")
    if (startNodes.length === 0) {
        analysis.issues.push("缺少开始节点")
        analysis.score -= 10
    } else if (startNodes.length > 1) {
        analysis.issues.push("存在多个开始节点")
        analysis.score -= 5
    }
    
    // 检查孤立节点
    const connectedNodeIds = new Set()
    connections.forEach((conn) => {
        connectedNodeIds.add(conn.source.id)
        connectedNodeIds.add(conn.target.id)
    })
    
    const orphanNodes = nodes.filter((n) => !connectedNodeIds.has(n.id))
    if (orphanNodes.length > 0) {
        analysis.issues.push(`发现 ${orphanNodes.length} 个孤立节点，建议连接或删除`)
        analysis.score -= orphanNodes.length * 3
    }
    
    // 性能优化建议
    const dbNodes = nodes.filter((n) => n.type === "database")
    if (dbNodes.length > 2) {
        analysis.suggestions.push("多个数据库节点，考虑合并查询以提升性能")
        analysis.optimizations.push({
            type: "performance",
            desc: "批量查询代替多次查询",
            impact: "high",
        })
    }
    
    const apiNodes = nodes.filter((n) => n.type === "api")
    if (apiNodes.length > 0) {
        analysis.suggestions.push("建议为API调用添加错误处理和重试机制")
        analysis.optimizations.push({
            type: "reliability",
            desc: "添加API超时和重试配置",
            impact: "medium",
        })
    }
    
    // 架构建议
    if (nodes.length > 5 && !nodes.some((n) => n.type === "condition")) {
        analysis.suggestions.push("考虑添加条件分支处理异常情况")
    }
    
    if (nodes.some((n) => n.type === "code") && !nodes.some((n) => n.type === "output")) {
        analysis.suggestions.push("建议添加输出节点记录执行结果")
    }
    
    return analysis
}

/**
 * 显示优化结果
 */
function displayOptimizationResults(analysis) {
    const resultBox = document.getElementById("ai-optimization-result")
    
    let html = `
        <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                <span style="font-size: 1.5rem; font-weight: bold; color: ${analysis.score >= 80 ? "#52c41a" : analysis.score >= 60 ? "#faad14" : "#ff4d4f"}">
                    ${analysis.score}分
                </span>
                <span style="color: #666;">整体评分</span>
            </div>
            <div style="width: 100%; height: 8px; background: #f0f0f0; border-radius: 4px; overflow: hidden;">
                <div style="width: ${analysis.score}%; height: 100%; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); transition: width 0.5s;"></div>
            </div>
        </div>
    `
    
    if (analysis.issues.length > 0) {
        html += `
            <div style="margin-bottom: 1rem;">
                <h4 style="font-size: 0.875rem; font-weight: 600; color: #ff4d4f; margin-bottom: 0.5rem;">
                    ⚠️ 发现问题 (${analysis.issues.length})
                </h4>
                <ul style="margin: 0; padding-left: 1.5rem; color: #666; font-size: 0.8rem; line-height: 1.8;">
                    ${analysis.issues.map((issue) => `<li>${issue}</li>`).join("")}
                </ul>
            </div>
        `
    }
    
    if (analysis.suggestions.length > 0) {
        html += `
            <div style="margin-bottom: 1rem;">
                <h4 style="font-size: 0.875rem; font-weight: 600; color: #1890ff; margin-bottom: 0.5rem;">
                    💡 优化建议 (${analysis.suggestions.length})
                </h4>
                <ul style="margin: 0; padding-left: 1.5rem; color: #666; font-size: 0.8rem; line-height: 1.8;">
                    ${analysis.suggestions.map((sug) => `<li>${sug}</li>`).join("")}
                </ul>
            </div>
        `
    }
    
    if (analysis.optimizations.length > 0) {
        html += `
            <div>
                <h4 style="font-size: 0.875rem; font-weight: 600; color: #52c41a; margin-bottom: 0.5rem;">
                    ✨ 推荐优化
                </h4>
                ${analysis.optimizations
                .map(
                    (opt) => `
                    <div style="padding: 0.75rem; background: white; border: 1px solid #e0e0e0; border-radius: 0.375rem; margin-bottom: 0.5rem;">
                        <div style="font-size: 0.8rem; font-weight: 600; color: #333; margin-bottom: 0.25rem;">
                            ${opt.desc}
                        </div>
                        <div style="display: flex; gap: 0.5rem; font-size: 0.7rem;">
                            <span style="padding: 0.125rem 0.5rem; background: #f0f0f0; border-radius: 0.25rem; color: #666;">
                                ${opt.type === "performance" ? "性能优化" : "可靠性优化"}
                            </span>
                            <span style="padding: 0.125rem 0.5rem; background: ${opt.impact === "high" ? "#fff2e8" : "#e6f7ff"}; color: ${opt.impact === "high" ? "#fa541c" : "#1890ff"}; border-radius: 0.25rem;">
                                ${opt.impact === "high" ? "高影响" : "中等影响"}
                            </span>
                        </div>
                    </div>
                `,
                )
                .join("")}
            </div>
        `
    }
    
    resultBox.innerHTML = html
}

/**
 * 更新节点推荐
 */
function updateNodeSuggestions(selectedNode) {
    const suggestionsContainer = document.getElementById("ai-suggestions")
    if (!suggestionsContainer || !window.workflowAPI) return
    
    // 基于当前节点类型推荐下一个节点
    const suggestions = getNodeSuggestions(selectedNode.type)
    
    if (suggestions.length === 0) {
        suggestionsContainer.innerHTML = '<p class="ai-placeholder">暂无推荐</p>'
        return
    }
    
    const { nodeTypeColors, nodeTypeTextColors, nodeTypeIcons } = window.workflowAPI
    
    suggestionsContainer.innerHTML = suggestions
        .map(
            (sug) => `
        <div class="ai-suggestion-card" onclick="addSuggestedNode('${selectedNode.id}', '${sug.type}')">
            <div class="ai-suggestion-icon" style="background-color: ${nodeTypeColors[sug.type]}; color: ${nodeTypeTextColors[sug.type]}">
                ${nodeTypeIcons[sug.type]}
            </div>
            <div class="ai-suggestion-title">${sug.title}</div>
            <div class="ai-suggestion-desc">${sug.desc}</div>
        </div>
    `,
        )
        .join("")
}

// 将函数暴露到全局作用域
window.updateNodeSuggestions = updateNodeSuggestions

/**
 * 获取节点推荐
 */
function getNodeSuggestions(nodeType) {
    const suggestionRules = {
        start: [
            { type: "input", title: "输入", desc: "接收用户或系统输入" },
            { type: "timer", title: "定时器", desc: "定时触发流程" },
        ],
        input: [
            { type: "code", title: "代码", desc: "验证或处理输入数据" },
            { type: "transform", title: "文本处理", desc: "转换数据格式" },
            { type: "condition", title: "条件", desc: "根据输入进行分支" },
        ],
        code: [
            { type: "condition", title: "条件", desc: "检查执行结果" },
            { type: "database", title: "数据库", desc: "存储处理结果" },
            { type: "api", title: "API", desc: "调用外部服务" },
        ],
        condition: [
            { type: "database", title: "数据库", desc: "根据条件操作数据" },
            { type: "notification", title: "通知", desc: "发送通知" },
            { type: "output", title: "输出", desc: "输出结果" },
        ],
        database: [
            { type: "transform", title: "文本处理", desc: "转换数据格式" },
            { type: "code", title: "代码", desc: "处理查询结果" },
            { type: "output", title: "输出", desc: "返回数据" },
        ],
        api: [
            { type: "code", title: "代码", desc: "处理API响应" },
            { type: "transform", title: "文本处理", desc: "转换响应数据" },
            { type: "condition", title: "条件", desc: "检查API调用结果" },
        ],
        transform: [
            { type: "code", title: "代码", desc: "进一步处理" },
            { type: "output", title: "输出", desc: "输出处理结果" },
            { type: "database", title: "数据库", desc: "保存处理后的数据" },
        ],
    }
    
    return suggestionRules[nodeType] || []
}

/**
 * 添加推荐节点
 */
window.addSuggestedNode = function (sourceNodeId, nodeType) {
    if (!window.workflowAPI) {
        console.error('workflowAPI 未初始化')
        return
    }
    
    const nodes = window.workflowAPI.getNodes()
    const sourceNode = nodes.find((n) => n.id === sourceNodeId)
    if (!sourceNode) return
    
    // 在源节点右侧创建新节点
    const newX = sourceNode.position.x + 200
    const newY = sourceNode.position.y
    
    const newNode = window.workflowAPI.createNode(nodeType, newX, newY)
    
    // 创建连接
    setTimeout(() => {
        const sourceElement = document.getElementById(sourceNodeId)
        const targetElement = document.getElementById(newNode.id)
        
        if (sourceElement && targetElement && window.workflowAPI.jsPlumbInstance) {
            window.workflowAPI.jsPlumbInstance.connect({
                source: sourceElement,
                target: targetElement,
            })
        }
    }, 100)
}

/**
 * AI聊天响应
 */
async function getAiChatResponse(message, nodes, connections) {
    await sleep(800)
    
    const lowerMsg = message.toLowerCase()
    
    // 智能匹配用户意图
    if (lowerMsg.includes("生成") || lowerMsg.includes("create") || lowerMsg.includes("创建")) {
        return "我可以帮你生成工作流！请切换到'生成流程'标签页，描述你的需求即可。例如：'创建一个用户注册流程'。"
    }
    
    if (lowerMsg.includes("优化") || lowerMsg.includes("optimize") || lowerMsg.includes("改进")) {
        if (nodes.length === 0) {
            return "当前画布为空，请先创建一些节点。我可以帮你分析并优化工作流结构。"
        }
        return `我已经检测到你的工作流有 ${nodes.length} 个节点。请切换到'智能优化'标签页，点击'分析并优化'按钮，我会提供详细的优化建议。`
    }
    
    if (lowerMsg.includes("推荐") || lowerMsg.includes("下一个") || lowerMsg.includes("suggest")) {
        return "请在画布中选中一个节点，然后切换到'节点推荐'标签页，我会基于上下文为你推荐合适的下一个节点。"
    }
    
    if (lowerMsg.includes("帮助") || lowerMsg.includes("help")) {
        return `我能帮你：

1️⃣ 生成工作流 - 基于你的描述自动创建
2️⃣ 智能优化 - 分析并改进你的流程
3️⃣ 节点推荐 - 推荐下一步节点
4️⃣ 最佳实践 - 提供专业建议

直接告诉我你想做什么！`
    }
    
    if (nodes.length > 0) {
        return `你的工作流目前有 ${nodes.length} 个节点。我建议：

• 如果想优化流程，可以说"帮我优化"
• 如果需要添加节点，选中一个节点后说"推荐下一个节点"
• 如果需要重新开始，可以说"生成一个新流程"`
    }
    
    return "我是AI智能助手，可以帮你设计和优化工作流。你可以问我任何关于工作流设计的问题，或者说'帮助'查看我能做什么。"
}

/**
 * 执行AI命令
 */
function executeAiCommand(response) {
    // 未来可以扩展，根据AI响应执行操作
}

/**
 * 清空画布
 */
function clearCanvas() {
    if (window.workflowAPI && typeof window.workflowAPI.clearCanvas === 'function') {
        window.workflowAPI.clearCanvas()
    }
}

/**
 * 渲染生成的工作流（带动画效果）
 */
function renderGeneratedWorkflow(workflow) {
    if (!window.workflowAPI) {
        console.error('workflowAPI 未初始化')
        return
    }
    
    const createdNodes = []
    let currentStep = 0
    
    // 显示生成进度提示
    showGenerationProgress(workflow.nodes.length)
    
    // 逐个创建节点（带延迟动画）
    function createNextNode() {
        if (currentStep >= workflow.nodes.length) {
            // 所有节点创建完成，开始创建连接
            setTimeout(() => {
                createConnections(workflow, createdNodes)
            }, 300)
            return
        }
        
        const nodeConfig = workflow.nodes[currentStep]
        
        // 更新进度
        updateGenerationProgress(
            currentStep + 1, 
            workflow.nodes.length, 
            `正在创建: ${nodeConfig.name}`,
            getNodeTypeEmoji(nodeConfig.type)
        )
        
        // 创建节点
        const node = window.workflowAPI.createNode(nodeConfig.type, nodeConfig.x, nodeConfig.y)
        
        // 获取新创建的节点DOM元素
        const nodeElement = document.getElementById(node.id)
        if (nodeElement) {
            // 添加创建动画
            nodeElement.style.opacity = '0'
            nodeElement.style.transform = 'scale(0.5)'
            
            // 延迟显示动画
            setTimeout(() => {
                nodeElement.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                nodeElement.style.opacity = '1'
                nodeElement.style.transform = 'scale(1)'
                
                // 添加一个脉冲效果
                nodeElement.classList.add('node-creating')
                setTimeout(() => {
                    nodeElement.classList.remove('node-creating')
                }, 600)
            }, 50)
        }
        
        // 更新节点名称
        if (nodeConfig.name) {
            window.workflowAPI.updateNodeData(node.id, { name: nodeConfig.name })
        }
        
        // 更新代码
        if (nodeConfig.code) {
            window.workflowAPI.updateNodeData(node.id, { code: nodeConfig.code })
        }
        
        createdNodes.push(node)
        currentStep++
        
        // 递归创建下一个节点（延迟以显示动画）
        setTimeout(createNextNode, 400)
    }
    
    // 开始创建第一个节点
    createNextNode()
}

/**
 * 创建连接（带动画效果）
 */
function createConnections(workflow, createdNodes) {
    if (!workflow.connections || workflow.connections.length === 0) {
        // 没有连接，完成生成
        completeGeneration()
        return
    }
    
    updateGenerationProgress(createdNodes.length, createdNodes.length, '正在连接节点...', '🔗')
    
    let connectionIndex = 0
    
    function createNextConnection() {
        if (connectionIndex >= workflow.connections.length) {
            // 所有连接创建完成
            setTimeout(() => {
                completeGeneration()
            }, 300)
            return
        }
        
        const conn = workflow.connections[connectionIndex]
        const sourceNode = createdNodes[conn.source]
        const targetNode = createdNodes[conn.target]
        
        if (sourceNode && targetNode && window.workflowAPI.jsPlumbInstance) {
            const connection = window.workflowAPI.jsPlumbInstance.connect({
                source: sourceNode.id,
                target: targetNode.id,
            })
            
            // 连接线动画效果
            if (connection) {
                const connElement = connection.connector.canvas
                if (connElement) {
                    connElement.style.opacity = '0'
                    setTimeout(() => {
                        connElement.style.transition = 'opacity 0.3s ease'
                        connElement.style.opacity = '1'
                    }, 50)
                }
            }
        }
        
        connectionIndex++
        setTimeout(createNextConnection, 200)
    }
    
    createNextConnection()
}

/**
 * 显示生成进度
 */
function showGenerationProgress(totalNodes) {
    // 创建背景遮罩
    const overlay = document.createElement('div')
    overlay.id = 'ai-generation-overlay'
    overlay.className = 'ai-generation-overlay'
    document.body.appendChild(overlay)
    
    // 创建进度提示面板
    const progressPanel = document.createElement('div')
    progressPanel.id = 'ai-generation-progress'
    progressPanel.className = 'ai-generation-progress'
    progressPanel.innerHTML = `
        <div class="progress-content">
            <div class="progress-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="rotating">
                    <path d="M21 12a9 9 0 11-6.219-8.56"></path>
                </svg>
            </div>
            <div class="progress-text">
                <div class="progress-title">
                    <span class="progress-emoji" id="progress-emoji">🤖</span>
                    AI正在生成工作流
                </div>
                <div class="progress-status" id="progress-status">准备中...</div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" id="progress-bar-fill" style="width: 0%"></div>
                </div>
                <div class="progress-count" id="progress-count">0 / ${totalNodes} 节点</div>
            </div>
        </div>
    `
    document.body.appendChild(progressPanel)
    
    // 淡入动画
    setTimeout(() => {
        overlay.classList.add('show')
        progressPanel.classList.add('show')
    }, 10)
}

/**
 * 更新生成进度
 */
function updateGenerationProgress(current, total, status, emoji = '🔧') {
    const progressStatus = document.getElementById('progress-status')
    const progressCount = document.getElementById('progress-count')
    const progressBarFill = document.getElementById('progress-bar-fill')
    const progressEmoji = document.getElementById('progress-emoji')
    
    if (progressStatus) {
        progressStatus.textContent = status
    }
    
    if (progressEmoji) {
        progressEmoji.textContent = emoji
    }
    
    if (progressCount) {
        progressCount.textContent = `${current} / ${total} 节点`
    }
    
    if (progressBarFill) {
        const percentage = (current / total) * 100
        progressBarFill.style.width = `${percentage}%`
    }
}

/**
 * 获取节点类型Emoji
 */
function getNodeTypeEmoji(nodeType) {
    const emojiMap = {
        start: '🚀',
        input: '⌨️',
        transform: '⚙️',
        code: '💻',
        condition: '❓',
        loop: '🔁',
        database: '💾',
        api: '🌐',
        output: '📤',
        timer: '⏰',
        notification: '🔔',
        function: '📦',
    }
    return emojiMap[nodeType] || '🔧'
}

/**
 * 完成生成
 */
function completeGeneration() {
    updateGenerationProgress(100, 100, '✨ 生成完成！', '✅')
    
    // 更新缩略图
    if (window.workflowAPI.updateMinimap) {
        window.workflowAPI.updateMinimap()
    }
    
    // 延迟后移除进度面板和遮罩
    setTimeout(() => {
        const progressPanel = document.getElementById('ai-generation-progress')
        const overlay = document.getElementById('ai-generation-overlay')
        
        if (progressPanel) {
            progressPanel.classList.remove('show')
        }
        
        if (overlay) {
            overlay.classList.remove('show')
        }
        
        setTimeout(() => {
            if (progressPanel) progressPanel.remove()
            if (overlay) overlay.remove()
        }, 300)
    }, 1500)
}

/**
 * 工具函数: sleep
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
