function updateAndDrawFish() {
  for (let i = fishArray.length - 1; i >= 0; i--) {
    if (fishArray[i] && fishArray[i].isAlive()) {
      fishArray[i].update(fishArray);
      fishArray[i].display();
    }
    if (!fishArray[i].alive) {
      fishArray.splice(i, 1);
    }
  }
}