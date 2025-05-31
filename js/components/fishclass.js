class Fish {
  constructor(x, y, traits = {}) {
    this.x = x;
    this.y = y;
    this.speed = traits.speed;
    this.finSize = traits.finSize;
    this.size = traits.size;
    this.color = traits.color;
    this.aggression = traits.aggression; // Fixed spelling to match usage
    this.lifespan = traits.lifespan;  // How long without eating before death
    this.age = 0;
    this.energy = 100; // Used for breeding and lifespan
    this.alive = true;
    this.isSaltwater = traits.isSaltwater; // Added missing property

    // motion properties
    this.setInitialMotion();
    this.swimOffset = random(TWO_PI);
    this.swimAmplitude = random(1, 4);
    this.swimFrequency = random(0.05, 0.1);
  }


  /**
   * Sets the initial motion of the fish in a random direction, 
   * biases left or right for more natural swimming behavior.
   */
  setInitialMotion() {
    let angle = random(-PI / 4, PI / 4);
    if (random() < 0.5) angle += PI;
    this.vx = cos(angle) * this.speed;
    this.vy = sin(angle) * this.speed * 0.3;
  }

  /**
   * Checks if fish is alive
   */
  isAlive() {
    if (this.age >= this.lifespan) {
      this.alive = false;
    } else {
      this.age++;
    }
    return this.alive;
  }

  /**
   * Checks if fish is within the tank. 
   * If not, change velocity to keep it within bounds.
   */
  checkBounds() {
    let bounced = false;
    if (this.x - this.size / 2 < TANK.left() || this.x + this.size / 2 > TANK.right()) {
      this.vx *= -1;
      bounced = true;
      this.x = constrain(this.x, TANK.left() + this.size / 2, TANK.right() - this.size / 2);
    }
    if (this.y - this.size / 2 < TANK.top() || this.y + this.size / 2 > TANK.bottom()) {
      this.vy *= -1;
      bounced = true;
      this.y = constrain(this.y, TANK.top() + this.size / 2, TANK.bottom() - this.size / 2);
    }
    if (bounced) this.swimOffset = random(TWO_PI);
  }

  /**
   *  updates motion per frame
   */
  move() {
    this.x += this.vx;
    this.y += this.vy;
    this.y += sin(frameCount * this.swimFrequency + this.swimOffset) * this.swimAmplitude;
  }
  /**
   *  Checks if this fish collides with another fish
   */

  checkCollision(fishArray) {
    for (let other of fishArray) {
      if (other !== this) {
        let dx = this.x - other.x;
        let dy = this.y - other.y;
        let distance = sqrt(dx * dx + dy * dy);
        let minDistance = (this.size + other.size) / 2;
        
        if (distance < minDistance) {
          // Collision detected
          return other;
        }
      }
    }
    return null;
  }

  /**
   *  Checks if this fish can eat the other fish
   */
  eatFish(other) {
    // Can't eat fish of same or larger size unless much more aggressive
    const sizeRatio = this.size / other.size;
    const aggressionFactor = this.aggression / other.aggression;
    
    if (sizeRatio > 1.5 || (sizeRatio > 1.2 && aggressionFactor > 1.5)) {
      // Successfully eat the other fish
      this.energy += other.size * 5; // Gain energy based on prey size
      return true;
    }
    return false;
  }

    /**
     *  Checks if this fish can breed with the other fish
     */
    breed(other) {
      // Check if they can breed (same water type, sufficient energy)
      if (this.isSaltwater !== other.isSaltwater || 
          this.energy < 50 || other.energy < 50 ||
          this.age > this.lifespan * 0.8 || other.age > other.lifespan * 0.8) {
        return null;
      }
      
      // Combine genomes with some mutation
      let newSpeed = (this.speed + other.speed) / 2 * random(0.9, 1.1);
      let newSize = (this.size + other.size) / 2 * random(0.9, 1.1);
      let newFinSize = (this.finSize + other.finSize) / 2 * random(0.9, 1.1);
      
      // Blend colors
      let newColor = lerpColor(
        color(this.color), 
        color(other.color), 
        random(0.3, 0.7)
      );
      
      let newAggression = (this.aggression + other.aggression) / 2 * random(0.9, 1.1);
      let newLifespan = (this.lifespan + other.lifespan) / 2 * random(0.9, 1.1);
      
      // Create offspring at midpoint between parents
      let offspringX = (this.x + other.x) / 2;
      let offspringY = (this.y + other.y) / 2;
      
      // Parents lose energy from breeding
      this.energy -= 50;
      other.energy -= 50;
      let newFishTraits = {
        speed: newSpeed,
        size: newSize,
        finSize: newFinSize,
        color: newColor,
        aggression: newAggression,
        lifespan: newLifespan,
        isSaltwater: this.isSaltwater
      }
      
      console.log("Breeding sucessful!")
      return new Fish(offspringX, offspringY, newFishTraits);
    }

  update(fishArray) {
    if (!this.isAlive()) {
      fishArray.splice(fishArray.indexOf(this), 1);
      return;
    }
    // this.energy -= 1;
    // Collision Check
    let other = this.checkCollision(fishArray);
    if (other) {
      // Attempt to breed first
      let offspring = this.breed(other);
      if (offspring) {
        fishArray.push(offspring);
      // Attempt to eat if breeding didnt work
      } else if (this.eatFish(other)) {
        fishArray.splice(fishArray.indexOf(other), 1);
      }
    }
    this.move();
    this.checkBounds();
  }

  display() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }
}