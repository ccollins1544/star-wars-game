/*****************************************************
 * Star Wars RPG Game JS
 * @package Star Wars RPG
 * @subpackage StarWarsGame Class
 * @author Christopher Collins
 * @version 2.0
 * @license none (public domain)
 *****************************************************/
class StarWarsGame {
  // Game Properties
  Heroes = [];           // All heroes in the game
  Enemies = [];          // All enemies
  Opponent = {};         // Chosen enemy 
  Ally = {};             // Your chosen ally hero 
  base_attack_power = 0; // Ally Base Attack Power
  attack_counter=0;      // Number of total attacks throughout the game.
  won_last_game = "";    // So we know what sound to play for a new game.

  sounds = { // Sounds played throughout different states of the game.
    "game_ready"   : "assets/sounds/starwars/LightSaber.wav",
    "ally_chosen"  : "assets/sounds/starwars/lfail.wav",
    "enemy_chosen" : "assets/sounds/starwars/darth.wav",
    "enemy_dies"   : "assets/sounds/starwars/hohohoho.wav",
    "last_enemy"   : "assets/sounds/starwars/clear.wav",
    "attack"       : "assets/sounds/starwars/swing.mp3",
    "lost_game"    : "assets/sounds/starwars/ImperialMarch.mp3",
    "win_game"     : "assets/sounds/starwars/StarWarsTheme.mp3",
    "rematch_lost" : "assets/sounds/starwars/fail.wav",
    "rematch_won"  : "assets/sounds/starwars/impress.wav",
  };

  /**
   * constructor
   * Builds hero and sound elements on the page and adds game object to be accessed via onclick().
   * @param {array of objects} heroes - array of objects representing characters. Must contain properties: name, slug, image, hp, ally.
   */
  constructor(heroes){
    this.Heroes = heroes;
    $("#attack-btn").hide(); // Can't attack yet...

    var ThatGame = this; // send 'this' to global scope.

    // Create Elements on the Page
    window.addEventListener('load', ThatGame.addHeroes(), false);

    // Create Window object that can be accessed via onclick() on global scope.
    if(!window['GAME']) { window['GAME'] = ThatGame; }
  } // END constructor
  
