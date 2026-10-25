import {Composition} from 'remotion';
import {Promo} from './Promo';
import {FPS, TOTAL} from './config';

export const Root = () => (
  <Composition id="Promo" component={Promo} width={1080} height={1920} fps={FPS} durationInFrames={TOTAL} />
);
