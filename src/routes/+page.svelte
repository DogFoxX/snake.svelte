<script>
    import { onMount } from 'svelte';
    import { State } from "$lib/store";
  
    let { score, lives, snake, speed } = $State;
    $: State.update(obj => ({...obj, lives, score}))
    let canvas;
    let ctx;
    let fruit = { x: 0, y: 0 }; // initial fruit position
    let obstacles = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 }
    ]; // initial obstacles array
    let velocity = { x: 1, y: 0 }; // initial velocity
    let gameOver = false;
  
    let fruitsEaten = 0;
    let healthPickup = null;
    let healthPickupTimeout;
  
    onMount(() => {
      ctx = canvas.getContext('2d');
      updateObstacles();
      updateFruit();
      startGame();
    });
  
    function startGame() {
      gameLoop();
    }
  
    function gameLoop() {
      if (!gameOver) {
        setTimeout(() => {
          updateSnake();
          checkCollisions();
          drawGame();
          gameLoop();
        }, speed);
      }
    }
  
    function updateSnake() {
      // Move the snake's head based on velocity
      let newHead = [snake[0][0] + velocity.x, snake[0][1] + velocity.y];
      // Wrap snake around edges
      newHead[0] = (newHead[0] + 40) % 40;
      newHead[1] = (newHead[1] + 40) % 40;
      snake.unshift(newHead); // Add new head to the beginning
      // Check if snake ate a fruit
      if (snake[0][0] === fruit.x && snake[0][1] === fruit.y) {
        score++
        fruitsEaten++;
        if (fruitsEaten % 10 === 0) {
          spawnHealthPickup();
        }
        updateFruit(); // only update fruit position when eaten
        if (speed != 35) {
          speed -= 1; // increase speed
        }
        updateObstacles(); // Update obstacle positions
      } else {
        // Remove the tail segment if the snake didn't eat a fruit
        snake.pop();
      }
    }
  
    function checkCollisions() {
    // Check for snake-obstacle collision
    for (let obstacle of obstacles) {
      if (snake[0][0] === obstacle.x && snake[0][1] === obstacle.y) {
        lives -= 1;
        if (lives <= 0) {
            lives -= 1;
          gameOver = true;
        }
      }
    }
  
    // Check for snake-self collision
    for (let i = 1; i < snake.length; i++) {
      if (snake[0][0] === snake[i][0] && snake[0][1] === snake[i][1]) {
        if (lives > 3) {
          let segmentsRemoved = snake.length - i;
          score = Math.max(0, score - segmentsRemoved); // Decrease score by the number of segments removed, but ensure it's not negative
            lives -= 3; // Decrease lives by 3
          snake.splice(i); // Remove the collided segments from the snake's body
        } else if (lives <= 3) {
            lives = 0;
            gameOver = true;
        }
        break; // Stop checking further
      }
    }
  
    // Check for snake-healthPickup collision
    if (healthPickup && snake[0][0] === healthPickup.x && snake[0][1] === healthPickup.y) {
      lives += 1;
      clearTimeout(healthPickupTimeout);
      healthPickup = null;
    }
  }
  
  
  
    function updateFruit() {
      // Move fruit to a random position near obstacles but not next to them
      let validPosition = false;
      while (!validPosition) {
        fruit.x = Math.floor(Math.random() * 40);
        fruit.y = Math.floor(Math.random() * 40);
        validPosition = true;
        for (let obstacle of obstacles) {
          if (Math.abs(fruit.x - obstacle.x) <= 1 && Math.abs(fruit.y - obstacle.y) <= 1) {
            validPosition = false;
            break;
          }
        }
      }
    }
  
    function updateObstacles() {
      // Move obstacles to new random positions
      for (let obstacle of obstacles) {
        // Ensure that the obstacle is not placed on the snake's body
        let validPosition = false;
        while (!validPosition) {
          obstacle.x = Math.floor(Math.random() * 40);
          obstacle.y = Math.floor(Math.random() * 40);
          validPosition = !snake.some(pos => pos[0] === obstacle.x && pos[1] === obstacle.y);
        }
      }
    }
  
    function drawGame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw obstacles first
      ctx.fillStyle = 'hsl(0, 0%, 30%)';
      for (let obstacle of obstacles) {
        ctx.fillRect(obstacle.x * 10, obstacle.y * 10, 10, 10);
      }
      // Draw fruit
      ctx.fillStyle = 'crimson';
      ctx.fillRect(fruit.x * 10, fruit.y * 10, 10, 10);
      // Draw health pickup if exists
      if (healthPickup) {
        ctx.fillStyle = 'purple'; // Set the color to purple
        ctx.fillRect(healthPickup.x * 10, healthPickup.y * 10, 10, 10);
      }
      // Draw snake
      ctx.fillStyle = 'hsl(0, 0%, 30%)'; // Set the color of the snake
      for (let pos of snake) {
        ctx.fillRect(pos[0] * 10, pos[1] * 10, 10, 10);
      }
    }
  
    function spawnHealthPickup() {
      clearTimeout(healthPickupTimeout);
      // Spawn health pickup at the center of the canvas
      healthPickup = { x: Math.floor(canvas.width / 20), y: Math.floor(canvas.height / 20) };
      healthPickupTimeout = setTimeout(() => {
        // Remove health pickup after 10 seconds
        healthPickup = null;
      }, 10000);
    }
  
    function restartGame() {
      gameOver = false;
      snake = [[20, 20], [20, 21], [20, 22]];
      fruit = { x: 10, y: 10 };
      obstacles = [
        { x: 5, y: 5 },
        { x: 15, y: 15 },
        { x: 25, y: 25 }
      ];
      lives = 3;
      velocity = { x: 0, y: -1 };
      speed = 80;
      score = 0;
      fruitsEaten = 0;
      healthPickup = null;
      gameLoop(); // Restart game loop
    }
  
    // Event listener for arrow keys
    const keydown = (event) => {
      switch (event.key.toLowerCase()) {
        case 'w':
          if (velocity.y !== 1) // prevent moving backward
            velocity = { x: 0, y: -1 };
          break;
        case 's':
          if (velocity.y !== -1)
            velocity = { x: 0, y: 1 };
          break;
        case 'a':
          if (velocity.x !== 1)
            velocity = { x: -1, y: 0 };
          break;
        case 'd':
          if (velocity.x !== -1)
            velocity = { x: 1, y: 0 };
          break;
      }
    };
  </script>
  
  <svelte:window on:keydown={keydown} />

  <canvas bind:this={canvas} id="canvas" width="400" height="400"></canvas>
  
  {#if gameOver}
  <button on:click={restartGame}>Try again</button>
  {/if}
  
  
  <style>
    canvas {
        outline: 1px solid hsl(0, 0%, 14%)
    }
  </style>
  