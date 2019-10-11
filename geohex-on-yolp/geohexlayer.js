// GeoHex を表示するレイヤーです
class GeoHexLayer extends Y.Layer {

  constructor() {
    super();
    this.initializedLayer = false; // このレイヤー独自の初期化が終わっているか
  }

  // レイヤーを描画します
  // Y.Layer.drawLayer をオーバーライドしています
  drawLayer(force) {

    // レイヤーの初期化
    if (!this.initializedLayer) {
      this.initializedLayer = true; // レイヤー初期化済みフラグをONに
      this.hexLevel = 7; // Hex の大きさを表すレベル
      this.canvas = null; // 描画用 Canvas
      this.drawnItems = new Array(); // 描画済み GeoHex のリスト
      this.getMap().bind("move", this.onMove, this); // 地図移動時のイベントを捕捉する
    }

    // GeoHex 描画処理
    this.createCanvas();
    this.drawGeoHexList();
  }

  // 地図移動時に実行します
  onMove() {
    this.drawLayer();
  }

  // Canvas 要素を生成します
  createCanvas () {

    // すでに Canvas 要素が存在していたらクリアする
    if (this.canvas) {
      this.canvas.remove();
      this.drawnItems = new Array();
    }

    // Canvas 要素を生成
    let canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = 0;
    canvas.style.left = 0;

    // 地図を表示している要素を取得
    const container = this.getMapContainer();
    if (container && container[0]) {
      // Canvas 要素のサイズを地図表示している要素に合わせる
      canvas.width = container[0].offsetWidth;
      canvas.height = container[0].offsetHeight;
      // Canvas 要素を追加
      container[0].appendChild(canvas);
    }

    this.canvas = canvas;
  }

  // GeoHex を描画します
  drawGeoHexList() {

    // 地図の矩形領域を緯度経度座標で取得
    const bounds = this.getMap().getBounds(); // LatLngBounds
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // 矩形領域内の Hex リストを取得 ([{"x":x, "y":y}] 形式)
    const hexBuffer = true;
    const xyList = getXYListByRect(sw.lat(), sw.lng(), ne.lat(), ne.lng(), this.hexLevel, hexBuffer);

	// Hex をひとつずつ描画
    for(let xy of xyList) {
      const zone = GEOHEX.getZoneByXY(xy.x, xy.y, this.hexLevel);
      this.drawGeoHex(zone);
    }
  }

  // GeoHex を描画します
  // zone: Hex 領域1つを表すオブジェクト
  drawGeoHex (zone) {

    // 描画済みなら何もしない
    if (this.drawnItems.includes(zone)) {
      return;
    }

    // 六角形の緯度経度をピクセル座標に変換
    const pixels = this.coordsToPixels(zone.getHexCoords());

    // CanvasRenderingContext2D を用意
    const ctx = this.canvas.getContext("2d");
    ctx.strokeStyle = "black";

    // 六角形を描画
    this.storokeHexagon(ctx, pixels);

    // Code を描画 (本来なら配置位置や文字の大きさを動的に調整すべき)
    ctx.fillStyle = "white"; // 背景色
    ctx.fillRect(pixels[1].x + 5, pixels[1].y + 6, 100, 16);
    ctx.fillStyle = "black"; // 文字色
    ctx.font = "14px serif";
    ctx.fillText(zone.code, pixels[1].x + 10, pixels[1].y + 20);

    // 描画済みリストに追加
    this.drawnItems.push(zone);
  }

  // GeoHex 形式の緯度経度の配列をコンテナ座標の配列へ変換します
  // coords: GeoHex 形式の緯度経度オブジェクトの配列
  coordsToPixels(coords) {
    let pixels = new Array();
    for(let c of coords) {
      pixels.push(this.fromLatLngToContainerPixel(new Y.LatLng(c.lat, c.lon)));
    }
    return pixels;
  }

  // 六角形を描画します
  // ctx: CanvasRenderingContext2D オブジェクト
  // pixels: コンテナ座標の配列
  storokeHexagon(ctx, pixels) {
    ctx.moveTo(pixels[5].x, pixels[5].y);
    for(let p of pixels) {
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
};
