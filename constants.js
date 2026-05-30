const CANVAS_WIDTH  = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;

const PLAYER_SPEED   = 200;
const BULLET_SPEED   = 500;
const PLAYER_RADIUS  = 12;
const BULLET_RADIUS  = 4;
const BULLET_BOUNCES = 3;

const PLAYER_MAX_HEALTH = 100;
const PLAYER_COLOR      = '#e6c229';
const BULLET_COLOR      = '#ffffff';
const ENEMY_COLOR       = '#cc2222';
const WALL_COLOR        = '#1a5c1a';
const FLOOR_COLOR       = '#0d2b0d';
const BG_COLOR          = '#1a0a2e';

const ENEMY_BASE_SPEED   = 80;
const ENEMY_BASE_HEALTH  = 30;
const ENEMY_DETECT_RANGE = 180;
const ENEMY_SHOOT_RANGE  = 300;

const DIFFICULTY_SPEED_MULT  = 1.08;
const DIFFICULTY_HEALTH_MULT = 1.10;
const ENEMIES_PER_DEPTH      = 2;

const PLAYER_START_AMMO  = 30;
const AMMO_PACK_AMOUNT   = 15;
const BULLET_DAMAGE      = 10;
const GUARD_BULLET_DAMAGE = 15;

const SHIELD_DURATION    = 5;
const SPEED_DURATION     = 4;
const INVIS_DURATION     = 6;

const SHOP_AMMO_COST     = 20;
const SHOP_HEALTH_COST   = 30;
const SHOP_DAMAGE_COST   = 50;

const GUARD_SPEED        = 70;
const GUARD_DETECT_RANGE = 200;
const GUARD_SHOOT_RANGE  = 250;
const GUARD_SHOOT_COOLDOWN = 1.5;

const ROOM_PADDING       = 40;
const DOOR_WIDTH         = 50;
const CORRIDOR_WIDTH     = 80;