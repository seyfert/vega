var config = require('../../src/core/config'),
  jsdom = require('jsdom'),
  d3 = require('d3'),
  dl = require('datalib'),
  fs = require('fs'),
  path = require('path'),
  output = 'output/';

describe('Canvas', function() {
  require('d3-geo-projection')(d3);

  describe('Examples', function() {
    var files = examples(),
        skip  = {};

    files.forEach(function(file, idx) {
      var name = path.basename(file, '.json');
      if (skip[name]) {
        // skip, but mark as pending
        it('renders the ' + name + ' example');
      } else {
        it('renders the ' + name + ' example', function(done) {
          render(name, file, done);
        });
      }
    });
  });

  // Render the given spec using the headless canvas renderer
  function render(name, specFile, done) {
    fs.readFile(specFile, 'utf8', function(err, text) {
      if (err) throw err;
      var spec = JSON.parse(text);

      parseSpec(spec, function(error, viewFactory) {
        if (error) return done(error);
        
        var view = viewFactory({ renderer: 'canvas' }).update();
        view.canvasAsync(function(canvas) {
          var data = canvas.toDataURL();
          expect(data).to.not.be.undefined;

          writePNG(canvas, output+name+'.png');
          done();
        });
      });
    });
  }

  function writePNG(canvas, file) {
    if (!fs.existsSync(output)) return;
    var out = file ? fs.createWriteStream(file) : process.stdout;
    var stream = canvas.createPNGStream();
    stream.on('data', function(chunk) { out.write(chunk); });
  }
})
