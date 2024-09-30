import { LoggerPipe } from './logger.pipe';

describe('LoggerPipe', () => {
  it('create an instance', () => {
    const pipe = new LoggerPipe();
    expect(pipe).toBeTruthy();
  });
});
