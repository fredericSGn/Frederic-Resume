//6. Bedzie posiadać kilka funkcji aby wszystko grało.

//h. funkcja na displayDialogue, parametr 1 to text i 2 paramet onDisplayEnd
export function displayDialogue(text, onDisplayEnd) {
  const dialogueUI = document.getElementById("textbox-container");
  const dialogue = document.getElementById("dialogue");
  // block służy aby textbox-container był widoczny, ponieważ jego właściwość w defaulcie jest invisible
  dialogueUI.style.display = "block";

  // implementujemy scrolowanie tekstu za pomocą podstawowego jsa
  let index = 0;
  let currentText = "";
  const intervalRef = setInterval(() => {
    if (index < text.length) {
      currentText += text[index];
      // innerHTML jako linki do stron
      dialogue.innerHTML = currentText;
      index++;
      return;
    }

    clearInterval(intervalRef);
  }, 1);

  // logika close buttona
  const closeBtn = document.getElementById("close");

  function onCloseBtnClick() {
    onDisplayEnd();
    dialogueUI.style.display = "none";
    dialogue.innerHTML = "";
    clearInterval(intervalRef);
    // nastepnie usuwamy funkcje wewnątrz funkcji czyli działa rekursywnie
    closeBtn.removeEventListener("click", onCloseBtnClick);
  }
  //Tutaj dodajemy Event Listener w chwili kiedy jest click
  closeBtn.addEventListener("click", onCloseBtnClick);
  // dodajemy close event listenera za pomoca przaycisku
  addEventListener("keypress", (key) => {
    if (key.code === "Enter") {
      closeBtn.click();
    }
  });
}

//j. logika na scalowanie responsywność gry
export function setCamScale(k) {
  const resizeFactor = k.width() / k.height();
  if (resizeFactor < 1) {
    k.camScale(k.vec2(1));
  } else {
    k.camScale(k.vec2(1.5));
  }
}
