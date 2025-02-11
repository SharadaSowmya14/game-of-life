enum DOTS_STYLE {
  WIDTH = 16,
  HEIGHT = 16,
  MARGIN = 2,
  DEAD_COLOR = '#F2F2F7',
  SURVIVE_COLOR = '#1C1C1E',
}

const BACKGROUND_COLOR = '#AEAEB2';

const Util = {
  getCoordinateX(x: number) {
    return (DOTS_STYLE.MARGIN + DOTS_STYLE.WIDTH) * x + DOTS_STYLE.MARGIN;
  },
  getCoordinateY(y: number) {
    return (DOTS_STYLE.MARGIN + DOTS_STYLE.HEIGHT) * y + DOTS_STYLE.MARGIN;
  },
};

export class GameOfLifeEngine {
  public life: Life[][];
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  private readonly x: number;
  private readonly y: number;
  private intervalKey: null | number;

  constructor(life: Life[][]) {
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');
    const x = life
      .map((children) => children.length)
      .reduce((prev, next) => Math.min(prev, next))
    ;
    const y = life.length;

    if (ctx) {
      cvs.width = Util.getCoordinateX(x);
      cvs.height = Util.getCoordinateY(y);

      this.x = x;
      this.y = y;
      this.life = life;
      this.canvas = cvs;
      this.context = ctx;
    } else {
      throw 'Failed to create context';
    }
  }

  public clear() {
    this.context.fillStyle = BACKGROUND_COLOR;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public startLife() {
    if (!this.intervalKey) {
      this.intervalKey = window.setInterval(() => {
        this.drawDots();
        const life = this.life;
        this.life = life.map((children, i) => (
          children.map((isSurvive, j) => (
            this.isSurviveNextGeneration(j, i, isSurvive)
          ))
        ));
      }, 500);
    }
  }

  public stopLife() {
    if (this.intervalKey !== null) {
      clearInterval(this.intervalKey);
      this.intervalKey = null;
    }
  }

  protected drawDot(x: number, y: number) {
    this.context.fillRect(
      Util.getCoordinateX(x),
      Util.getCoordinateY(y),
      DOTS_STYLE.WIDTH,
      DOTS_STYLE.HEIGHT,
    );
  }

  protected drawDots() {
    this.clear();
    this.life.forEach((children, i) => {
      children.forEach((isSurvive, j) => {
        this.context.fillStyle = isSurvive ? DOTS_STYLE.SURVIVE_COLOR : DOTS_STYLE.DEAD_COLOR;
        this.drawDot(j, i);
      });
    });
  }

  protected isSurviveNextGeneration(x: number, y: number, isSurvive: Life) {
    const life = this.life;
    const edgeX = this.x - 1;
    const edgeY = this.y - 1;
    const count = (
      Number(0 < y && 0 < x && life[y - 1][x - 1])
      + Number(0 < y && life[y - 1][x])
      + Number(0 < y && x < edgeX && life[y - 1][x + 1])
      + Number(0 < x && life[y][x - 1])
      + Number(x < edgeX && life[y][x + 1])
      + Number(y < edgeY && 0 < x && life[y + 1][x - 1])
      + Number(y < edgeY && life[y + 1][x])
      + Number(y < edgeY && x < edgeX && life[y + 1][x + 1])
    );
    return (isSurvive && (count === 2 || count === 3)) || (!isSurvive && count === 3) ? 1 : 0;
  }
}
