//4. I tu ustawiamy Kaboom
import kaboom from "kaboom";

// Tworzymy kaboom kontekst który ma być jednolity
// Za pomocą stałej k będziemy ustawiali wszystkie opcje w naszym projekcie, również
// aby stała k nie była globalna aby funkcje zewnętrzne nie miały wpływu na naszą stałą.
export const k = kaboom({
  global: false,
  touchToMouse: true, //tlumacze wszystkie klikniecia w ewenty
  canvas: document.getElementById("game"),
});
