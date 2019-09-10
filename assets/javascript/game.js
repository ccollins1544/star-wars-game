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
  Heroes = []; 
  Ally = {};
  Enemies = [];
  Opponent = {}; 

  attack_counter=0;

  constructor(heroes){
    this.Heroes = heroes;

    var ThatGame = this;
    // Create Elements on the Page
    window.addEventListener('load', ThatGame.addHeroes(), false);

    // Create Window object that can be accessed via onclick()
    if(!window['GAME']) { window['GAME'] = ThatGame; }
  }
  
  chooseAlly(el=""){
    // After Character is chosen we need to set base "attack power" and "counter attack power" for the oponent. 
    if(this.isElement(el)){

      // el.parentElement.classList.add("ally");
      // $(el).parent().addClass("ally");
      var chosen_one = $(el).data("slug");
      var ThatGame = this;

      this.Heroes.forEach(function(hero, index){
        var healthPoints = hero.hp;
        var element_id = "#" + hero.slug;

        // remove the onclick attribute since we don't need it anymore
        $(element_id).removeAttr("onclick");
        
        if(hero.slug === chosen_one){
          this[index].ally = true;
          this[index].attackPower = ThatGame.setAttackPower(healthPoints,true);
          ThatGame.Ally = this[index]; 
          $(element_id).addClass("ally");
          
        }else{
          this[index].attackPower = ThatGame.setAttackPower(healthPoints);
          
          ThatGame.Enemies.push(this[index]);
          $(element_id).addClass("enemy");
          $(element_id).attr("onclick","GAME.chooseOpponent(this); return false;");
          $(element_id).detach().appendTo("#enemies");
        }

      }, this.Heroes);
    }

    console.log("HEROES",this.Heroes);
  } // END choose ally

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

  setAttackPower(hp,ally=false){
    // Generate Random Number for Attack Power
    // Ally get 7% and Enemies get 14%-21% AttackPower of HealthPoints
    var min = (ally) ? Math.floor(hp * 0.07) : Math.floor(hp * 0.14);
    var max = (ally) ? Math.floor(hp * 0.07) : Math.floor(hp * 0.21);
    return Math.floor(Math.random() * Math.floor(+max - +min)) + +min;
  }

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

  chooseOpponent(el=""){
    if(this.isElement(el) && $.isEmptyObject(this.Opponent) === true){
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
    }
  } // END chooseOpponent

  attack(el=""){
    if(this.isElement(el) && $.isEmptyObject(this.Opponent) === false){
      var attack_power = this.Ally.attackPower;
      var counter_attack_power = this.Opponent.attackPower;
      var attack_message = "<ul class='list-group mx-auto'>";
      attack_message += "<li class='list-group-item list-group-item-success'>You Attack " + this.Opponent.name + " for " + attack_power + " damage.</li>";
      attack_message += "<li class='list-group-item list-group-item-danger'>" + this.Opponent.name + " attacked you back for " + counter_attack_power + "</li>";
      attack_message += "</ul>";
      $("#attack_messages").html(attack_message);
      
      // Update Values
      this.Opponent.hp -= attack_power;
      this.Ally.hp -= counter_attack_power;

      var ally_id = "#" + this.Ally.slug;
      var opponent_id = "#" + this.Opponent.slug;

      $(opponent_id).find(".health_points").addClass("was_attacked");
      $(opponent_id).find(".health_points").text(this.Opponent.hp);

      $(ally_id).find(".health_points").addClass("was_attacked");
      $(ally_id).find(".health_points").text(this.Ally.hp)

      var hero_index = $("#opponent").find(".enemy-opponent").data("index");
      var base_attack_power = this.Heroes[hero_index].attackPower;
      console.log("BASE Attack Power", base_attack_power);

      attack_power += base_attack_power;
      this.Ally.attackPower = attack_power;
      console.log("NEW Attack Power",this.Ally.attackPower);

      this.attack_counter++;
      console.log("Counter",this.attack_counter);

      this.checkWinCondition();
    }
  }

  checkWinCondition(){
    console.log(this.Ally)
    console.log(this.Opponent);
  }

} // END StarWarsGame Class