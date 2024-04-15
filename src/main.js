//2. Tworzymy main.js

import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

//a. pozwala nam załadować spritesheet jako obraz
k.loadSprite("spritesheet1", "./Interiors_16x16.png", {
  sliceX: 16, //czyli przycinanie obrazu na odpowiednie frame
  sliceY: 1064,
});

k.loadSprite("spritesheet2", "./Room_Builder_16x16.png", {
  sliceX: 76,
  sliceY: 109,
});

k.loadSprite("premadeCharakter", "./Premade_Character_06.png", {
  sliceX: 56,
  sliceY: 20.5,
  anims: {
    "idle-down": { from: 74, to: 79, loop: true, speed: 9 },
    "walk-down": { from: 130, to: 135, loop: true, speed: 9 },
    "idle-side": { from: 56, to: 61, loop: true, speed: 9 },
    "walk-side": { from: 112, to: 117, loop: true, speed: 9 },
    "idle-up": { from: 62, to: 67, loop: true, speed: 9 },
    "walk-up": { from: 118, to: 123, loop: true, speed: 9 },
  },
});

k.loadSprite("map", "./map.png");

//b. uzupełniamy tło możemy tu już odpalić run dev
k.setBackground(k.Color.fromHex("#311047"));

//d. tworzenie sceny, tutaj wchodzi funkcja ktora bedzie chodzic asynchronicznie ponieważ
// użyjemy tzw. fetch call do naszej map.json data
// dodajemy default czyli k.go("main");
k.scene("main", async () => {
  const mapData = await (await fetch("./map.json")).json();
  const layers = mapData.layers;

  // first game object, który może być wszystkim gracz, props etc.
  // to object co posiada różne komponenty, te komponenty to np. pozycje, aeria, body albo sprite
  // I sposób w jaki Kaboom działa, to jak załadujemy array componentów, możemy ustalać zachowania objektów. Czyli taki system elementów składowych jednostki.
  // Istnieją dwa sposoby tworzenia objektów gry: zapomocą add i make funkcji.
  //Make pozwala stworzyć objekt ale go nie wyświetla, Add dodaje do sceny np. k.add(make())
  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  //f. kolejny objekt który tworzymy to gracz
  const player = k.make([
    // ładujemy spritesheeta z animacją defaultową
    k.sprite("premadeCharakter", { anim: "idle-down" }),
    // definiowanie hitboxa gracza, za pomocą wektorów 0,10 i definiujemy wys i szer 10, 20.
    k.area({
      shape: new k.Rect(k.vec2(0, 10), 10, 10),
    }),
    // czyli kolidowanie z innymi objektami na scenie k.body automatycznie przez kaboom
    k.body(),
    // kotwica aby rysował na objekcie na środku niż od góry z lewej, ponieważ sprite w jaki sposób są renderowane to wg. wektorów 0,0 które znajdują się na górze po lewej i tam startują
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
      //w kaboom js możemy bezpośrednio manipulować właściwościami i nie pozyskiwać ich z innych źródeł
      speed: 300,
      // kierunek czyli przy defaulcie ma byc down
      direction: "down",
      //jesli gracz jest w dialogu to nie może się ruszać czyli false
      isInDialogue: false,
    },
    // ostatnie to tag playera zapobierac innych kolizji
    "player",
  ]);
  // g. logika do tworzenia ograniczen
  // czyli for loop który ma iterować po naszych layers
  for (const layer of layers) {
    if (layer.name === "Ograniczenia") {
      for (const Ograniczenia of layer.objects) {
        // dodajemy kolejny game objekt
        map.add([
          //copy paste
          k.area({
            shape: new k.Rect(
              k.vec2(0),
              Ograniczenia.width,
              Ograniczenia.height
            ),
          }),
          //ważne dodajemy body tag aby dać właściwość statyczności true, czyli tworzy tzw bariere aby gracz nie mógł przekroczyć tego objektu i w ten sposob stworzylismy sciany bariere w kaboom js
          k.body({ isStatic: true }),
          k.pos(Ograniczenia.x, Ograniczenia.y),
          //i potrzebujemy znac nazwe obraniczenia ktore jest objektem aby pozniej sie do niego odwolac i uzupelnic kontent
          Ograniczenia.name,
        ]);
        // logika na kolidowanie gracza z objektem
        if (Ograniczenia.name) {
          player.onCollide(Ograniczenia.name, () => {
            player.isInDialogue = true;

            // Wyświetlamy dialog TODO
            displayDialogue(
              dialogueData[Ograniczenia.name],
              () => (player.isInDialogue = false)
            );
          });
        }
      }
      continue;
    }
    // Jeśli layer czyli połać jest Spawn to przypisz gracza do wektorów i skali lub na odwrót
    if (layer.name === "Spawn") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
          continue;
        }
      }
    }
  }

  setCamScale(k);
  // wywoływanie skalowania 1.
  k.onResize(() => {
    setCamScale(k);
  });

  // ustawiamy kolejny objekt aby kamera podążała na podstawie gracza czyli się wg. niego ukierunkowywała
  k.onUpdate(() => {
    k.camPos(player.worldPos().x, player.worldPos().y - 100);
  });

  // k. logika na poruszanie graczem
  k.onMouseDown((mouseBtn) => {
    // jesli mouseBtn nie jest wciśnięty lewy i albo gracz nie jest w dialogu to zwroć nić
    if (mouseBtn !== "left" || player.isInDialogue) return;

    // poruszanie się copy paste
    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    // animacja, w zależności o kąta kierunku myszki do gracza
    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    // animacja w góre
    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }
    // animacja w dół
    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }
    // animcja w bok
    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }
    // animacja w bok
    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }
  });

  // zatrzymujemy animacje jeśli nie jest wciśnięty przycisk, przywracamy do stanu default
  function stopAnims() {
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }

    player.play("idle-side");
  }

  k.onMouseRelease(stopAnims);

  k.onKeyRelease(() => {
    stopAnims();
  });
  k.onKeyDown((key) => {
    const keyMap = [
      k.isKeyDown("right"),
      k.isKeyDown("left"),
      k.isKeyDown("up"),
      k.isKeyDown("down"),
    ];

    let nbOfKeyPressed = 0;
    for (const key of keyMap) {
      if (key) {
        nbOfKeyPressed++;
      }
    }

    if (nbOfKeyPressed > 1) return;

    if (player.isInDialogue) return;
    if (keyMap[0]) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      player.move(player.speed, 0);
      return;
    }

    if (keyMap[1]) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      player.move(-player.speed, 0);
      return;
    }

    if (keyMap[2]) {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
      player.move(0, -player.speed);
      return;
    }

    if (keyMap[3]) {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
      player.move(0, player.speed);
    }
  });
});

k.go("main");
