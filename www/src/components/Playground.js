/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved */

import getOffset from 'dom-helpers/offset';
import PropTypes from 'prop-types';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import ReactDOM, { findDOMNode } from 'react-dom';
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live';
import * as ReactOverlays from 'react-overlays';
import Transition, {
  ENTERED,
  ENTERING,
} from 'react-transition-group/Transition';
import * as Babel from '@babel/standalone';
import { css as emotionCss } from '@emotion/core';
import emotionStyled from '@emotion/styled';
import injectCss from '../injectCss';

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
  css: emotionCss,
  styled: emotionStyled,
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
        transformCode={(code) =>
          Babel.transform(code, {
            presets: [
              [
                'env',
                {
                  loose: true,
                  targets: {
                    browsers: ['> 1%', 'not ie <= 10'],
                  },
                },
              ],
              'react',
            ],
            plugins: [['class-properties', { loose: true }]],
          }).code
        }
      >
        <LivePreview className="border rounded p-5 mb-2" />
        <LiveError />
        <div className="bg-grey px-5 py-4 bg-light mb-4">
          <LiveEditor />
        </div>
      </LiveProvider>
    );
  }
}
