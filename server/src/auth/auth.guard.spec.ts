import { AuthSpotifyGuard } from './auth-spotify.guard';

describe('AuthGuard', () => {
  it('should be defined', () => {
    expect(new AuthSpotifyGuard()).toBeDefined();
  });
});
