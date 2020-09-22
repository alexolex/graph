const export_icon24 = '<path fill-rule="evenodd" clip-rule="evenodd" d="M5.70711 6.70714L8 4.41424V13C8 13.5523 8.44771 14 9 14C9.55229 14 10 13.5523 10 13V4.41424L12.2929 6.70714C12.6834 7.09766 13.3166 7.09766 13.7071 6.70714C14.0976 6.31661 14.0976 5.68345 13.7071 5.29292L9 0.585815L4.29289 5.29292C3.90237 5.68345 3.90237 6.31661 4.29289 6.70714C4.68342 7.09766 5.31658 7.09766 5.70711 6.70714ZM16 14V17H2V14C2 13.4477 1.55228 13 1 13C0.447715 13 0 13.4477 0 14V19H18V14C18 13.4477 17.5523 13 17 13C16.4477 13 16 13.4477 16 14Z" fill="#050038"/>'

miro.onReady(() => {
    miro.initialize({
        extensionPoints: {

            getWidgetMenuItems: (widgets) => {
                return Promise.resolve([{
                    tooltip: 'Export to SQL script',
                    svgIcon: export_icon24,
                    onClick: async () => {
                        await authAndExport(exportToSql);
                    }
                }])
            }
        }
    })
})

async function authAndExport(exportToFunc) {
    const authorized = await miro.isAuthorized()
    if (authorized) {
        exportToFunc();
    } else {
        console.log("App needs auth by the user...");

        miro.board.ui.openModal('miro-graph-tools/not-authorized.html')
            .then(res => {
                if (res === 'success') {
                    try{
                        exportToFunc();
                    }
                    catch(err){
                        console.log(err);
                        alert("An exception happened. See the console for details.");
                    }
                }
            })
    }
}

function exportToSql() {

    miro.board.selection.get().then((selection) => {

        let g = toGraph(selection);

        console.log("Nodes: " + g.nodes.length);
        console.log("Edges: " + g.edges.length);

        let script = buildSqlScript(g);
        download(script, "script.sql");

        console.log("Successfully exported a graph to SQL script.");
    });
}

function buildSqlScript(g) {

    let script = "";
    
    let nodesByType = groupByType(g.nodes);
    for (let [type, nodes] of nodesByType.entries()) {
        script += buildInsertNodesSnippet(type, nodes);
    }

    let edgesByType = groupByType(g.edges);
    for (let [type, edges] of edgesByType.entries()) {
        script += buildInsertEdgesSnippet(type, edges);
    }
    
    return script;
}

function buildInsertEdgesSnippet(type, edges){
    let sql = `IF OBJECT_ID ('dbo.${type}', 'U') IS NULL
	CREATE TABLE [${type}] (
        [id] AS LOWER('${type}') + '_' + CAST(autoId AS NVARCHAR(20)) PERSISTED,
		[autoId] int IDENTITY(1,1) UNIQUE,
		[boardId] nvarchar(30) NOT NULL,
		[text] nvarchar(max) NULL,
        [_whenCreated] [datetime] NOT NULL DEFAULT CURRENT_TIMESTAMP,
        [_whenUpdated] [datetime] NOT NULL DEFAULT CURRENT_TIMESTAMP
	)
	as EDGE
GO

${buildOriginalTypeSnippet("string", type, "id")}
${buildOriginalTypeSnippet("string", type, "boardId")}
${buildOriginalTypeSnippet("string", type, "text")}

INSERT INTO [${type}] ($from_id, $to_id, [boardId], [text]) Values ${getEdgesInsertValues(edges)}
GO

`;
    return sql;
}

function getEdgesInsertValues(edges) {
    return edges.map(e => 
        "\n("+
            "(select $node_id from [" + e.fromType + "] where boardId = '" + e.startWidgetId + "'), " +
            "(select $node_id from [" + e.toType + "] where boardId = '" + e.endWidgetId  + "'), " +
            "'" + e.widgetId + "', " + 
            "'" + e.text + "'" +
        ")"
    ).join(",");
}

function buildInsertNodesSnippet(type, nodes){

    let sql = `IF OBJECT_ID ('dbo.${type}', 'U') IS NULL
	CREATE TABLE [${type}] (
        [id] AS LOWER('${type}') + '_' + CAST(autoId AS NVARCHAR(20)) PERSISTED,
		[autoId] int IDENTITY(1,1) UNIQUE,
		[boardId] nvarchar(30) NOT NULL,
		[text] nvarchar(max) NULL,
        [_whenCreated] [datetime] NOT NULL DEFAULT CURRENT_TIMESTAMP,
        [_whenUpdated] [datetime] NOT NULL DEFAULT CURRENT_TIMESTAMP
	)
	as NODE
GO

${buildOriginalTypeSnippet("string", type, "id")}
${buildOriginalTypeSnippet("string", type, "boardId")}
${buildOriginalTypeSnippet("string", type, "text")}

INSERT INTO [${type}] ([boardId], [text]) Values ${nodes.map(n => "\n('" + n.widgetId + "', '" + n.text + "')").join(",")}
GO

`;
    
    return sql;
}

function buildOriginalTypeSnippet(columnType, tableName, columnName){
    return `EXEC sp_addextendedproperty
    @name = N'OriginalType',
    @value = '${columnType}',
    @level0type = N'Schema',
    @level0name = 'dbo',
    @level1type = N'Table',
    @level1name = '${tableName}',
    @level2type = N'Column',
    @level2name = '${columnName}';
GO

`;
}

function groupByType(elements){
    let byType = new Map();
    elements.forEach(e => {
        if (!byType.has(e.type))
        {
            byType.set(e.type, new Array());
        }
        byType.get(e.type).push(e);
    });
    return byType;
}

function toGraph(selection) {

    let graph = {
        "nodes": selection.filter(w => w.type === "SHAPE").map(shape => {

            return {
                "widgetId": shape.id,
                "type" : getTypeFromString(shape.plainText, "Entity"),
                "text" : getTextFromString(shape.plainText),
                "action" : "",
                "targetId" : ""
            }
        }),
        "edges": []
    };

    let nodesById = new Map(graph.nodes.map(n => [n.widgetId, n]));

    graph.edges = selection.filter(w => w.type === "LINE").map(line => {

        let caption =  line.captions && line.captions.length > 0 ? line.captions[0].text : "";

        return {
            "widgetId": line.id,
            "startWidgetId": line.startWidgetId,
            "endWidgetId": line.endWidgetId,

            "type" : getTypeFromString(caption, "Relation"),
            "fromType" : nodesById.get(line.startWidgetId).type,
            "toType" : nodesById.get(line.endWidgetId).type,
            "text" : getTextFromString(caption),
            "action" : "",
            "targetId" : ""
        }
    });
    
    return graph;
}

function getTextFromString(s) {
    if (s === undefined || s.length === 0)
        return "";

    return  s.substring(s.indexOf("]") + 1).trim();
}

function getTypeFromString(s, defType) {
    if (s === undefined || s.length === 0)
        return defType;

    let type = s.substring(s.indexOf("[") + 1, s.indexOf("]")).trim();
    return type != "" ? type : defType;
}

function download(text, filename) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
}