  /**
   * chooseAlly
   * Once ally is chosen attackPower is calculated on all heroes. Then dom elements are moved into next phase of the game.
   * @param {dom object} el - the dom element clicked on representing ally. 
   */
  chooseAlly(el=""){
    // After Character is chosen we need to set base "attack power" and "counter attack power" for the oponent. 
    if(this.isElement(el)){
      var chosen_one = $(el).data("slug");
      var ThatGame = this; // send 'this' to global scope.
      var enemy_index = 0; // reference to index in Enemies array.

      // Teams are chosen...now sort heroes.
      this.Heroes.forEach(function(hero, index){
        var healthPoints = hero.hp;
        var element_id = "#" + hero.slug;

        // remove the onclick attribute since we don't need it anymore
        $(element_id).removeAttr("onclick");
        
        // This is our hero
        if(hero.slug === chosen_one){
          this[index].ally = true;
          this[index].attackPower = ThatGame.setAttackPower(healthPoints,true);
          ThatGame.Ally = ThatGame.copyObject(this[index]);
          ThatGame.base_attack_power = this[index].attackPower;
          $(element_id).addClass("ally");
          
        }else{ // These are the enemies
          this[index].attackPower = ThatGame.setAttackPower(healthPoints);
          
          ThatGame.Enemies.push(this[index]);
          $(element_id).addClass("enemy");
          $(element_id).attr("data-eindex",enemy_index);
          $(element_id).attr("onclick","GAME.chooseOpponent(this); return false;");
          $(element_id).detach().appendTo("#enemies");
          enemy_index++;
        }

        $(element_id).find(".attack_power").text("AP: " + this[index].attackPower + " ");

      }, this.Heroes); // END forEach heroes loop

      // Put Ally next to Opponent element
      $("#select-character").detach().insertAfter( $("#enemies") );
      
      this.gameAlert(); // reset gameAlert
      $("#ally_chosen")[0].play();
      $("#attack-btn").show(); // Now we are ready to attack...
    } // END if(this.isElement(el)){
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
   * Generate Random Number between 8%-12% of HealthPoints for enemy Attack Power. 
   * If ally then attackPower is always 10% of HealthPoints. Unless you're luke then you get 20 attack power to start off. 
   * @param {integer} hp - Health Points.
   * @param {boolean} ally - allies attack power is calculated differently tahn enemies.
   * @return {integer} attack_power - used during attacks.
   */
  setAttackPower(hp,ally=false){
    // Make attack power a little random for entertainment.
    var min = (ally) ? Math.floor(hp * 0.10) : Math.floor(hp * 0.08);
    var max = (ally) ? Math.floor(hp * 0.10) : Math.floor(hp * 0.12);
    var attack_power = Math.floor(Math.random() * Math.floor(+max - +min)) + +min;

    // Only for luke since he dies too easy.
    attack_power = (ally && attack_power < 11) ? 20 : attack_power;

    return attack_power;
  } // END setAttackPower

  /**
   * addHeroes
   * Creates Hero and sound elements on the page.
   */
  addHeroes(){
    // Add Hero Elements
    var heroHTML = "";
    this.Heroes.forEach(function(hero, index){
      heroHTML += "<div class='hero card text-center col-3 mx-auto' onclick='GAME.chooseAlly(this); return false;' id='" + hero.slug + "' data-slug='" + hero.slug + "' data-index='" + index + "' data-hp='" + hero.hp + "'>";
      heroHTML += "<div class='card-body'><h6 class='card-title'>" + hero.name + "</h6>";
      heroHTML += "<img class='card-img' alt='" + hero.name + "' src='" + hero.image + "' />";
      heroHTML += "<p class='card-text font-weight-bold'><span class='attack_power'></span>HP: <span class='health_points'>" + hero.hp + "</span></p></div><!-- .card-body -->";
      heroHTML += "</div>";
    });
    
    $("#select-character").append(heroHTML);

    // Update Sound Elements
    if( $("#audio_files").children().length === 0 ){

      // Audio Needs to be added
      for (var key in this.sounds){
        var audioElement = $("<audio>");
        audioElement.append("<source></source>");
        audioElement.attr("id",key);
        audioElement.find("source").attr("src",this.sounds[key]);
        audioElement.find("source").attr("type","audio/mpeg");
        $("#audio_files").append(audioElement);
      }

    }else{ 
      // Already added so make sure all sound is paused.
      $("#audio_files").children().each(function(el){
        $(this)[0].pause();
      });
    }

    if(this.won_last_game === ""){
      // No wins or losses yet.
      $("#game_ready")[0].play();

    }else if(this.won_last_game){ 
      // Lost the last game
      $("#rematch_won")[0].play(); 

    }else{
      // Won the last game
      $("#rematch_lost")[0].play(); 
    }
  } // END addHeroes

  /**
   * chooseOpponent
   * Once enemy opponent is chosen then it's moved into the defender stage of the game. 
   * @param {dom element} el - The enemy element to fight next.
   */
  chooseOpponent(el=""){
    // Make sure we don't already have an opponent to fight before trying to choose one.
    if(this.isElement(el) && this.Opponent.hasOwnProperty("hp") === false){
      var chosen_enemy = $(el).data("slug");
      var ThatGame = this;

      this.Enemies.forEach(function(hero, index){
        var element_id = "#" + hero.slug;

        if(hero.slug === chosen_enemy){
          ThatGame.Opponent = ThatGame.copyObject(this[index]);
          $(element_id).removeClass("enemy");
          $(element_id).addClass("enemy-opponent");
          $(element_id).removeAttr("onclick");
          $(element_id).detach().appendTo("#opponent");
        }
      }, this.Enemies); // END forEach Enemies loop

      $("#enemy_chosen")[0].play();
      return;
    }
    
    // We already have an opponent to fight...
    $("#last_enemy")[0].play();
    this.gameAlert("You already have an opponent to fight!","dark"); // Top Message
  } // END chooseOpponent

  /**
   * attack
   * Called when #attack-btn is clicked. 
   * -Update health points on ally and opponent
   * -Increase ally attack power
   * -Check win condition
   * 
   * @param {dom element} el - the #attack-btn element
   */
  attack(el=""){
    // Make sure we have an opponent to attack
    if(this.isElement(el) && this.Opponent.hasOwnProperty("hp") === true){
      var attack_power = this.Ally.attackPower;
      var counter_attack_power = this.Opponent.attackPower;

      // Bottom Attack Message
      var attack_message = "<ul class='list-group mx-auto'>";
      attack_message += "<li class='list-group-item list-group-item-success'>You Attack " + this.Opponent.name + " for " + attack_power + " damage.</li>";
      attack_message += "<li class='list-group-item list-group-item-danger'>" + this.Opponent.name + " attacked you back for " + counter_attack_power + ". </li>";
      attack_message += "</ul>";
      $("#attack_messages").html(attack_message);

      // Top Attack Message
      this.gameAlert("You Attack " + this.Opponent.name + " for " + attack_power + " damage. " + this.Opponent.name + " attacked you back for " + counter_attack_power);
      $("#attack")[0].pause();
      $("#attack")[0].play();

      // Update health points on ally and opponent
      this.Opponent.hp -= attack_power;
      this.Ally.hp -= counter_attack_power;

      // Update dom elements 
      var ally_id = "#" + this.Ally.slug;
      var opponent_id = "#" + this.Opponent.slug;

      $(opponent_id).find(".attack_power").text("AP: " + counter_attack_power + " ");
      $(opponent_id).find(".health_points").addClass("was_attacked");
      $(opponent_id).find(".health_points").text(this.Opponent.hp);
      
      $(ally_id).find(".health_points").addClass("was_attacked");
      $(ally_id).find(".health_points").text(this.Ally.hp)
      
      // Increase Ally attack power
      attack_power += this.base_attack_power;
      this.Ally.attackPower = attack_power;
      $(ally_id).find(".attack_power").text("AP: " + attack_power + " ");

      // Increase Attack Counter
      this.attack_counter++;
      $("#attack-btn .badge").text(" "+this.attack_counter);

      this.checkWinCondition();
      return;

    }else if(this.Enemies.length === 1){
      // One more enemy left so lets fight them next.
      var last_enemy = "#" + this.Enemies[0].slug;
      $(last_enemy).click();
      return;
    }
    
    // We need to pick another opponent and let the user choose the next one. 
    $("#last_enemy")[0].play();
    this.gameAlert("You don't have an opponent to attack. Please choose one!","dark"); // Top Message
  } // END attack
  
  /**
   * checkWinCondition
   * See if someone died and remove them from the game. If ally dies you lose.
   * If enemy dies then another opponent can be chosen.
   */
  checkWinCondition(){
    // Allow random background to be chosen when game is lost.
    var losing_backgrounds = ["url('assets/images/starwars/star-wars-the-force-unleashed-movie-wallpapers.jpg') ", "url('assets/images/starwars/star-wars-ult-background-44.png') "];
    var random_index = Math.floor(Math.random()*(losing_backgrounds.length+1));
    
    // Check if you died
    if(this.Ally.hp <= 0){
      this.Ally = {};
      this.gameAlert('<h2>Looks like that guy just killed you...Sorry you Lose!</h2>','danger');
      $("body.page-template").css({ background: losing_backgrounds[random_index] + "no-repeat top"});
      $("#attack-btn").hide();
      $("#lost_game")[0].play();
      this.won_last_game=false;
      return; 
    }
    
    // Remove opponent from the game so another one can be chosen...and see if you won.
    if(this.Opponent.hp <= 0){
      var opponent_id = "#" + this.Opponent.slug;
      var enemy_index = $(opponent_id).data("eindex");
      this.Enemies.splice(enemy_index,1);
      
      // Array was re-index so we need to update the eindex values
      this.Enemies.forEach(function(e,i){
        var enemy = "#" + e.slug;
        $(enemy).data("eindex",i);
      });
      
      if(this.Enemies.length === 1 ){
        $("#enemies-title").hide(); // Only one more enemy left so hide the title "Enemies Available To Attack".
      }
      
      var attack_message = this.Opponent.name + " has been eliminated! " + this.Enemies.length + " enemies remaining.";
      this.gameAlert(attack_message,"success"); // Top Message
      
      // Bottom Attack Message
      attack_message = "<ul class='list-group mx-auto'><li class='list-group-item list-group-item-success'>" + attack_message + "</li></ul>";
      $("#attack_messages").html(attack_message);
      $("#enemy_dies")[0].play();

      $(opponent_id).remove();
      this.Opponent = {};
      
      // Check if you win
      if(this.Enemies.length === 0){
        this.gameAlert("<h2>All enemies have been defeated. You Win!</h2>","success"); // Top Message
        $("#win_game")[0].play();
        this.won_last_game=true;

        $("body.page-template").css({ background: "url('assets/images/starwars/star-wars-background-sunset.jpg') no-repeat top"});
        $("#attack-btn").hide();
        $("#fight-title").hide();
        $("#defender-title").hide();
      }
    } // END if(this.Opponent.hp <= 0){
  } // END checkWinCondition
  
  /**
   * gameAlert
   * @param {string} message - Message to go in the alert box
   * @param {string} addThisClass - defaults to empty string. Can be dark, danger, or success. 
   */
  gameAlert(message="",addThisClass=""){
    // RESET Alert Message
    if(message === "" && addThisClass === "" || message === ""){ 
      if( $("#alert-messages").className !== "alert" ){
        $("#alert-messages").removeClass("alert-dark");
        $("#alert-messages").removeClass("alert-danger");
        $("#alert-messages").removeClass("alert-success");
        $("#alert-messages").addClass("alert");
        $("#alert-messages").text("");
        $("#alert-messages").hide();
      }
      return;
      
    }else if (addThisClass === "dark"){
      addThisClass = "alert-dark";
      
    }else if (addThisClass === "danger"){
      addThisClass = "alert-danger";
      
    }else if (addThisClass === "success"){
      addThisClass = "alert-success";
    }
    
    // IF same alert message keeps getting spammed then add ! and change color red
    if( $("#alert-messages").html() === message ){
      message += "!";
      addThisClass = "alert-danger";
    }
    
    // Reset classes
    $("#alert-messages").removeClass("alert-dark");
    $("#alert-messages").removeClass("alert-danger");
    $("#alert-messages").removeClass("alert-success");
    $("#alert-messages").addClass("alert");

    // Add the new class
    if(addThisClass !== "") { $("#alert-messages").addClass(addThisClass); }
    
    // Display the alert message
    $("#alert-messages").html(message);
    $("#alert-messages").show();
    return;
  } // END gameAlert
  
  /**
   * newGame
   * resets all game properties for a new game.
   */
  newGame(){
    // Reset Hero Properties.
    this.Heroes.forEach(function(hero,index){
      this[index].ally = false;
      this[index].attackPower = 0;
    }, this.Heroes);
    
    // Reset Game Properties.
    this.Enemies = [];  // All enemies
    this.Opponent = {}; // Chosen enemy 
    this.Ally = {};     // Your chosen ally hero 
    this.base_attack_power = 0; // Ally Base Attack Power
    this.attack_counter=0; // Number of total attacks throughout the game. 

    // Reset HTML DOM Elements.
    $("#select-character").detach().prependTo( $("#main-section > .container"));
    $("#select-character").empty();
    $("#enemies").empty();
    $("#opponent").empty();
    $("#enemies-title").show();
    $("#fight-title").show();
    $("#defender-title").show();
    $("#attack-btn").hide();
    $("#attack-btn .badge").empty();
    $("#attack_messages").empty();
    this.gameAlert("<h2>Select Your Character</h2>"); // Top Message
    $("body.page-template").css({ background: "url('assets/images/starwars/star-wars-background-blue.png') no-repeat top"});
    this.addHeroes();
  } // END newGame()
  
  /**
   * copyObject
   * 
   * Javascript doesn't actually copy objects when using = it just references the original object.
   * This creates problems when trying to preserve original data. So this function should do an 
   * iteration copy of the source objects properties. This is why I have to reset some properties
   * in the Heroes array for a new game.  
   * 
   * @param {object} src 
   * @return {object} target - a clone of src
   */
  copyObject(src) {
    let target = {};
    for (let prop in src) {
      if (src.hasOwnProperty(prop)) {
        // if the value is a nested object, recursively copy all it's properties
        if (typeof src[prop] ==="object") {
          target[prop] = this.copyObject(src[prop]);
        } else {
          target[prop] = src[prop];
        }
      }
    }
    
    return target;
  } // END copyObject
} // END StarWarsGame Class