miro.onReady(() => {
    miro.initialize({
      extensionPoints: {
        bottomBar: {
          title: 'Some title',
          svgIcon: '<circle cx="12" cy="12" r="9" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2"/>',
          onClick: () => {
            miro.board.selection.get().then((s) => {
                let nodes = s.filter(item => item.type === "SHAPE").map(shape => [shape.id, shape.plainText]);
                
                let nodesCsv = "data:text/csv;charset=utf-8," + "id,plainText\n" + nodes.map(e => e.join(",")).join("\n");
                download(nodesCsv, "nodes.csv")

                let edges = s.filter(item => item.type === "LINE").map(line => [line.id, line.startWidgetId, line.endWidgetId, line.captions.length > 0 ? line.captions[0].text : ""]);
                let edgesCsv = "data:text/csv;charset=utf-8," + "id,startWidgetId,endWindgetId,caption\n" + edges.map(e => e.join(",")).join("\n");
                download(edgesCsv, "edges.csv")
            })
          }
        }
      }
    })
  })

  function download(csvContent, fileName){
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link); // Required for FF
    
    link.click();
  }
  /*


nodes columns:
  id : string
  plainText : string

edges columns
  id : string

  */