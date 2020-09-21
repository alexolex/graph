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
                    exportToFunc();
                }
            })
    }
}

function exportToSql() {

    miro.board.selection.get().then((selection) => {

        let g = toGraph(selection);

        console.log("Nodes: " + g.nodes.length);
        console.log("Edges: " + g.edges.length);

        let script = genSqlScript(g);
        download(script, "script.sql");

        console.log("Successfully exported a graph to SQL script.");
    });
}

function genSqlScript(g) {

    let script = "";
    //TODO: implement
    return script;
}

function toGraph(selection) {

    let graph = {
        "nodes": selection.filter(w => w.type === "SHAPE").map(shape => {

            return {
                "id": shape.id,
                "type" : getTypeFromString(shape.plainText, "Entity"),
                "text" : getTextFromString(shape.plainText)
            }
        }),
        "edges": selection.filter(w => w.type === "LINE").map(line => {

            let caption =  line.captions && line.captions.length > 0 ? line.captions[0].text : "";

            return {
                "id": line.id,
                "startWidgetId": line.startWidgetId,
                "endWidgetId": line.endWidgetId,

                "type" : getTypeFromString(caption, "Relation"),
                "text" : getTextFromString(caption)
            }
        })
    };

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

function download(content, fileName) {
    var encodedUri = encodeURI(content);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link); // Required for FF

    link.click();
}