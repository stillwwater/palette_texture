/*!
 * Palette Texture Generator
 */

let resolution = 1024;

class Parser {
  constructor() {
    this.data = {};
  }

  parse(contents) {
    let ruleLabel = '';
    let ruleBuffer = [];

    let openRule = function (label) {
      ruleLabel = label;
      ruleBuffer = [];
    }

    for (let i = 0; i < contents.length; i++) {
      let ln = contents[i].trim();

      if (ln === '') {
        continue;
      }

      if (ln.endsWith('{')) {
        openRule(ln.split('{')[0]);
        continue;
      }

      if (ln === '}') {
        this.storeRule(ruleLabel, ruleBuffer);
        continue;
      }

      ruleBuffer.push(ln);
    }

    resolution = parseInt(this.extractValue(this.data['config'][0]));
  }

  storeRule(ruleLabel, ruleBuffer) {
    this.data[ruleLabel.trim()] = ruleBuffer;
  }

  extractValue(definition) {
    return definition.split(/[:p]/)[1];
  }

  loadFile() {
    let file = document.getElementById('src-file').files[0];
    let reader = new FileReader();
    let result = []

    reader.onload = function (e) {
      let editor = document.getElementById('content-editor');
      editor.value = e.target.result;
      document.getElementById('run').click();
    }

    reader.readAsText(file);
  }
}

class Renderer {
  constructor(colors) {
    this.colors = colors;
    this.clear();
  }

  render() {
    let nCells = this.colors.length;
    let output = document.getElementById('render');

    for (let i = 0; i < nCells; i++) {
      let token = this.colors[i];
      let cell = document.createElement('div');
      cell.setAttribute('class', 'cell');
      cell.setAttribute('style', token + 'width:'+(resolution / nCells)+'px;' + 'height:100%;');
      output.appendChild(cell);
    }
  }

  clear() {
    let container = document.getElementById('render');
    while (container.firstChild) {
        container.firstChild.remove();
    }
  }
}

let parser = new Parser();

document.getElementById('upload-file').onclick = function () {
  parser.loadFile();
}

document.getElementById('run').onclick = function () {
  parser.parse(document.getElementById('content-editor').value.split('\n'));
  document.getElementById('render').setAttribute('style', 'width:'+resolution+'px;' + 'height:'+resolution+'px;');
  let renderer = new Renderer(parser.data['default']);
  renderer.render()
}

document.getElementById('load-palette').onclick = function () {
  let name = document.getElementById('palette-name').value.trim();
  let renderer = new Renderer(parser.data[name]);
  renderer.render()
}

document.getElementById('save-image').onclick = function () {
  let name = document.getElementById('palette-name').value.trim();
  let container = document.getElementById('canvas-container');

  html2canvas(document.getElementById('render')).then(canvas => {
    container.appendChild(canvas);
    let a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = name;
    a.click();
  });
}
