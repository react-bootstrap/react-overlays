import React from 'react';
import PropTypes from 'prop-types';
import { useState, useReducer, useRef, useEffect } from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import Transition, {
  ENTERED,
  ENTERING,
} from 'react-transition-group/Transition';
import * as Babel from '@babel/standalone';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import * as ReactOverlays from 'react-overlays';

import getOffset from 'dom-helpers/query/offset';

import injectCss from '../injectCss';
import { css } from '@emotion/core';
import styled from '@emotion/styled';

Babel.registerPreset('env', require('@babel/preset-env'));
Babel.registerPlugin(
  'class-properties',
  require('@babel/plugin-proposal-class-properties'),
);

const scope = {
  useState,
  useReducer,
  useRef,
  useEffect,

  ReactDOM,
  findDOMNode,
  injectCss,
  ...ReactOverlays,
  getOffset,
  Transition,
  ENTERED,
  ENTERING,
  css,
  styled,
};

export default class Playground extends React.Component {
  static propTypes = {
    codeText: PropTypes.string,
  };

  render() {
    return (
      <LiveProvider
        scope={scope}
        mountStylesheet={false}
        code={this.props.codeText}
        noInline={this.props.codeText.includes('render(')}
        transformCode={code => {
          return Babel.transform(code, {
            presets: [
              [
                'env',
                {
                  loose: true,
                  targets: {
                    browsers: ['> 1%', 'not ie <= 8'],
                  },
                },
              ],
              'react',
            ],
            plugins: [['class-properties', { loose: true }]],
          }).code;
        }}
      >
        <LivePreview />
        <LiveError />
        <LiveEditor />
      </LiveProvider>
    );
  }
}
