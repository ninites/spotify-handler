import { SpotifyErrorInterceptor } from './spotify-error.interceptor';

describe('SpotifyErrorInterceptor', () => {
  it('should be defined', () => {
    expect(new SpotifyErrorInterceptor()).toBeDefined();
  });
});
