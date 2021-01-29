export const FPS = 500;
export const FRICTION_DEFAULT = 1536;
export const PLAYER_ACCELERATION_DEFAULT = 4096;
export const PLAYER_ACCELERATION_SLOW = 1700;
export const PLAYER_MAX_SPEED = 128;
export const PLAYER_MAX_SPEED_SLOW = 48;
export const PLAYER_DASH_COOLDOWN = 1;
export const PLAYER_DASH_TIME = 0.25;
export const PLAYER_DASH_SPEED = 512;
export const PLAYER_FRICTION_ACC_FACTOR_MIN = 0.05;
export const PLAYER_FRAME_RATE = 8;
export const PLAYER_FRAME_DURATION = 1 / PLAYER_FRAME_RATE;
export const PLAYER_BASE_WIDTH = 16;
export const PLAYER_BASE_HEIGHT = 16;
export const PLAYER_TILE_COLLISION_WIDTH = 14;
export const PLAYER_TILE_COLLISION_HEIGHT = 8;
export const PLAYER_OBJECT_COLLISION_WIDTH = 9;
export const PLAYER_OBJECT_COLLISION_HEIGHT = 8;
export const COIN_FRAME_RATE = 8;
export const COIN_FRAME_DURATION = 1 / COIN_FRAME_RATE;

export const WINDOW_TILE_SIZE = 48;
export const TILE_SIZE = 16;

const desired_window_width = 1300;
const desired_window_height = 700;

export const WINDOW_WIDTH = WINDOW_TILE_SIZE * Math.floor(desired_window_width / WINDOW_TILE_SIZE);
export const WINDOW_HEIGHT = WINDOW_TILE_SIZE * Math.floor(desired_window_height / WINDOW_TILE_SIZE);