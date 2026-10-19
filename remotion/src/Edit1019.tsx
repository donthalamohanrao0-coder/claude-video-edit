import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile} from 'remotion';
import {Camera} from './components/Camera';
import {Captions} from './components/Captions';
import {Overlays} from './components/Overlays';
import cues from './data/cues.json';
import {FPS} from './theme';

export const TOTAL_FRAMES = Math.round(cues.total * FPS);

const FONTS: [string, string][] = [
  ['500', 'poppins-latin-500-normal.woff2'],
  ['700', 'poppins-latin-700-normal.woff2'],
  ['800', 'poppins-latin-800-normal.woff2'],
  ['900', 'poppins-latin-900-normal.woff2'],
];

const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(
      FONTS.map(([weight, file]) =>
        new FontFace('PoppinsX', `url(${staticFile(`fonts/${file}`)})`, {weight}).load().then((f) => document.fonts.add(f)),
      ),
    ).then(() => continueRender(handle));
  }, [handle]);
};

export const Edit1019: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill>
      <Camera />
      <Overlays />
      <Captions />
    </AbsoluteFill>
  );
};
