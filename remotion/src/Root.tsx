import {Composition} from 'remotion';
import {Edit1019, TOTAL_FRAMES} from './Edit1019';
import {FPS, H, W} from './theme';

export const Root = () => (
  <Composition id="Edit1019" component={Edit1019} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
);
