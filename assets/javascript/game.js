/**
 * Star Wars RPG Game JS
 * @package Star Wars RPG
 * @subpackage StarWarsGame Class
 * @author Christopher Collins
 * @version 1.1.0
 * @license none (public domain)
 * 
 *****************************************************/
/*
class StarWarsCharacter {
  health_points=false;
  attack_power=false; // increments by base attack power. For example, if the base Attack Power is 6, each attack will increase the Attack Power by 6 (12, 18, 24, 30 and so on).
  counter_attack_power=false; // Never changes. The enemy only has 'Counter Attack Power'.
  team_ally="";

  constructor(hp=100,ally=false){
    this.health_points = hp;
    this.team_ally = ally;
  }
  
  setAttackPower(ally=false){
    // this.attack_power = (ap === 0) ? this.setAttackPower : ap;
    // this.counter_attack_power = (cap === 0) ? this.setAttackPower : cap;

    // Generate Random Number for Attack Power
    var min = 0;
    var max = this.health_points/2;
    return Math.floor(Math.random() * Math.floor(+max - +min)) + +min;

  }
  
} // end StarWarsCharacter Class
*/

class StarWarsGame {
  // Game Properties
  Heroes = [];   // All heroes in the game
  Enemies = [];  // All enemies
  Opponent = {}; // Chosen enemy 
  Ally = {};     // Your chosen ally hero 
  base_attack_power = 0; // Ally Base Attack Power

  attack_counter=0; // Number of total attacks throughout the game. 

  /**
   * constructor
   * Builds hero elements on the page and adds game object to be accessed via onclick().
   * @param {array of objects} heroes - array of objects in the format.
   */
  constructor(heroes){
    this.Heroes = heroes;

    var ThatGame = this;
    // Create Elements on the Page
    window.addEventListener('load', ThatGame.addHeroes(), false);

    // Create Window object that can be accessed via onclick()
    if(!window['GAME']) { window['GAME'] = ThatGame; }
  }
  
  /**
   * chooseAlly
   * Once ally is chosen attackPower is calculated on all heroes. Then dom elements are moved into next phase of the game.
   * @param {dom object} el - the dom element clicked on representing ally. 
   */
  chooseAlly(el=""){
    // After Character is chosen we need to set base "attack power" and "counter attack power" for the oponent. 
    if(this.isElement(el)){
      var chosen_one = $(el).data("slug");
      var ThatGame = this;
      var enemy_index = 0;

      this.Heroes.forEach(function(hero, index){
        var healthPoints = hero.hp;
        var element_id = "#" + hero.slug;

        // remove the onclick attribute since we don't need it anymore
        $(element_id).removeAttr("onclick");
        
        if(hero.slug === chosen_one){
          this[index].ally = true;
          this[index].attackPower = ThatGame.setAttackPower(healthPoints,true);
          ThatGame.Ally = this[index]; 
          ThatGame.base_attack_power = this[index].attackPower;
          $(element_id).addClass("ally");
          
        }else{
          this[index].attackPower = ThatGame.setAttackPower(healthPoints);
          
          ThatGame.Enemies.push(this[index]);
          $(element_id).addClass("enemy");
          $(element_id).attr("data-eindex",enemy_index);
          $(element_id).attr("onclick","GAME.chooseOpponent(this); return false;");
          $(element_id).detach().appendTo("#enemies");
          enemy_index++;
        }

      }, this.Heroes);
      console.log("HEROES",this.Heroes);
    }
  } // END choose ally

  /**
   * isElement
   * @param {dom object} obj 
   * @return {boolean} true if parameter is an object and false if not. 
   */
  isElement(obj) {
    try {
      //Using W3 DOM2 (works for FF, Opera and Chrome)
      return obj instanceof HTMLElement;
    }
    catch(e){
      //Browsers not supporting W3 DOM2 don't have HTMLElement and
      //an exception is thrown and we end up here. Testing some
      //properties that all elements have (works on IE7)
      return (typeof obj==="object") &&
        (obj.nodeType===1) && (typeof obj.style === "object") &&
        (typeof obj.ownerDocument ==="object");
    }
  } // END isElement

  /**
   * setAttackPower
   * Generate Random Number between 14%-21% of HealthPoints for enemy Attack Power. 
   * If ally then attackPower is always 7% of HealthPoints.
   * @param {integer} hp - Health Points
   * @param {boolean} ally - Usually false for representing enemy. True is ally.
   */
  setAttackPower(hp,ally=false){
    var min = (ally) ? Math.floor(hp * 0.1) : Math.floor(hp * 0.12);
    var max = (ally) ? Math.floor(hp * 0.1) : Math.floor(hp * 0.15);
    return Math.floor(Math.random() * Math.floor(+max - +min)) + +min;
  }

  /**
   * addHeroes
   * Creates Hero elements on the page.
   */
  addHeroes(){
    var heroHTML = "";
    
    this.Heroes.forEach(function(hero, index){
      heroHTML += "<div class='hero card text-center col-3 mx-auto' onclick='GAME.chooseAlly(this); return false;' id='" + hero.slug + "' data-slug='" + hero.slug + "' data-index='" + index + "' data-hp='" + hero.hp + "'>";
      heroHTML += "<div class='card-body'><h6 class='card-title'>" + hero.name + "</h6>";
      heroHTML += "<img class='card-img' alt='" + hero.name + "' src='" + hero.image + "' />";
      heroHTML += "<p class='card-text font-weight-bold'>HP: <span class='health_points'>" + hero.hp + "</span></p></div><!-- .card-body -->";
      heroHTML += "</div><!-- .hero -->";
    });

    $("#select-character").append(heroHTML);
  }

