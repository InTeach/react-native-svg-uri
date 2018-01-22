'use strict';
import React, { Component, PropTypes } from 'react';
import { View } from 'react-native';
import xmldom from 'xmldom'; // Dependencie
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

import Svg, {
  Circle,
  Ellipse,
  G,
  LinearGradient,
  RadialGradient,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Symbol,
  Use,
  Defs,
  Stop
} from 'react-native-svg';

import _ from 'lodash';
// Attributes that only change his name
const ATTS_TRANSFORMED_NAMES = {
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-linecap': 'strokeLinecap',
  'stroke-width': 'strokeWidth'
  //  'stroke-miterlimit':'strokeMiterlimit',
};

let ind = 1;

const FETCHED_SVG = [];
export default class SvgImage extends Component {
  constructor(props) {
    super(props);

    this.state = { svgXmlData: null, svg: null };
    let responseXML;
    let isComponentMounted = false;
  }
  componentWillMount() {
    const hash = JSON.stringify(this.props);
    if (this.props.source) {
      const source = resolveAssetSource(this.props.source) || {};
      if (FETCHED_SVG[hash]) {
        this.setState({ svg: FETCHED_SVG[hash] });
      } else {
        this.testFetch(source.uri).then(svgXmlData => {
          let svg = this.createSVG(svgXmlData);
          FETCHED_SVG[hash] = svg;
          this.setState({ svg });
        });
      }
    } else {
      if (this.props.data) {
        if (FETCHED_SVG[hash]) {
          this.setState({ svg: FETCHED_SVG[hash] });
        } else {
          let svg = this.createSVG(this.props.data);
          FETCHED_SVG[hash] = svg;
          this.setState({ svg });
        }
      }
    }
    this.isComponentMounted = true;
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }
  createSVG(svgXmlData, nextFill = '') {
    let inputSVG = svgXmlData.substring(
      svgXmlData.indexOf('<svg '),
      svgXmlData.indexOf('</svg>') + 6
    );
    let doc = new xmldom.DOMParser().parseFromString(inputSVG);
    let rootSVG = this.inspectNode(doc.childNodes[0], nextFill);
    return rootSVG;
  }
  testFetch(uri) {
    return fetch(uri).then(response => {
      return response.text().then(result => {
        return result;
      });
    });
  }
  fecthSVGData = async uri => {
    try {
      let response = await fetch(uri);
      let responseXML = await response.text();
      this.responseXML = responseXML;
      return responseXML;
    } catch (error) {
      console.error(error);
    } finally {
      //if (this.isComponentMounted) {
      //FETCHED_SVG[uri] = this.responseXML
      //this.setState({svgXmlData:this.responseXML});
      return this.responseXML;
      //}
    }
  };

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps, this.props)) {
      const hash = JSON.stringify(nextProps);
      if (nextProps.source) {
        const source = resolveAssetSource(nextProps.source) || {};
        if (FETCHED_SVG[hash]) {
          this.setState({ svg: FETCHED_SVG[hash] });
        } else {
          this.testFetch(source.uri).then(svgXmlData => {
            let svg = this.createSVG(svgXmlData);
            FETCHED_SVG[hash] = svg;
            this.setState({ svg });
          });
        }
      } else {
        if (FETCHED_SVG[hash]) {
          this.setState({ svg: FETCHED_SVG[hash] });
        } else {
          let svg = this.createSVG(nextProps.data, nextProps.fill);
          FETCHED_SVG[hash] = svg;
          this.setState({ svg });
        }
      }
    }
  }

  createSVGElement = (node, childs, nextFill = '') => {
    let componentAtts = {};
    let i = ind++;
    switch (node.nodeName) {
      case 'svg':
        componentAtts = this._getAttributes(node, nextFill);
        if (this.props.width) {componentAtts.width = this.props.width;}
        if (this.props.height) {componentAtts.height = this.props.height;}
        return (
          <Svg key={i} {...componentAtts}>
            {childs}
          </Svg>
        );
      case 'g':
        componentAtts = this._getAttributes(node, nextFill);
        return (
          <G key={i} {...componentAtts}>
            {childs}
          </G>
        );
      case 'path':
        componentAtts = this._getAttributes(node, nextFill);
        return (
          <Path key={i} {...componentAtts}>
            {childs}
          </Path>
        );
      case 'circle':
        componentAtts = this._getAttributes(node, nextFill);
        return (
          <Circle key={i} {...componentAtts}>
            {childs}
          </Circle>
        );
      case 'rect':
        componentAtts = this._getAttributes(node, nextFill);
        return (
          <Rect key={i} {...componentAtts}>
            {childs}
          </Rect>
        );
      case 'linearGradient':
        componentAtts = this._getAttributes(node, nextFill);
        return (
          <Defs key={i}>
            <LinearGradient {...componentAtts}>{childs}</LinearGradient>
          </Defs>
        );
      case 'radialGradient':
        componentAtts = this._getAttributes(node, nextFill);
        return (
          <Defs key={i}>
            <RadialGradient {...componentAtts}>{childs}</RadialGradient>
          </Defs>
        );
      case 'stop':
        componentAtts = this._getAttributes(node, nextFill);
        return (
          <Stop key={i} {...componentAtts}>
            {childs}
          </Stop>
        );
      case 'polygon':
        componentAtts = this._getAttributes(node, nextFill);
        return (
          <Polygon key={i} {...componentAtts}>
            {childs}
          </Polygon>
        );
      case 'ellipse':
        componentAtts = this._getAttributes(node, nextFill);
        return (
          <Ellipse key={i} {...componentAtts}>
            {childs}
          </Ellipse>
        );
      default:
        return null;
        break;
    }
  };

  _getAttributes = (node, nextFill = '') => {
    let attrs = {};
    for (let i = 0; i < node.attributes.length; i++) {
      let att = node.attributes[i];
      let attName = att.nodeName;
      let attValue = att.nodeValue;
      if (attName in ATTS_TRANSFORMED_NAMES) {
        // Valida que el atributo sea mapeable
        attrs[att.nodeName] = att.nodeValue;
      } else {
        if (
          attName == 'x' ||
          attName == 'y' ||
          attName == 'height' ||
          attName == 'width'
        ) {
          attValue = attValue.replace('px', ''); // Remove the px
        }
        if (attName == 'style') {
          let styleAtts = attValue.split(';');
          for (let i = 0; i < styleAtts.length; i++) {
            let styleAtt = styleAtts[i].split(':');
            if (!styleAtt[1] || styleAtt[1] == '') {continue;}
            if (styleAtt[0] == 'stop-color') {attrs.stopColor = styleAtt[1];}
            else {attrs[styleAtt[0]] = styleAtt[1];}
          }
        } else {
                attrs[attName] = attValue;
        }
      }
    }
    if (nextFill !== '') {
      attrs = Object.assign({}, attrs, { fill: nextFill });
    } else {
      if (this.props.fill) {
        attrs = Object.assign({}, attrs, { fill: this.props.fill });
      }
    }

    return attrs;
  };

  inspectNode = (node, nextFill = '') => {
    //Process the xml node
    let arrayElements = [];
    if (node.childNodes && node.childNodes.length > 0) {
      for (let i = 0; i < node.childNodes.length; i++) {
        let nodo = this.inspectNode(node.childNodes[i], nextFill);
        if (nodo != null) {arrayElements.push(nodo);}
      }
    }
    let element = this.createSVGElement(node, arrayElements, nextFill);
    return element;
  };
  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }
  render() {
    try {
      if (this.state.svg == null) {return null;}
      return (
        <View
          style={this.props.style}
          ref={component => (this._root = component)}
        >
          {this.state.svg}
        </View>
      );
    } catch (e) {
      console.error('ERROR SVG', e);
      return null;
    }
  }
}
