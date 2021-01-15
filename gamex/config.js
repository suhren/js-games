export const FPS = 120;
export const ASSET_DIR = './assets/'
export const TILESET_JSON_FILE = ASSET_DIR + 'tileset.json'
export const FRICTION_DEFAULT = 1000;
export const PLAYER_ACCELERATION_DEFAULT = 64;
export const PLAYER_MAX_SPEED = 128;

export const WINDOW_TILE_SIZE = 48;
export const TILE_SIZE = 16;

const desired_window_width = 1280;
const desired_window_height = 720;

export const WINDOW_WIDTH = WINDOW_TILE_SIZE * Math.floor(desired_window_width / WINDOW_TILE_SIZE);
export const WINDOW_HEIGHT = WINDOW_TILE_SIZE * Math.floor(desired_window_height / WINDOW_TILE_SIZE);