  /**
   * chooseOpponent
   * Once enemy opponent is chosen then it's moved into the defender stage of the game. 
   * @param {dom element} el - The enemy element to fight next
   */
  chooseOpponent(el=""){
    console.log("Heroes",this.Heroes);
    console.log("Enemies",this.Enemies);
    console.log("Opponent",this.Opponent);
    console.log("Ally",this.Ally);
    console.log("condition",$.isEmptyObject(this.Opponent));
    console.log("HAS PROPERTY",this.Opponent.hasOwnProperty("hp"));

    // if(this.isElement(el) && $.isEmptyObject(this.Opponent) === true){
    if(this.isElement(el) && this.Opponent.hasOwnProperty("hp") === false){
      console.log("ready to select");
      var chosen_enemy = $(el).data("slug");
      var ThatGame = this;

      this.Enemies.forEach(function(hero, index){
        var element_id = "#" + hero.slug;

        if(hero.slug === chosen_enemy){
          ThatGame.Opponent = this[index];
          $(element_id).removeClass("enemy");
          $(element_id).addClass("enemy-opponent");
          $(element_id).removeAttr("onclick");
          $(element_id).detach().appendTo("#opponent");
        }
      }, this.Enemies);
      return;
    }

    alert("You already have an opponent to fight!");
  } // END chooseOpponent

  /**
   * attack
   * Runs when #attack-btn is clicked. 
   * -Update health points on ally and oppenent
   * -Increase ally attack power
   * -Check win condition
   * 
   * @param {dom element} el - the #attack-btn element
   */
  attack(el=""){
    // Make sure we have an opponent to attack
    console.log("HAS PROPERTY",this.Opponent.hasOwnProperty("hp"));
    // if(this.isElement(el) && $.isEmptyObject(this.Opponent) === false){

    if(this.isElement(el) && this.Opponent.hasOwnProperty("hp") === true){
      var attack_power = this.Ally.attackPower;
      var counter_attack_power = this.Opponent.attackPower;
      var attack_message = "<ul class='list-group mx-auto'>";
      attack_message += "<li class='list-group-item list-group-item-success'>You Attack " + this.Opponent.name + " for " + attack_power + " damage.</li>";
      attack_message += "<li class='list-group-item list-group-item-danger'>" + this.Opponent.name + " attacked you back for " + counter_attack_power + "</li>";
      attack_message += "</ul>";
      $("#attack_messages").html(attack_message);
      
      // Update health points on ally and opponent
      this.Opponent.hp -= attack_power;
      this.Ally.hp -= counter_attack_power;

      // Update dom elements 
      var ally_id = "#" + this.Ally.slug;
      var opponent_id = "#" + this.Opponent.slug;

      $(opponent_id).find(".health_points").addClass("was_attacked");
      $(opponent_id).find(".health_points").text(this.Opponent.hp);

      $(ally_id).find(".health_points").addClass("was_attacked");
      $(ally_id).find(".health_points").text(this.Ally.hp)

      // Increase Ally attack power
      console.log("Ally BASE AP",this.Ally.attackPower);
      console.log("BASE Attack Power", this.base_attack_power);
      
      attack_power += this.base_attack_power;
      this.Ally.attackPower = attack_power;
      console.log("Ally Increased AP",this.Ally.attackPower);

      this.attack_counter++;
      console.log("Counter",this.attack_counter);

      this.checkWinCondition();
      return;

    }
    // else if(this.Enemies.length === 1){
    //   console.log("last enemy",this.Enemies[0].slug);
    //   var last_enemy = "#" + this.Enemies[0].slug;
    //   this.chooseOpponent($(last_enemy));
    //   //this.attack(); // recursive...spooky
    //   console.log("spooky");
    //   return;
    // }

    alert("You don't have an opponent to attack. Please choose one!");
  }

  /**
   * checkWinCondition
   * See if someone died and remove them from the game. If ally dies you lose.
   * If enemy dies then another opponent can be chosen.
   */
  checkWinCondition(){
    console.log("Win Condition");
    console.log("Ally",this.Ally)
    console.log("Opponent",this.Opponent);

    // Check you died
    if(this.Ally.hp <= 0){ 
      var ally_id = "#" + this.Ally.slug;
      $(ally_id).remove();
      this.Ally = {};
      alert('You Lose!');
      return; 
    }

    // Remove opponent from the game so another one can be chosen.
    
    if(this.Opponent.hp <= 0){
      var opponent_id = "#" + this.Opponent.slug;
      var enemy_index = $(opponent_id).data("eindex");
      this.Enemies.splice(enemy_index,1);

      // Array was re-index so we need to update the eindex values
      this.Enemies.forEach(function(e,i){
        var enemy = "#" + e.slug;
        $(enemy).data("eindex",i);
      });

      $(opponent_id).remove();
      this.Opponent = {};

      console.log("Enemies Remaining", this.Enemies);
      console.log(this.Heroes);

      if($.isEmptyObject(this.Enemies) === true){
        alert("You Win!");
      }
    }

  } // END checkWinCondition
} // END StarWarsGame Class