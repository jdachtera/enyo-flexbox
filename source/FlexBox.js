enyo.kind({
  name: "FlexBoxLayout",
  kind: "Layout",
  layoutClass: "flexBox",

  statics: {
    vendors: ['-khtml-', '-moz-', '-webkit-', '-o-', '-ms-', ''],

    prefix: '',

    mode: 'emulate',

    detected: false,

    //* @protected
    _ieCssToPixelValue: function(inNode, inValue) {
      var v = inValue;
      // From the awesome hack by Dean Edwards
      // http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291
      var s = inNode.style;
      // store style and runtime style values
      var l = s.left;
      var rl = inNode.runtimeStyle && inNode.runtimeStyle.left;
      // then put current style in runtime style.
      if (rl) {
        inNode.runtimeStyle.left = inNode.currentStyle.left;
      }
      // apply given value and measure its pixel value
      s.left = v;
      v = s.pixelLeft;
      // finally restore previous state
      s.left = l;
      if (rl) {
        s.runtimeStyle.left = rl;
      }
      return v;
    },
    _pxMatch: /px/i,

    _cssPropertyToCamelCase: function(name) {
      var output = '',
        ch = '',
        k;
      for (k = 0; k < name.length; k++) {
        ch = name.substr(k, 1);
        if (ch === '-') {
          k++;
          ch = name.substr(k, 1).toUpperCase();
        }
        output += ch;
      }

      return output;
    },

    _getStyle: function(control, style) {
      var s = control.getComputedStyleValue(style, '0px');
      if (s) {
        return parseFloat((s).split('px')[0]);
      }
      if (control.node && control.node.currentStyle) {
        var cCStyle = this._cssPropertyToCamelCase(style);
        var v = control.node.currentStyle[cCStyle];
        if (v) {
          if (!v.match(this._pxMatch)) {

            v = this._ieCssToPixelValue(control.node, v);
          }
          return parseFloat(v.toString().split('px')[0]);
        }
      }
      return 0;
    },

    _getSize: function(control, orientation) {
      return control.hasNode() ? control.node[orientation === 'vertical' ? 'offsetHeight' : 'offsetWidth'] : 0;
    },
    _getPadding: function(control, orientation) {
      return this._getStyle(control, orientation === 'vertical' ? 'padding-top' : 'padding-right') + this._getStyle(control, orientation === 'vertical' ? 'padding-bottom' : 'padding-left');
    },
    _getMargin: function(control, orientation) {
      return this._getStyle(control, orientation === 'vertical' ? 'margin-top' : 'margin-right') + this._getStyle(control, orientation === 'vertical' ? 'margin-bottom' : 'margin-left');
    },
    _detect: function() {
      var test = document.createElement('div');
      enyo.forEach(this.vendors, function(prefix) {
        test.setAttribute('style', 'display:' + prefix + 'box');
        if (~ (test.style.display).indexOf("box")) {
          this.mode = 'box';
          this.prefix = prefix;
        }

        test.setAttribute('style', 'display:' + prefix + 'flex');
        if (~ (test.style.display).indexOf("flex")) {
          this.mode = 'flex';
          this.prefix = prefix;
        }
      }, this);
      this.detected = true;
    }


  },

  flow: function() {
    this.orientation = this.container.orientation || 'horizontal';
    this.oppositeOrientation = this.orientation === 'vertical' ? 'horizontal' : 'vertical';
    this.align = this.container.align || 'stretch';
    this.pack = this.container.pack || 'center';

    this.available = 0;
    this.flexNodes = 0;

    if (!this.ctor.detected) {
      this.ctor._detect();
    }


    if (this.ctor.mode === 'emulate') {
      this.container.addClass('emulate');

    } else {
      this.container.addRemoveClass('orientation-vertical', this.container.orientation === 'vertical');
      this.container.addRemoveClass('align-start', this.container.align === 'start');
      this.container.addRemoveClass('align-center', this.container.align === 'center');
      this.container.addRemoveClass('align-end', this.container.align === 'end');
      this.container.addRemoveClass('pack-justify', this.container.pack === 'justify');
      this.container.addRemoveClass('pack-center', this.container.pack === 'center');
      this.container.addRemoveClass('pack-end', this.container.pack === 'end');

      enyo.forEach(this.container.children, function(child) {
        var flex = child.flex || 0;

        if (this.ctor.mode === 'box') {
          if (flex > 0) {
            child.applyStyle(this.orientation === 'vertical' ? 'height' : 'width', '0px');
          }
          child.applyStyle(this.ctor.prefix + 'box-flex', flex);

        } else if (this.ctor.mode === 'flex') {
          child.applyStyle(this.ctor.prefix + 'flex', flex ? flex + ' 0 0px' : 'none');
        }


      }, this);

    }
    enyo.asyncMethod(this, 'reflow');
  },

  reflow: function() {
    if (this.ctor.mode === 'emulate') {

      this._emulate();
    } else {
      if (this.ctor.prefix === '-moz-' && this.ctor.mode === 'box') {
        if (!this.initialMargins) {
          this._collectInitialMargins();

        }
        this._resetMargins();
        this._collectBoxInformation();

        this._emulatePack();
      }

    }

  },



  _emulate: function() {
    var nodesReady = this.container.hasNode();
    enyo.forEach(this.container.children, function(child) {
      nodesReady = nodesReady && child.hasNode();
    }, this);

    if (!nodesReady) {
      return enyo.asyncMethod(this, '_emulate');
    }

    this.container.applyStyle(this.orientation === 'horizontal' ? 'width' : 'height', null);

    // Gather margins
    if (!this.initialMargins) {
      this._collectInitialMargins();
    }

    this._collectBoxInformation();
    this._resetMargins();
    this._updateNodes();

    this._emulateAlign();
    this._emulatePack();

    this.container.applyStyle(this.orientation === 'horizontal' ? 'width' : 'height', '200%');


  },

  _updateNodes: function() {
    // Set size of flexing elements
    enyo.forEach(this.container.children, function(child, key) {
      if (child.flex) {
        child.applyStyle(this.orientation === 'vertical' ? 'height' : 'width', (this.available / this.flexCount * child.flex) + 'px');
      }
    }, this);
  },

  _collectBoxInformation: function() {
    // Gather size and flex information
    this.available = this.ctor._getSize(this.container, this.orientation) - this.ctor._getPadding(this.container, this.orientation);
    this.flexCount = 0;

    enyo.forEach(this.container.children, function(child, key) {
      this.available -= this.orientation === 'horizontal' ? this.initialMargins[key][1] + this.initialMargins[key][3] : this.initialMargins[key][0] + this.initialMargins[key][2];

      var flex = parseInt(child.flex || 0, 10);
      if (isNaN(flex) || flex < 1) {

        this.available -= this.ctor._getSize(child, this.orientation);
      } else {
        this.flexCount += flex;
      }
    }, this);
  },

  _collectInitialMargins: function() {
    this.initialMargins = enyo.map(this.container.children, function(child) {
      return enyo.map(['top', 'left', 'bottom', 'right'], function(dir) {
        return this.ctor._getStyle(child, 'margin-' + dir);
      }, this);
    }, this);
  },

  _resetMargins: function() {
    // Reset Margins
    enyo.forEach(this.container.children, function(child, key) {
      enyo.forEach(['top', 'left', 'bottom', 'right'], function(dir, k) {
        child.applyStyle('margin-' + dir, this.initialMargins[key][k] + 'px');
      }, this);

    }, this);
  },

  _emulateAlign: function() {
    // Simulate align
    var alignSize = this.ctor._getSize(this.container, this.oppositeOrientation) - this.ctor._getPadding(this.container, this.oppositeOrientation);

    enyo.forEach(this.container.children, function(child) {
      var size = this.ctor._getSize(child, this.oppositeOrientation);
      if (size > alignSize) {
        child.applyStyle(
        this.oppositeOrientation === 'vertical' ? 'height' : 'width',
        alignSize + 'px');
      }

    }, this);

    if (this.align === 'stretch') {
      enyo.forEach(this.container.children, function(child) {
        child.applyStyle(
        this.oppositeOrientation === 'vertical' ? 'height' : 'width', (alignSize - this.ctor._getMargin(child, this.oppositeOrientation)) + 'px');
      }, this);
    } else if (this.align === 'center') {
      enyo.forEach(this.container.children, function(child) {
        child.applyStyle(
        this.orientation === 'vertical' ? 'margin-left' : 'margin-top', (alignSize - this.ctor._getSize(child, this.oppositeOrientation)) / 2 + 'px');
      }, this);

    } else if (this.align === 'end') {
      enyo.forEach(this.container.children, function(child) {
        child.applyStyle(
        this.orientation === 'vertical' ? 'margin-left' : 'margin-top', (alignSize - this.ctor._getSize(child, this.oppositeOrientation)) + 'px');
      }, this);
    }
  },

  _emulatePack: function() {
    // Simulate pack
    if (this.flexCount === 0 && this.container.children.length) {
      if (this.pack === 'center') {
        this.container.children[0].applyStyle(
        this.orientation === 'horizontal' ? 'margin-left' : 'margin-top',
        this.available / 2 + 'px');

      } else if (this.pack === 'end') {
        this.container.children[0].applyStyle(
        this.orientation === 'horizontal' ? 'margin-left' : 'margin-top',
        this.available + 'px');
      } else if (this.pack === 'justify') {

        enyo.forEach(this.container.children.slice(1), function(child, key) {
          this.available += this.initialMargins[key + 1][this.orientation === 'vertical' ? 0 : 1];
        }, this);
        enyo.forEach(this.container.children.slice(0, this.container.children.length - 1), function(child, key) {
          this.available += this.initialMargins[key][this.orientation === 'vertical' ? 2 : 3];
          child.applyStyle(this.orientation === 'horizontal' ? 'margin-right' : 'margin-bottom', '0px');
        }, this);
        enyo.forEach(this.container.children.slice(1), function(child) {
          child.applyStyle(
          this.orientation === 'horizontal' ? 'margin-left' : 'margin-top', (this.available / (this.container.children.length - 1)) + 'px');
        }, this);
      }
    }
  }


});

enyo.kind({
  name: "HFlexBox",
  layoutKind: "FlexBoxLayout"
});

enyo.kind({
  name: "VFlexBox",
  layoutKind: "FlexBoxLayout",
  orientation: "vertical"
});
