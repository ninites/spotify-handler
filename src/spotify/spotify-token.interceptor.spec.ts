import { SpotifyTokenInterceptor } from './spotify-token.interceptor';

describe('SpotifyTokenInterceptor', () => {
  it('should be defined', () => {
    expect(new SpotifyTokenInterceptor()).toBeDefined();
  });
});
