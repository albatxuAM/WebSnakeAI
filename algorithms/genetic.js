const POPULATION_MAX = 100;
var PercentToKeep = 0.1;

class GeneticAlgorithm {
  constructor() {
    this.population_count = POPULATION_MAX;
    this.population = [];
    this.save = [];
    this.generation_count = 0;
    this.bestAllTime = 0;

    this.init_population();
  }

  init_population() {
    for (let i = 0; i < this.population_count; i++) {
      this.population.push(new GameManager());
    }
  }

  // Iterating through the saved individuals and returns the highest hunger value among them.
  maxHunger() {
    let max = 0;

    for (let i = 0; i < this.save.length; i++) {
      if (max < this.save[i].hunger()) {
        max = this.save[i].hunger();
      }
    }

    return max;
  }

  // Displaying the current population of individuals and generates a new population if the current population is empty.
  draw() {
    if (this.population.length == 0) {
      this.newGeneration();
    }

    this.population.forEach((game) => game.draw(this.save, this.population));
  }

  // Iterating through the current population and returns the highest score achieved by an individual. It also updates the best score of all time, if applicable.
  maxGame() {
    let max = 0;

    for (let i = 0; i < this.population.length; i++) {
      if (max < this.population[i].score()) {
        max = this.population[i].score();
      }
    }

    if (this.bestAllTime < max) {
      this.bestAllTime = max;
    }

    return max;
  }

  // Implementing a fitness-proportional selection mechanism for a genetic algorithm by randomly selecting a fitness value and iterating through the population until the selected fitness value falls below zero.
  selection(sumFitness) {
    let rand = random();
    let index = 0;

    while (rand > 0 && index < this.save.length) {
      rand -= (this.fitness(this.save[index]) / sumFitness) * 10;
      index++;
    }

    return this.save[index - 1];
  }

  // Generating a new population for a genetic algorithm by cloning the fittest individual as the parent and disposing of the previous population.
  newGeneration() {
    if(selectionMode === "top") {
      let newPop = [];
      this.generation_count++;

      let max_fitness = Math.max.apply(
        Math,
        this.save.map((game) => game.fitness)
      );
      let parent = this.save.find((game) => game.fitness == max_fitness);

      for (let i = 0; i < POPULATION_MAX; i++) {
        newPop.push(parent.copy());
      }

      for (let i = 0; i < POPULATION_MAX; i++) {
        this.save[i].dispose();
      }

      this.population = newPop;
      this.save = [];
    }
    else {
      let newPop = [];
      this.generation_count++;
  
      // Ordenamos la población por la puntuación de fitness de mayor a menor
      this.save.sort((a, b) => b.fitness - a.fitness);
  
      // Calculamos cuántos individuos representan el 10% de la población
      let topPercentCount = Math.floor(this.save.length * PercentToKeep);
  
      // Seleccionamos los mejores individuos, el 10% superior
      let topIndividuals = this.save.slice(0, topPercentCount);
  
      // Clonamos a estos mejores individuos para poblar la nueva población
      for (let i = 0; i < POPULATION_MAX; i++) {
          let parent = topIndividuals[Math.floor(Math.random() * topPercentCount)]; // Seleccionamos aleatoriamente un padre del top 10%
          newPop.push(parent.copy());
      }
  
      // Eliminamos los individuos de la generación anterior
      for (let i = 0; i < POPULATION_MAX; i++) {
          this.save[i].dispose();
      }
  
      // Actualizamos la población
      this.population = newPop;
      this.save = [];
    }
  }
}
